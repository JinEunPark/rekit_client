export type ApplianceKind = 'fridge' | 'washer' | 'tv' | 'aircon' | 'microwave' | 'vacuum'
export type Tone = 'mint' | 'sage' | 'sand' | 'stone' | 'cool' | 'cream'
export type Grade = 'A' | 'B' | 'C'

export interface Product {
  id: string
  kind: ApplianceKind
  tone: Tone
  brand: string
  model: string
  title: string
  year: string
  grade: Grade
  price: number
  original: number
  warranty: boolean
  stock: number
  category: string
  categoryId?: string
  tag?: string
  thumbnailUrl?: string
}

export const PRODUCTS: Product[] = [
  { id: 'p1', kind: 'fridge', tone: 'mint',  brand: '삼성', model: 'RT38K5982SL', title: '삼성 양문형 냉장고 384L', year: '2021년식', grade: 'A', price: 180000, original: 1290000, warranty: true, stock: 1, category: '냉장고', tag: '동작보증' },
  { id: 'p2', kind: 'washer', tone: 'cool',  brand: 'LG', model: 'F21VDU', title: 'LG 트롬 드럼세탁기 21kg', year: '2020년식', grade: 'B', price: 240000, original: 1690000, warranty: true, stock: 1, category: '세탁기', tag: '인기' },
  { id: 'p3', kind: 'tv',     tone: 'stone', brand: '삼성', model: 'KU55UA8000', title: '삼성 크리스탈 UHD TV 55형', year: '2022년식', grade: 'A', price: 290000, original: 1490000, warranty: true, stock: 2, category: 'TV', tag: '신규입고' },
  { id: 'p4', kind: 'aircon', tone: 'cool',  brand: '캐리어', model: 'CSV-Q187SR', title: '캐리어 스탠드 에어컨 18평', year: '2019년식', grade: 'B', price: 320000, original: 1890000, warranty: true, stock: 1, category: '에어컨' },
  { id: 'p5', kind: 'microwave', tone: 'sand', brand: '쿠쿠', model: 'CMW-L201HM', title: '쿠쿠 전자레인지 20L', year: '2022년식', grade: 'A', price: 38000, original: 129000, warranty: true, stock: 3, category: '주방가전' },
  { id: 'p6', kind: 'vacuum', tone: 'sage', brand: 'LG', model: 'A9N-CORE', title: 'LG 코드제로 무선청소기', year: '2021년식', grade: 'C', price: 95000, original: 690000, warranty: false, stock: 1, category: '주방가전', tag: '외관용' },
  { id: 'p7', kind: 'fridge', tone: 'cream', brand: 'LG', model: 'B602S55', title: 'LG 디오스 김치냉장고 600L', year: '2020년식', grade: 'B', price: 220000, original: 1490000, warranty: true, stock: 1, category: '냉장고' },
  { id: 'p8', kind: 'tv',     tone: 'stone', brand: 'LG', model: 'OLED48A2', title: 'LG OLED TV 48형', year: '2022년식', grade: 'A', price: 480000, original: 2190000, warranty: true, stock: 1, category: 'TV', tag: '베스트' },
]

export const CATEGORIES = [
  { id: 'all',    label: '전체',     icon: 'grid' as const },
  { id: 'fridge', label: '냉장고',   icon: 'box' as const },
  { id: 'washer', label: '세탁기',   icon: 'refresh' as const },
  { id: 'tv',     label: 'TV',       icon: 'eye' as const },
  { id: 'aircon', label: '에어컨',   icon: 'leaf' as const },
  { id: 'kitchen',label: '주방가전', icon: 'home' as const },
  { id: 'etc',    label: '기타',     icon: 'menu' as const },
]

export const discountPct = (p: Product) => Math.round((1 - p.price / p.original) * 100)
