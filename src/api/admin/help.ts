import { apiRequest } from '@/api/client'

export interface PageMeta {
  page: number
  size: number
  total: number
  total_pages: number
}

// ── 공지사항 ──────────────────────────────────
export interface AdminNoticeResponse {
  id: number
  title: string
  content: string
  is_pinned: boolean
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface AdminNoticeCreate {
  title: string
  content: string
  is_pinned?: boolean
  is_published?: boolean
}

export type AdminNoticeUpdate = Partial<AdminNoticeCreate>

export interface AdminNoticeListResponse {
  items: AdminNoticeResponse[]
  meta: PageMeta
}

export function listAdminNotices(params: { page?: number; size?: number } = {}): Promise<AdminNoticeListResponse> {
  const q = new URLSearchParams()
  if (params.page) q.set('page', String(params.page))
  if (params.size) q.set('size', String(params.size))
  const qs = q.toString() ? `?${q}` : ''
  return apiRequest<AdminNoticeListResponse>(`/admin/notices${qs}`, { method: 'GET', auth: true })
}

export function createAdminNotice(body: AdminNoticeCreate): Promise<AdminNoticeResponse> {
  return apiRequest<AdminNoticeResponse>('/admin/notices', { method: 'POST', body, auth: true })
}

export function updateAdminNotice(id: number, body: AdminNoticeUpdate): Promise<AdminNoticeResponse> {
  return apiRequest<AdminNoticeResponse>(`/admin/notices/${id}`, { method: 'PATCH', body, auth: true })
}

export function deleteAdminNotice(id: number): Promise<void> {
  return apiRequest<void>(`/admin/notices/${id}`, { method: 'DELETE', auth: true })
}

// ── FAQ ──────────────────────────────────
export interface AdminFaqResponse {
  id: number
  category: string
  question: string
  answer: string
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface AdminFaqCreate {
  category: string
  question: string
  answer: string
  sort_order?: number
  is_published?: boolean
}

export type AdminFaqUpdate = Partial<AdminFaqCreate>

export interface AdminFaqListResponse {
  items: AdminFaqResponse[]
  meta: PageMeta
}

export function listAdminFaqs(
  params: { page?: number; size?: number; category?: string } = {},
): Promise<AdminFaqListResponse> {
  const q = new URLSearchParams()
  if (params.page) q.set('page', String(params.page))
  if (params.size) q.set('size', String(params.size))
  if (params.category) q.set('category', params.category)
  const qs = q.toString() ? `?${q}` : ''
  return apiRequest<AdminFaqListResponse>(`/admin/faqs${qs}`, { method: 'GET', auth: true })
}

export function createAdminFaq(body: AdminFaqCreate): Promise<AdminFaqResponse> {
  return apiRequest<AdminFaqResponse>('/admin/faqs', { method: 'POST', body, auth: true })
}

export function updateAdminFaq(id: number, body: AdminFaqUpdate): Promise<AdminFaqResponse> {
  return apiRequest<AdminFaqResponse>(`/admin/faqs/${id}`, { method: 'PATCH', body, auth: true })
}

export function deleteAdminFaq(id: number): Promise<void> {
  return apiRequest<void>(`/admin/faqs/${id}`, { method: 'DELETE', auth: true })
}

// ── 1:1 문의 ──────────────────────────────────
export const ANSWER_MAX_LENGTH = 3000

export type ContactStatus = 'PENDING' | 'ANSWERED'

export interface AdminContactListItem {
  id: number
  name: string
  email: string
  title: string
  status: ContactStatus
  created_at: string
}

export interface AdminContactDetail {
  id: number
  user_id: number | null
  name: string
  email: string
  title: string
  content: string
  status: ContactStatus
  answer_content: string | null
  answered_at: string | null
  created_at: string
}

export interface AdminContactListResponse {
  items: AdminContactListItem[]
  meta: PageMeta
}

export function listAdminContacts(
  params: { page?: number; size?: number; status?: ContactStatus } = {},
): Promise<AdminContactListResponse> {
  const q = new URLSearchParams()
  if (params.page) q.set('page', String(params.page))
  if (params.size) q.set('size', String(params.size))
  if (params.status) q.set('status', params.status)
  const qs = q.toString() ? `?${q}` : ''
  return apiRequest<AdminContactListResponse>(`/admin/contacts${qs}`, { method: 'GET', auth: true })
}

export function getAdminContact(id: number): Promise<AdminContactDetail> {
  return apiRequest<AdminContactDetail>(`/admin/contacts/${id}`, { method: 'GET', auth: true })
}

export function updateAdminContactStatus(id: number, status: ContactStatus): Promise<AdminContactDetail> {
  return apiRequest<AdminContactDetail>(`/admin/contacts/${id}/status`, {
    method: 'PATCH',
    body: { status },
    auth: true,
  })
}

export function answerAdminContact(id: number, answer: string): Promise<AdminContactDetail> {
  return apiRequest<AdminContactDetail>(`/admin/contacts/${id}/answer`, {
    method: 'PATCH',
    body: { answer },
    auth: true,
  })
}
