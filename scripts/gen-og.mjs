/**
 * public/og-cover.png (1200×630) 생성.
 * SNS 공유 미리보기용 대표 이미지. 브랜드 토큰 색상 사용, 텍스트만 바꾸면 재생성됨.
 * 실행: npm run gen-og  (빌드 파이프라인에는 넣지 않음 — 자주 안 바뀜)
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { Resvg } from '@resvg/resvg-js'

const C = {
  ink: '#1A1A17',
  inkMuted: '#5C5C55',
  accent: '#4FA88B',
  accentSoft: '#E5F2EC',
  accentDeep: '#2D7A60',
}

const W = 1200
const H = 630

// 로고 잎사귀 글리프 (viewBox 0 0 24 24) — 우하단 워터마크로 확대 배치
const LEAF = 'M5 19c0-8 6-14 16-14 0 10-6 16-14 16-1.5 0-2-1-2-2z'
const LEAF_STROKE = 'M5 19c3-3 6-6 11-11'

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFFFFF"/>
      <stop offset="1" stop-color="${C.accentSoft}"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="none" stroke="${C.accentSoft}" stroke-width="2"/>

  <!-- 우하단 잎사귀 워터마크 -->
  <g transform="translate(690 210) scale(24)" opacity="0.5">
    <path d="${LEAF}" fill="${C.accentSoft}" stroke="${C.accent}" stroke-width="1.4" stroke-opacity="0.55"/>
    <path d="${LEAF_STROKE}" fill="none" stroke="${C.accent}" stroke-width="1.4" stroke-linecap="round" stroke-opacity="0.55"/>
  </g>

  <!-- 로고 락업 -->
  <g transform="translate(90 96)">
    <g transform="scale(2.1)">
      <path d="${LEAF}" fill="${C.accentSoft}" stroke="${C.accent}" stroke-width="1.8"/>
      <path d="${LEAF_STROKE}" fill="none" stroke="${C.accent}" stroke-width="1.8" stroke-linecap="round"/>
    </g>
    <text x="62" y="40" font-family="Pretendard, 'Apple SD Gothic Neo', sans-serif"
      font-size="46" font-weight="800" letter-spacing="-2" fill="${C.ink}">rekit</text>
  </g>

  <!-- 헤드라인 -->
  <text x="90" y="300" font-family="Pretendard, 'Apple SD Gothic Neo', sans-serif"
    font-size="76" font-weight="800" letter-spacing="-3" fill="${C.ink}">폐업 매장 영업용 가전</text>
  <text x="90" y="392" font-family="Pretendard, 'Apple SD Gothic Neo', sans-serif"
    font-size="76" font-weight="800" letter-spacing="-3" fill="${C.accentDeep}">평균 73% 할인</text>

  <!-- 서브라인 -->
  <text x="92" y="452" font-family="Pretendard, 'Apple SD Gothic Neo', sans-serif"
    font-size="30" font-weight="500" letter-spacing="-1" fill="${C.inkMuted}">전수 검수를 마친 폐업 매장 가전을 직거래</text>

  <!-- 도메인 -->
  <circle cx="98" cy="536" r="6" fill="${C.accent}"/>
  <text x="116" y="545" font-family="Pretendard, 'Apple SD Gothic Neo', sans-serif"
    font-size="26" font-weight="600" letter-spacing="-0.5" fill="${C.accentDeep}">rekit.co.kr</text>
</svg>`

const png = new Resvg(svg, {
  fitTo: { mode: 'width', value: W },
  font: { loadSystemFonts: true, defaultFontFamily: 'Apple SD Gothic Neo' },
  background: '#FFFFFF',
}).render().asPng()

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../public/og-cover.png')
writeFileSync(out, png)
console.log(`og-cover.png written: ${png.length} bytes (${W}x${H})`)
