import { apiRequest } from './client'

export interface FavoriteProductItem {
  product_id: number
  title: string
  price: number
  original_price: number | null
  discount_pct: number | null
  thumbnail_url: string | null
  category: string
  condition_grade: 'A' | 'B' | 'C'
  warranty_works: boolean
  added_at: string
}

export interface FavoriteToggleResponse {
  product_id: number
  is_favorite: boolean
}

export function getFavorites(): Promise<FavoriteProductItem[]> {
  return apiRequest<FavoriteProductItem[]>('/favorites', { method: 'GET', auth: true })
}

export function addFavorite(productId: number): Promise<FavoriteToggleResponse> {
  return apiRequest<FavoriteToggleResponse>(`/favorites/${productId}`, { method: 'POST', auth: true })
}

export function removeFavorite(productId: number): Promise<FavoriteToggleResponse> {
  return apiRequest<FavoriteToggleResponse>(`/favorites/${productId}`, { method: 'DELETE', auth: true })
}
