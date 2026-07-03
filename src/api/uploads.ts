import { apiRequest } from '@/api/client'

export type UploadPurpose = 'product_image'
export type UploadContentType = 'image/jpeg' | 'image/png' | 'image/webp'

export const UPLOAD_CONTENT_TYPES: UploadContentType[] = ['image/jpeg', 'image/png', 'image/webp']

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

export async function uploadImage(file: File, purpose: UploadPurpose = 'product_image'): Promise<ConfirmResponse> {
  if (!UPLOAD_CONTENT_TYPES.includes(file.type as UploadContentType)) {
    throw new Error('JPG, PNG, WEBP 파일만 업로드할 수 있습니다.')
  }
  const presigned = await presignUpload(file.type as UploadContentType, purpose)
  await putToStorage(presigned, file)
  return confirmUpload(presigned.key)
}
