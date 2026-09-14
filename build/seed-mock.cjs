// build/seed-mock.cjs —— Phase B mock 数据种子（幂等，可重复执行）
// 写入：3 个活动 + 3 份报名表 + 4 个可删的表单模板 + 28 件巨幕作品（14 网页 + 8 Skill + 6 美术资源）+ 14 个源码展示站点
// 用法：node build/seed-mock.cjs   （需 server/.env 提供 PG 连接）
const fs = require('fs');
const path = require('path');
// dotenv 必须显式从 server/node_modules 加载（build/ 下 require('dotenv') 解析不到）
const ENV_PATH = path.join(__dirname, '..', 'server', '.env');
try { require(path.join(__dirname, '..', 'server', 'node_modules', 'dotenv')).config({ path: ENV_PATH }); }
catch (_) { try { require('dotenv').config({ path: ENV_PATH }); } catch (_) {} }
const { query } = require(path.join(__dirname, '..', 'server', 'db.js'));

const log = (...a) => console.log(a.map(x => (typeof x === 'string' ? x : JSON.stringify(x))).join(' '));

// skill 仓库元数据（star 数等来自 GitHub API 的真实数据；缺失时回落）
let SKILL_JSON = {};
try { SKILL_JSON = JSON.parse(fs.readFileSync(path.join(__dirname, 'skill-repos.json'), 'utf8')); } catch (_) {}

// ============ 三个活动（kind 决定交互：current 报名 / upcoming 预约）============
const ACTS = [
  {
    id: 'web-marathon-2026q3', kind: 'current', flow_type: 'competition', sort: 0,
    start_at: '2026-09-26 09:00:00+08',
    title: '「一页一世界」网页设计马拉松 · 9 月赛季',
    date_label: '2026-09-26 09:00 — 09-27 21:00（48 小时）',
    location: '线上直播间 + 珠海办公室开放工位',
    tag: '网页设计',
    data: {
      id: 'web-marathon-2026q3',
      name: '「一页一世界」网页设计马拉松 · 9 月赛季',
      dateLabel: '2026-09-26 09:00 — 09-27 21:00（48 小时）',
      location: '线上直播间 + 珠海办公室开放工位',
      tag: '网页设计',
      desc: '48 小时从命题到上线：抽一个命题盲盒，用一页 HTML 讲一个完整的故事。不限工具、不限框架，交出的作品直接挂上社团大屏轮播，评审与社区投票双通道评奖。',
      highlights: [
        '命题盲盒抽取 + 48 小时极限创作，完整走一遍「创意 → 上线」',
        '作品零门槛上墙：大屏轮播 + 源码在线浏览，点击即看',
        '评审打分 60% + 社区投票 40%，双通道评出赛季前三',
        '优秀源码收录社团源码展示库，成为下一届的参考范本',
      ],
      signup: true,
    },
  },
  {
    id: 'skill-workshop-2026q4', kind: 'upcoming', flow_type: 'instant', sort: 0,
    start_at: '2026-10-17 14:00:00+08',
    title: 'Skill 插件工坊 · 第 1 期「把重复交给 agent」',
    date_label: '2026-10-17（周六）14:00 — 17:30',
    location: '总部培训教室 B + 线上同步',
    tag: '效率工坊',
    data: {
      id: 'skill-workshop-2026q4',
      name: 'Skill 插件工坊 · 第 1 期「把重复交给 agent」',
      dateLabel: '2026-10-17（周六）14:00 — 17:30',
      location: '总部培训教室 B + 线上同步',
      tag: '效率工坊',
      desc: '每周都在重复同一件事？把它写成第一个 Skill 插件。2 小时入门 + 1.5 小时实操，从社区里现成的开源 Skill 学起，现场互测互评，人人带着一个能跑的插件离开。',
      highlights: [
        '2 小时入门：Skill 是什么、怎么让 agent 记住你的工作流',
        '1.5 小时实操：从真实痛点出发写一个自己的 Skill',
        '现场互测互评，优秀插件推荐上社团大屏轮播',
        '沉淀社团 Skill 精选库：Superpowers 等开源项目逐个拆解',
      ],
      signup: true,
    },
  },
  {
    id: 'aigc-season-2026a', kind: 'upcoming', flow_type: 'instant', sort: 1,
    start_at: '2026-10-24 14:00:00+08',
    title: '美术资源设计赛 · 秋季场「为社团而设计」',
    date_label: '2026-10-24 14:00 开题 — 11-07 18:00 截稿',
    location: '线上（开题 + 点评双直播）',
    tag: '美术资源',
    data: {
      id: 'aigc-season-2026a',
      name: '美术资源设计赛 · 秋季场「为社团而设计」',
      dateLabel: '2026-10-24 14:00 开题 — 11-07 18:00 截稿',
      location: '线上（开题 + 点评双直播）',
      tag: '美术资源',
      desc: '命题两周创作期：为社团设计真正用得上的美术资源——吉祥物、App 图标按钮组件、系列插画，三个赛道任选。画、插画、任何美术资源都能投稿，AI 辅助不限工具，双导师线上点评，获奖作品直接投入社团产品与年历使用。',
      highlights: [
        '两周期命题创作：10-24 开题直播抽命题，11-07 截稿',
        '吉祥物 / UI 美术资产 / 插画三赛道，工具不限（即梦、SD、MJ 均可）',
        '双导师线上点评：一次创作方向校准 + 一次成稿精修',
        '获奖作品上大屏轮播、投入社团 App 开发并收入 2027 年历',
      ],
      signup: true,
    },
  },
];

