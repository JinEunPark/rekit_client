import { apiRequest } from './client'

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PREPARING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export type ShipmentMethod = 'PARCEL' | 'FREIGHT' | 'DIRECT'

export interface OrderItemRequest {
  product_id: number
  quantity: number
}

export interface OrderItemResponse {
  id: number
  product_id: number
  product_title_snapshot: string
  product_brand_snapshot: string | null
  product_image_url_snapshot: string | null
  price_snapshot: number
  quantity: number
  subtotal: number
}

export interface OrderResponse {
  id: number
  order_number: string
  status: OrderStatus
  total_amount: number
  shipping_fee: number
  discount_amount: number
  shipping_method: ShipmentMethod
  recipient_name: string
  recipient_phone: string
  address1: string
  address2: string | null
  memo: string | null
  items: OrderItemResponse[]
  paid_at: string | null
  cancelled_at: string | null
  created_at: string
}

export interface PageMeta {
  page: number
  size: number
  total: number
  total_pages: number
}

export interface OrderListResponse {
  items: OrderResponse[]
  meta: PageMeta
}

export interface CreateOrderRequest {
  items: OrderItemRequest[]
  address_id: number
  shipping_method: ShipmentMethod
  memo?: string | null
}

export interface QuoteRequest {
  items: OrderItemRequest[]
  address_id: number
  shipping_method: ShipmentMethod
}

export interface QuoteResponse {
  items_total: number
  shipping_fee: number
  discount_amount: number
  total_amount: number
  shipping_method: ShipmentMethod
  direct_available: boolean
}

export interface ShipmentResponse {
  method: ShipmentMethod
  status: string
  carrier: string | null
  tracking_number: string | null
  shipped_at: string | null
  delivered_at: string | null
}

export function listOrders(page = 1, size = 20): Promise<OrderListResponse> {
  return apiRequest<OrderListResponse>(`/orders?page=${page}&size=${size}`, {
    method: 'GET',
    auth: true,
  })
}

export function getOrder(orderNumber: string): Promise<OrderResponse> {
  return apiRequest<OrderResponse>(`/orders/${orderNumber}`, { method: 'GET', auth: true })
}

export function createOrder(body: CreateOrderRequest): Promise<OrderResponse> {
  return apiRequest<OrderResponse>('/orders', { method: 'POST', body, auth: true })
}

export function getQuote(body: QuoteRequest): Promise<QuoteResponse> {
  return apiRequest<QuoteResponse>('/orders/quote', { method: 'POST', body, auth: true })
}

export function cancelOrder(orderNumber: string): Promise<OrderResponse> {
  return apiRequest<OrderResponse>(`/orders/${orderNumber}/cancel`, {
    method: 'POST',
    auth: true,
  })
}

export function getShipment(orderNumber: string): Promise<ShipmentResponse> {
  return apiRequest<ShipmentResponse>(`/orders/${orderNumber}/shipment`, {
    method: 'GET',
    auth: true,
  })
}

export function requestRefund(orderNumber: string): Promise<void> {
  return apiRequest<void>(`/orders/${orderNumber}/refund/request`, {
    method: 'POST',
    auth: true,
  })
}
