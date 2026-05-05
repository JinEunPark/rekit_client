import type { OrderStatus } from './orders'

export type StatusTone = 'info' | 'a' | 'accent' | 'danger' | 'neutral'

export function statusTone(s: OrderStatus): StatusTone {
  if (s === '입금대기') return 'neutral'
  if (s === '결제확인요청') return 'a'
  if (s === '결제완료') return 'info'
  if (s === '준비중') return 'a'
  if (s === '배송중') return 'info'
  if (s === '배송완료') return 'accent'
  return 'danger'
}

export function isAwaitingDeposit(s: OrderStatus): boolean {
  return s === '입금대기' || s === '결제확인요청'
}
