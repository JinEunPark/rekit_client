# rekit — 작업 현황 (2026-07-02 기준)

> 디자인 시안(`/_design/*`)을 레퍼런스로 두고, 실제 반응형 웹앱 + 백엔드 API 연동 진행 중.

---

## 현재 상태 요약

| 영역 | 상태 | 비고 |
|------|------|------|
| 구매자 UI | ✅ 완성 | 전 화면 구현 완료 |
| 관리자 UI | ✅ 완성 | 전 화면 구현 + API 연동 완료 |
| 백엔드 API 연동 | 🟡 95% | 본인인증·결제·Help만 남음 |
| RBAC | 🟡 대기 | 가드 코드 완성, 백엔드 role 응답 대기 |
| 결제/본인인증 | 🔴 미연동 | PortOne v2 권장 |

---

## ✅ 완료된 항목

### 인프라
- ✅ Vue 3.5 + TS strict + Vite + Pinia + Vue Router 셋업
- ✅ 디자인 토큰 (`src/design/tokens.ts` ↔ `src/assets/main.css` CSS 변수 동기화)
- ✅ 디자인 프리미티브 — `Badge`, `Button`, `IconBase`, `RekitLogo`, `ApplianceGlyph`, `ProductTile`
- ✅ App.vue 레이아웃 스위처 (auth focused / search focused / checkout / admin / default)
- ✅ API 클라이언트 (`src/api/client.ts`) — JWT 자동 갱신, ApiError 클래스
- ✅ 설계 결정 완료
  - 결제 PG: **PortOne v2** (토스페이먼츠/카카오/네이버/토스 통합)
  - 본인인증: **PortOne v2** 패스 인증
  - 브랜드명: **rekit** 최종 확정

### 구매자 플로우 (전체 완료)
- ✅ **인증 4개**: `/auth/sign-in`, `/auth/sign-up`, `/auth/find-id`, `/auth/find-password`
- ✅ **카탈로그**: `/` (홈), `/products` (목록·필터·정렬·URL 동기화), `/products/:id` (상세)
- ✅ **검색**: `/search` (모바일 전용) + `SearchDropdown` (데스크탑)
- ✅ **장바구니**: `/cart` — 수량 조절, 개별/선택/전체 삭제, 배지 카운트
- ✅ **체크아웃 3단계**: `/checkout/identity` → `/checkout/order` → `/checkout/complete`
- ✅ **마이페이지 6개**: `/my`, `/my/orders`, `/my/orders/:id`, `/my/wishlist`, `/my/addresses`, `/my/profile`
- ✅ **정적 7개**: `/guide`, `/about`, `/help/faq`, `/help/contact`, `/help/notice`, `/legal/terms`, `/legal/privacy`

### 관리자 콘솔 (전체 완료)
- ✅ `AdminShell` — 반응형 사이드바 (≥1024px 고정, 미만 드로어)
- ✅ `/admin` 대시보드 — KPI, 매출 차트, 대기 주문, 인기 카테고리, 재고 알림 (API 연동)
- ✅ `/admin/orders` — 상태별 탭, 준비시작·송장입력·취소 워크플로우, CSV (API 연동)
- ✅ `/admin/products` — 목록·필터·검색·삭제 (API 연동)
- ✅ `/admin/products/new` — 5섹션 등록 폼 + `POST /admin/products` 연동
- ✅ `/admin/products/:id/edit` — 기존 상품 프리필 + `PATCH /admin/products/:id` 연동
- ✅ `/admin/members` — 회원 목록·검색·상태 변경 (API 연동)
- ✅ `/admin/sales` — 기간 선택, 매출 라인차트, 결제수단별, 상위 상품, CSV (API 연동)
- ✅ `/admin/categories` — 카테고리 CRUD (목록·추가·인라인 수정·삭제)

