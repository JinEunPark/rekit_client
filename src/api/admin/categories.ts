import { apiRequest } from '@/api/client'

export interface AdminCategoryResponse {
  id: string
  title: string
  icon: string
  image_url: string | null
  sort_order: number
}

export interface AdminCategoryCreate {
  id: string
  title: string
  icon: string
  image_url?: string | null
  sort_order?: number
}

// 서버는 title/icon/sort_order 에 명시적 null 을 거부한다 (NOT NULL 컬럼) — 생략하면 기존 값 유지.
// image_url 만 null 을 보내 이미지를 제거할 수 있다.
export interface AdminCategoryUpdate {
  title?: string
  icon?: string
  image_url?: string | null
  sort_order?: number
}

export function listAdminCategories(): Promise<AdminCategoryResponse[]> {
  return apiRequest<AdminCategoryResponse[]>('/admin/categories', { method: 'GET', auth: true })
}

export function createAdminCategory(body: AdminCategoryCreate): Promise<AdminCategoryResponse> {
  return apiRequest<AdminCategoryResponse>('/admin/categories', { method: 'POST', body, auth: true })
}

export function updateAdminCategory(id: string, body: AdminCategoryUpdate): Promise<AdminCategoryResponse> {
  return apiRequest<AdminCategoryResponse>(`/admin/categories/${id}`, {
    method: 'PATCH',
    body,
    auth: true,
  })
}

export function deleteAdminCategory(id: string): Promise<void> {
  return apiRequest<void>(`/admin/categories/${id}`, { method: 'DELETE', auth: true })
}
