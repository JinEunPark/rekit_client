import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'rekit.wishlist.v1'

function load(): string[] {
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
  const ids = ref<string[]>(load())

  watch(
    ids,
    (val) => {
      if (typeof localStorage === 'undefined') return
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    },
    { deep: true },
  )

  const count = computed(() => ids.value.length)

  function has(productId: string) {
    return ids.value.includes(productId)
  }

  function add(productId: string) {
    if (!has(productId)) ids.value.push(productId)
  }

  function remove(productId: string) {
    const i = ids.value.indexOf(productId)
    if (i >= 0) ids.value.splice(i, 1)
  }

  function toggle(productId: string) {
    if (has(productId)) remove(productId)
    else add(productId)
  }

  function clear() {
    ids.value = []
  }

  return { ids, count, has, add, remove, toggle, clear }
})
