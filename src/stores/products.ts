import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { PRODUCTS, discountPct, type ApplianceKind, type Grade, type Product } from '@/data/products'

export type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'discount'

export interface CategoryDef {
  slug: string
  label: string
  /** Which `Product.kind` values fall under this category. */
  kinds: ApplianceKind[] | null
}

/** Categories users can filter by. `kinds: null` → match everything. */
export const CATEGORIES: CategoryDef[] = [
  { slug: 'all', label: '전체', kinds: null },
  { slug: 'fridge', label: '냉장고', kinds: ['fridge'] },
  { slug: 'washer', label: '세탁기', kinds: ['washer'] },
  { slug: 'tv', label: 'TV', kinds: ['tv'] },
  { slug: 'aircon', label: '에어컨', kinds: ['aircon'] },
  { slug: 'kitchen', label: '주방가전', kinds: ['microwave'] },
  { slug: 'cleaner', label: '청소기', kinds: ['vacuum'] },
]

export const SORTS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: '최신순' },
  { key: 'price-asc', label: '낮은 가격순' },
  { key: 'price-desc', label: '높은 가격순' },
  { key: 'discount', label: '할인율 높은순' },
]

export interface ProductFilters {
  category: string
  sort: SortKey
  grades: Grade[]
  warrantyOnly: boolean
  q: string
}

export const DEFAULT_FILTERS: ProductFilters = {
  category: 'all',
  sort: 'newest',
  grades: [],
  warrantyOnly: false,
  q: '',
}

function matchesCategory(p: Product, slug: string): boolean {
  if (!slug || slug === 'all') return true
  const def = CATEGORIES.find((c) => c.slug === slug)
  if (!def || def.kinds === null) return true
  return def.kinds.includes(p.kind)
}

export function applyFilters(items: Product[], f: ProductFilters): Product[] {
  let result = items

  result = result.filter((p) => matchesCategory(p, f.category))

  if (f.grades.length > 0) {
    result = result.filter((p) => f.grades.includes(p.grade))
  }

  if (f.warrantyOnly) {
    result = result.filter((p) => p.warranty)
  }

  if (f.q.trim()) {
    const q = f.q.trim().toLowerCase()
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q),
    )
  }

  return [...result].sort((a, b) => {
    switch (f.sort) {
      case 'price-asc':
        return a.price - b.price
      case 'price-desc':
        return b.price - a.price
      case 'discount':
        return discountPct(b) - discountPct(a)
      case 'newest':
      default:
        return 0
    }
  })
}

export const useProductStore = defineStore('products', () => {
  const all = ref<Product[]>(PRODUCTS)
  const totalCount = computed(() => all.value.length)

  function findById(id: string): Product | undefined {
    return all.value.find((p) => p.id === id)
  }

  function upsert(newItems: Product[]) {
    for (const p of newItems) {
      const idx = all.value.findIndex((x) => x.id === p.id)
      if (idx >= 0) {
        all.value[idx] = p
      } else {
        all.value.push(p)
      }
    }
  }

  return { all, totalCount, findById, upsert }
})
