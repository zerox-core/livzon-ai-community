// 知识库检索自测：node tests/qa-bot/kb-test.cjs（输出写到本目录 kb-test.out）
// 用途：改动 server/qa-bot/kb.js 或 kb/*.md 后跑一遍，确认问题都能命中正确文档。
const fs = require('fs');
const path = require('path');
const QABOT_DIR = path.join(__dirname, '..', '..', 'server', 'qa-bot');
const kb = require(path.join(QABOT_DIR, 'kb.js'));
const lines = [];
const log = (s) => lines.push(s);
const docs = kb.loadKB(path.join(QABOT_DIR, 'kb'));
log('加载文档数:' + docs.length);
log('标题:' + docs.map(d => d.title + (d.zone === 'archive' ? '(档案' + d.archiveYear + ')' : '')).join(' | '));
const qs = [
  '我提交的作品什么时候评审',
  '我能不能私信举办方交作品，我不会用平台',
  '网页设计马拉松怎么报名',
  '美术赛什么时候截稿',
  '怎么下载作品',
  '我是新手，平台怎么用',
  '投票一天能投几票',
  '去年这个比赛是什么规则',
];
for (const q of qs) {
  const z = kb.zoneFor(docs, q);
  const hits = kb.retrieve(docs, q, 2);
  log('\nQ: ' + q + '  [zone=' + z.mode + (z.years.length ? ':' + z.years.join(',') : '') + ']');
  for (const h of hits) {
    log('  -> ' + h.title + '  score=' + h.score + ' zone=' + h.zone + ' year=' + h.year + ' status=' + h.status);
  }
}
log('\nTEST_DONE');
fs.writeFileSync(path.join(__dirname, 'kb-test.out'), lines.join('\n'), 'utf-8');
console.log('kb-test.out written');
