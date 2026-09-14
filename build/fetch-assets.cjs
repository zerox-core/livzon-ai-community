// build/fetch-assets.cjs —— 抓取第二批素材（Windows 本地运行）
// 9 个新网页 mock（GitHub Art 仓库）+ 24 张美术资源图（aily 图床）
const fs = require("fs");
const path = require("path");
const https = require("https");

const ROOT = path.join(__dirname, "..", "public", "showcase");

const SITES = [{"dir": "2026-08-18_丝路花雨_dunhuang-murals", "slug": "dunhuang-murals"}, {"dir": "2026-08-17_雾夜马戏团_cirque-brume", "slug": "cirque-brume"}, {"dir": "2026-08-16_季风邮局_monsoon-post", "slug": "monsoon-post"}, {"dir": "2026-08-17_钟表齿轮博物馆_horologium", "slug": "horologium"}, {"dir": "2026-08-17_纸上剪影_paper-cut-realm", "slug": "paper-cut-realm"}, {"dir": "2026-08-17_深海生物志_abyssal-codex", "slug": "abyssal-codex"}, {"dir": "2026-08-19_茶马古道_chama-trail", "slug": "chama-trail"}, {"dir": "2026-08-19_活字工坊_movable-type-studio", "slug": "movable-type-studio"}, {"dir": "2026-08-18_琥珀昆虫档案馆_amber-insect-archive", "slug": "amber-insect-archive"}];
const ART = [{"name": "set1_image_1.jpg", "url": "https://aily.feishu.cn/workbench/api/v1/workbench/resources/redirect?resourceID=a4bf6ea4-f64a-45a4-9d97-db1ed0c733a9"}, {"name": "set1_image_2.jpg", "url": "https://aily.feishu.cn/workbench/api/v1/workbench/resources/redirect?resourceID=c0ff5889-fe81-486c-8afb-d1e888ce86ae"}, {"name": "set1_image_3.jpg", "url": "https://aily.feishu.cn/workbench/api/v1/workbench/resources/redirect?resourceID=4f634798-2e1b-4403-bab8-9c06c9025a53"}, {"name": "set1_image_4.jpg", "url": "https://aily.feishu.cn/workbench/api/v1/workbench/resources/redirect?resourceID=2fccf03a-0acd-4a85-b36b-146f943ab8c4"}, {"name": "set2_image_1.jpg", "url": "https://aily.feishu.cn/workbench/api/v1/workbench/resources/redirect?resourceID=9df26f7b-5e86-4ac9-a062-7a29ef483b17"}, {"name": "set2_image_2.jpg", "url": "https://aily.feishu.cn/workbench/api/v1/workbench/resources/redirect?resourceID=0773bccf-2781-4ed5-80c5-f18d670ba2b2"}, {"name": "set2_image_3.jpg", "url": "https://aily.feishu.cn/workbench/api/v1/workbench/resources/redirect?resourceID=e7e7d79a-ed22-47b9-b65a-b66c458cc179"}, {"name": "set2_image_4.jpg", "url": "https://aily.feishu.cn/workbench/api/v1/workbench/resources/redirect?resourceID=dcd7f72d-d714-46f5-b1ec-bd17c85eeae7"}, {"name": "set3_image_1.jpg", "url": "https://aily.feishu.cn/workbench/api/v1/workbench/resources/redirect?resourceID=30c7b9b0-8103-4e4a-824b-f48e08db9a65"}, {"name": "set3_image_2.jpg", "url": "https://aily.feishu.cn/workbench/api/v1/workbench/resources/redirect?resourceID=2a6206fe-24c5-4608-809d-c9f3a9d83906"}, {"name": "set3_image_3.jpg", "url": "https://aily.feishu.cn/workbench/api/v1/workbench/resources/redirect?resourceID=5587aac9-aa3b-41a1-b556-708ae5f5d9a1"}, {"name": "set3_image_4.jpg", "url": "https://aily.feishu.cn/workbench/api/v1/workbench/resources/redirect?resourceID=62db38ee-6554-4bec-8ab6-cc39c39cfcfc"}, {"name": "set4_image_1.jpg", "url": "https://aily.feishu.cn/workbench/api/v1/workbench/resources/redirect?resourceID=6c14d2fa-9db0-40e9-a11e-160a75a297e9"}, {"name": "set4_image_2.jpg", "url": "https://aily.feishu.cn/workbench/api/v1/workbench/resources/redirect?resourceID=39c2e4e2-37b3-47a8-8d14-e2e621f53dc2"}, {"name": "set4_image_3.jpg", "url": "https://aily.feishu.cn/workbench/api/v1/workbench/resources/redirect?resourceID=19cda49e-109e-4b66-84a8-7d3817500f9f"}, {"name": "set4_image_4.jpg", "url": "https://aily.feishu.cn/workbench/api/v1/workbench/resources/redirect?resourceID=dbe132c0-6d0e-488e-8993-b9d8c0dd058b"}, {"name": "set5_image_1.jpg", "url": "https://aily.feishu.cn/workbench/api/v1/workbench/resources/redirect?resourceID=73c02f0f-4a68-4939-bb8d-5ec06e94df5b"}, {"name": "set5_image_2.jpg", "url": "https://aily.feishu.cn/workbench/api/v1/workbench/resources/redirect?resourceID=6ce2eeb2-a713-4abd-b795-3ae7ac1c830e"}, {"name": "set5_image_3.jpg", "url": "https://aily.feishu.cn/workbench/api/v1/workbench/resources/redirect?resourceID=f4c43377-9f72-41da-a037-dbc8dc20e5c2"}, {"name": "set5_image_4.jpg", "url": "https://aily.feishu.cn/workbench/api/v1/workbench/resources/redirect?resourceID=4d96e1f8-3b75-41fc-b8b7-52094fd9e163"}, {"name": "set6_image_1.jpg", "url": "https://aily.feishu.cn/workbench/api/v1/workbench/resources/redirect?resourceID=f136ba1d-2ac8-4dee-b9a1-f001fbbf5c04"}, {"name": "set6_image_2.jpg", "url": "https://aily.feishu.cn/workbench/api/v1/workbench/resources/redirect?resourceID=364cb375-8a2f-44fa-91f1-14562eb6603d"}, {"name": "set6_image_3.jpg", "url": "https://aily.feishu.cn/workbench/api/v1/workbench/resources/redirect?resourceID=15b537d8-cf83-412c-ac53-5dd6948ec6a6"}, {"name": "set6_image_4.jpg", "url": "https://aily.feishu.cn/workbench/api/v1/workbench/resources/redirect?resourceID=41d2d925-683c-45bf-b2d1-53ff38e75a9a"}];

