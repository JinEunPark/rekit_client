# rekit — 작업 현황 (2026-07-06 기준)

> 디자인 시안(`/_design/*`)을 레퍼런스로 두고, 실제 반응형 웹앱 + 백엔드 API 연동 진행 중.

---

## 현재 상태 요약

| 영역 | 상태 | 비고 |
|------|------|------|
| 구매자 UI | ✅ 완성 | 전 화면 구현 완료 (내 문의내역 목록/상세 신규 추가) |
| 관리자 UI | ✅ 완성 | 전 화면 구현 + API 연동 완료 |
| 백엔드 API 연동 | 🟡 99% | 본인인증 포함 핵심 플로우 완료. 배송조회·마이페이지 최근주문 등 P2/P3 잔여 항목만 남음 |
| RBAC | ✅ 완료 | 백엔드가 `role` 응답, 라우터 가드(`isAdmin`) 활성화됨 |
| 결제 | 🟡 방식 변경됨 | PortOne PG → **계좌이체(무통장입금) 전용**으로 전환. 입금확인 관리 기능 필요 (아래 P1 참고) |
| 본인인증 | ✅ 완료 | Octomo QR 방식으로 실연동 (`IdentityView.vue` + `PhoneVerifyForm.vue`, `/users/me/phone/*`) |

---

## ✅ 완료된 항목

### 인프라
- ✅ Vue 3.5 + TS strict + Vite + Pinia + Vue Router 셋업
- ✅ 디자인 토큰 (`src/design/tokens.ts` ↔ `src/assets/main.css` CSS 변수 동기화)
- ✅ 디자인 프리미티브 — `Badge`, `Button`, `IconBase`, `RekitLogo`, `ApplianceGlyph`, `ProductTile`
- ✅ App.vue 레이아웃 스위처 (auth focused / search focused / checkout / admin / default)
- ✅ API 클라이언트 (`src/api/client.ts`) — JWT 자동 갱신, ApiError 클래스
- ✅ 설계 결정 완료
  - 결제: ~~PortOne v2~~ → **계좌이체(무통장입금) 전용**으로 실제 구현 변경됨 (`OrderView.vue` 참고, 고정 회사 계좌 + 주문번호로 입금자명 매칭). `docs/api.md` §10은 아직 PG 연동 기준으로 작성되어 실제와 불일치 — 최신화 필요
  - 본인인증: PortOne v2 패스 인증 예정이나 **아직 미구현** (mock 유지 중) — ⚠️ 단, 휴대폰 번호 인증 자체는 이후 **Octomo QR 방식**으로 실연동됨(`src/api/users.ts`의 `/users/me/phone/send-verification`·`/verify`, `PhoneVerifyForm.vue`). 이 문서의 "본인인증 OTP" 관련 옛 설명(`/auth/identity/verify-*`)은 실제 구현과 다르므로 아래 P1 참고
  - 브랜드명: **rekit** 최종 확정
- ✅ `docs/api.md` 부분 최신화 시작 — 실제 백엔드(`/openapi.json`, 79 endpoints) 기준으로 §1.3(응답이 실제로는 `{data}` 래핑 없음)·§1.5·§1.6·§2(도메인 요약표) 정정. §3~§10 섹션별 상세 재작성은 아직 안 끝남(아래 남은 작업 참고)
- ✅ 네이버 로그인 검수 준비 점검 — 로그인 버튼 디자인(초록 `#03C75A`+흰 N, `SignInView.vue`)·CSRF state 검증(`CallbackView.vue`)은 이미 기준 충족. 개인정보처리방침 §1에 소셜 로그인(카카오/네이버/구글) 수집 항목 문구 추가(`PrivacyView.vue`). 회원탈퇴 관련 이슈는 발견만 하고 아래 남은 작업으로 이관

