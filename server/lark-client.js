// server/lark-client.js
// 飞书开放平台 API 客户端
// - 缓存 tenant_access_token（有效期 2h）
// - 机器人单聊发文本/交互卡片 sendTextToUser / sendCardToUser（活动提醒、通知推送）
// - 通讯录：部门 ID → 部门名（登录建档用）


const LARK_HOST = 'https://open.feishu.cn';

class LarkClient {
  constructor(env) {
    this.appId = env.LARK_APP_ID;
    this.appSecret = env.LARK_APP_SECRET;
    this._tokenCache = null;
    this._tokenExpireAt = 0;
  }


  async getTenantAccessToken() {
    if (this._tokenCache && Date.now() < this._tokenExpireAt - 60_000) {
      return this._tokenCache;
    }
    const url = `${LARK_HOST}/open-apis/auth/v3/tenant_access_token/internal`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: this.appId,
        app_secret: this.appSecret,
      }),
    });
    const data = await resp.json();
    if (data.code !== 0) {
      throw new Error(`tenant_access_token 失败: code=${data.code} msg=${data.msg}`);
    }
    this._tokenCache = data.tenant_access_token;
    this._tokenExpireAt = Date.now() + (data.expire - 200) * 1000;
    return this._tokenCache;
  }


  /**
   * 机器人给单个用户发飞书私聊文本消息（im:message:send_as_bot）
   * @param {string} openId 用户 open_id（ou_ 开头）
   * @param {string} text 消息正文
   * @returns {Promise<{ok: boolean, messageId?: string, error?: string}>}
   */
  async sendTextToUser(openId, text) {
    return this._imSend(openId, 'text', JSON.stringify({ text: String(text || '') }));
  }

  /**
   * 机器人给单个用户发飞书交互卡片（im:message:send_as_bot）
   * @param {string} openId ou_ 开头的用户 open_id
   * @param {object} card 飞书卡片 JSON（header + elements）
   * @returns {Promise<{ok, messageId?, error?}>}
   */
  async sendCardToUser(openId, card) {
    return this._imSend(openId, 'interactive', JSON.stringify(card));
  }

  /**
   * 更新机器人已发送的交互卡片（PATCH /open-apis/im/v1/messages/:message_id）
   * 官方要求：更新前后卡片的 config 中均需声明 update_multi:true（共享卡片）
   * @param {string} messageId om_ 开头的消息 ID
   * @param {object} card 新的卡片 JSON
   * @returns {Promise<{ok: boolean, error?: string}>}
   */
  async updateCardMessage(messageId, card) {
    if (!(this.appId && this.appSecret)) return { ok: false, error: 'app_credentials_missing' };
    if (!/^om_/.test(String(messageId || ''))) return { ok: false, error: 'invalid_message_id' };
    try {
      const token = await this.getTenantAccessToken();
      const resp = await fetch(`${LARK_HOST}/open-apis/im/v1/messages/${encodeURIComponent(messageId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: JSON.stringify(card) }),
      });
      const data = await resp.json();
      if (data.code !== 0) return { ok: false, error: `im_error: code=${data.code} msg=${data.msg || data.error_description || ''}` };
      return { ok: true };
    } catch (e) {
      return { ok: false, error: 'network_error: ' + e.message };
    }
  }

  async _imSend(openId, msgType, content) {
    if (!(this.appId && this.appSecret)) return { ok: false, error: 'app_credentials_missing' };
    if (!/^ou_/.test(String(openId || ''))) return { ok: false, error: 'invalid_open_id' };
    try {
      const token = await this.getTenantAccessToken();
      const resp = await fetch(`${LARK_HOST}/open-apis/im/v1/messages?receive_id_type=open_id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ receive_id: openId, msg_type: msgType, content }),
      });
      const data = await resp.json();
      if (data.code !== 0) return { ok: false, error: `im_error: code=${data.code} msg=${data.msg || data.error_description || ''}` };
      return { ok: true, messageId: data.data && data.data.message_id };
    } catch (e) {
      return { ok: false, error: 'network_error: ' + e.message };
    }
  }

  // 通讯录：部门 ID → 部门名（tenant token；本实例内缓存，避免每次请求都拉通讯录）
  async getDepartmentName(deptId) {
    if (!deptId) return '';
    if (!this._deptNameCache) this._deptNameCache = new Map();
    if (this._deptNameCache.has(deptId)) return this._deptNameCache.get(deptId);
    try {
      const token = await this.getTenantAccessToken();
      const resp = await fetch(`${LARK_HOST}/open-apis/contact/v3/departments/${encodeURIComponent(deptId)}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await resp.json();
      const name = (data.code === 0 && data.data && data.data.department && data.data.department.name) || '';
      this._deptNameCache.set(deptId, name);
      return name;
    } catch (e) {
      return ''; // 解析失败不阻断业务：调用方回退用原值
    }
  }

}

module.exports = { LarkClient };
