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
    // imageOrientation: EXIF 회전값(세로 사진 orientation=6 등)을 픽셀에 반영.
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    return passthrough() // 디코딩 불가 — 서버 검증에 맡긴다
  }

  const { width: w0, height: h0 } = bitmap
  if (file.size <= SKIP_BELOW_BYTES && Math.max(w0, h0) <= MAX_EDGE) {
    bitmap.close()
    return passthrough(w0, h0)
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(w0, h0))
  const w = Math.round(w0 * scale)
  const h = Math.round(h0 * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    return passthrough(w0, h0)
  }
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()

  // WebP 미지원 브라우저는 toBlob 이 PNG 로 폴백하므로 type 을 확인하고 JPEG 로 재시도.
  let blob = await canvasToBlob(canvas, 'image/webp', QUALITY)
  if (!blob || blob.type !== 'image/webp') {
    blob = await canvasToBlob(canvas, 'image/jpeg', QUALITY)
  }
  if (!blob || blob.size >= file.size) return passthrough(w0, h0)

  const ext = blob.type === 'image/webp' ? 'webp' : 'jpg'
  const name = file.name.replace(/\.[^.]+$/, '') + '.' + ext
  return {
    file: new File([blob], name, { type: blob.type, lastModified: Date.now() }),
    compressed: true,
    originalBytes: file.size,
    width: w,
    height: h,
  }
}
