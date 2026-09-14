// setup-mock.cjs —— Phase B mock 环境搭建（前端补丁 + 素材下载 + skill 卡片生成 + activities.json 元信息恢复）
// 用法：node build/setup-mock.cjs          （完整执行：补丁 → 下载 → 生成）
//       node build/setup-mock.cjs --check  （只校验补丁锚点，不写不下载）
// 幂等性：补丁带 "mockB" 标记检测，重复执行自动跳过已打的补丁；下载文件存在即跳过。
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const PUB = path.join(ROOT, 'public');
const SHOWCASE = path.join(PUB, 'showcase');
const CHECK_ONLY = process.argv.includes('--check');
const MARK = '/* mockB */';

function die(msg) { console.error('[X] ' + msg); process.exit(1); }

// ---------- 通用补丁器：LF 归一后锚定替换（出现次数必须 =1），按原文件行尾还原 ----------
function patchFile(file, patches, opts) {
  const o = opts || {};
  let raw = fs.readFileSync(file, 'utf8');
  const isCrlf = raw.includes('\r\n');
  let s = raw.replace(/\r\n/g, '\n');
  let applied = 0, skipped = 0;
  for (const p of patches) {
    if (s.includes(p.mark || (MARK + ' ' + p.name))) { skipped++; console.log('  = ' + path.basename(file) + ' [' + p.name + '] 已打过，跳过'); continue; }
    const n = s.split(p.old).length - 1;
    if (n !== 1) { die(path.basename(file) + ' [' + p.name + '] 锚点出现 ' + n + ' 次（需 1 次）——中止，未写入'); }
    s = s.replace(p.old, p.new);
    applied++;
    console.log('  + ' + path.basename(file) + ' [' + p.name + ']');
  }
  if (applied === 0 && skipped === patches.length) { console.log('  = ' + path.basename(file) + ' 全部补丁已存在'); return; }
  if (CHECK_ONLY) { console.log('  - ' + path.basename(file) + ' --check 模式：锚点全部通过，不写入'); return; }
  if (isCrlf) s = s.replace(/\n/g, '\r\n');
  fs.writeFileSync(file, s, 'utf8');
  console.log('  W ' + path.basename(file) + ' 已写入（' + applied + ' 处补丁）');
}

// ---------- 下载工具（失败重试 2 次，返回 ok / skip / fail，不抛出） ----------
function dlOnce(url, dest, timeoutMs) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const t = setTimeout(() => { req.destroy(); reject(new Error('timeout ' + url)); }, timeoutMs || 60000);
    const req = https.get(url, { headers: { 'User-Agent': 'mock-setup' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        clearTimeout(t); res.resume();
        return dlOnce(res.headers.location, dest, timeoutMs).then(resolve, reject);
      }
      if (res.statusCode !== 200) { clearTimeout(t); res.resume(); return reject(new Error('HTTP ' + res.statusCode + ' ' + url)); }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        clearTimeout(t);
        const buf = Buffer.concat(chunks);
        if (buf.length < 1024) return reject(new Error('too small ' + buf.length + 'B ' + url));
        fs.writeFileSync(dest, buf);
        console.log('  ↓ ' + path.relative(ROOT, dest) + ' (' + Math.round(buf.length / 1024) + 'KB)');
        resolve('ok');
      });
      res.on('error', (e) => { clearTimeout(t); reject(e); });
    });
    req.on('error', (e) => { clearTimeout(t); reject(e); });
  });
}
const DL_FAILS = [];
async function dl(url, dest, timeoutMs) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1024) { console.log('  = 已存在，跳过 ' + path.relative(ROOT, dest)); return 'skip'; }
  for (let i = 0; i < 3; i++) {
    try { return await dlOnce(url, dest, timeoutMs); }
    catch (e) {
      if (i < 2) console.log('  ! 第 ' + (i + 1) + ' 次失败重试：' + e.message);
      else { console.log('  X 放弃：' + e.message); DL_FAILS.push(dest); }
    }
  }
  return 'fail';
}

