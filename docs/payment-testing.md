# 토스페이먼츠 결제 로컬 테스트

## 키

토스 [개발자센터 → API 키](https://developers.tosspayments.com/my/api-keys) 에서 발급.
**secretKey 값은 이 문서·저장소에 적지 않습니다** — `.env.local`(gitignore)·백엔드 env 에만.

| 키 | 위치 |
|---|---|
| clientKey (`test_gck_*`, 공개) | 프론트 `.env.local` → `VITE_TOSS_CLIENT_KEY` (미설정 시 `src/config/payments.ts` 기본값) |
| secretKey (`test_gsk_*`, 비공개) | **백엔드 env `TOSS_SECRET_KEY`**, 또는 로컬 중계 테스트 시 프론트 `.env.local` → `TOSS_TEST_SECRET_KEY` (VITE_ 접두어 없음 → 번들 미포함) |

clientKey ↔ secretKey 는 같은 토스 계정 세트여야 합니다 (안 맞으면 `INVALID_API_KEY`).

---

## 방법 A — 백엔드 결제 엔드포인트를 그대로 사용 (실전 구성)

백엔드에 `POST /api/v1/payments/init`, `POST /api/v1/payments/confirm` 이 동작할 때.

1. **백엔드** `.env`: `TOSS_SECRET_KEY=test_gsk_...`(본인 계정), `USE_FAKE_PG=false` → 백엔드 실행 (`:8000`)
2. **프론트** `.env.local`:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   VITE_TOSS_CLIENT_KEY=test_gck_...       # 본인 계정 clientKey
   ```
   `TOSS_TEST_SECRET_KEY` 줄은 **삭제** (있으면 Vite 중계 모드가 켜짐)
3. `npm run dev`

---

## 방법 B — 백엔드에 결제 엔드포인트가 아직 없을 때 (Vite 중계 모드)

Vite dev 서버가 `/payments/init`·`/payments/confirm` 만 가로채 토스로 중계하고,
나머지 `/api/v1/*` 는 실제 백엔드로 프록시합니다. (`dev/tossMockPlugin.ts`)

1. **백엔드**(auth·orders·cart·products·addresses용) 실행 — 결제 외 기능은 여전히 필요
2. **프론트** `.env.local`:
   ```
   VITE_API_BASE_URL=/api/v1
   VITE_TOSS_CLIENT_KEY=test_gck_...        # 본인 계정 clientKey
   TOSS_TEST_SECRET_KEY=test_gsk_...        # 본인 계정 secretKey (같은 세트)
   DEV_BACKEND_ORIGIN=http://localhost:8000
   ```
3. `npm run dev`

중계 모드 동작 확인:
```
curl -X POST localhost:5173/api/v1/payments/confirm \
  -H 'Content-Type: application/json' \
  -d '{"payment_key":"x","order_id":"x","amount":1000}'
# → {"code":"NOT_FOUND_PAYMENT_SESSION", ...} 422  (시크릿 키 인증 성공 = 정상)
```

한계: confirm 성공해도 백엔드 주문 상태는 PENDING 그대로 → 완료 화면은 sessionStorage
핸드오프로 카드정보만 표시. 주문내역 상태 갱신은 실제 백엔드 연동 시 반영됨.

---

## 클릭 테스트

1. 로그인 → 휴대폰 인증 → 상품 담기 → `/checkout/order`
2. 결제 위젯에서 **카드** 선택 → "결제하기"
3. 토스 결제창 → 테스트 카드 입력
   - 카드번호 아무 값 (예: `4330000000000005`), 유효기간 미래, 생년월일/비번 아무 값
   - 자세한 테스트 카드: https://docs.tosspayments.com/reference/test-and-development
4. 승인 성공 → `/checkout/payment` (승인 중) → `/checkout/complete` (카드사·할부 표시)
5. 결제창에서 취소 → `/checkout/payment/fail`

## 참고
- 결제위젯 연동: https://docs.tosspayments.com/guides/v2/payment-widget/integration
- 테스트/개발: https://docs.tosspayments.com/reference/test-and-development