// ============ 三份报名表 profile（与前端 afCollect 同构）============
const FORMS = {
  'web-marathon-2026q3': {
    contact: true, needUpload: false, deadline: '2026-09-25（周五）18:00',
    team: { enabled: true, label: '组队情况', options: ['单人', '2-3 人小队'] },
    rules: '<p><b>「一页一世界」网页设计马拉松 · 9 月赛季</b></p><ul><li>9-26 上午 9 点直播间抽命题盲盒，48 小时内提交一页可在线浏览的作品；</li><li>技术栈不限，鼓励纯手写 HTML / CSS / JS，可用 AI 辅助但需在作品中注明；</li><li>作品须为赛前新创作，获奖前三名将收录进社团源码展示库；</li><li>报名截止 9-25 18:00，通过审核后可在活动期间上传参赛作品。</li></ul>',
    fields: [
      { key: 'page_direction', label: '创作方向', type: 'select', required: true, options: ['单页叙事（滚动长页）', '多页小站（3-5 页）', '交互动效实验', '其他（自由发挥）'], placeholder: '' },
      { key: 'toolchain', label: '常用工具 / 技术栈', type: 'text', required: true, options: [], placeholder: '如：VS Code + 原生 HTML/CSS' },
      { key: 'experience', label: '网页开发经验', type: 'radio', required: true, options: ['零基础（第一次写页面）', '做过静态页面', '能独立开发完整站点'], placeholder: '' },
      { key: 'idea', label: '命题方向初想（选填）', type: 'textarea', required: false, options: [], placeholder: '想做什么主题？一句话即可，抽到盲盒后可推翻重来' },
    ],
  },
  'skill-workshop-2026q4': {
    contact: true, needUpload: false, deadline: '2026-10-16（周五）18:00',
    team: { enabled: false, label: '组队情况', options: ['单人', '2-3 人'] },
    rules: '<p><b>Skill 插件工坊 · 第 1 期</b></p><ul><li>线下 + 线上同步，请自带电脑，提前装好你常用的 AI 编程工具；</li><li>入门环节会拆解 Superpowers 等开源 Skill 项目，欢迎先去 GitHub 围观；</li><li>实操环节从你自己最想自动化的重复工作出发，现场写一个能跑的 Skill；</li><li>名额 30 人（线下 15 + 线上 15），先到先得。</li></ul>',
    fields: [
      { key: 'painpoint', label: '最想自动化的重复工作', type: 'textarea', required: true, options: [], placeholder: '例：每周从十几个 Excel 汇总周报' },
      { key: 'skill_level', label: 'Skill 使用经验', type: 'radio', required: true, options: ['新手（还没用过 agent 编程）', '用过 Claude Code / Cursor 等工具', '写过自定义 Skill / 插件'], placeholder: '' },
      { key: 'expect', label: '期望工坊产出（选填）', type: 'text', required: false, options: [], placeholder: '希望带着什么离开这次工坊？' },
    ],
  },
  'aigc-season-2026a': {
    contact: true, needUpload: false, deadline: '2026-10-23（周五）18:00',
    team: { enabled: false, label: '组队情况', options: ['单人', '2-3 人'] },
    rules: '<p><b>美术资源设计赛 · 秋季场「为社团而设计」</b></p><ul><li>10-24 开题直播公布完整命题，两周创作期，11-07 18:00 截稿；</li><li>吉祥物 / UI 美术资产 / 插画三赛道，每人限投一件（一组），AI 生成占比不限但需提交关键提示词；</li><li>获奖作品将进入社团大屏轮播、投入社团 App 开发，并收入 2027 社团年历；</li><li>报名即视为同意作品在社团内外展示与产品内使用。</li></ul>',
    fields: [
      { key: 'track', label: '参赛赛道', type: 'radio', required: true, options: ['吉祥物设计', 'UI 美术资产（图标 / 按钮 / 组件）', '插画 · 概念设计'], placeholder: '' },
      { key: 'tools', label: '常用 AI 工具', type: 'text', required: true, options: [], placeholder: '如：即梦 / Stable Diffusion / Midjourney' },
      { key: 'portfolio', label: '过往作品（选填）', type: 'textarea', required: false, options: [], placeholder: '链接或简单描述，没有也可留空' },
    ],
  },
};

