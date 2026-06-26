import { apiRequest } from './client'
import type { ProductResponse } from './catalog'

export interface CartItemResponse {
  id: number
  product: ProductResponse
  quantity: number
  selected: boolean
  subtotal: number
}

export interface CartSummary {
  items_total: number
  selected_total: number
  shipping_fee: number
  estimated_total: number
}

export interface CartResponse {
  items: CartItemResponse[]
  summary: CartSummary
}

export function getCart(): Promise<CartResponse> {
  return apiRequest<CartResponse>('/cart', { method: 'GET', auth: true })
}

export function addCartItem(productId: number, qty: number): Promise<CartResponse> {
  return apiRequest<CartResponse>('/cart/items', {
    method: 'POST',
    body: { product_id: productId, qty },
    auth: true,
  })
}

export function updateCartItem(
  productId: number,
  body: { qty?: number; selected?: boolean },
): Promise<void> {
  return apiRequest<void>(`/cart/items/${productId}`, {
    method: 'PATCH',
    body,
    auth: true,
  })
}

export function deleteCartItem(productId: number): Promise<void> {
  return apiRequest<void>(`/cart/items/${productId}`, { method: 'DELETE', auth: true })
}

export function deleteSelectedItems(): Promise<void> {
  return apiRequest<void>('/cart/items?selected=true', { method: 'DELETE', auth: true })
}

export function clearCart(): Promise<void> {
  return apiRequest<void>('/cart', { method: 'DELETE', auth: true })
}

export function syncCart(items: { product_id: number; qty: number }[]): Promise<CartResponse> {
  return apiRequest<CartResponse>('/cart/sync', {
    method: 'POST',
    body: { items },
    auth: true,
  })
}
