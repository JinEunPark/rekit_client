/**
 * public/rekit-preview.png (1200×630) 생성.
 * 노션 북마크·슬랙·디스코드 등 "임베드 카드"용 미리보기 이미지.
 * 이런 카드는 이미지를 작게(노션 ≈250×106) + 가운데 기준 크롭으로 보여주므로
 * 로고와 짧은 한 줄만 중앙 안전영역(세로 140~490)에 배치한다.
 * 실행: npm run gen-preview
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
const FONT = "Pretendard, 'Apple SD Gothic Neo', sans-serif"

const LEAF = 'M5 19c0-8 6-14 16-14 0 10-6 16-14 16-1.5 0-2-1-2-2z'
const LEAF_STROKE = 'M5 19c3-3 6-6 11-11'

const leaf = (x, y, s, opacity = 1, sw = 1.8) => `
  <g transform="translate(${x} ${y}) scale(${s})" opacity="${opacity}">
    <path d="${LEAF}" fill="${C.accentSoft}" stroke="${C.accent}" stroke-width="${sw}"/>
    <path d="${LEAF_STROKE}" fill="none" stroke="${C.accent}" stroke-width="${sw}" stroke-linecap="round"/>
  </g>`

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0" stop-color="#FFFFFF"/>
      <stop offset="1" stop-color="${C.accentSoft}"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- 장식 잎사귀 (모서리 — 크롭돼도 무방) -->
  ${leaf(-120, 330, 16, 0.35, 1.2)}
  ${leaf(930, -150, 16, 0.35, 1.2)}

  <!-- 로고 락업 (중앙) : 잎 72px + 간격 + 워드마크 -->
  <g transform="translate(${W / 2 - 230} 150)">
    ${leaf(0, 0, 5.2)}
    <text x="148" y="108" font-family="${FONT}" font-size="150" font-weight="800"
      letter-spacing="-6" fill="${C.ink}">rekit</text>
  </g>

  <!-- 한 줄 카피 -->
  <text x="${W / 2}" y="372" text-anchor="middle" font-family="${FONT}" font-size="50"
    font-weight="700" letter-spacing="-2" fill="${C.ink}">폐업 매장 영업용 가전 <tspan fill="${C.accentDeep}">평균 73% 할인</tspan></text>

  <!-- 도메인 pill -->
  <g transform="translate(${W / 2 - 120} 418)">
    <rect width="240" height="60" rx="30" fill="#FFFFFF" stroke="${C.accent}" stroke-opacity="0.45" stroke-width="2"/>
    <circle cx="56" cy="30" r="7" fill="${C.accent}"/>
    <text x="138" y="40" text-anchor="middle" font-family="${FONT}" font-size="28" font-weight="600"
      letter-spacing="-0.5" fill="${C.accentDeep}">rekit.co.kr</text>
  </g>
</svg>`

const png = new Resvg(svg, {
  fitTo: { mode: 'width', value: W },
  font: { loadSystemFonts: true, defaultFontFamily: 'Apple SD Gothic Neo' },
  background: '#FFFFFF',
}).render().asPng()

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../public/rekit-preview.png')
writeFileSync(out, png)
console.log(`rekit-preview.png written: ${png.length} bytes (${W}x${H})`)
