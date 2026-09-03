import { apiRequest, API_BASE_URL } from '@/api/client'
import type { PaymentMethod } from '@/api/payments'

export interface SalesSummary {
  total_revenue: number
  order_count: number
  avg_order_value: number
  cancel_rate: number
}

export interface SalesDataPoint {
  date: string
  revenue: number
  order_count: number
}

export interface SalesTimeSeries {
  granularity: string
  data: Record<string, unknown>[]
}

export interface PaymentMethodStat {
  method: PaymentMethod
  revenue: number
  order_count: number
}

export interface TopProductItem {
  product_id: number
  title: string
  revenue: number
  quantity_sold: number
}

export interface SalesQueryParams {
  start?: string
  end?: string
}

export function getSalesSummary(params: SalesQueryParams = {}): Promise<SalesSummary> {
  const q = new URLSearchParams()
  if (params.start) q.set('start', params.start)
  if (params.end) q.set('end', params.end)
  const qs = q.toString() ? `?${q}` : ''
  return apiRequest<SalesSummary>(`/admin/sales/summary${qs}`, { method: 'GET', auth: true })
}

export function getSalesTimeSeries(params: SalesQueryParams = {}): Promise<SalesTimeSeries> {
  const q = new URLSearchParams()
  if (params.start) q.set('start', params.start)
  if (params.end) q.set('end', params.end)
  const qs = q.toString() ? `?${q}` : ''
  return apiRequest<SalesTimeSeries>(`/admin/sales/timeseries${qs}`, { method: 'GET', auth: true })
}

export function getSalesByPaymentMethod(params: SalesQueryParams = {}): Promise<PaymentMethodStat[]> {
  const q = new URLSearchParams()
  if (params.start) q.set('start', params.start)
  if (params.end) q.set('end', params.end)
  const qs = q.toString() ? `?${q}` : ''
  return apiRequest<PaymentMethodStat[]>(`/admin/sales/by-payment-method${qs}`, { method: 'GET', auth: true })
}

export function getSalesTopProducts(params: SalesQueryParams & { limit?: number } = {}): Promise<TopProductItem[]> {
  const q = new URLSearchParams()
  if (params.start) q.set('start', params.start)
  if (params.end) q.set('end', params.end)
  if (params.limit) q.set('limit', String(params.limit))
  const qs = q.toString() ? `?${q}` : ''
  return apiRequest<TopProductItem[]>(`/admin/sales/top-products${qs}`, { method: 'GET', auth: true })
}

export function exportSalesCsv(params: SalesQueryParams = {}): string {
  const base = `${API_BASE_URL}/admin/sales/export.csv`
  const q = new URLSearchParams()
  if (params.start) q.set('start', params.start)
  if (params.end) q.set('end', params.end)
  return q.toString() ? `${base}?${q}` : base
}
