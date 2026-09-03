import { apiRequest } from './client'

/**
 * 결제 API. 토스페이먼츠 승인(confirm)은 시크릿 키가 필요하므로 **백엔드**가 대행합니다.
 * 프론트는 공개 clientKey 로 위젯만 열고, paymentKey/orderId/amount 를 백엔드로 넘겨
 * `/payments/confirm` 을 호출합니다. (successUrl 페이지 → 우리 백엔드 → 토스)
 */

export type PaymentMethod = 'CARD' | 'BANK' | 'KAKAO_PAY' | 'NAVER_PAY' | 'TOSS_PAY'
export type PaymentStatus = 'READY' | 'PAID' | 'CANCELLED' | 'PARTIAL_CANCELLED' | 'FAILED'

export interface PaymentInitRequest {
  order_number: string
  method: PaymentMethod
}

export interface PaymentInitResponse {
  payment_id: number
  order_number: string
  amount: number
  customer_name: string
}

export interface PaymentConfirmRequest {
  payment_key: string
  /** 토스가 orderId 라 부르는 값 = 우리 order_number */
  order_id: string
  amount: number
}

export interface PaymentConfirmResponse {
  order_number: string
  status: PaymentStatus
  paid_at: string | null
  card_company: string | null
  card_last4: string | null
  installment_months: number | null
}

/** 주문 확정 후 결제 레코드 생성 → 위젯에 넣을 확정 금액을 돌려받음. */
export function initPayment(body: PaymentInitRequest): Promise<PaymentInitResponse> {
  return apiRequest<PaymentInitResponse>('/payments/init', { method: 'POST', body, auth: true })
}

/**
 * 결제 승인. successUrl 페이지에서 받은 값을 그대로 넘깁니다.
 * 에러: PAYMENT_FAILED(422) · ORDER_NOT_FOUND(404) · PAYMENT_GATEWAY_UNKNOWN(502).
 * 502 는 "결제 결과 확인 중" 이라 재시도가 아니라 안내만 — 주문 상태는 웹훅으로 반영됩니다.
 */
export function confirmPayment(body: PaymentConfirmRequest): Promise<PaymentConfirmResponse> {
  return apiRequest<PaymentConfirmResponse>('/payments/confirm', { method: 'POST', body, auth: true })
}
