// server/lib/oneclick.js
// 飞书卡片「一键审批」签名链接工具：HMAC-SHA256(`${id}:${action}:${exp}`, LARK_APP_SECRET)。
// 签名在发卡时生成（activities.adminSignupCard），校验在一键端点（admin.js GET /signups/oneclick/:id）。
// 免登录但仅限单条报名 + 单一动作 + 过期时间；泄露面=该链接本身（默认 7 天有效）。
const crypto = require('crypto');

const ONECLICK_TTL_MS = 7 * 24 * 3600 * 1000;

function secret() {
  return String(process.env.LARK_APP_SECRET || '');
}

// 返回 { exp, sig }；secret 未配置时返回 null（调用方退化为不带一键按钮的卡片）。
function sign(id, action) {
  const s = secret();
  if (!s) return null;
  const exp = Date.now() + ONECLICK_TTL_MS;
  const sig = crypto.createHmac('sha256', s).update(`${id}:${action}:${exp}`).digest('hex');
  return { exp, sig };
}

function verify(id, action, exp, sig) {
  const s = secret();
  if (!s) return false;
  const e = Number(exp);
  if (!Number.isFinite(e) || e < Date.now()) return false;
  const expect = crypto.createHmac('sha256', s).update(`${id}:${action}:${e}`).digest('hex');
  const a = Buffer.from(String(sig || ''), 'utf8');
  const b = Buffer.from(expect, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { sign, verify };