### API 연동 완료 목록
- ✅ Auth: sign-in/up/out, refresh, find-id, find-password, social callback
- ✅ User: `GET /users/me`, `PATCH /users/me`, `POST /users/me/password`
- ✅ Products: `GET /products`, `GET /products/:id`, `GET /products/:id/related`
- ✅ Cart: `GET/POST/PATCH/DELETE /cart`
- ✅ Wishlist: `GET/POST/DELETE /wishlist/:id`
- ✅ Addresses: 목록·추가·수정·삭제·기본설정 전체
- ✅ Orders (구매자): 목록·상세
- ✅ Admin Orders: 목록·상태변경·송장입력·취소·CSV
- ✅ Admin Products: 목록·상세·등록·수정·삭제
- ✅ Admin Members: 요약·목록·상태변경
- ✅ Admin Dashboard: 요약·차트·대기주문·인기카테고리·재고알림
- ✅ Admin Sales: 요약·타임시리즈·결제수단별·상위상품·CSV
- ✅ Admin Categories: 목록·추가·수정·삭제
- ✅ RBAC 라우터 가드 (`/admin/*` 진입 시 isAdmin 체크)

---

## 🔴 남은 작업 (우선순위 순)

### P1 — 체크아웃 플로우 완성

#### 본인인증 연동
- [ ] `src/views/checkout/IdentityView.vue`에 PortOne v2 패스 인증 연동
  - `POST /auth/identity/verify-request` (OTP 발송)
  - `POST /auth/identity/verify-confirm` (OTP 확인)
  - 인증 성공 시 `auth.user.verified = true` 업데이트

#### 결제 연동
- [ ] `src/views/checkout/OrderView.vue`에 PortOne v2 결제 연동
  - `POST /payments/init` — 결제 초기화 (imp_uid, merchant_uid 발급)
  - PortOne SDK `IMP.request_pay()` 호출
  - `POST /payments/verify` — 결제 검증 (서버사이드)
  - 성공 시 `/checkout/complete?order=...`로 이동

> **백엔드 선행 작업**: `GET /users/me` 응답에 `role: "USER" | "ADMIN"` 추가 → RBAC 자동 활성화

### P2 — Help 페이지 API 연동
- [ ] `src/views/help/NoticeView.vue` → `GET /notices` (현재 하드코딩 배열)
- [ ] `src/views/help/FaqView.vue` → `GET /faqs` (현재 하드코딩 배열)
- [ ] `src/views/help/ContactView.vue` → `POST /help/contact` (현재 submit = `submitted.value = true`)

### P3 — Admin 미완성 기능
- [ ] 상품 이미지 업로드 — `PUT /admin/products/:id/images` 연동 (현재 이미지 슬롯은 시각적 mock)
  - 파일 선택 → presigned URL or FormData → url 배열로 서버 전달
- [ ] 주문 상세 뷰 — `GET /admin/orders/:orderNumber` (`OrdersView`의 "상세보기" 버튼)
- [ ] 회원 상세 뷰 — `GET /admin/members/:id`
- [ ] Admin 상품 등록/수정에서 이미지 순서 변경 UI

### P4 — 품질 / 마무리
- [ ] 구매자 주문 취소/환불 — `POST /orders/:id/cancel`, `POST /orders/:id/refund`
- [ ] 배송 조회 — `GET /orders/:id/tracking`
- [ ] 폼 검증 강화 (`vee-validate` + `zod` 또는 inline 유지 결정)
- [ ] 글로벌 Toast / 에러 바운더리 (현재 view마다 actionError ref)
- [ ] 낙관적 업데이트 (장바구니 수량, 위시리스트 토글)
- [ ] 접근성 (aria-label, 포커스 링, 키보드 내비)
- [ ] SEO (`<title>`, `<meta>`, OG)
- [ ] CI: type-check + build 자동화

---

## 결정이 필요한 항목 (잔여)

| # | 항목 | 상태 |
|---|------|------|
| D5 | 상품 이미지 호스팅: S3 / Cloudflare R2 / CDN | 미결정 — 이미지 업로드 구현 전 결정 필요 |
| D7 | 다크 모드 지원 여부 | 디자인엔 없음, 보류 |

> D1(백엔드), D2(소셜 로그인 일부), D3(PortOne), D4(PortOne), D6(RBAC) 모두 결정 완료.
