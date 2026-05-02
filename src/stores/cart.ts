import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

export interface CartItem {
  productId: string
  qty: number
  /** UI selection state for the cart page (전체 선택 / 부분 결제). */
  selected: boolean
}

const STORAGE_KEY = 'rekit.cart.v1'

function loadFromStorage(): CartItem[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(loadFromStorage())

  watch(
    items,
    (val) => {
      if (typeof localStorage === 'undefined') return
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    },
    { deep: true },
  )

  const count = computed(() => items.value.reduce((sum, i) => sum + i.qty, 0))
  const lineCount = computed(() => items.value.length)

  function add(productId: string, qty = 1) {
    const existing = items.value.find((i) => i.productId === productId)
    if (existing) {
      existing.qty += qty
      existing.selected = true
    } else {
      items.value.push({ productId, qty, selected: true })
    }
  }

  function remove(productId: string) {
    const idx = items.value.findIndex((i) => i.productId === productId)
    if (idx >= 0) items.value.splice(idx, 1)
  }

  function setQty(productId: string, qty: number) {
    const item = items.value.find((i) => i.productId === productId)
    if (item) item.qty = Math.max(1, qty)
  }

  function toggleSelected(productId: string) {
    const item = items.value.find((i) => i.productId === productId)
    if (item) item.selected = !item.selected
  }

  function setAllSelected(selected: boolean) {
    items.value.forEach((i) => (i.selected = selected))
  }

  function clear() {
    items.value = []
  }

  function has(productId: string) {
    return items.value.some((i) => i.productId === productId)
  }

  return {
    items,
    count,
    lineCount,
    add,
    remove,
    setQty,
    toggleSelected,
    setAllSelected,
    clear,
    has,
  }
})
