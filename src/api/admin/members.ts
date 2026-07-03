import { apiRequest } from '@/api/client'

export type UserRole = 'USER' | 'ADMIN'
export type UserStatus = 'ACTIVE' | 'BANNED' | 'DORMANT' | 'WITHDRAWN'

export interface AdminMemberSummary {
  total: number
  verified: number
  new_this_week: number
  purchased: number
}

export interface AdminMemberItem {
  id: number
  login_id: string
  username: string
  email: string
  phone: string | null
  role: UserRole
  status: UserStatus
  is_active: boolean
  verified: boolean
  created_at: string
  order_count: number
  total_purchased: number
}

export interface AdminMemberDetail extends AdminMemberItem {
  phone_verified_at: string | null
  identity_verified_at: string | null
  agreed_marketing_at: string | null
}

export interface AdminMemberListResponse {
  items: AdminMemberItem[]
  meta: { page: number; size: number; total: number; total_pages: number }
}

export interface AdminMemberListParams {
  q?: string
  status?: UserStatus
  page?: number
  size?: number
}

export function getAdminMemberSummary(): Promise<AdminMemberSummary> {
  return apiRequest<AdminMemberSummary>('/admin/members/summary', { method: 'GET', auth: true })
}

export function listAdminMembers(params: AdminMemberListParams = {}): Promise<AdminMemberListResponse> {
  const q = new URLSearchParams()
  if (params.q) q.set('q', params.q)
  if (params.status) q.set('status', params.status)
  if (params.page) q.set('page', String(params.page))
  if (params.size) q.set('size', String(params.size))
  const qs = q.toString() ? `?${q}` : ''
  return apiRequest<AdminMemberListResponse>(`/admin/members${qs}`, { method: 'GET', auth: true })
}

export function getAdminMember(id: number): Promise<AdminMemberDetail> {
  return apiRequest<AdminMemberDetail>(`/admin/members/${id}`, { method: 'GET', auth: true })
}

export function updateMemberStatus(id: number, status: UserStatus): Promise<AdminMemberDetail> {
  return apiRequest<AdminMemberDetail>(`/admin/members/${id}/status`, {
    method: 'PATCH',
    body: { status },
    auth: true,
  })
}
