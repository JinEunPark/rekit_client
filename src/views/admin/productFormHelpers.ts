import type { ConditionGrade } from '@/api/admin/products'

export type { ConditionGrade }

export const CATEGORY_OPTS: { id: string; label: string }[] = [
  { id: 'REFRIGERATOR', label: '냉장고' },
  { id: 'WASHING_MACHINE', label: '세탁기' },
  { id: 'TV', label: 'TV' },
  { id: 'AIR_CONDITIONER', label: '에어컨' },
  { id: 'KITCHEN', label: '주방가전' },
  { id: 'VACUUM', label: '청소기' },
  { id: 'ETC', label: '기타' },
]

export const GRADE_DEFS: { g: ConditionGrade; label: string; desc: string; color: string; bg: string }[] = [
  { g: 'A', label: '상급', desc: '외관 거의 새것\n동작 완벽', color: 'var(--rekit-accent)', bg: 'var(--rekit-accent-soft)' },
  { g: 'B', label: '중급', desc: '사용 흔적 약간\n동작 정상', color: '#D4A23A', bg: '#F8F0DC' },
  { g: 'C', label: '하급', desc: '흠집/얼룩 다수\n동작 정상', color: '#C97A3F', bg: '#F8E8DA' },
]

export const OPERATION_OPTS = ['정상 동작', '부분 이상', '미작동']
export const DAMAGE_OPTS = ['없음', '경미', '있음']

export const VISIBILITY_OPTS: { id: 'public' | 'private'; label: string }[] = [
  { id: 'public', label: '판매중 (즉시 공개)' },
  { id: 'private', label: '비공개 (임시 저장)' },
]

export function parseNum(s: string): number {
  return Number(s.replace(/[^0-9]/g, '')) || 0
}

export function calcDiscountPct(originalStr: string, priceStr: string): number {
  const o = parseNum(originalStr)
  const p = parseNum(priceStr)
  if (!o || !p) return 0
  return Math.round((1 - p / o) * 100)
}
