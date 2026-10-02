import { apiRequest } from '@/api/client'

export type UploadPurpose = 'product_image' | 'category_image'
export type UploadContentType = 'image/jpeg' | 'image/png' | 'image/webp'

export const UPLOAD_CONTENT_TYPES: UploadContentType[] = ['image/jpeg', 'image/png', 'image/webp']

export const SVG_CONTENT_TYPE = 'image/svg+xml'

// SVG는 카테고리 이미지에서만 허용 — 상품 이미지 쪽 리스크 범위를 넓히지 않기 위함.
// 업로드 경로도 래스터와 다르다: presign 방식은 브라우저가 스토리지로 직접 PUT 하는 구조라
// 서버가 본문을 검사할 지점이 없어서, SVG만 서버를 경유하는 POST /uploads/svg 로 올린다.
function acceptsSvg(purpose: UploadPurpose): boolean {
  return purpose === 'category_image'
}

export interface PresignResponse {
  upload_url: string
  method: 'PUT'
  key: string
  public_url: string
  expires_in: number
  headers?: Record<string, string>
}

export interface ConfirmResponse {
  key: string
  public_url: string
  size: number
  content_type: string
}

export function presignUpload(
  contentType: UploadContentType,
  purpose: UploadPurpose = 'product_image',
): Promise<PresignResponse> {
  return apiRequest<PresignResponse>('/uploads/presign', {
    method: 'POST',
    body: { content_type: contentType, purpose },
    auth: true,
  })
}

export function confirmUpload(key: string): Promise<ConfirmResponse> {
  return apiRequest<ConfirmResponse>('/uploads/confirm', {
    method: 'POST',
    body: { key },
    auth: true,
  })
}

// Presign issues a storage URL; the file bytes go straight there (not through our API),
// so this step bypasses apiRequest entirely — no auth header, no credentials, just the
// headers the presign response says to send.
async function putToStorage(presigned: PresignResponse, file: File): Promise<void> {
  const res = await fetch(presigned.upload_url, {
    method: presigned.method ?? 'PUT',
    headers: presigned.headers,
    body: file,
  })
  if (!res.ok) {
    throw new Error(`이미지 업로드에 실패했습니다. (HTTP ${res.status})`)
  }
}

/** SVG 전용 — 본문이 서버를 거치며 검사되고, 통과한 파일만 스토리지에 저장된다. */
function uploadSvg(file: File): Promise<ConfirmResponse> {
  const form = new FormData()
  form.append('file', file)
  return apiRequest<ConfirmResponse>('/uploads/svg', { method: 'POST', body: form, auth: true })
}

export async function uploadImage(file: File, purpose: UploadPurpose = 'product_image'): Promise<ConfirmResponse> {
  if (file.type === SVG_CONTENT_TYPE && acceptsSvg(purpose)) {
    return uploadSvg(file)
  }
  if (!UPLOAD_CONTENT_TYPES.includes(file.type as UploadContentType)) {
    const label = acceptsSvg(purpose) ? 'JPG, PNG, WEBP, SVG' : 'JPG, PNG, WEBP'
    throw new Error(`${label} 파일만 업로드할 수 있습니다.`)
  }
  const presigned = await presignUpload(file.type as UploadContentType, purpose)
  await putToStorage(presigned, file)
  return confirmUpload(presigned.key)
}
