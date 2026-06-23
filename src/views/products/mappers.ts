import type {
  ProductDetailResponse,
  ProductResponse,
} from '@/api/catalog'
import type { ApplianceKind, Product, Tone } from '@/data/products'
import { useCategoryStore } from '@/stores/categories'

const APPLIANCE_KINDS = new Set<ApplianceKind>([
  'fridge',
  'washer',
  'tv',
  'aircon',
  'microwave',
  'vacuum',
])

/** 백엔드 icon 값이 ApplianceKind 인 경우만 그대로 사용, 아니면 microwave 폴백. */
function kindFromIcon(icon: string | undefined): ApplianceKind {
  if (icon && APPLIANCE_KINDS.has(icon as ApplianceKind)) return icon as ApplianceKind
  return 'microwave'
}

const TONE_CYCLE: Tone[] = ['mint', 'sage', 'sand', 'stone', 'cool', 'cream']

export function toneOf(id: number): Tone {
  return TONE_CYCLE[id % TONE_CYCLE.length] as Tone
}

export function toProduct(p: ProductResponse): Product {
  const store = useCategoryStore()
  const cat = store.byId(p.category)
  return {
    id: String(p.id),
    kind: kindFromIcon(cat?.icon),
    tone: toneOf(p.id),
    brand: p.brand ?? '',
    model: '',
    title: p.title,
    year: '',
    grade: p.condition_grade,
    price: p.price,
    original: p.original_price ?? p.price,
    warranty: p.warranty_works,
    stock: 1,
    category: cat?.label ?? '',
    categoryId: p.category,
    tag: p.warranty_works ? '동작보증' : undefined,
    thumbnailUrl: p.thumbnail_url ?? undefined,
  }
}

export function toDetailProduct(p: ProductDetailResponse): Product {
  return {
    ...toProduct(p),
    model: p.model_name ?? '',
    year: p.year_estimate ? `${p.year_estimate}년식` : '',
    stock: p.stock,
  }
}