### 구매자 플로우 (전체 완료)
- ✅ **인증 4개**: `/auth/sign-in`, `/auth/sign-up`, `/auth/find-id`, `/auth/find-password`
- ✅ **카탈로그**: `/` (홈), `/products` (목록·필터·정렬·URL 동기화), `/products/:id` (상세)
- ✅ **검색**: `/search` (모바일 전용) + `SearchDropdown` (데스크탑)
- ✅ **장바구니**: `/cart` — 수량 조절, 개별/선택/전체 삭제, 배지 카운트
- ✅ **체크아웃 3단계**: `/checkout/identity` → `/checkout/order` → `/checkout/complete`
- ✅ **마이페이지 7개**: `/my`, `/my/orders`, `/my/orders/:id`, `/my/wishlist`, `/my/addresses`, `/my/profile`, `/my/contacts`(+`:id`) — 내 문의내역 신규
- ✅ **정적 7개**: `/guide`, `/about`, `/help/faq`, `/help/contact`, `/help/notice`, `/legal/terms`, `/legal/privacy`
- ✅ **Help 상세**: `/help/notice/:id` (공지사항 상세) 신규 추가
- ✅ **문의하기 로그인 필수 전환**: `/help/contact`가 비로그인 시 폼 대신 로그인 유도 화면 표시, 제출 성공 시 `/my/contacts`로 안내

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
- ✅ `/admin/help` — 고객센터 관리 (공지사항/FAQ CRUD + 1:1 문의 목록·상세·답변 등록/수정, 답변 등록 시 이메일 자동 발송)
- ✅ `/admin/orders/:orderNumber` — 주문 상세 뷰 신규 (주문자/배송지/상품(썸네일·브랜드·모델명·수량·소계)/결제/배송 정보 + 준비시작·송장입력·취소 액션)
- ✅ `/admin/members/:id` — 회원 상세 뷰 신규 (기본정보/구매활동/인증상태)
- ✅ 상품 이미지 드래그 앤 드롭 순서변경 (기존 화살표 버튼과 병행 — 키보드 접근성 유지)
- ✅ `/admin/products/new` 폼 정리 — 브랜드/제조연도가 클릭해도 반응 없는 가짜 드롭다운 버튼이라 값이 아예 저장 안 되던 문제 수정(실제 input으로 교체), 카테고리 select 화살표 위치가 다른 필드와 어긋나 보이던 문제 수정, 백엔드 스키마에 없어 저장되지도 않던 "배송/A/S 정보" 카드 제거(재고 수량만 가격 정보 카드로 이동), 상품 이미지 최소 등록 수 4장→2장으로 변경(`ProductImageEditor` 기본값 기준으로 등록/수정 화면 통일), 미리보기 썸네일이 이미지 업로드해도 계속 placeholder만 보여주던 버그 수정

### API 연동 완료 목록
- ✅ Auth: sign-in/up/out, refresh, find-id, find-password, social callback
- ✅ User: `GET /users/me`, `PATCH /users/me`, `POST /users/me/password`
- ✅ Products: `GET /products`, `GET /products/:id`, `GET /products/:id/related`
- ✅ Cart: `GET/POST/PATCH/DELETE /cart`
- ✅ Wishlist: `GET/POST/DELETE /wishlist/:id`
- ✅ Addresses: 목록·추가·수정·삭제·기본설정 전체
- ✅ Orders (구매자): 목록·상세
- ✅ Admin Orders: 목록·상세·상태변경·송장입력·취소·CSV
- ✅ Admin Products: 목록·상세·등록·수정·삭제
- ✅ Admin Members: 요약·목록·상세·상태변경
- ✅ Admin Dashboard: 요약·차트·대기주문·인기카테고리·재고알림
- ✅ Admin Sales: 요약·타임시리즈·결제수단별·상위상품·CSV
- ✅ Admin Categories: 목록·추가·수정·삭제
- ✅ RBAC 라우터 가드 (`/admin/*` 진입 시 isAdmin 체크) — 백엔드 `role` 응답 연동 완료로 정식 활성화됨
- ✅ 상품 이미지 관리 실연동 (`POST/PUT /admin/products/:id/images`) + 상품 상세 갤러리/라이트박스
- ✅ 구매자 주문 취소/환불 요청 (`POST /orders/:id/cancel`, `POST /orders/:id/refund/request`) — `src/stores/orders.ts`
- ✅ Help (구매자): `GET /help/faqs`, `GET /help/notices`, `GET /help/notices/:id`
- ✅ Contact 1:1 문의 (구매자, 로그인 필수로 전환됨): `POST /help/contacts`, `GET /help/contacts`(내 목록), `GET /help/contacts/:id`(내 상세, 답변 포함) — `/my/contacts`(+`:id`)
- ✅ Help/Contact (관리자): 공지사항·FAQ CRUD (`/admin/notices`, `/admin/faqs`), 1:1 문의 목록·상세·답변 등록/수정 (`PATCH /admin/contacts/:id/answer`, 이메일 자동 발송), 상태 되돌리기 (`PATCH /admin/contacts/:id/status`)

