import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { getFavorites, addFavorite, removeFavorite } from '@/api/wishlist'
import { toNumId } from './utils'

const STORAGE_KEY = 'rekit.wishlist.v1'

function loadFromStorage(): string[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

export const useWishlistStore = defineStore('wishlist', () => {
  const auth = useAuthStore()

  const ids = ref<string[]>(loadFromStorage())

  // --- localStorage sync (비로그인 전용) ---
  watch(
    ids,
    (val) => {
      if (typeof localStorage === 'undefined') return
      if (auth.isAuthenticated) return
      if (val.length === 0) localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    },
    { deep: true },
  )

  const count = computed(() => ids.value.length)

  // --- 서버 연동 ---

  async function loadServerWishlist() {
    try {
      const items = await getFavorites()
      ids.value = items.map((item) => String(item.product_id))
      if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY)
    } catch {
      // 서버 오류 시 localStorage 상태 유지
    }
  }

  async function syncOnLogin() {
    try {
      const localIds = [...ids.value]
      const serverItems = await getFavorites()
      const serverIds = new Set(serverItems.map((i) => String(i.product_id)))
      const toSync = localIds.filter((id) => !serverIds.has(id))
      await Promise.all(
        toSync
          .map(toNumId)
          .filter((n): n is number => n !== null)
          .map((n) => addFavorite(n).catch(() => undefined)),
      )
      ids.value = [...serverItems.map((i) => String(i.product_id)), ...toSync]
      if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY)
    } catch {
      // 동기화 실패 시 로컬 상태 유지
    }
  }

  if (typeof window !== 'undefined' && auth.isAuthenticated) void loadServerWishlist()

  watch(
    () => auth.isAuthenticated,
    (loggedIn, wasLoggedIn) => {
      if (loggedIn && !wasLoggedIn) void syncOnLogin()
      else if (!loggedIn && wasLoggedIn) ids.value = []
    },
  )

  // --- mutations ---

  function has(productId: string) {
    return ids.value.includes(productId)
  }

  async function add(productId: string) {
    if (!has(productId)) ids.value.push(productId)
    if (auth.isAuthenticated) {
      const n = toNumId(productId)
      if (n !== null) addFavorite(n).catch(() => undefined)
    }
  }

  async function remove(productId: string) {
    const i = ids.value.indexOf(productId)
    if (i >= 0) ids.value.splice(i, 1)
    if (auth.isAuthenticated) {
      const n = toNumId(productId)
      if (n !== null) removeFavorite(n).catch(() => undefined)
    }
  }

  function toggle(productId: string) {
    if (has(productId)) void remove(productId)
    else void add(productId)
  }

  function clear() {
    ids.value = []
  }

  return { ids, count, has, add, remove, toggle, clear }
})