// ============ 四个「模板库」模板（管理页可增删，非固定）============
const TPLS = [
  { id: 'tpl_mock_web_marathon', name: '网页设计马拉松 · 标准报名', profile: FORMS['web-marathon-2026q3'] },
  { id: 'tpl_mock_skill_wkshop', name: '工坊 / 培训 · 轻报名', profile: FORMS['skill-workshop-2026q4'] },
  { id: 'tpl_mock_aigc_season', name: '美术资源设计赛 · 三赛道报名', profile: FORMS['aigc-season-2026a'] },
  {
    id: 'tpl_mock_light', name: '通用 · 极简报名（仅联系方式）',
    profile: {
      contact: true, needUpload: false, deadline: '',
      team: { enabled: false, label: '组队情况', options: ['单人', '2-3 人'] },
      rules: '<p>名额有限，报满即止。</p>',
      fields: [
        { key: 'how_know', label: '从哪里看到本次活动', type: 'text', required: false, options: [], placeholder: '选填' },
      ],
    },
  },
];

// ============ 作品素材 ============
// 网页设计（源码来自 Art 仓库 web_mock，public/showcase/<slug>/ 由本项目静态直供）
const WEB_SITES = [
  { slug: 'midnight-bookstore', title: '深夜书店 · 24 点不打烊', order: 1, author: '林晚舟', theme: '夜色里的旧书店：一个纯 CSS 沉浸式单页，灯光与书页都用手写渐变模拟', note: '纯手写 HTML/CSS，零依赖单文件' },
  { slug: 'monsoon-post', title: '季风邮局', order: 3, author: '闻笛', theme: '信件乘着季风抵达：南洋港口邮局主题单页，信封与季风气流串起整个故事', note: '纯手写 HTML/CSS，轻叙事排版' },
  { slug: 'hanabi-night', title: '夏夜花火大会', order: 5, author: '陈默', theme: 'Canvas 粒子烟花 + 日式排版，滚动即进入祭典夜空', note: 'Canvas 粒子系统 + 滚动叙事' },
  { slug: 'dunhuang-murals', title: '丝路花雨', order: 7, author: '安西洲', theme: '敦煌壁画主题的沉浸式长页，飞天与藻井纹样在滚动中徐徐展开', note: '国风配色 + 滚动叙事' },
  { slug: 'horologium', title: '钟表齿轮博物馆', order: 9, author: '陆时衍', theme: '三百年机械计时史：从哥特塔钟到精密腕表，暗金质感的策展式单页', note: '排版驱动 + 微动效' },
  { slug: 'oilpaper-umbrella', title: '一把油纸伞', order: 11, author: '江野', theme: '江南烟雨题材的国风交互长页，伞面开合之间切换章节', note: '滚动驱动动画 + 国风配色' },
  { slug: 'cirque-brume', title: '雾夜马戏团', order: 13, author: '聂小满', theme: '红幕布拉开的哥特马戏之夜，节目单式导航与剧场氛围拉满', note: '字体排版 + 氛围动效' },
  { slug: 'abyssal-codex', title: '深海生物志', order: 15, author: '蓝以宁', theme: '一页潜到海底：深海生物图鉴，越深越暗的滚动式下潜体验', note: '滚动深度叙事' },
  { slug: 'bioluminescent-bay', title: '荧光海湾', order: 17, author: '何知遥', theme: '冷光深海主题，鼠标划过之处泛起蓝眼泪', note: '鼠标跟随 + 发光粒子' },
  { slug: 'paper-cut-realm', title: '纸上剪影', order: 19, author: '祝红绡', theme: '中国剪纸艺术展：一把剪刀一张红纸，民俗纹样的现代排版演绎', note: '民间美术 + 现代栅格' },
  { slug: 'paper-kite-museum', title: '纸鸢博物馆', order: 21, author: '顾星辞', theme: '一只只风筝是一页页展品，策展式排版的小型线上博物馆', note: '单文件静态站，语义化排版' },
  { slug: 'chama-trail', title: '茶马古道', order: 23, author: '马千里', theme: '从云南到西藏的千年商路地图长卷，马帮铃铛声里的山河叙事', note: '地图长卷 + 留白美学' },
  { slug: 'movable-type-studio', title: '活字工坊', order: 25, author: '常印', theme: '活字印刷互动工坊：字架、捡字、排版、拓印，一页走完千年印刷流程', note: '拟物木纹 + 交互排版' },
  { slug: 'amber-insect-archive', title: '琥珀昆虫档案馆', order: 27, author: '柯岩', theme: '穿越亿万年时光的琥珀标本馆，每只昆虫都是一座时间胶囊', note: '暖棕色调 + 标本陈列式布局' },
];

