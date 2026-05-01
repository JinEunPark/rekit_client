// rekit design tokens — colors, radii, shadows, type scale.
// Faithful port of REKIT constants from the design package.

export const REKIT = {
  color: {
    bg: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceMuted: '#F4F4F5',
    border: '#E8E8EA',
    borderStrong: '#D9D9DC',
    ink: '#1A1A17',
    inkMuted: '#5C5C55',
    inkSubtle: '#8E8E85',
    inkPlaceholder: '#B5B5AB',
    accent: '#4FA88B',
    accentSoft: '#E5F2EC',
    accentDeep: '#2D7A60',
    accentInk: '#1F4E3D',
    gradeA: '#4FA88B',
    gradeAbg: '#E5F2EC',
    gradeB: '#D4A23A',
    gradeBbg: '#F8F0DC',
    gradeC: '#C97A3F',
    gradeCbg: '#F8E8DA',
    danger: '#D24E4E',
    dangerBg: '#FBEAEA',
    info: '#3B7BC9',
    infoBg: '#E5EEF9',
  },
  radius: { sm: '8px', md: '12px', lg: '16px', xl: '20px', xxl: '28px' },
  shadow: {
    card: '0 1px 2px rgba(20,20,15,0.04), 0 2px 8px rgba(20,20,15,0.04)',
    pop: '0 4px 16px rgba(20,20,15,0.08), 0 12px 40px rgba(20,20,15,0.06)',
  },
  font: {
    sans: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', system-ui, sans-serif",
    serif: "'Noto Serif KR', 'Source Han Serif K', serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },
} as const

export const won = (n: number) => n.toLocaleString('ko-KR') + '원'
