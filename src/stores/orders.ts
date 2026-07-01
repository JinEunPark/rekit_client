import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import {
  listOrders,
  getOrder,
  createOrder,
  cancelOrder as apiCancelOrder,
  requestRefund as apiRequestRefund,
  type OrderResponse,
  type CreateOrderRequest,
} from '@/api/orders'

export type { OrderStatus, ShipmentMethod } from '@/api/orders'

export interface OrderItem {
  id: number
  productId: number
  titleSnapshot: string
  brandSnapshot: string | null
  imageUrlSnapshot: string | null
  priceSnapshot: number
  quantity: number
  subtotal: number
}

export interface Order {
  orderNumber: string
  status: import('@/api/orders').OrderStatus
  totalAmount: number
  shippingFee: number
  discountAmount: number
  shippingMethod: import('@/api/orders').ShipmentMethod
  recipientName: string
  recipientPhone: string
  address1: string
  address2: string | null
  memo: string | null
  items: OrderItem[]
  paidAt: string | null
  cancelledAt: string | null
  createdAt: string
}

function fromServer(r: OrderResponse): Order {
  return {
    orderNumber: r.order_number,
    status: r.status,
    totalAmount: r.total_amount,
    shippingFee: r.shipping_fee,
    discountAmount: r.discount_amount,
    shippingMethod: r.shipping_method,
    recipientName: r.recipient_name,
    recipientPhone: r.recipient_phone,
    address1: r.address1,
    address2: r.address2,
    memo: r.memo,
    items: r.items.map((i) => ({
      id: i.id,
      productId: i.product_id,
      titleSnapshot: i.product_title_snapshot,
      brandSnapshot: i.product_brand_snapshot,
      imageUrlSnapshot: i.product_image_url_snapshot,
      priceSnapshot: i.price_snapshot,
      quantity: i.quantity,
      subtotal: i.subtotal,
    })),
    paidAt: r.paid_at,
    cancelledAt: r.cancelled_at,
    createdAt: r.created_at,
  }
}

export const useOrderStore = defineStore('orders', () => {
  const auth = useAuthStore()
  const orders = ref<Order[]>([])
  const total = ref(0)
  const loading = ref(false)

  watch(
    () => auth.isAuthenticated,
    (loggedIn, wasLoggedIn) => {
      if (loggedIn && !wasLoggedIn) void loadFromServer()
      else if (!loggedIn && wasLoggedIn) {
        orders.value = []
        total.value = 0
      }
    },
  )

  if (typeof window !== 'undefined' && auth.isAuthenticated) void loadFromServer()

  async function loadFromServer(page = 1) {
    loading.value = true
    try {
      const res = await listOrders(page)
      orders.value = page === 1
        ? res.items.map(fromServer)
        : [...orders.value, ...res.items.map(fromServer)]
      total.value = res.meta.total
    } catch {
      // 서버 오류 시 현재 상태 유지
    } finally {
      loading.value = false
    }
  }

  async function fetchOrder(orderNumber: string): Promise<Order | null> {
    try {
      const res = await getOrder(orderNumber)
      const order = fromServer(res)
      const idx = orders.value.findIndex((o) => o.orderNumber === orderNumber)
      if (idx !== -1) orders.value[idx] = order
      else orders.value.unshift(order)
      return order
    } catch {
      return null
    }
  }

  function findByNumber(orderNumber: string): Order | undefined {
    return orders.value.find((o) => o.orderNumber === orderNumber)
  }

  async function create(input: CreateOrderRequest): Promise<Order> {
    const res = await createOrder(input)
    const order = fromServer(res)
    orders.value.unshift(order)
    total.value++
    return order
  }

  async function cancel(orderNumber: string): Promise<void> {
    const res = await apiCancelOrder(orderNumber)
    const updated = fromServer(res)
    const idx = orders.value.findIndex((o) => o.orderNumber === orderNumber)
    if (idx !== -1) orders.value[idx] = updated
  }

  async function refund(orderNumber: string): Promise<void> {
    await apiRequestRefund(orderNumber)
    void loadFromServer()
  }

  return { orders, total, loading, loadFromServer, fetchOrder, findByNumber, create, cancel, refund }
})
