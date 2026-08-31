/**
 * 빌드된 SPA(dist/)를 헤드리스 브라우저로 각 공개 라우트에서 렌더한 뒤
 * 그 HTML을 dist/<route>/index.html 로 저장한다. (앱 코드는 건드리지 않음)
 *
 * 목적: 라우트별로 고유한 <title>·canonical·본문을 가진 정적 HTML을 만들어
 *       검색엔진의 초기 크롤에서 "홈 복제본"으로 오인되지 않게 한다.
 *
 * nginx 는 `try_files $uri $uri/ /index.html;` 여야 /guide/ → dist/guide/index.html 이 서빙됨.
 *
 * 실행: npm run prerender  (build-only 파이프라인에서 vite build 뒤에 실행)
 * 건너뛰기: SKIP_PRERENDER=1 npm run build
 */
import { createServer } from 'node:http'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join, extname } from 'node:path'
import { PUBLIC_ROUTES } from './public-routes.mjs'

const DIST = resolve(dirname(fileURLToPath(import.meta.url)), '../dist')
const PORT = 4180
const SETTLE_MS = 1200

if (process.env.SKIP_PRERENDER) {
  console.log('prerender: SKIP_PRERENDER 설정됨 — 건너뜀')
  process.exit(0)
}
if (!existsSync(join(DIST, 'index.html'))) {
  console.error('prerender: dist/index.html 없음 — 먼저 vite build 실행 필요')
  process.exit(1)
}

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.xml': 'application/xml',
  '.txt': 'text/plain', '.ico': 'image/x-icon',
}

// dist/ 정적 서버 + SPA fallback
const server = createServer(async (req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
  let filePath = join(DIST, urlPath)
  try {
    const ext = extname(filePath)
    if (!ext) throw new Error('no-ext') // 라우트 → fallback
    const buf = await readFile(filePath)
    res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream' })
    res.end(buf)
  } catch {
    const buf = await readFile(join(DIST, 'index.html'))
    res.writeHead(200, { 'content-type': 'text/html' })
    res.end(buf)
  }
})

await new Promise((r) => server.listen(PORT, r))

let browser
try {
  const { default: puppeteer } = await import('puppeteer')
  browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
} catch (err) {
  console.warn(`prerender: 브라우저 실행 실패 — 프리렌더 건너뜀 (${err.message})`)
  server.close()
  process.exit(0)
}

let ok = 0
let failed = false
for (const { path } of PUBLIC_ROUTES) {
  const page = await browser.newPage()
  // 프리렌더 중임을 앱에 알린다. 일시적 UI(모달 등)는 이 플래그를 보고
  // 스냅샷에 스스로 빠진다. 실제 사용자 브라우저엔 이 플래그가 없다.
  await page.evaluateOnNewDocument(() => {
    window.__PRERENDER__ = true
  })
  try {
    await page.goto(`http://127.0.0.1:${PORT}${path}`, {
      waitUntil: 'domcontentloaded',
      timeout: 20_000,
    })
    // 앱 마운트 대기 (실패해도 진행)
    await page
      .waitForFunction(() => document.querySelector('#app')?.children.length > 0, { timeout: 8_000 })
      .catch(() => {})
    await new Promise((r) => setTimeout(r, SETTLE_MS))

    // 스냅샷에 일시적 오버레이 상태가 굳지 않도록 정리한다.
    // 홈 최초 진입 모달(HomePromiseModal)이 body 스크롤을 잠근 채 캡처되면,
    // 이 index.html 을 SPA fallback 으로 쓰는 모든 비프리렌더 라우트
    // (/admin/*, /products/:id, /cart, /my/* …)에서 스크롤이 완전히 막힌다.
    await page.evaluate(() => {
      document.querySelectorAll('[role="dialog"]').forEach((el) => el.remove())
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    })

    const html = await page.content()

    // 회귀 방지: <body>/<html> 에 스크롤을 막는 인라인 스타일이 남았는지 검사한다.
    // 프리렌더가 어떤 이유로든 스크롤 잠금을 캡처하면, 이 HTML 을 SPA fallback 으로
    // 쓰는 라우트 전체가 스크롤 불가가 된다 → 조용히 배포되지 않게 빌드를 실패시킨다.
    const rootTags = (html.match(/<(?:body|html)\b[^>]*>/gi) || []).join(' ')
    if (/overflow\s*:\s*hidden|position\s*:\s*fixed/i.test(rootTags)) {
      failed = true
      console.error(`  ✗ ${path} — 루트 요소에 스크롤 잠금 스타일이 굳음: ${rootTags.trim()}`)
      continue
    }

    if (path === '/') {
      await writeFile(join(DIST, 'index.html'), html)
    } else {
      // nginx 설정 편차 대응: 디렉터리 인덱스(/guide/)와 확장자 fallback(/guide.html) 모두 생성
      const outDir = join(DIST, path)
      await mkdir(outDir, { recursive: true })
      await writeFile(join(outDir, 'index.html'), html)
      await writeFile(join(DIST, `${path}.html`), html)
    }

    const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '(no title)'
    console.log(`  ✓ ${path.padEnd(16)} → ${title}`)
    ok++
  } catch (err) {
    console.warn(`  ✗ ${path} — ${err.message}`)
  } finally {
    await page.close()
  }
}

await browser.close()
server.close()
console.log(`prerender: ${ok}/${PUBLIC_ROUTES.length} 라우트 완료`)
if (failed) {
  console.error('prerender: ✗ 스크롤 잠금이 스냅샷에 포함됨 — 빌드 중단')
  process.exit(1)
}
