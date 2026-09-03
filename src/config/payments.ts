/**
 * 토스페이먼츠 결제 위젯 설정 — 프론트는 **공개 clientKey 만** 사용합니다.
 *
 * 시크릿 키(`test_gsk_*`)는 절대 프론트에 두지 않습니다(빌드 번들에 박힘). 결제 승인은
 * 백엔드(`POST /api/v1/payments/confirm`)가 시크릿 키로 대행합니다.
 * clientKey(gck)와 백엔드 secretKey(gsk)는 같은 토스 계정의 세트여야 합니다.
 */

/** rekit 테스트 clientKey (기본값). 운영 키는 .env 의 VITE_TOSS_CLIENT_KEY 로 주입. */
export const TOSS_CLIENT_KEY =
  import.meta.env.VITE_TOSS_CLIENT_KEY ?? 'test_gck_GjLJoQ1aVZpaWpeDLOo58w6KYe2R'

/** 위젯 UI variantKey — 결제 어드민에서 여러 UI를 운영할 때만 의미 있음. */
export const TOSS_PAYMENT_METHOD_VARIANT =
  import.meta.env.VITE_TOSS_PAYMENT_VARIANT_KEY ?? 'DEFAULT'
export const TOSS_AGREEMENT_VARIANT =
  import.meta.env.VITE_TOSS_AGREEMENT_VARIANT_KEY ?? 'AGREEMENT'

/**
 * 구매자를 식별하는 고유 키. 토스가 발급하는 값이 아니라 상점이 정합니다.
 * 회원이면 로그인 아이디 기반의 안정적 문자열, 비회원이면 호출부에서 `ANONYMOUS` 를 사용하세요.
 * (영문/숫자/`-_=.@` 중 1개 이상 포함, 2~50자)
 */
export function tossCustomerKey(loginId: string): string {
  return `rekit-${loginId}`.slice(0, 50)
}
