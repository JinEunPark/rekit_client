import { apiRequest } from '@/api/client'

export type ConditionGrade = 'A' | 'B' | 'C'
export type ProductStatus = 'ACTIVE' | 'SOLD_OUT' | 'INACTIVE'

export interface AdminProductImageResponse {
  id: number
  url: string
  sort_order: number
  label: string | null
}

export interface AdminProductDetailResponse {
  id: number
  title: string
  description: string
  category: string
  brand: string | null
  model_name: string | null
  year_estimate: number | null
  condition_grade: ConditionGrade
  warranty_works: boolean
  price: number
  original_price: number | null
  discount_pct: number | null
  weight_kg: number | null
  width_cm: number | null
  depth_cm: number | null
  height_cm: number | null
  stock: number
  status: ProductStatus
  images: AdminProductImageResponse[]
  created_at: string
}

export interface AdminProductListResponse {
  items: AdminProductDetailResponse[]
  meta: { page: number; size: number; total: number; total_pages: number }
}

export interface AdminProductCreate {
  title: string
  description?: string
  category: string
  brand?: string | null
  model_name?: string | null
  year_estimate?: number | null
  condition_grade: ConditionGrade
  warranty_works?: boolean
  price: number
  original_price?: number | null
  weight_kg?: number | null
  width_cm?: number | null
  depth_cm?: number | null
  height_cm?: number | null
  stock?: number
  status?: ProductStatus
  image_urls?: string[]
}

export type AdminProductUpdate = Partial<Omit<AdminProductCreate, 'image_urls'>>

export interface AdminProductListParams {
  status?: ProductStatus
  q?: string
  page?: number
  size?: number
}

export function listAdminProducts(params: AdminProductListParams = {}): Promise<AdminProductListResponse> {
  const q = new URLSearchParams()
  if (params.status) q.set('status', params.status)
  if (params.q) q.set('q', params.q)
  if (params.page) q.set('page', String(params.page))
  if (params.size) q.set('size', String(params.size))
  const qs = q.toString() ? `?${q}` : ''
  return apiRequest<AdminProductListResponse>(`/admin/products${qs}`, { method: 'GET', auth: true })
}

export function getAdminProduct(id: number): Promise<AdminProductDetailResponse> {
  return apiRequest<AdminProductDetailResponse>(`/admin/products/${id}`, { method: 'GET', auth: true })
}

export function createAdminProduct(body: AdminProductCreate): Promise<AdminProductDetailResponse> {
  return apiRequest<AdminProductDetailResponse>('/admin/products', {
    method: 'POST',
    body,
    auth: true,
  })
}

export function updateAdminProduct(id: number, body: AdminProductUpdate): Promise<AdminProductDetailResponse> {
  return apiRequest<AdminProductDetailResponse>(`/admin/products/${id}`, {
    method: 'PATCH',
    body,
    auth: true,
  })
}

export function deleteAdminProduct(id: number): Promise<void> {
  return apiRequest<void>(`/admin/products/${id}`, { method: 'DELETE', auth: true })
}

export function replaceProductImages(
  id: number,
  images: { url: string; label?: string | null }[],
): Promise<AdminProductDetailResponse> {
  return apiRequest<AdminProductDetailResponse>(`/admin/products/${id}/images`, {
    method: 'PUT',
    body: { images },
    auth: true,
  })
}