// Skill 插件（真实开源项目推荐；star 数以 skill-repos.json 的 GitHub 数据为准）
const SKILLS = [
  { full: 'obra/superpowers', slug: 'superpowers', order: 2, name: 'Superpowers', zh: '给 agent 装上一整套工作流方法论', why: '最火的 agent 技能框架：头脑风暴、SDLC、测试纪律……装上之后 agent 像换了个脑子，工坊入门环节就拆它。' },
  { full: 'anthropics/skills', slug: 'anthropic-skills', order: 6, name: 'Anthropic Skills（官方技能库）', zh: '官方出品的 Agent Skills 合集', why: 'Anthropic 官方维护的技能仓库，看官方怎么写 Skill 结构，照着抄就对了。' },
  { full: 'microsoft/markitdown', slug: 'markitdown', order: 10, name: 'MarkItDown', zh: '微软出品：万物转 Markdown', why: 'Word / PPT / Excel / PDF 一键转 Markdown，喂给大模型前的第一道工序，社团知识库入库全靠它。' },
  { full: 'browser-use/browser-use', slug: 'browser-use', order: 14, name: 'browser-use', zh: '让 agent 真正会用浏览器', why: '把浏览器交给 agent 操作：填表、抓取、点按钮，写自动化脚本的同事人手一个。' },
  { full: 'modelcontextprotocol/servers', slug: 'mcp-servers', order: 18, name: 'MCP Servers（参考服务器）', zh: 'MCP 生态的官方参考实现合集', why: 'Model Context Protocol 官方参考服务器：文件系统、搜索、数据库接入怎么写，都在这里。' },
  { full: 'All-Hands-AI/OpenHands', slug: 'openhands', order: 22, name: 'OpenHands', zh: '开源软件工程 agent 平台', why: '前 OpenDevin：一个能改代码、跑测试、提 PR 的完整 agent 平台，适合团队内部部署体验。' },
  { full: 'unclecode/crawl4ai', slug: 'crawl4ai', order: 26, name: 'Crawl4AI', zh: '为 LLM 而生的爬虫', why: '专为喂大模型设计的爬虫：自动转 Markdown、去噪、适配 RAG，做资料类 Skill 的黄金搭档。' },
  { full: 'lobehub/lobe-chat', slug: 'lobechat', order: 28, name: 'LobeChat', zh: '一句话搭出团队聊天机器人', why: '插件生态丰富的开源聊天框架，把内部工具包装成机器人给全组用，低成本高回报。' },
];

