/**
 * 결제 승인 결과(카드사·할부 등)를 결제 리턴 페이지(`/checkout/payment`)
 * → 완료 페이지(`/checkout/complete`)로 넘기기 위한 sessionStorage 핸드오프.
 *
 * 주문 상태(PAID)는 백엔드가 갱신하므로 완료 페이지가 다시 조회하면 되지만,
 * "신한카드 1234 · 일시불" 같은 카드 상세는 confirm 응답에만 있어서 직접 전달합니다.
 */
import type { PaymentConfirmResponse } from '@/api/payments'

const KEY = 'rekit.checkout.paymentResult.v1'

interface Stored extends PaymentConfirmResponse {
  savedAt: number
}

export function savePaymentResult(result: PaymentConfirmResponse): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...result, savedAt: Date.now() }))
  } catch {
    // storage 차단 — 완료 화면은 주문 상태 기반 폴백으로 동작
  }
}

/** 주문번호가 일치하고 10분 이내면 반환. 그 외엔 null. */
export function readPaymentResult(orderNumber: string): PaymentConfirmResponse | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Stored
    if (parsed.order_number !== orderNumber) return null
    if (Date.now() - parsed.savedAt > 10 * 60 * 1000) return null
    return parsed
  } catch {
    return null
  }
}

export function clearPaymentResult(): void {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* noop */
  }
}
