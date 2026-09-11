// OpenAI 兼容接口调用（丽珠 newapi 网关）
// 环境变量：QA_BOT_LLM_BASE_URL / QA_BOT_LLM_API_KEY / QA_BOT_LLM_MODEL
function llmConfigured(env) {
  return !!(env.QA_BOT_LLM_BASE_URL && env.QA_BOT_LLM_API_KEY && env.QA_BOT_LLM_MODEL);
}

// 剥掉思考模型的思考段。
// 网关常见两种泄漏：① 完整 <think>...</think> 段；② 开头标签被吞、只剩 </think> 之前的思考独白。
function stripThinking(text) {
  let t = String(text || '');
  // 情况②：有 </think> 时，思考内容一定在它之前（可能有多段），答案取最后一个 </think> 之后
  const idx = t.lastIndexOf('</think>');
  if (idx >= 0) t = t.slice(idx + '</think>'.length);
  // 情况①：成对的 <think>...</think> 整段删除
  t = t.replace(/<think>[\s\S]*?<\/think>/g, ' ');
  // 兜底：开头残留未闭合 <think> 时整段丢弃到结尾（没有可用答案）
  if (t.trim().startsWith('<think>')) t = '';
  return t.trim();
}

async function chat(env, system, user, timeoutMs) {
  const base = env.QA_BOT_LLM_BASE_URL.replace(/\/+$/, '');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs || 40000);
  try {
    const resp = await fetch(base + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + env.QA_BOT_LLM_API_KEY,
      },
      body: JSON.stringify({
        model: env.QA_BOT_LLM_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.3,
        max_tokens: 800,
        // 尽量关掉思考模式（Qwen 系）；网关不认识该参数会忽略
        enable_thinking: false,
      }),
      signal: ctrl.signal,
    });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const j = await resp.json();
    const text = j && j.choices && j.choices[0] && j.choices[0].message ? j.choices[0].message.content : '';
    const clean = stripThinking(text);
    if (!clean) throw new Error('EMPTY_REPLY');
    return clean;
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { llmConfigured, chat, stripThinking };
