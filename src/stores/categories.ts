import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getCategories, type BackendCategory, type CategoryMetaItem } from '@/api/catalog'

export interface AppCategory {
  id: BackendCategory
  label: string
  /** Backend 가 내려주는 아이콘 키 ("fridge", "vacuum", "menu" 등). */
  icon: string
  sortOrder: number
  /** URL/라우팅용 lowercase id. */
  slug: string
}

/** 홈 그리드·목록 칩 마지막에 붙는 합성 "전체" 엔트리. id 는 sentinel. */
export interface NavAllEntry {
  id: 'ALL'
  label: '전체'
  icon: 'grid'
  sortOrder: number
  slug: 'all'
}

export type NavCategory = AppCategory | NavAllEntry

const ALL_NAV: NavAllEntry = {
  id: 'ALL',
  label: '전체',
  icon: 'grid',
  sortOrder: Number.POSITIVE_INFINITY,
  slug: 'all',
}

function toAppCategory(c: CategoryMetaItem): AppCategory {
  return {
    id: c.id,
    label: c.label,
    icon: c.icon,
    sortOrder: c.sort_order,
    slug: c.id.toLowerCase(),
  }
}

export const useCategoryStore = defineStore('categories', () => {
  const items = ref<AppCategory[]>([])
  const loaded = ref(false)
  const loading = ref(false)
  let inFlight: Promise<void> | null = null

  /** 한 번만 fetch. 동시 호출 합쳐서 단일 promise 공유. */
  async function load(): Promise<void> {
    if (loaded.value) return
    if (inFlight) return inFlight
    loading.value = true
    inFlight = (async () => {
      try {
        const res = await getCategories()
        items.value = res
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(toAppCategory)
        loaded.value = true
      } finally {
        loading.value = false
        inFlight = null
      }
    })()
    return inFlight
  }

  function byId(id: BackendCategory): AppCategory | undefined {
    return items.value.find((c) => c.id === id)
  }

  function bySlug(slug: string): AppCategory | undefined {
    return items.value.find((c) => c.slug === slug)
  }

  function labelFor(id: BackendCategory): string {
    return byId(id)?.label ?? ''
  }

  /** 홈 그리드 / 목록 칩에서 "전체" 까지 포함된 표시 순서. */
  const nav = computed<NavCategory[]>(() => [...items.value, ALL_NAV])

  return { items, loaded, loading, load, byId, bySlug, labelFor, nav }
})