---

## 🔴 남은 작업 (우선순위 순)

### P1 — 체크아웃 플로우 완성

> 본인인증(OTP 연동)은 완료됨 — Octomo QR 방식으로 실연동, 위 요약표 참고.

#### 네이버 로그인 검수 잔여 항목
- ✅ 소셜 전용 계정(`hasPassword=false`) 탈퇴 이슈 해소 — 백엔드가 `POST /auth/social/{provider}/reauth-for-withdrawal` 신규 추가(소셜 재인증으로 `withdrawalToken` 발급), `DELETE /users/me`가 `password`/`withdrawalToken` 분기 지원하도록 변경됨. 프론트 연동 완료: `src/config/oauth.ts`(purpose 플래그) · `src/views/auth/CallbackView.vue`(재인증 분기 처리) · `src/views/my/ProfileView.vue`(비밀번호 없는 계정은 소셜 재인증 버튼 노출) · `docs/api.md` §3.12/§4.1/§4.4 반영
- [ ] 네이버 개발자센터에서 서비스 URL/Callback URL을 실제 배포 도메인(https)으로 등록 후 검수 신청

#### 관리자 입금확인 처리 (신규 — 결제 방식 전환에 따른 후속 작업)
> 결제가 PortOne PG 연동에서 **계좌이체(무통장입금) 전용**으로 바뀌면서(`OrderView.vue`), 주문은 결제 게이트웨이 검증 없이 `PENDING` 상태로 바로 생성됨. 하지만 관리자 쪽에 입금을 확인하고 `PAID`로 전환하는 수단이 없음 — `src/views/admin/OrdersView.vue`의 탭에 `PENDING`이 없고, 대응하는 액션 버튼도 없음.
- [ ] `src/views/admin/OrdersView.vue`에 "결제대기(PENDING)" 탭 추가
- [ ] 입금 확인 액션 추가 — 기존 `updateAdminOrderStatus(orderNumber, 'PAID')` 재사용 가능한지 백엔드 확인 후 버튼 연결
- [ ] `docs/api.md` §10 Payments를 PG 연동 스펙 → 계좌이체 확인 플로우로 최신화 (현재 문서와 실제 구현이 어긋나 있음)

### P2 — 마이페이지 잔여 항목
- [ ] 배송 조회 버튼 — `src/views/my/OrdersView.vue`, `src/views/my/MyView.vue`의 "배송조회" 버튼이 현재 클릭 핸들러 없는 no-op. `GET /orders/:id/tracking` 연동 필요
- [ ] `src/views/my/MyView.vue` "최근 주문" 섹션이 하드코딩된 텍스트("삼성 양문형 냉장고 384L 외 2건") — 실제 주문 스토어 데이터로 교체 필요

### P3 — 품질 / 마무리
- [ ] `docs/api.md` §3(Auth)~§10(Payments) 상세 재작성 — 실제 백엔드와 어긋나는 옛 mock 스펙(엔드포인트 경로, 응답 포맷, 필드명)이 아직 남아있음. §1.3/1.5/1.6/§2는 정정 완료(2026-08 세션)
- [ ] `/help/contact` 문의 내용(content) 3000자 상한이 서버(422)만 강제 중 — `CONTACT_CONTENT_MAX_LENGTH`를 `src/api/help.ts`에 추가하고 textarea에 `maxlength` 적용 필요 (title/content min은 이미 클라이언트에서 검증 중)
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
| D7 | 다크 모드 지원 여부 | 디자인엔 없음, 보류 |
| D8 | 결제: PortOne PG 통합 재도입 여부 | 현재 계좌이체 전용으로 구현되어 있음. PG 재도입 계획이 있다면 확인 필요 — 없다면 `docs/api.md` §10을 계좌이체 기준으로 다시 쓰는 게 맞음 |

> D1(백엔드), D2(소셜 로그인 일부), D5(이미지 호스팅 — 실연동 완료로 해소), D6(RBAC) 모두 결정 완료. D3/D4(PortOne)는 실제 구현이 계좌이체로 바뀌어 D8로 재오픈.
