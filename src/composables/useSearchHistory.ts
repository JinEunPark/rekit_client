import { ref } from 'vue'

const STORAGE_KEY = 'rekit.search.recent.v1'
const MAX = 10

function load(): string[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === 'string').slice(0, MAX)
      : []
  } catch {
    return []
  }
}

// Module-level singleton — all consumers (SearchDropdown, SearchView) share state.
const recents = ref<string[]>(load())

function persist() {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recents.value))
}

function add(term: string) {
  const t = term.trim()
  if (!t) return
  recents.value = [t, ...recents.value.filter((r) => r !== t)].slice(0, MAX)
  persist()
}

function remove(term: string) {
  recents.value = recents.value.filter((r) => r !== term)
  persist()
}

function clearAll(askConfirm = true) {
  if (recents.value.length === 0) return
  if (askConfirm && typeof window !== 'undefined') {
    if (!window.confirm('최근 검색어를 모두 삭제할까요?')) return
  }
  recents.value = []
  persist()
}

export function useSearchHistory() {
  return { recents, add, remove, clearAll }
}

/** Mock — replace with `GET /products/popular-keywords` later. */
export const POPULAR_KEYWORDS: string[] = [
  '삼성 냉장고',
  'LG 트롬',
  'OLED TV',
  '스탠드 에어컨',
  '쿠쿠 전자레인지',
  '무선청소기',
  'A급 동작보증',
  '직배송',
]
