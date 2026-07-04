import { apiRequest } from '@/api/client'

export interface FaqItem {
  id: number
  category: string
  question: string
  answer: string
  sort_order: number
}

export interface NoticeListItem {
  id: number
  title: string
  is_pinned: boolean
  created_at: string
}

export interface NoticeDetail {
  id: number
  title: string
  content: string
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export interface PageMeta {
  page: number
  size: number
  total: number
  total_pages: number
}

export interface NoticeListResponse {
  items: NoticeListItem[]
  meta: PageMeta
}

export interface ContactRequest {
  title: string
  content: string
}

export const CONTACT_TITLE_MAX_LENGTH = 200
export const CONTACT_CONTENT_MIN_LENGTH = 10

export type MyContactStatus = 'PENDING' | 'ANSWERED'

export interface MyContactListItem {
  id: number
  title: string
  status: MyContactStatus
  answered_at: string | null
  created_at: string
}

export interface MyContactDetail {
  id: number
  title: string
  content: string
  status: MyContactStatus
  answer_content: string | null
  answered_at: string | null
  created_at: string
}

export interface MyContactListResponse {
  items: MyContactListItem[]
  meta: PageMeta
}

export async function getFaqs(category?: string): Promise<FaqItem[]> {
  const qs = category ? `?category=${encodeURIComponent(category)}` : ''
  const res = await apiRequest<{ items: FaqItem[] }>(`/help/faqs${qs}`, { method: 'GET' })
  return res.items
}

export function getNotices(page = 1, size = 20): Promise<NoticeListResponse> {
  return apiRequest<NoticeListResponse>(`/help/notices?page=${page}&size=${size}`, { method: 'GET' })
}

export function getNoticeDetail(id: number): Promise<NoticeDetail> {
  return apiRequest<NoticeDetail>(`/help/notices/${id}`, { method: 'GET' })
}

export function submitContact(body: ContactRequest): Promise<void> {
  return apiRequest<void>('/help/contacts', { method: 'POST', body, auth: true })
}

export function getMyContacts(page = 1, size = 20): Promise<MyContactListResponse> {
  return apiRequest<MyContactListResponse>(`/help/contacts?page=${page}&size=${size}`, { method: 'GET', auth: true })
}

export function getMyContactDetail(id: number): Promise<MyContactDetail> {
  return apiRequest<MyContactDetail>(`/help/contacts/${id}`, { method: 'GET', auth: true })
}