function get(url, redirects) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'pingce-fetch' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && (redirects || 0) < 5) {
        res.resume();
        resolve(get(res.headers.location, (redirects || 0) + 1));
        return;
      }
      if (res.statusCode !== 200) { res.resume(); reject(new Error('HTTP ' + res.statusCode + ' ' + url)); return; }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function save(url, dest, minBytes) {
  const buf = await get(url);
  if (buf.length < (minBytes || 1000)) throw new Error('too small (' + buf.length + 'B): ' + url);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  return buf.length;
}

(async () => {
  let ok = 0, fail = 0;
  for (const s of SITES) {
    const base = 'https://raw.githubusercontent.com/zerox-core/Art/main/web_mock/' + encodeURIComponent(s.dir) + '/';
    for (const f of ['index.html', 'thumbnail.png']) {
      const dest = path.join(ROOT, s.slug, f);
      try {
        const n = await save(base + f, dest, 5000);
        console.log('OK  ' + s.slug + '/' + f + '  ' + n + 'B');
        ok++;
      } catch (e) { console.log('ERR ' + s.slug + '/' + f + '  ' + e.message); fail++; }
      await new Promise(r => setTimeout(r, 150));
    }
  }
  for (const a of ART) {
    const dest = path.join(ROOT, 'art', a.name);
    try {
      const n = await save(a.url, dest, 5000);
      console.log('OK  art/' + a.name + '  ' + n + 'B');
      ok++;
    } catch (e) { console.log('ERR art/' + a.name + '  ' + e.message); fail++; }
    await new Promise(r => setTimeout(r, 150));
  }
  console.log('== done: ok=' + ok + ' fail=' + fail + ' ==');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