// 美术资源（素材图 public/showcase/art/setN_image_M.jpg，每件作品一组 4 张图集）
const ART_WORKS = [
  { set: 1, order: 4, t: '「珠小团」社团吉祥物 · 标准形象设计稿', a: '温叙', s: '吉祥物设计', theme: '为丽珠 AI 社团设计的官方吉祥物：胶囊 + 珍珠原型的 Q 版形象，含正面 / 侧面 / 背面与三视图规范稿' },
  { set: 2, order: 8, t: '「珠小团」表情与动作延展稿', a: '温叙', s: '吉祥物设计', theme: '吉祥物的动作表情延展：庆祝、点赞、思考、加油四连，可直接用于群表情与活动物料' },
  { set: 3, order: 12, t: '社团 App 功能图标集 · 四风格设计稿', a: '柯岩', s: 'UI 美术资产', theme: '为社团应用设计的功能图标集：首页 / 活动 / 作品墙 / 消息等 9 枚图标，线性、面性、毛玻璃、3D 四种风格稿' },
  { set: 4, order: 16, t: '社团 App 按钮与组件设计稿', a: '柯岩', s: 'UI 美术资产', theme: '为社团应用设计的 UI 组件规范：按钮三态、标签徽章、卡片、表单输入，后期开发直接取用' },
  { set: 5, order: 20, t: '系列插画「自然与科技」', a: '叶浮生', s: '插画', theme: '齿轮藤蔓森林、数据河流、电路树叶、月下机器人与鹿——当自然遇见科技的四幅回答' },
  { set: 6, order: 24, t: '系列插画「城市与人」', a: '常晚', s: '插画', theme: '雨夜霓虹、天台日出、地铁读书人、黄昏晾衣绳——城市角落里的人与光' },
];

