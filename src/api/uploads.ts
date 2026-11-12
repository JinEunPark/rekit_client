import { apiRequest } from '@/api/client'
import { compressImage, makeThumbnail } from '@/utils/compressImage'

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
  // 폰 원본(수 MB)을 그대로 서빙하지 않도록 업로드 직전에 리사이즈·재압축한다.
  const { file: upload } = await compressImage(file)
  return uploadRaster(upload, purpose)
}

async function uploadRaster(file: File, purpose: UploadPurpose): Promise<ConfirmResponse> {
  const presigned = await presignUpload(file.type as UploadContentType, purpose)
  await putToStorage(presigned, file)
  return confirmUpload(presigned.key)
}

export interface ProductImageUpload {
  url: string
  /** 카드용 480px 썸네일. 만들기·올리기에 실패하면 null — 카드는 url 로 폴백한다 */
  thumb_url: string | null
}

/** 상품 이미지 — 상세용(1600px)과 카드용 썸네일(480px)을 함께 올린다. */
export async function uploadProductImage(file: File): Promise<ProductImageUpload> {
  const main = await uploadImage(file, 'product_image')
  let thumbUrl: string | null = null
  try {
    const thumb = await makeThumbnail(file)
    if (thumb) thumbUrl = (await uploadRaster(thumb, 'product_image')).public_url
  } catch {
    // 썸네일은 부가 기능 — 실패해도 본 이미지 업로드는 성공으로 둔다
  }
  return { url: main.public_url, thumb_url: thumbUrl }
}