(async function main() {
  // =====================================================================
  // 一、app.js 补丁（6 处）
  // =====================================================================
  console.log('[1/5] app.js 补丁');
  const appJs = path.join(PUB, 'app.js');

  // P1：板块卡 → 3 张具体活动卡（删掉重复的粉色牡丹卡）
  const P1_OLD =
`        var BOARD_CARDS = [
          { t: "板块 · 01", n: "AIGC 创作", m: "AI 微电影创作赛 · AI 设计沙龙 · 展映拆解", d: "文生图出分镜、图生视频出镜头、AI 配音配乐收尾——从分镜到成片的完整创作流水线都在这里。月初领主题、月末交成片，展映会上像产品发布会一样轮流播放讨论。", sp: "rose" },
          { t: "板块 · 02", n: "Agent 应用", m: "Vibe Coding 沙龙 · 前沿模型开发者讲座", d: "用最新模型现场生成有强烈氛围的交互网页、小游戏或视觉生成器；也邀请开源模型核心贡献者闭门分享，小场制、问到你懂为止。", sp: "lily" },
          { t: "板块 · 03", n: "Skill 工具", m: "Skill 开发黑客松 · 实用技能午间沙龙", d: "每人独立开发一个真正能用的 skill，再交给所有人各自的 agent 实测评分：写出来只是开始，被用起来才算完成。", sp: "lotus" },
          { t: "板块 · 04", n: "实际工作流", m: "办公自动化 · 效率工具 · 数据可视化", d: "从重复劳动里解放双手：workflow 串联、prompt 模板沉淀、报表自动生成，现场演示一条真实办公链路的自动化改造全过程。", sp: "peony" }
        ];`;
  const P1_NEW =
`        /* mockB P1 */ var BOARD_CARDS = [
          { t: "板块 · 01", n: "网页设计", aid: "web-marathon-2026q3", sp: "rose", m: "「一页一世界」网页设计马拉松 · 9 月赛季", d: "48 小时从命题到上线：选定一个主题，用你最顺手的工具把完整网页做出来——首页视觉、动效、响应式全算分。优秀作品直接上巨幕轮播，可点击浏览源网页。" },
          { t: "板块 · 02", n: "Skill 插件", aid: "skill-workshop-2026q4", sp: "lily", m: "实用 Skill 开发工坊 · 第 4 期", d: "把日常工作里重复的一件事交给 agent：现场拆需求、写 skill、互相实测评分——写出来只是开始，被用起来才算完成。零基础可参加。" },
          { t: "板块 · 03", n: "AIGC 创作", aid: "aigc-season-2026a", sp: "lotus", m: "AIGC 插画设计季 · 秋季场", d: "以「自然与科技」为题进行插画与视觉设计：文生图、局部重绘、风格化都行。月末评审展 + 作品上墙，全员投票选人气奖。" }
        ];`;

  // P2：板块卡 href —— 当期活动去报名页，未开始活动弹预约面板
  const P2_OLD =
`        }].concat(BOARD_CARDS.map(function (b) {
          return { t: b.t, n: b.n, m: b.m, d: b.d, big: false, sp: b.sp, href: SIGNUP_HREF };
        }));`;
  const P2_NEW =
`        }].concat(BOARD_CARDS.map(function (b) {
          /* mockB P2 */ var bh = (b.aid === String(focus.id || "")) ? SIGNUP_HREF : ("panel:upcoming:" + b.aid);
          return { t: b.t, n: b.n, m: b.m, d: b.d, big: false, sp: b.sp, href: bh };
        }));`;

  // P3：卡片点击支持 panel: 前缀（弹活动详情面板）
  const P3_OLD =
`            var href = m.getAttribute("data-slide-href");
            if (!href) return;
            if (href.charAt(0) === "#") {`;
  const P3_NEW =
`            var href = m.getAttribute("data-slide-href");
            if (!href) return;
            /* mockB P3 */ if (href.slice(0, 6) === "panel:") {
              var pp = href.slice(6).split(":");
              if (window.actPanel && pp[0] && pp[1]) window.actPanel(pp[0], pp[1]);
              return;
            }
            if (href.charAt(0) === "#") {`;

  // P4：三个新活动的创作思路文案
  const P4_OLD =
`        "frontier-talk": "邀请 Qwen、DeepSeek、InternLM 等开源模型核心贡献者与年轻研究员闭门分享。8-12 人小场，问到你懂为止。"
      };`;
  const P4_NEW =
`        "frontier-talk": "邀请 Qwen、DeepSeek、InternLM 等开源模型核心贡献者与年轻研究员闭门分享。8-12 人小场，问到你懂为止。",
        /* mockB P4 */ "web-marathon-2026q3": "「一页一世界」网页设计马拉松：48 小时命题创作，从品牌主题、首页视觉到动效与响应式全算分。优秀作品上巨幕轮播，点击卡片可进入源网页浏览。",
        "skill-workshop-2026q4": "实用 Skill 开发工坊：把日常工作里重复的一件事交给 agent——现场拆需求、写 skill、互相实测评分。零基础可参加，带一台能跑 agent 的电脑就行。",
        "aigc-season-2026a": "AIGC 插画设计季（秋季场）：以「自然与科技」为题，文生图 / 局部重绘 / 风格化均可，月末评审展 + 作品上墙，全员投票选人气奖。"
      };`;

  // P5：巨幕合并读 JSONB detail 对象（原实现只读平铺字段，detail.link 永远流不进去）
  const P5_OLD =
`            if (w.theme || w.source || (w.team && w.team.length) || (w.process && w.process.length) || w.link) {
              WORKS_INFO[slot].detail = {
                theme: w.theme || "",
                source: w.source || "",
                team: w.team || [],
                process: w.process || [],
                link: w.link || ""
              };
            }`;
  const P5_NEW =
`            /* mockB P5 */ var wd = (w.detail && typeof w.detail === "object") ? w.detail : null;
            if (w.theme || w.source || (w.team && w.team.length) || (w.process && w.process.length) || w.link || wd) {
              WORKS_INFO[slot].detail = {
                theme: (wd && wd.theme) || w.theme || "",
                source: (wd && wd.source) || w.source || "",
                team: (wd && wd.team) || w.team || [],
                process: (wd && wd.process) || w.process || [],
                link: (wd && wd.link) || w.link || ""
              };
            }`;

  // P6a：管理端表单页加「模板库」卡片（可增删、可套用）
  const P6A_OLD =
`          "<button class='adm-btn' onclick='window.myAdminFormNew&&window.myAdminFormNew()'>＋ 新建表单</button>" +
        "</div>" +
        "<div id='adm-form-editor'><div class='adm-loading'>请选择活动后加载</div></div>";`;
  const P6A_NEW =
`          "<button class='adm-btn' onclick='window.myAdminFormNew&&window.myAdminFormNew()'>＋ 新建表单</button>" +
        "</div>" +
        /* mockB P6a */ "<div class='af-tpl-card'>" +
          "<div class='af-tpl-head'><div class='af-pick-ico'>🗂️</div>" +
          "<div class='af-pick-b'><div class='af-pick-t'>模板库 · 可随时增删</div><div class='af-pick-d'>把编辑器里的表单存为模板，之后一键套用到任意活动；模板可新增、可删除，按每个活动不同的需求灵活组合。</div></div>" +
          "<button class='adm-btn' onclick='window.myAdminTplSave&&window.myAdminTplSave()'>💾 存为模板</button></div>" +
          "<div id='af-tpl-list' class='af-tpl-list'><span class='adm-loading'>加载中…</span></div>" +
        "</div>" +
        "<div id='adm-form-editor'><div class='adm-loading'>请选择活动后加载</div></div>";`;

  // P6b：wrapFormEditor 收尾时拉取模板列表
  const P6B_OLD =
`        sel.onchange = function () { window.myAdminFormLoad(sel.value); };
      }).catch(function () {});
    }`;
  const P6B_NEW =
`        sel.onchange = function () { window.myAdminFormLoad(sel.value); };
      }).catch(function () {});
      /* mockB P6b */ renderTplList();
    }`;

  // P6c：模板库逻辑（渲染 / 存 / 套用 / 删——删除入口保留）
  const P6C_OLD =
`    window.myAdminFormLoad = function (id) { formState.activityId = id; loadFormEditor(); };`;
  const P6C_NEW =
`    /* mockB P6c —— 报名表单模板库（可增删，套用到任意活动） */
    function renderTplList() {
      var box = document.getElementById('af-tpl-list'); if (!box) return;
      fetch('/api/admin/signup-form-templates').then(function (r) { return r.json(); }).then(function (j) {
        if (!j.ok || !j.data) { box.innerHTML = "<div class='af-tpl-empty'>模板库加载失败，请刷新重试</div>"; return; }
        formState.tpls = (j.data && j.data.templates) || [];
        if (!formState.tpls.length) { box.innerHTML = "<div class='af-tpl-empty'>暂无模板——在上方编辑好表单后点「存为模板」即可复用。</div>"; return; }
        box.innerHTML = formState.tpls.map(function (t) {
          var nf = (t.profile && t.profile.fields) ? t.profile.fields.length : 0;
          return "<div class='af-tpl-row'>" +
            "<div class='af-tpl-info'><div class='af-tpl-name'>" + esc(t.name || '未命名模板') + "</div>" +
            "<div class='af-tpl-time'>" + esc(String(t.updatedAt || '').slice(0, 16).replace('T', ' ')) + " · " + nf + " 个自定义字段</div></div>" +
            "<div class='af-tpl-act'>" +
              "<button class='adm-btn' onclick=\\"window.myAdminTplApply&&window.myAdminTplApply('" + esc(t.id) + "')\\">套用</button>" +
              "<button class='adm-btn tpl-del' onclick=\\"window.myAdminTplDel&&window.myAdminTplDel('" + esc(t.id) + "')\\">删除</button>" +
            "</div></div>";
        }).join('');
      }).catch(function () { box.innerHTML = "<div class='af-tpl-empty'>模板库加载失败，请刷新重试</div>"; });
    }
    window.myAdminTplSave = function () {
      var profile = afCollect();
      if (!profile) { window.alert('请先在上方选择活动并编辑好表单，再存为模板'); return; }
      var name = window.prompt('模板名称（用于之后套用时辨认）：', '');
      if (name === null) return;
      name = String(name).trim().slice(0, 60) || ('模板 ' + new Date().toISOString().slice(0, 10));
      fetch('/api/admin/signup-form-templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name, profile: profile }) })
        .then(function (r) { return r.json(); }).then(function (j) {
          if (j.ok) { renderTplList(); window.alert('✓ 模板已保存'); }
          else window.alert('保存失败：' + ((j.error && j.error.message) || '未知错误'));
        }).catch(function () { window.alert('保存失败：网络异常'); });
    };
    window.myAdminTplApply = function (tid) {
      var t = (formState.tpls || []).filter(function (x) { return String(x.id) === String(tid); })[0];
      if (!t || !t.profile) { window.alert('模板不存在，请刷新后重试'); return; }
      var sel = document.getElementById('af-select');
      var id = formState.activityId || (sel ? sel.value : '') || '';
      if (!id) { window.alert('请先在上方选择要套用模板的活动'); return; }
      formState.mode = 'new'; formState.savedAt = '';
      renderFormEditor(JSON.parse(JSON.stringify(t.profile)));
      var msg = document.getElementById('af-msg');
      if (msg) { msg.textContent = '✓ 已套用模板「' + (t.name || '') + '」——确认内容后点「保存表单」落到当前活动'; msg.className = 'af-msg'; }
    };
    window.myAdminTplDel = function (tid) {
      var t = (formState.tpls || []).filter(function (x) { return String(x.id) === String(tid); })[0];
      if (!t) return;
      if (!window.confirm('确定删除模板「' + (t.name || '') + '」？\\n删除后不可恢复（不影响已保存到各活动的表单）。')) return;
      fetch('/api/admin/signup-form-templates/' + encodeURIComponent(tid), { method: 'DELETE' })
        .then(function (r) { return r.json(); }).then(function (j) {
          if (j.ok) renderTplList();
          else window.alert('删除失败：' + ((j.error && j.error.message) || '未知错误'));
        }).catch(function () { window.alert('删除失败：网络异常'); });
    };
    window.myAdminFormLoad = function (id) { formState.activityId = id; loadFormEditor(); };`;

  // P6d：模板库样式
  const P6D_OLD =
`    .af-pick-card{display:flex;gap:14px;align-items:center;flex-wrap:wrap;background:linear-gradient(135deg,#fafbfc,#f4f7fb);border:1px solid rgba(0,0,0,0.07);border-radius:12px;padding:16px 18px;margin-bottom:16px;}`;
  const P6D_NEW =
`    .af-pick-card{display:flex;gap:14px;align-items:center;flex-wrap:wrap;background:linear-gradient(135deg,#fafbfc,#f4f7fb);border:1px solid rgba(0,0,0,0.07);border-radius:12px;padding:16px 18px;margin-bottom:16px;}
    /* mockB P6d */ .af-tpl-card{background:linear-gradient(135deg,#f6f4f0,#f9f8f5);border:1px solid rgba(0,0,0,0.07);border-radius:12px;padding:14px 18px;margin-bottom:16px;}
    .af-tpl-head{display:flex;gap:14px;align-items:center;flex-wrap:wrap;}
    .af-tpl-list{margin-top:12px;display:flex;flex-direction:column;gap:8px;}
    .af-tpl-row{display:flex;gap:12px;align-items:center;justify-content:space-between;background:#fff;border:1px solid rgba(0,0,0,0.06);border-radius:10px;padding:10px 14px;}
    .af-tpl-name{font-weight:600;font-size:13px;}
    .af-tpl-time{font-size:11px;color:#8a8f98;margin-top:2px;}
    .af-tpl-act{display:flex;gap:8px;flex:none;}
    .af-tpl-act .adm-btn.tpl-del{color:#b3261e;border-color:rgba(179,38,30,0.35);}
    .af-tpl-empty{font-size:12px;color:#8a8f98;padding:10px 4px;}`;

  // P6e：组件卸载清理新增的 window 函数
  const P6E_OLD = `"myAdminFormSave", "myAdminFmt"]`;
  const P6E_NEW = `"myAdminFormSave", "myAdminTplSave", "myAdminTplApply", "myAdminTplDel", "myAdminFmt"]`;

  patchFile(appJs, [
    { name: 'P1-board-cards', mark: '/* mockB P1 */', old: P1_OLD, new: P1_NEW },
    { name: 'P2-card-href', mark: '/* mockB P2 */', old: P2_OLD, new: P2_NEW },
    { name: 'P3-panel-prefix', mark: '/* mockB P3 */', old: P3_OLD, new: P3_NEW },
    { name: 'P4-idea-copy', mark: 'mockB P4', old: P4_OLD, new: P4_NEW },
    { name: 'P5-wall-detail', mark: '/* mockB P5 */', old: P5_OLD, new: P5_NEW },
    { name: 'P6a-tpl-ui', mark: '/* mockB P6a */', old: P6A_OLD, new: P6A_NEW },
    { name: 'P6b-tpl-render', mark: '/* mockB P6b */', old: P6B_OLD, new: P6B_NEW },
    { name: 'P6c-tpl-fns', mark: 'mockB P6c', old: P6C_OLD, new: P6C_NEW },
    { name: 'P6d-tpl-css', mark: '/* mockB P6d */', old: P6D_OLD, new: P6D_NEW },
    { name: 'P6e-cleanup', mark: '"myAdminTplSave", "myAdminTplApply", "myAdminTplDel", "myAdminFmt"', old: P6E_OLD, new: P6E_NEW },
  ]);

  // =====================================================================
  // 二、admin.js 补丁：模板库 CRUD 四条路由（GET / POST / PUT / DELETE）
  // =====================================================================
  console.log('[2/5] admin.js 补丁（模板库 CRUD）');
  const adminJs = path.join(ROOT, 'server', 'routes', 'admin.js');
  const A1_OLD =
`    console.error('[admin.signup-form.put]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// POST /api/admin/activities/scan-reminders`;
  const A1_NEW =
`    console.error('[admin.signup-form.put]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

/* mockB tpl-routes —— 报名表单模板库：可新增、可更新、可删除的通用模板，套用到任意活动 */
// GET /api/admin/signup-form-templates —— 模板清单（含完整 profile，供前端套用）
router.get('/signup-form-templates', adminRequired, async (req, res) => {
  try {
    const rows = await query(
      \`SELECT id, name, profile, updated_at FROM signup_form_templates ORDER BY updated_at DESC\`, []);
    res.json(ok({
      templates: (rows || []).map(r => ({
        id: r.id, name: r.name,
        profile: (r.profile && typeof r.profile === 'object') ? r.profile : {},
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : null,
      })),
    }));
  } catch (e) {
    console.error('[admin.signup-tpl.list]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// POST /api/admin/signup-form-templates —— 新增模板 { name, profile }
router.post('/signup-form-templates', adminRequired, async (req, res) => {
  const body = req.body || {};
  const name = String(body.name || '').trim().slice(0, 60) || ('模板 ' + new Date().toISOString().slice(0, 10));
  try {
    const profile = sanitizeProfile(body.profile || {});
    const id = 'tpl_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    await query(\`INSERT INTO signup_form_templates (id, name, profile) VALUES ($1,$2,$3)\`, [id, name, JSON.stringify(profile)]);
    res.json(ok({ id }));
  } catch (e) {
    console.error('[admin.signup-tpl.post]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// PUT /api/admin/signup-form-templates/:id —— 更新模板 { name?, profile }
router.put('/signup-form-templates/:id', adminRequired, async (req, res) => {
  const id = String(req.params.id || '').slice(0, 64);
  if (!id) return res.status(400).json(err(ErrorCodes.VALIDATION, 'id 非法'));
  const body = req.body || {};
  const name = String(body.name || '').trim().slice(0, 60);
  try {
    const profile = sanitizeProfile(body.profile || {});
    const r = await query(
      \`UPDATE signup_form_templates SET name=COALESCE(NULLIF($2,''), name), profile=$3, updated_at=now() WHERE id=$1 RETURNING id\`,
      [id, name, JSON.stringify(profile)]);
    if (!r.rows.length) return res.status(404).json(err(ErrorCodes.NOT_FOUND, '模板不存在'));
    res.json(ok({ id }));
  } catch (e) {
    console.error('[admin.signup-tpl.put]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// DELETE /api/admin/signup-form-templates/:id —— 删除模板（删除入口：随时可删，不影响已落到活动的表单）
router.delete('/signup-form-templates/:id', adminRequired, async (req, res) => {
  const id = String(req.params.id || '').slice(0, 64);
  if (!id) return res.status(400).json(err(ErrorCodes.VALIDATION, 'id 非法'));
  try {
    const r = await query(\`DELETE FROM signup_form_templates WHERE id=$1 RETURNING id\`, [id]);
    if (!r.rows.length) return res.status(404).json(err(ErrorCodes.NOT_FOUND, '模板不存在'));
    res.json(ok({ id }));
  } catch (e) {
    console.error('[admin.signup-tpl.del]', e);
    res.status(500).json(err(ErrorCodes.INTERNAL));
  }
});

// POST /api/admin/activities/scan-reminders`;
  patchFile(adminJs, [{ name: 'A1-tpl-crud', mark: 'mockB tpl-routes', old: A1_OLD, new: A1_NEW }]);
  if (CHECK_ONLY) { console.log('--check 模式结束'); return; }

  // =====================================================================
  // 三、index.html / work.html 版本号 r9 → r10
  // =====================================================================
  console.log('[3/5] HTML 版本号 r10');
  for (const f of ['index.html', 'work.html']) {
    const p = path.join(PUB, f);
    let s = fs.readFileSync(p, 'utf8');
    const n = s.split('app.js?v=20260914r9').length - 1;
    if (n === 0 && s.includes('20260914r10')) { console.log('  = ' + f + ' 已是 r10'); continue; }
    if (n !== 1) die(f + ' r9 标记出现 ' + n + ' 次（需 1 次）');
    s = s.replace('app.js?v=20260914r9', 'app.js?v=20260914r10');
    fs.writeFileSync(p, s, 'utf8');
    console.log('  W ' + f + ' → r10');
  }

  // =====================================================================
  // 四、activities.json 元信息恢复（motto / intro / types；三个数组留空走 DB）
  // =====================================================================
  console.log('[4/5] activities.json 元信息');
  const actJson = {
    updatedAt: '2026-09-14',
    intro: '丽珠 AI 社团活动总览：每月一场工坊、每季一场创作季，报名与作品展示都在站内完成。',
    motto: '玩出来的 AI —— 把每个灵感做成能用的东西',
    types: [
      { name: '网页设计', tagline: '一页一世界', cadence: '每季一期', format: '48 小时线上马拉松' },
      { name: 'Skill 插件', tagline: '把重复交给 agent', cadence: '每月一期', format: '工坊 + 互测评分' },
      { name: 'AIGC 创作', tagline: '自然与科技', cadence: '每季一期', format: '命题创作 + 评审展' },
    ],
    current: [], upcoming: [], past: [],
  };
  fs.writeFileSync(path.join(PUB, 'data', 'activities.json'), JSON.stringify(actJson, null, 2) + '\n', 'utf8');
  console.log('  W activities.json（motto/types/intro 已恢复，活动列表走 DB）');

  // =====================================================================
  // 五、素材下载与生成
  // =====================================================================
  console.log('[5/5] 素材下载 / 生成');
  // 5.1 网页设计作品：从 Art 仓库拉 6 个自包含展示站
  const ART = 'https://raw.githubusercontent.com/zerox-core/Art/main/web_mock/';
  const SITES = [
    { dir: '2026-08-18_长夜书店_midnight-bookstore', slug: 'midnight-bookstore' },
    { dir: '2026-08-17_夏夜烟火祭_hanabi-night', slug: 'hanabi-night' },
    { dir: '2026-08-18_星野天文馆_starfield-observatory', slug: 'starfield-observatory' },
    { dir: '2026-08-17_伞下江南_oilpaper-umbrella', slug: 'oilpaper-umbrella' },
    { dir: '2026-08-17_荧光海湾_bioluminescent-bay', slug: 'bioluminescent-bay' },
    { dir: '2026-08-18_纸鸢博物馆_paper-kite-museum', slug: 'paper-kite-museum' },
  ];
  const enc = (s) => s.split('/').map(encodeURIComponent).join('/');
  for (const s of SITES) {
    await dl(ART + enc(s.dir) + '/index.html', path.join(SHOWCASE, s.slug, 'index.html'), 120000);
    await dl(ART + enc(s.dir) + '/thumbnail.png', path.join(SHOWCASE, s.slug, 'thumbnail.png'), 120000);
  }

  // 5.2 AIGC 插画：14 张（豆包图搜签名 URL，有效期至 2027-03，仅作 mock 展示）
  const AIGC = [
    'https://p3-doubao-search-sign.byteimg.com/labis/image/e8777ee19ef80eb7c6358ff3b5008352~tplv-be4g95zd3a-image.jpeg?lk3s=feb11e32&x-expires=1804934095&x-signature=tJdoynOyhndEDY20IV4RLpZLNJM%3D',
    'https://p26-doubao-search-sign.byteimg.com/labis/image/b3d2c6380f41875fc1c9ee49824434b3~tplv-be4g95zd3a-image.jpeg?lk3s=feb11e32&x-expires=1804934102&x-signature=m7flvijej%2BPlx%2FnTEAY3bdsUQPE%3D',
    'https://p11-doubao-search-sign.byteimg.com/labis/image/73d7ae29208ef283334095c1a42a81e8~tplv-be4g95zd3a-image.jpeg?lk3s=feb11e32&x-expires=1804934102&x-signature=2CO%2BnkOeyh9YG8%2BT4NIhRlf0d40%3D',
    'https://p11-doubao-search-sign.byteimg.com/labis/image/de6d83ac42816c87e0eac191b18bdced~tplv-be4g95zd3a-image.jpeg?lk3s=feb11e32&x-expires=1804934106&x-signature=hGBkYVE2UOWG85x8QqPM0a8%2FbR4%3D',
    'https://p3-doubao-search-sign.byteimg.com/labis/image/c5571fe4b09728995ba482918d93af52~tplv-be4g95zd3a-image.jpeg?lk3s=feb11e32&x-expires=1804934106&x-signature=mXs1viFYOxBfHOUEeN8VFEWuYgc%3D',
    'https://p3-doubao-search-sign.byteimg.com/labis/image/85502fbb0a0552c05d0f90bdbf724c77~tplv-be4g95zd3a-image.jpeg?lk3s=feb11e32&x-expires=1804934106&x-signature=Ollnti6P0JRii77s%2FqlEgZGM1Qw%3D',
    'https://p11-doubao-search-sign.byteimg.com/labis/image/a3d95591a2995701c4d4b9f05fa412ca~tplv-be4g95zd3a-image.jpeg?lk3s=feb11e32&x-expires=1804934095&x-signature=Q07jzSl%2FiEyps3d47AXQMGUEJI4%3D',
    'https://p3-doubao-search-sign.byteimg.com/labis/image/b31da5e8d48d84e73748693d0563a0b2~tplv-be4g95zd3a-image.jpeg?lk3s=feb11e32&x-expires=1804934095&x-signature=N53b4Ry2aCH77h2Kw0BF0uqHlbU%3D',
    'https://p26-doubao-search-sign.byteimg.com/labis/image/456ed8eec114502c95612f2fadacf345~tplv-be4g95zd3a-image.jpeg?lk3s=feb11e32&x-expires=1804934106&x-signature=0kNjHyAOn8WMOje9q9LoZr7gVTI%3D',
    'https://p26-doubao-search-sign.byteimg.com/labis/image/0fe92e2f5ba693647e83569c6e7661b4~tplv-be4g95zd3a-image.jpeg?lk3s=feb11e32&x-expires=1804934106&x-signature=ZhZTl%2FSJMdHGqHBR0nJej5S3BD8%3D',
    'https://p11-doubao-search-sign.byteimg.com/labis/image/9d469dab98975f534fac4cb3967969bc~tplv-be4g95zd3a-image.jpeg?lk3s=feb11e32&x-expires=1804934102&x-signature=ciZmh9NUnq9KE5MhPaFqfpaIPEE%3D',
    'https://p3-doubao-search-sign.byteimg.com/labis/image/37575b58ed9373826b09e7a88af18b7a~tplv-be4g95zd3a-image.jpeg?lk3s=feb11e32&x-expires=1804934101&x-signature=R0NAmhZSKptvoMbLAkK%2FXJ2NT7g%3D',
    'https://p11-doubao-search-sign.byteimg.com/labis/image/748b8dd0c12e812da0e438cbbbdfd62a~tplv-be4g95zd3a-image.jpeg?lk3s=feb11e32&x-expires=1804934101&x-signature=J3PeWRYkyv76LsdBEk2RHnF8ZP8%3D',
    'https://p11-doubao-search-sign.byteimg.com/labis/image/734021b4129dffbe98aee5d2e7137c29~tplv-be4g95zd3a-image.jpeg?lk3s=feb11e32&x-expires=1804934106&x-signature=DtpessWoGKkczesoek33geLdUPM%3D',
  ];
  for (let i = 0; i < AIGC.length; i++) {
    const nn = String(i + 1).padStart(2, '0');
    await dl(AIGC[i], path.join(SHOWCASE, 'aigc', 'aigc-' + nn + '.jpg'), 60000);
  }

  // 5.3 Skill 插件：8 张 SVG 卡片（真实开源项目推荐）
  const SKILLS = [
    { slug: 'superpowers', name: 'Superpowers', sub: 'obra/superpowers', stars: '286k', desc: '为 Claude Code 打造的 agentic 技能框架与开发方法论', tag: '技能框架', c1: '#1f2733', c2: '#0d1220' },
    { slug: 'anthropic-skills', name: 'Agent Skills', sub: 'anthropics/skills', stars: '176k', desc: 'Anthropic 官方 Agent Skills 仓库：PDF、Excel、PPT 等开箱技能', tag: '官方技能库', c1: '#2b2340', c2: '#120e1f' },
    { slug: 'markitdown', name: 'MarkItDown', sub: 'microsoft/markitdown', stars: '183k', desc: '把 Office 文档、PDF、图片一键转成 Markdown', tag: '文档转换', c1: '#123a2e', c2: '#07160f' },
    { slug: 'browser-use', name: 'browser-use', sub: 'browser-use/browser-use', stars: '114k', desc: '让 agent 直接操作浏览器完成网页任务', tag: '浏览器自动化', c1: '#16324a', c2: '#08131f' },
    { slug: 'mcp-servers', name: 'MCP Servers', sub: 'modelcontextprotocol/servers', stars: '90k', desc: 'MCP 官方参考服务器合集：文件、搜索、数据库接入', tag: '工具协议', c1: '#3a2a16', c2: '#1a1207' },
    { slug: 'openhands', name: 'OpenHands', sub: 'All-Hands-AI/OpenHands', stars: '87k', desc: 'AI 驱动的软件开发代理，写代码 / 跑命令 / 改 Bug', tag: '开发代理', c1: '#301a2a', c2: '#150a12' },
    { slug: 'crawl4ai', name: 'Crawl4AI', sub: 'unclecode/crawl4ai', stars: '83k', desc: '为 LLM 而生的开源爬虫：网页 → 干净 Markdown', tag: '数据采集', c1: '#1c3340', c2: '#0a151b' },
    { slug: 'lobechat', name: 'LobeChat', sub: 'lobehub/lobe-chat', stars: '82k', desc: '插件化 AI 工作台：市场装插件、多模型切换', tag: '插件生态', c1: '#26303f', c2: '#0f151d' },
  ];
  fs.mkdirSync(path.join(SHOWCASE, 'skills'), { recursive: true });
  for (const s of SKILLS) {
    const svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" font-family="PingFang SC, Microsoft YaHei, sans-serif">',
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">',
      '<stop offset="0" stop-color="' + s.c1 + '"/><stop offset="1" stop-color="' + s.c2 + '"/></linearGradient></defs>',
      '<rect width="1200" height="675" fill="url(#g)"/>',
      '<g stroke="#ffffff" stroke-opacity="0.05">',
      Array.from({ length: 9 }, (_, i) => '<line x1="' + (i * 150) + '" y1="0" x2="' + (i * 150) + '" y2="675"/>').join(''),
      Array.from({ length: 5 }, (_, i) => '<line x1="0" y1="' + (i * 168) + '" x2="1200" y2="' + (i * 168) + '"/>').join(''),
      '</g>',
      '<circle cx="1035" cy="140" r="150" fill="#ffffff" fill-opacity="0.04"/>',
      '<circle cx="1055" cy="160" r="90" fill="#ffffff" fill-opacity="0.05"/>',
      '<text x="80" y="120" fill="#9fb3c8" font-size="26" letter-spacing="6">SKILL RECOMMEND · 开源项目推荐</text>',
      '<text x="80" y="250" fill="#ffffff" font-size="86" font-weight="700">' + s.name + '</text>',
      '<text x="80" y="312" fill="#7fd0a8" font-family="Consolas, monospace" font-size="28">github.com/' + s.sub + '</text>',
      '<text x="80" y="415" fill="#e8eef5" font-size="34">' + s.desc + '</text>',
      '<rect x="80" y="470" rx="20" width="' + (120 + s.tag.length * 30) + '" height="46" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.2"/>',
      '<text x="110" y="501" fill="#cfe0ee" font-size="26">' + s.tag + '</text>',
      '<text x="80" y="590" fill="#ffd27a" font-size="34">&#9733; ' + s.stars + ' stars</text>',
      '<text x="1130" y="625" fill="#9fb3c8" font-size="24" text-anchor="end">丽珠 AI 社团 · Skill 插件展位</text>',
      '</svg>',
    ].join('\n');
    fs.writeFileSync(path.join(SHOWCASE, 'skills', s.slug + '.svg'), svg, 'utf8');
    console.log('  W showcase/skills/' + s.slug + '.svg');
  }

  // 汇总
  if (DL_FAILS.length) {
    console.log('\n!! ' + DL_FAILS.length + ' 个文件下载失败（网络抖动）。重跑本脚本即可续传（已下载的自动跳过）：');
    DL_FAILS.forEach((f) => console.log('   - ' + path.relative(ROOT, f)));
  }
  console.log('\n== setup-mock 完成 ==');
  console.log('补丁：app.js×10、admin.js×1、index/work.html→r10、activities.json 元信息');
  console.log('素材：6 展示站 / 14 AIGC 插画 / 8 skill 卡片 → public/showcase/');
  if (DL_FAILS.length) process.exitCode = 2;
})().catch((e) => { console.error('[X] ' + (e && e.stack || e)); process.exit(1); });