(async () => {
  // ---- 0. 建表（幂等：IF NOT EXISTS；表已存在则原样跳过）----
  for (const f of ['022_signup_form_templates.sql', '023_showcase_sites.sql']) {
    const fp = path.join(__dirname, f);
    if (!fs.existsSync(fp)) { log('⚠ 缺文件，跳过: ' + f); continue; }
    const marker = f.startsWith('022') ? 'signup_form_templates' : 'showcase_sites';
    const ex = await query('SELECT to_regclass($1) AS t', ['public.' + marker]);
    if (ex.rows[0] && ex.rows[0].t) log('✓ 表已存在: ' + marker);
    else { await query(fs.readFileSync(fp, 'utf8')); log('✓ 已建表: ' + marker); }
  }

  const actIds = ACTS.map(a => a.id);
  const tplIds = TPLS.map(t => t.id);
  // starfield-observatory 已下架：一并清掉它的展示站点登记
  const siteSlugs = WEB_SITES.map(s => s.slug).concat(['starfield-observatory']);

  // ---- 1. 清旧（只清本 mock 范围，可重复执行）----
  await query('DELETE FROM works WHERE activity_id = ANY($1)', [actIds]);
  await query('DELETE FROM activity_signup_forms WHERE activity_id = ANY($1)', [actIds]);
  await query('DELETE FROM activities WHERE id = ANY($1)', [actIds]);
  await query('DELETE FROM signup_form_templates WHERE id = ANY($1)', [tplIds]);
  await query('DELETE FROM showcase_sites WHERE slug = ANY($1)', [siteSlugs]);
  log('✓ 已清理旧 mock 数据');

  // ---- 2. 活动 ----
  for (const a of ACTS) {
    await query(
      'INSERT INTO activities (id, kind, title, date_label, location, tag, sort, data, start_at, flow_type) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
      [a.id, a.kind, a.title, a.date_label, a.location, a.tag, a.sort, JSON.stringify(a.data), a.start_at, a.flow_type]
    );
  }
  log('✓ 活动 × ' + ACTS.length);

  // ---- 3. 报名表 ----
  for (const a of ACTS) {
    await query('INSERT INTO activity_signup_forms (activity_id, profile, updated_at) VALUES ($1,$2,now())', [a.id, JSON.stringify(FORMS[a.id])]);
  }
  log('✓ 报名表 × ' + ACTS.length);

  // ---- 4. 模板库 ----
  for (const t of TPLS) {
    await query('INSERT INTO signup_form_templates (id, name, profile) VALUES ($1,$2,$3)', [t.id, t.name, JSON.stringify(t.profile)]);
  }
  log('✓ 表单模板 × ' + TPLS.length);

  // ---- 5. 作品（28 件上墙）----
  const workIdByTitle = new Map();
  async function addWork(w) {
    const r = await query(
      `INSERT INTO works (kind, title, author, category, description, cover, source, detail, status, published, created_by, user_id, activity_id, wall_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'approved',true,$9,NULL,$10,$11) RETURNING id, title`,
      [w.kind, w.title, w.author, w.category, w.description, w.cover, w.source, JSON.stringify(w.detail), w.author, w.activity_id, w.wall_order]
    );
    workIdByTitle.set(r.rows[0].title, r.rows[0].id);
  }
  // 5a. 网页设计 × 14
  for (const s of WEB_SITES) {
    await addWork({
      kind: 'source', title: s.title, author: s.author, category: '网页设计',
      description: s.theme + '。' + s.note + '，源码已收录社团源码展示库，点击作品可直接在线浏览。',
      cover: '/showcase/' + s.slug + '/thumbnail.png', source: 'Art 素材仓库 · web_mock',
      detail: { layout: 'showcase', theme: s.theme, source: 'Art 素材仓库 · web_mock', team: [{ name: s.author, role: '独立创作' }], process: [{ stage: '抽题', note: '9-26 上午直播间抽取命题盲盒' }, { stage: '开发', note: s.note + '，48 小时内独立完成' }, { stage: '上线', note: '源码收录社团源码展示库，直挂大屏轮播' }], link: '/showcase/' + s.slug + '/' },
      activity_id: 'web-marathon-2026q3', wall_order: s.order,
    });
  }
  // 5b. Skill 插件 × 8（真实开源项目）
  for (const s of SKILLS) {
    const meta = SKILL_JSON[s.full] || {};
    const stars = meta.stars ? Number(meta.stars).toLocaleString('en-US') + ' stars' : '';
    const ghDesc = meta.desc || '';
    await addWork({
      kind: 'skill', title: s.name + ' —— ' + s.zh, author: '社团 Skill 精选', category: 'Skill 插件',
      description: s.why + (stars ? '（GitHub ' + stars + '）' : '') + (ghDesc ? ' 官方简介：' + ghDesc : ''),
      cover: '/showcase/skills/' + s.slug + '.svg', source: 'GitHub 开源推荐',
      detail: { layout: 'linkcard', theme: s.zh, source: 'GitHub 开源推荐', team: [{ name: '开源社区', role: '作者' }], process: [{ stage: '推荐', note: '第 1 期工坊拆解项目' }], link: meta.url || ('https://github.com/' + s.full) },
      activity_id: 'skill-workshop-2026q4', wall_order: s.order,
    });
  }
  // 5c. 美术资源 × 6（每件一组 4 张图集）
  for (const it of ART_WORKS) {
    const gallery = [1, 2, 3, 4].map(function (n) { return '/showcase/art/set' + it.set + '_image_' + n + '.jpg'; });
    await addWork({
      kind: 'image', title: it.t, author: it.a, category: '美术资源',
      description: it.theme + '。AI 生成 + 手工精修。',
      cover: gallery[0], source: '社团设计组 · AI 辅助创作',
      detail: { layout: 'gallery', theme: it.theme, style: it.s, tools: 'AI 生成 + 手工精修', gallery: gallery },
      activity_id: 'aigc-season-2026a', wall_order: it.order,
    });
  }
  log('✓ 作品上墙 × ' + workIdByTitle.size);

  // ---- 6. 源码展示站点登记 ----
  for (const s of WEB_SITES) {
    await query(
      'INSERT INTO showcase_sites (slug, title, description, work_id, path, url) VALUES ($1,$2,$3,$4,$5,$6)',
      [s.slug, s.title, s.theme, workIdByTitle.get(s.title) || null, 'public/showcase/' + s.slug + '/index.html', '/showcase/' + s.slug + '/']
    );
  }
  log('✓ 展示站点 × ' + WEB_SITES.length);

  // ---- 7. 自检 ----
  const va = await query('SELECT kind, count(*)::int AS n FROM activities GROUP BY kind ORDER BY kind');
  const vw = await query('SELECT category, count(*)::int AS n FROM works WHERE published GROUP BY category ORDER BY category');
  const vt = await query('SELECT count(*)::int AS n FROM signup_form_templates');
  const vs = await query('SELECT count(*)::int AS n FROM showcase_sites');
  const wall = await query('SELECT count(*)::int AS n, min(wall_order) AS lo, max(wall_order) AS hi FROM works WHERE wall_order IS NOT NULL');
  log('== 自检 ==');
  log('活动: ' + JSON.stringify(va.rows));
  log('作品: ' + JSON.stringify(vw.rows));
  log('模板: ' + vt.rows[0].n + ' · 站点: ' + vs.rows[0].n);
  log('墙位: ' + JSON.stringify(wall.rows[0]));
  log('== seed-mock 完成 ==');
  process.exit(0);
})().catch(e => { console.error('seed 失败:', e && e.stack || e); process.exit(1); });
