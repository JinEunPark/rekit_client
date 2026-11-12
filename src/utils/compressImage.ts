// 업로드 전 이미지 리사이즈·재압축.
//
// 상품 사진은 관리자가 폰 원본(4000×3000, 2.5~4MB)을 그대로 올리는 경우가 대부분인데,
// 업로드가 presign 방식(브라우저 → 스토리지 직접 PUT)이라 서버가 본문을 손볼 지점이 없다.
// 그래서 원본 그대로 카드 썸네일로 서빙돼 목록 한 화면에 수십 MB 가 내려갔다.
// 브라우저에서 긴 변 MAX_EDGE 로 줄이고 WebP 로 재인코딩해 올린다.
// 부수효과로 EXIF(촬영 기기·위치 등 메타데이터)도 제거된다 — canvas 는 픽셀만 다시 그린다.

const MAX_EDGE = 1600
const QUALITY = 0.82
// 이미 충분히 작은 파일은 건드리지 않는다 (재인코딩 시 오히려 화질만 깎일 수 있음).
const SKIP_BELOW_BYTES = 300 * 1024
// 카드(화면에서 약 200px, 레티나 2배)용 썸네일 — 장당 약 20KB.
const THUMB_EDGE = 480
const THUMB_QUALITY = 0.8

export interface CompressResult {
  file: File
  /** 원본 그대로 반환했으면 false */
  compressed: boolean
  originalBytes: number
  width: number
  height: number
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

/** 긴 변 maxEdge 로 줄여 WebP(미지원 시 JPEG)로 인코딩. 키우지는 않는다. */
async function encodeScaled(bitmap: ImageBitmap, maxEdge: number, quality: number): Promise<{ blob: Blob; width: number; height: number } | null> {
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, width, height)

  // WebP 미지원 브라우저는 toBlob 이 PNG 로 폴백하므로 type 을 확인하고 JPEG 로 재시도.
  let blob = await canvasToBlob(canvas, 'image/webp', quality)
  if (!blob || blob.type !== 'image/webp') {
    blob = await canvasToBlob(canvas, 'image/jpeg', quality)
  }
  return blob ? { blob, width, height } : null
}

function toFile(blob: Blob, originalName: string, suffix = ''): File {
  const ext = blob.type === 'image/webp' ? 'webp' : 'jpg'
  const name = originalName.replace(/\.[^.]+$/, '') + suffix + '.' + ext
  return new File([blob], name, { type: blob.type, lastModified: Date.now() })
}

function decode(file: File): Promise<ImageBitmap> {
  // imageOrientation: EXIF 회전값(세로 사진 orientation=6 등)을 픽셀에 반영.
  return createImageBitmap(file, { imageOrientation: 'from-image' })
}

export async function compressImage(file: File): Promise<CompressResult> {
  const passthrough = (w = 0, h = 0): CompressResult => ({
    file,
    compressed: false,
    originalBytes: file.size,
    width: w,
    height: h,
  })

  let bitmap: ImageBitmap
  try {
    bitmap = await decode(file)
  } catch {
    return passthrough() // 디코딩 불가 — 서버 검증에 맡긴다
  }

  const { width: w0, height: h0 } = bitmap
  if (file.size <= SKIP_BELOW_BYTES && Math.max(w0, h0) <= MAX_EDGE) {
    bitmap.close()
    return passthrough(w0, h0)
  }

  const out = await encodeScaled(bitmap, MAX_EDGE, QUALITY)
  bitmap.close()
  if (!out || out.blob.size >= file.size) return passthrough(w0, h0)

  return {
    file: toFile(out.blob, file.name),
    compressed: true,
    originalBytes: file.size,
    width: out.width,
    height: out.height,
  }
}

/**
 * 카드·장바구니·상세 썸네일 줄용 작은 이미지(긴 변 THUMB_EDGE). 원본 파일에서 바로 만든다
 * — 1600px 압축본에서 다시 줄이면 손실 압축을 두 번 거친다. 실패하면 null (카드는 원본 url 로 폴백).
 */
export async function makeThumbnail(file: File): Promise<File | null> {
  let bitmap: ImageBitmap
  try {
    bitmap = await decode(file)
  } catch {
    return null
  }
  const out = await encodeScaled(bitmap, THUMB_EDGE, THUMB_QUALITY)
  bitmap.close()
  return out ? toFile(out.blob, file.name, '_thumb') : null
}
