/**
 * 배송 방식별 기간·배송비 — 상품 상세 / 주문서 / 이용약관이 같은 값을 쓰도록 한 곳에 모은다.
 * PG 입점 심사 요건: 구매자가 배송기간을 명확히 인지할 수 있어야 하므로
 * 기산점(결제 완료)과 최대 기간을 함께 표기한다.
 */
export type DeliveryMethod = 'direct' | 'cargo'

export interface DeliveryOption {
  key: DeliveryMethod
  name: string
  /** 대상·특징 (예: '서울/경기 · 운반·설치 포함') */
  scope: string
  minDays: number
  maxDays: number
  /** 일정 지연 시에도 넘기지 않는 상한 (영업일) */
  limitDays: number
  fee: number
}

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    key: 'direct',
    name: '직접 배송',
    scope: '서울/경기 · 전문 기사 운반·설치 · 방문 시간 협의',
    minDays: 1,
    maxDays: 2,
    limitDays: 5,
    fee: 40_000,
  },
  {
    key: 'cargo',
    name: '화물택배',
    scope: '대형 가전 · 전국',
    minDays: 2,
    maxDays: 4,
    limitDays: 7,
    fee: 60_000,
  },
]

/** '결제 완료 후 영업일 기준 1~2일 이내 도착 (최대 5영업일)' */
export function deliveryPeriodText(o: DeliveryOption): string {
  return `결제 완료 후 영업일 기준 ${o.minDays}~${o.maxDays}일 이내 도착 (최대 ${o.limitDays}영업일)`
}
