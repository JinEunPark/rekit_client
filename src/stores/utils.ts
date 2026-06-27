/** productId 문자열을 숫자로 변환. 유효하지 않으면 null. */
export function toNumId(productId: string): number | null {
  const n = parseInt(productId, 10)
  return Number.isFinite(n) ? n : null
}
