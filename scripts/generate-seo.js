// scripts/generate-seo.js
// Netlify에서 배포 폴더(=publish)에 있는 html을 스캔해서
// sitemap.xml + robots.txt를 자동 생성합니다.

const fs = require("fs");
const path = require("path");

const SITE = process.env.SITE_URL || "https://anw.kr";

// ✅ Netlify publish 폴더: 보통 "." 또는 "dist" 또는 "public"
// 아래 우선순위로 자동 감지
const CANDIDATES = [
  process.env.PUBLISH_DIR,
  "public",
  "dist",
  ".",
].filter(Boolean);

function findPublishDir() {
  for (const dir of CANDIDATES) {
    const p = path.resolve(process.cwd(), dir);
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) return p;
  }
  return path.resolve(process.cwd(), ".");
}

const PUBLISH_DIR = findPublishDir();

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      // 숨김폴더/노드폴더는 제외
      if (e.name.startsWith(".") || e.name === "node_modules") continue;
      files = files.concat(walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

// ✅ sitemap에 넣을 html만 추출
const allFiles = walk(PUBLISH_DIR);
const htmlFiles = allFiles.filter((f) => f.toLowerCase().endsWith(".html"));

// ✅ url 리스트 만들기 (index.html은 / 로 처리)
function toUrl(filePath) {
  const rel = path.relative(PUBLISH_DIR, filePath).replace(/\\/g, "/");
  if (rel === "index.html") return `${SITE}/`;
  if (rel.endsWith("/index.html")) return `${SITE}/${rel.replace("/index.html", "/")}`;
  return `${SITE}/${rel.replace(".html", "")}`;
}

const urls = htmlFiles
  .map(toUrl)
  // 중복 제거
  .filter((v, i, a) => a.indexOf(v) === i)
  // 정렬
  .sort();

const today = new Date().toISOString().slice(0, 10);

// ✅ sitemap.xml 생성
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${u === `${SITE}/` ? "1.0" : "0.8"}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

// ✅ robots.txt 생성
const robots = `User-agent: *
Allow: /

Crawl-delay: 1

Sitemap: ${SITE}/sitemap.xml
`;

fs.writeFileSync(path.join(PUBLISH_DIR, "sitemap.xml"), sitemap, "utf8");
fs.writeFileSync(path.join(PUBLISH_DIR, "robots.txt"), robots, "utf8");

console.log("✅ Generated sitemap.xml & robots.txt");
console.log("Publish dir:", PUBLISH_DIR);
console.log("URLs:", urls.length);
