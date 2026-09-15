// LLM 网关连通性自测：node tests/qa-bot/test-llm.cjs（不打印任何密钥，只输出结果）
// 改 server/.env 里的 LLM 配置后跑一遍，确认模型网关能通。
require('F:/pingce/server/node_modules/dotenv').config({ path: 'F:/pingce/server/.env' });
const { chat, llmConfigured } = require('F:/pingce/server/qa-bot/llm.js');
(async () => {
  if (!llmConfigured(process.env)) {
    console.log('LLM_NOT_CONFIGURED');
    process.exit(2);
  }
  const model = process.env.QA_BOT_LLM_MODEL;
  try {
    const ans = await chat(process.env, '你是连通性测试。', '只回复两个字：正常', 30000);
    console.log('LLM_OK model=' + model + ' reply=' + ans.slice(0, 40).replace(/\s+/g, ' '));
  } catch (e) {
    console.log('LLM_FAIL model=' + model + ' err=' + (e && e.message));
  }
})();
