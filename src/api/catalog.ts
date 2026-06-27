import { apiRequest } from './client'

export type BackendCategory =
  | 'REFRIGERATOR'
  | 'WASHING_MACHINE'
  | 'TV'
  | 'AIR_CONDITIONER'
  | 'KITCHEN'
  | 'VACUUM'
  | 'ETC'

export type BackendGrade = 'A' | 'B' | 'C'
export type ProductStatus = 'ACTIVE' | 'SOLD_OUT' | 'INACTIVE'
export type ProductSort = 'latest' | 'price_asc' | 'price_desc'

// catalog 라우터는 response_model_by_alias 미사용 — 응답은 snake_case 그대로.
export interface ProductResponse {
  id: number
  title: string
  category: BackendCategory
  brand: string | null
  condition_grade: BackendGrade
  warranty_works: boolean
  price: number
  original_price: number | null
  discount_pct: number | null
  status: ProductStatus
  thumbnail_url: string | null
  created_at: string
}

export interface ProductImageResponse {
  id: number
  url: string
  sort_order: number
  label: string | null
}

export interface ProductDetailResponse extends ProductResponse {
  description: string
  model_name: string | null
  year_estimate: number | null
  weight_kg: number | null
  width_cm: number | null
  depth_cm: number | null
  height_cm: number | null
  stock: number
  images: ProductImageResponse[]
}

export interface ProductListParams {
  category?: BackendCategory
  grade?: BackendGrade
  minPrice?: number
  maxPrice?: number
  warranty?: boolean
  q?: string
  sort?: ProductSort
  page?: number
  size?: number
}

export interface PageMeta {
  page: number
  size: number
  total: number
  total_pages: number
}

export interface ProductListResponse {
  items: ProductResponse[]
  meta: PageMeta
}

export interface CategoryMetaItem {
  id: BackendCategory
  label: string
  icon: string
  sort_order: number
}

function toQuery(params: ProductListParams): string {
  const usp = new URLSearchParams()
  if (params.category) usp.set('category', params.category)
  if (params.grade) usp.set('grade', params.grade)
  if (params.minPrice !== undefined) usp.set('min_price', String(params.minPrice))
  if (params.maxPrice !== undefined) usp.set('max_price', String(params.maxPrice))
  if (params.warranty !== undefined) usp.set('warranty', String(params.warranty))
  if (params.q) usp.set('q', params.q)
  if (params.sort) usp.set('sort', params.sort)
  if (params.page) usp.set('page', String(params.page))
  if (params.size) usp.set('size', String(params.size))
  const qs = usp.toString()
  return qs ? `?${qs}` : ''
}

export function getFeaturedProducts(limit = 4): Promise<ProductResponse[]> {
  return apiRequest<ProductResponse[]>(`/products/featured?limit=${limit}`, { method: 'GET' })
}

export function getProduct(id: number): Promise<ProductDetailResponse> {
  return apiRequest<ProductDetailResponse>(`/products/${id}`, { method: 'GET' })
}

export function listProducts(params: ProductListParams = {}): Promise<ProductListResponse> {
  return apiRequest<ProductListResponse>(`/products${toQuery(params)}`, { method: 'GET' })
}

export function getProductsBulk(ids: number[]): Promise<ProductResponse[]> {
  return apiRequest<ProductResponse[]>('/products/bulk', { method: 'POST', body: { ids } })
}

export function getCategories(): Promise<CategoryMetaItem[]> {
  return apiRequest<CategoryMetaItem[]>('/categories', { method: 'GET' })
}

export interface PopularKeyword {
  rank: number
  keyword: string
  trend: 'up' | 'down' | 'same'
}

export function getPopularKeywords(limit = 8): Promise<PopularKeyword[]> {
  return apiRequest<PopularKeyword[]>(`/products/popular-keywords?limit=${limit}`, { method: 'GET' })
}
