import { apiRequest, API_BASE_URL } from '@/api/client'
import type { OrderStatus, ShipmentMethod } from '@/api/orders'

export interface AdminOrderStatusCounts {
  all: number
  paid: number
  preparing: number
  shipping: number
  delivered: number
  cancelled: number
}

export interface AdminOrderListItem {
  order_number: string
  created_at: string
  username: string
  recipient_phone: string
  item_count: number
  first_item_title: string
  total_amount: number
  status: OrderStatus
  shipping_method: ShipmentMethod
}

export interface AdminOrderListResponse {
  items: AdminOrderListItem[]
  counts: AdminOrderStatusCounts
  meta: { page: number; size: number; total: number; total_pages: number }
}

export interface AdminOrderItemSummary {
  product_title_snapshot: string
  quantity: number
  price_snapshot: number
}

export type ShipmentStatus = 'PREPARING' | 'IN_TRANSIT' | 'DELIVERED'

export interface AdminShipmentInfo {
  carrier: string | null
  tracking_number: string | null
  status: ShipmentStatus
  shipped_at: string | null
  delivered_at: string | null
}

export interface AdminOrderDetail {
  order_number: string
  created_at: string
  status: OrderStatus
  shipping_method: ShipmentMethod
  total_amount: number
  shipping_fee: number
  discount_amount: number
  memo: string | null
  user_id: number
  username: string
  email: string
  recipient_name: string
  recipient_phone: string
  zipcode: string
  address1: string
  address2: string | null
  items: AdminOrderItemSummary[]
  payment_method: string | null
  paid_at: string | null
  cancelled_at: string | null
  shipment: AdminShipmentInfo | null
}

export interface AdminOrderListParams {
  status?: OrderStatus
  page?: number
  size?: number
}

export function listAdminOrders(params: AdminOrderListParams = {}): Promise<AdminOrderListResponse> {
  const q = new URLSearchParams()
  if (params.status) q.set('status', params.status)
  if (params.page) q.set('page', String(params.page))
  if (params.size) q.set('size', String(params.size))
  const qs = q.toString() ? `?${q}` : ''
  return apiRequest<AdminOrderListResponse>(`/admin/orders${qs}`, { method: 'GET', auth: true })
}

export function getAdminOrder(orderNumber: string): Promise<AdminOrderDetail> {
  return apiRequest<AdminOrderDetail>(`/admin/orders/${orderNumber}`, { method: 'GET', auth: true })
}

export function updateAdminOrderStatus(orderNumber: string, status: OrderStatus): Promise<AdminOrderDetail> {
  return apiRequest<AdminOrderDetail>(`/admin/orders/${orderNumber}/status`, {
    method: 'PATCH',
    body: { status },
    auth: true,
  })
}

export function inputShipment(
  orderNumber: string,
  carrier: string,
  trackingNumber: string,
): Promise<AdminOrderDetail> {
  return apiRequest<AdminOrderDetail>(`/admin/orders/${orderNumber}/shipment`, {
    method: 'POST',
    body: { carrier, tracking_number: trackingNumber },
    auth: true,
  })
}

export function cancelAdminOrder(orderNumber: string, reason?: string): Promise<AdminOrderDetail> {
  return apiRequest<AdminOrderDetail>(`/admin/orders/${orderNumber}/cancel`, {
    method: 'POST',
    body: { reason: reason ?? null },
    auth: true,
  })
}

export function exportOrdersCsv(status?: OrderStatus): string {
  const base = `${API_BASE_URL}/admin/orders/export.csv`
  return status ? `${base}?status=${status}` : base
}
