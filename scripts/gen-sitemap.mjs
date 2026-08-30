/**
 * 공개 정적 라우트로 public/sitemap.xml 을 생성한다.
 * build 전에 실행 (package.json 의 build-only 파이프라인).
 * 동적 상세 페이지(/products/:id, /help/notice/:id)는 백엔드 연동 후 추가.
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const ORIGIN = 'https://rekit.co.kr'

/** [path, changefreq, priority] */
const ROUTES = [
  ['/', 'daily', '1.0'],
  ['/products', 'daily', '0.9'],
  ['/guide', 'monthly', '0.7'],
  ['/about', 'monthly', '0.6'],
  ['/help/faq', 'monthly', '0.5'],
  ['/help/contact', 'yearly', '0.4'],
  ['/help/notice', 'weekly', '0.5'],
  ['/legal/terms', 'yearly', '0.3'],
  ['/legal/privacy', 'yearly', '0.3'],
]

const today = new Date().toISOString().slice(0, 10)

const body = ROUTES.map(
  ([path, changefreq, priority]) =>
    `  <url>\n` +
    `    <loc>${ORIGIN}${path}</loc>\n` +
    `    <lastmod>${today}</lastmod>\n` +
    `    <changefreq>${changefreq}</changefreq>\n` +
    `    <priority>${priority}</priority>\n` +
    `  </url>`,
).join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../public/sitemap.xml')
writeFileSync(out, xml)
console.log(`sitemap.xml written: ${ROUTES.length} urls`)
