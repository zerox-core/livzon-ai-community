// server/lib/signup-form.js
// 报名表单 profile 的默认模板 + 服务端净化（用户可控 HTML/字段都在这校验，防 XSS/畸形）。
// profile JSONB 结构：
//   { contact:bool, needUpload:bool, deadline:string, team:{enabled,label,options[]},
//     rules:string(富文本 HTML), fields:[{key,label,type,required,options[],placeholder}] }
const FIELD_TYPES = ['text', 'textarea', 'select', 'radio', 'checkbox', 'number', 'date'];
const MAX_FIELDS = 20;

const DEFAULT_PROFILE = () => ({
  contact: true,
  needUpload: false,
  deadline: '',
  team: { enabled: false, label: '组队情况', options: ['单人', '2-3人'] },
  rules: '',
  fields: [],
});

// 富文本安全净化（白名单保留格式标签）：删 script/iframe/object/embed/link/meta/style，
// 删一切 on* 事件属性与 javascript: 协议；a 仅保留 http(s) href；只保留安全的格式/块标签。
const SAFE_TAG = /^(b|strong|i|em|u|s|ul|ol|li|h1|h2|h3|h4|p|br|a|span)$/i;
function sanitizeHtml(html) {
  let s = String(html || '').slice(0, 20000);
  // 1) 危险块整体删除
  s = s.replace(/<(script|iframe|object|embed|link|meta|style)[\s\S]*?<\/\1>/gi, '');
  s = s.replace(/<(script|iframe|object|embed|link|meta|style)[^>]*>/gi, '');
  // 2) 危险属性/协议
  s = s.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
       .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '')
       .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '')
       .replace(/javascript\s*:/gi, '')
       .replace(/style\s*=/gi, 'ignored_style=');
  // 3) a 只留安全 href，其余属性清空
  s = s.replace(/<a[^>]*href="(https?:[^"]+)"[^>]*>/gi, '<a href="$1" target="_blank" rel="noopener">')
       .replace(/<a[^>]*href='(https?:[^']+)'[^>]*>/gi, "<a href='$1' target=\"_blank\" rel=\"noopener\">")
       .replace(/<a[^>]*>/gi, '<a>');
  // 4) 非白名单标签剥壳留内容
  s = s.replace(/<(\/)?([a-zA-Z0-9]+)([^>]*)>/g, (m, close, tag) => (SAFE_TAG.test(tag) ? `<${close || ''}${tag}>` : ''));
  return s.trim();
}

function sanitizeOptions(v) {
  if (!Array.isArray(v)) return [];
  return v.map((o) => String(o == null ? '' : o).trim().slice(0, 50)).filter(Boolean).slice(0, 20);
}

// 校验并规整一份 profile；不合法字段直接丢弃该条，返回规整对象（宽松但安全）
function sanitizeProfile(raw) {
  const r = raw && typeof raw === 'object' ? raw : {};
  const d = DEFAULT_PROFILE();
  const team = r.team && typeof r.team === 'object' ? r.team : {};
  const fields = Array.isArray(r.fields) ? r.fields.slice(0, MAX_FIELDS) : [];
  const outFields = [];
  const usedKeys = new Set(['contact', 'needUpload', 'deadline', 'team', 'rules', 'fields', 'name', 'dept']);
  for (const f of fields) {
    if (!f || typeof f !== 'object') continue;
    const type = FIELD_TYPES.includes(f.type) ? f.type : 'text';
    const key = String(f.key || '').trim().replace(/\s+/g, '_').slice(0, 40);
    if (!/^[A-Za-z0-9_]+$/.test(key) || usedKeys.has(key)) continue;
    usedKeys.add(key);
    outFields.push({
      key, label: String(f.label || key).trim().slice(0, 100),
      type, required: !!f.required,
      options: (type === 'select' || type === 'radio' || type === 'checkbox') ? sanitizeOptions(f.options) : [],
      placeholder: String(f.placeholder || '').trim().slice(0, 120),
    });
  }
  return {
    contact: r.contact !== false,
    needUpload: !!r.needUpload,
    deadline: String(r.deadline || '').trim().slice(0, 60),
    team: {
      enabled: !!(team && team.enabled),
      label: String((team && team.label) || d.team.label).trim().slice(0, 60),
      options: sanitizeOptions(team && team.options).length ? sanitizeOptions(team.options) : d.team.options,
    },
    rules: sanitizeHtml(r.rules),
    fields: outFields,
  };
}

// 校验 response 是否满足 profile 必填约束 → 返回 { valid, errors }
function validateResponse(profile, resp) {
  const errors = [];
  const r = resp && typeof resp === 'object' ? resp : {};
  for (const f of profile.fields || []) {
    const v = r[f.key];
    if (f.required && (v == null || String(v).trim() === '')) errors.push(`「${f.label}」为必填`);
  }
  return { valid: errors.length === 0, errors };
}

module.exports = { DEFAULT_PROFILE, sanitizeProfile, sanitizeHtml, validateResponse, FIELD_TYPES };
