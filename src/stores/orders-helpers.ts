import type { OrderStatus } from './orders'

export type StatusTone = 'info' | 'a' | 'accent' | 'danger' | 'neutral'

export function statusLabel(s: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    PENDING: '결제대기',
    PAID: '결제완료',
    PREPARING: '준비중',
    SHIPPING: '배송중',
    DELIVERED: '배송완료',
    CANCELLED: '취소',
    REFUNDED: '환불완료',
  }
  return map[s]
}

export function statusTone(s: OrderStatus): StatusTone {
  if (s === 'PENDING') return 'neutral'
  if (s === 'PAID' || s === 'SHIPPING') return 'info'
  if (s === 'PREPARING') return 'a'
  if (s === 'DELIVERED') return 'accent'
  return 'danger' // CANCELLED, REFUNDED
}
