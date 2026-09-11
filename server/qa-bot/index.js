// 丽珠AI社团 · 群问答机器人（RAG：本地知识库检索 + LLM 生成 + 话题回复）
// 用法：node server/qa-bot/index.js（需 server/.env 里有 LARK_APP_ID / LARK_APP_SECRET）
// LLM 配置（可选）：QA_BOT_LLM_BASE_URL / QA_BOT_LLM_API_KEY / QA_BOT_LLM_MODEL
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { createLarkChannel, LoggerLevel } = require('@larksuiteoapi/node-sdk');
const { loadKB, retrieve } = require('./kb');
const { llmConfigured, chat } = require('./llm');

const LOG_FILE = path.join(__dirname, '..', '..', 'logs', 'qa-bot.log');
const KB_DIR = path.join(__dirname, 'kb');

function log(line) {
  const ts = new Date().toLocaleString('zh-CN', { hour12: false });
  try { fs.appendFileSync(LOG_FILE, '[' + ts + '] ' + line + '\n'); } catch (e) { /* 忽略 */ }
}

const appId = process.env.LARK_APP_ID;
const appSecret = process.env.LARK_APP_SECRET;
if (!appId || !appSecret) {
  console.error('缺少 LARK_APP_ID / LARK_APP_SECRET（server/.env）');
  process.exit(1);
}

const SYSTEM_PROMPT = [
  '你是丽珠AI社团的内部问答机器人"丽珠AI"。规则：',
  '1. 严格根据下面给出的资料回答用户问题；',
  '2. 资料里没写的事，明确说"这个我暂时没有资料，建议联系社团管理员"，绝不编造；',
  '3. 用大白话、简短清楚，3 到 6 句话为宜；',
  '4. 步骤类回答可以用编号列表；',
  '5. 直接回答，不要提"根据资料""文档显示"这种字眼。',
].join('\n');

// 去重：飞书长连接要求 3 秒内处理完，超时会重推同一事件；同一 message_id 只答一次
const seen = new Map();
function seenBefore(id) {
  const now = Date.now();
  for (const [k, t] of seen) { if (now - t > 60000) seen.delete(k); }
  if (seen.has(id)) return true;
  seen.set(id, now);
  return false;
}

function cleanQuestion(text) {
  return String(text || '')
    .replace(/@[^@\s]+/g, ' ')
    .replace(/<at[^>]*>.*?<\/at>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildFallback(kb) {
  const topics = kb.map(a => '- ' + a.title).join('\n');
  return '这个问题我暂时没有找到现成资料。\n我目前掌握这些主题，可以换个说法再问：\n' + topics + '\n\n也可以联系社团管理员确认～';
}

async function answer(question) {
  // 每次都重新加载：改 kb/*.md 立即生效，无需重启
  const kb = loadKB(KB_DIR);
  const hits = retrieve(kb, question, 3);
  const best = hits[0];
  log('检索结果：' + hits.map(h => h.title + '=' + h.score).join('，'));
  if (!best || best.score < 2) return buildFallback(kb);

  // 完整 RAG：检索到资料 → 交给 LLM 用人话组织答案；LLM 挂了降级为原文直发
  if (llmConfigured(process.env)) {
    const ctx = hits.filter(h => h.score >= 1)
      .map((h, i) => '【资料' + (i + 1) + '：' + h.title + '】\n' + h.body)
      .join('\n\n');
    try {
      const reply = await chat(process.env, SYSTEM_PROMPT, '资料：\n' + ctx + '\n\n用户问题：' + question, 40000);
      log('LLM 回复成功（' + reply.length + ' 字）');
      return reply;
    } catch (e) {
      log('LLM 调用失败，降级为原文直发：' + (e && e.message));
    }
  }
  return '【' + best.title + '】\n\n' + best.body;
}

async function main() {
  const channel = createLarkChannel({
    appId: appId,
    appSecret: appSecret,
    loggerLevel: LoggerLevel.info,
    policy: { requireMention: true, dmMode: 'open' },
  });

  channel.on('message', async (msg) => {
    try {
      if (seenBefore(msg.messageId)) { log('重复事件，跳过：' + msg.messageId); return; }
      const q = cleanQuestion(msg.content);
      log('收到问题（chat=' + msg.chatId + '）：' + q.slice(0, 100));
      if (!q) { log('空问题，跳过'); return; }
      const ans = await answer(q);
      await channel.send(msg.chatId, { markdown: ans }, { replyTo: msg.messageId, replyInThread: true });
      log('已回复（' + ans.length + ' 字）');
    } catch (e) {
      log('处理失败：' + (e && e.message));
    }
  });

  channel.on('error', (err) => log('通道错误：' + (err && err.message)));
  channel.on('reconnecting', () => log('长连接重连中…'));
  channel.on('reconnected', () => log('长连接已恢复'));

  await channel.connect();
  const botName = channel.botIdentity ? channel.botIdentity.name : '(未知)';
  const llmInfo = llmConfigured(process.env) ? process.env.QA_BOT_LLM_MODEL : '未配置（原文直发模式）';
  log('机器人已上线：' + botName + '，知识库 ' + loadKB(KB_DIR).length + ' 篇，LLM：' + llmInfo);
  console.log('QA bot 已上线（长连接）：' + botName + ' | LLM：' + llmInfo);
}

main().catch(e => { log('启动失败：' + (e && e.stack || e)); console.error(e); process.exit(1); });
