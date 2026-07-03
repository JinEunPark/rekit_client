import { apiRequest } from '@/api/client'

export interface AdminCategoryResponse {
  id: string
  title: string
  icon: string
  sort_order: number
}

export interface AdminCategoryCreate {
  id: string
  title: string
  icon: string
  sort_order?: number
}

export interface AdminCategoryUpdate {
  title?: string | null
  icon?: string | null
  sort_order?: number | null
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
