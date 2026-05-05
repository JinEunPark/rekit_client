import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export type DeliveryMethod = 'direct' | 'cargo'
export type PaymentMethod = 'bank'
export type OrderStatus = '입금대기' | '결제확인요청' | '결제완료' | '준비중' | '배송중' | '배송완료' | '취소'

export interface OrderAddress {
  recipient: string
  phone: string
  zipcode: string
  address: string
  addressDetail: string
  memo?: string
}

export interface OrderLineItem {
  productId: string
  qty: number
  /** Unit price snapshot — stored so historical orders aren't affected by later price changes. */
  price: number
  title: string
  brand: string
}

export interface Order {
  id: string
  createdAt: string
  items: OrderLineItem[]
  itemsTotal: number
  shippingFee: number
  total: number
  deliveryMethod: DeliveryMethod
  paymentMethod: PaymentMethod
  /** Display label for the chosen payment method (e.g. '신용카드 · 신한 1234'). PG decides this. */
  paymentMethodLabel: string
  address: OrderAddress
  status: OrderStatus
  estimatedDelivery: string
}

const ORDERS_KEY = 'rekit.orders.v1'

function loadOrders(): Order[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(ORDERS_KEY)
    return raw ? (JSON.parse(raw) as Order[]) : []
  } catch {
    return []
  }
}

function generateOrderId(): string {
  const now = new Date()
  const yy = String(now.getFullYear() % 100).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const seq = String(Math.floor(Math.random() * 9000) + 1000)
  return `RK-${yy}${mm}${dd}${seq}`
}

function estimateDelivery(method: DeliveryMethod): string {
  const today = new Date()
  const minDays = method === 'direct' ? 1 : 2
  const maxDays = method === 'direct' ? 2 : 4
  const start = new Date(today.getTime() + minDays * 86_400_000)
  const end = new Date(today.getTime() + maxDays * 86_400_000)
  const days = '일월화수목금토'
  const fmt = (d: Date) =>
    `${d.getMonth() + 1}월 ${d.getDate()}일(${days[d.getDay()]})`
  return `${fmt(start)} ~ ${fmt(end)}`
}

export const useOrderStore = defineStore('orders', () => {
  const orders = ref<Order[]>(loadOrders())

  watch(
    orders,
    (val) => {
      if (typeof localStorage === 'undefined') return
      localStorage.setItem(ORDERS_KEY, JSON.stringify(val))
    },
    { deep: true },
  )

  function create(
    input: Omit<Order, 'id' | 'createdAt' | 'status' | 'estimatedDelivery'>,
  ): Order {
    const order: Order = {
      ...input,
      id: generateOrderId(),
      createdAt: new Date().toISOString(),
      status: '입금대기',
      estimatedDelivery: estimateDelivery(input.deliveryMethod),
    }
    orders.value = [order, ...orders.value]
    return order
  }

  function findById(id: string): Order | undefined {
    return orders.value.find((o) => o.id === id)
  }

  function setStatus(id: string, status: OrderStatus): void {
    const o = orders.value.find((x) => x.id === id)
    if (o) o.status = status
  }

  function markPaymentRequested(id: string): void {
    const o = orders.value.find((x) => x.id === id)
    if (o && o.status === '입금대기') o.status = '결제확인요청'
  }

  function approvePayment(id: string): void {
    const o = orders.value.find((x) => x.id === id)
    if (o && (o.status === '입금대기' || o.status === '결제확인요청')) {
      o.status = '결제완료'
    }
  }

  return { orders, create, findById, setStatus, markPaymentRequested, approvePayment }
})
