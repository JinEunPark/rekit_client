import { ref, type Ref } from 'vue'
import {
  listProducts,
  type BackendCategory,
  type ProductListParams,
  type ProductSort,
} from '@/api/catalog'
import type { Grade, Product } from '@/data/products'
import type { ProductFilters, SortKey } from '@/stores/products'
import { useCategoryStore } from '@/stores/categories'
import { toProduct } from './mappers'

const SORT_TO_BACKEND: Record<SortKey, ProductSort> = {
  newest: 'latest',
  'price-asc': 'price_asc',
  'price-desc': 'price_desc',
  // 백엔드는 discount 정렬 미지원 — 최신순으로 받은 뒤 클라에서 재정렬.
  discount: 'latest',
}

function discountPctOf(p: Product): number {
  if (!p.original || p.original <= 0) return 0
  return Math.round((1 - p.price / p.original) * 100)
}

function clientSidePostFilter(items: Product[], grades: Grade[], sort: SortKey): Product[] {
  let result = items
  if (grades.length > 1) {
    // 백엔드는 단일 grade 만 받으므로 다중선택 시 서버 필터를 생략하고 클라에서 매칭.
    result = result.filter((p) => grades.includes(p.grade))
  }
  if (sort === 'discount') {
    result = [...result].sort((a, b) => discountPctOf(b) - discountPctOf(a))
  }
  return result
}

export interface ListViewModel {
  items: Ref<Product[]>
  total: Ref<number>
  loading: Ref<boolean>
  errorMessage: Ref<string>
  load: (filters: ProductFilters) => Promise<void>
}

export function useListViewModel(): ListViewModel {
  const categoryStore = useCategoryStore()
  const items = ref<Product[]>([])
  const total = ref(0)
  const loading = ref(false)
  const errorMessage = ref('')

  // 빠른 입력(필터 칩 연속 클릭, 검색 타이핑)에서 늦은 응답이 새 응답을 덮어쓰지 않도록
  // 마지막 요청만 반영한다.
  let requestSeq = 0

  function backendCategoryFor(slug: string): BackendCategory | undefined {
    if (!slug || slug === 'all') return undefined
    return categoryStore.bySlug(slug)?.id
  }

  async function load(filters: ProductFilters) {
    const seq = ++requestSeq
    loading.value = true
    errorMessage.value = ''

    try {
      await categoryStore.load()
      const params: ProductListParams = {
        category: backendCategoryFor(filters.category),
        grade: filters.grades.length === 1 ? filters.grades[0] : undefined,
        warranty: filters.warrantyOnly || undefined,
        q: filters.q.trim() || undefined,
        sort: SORT_TO_BACKEND[filters.sort],
        page: 1,
        size: 100,
      }

      const res = await listProducts(params)
      if (seq !== requestSeq) return
      const mapped = res.items.map(toProduct)
      items.value = clientSidePostFilter(mapped, filters.grades, filters.sort)
      total.value = res.meta.total
    } catch (err) {
      if (seq !== requestSeq) return
      errorMessage.value = err instanceof Error ? err.message : '상품을 불러오지 못했어요.'
      items.value = []
      total.value = 0
    } finally {
      if (seq === requestSeq) loading.value = false
    }
  }

  return { items, total, loading, errorMessage, load }
}
