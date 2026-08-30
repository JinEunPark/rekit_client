/**
 * 공개 정적 라우트로 public/sitemap.xml 을 생성한다.
 * build 전에 실행 (package.json 의 build-only 파이프라인).
 * 라우트 목록은 scripts/public-routes.mjs 에서 공유.
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { PUBLIC_ROUTES, SITE_ORIGIN } from './public-routes.mjs'

const today = new Date().toISOString().slice(0, 10)

const body = PUBLIC_ROUTES.map(
  ({ path, changefreq, priority }) =>
    `  <url>\n` +
    `    <loc>${SITE_ORIGIN}${path}</loc>\n` +
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
console.log(`sitemap.xml written: ${PUBLIC_ROUTES.length} urls`)
