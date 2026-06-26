import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import {
  getCart,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  deleteSelectedItems,
  clearCart,
  syncCart,
  type CartResponse,
} from '@/api/cart'
import { getProduct } from '@/api/catalog'
import { toDetailProduct } from '@/views/products/mappers'
import type { Product } from '@/data/products'

export interface CartItem {
  productId: string
  qty: number
  selected: boolean
}

const STORAGE_KEY = 'rekit.cart.v1'

/** productId 문자열을 숫자로 변환. 실패 시 null. */
function toNumId(productId: string): number | null {
  const n = parseInt(productId, 10)
  return isNaN(n) ? null : n
}

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
  const auth = useAuthStore()

  const items = ref<CartItem[]>(loadFromStorage())

  const count = computed(() => items.value.reduce((sum, i) => sum + i.qty, 0))
  const lineCount = computed(() => items.value.length)

  // --- localStorage sync (비로그인 전용) ---

  watch(
    items,
    (val) => {
      if (typeof localStorage === 'undefined') return
      if (auth.isAuthenticated) return
      if (val.length === 0) localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    },
    { deep: true },
  )

  // --- 서버 연동 ---

  function applyServerCart(res: CartResponse) {
    items.value = res.items.map((item) => ({
      productId: String(item.product.id),
      qty: item.quantity,
      selected: item.selected,
    }))
    if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY)
  }

  async function loadServerCart() {
    try {
      applyServerCart(await getCart())
    } catch { /* localStorage 아이템 유지 */ }
  }

  async function syncOnLogin() {
    try {
      const syncable = items.value.flatMap((i) => {
        const id = toNumId(i.productId)
        return id !== null && i.qty > 0 ? [{ product_id: id, qty: i.qty }] : []
      })
      const res = syncable.length > 0 ? await syncCart(syncable) : await getCart()
      applyServerCart(res)
    } catch { /* 게스트 아이템 유지 */ }
  }

  /** 장바구니 페이지 진입 시 호출. 현재 아이템의 상품 정보를 서버에서 병렬 조회해 반환. */
  async function loadProducts(): Promise<Record<string, Product>> {
    const map: Record<string, Product> = {}
    await Promise.all(
      items.value.flatMap((i) => {
        const id = toNumId(i.productId)
        return id === null ? [] : [
          getProduct(id)
            .then((p) => { map[String(id)] = toDetailProduct(p) })
            .catch(() => undefined),
        ]
      }),
    )
    return map
  }

  if (typeof window !== 'undefined' && auth.isAuthenticated) loadServerCart()

  watch(
    () => auth.isAuthenticated,
    (loggedIn, wasLoggedIn) => {
      if (loggedIn && !wasLoggedIn) syncOnLogin()
      else if (!loggedIn && wasLoggedIn) items.value = []
    },
  )

  // --- mutations ---

  async function add(productId: string, qty = 1) {
    const existing = items.value.find((i) => i.productId === productId)
    if (existing) {
      existing.qty += qty
      existing.selected = true
    } else {
      items.value.push({ productId, qty, selected: true })
    }
    if (auth.isAuthenticated) {
      const n = toNumId(productId)
      if (n !== null) {
        try {
          applyServerCart(await addCartItem(n, qty))
        } catch { /* 낙관적 상태 유지 */ }
      }
    }
  }

  async function remove(productId: string) {
    items.value = items.value.filter((i) => i.productId !== productId)
    if (auth.isAuthenticated) {
      const n = toNumId(productId)
      if (n !== null) deleteCartItem(n).catch(() => undefined)
    }
  }

  async function setQty(productId: string, qty: number) {
    const clamped = Math.max(1, qty)
    const item = items.value.find((i) => i.productId === productId)
    if (item) item.qty = clamped
    if (auth.isAuthenticated) {
      const n = toNumId(productId)
      if (n !== null) updateCartItem(n, { qty: clamped }).catch(() => undefined)
    }
  }

  function toggleSelected(productId: string) {
    const item = items.value.find((i) => i.productId === productId)
    if (item) item.selected = !item.selected
  }

  function setAllSelected(selected: boolean) {
    items.value.forEach((i) => (i.selected = selected))
  }

  async function removeAllSelected() {
    if (!items.value.some((i) => i.selected)) return
    const keep = items.value.filter((i) => !i.selected)
    if (auth.isAuthenticated) {
      try {
        await deleteSelectedItems()
        items.value = keep
        return
      } catch { /* fall through */ }
    }
    items.value = keep
  }

  async function clear() {
    items.value = []
    if (auth.isAuthenticated) clearCart().catch(() => undefined)
  }

  function has(productId: string) {
    return items.value.some((i) => i.productId === productId)
  }

  return {
    items,
    count,
    lineCount,
    loadProducts,
    add,
    remove,
    setQty,
    toggleSelected,
    setAllSelected,
    removeAllSelected,
    clear,
    has,
  }
})
