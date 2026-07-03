import { apiRequest } from '@/api/client'

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

export function initPayment(body: PaymentInitRequest): Promise<PaymentInitResponse> {
  return apiRequest<PaymentInitResponse>('/payments/init', { method: 'POST', body, auth: true })
}

export function confirmPayment(body: PaymentConfirmRequest): Promise<PaymentConfirmResponse> {
  return apiRequest<PaymentConfirmResponse>('/payments/confirm', { method: 'POST', body, auth: true })
}
