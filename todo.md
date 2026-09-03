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
| 결제 | 🟢 토스페이먼츠 위젯 연동 | 계좌이체(무통장입금) → **토스페이먼츠 결제 위젯**으로 교체. 프론트 위젯(clientKey)+백엔드 승인(`/payments/init`·`/payments/confirm`) 연동 완료 (아래 참고) |
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
  - 결제: ~~PortOne v2~~ → ~~계좌이체(무통장입금)~~ → **토스페이먼츠 결제 위젯**으로 확정 (`OrderView.vue` + `/checkout/payment*`, 백엔드 `/payments/init`·`/payments/confirm`). `docs/api.md` §10은 아직 옛 스펙 — 최신화 필요
  - 본인인증: PortOne v2 패스 인증 예정이나 **아직 미구현** (mock 유지 중) — ⚠️ 단, 휴대폰 번호 인증 자체는 이후 **Octomo QR 방식**으로 실연동됨(`src/api/users.ts`의 `/users/me/phone/send-verification`·`/verify`, `PhoneVerifyForm.vue`). 이 문서의 "본인인증 OTP" 관련 옛 설명(`/auth/identity/verify-*`)은 실제 구현과 다르므로 아래 P1 참고
  - 브랜드명: **rekit** 최종 확정
- ✅ `docs/api.md` 부분 최신화 시작 — 실제 백엔드(`/openapi.json`, 79 endpoints) 기준으로 §1.3(응답이 실제로는 `{data}` 래핑 없음)·§1.5·§1.6·§2(도메인 요약표) 정정. §3~§10 섹션별 상세 재작성은 아직 안 끝남(아래 남은 작업 참고)
- ✅ 네이버 로그인 검수 준비 점검 — 로그인 버튼 디자인(초록 `#03C75A`+흰 N, `SignInView.vue`)·CSRF state 검증(`CallbackView.vue`)은 이미 기준 충족. 개인정보처리방침 §1에 소셜 로그인(카카오/네이버/구글) 수집 항목 문구 추가(`PrivacyView.vue`). 회원탈퇴 관련 이슈는 발견만 하고 아래 남은 작업으로 이관

### 구매자 플로우 (전체 완료)
- ✅ **인증 4개**: `/auth/sign-in`, `/auth/sign-up`, `/auth/find-id`, `/auth/find-password`
- ✅ **카탈로그**: `/` (홈), `/products` (목록·필터·정렬·URL 동기화), `/products/:id` (상세)
- ✅ **검색**: `/search` (모바일 전용) + `SearchDropdown` (데스크탑)
- ✅ **장바구니**: `/cart` — 수량 조절, 개별/선택/전체 삭제, 배지 카운트
- ✅ **체크아웃**: `/checkout/identity` → `/checkout/order` → (토스 결제창) → `/checkout/payment`(승인) 또는 `/checkout/payment/fail`(취소·실패) → `/checkout/complete`
- ✅ **마이페이지 7개**: `/my`, `/my/orders`, `/my/orders/:id`, `/my/wishlist`, `/my/addresses`, `/my/profile`, `/my/contacts`(+`:id`) — 내 문의내역 신규
- ✅ **정적 7개**: `/guide`, `/about`, `/help/faq`, `/help/contact`, `/help/notice`, `/legal/terms`, `/legal/privacy`
- ✅ **Help 상세**: `/help/notice/:id` (공지사항 상세) 신규 추가
- ✅ **문의하기 로그인 필수 전환**: `/help/contact`가 비로그인 시 폼 대신 로그인 유도 화면 표시, 제출 성공 시 `/my/contacts`로 안내
- ✅ **토스페이먼츠 결제 위젯 연동** — 계좌이체(무통장입금) 전용 → 토스 결제 위젯으로 교체
  - `OrderView.vue`: 결제방법 자리에 `renderPaymentMethods` + `renderAgreement` 위젯 렌더. 결제 클릭 시 `orders.create` → `POST /payments/init`(확정 금액) → `widgets.requestPayment`(redirect)
  - `PaymentReturnView.vue`(`/checkout/payment`, successUrl): `POST /payments/confirm` 호출. 성공→`/checkout/complete`, 422→실패 안내, 502(게이트웨이 미확정)→"결제 확인 중" 후 주문내역
  - `PaymentFailView.vue`(`/checkout/payment/fail`, failUrl): 취소/인증실패 코드·사유 표시 + 재시도 동선
  - `CompleteView.vue`: 무통장 입금안내 카드 제거, confirm 응답의 카드사·할부 정보 표기("신한카드 1234 · 일시불")
  - `src/api/admin/payments.ts` → `src/api/payments.ts` 이동(buyer 플로우), `src/config/payments.ts`(공개 clientKey만), `src/composables/usePaymentHandoff.ts`(승인 결과 sessionStorage 핸드오프)
  - 키: `.env.local`의 `VITE_TOSS_CLIENT_KEY`(공개 clientKey만, 기본값=토스 문서용 테스트 키). 시크릿 키는 백엔드 전용 — 프론트에서 토스 API 직접 호출 안 함
  - 로컬 테스트 하네스: `dev/tossMockPlugin.ts` — `.env.local`에 `TOSS_TEST_SECRET_KEY`(비-VITE) 있으면 Vite dev 서버가 `/payments/{init,confirm}`만 가로채 토스로 중계, 나머지 `/api/v1/*`는 백엔드로 프록시. 절차: [docs/payment-testing.md](docs/payment-testing.md)
  - ⚠️ 남은 것: `DepositInfoCard.vue`는 이제 미사용(무통장 복원 대비 파일만 유지). 본인 계정 테스트 clientKey/secretKey 세트로 교체 시 백엔드도 같은 계정으로 맞춰야 함

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
- ✅ `/admin/products/{new,:id/edit}` 데스크톱 사이드바 스크롤 문제 수정 — `.aside`가 뷰포트보다 길 때 `position: sticky`로 하단(등록 체크리스트·등록 버튼)이 가려져 스크롤로 닿을 수 없던 문제. `max-height: calc(100vh - 88px - 24px)` + `overflow-y: auto`로 넘칠 때만 내부 스크롤 허용
- ✅ 운영 배포에서만 전 페이지 스크롤 불가 — 프리렌더(`scripts/prerender.mjs`)가 홈 최초 진입 모달(`HomePromiseModal`)이 `body{overflow:hidden}`을 잠근 순간을 캡처해 `dist/index.html`에 굳었고, 이 HTML이 SPA fallback인 모든 비프리렌더 라우트(`/admin/*`, `/products/:id`, `/cart`, `/my/*` 등)에서 스크롤을 막았다. 스냅샷 저장 전 `[role="dialog"]` 제거 + `body/html` overflow 리셋 추가
  - ✅ 위 버그 구조적 차단(A+B) — (A) 프리렌더 헤드리스 브라우저에 `window.__PRERENDER__` 주입, `HomePromiseModal`이 이 플래그면 마운트 시 안 열림(실제 사용자에겐 플래그 없음 → 정상 동작). (B) 프리렌더 후 각 스냅샷 `<body>/<html>`에 `overflow:hidden`/`position:fixed`가 남으면 빌드 실패

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

#### 결제 (토스페이먼츠 위젯 연동 후 잔여)
> 계좌이체(무통장입금) → 토스 결제 위젯으로 교체 완료. `orders.create` → `/payments/init` → `widgets.requestPayment` → successUrl(`/checkout/payment`)에서 `/payments/confirm`.
- [ ] 결제 취소/중단 시 앞서 생성된 `PENDING` 주문 정리 — 현재는 `PaymentReturnView`/`OrderView`가 취소된 주문을 남겨둠(재시도 시 새 주문 생성). 백엔드 만료 처리 또는 프론트 `orders.cancel` 정리 결정 필요
- [ ] `DepositInfoCard.vue` 제거 여부 결정 (무통장 복원 대비 현재는 미사용 파일로 유지)
- [ ] 가상계좌(`WAITING_FOR_DEPOSIT`) 선택 시 입금 안내 화면 — 현재 `CompleteView` PENDING 분기는 "결제 확인 중" 문구만
- [ ] `docs/api.md` §10 Payments를 토스 위젯 + `/payments/init`·`/payments/confirm` 기준으로 최신화

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
- SEO — 1·2단계 완료 (2026-08-30 세션)
  - ✅ `@unhead/vue` 도입 (`main.ts` 플러그인, `src/composables/usePageSeo.ts` 헬퍼)
  - ✅ 라우트별 `<title>`·`description`·`canonical`·OG/트위터 메타 — 홈/상품목록/상품상세/소개/가이드/FAQ/문의/공지/약관/개인정보
  - ✅ `index.html` `lang="ko"` + 기본 메타, `public/robots.txt`, `public/sitemap.xml`(`scripts/gen-sitemap.mjs`, build 시 자동 생성)
  - ✅ 비공개 경로(`/admin` `/my` `/cart` `/checkout` `/auth` `/search` `/_design`)·404 는 `noindex` (App.vue 전역 처리)
  - ✅ `public/og-cover.png` (1200×630) — `scripts/gen-og.mjs`(@resvg/resvg-js)로 생성, `npm run gen-og`로 재생성
  - ✅ **2단계 프리렌더** — `scripts/prerender.mjs`(puppeteer)가 빌드된 SPA를 공개 라우트 9개에서 렌더해 `dist/<route>/index.html`+`dist/<route>.html` 생성. `build-only`에 연결. `SKIP_PRERENDER=1`로 우회. 라우트 목록은 `scripts/public-routes.mjs` 공유. vite-ssg 아님(vue-router 5 미지원) — 앱 코드 무수정 방식 채택
  - ✅ **키워드 정조준 (2026-09-04 세션)** — "업소용 중고가전" 계열 검색어 대응. 홈 `<title>`/`description` + sr-only `<h1>`(`.rekit-sr-only` 유틸 `main.css` 추가), `usePageSeo` 기본 타이틀, `index.html` 정적 메타 교체. `/products` 는 `CATEGORY_SEO` 맵으로 카테고리별 `<title>`·`description`·`<h1>` 분기(냉장고→"업소용 중고 냉장고" 등), canonical 은 `/products` 고정 유지. 상품 상세 `<title>` 에 "중고"·브랜드·`| rekit` 포함
  - [ ] **배포 후 필수**: nginx `try_files $uri $uri/ /index.html;` 확인 (프리렌더 파일이 서빙돼야 함). 검증: `curl -s https://rekit.co.kr/about/ | grep '<title>'` → "rekit 소개" 나와야 함
  - [ ] 배포 후: Google Search Console sitemap 재크롤 요청 + `/` 색인 요청 + "업소용 중고가전" 노출수 추적 시작
  - [ ] 카테고리 랜딩을 sitemap 에 추가 검토 (`/products?cat=…` — canonical 이 `/products` 라 색인 이득 제한적, 별도 경로 `/c/:slug` 신설이 정석)
  - [ ] `www`→루트 301
  - [ ] 3단계: JSON-LD (Organization/Product), 상품 상세 프리렌더(백엔드 연동 후)
  - [ ] `docs/api.md` 등 `rekit.kr` → `rekit.co.kr` 참조 정리
  - **🧪 직접 테스트 (2026-09-05, 키워드 커밋 `7c49c05` 배포 후)**
    - [ ] 로컬 확인: `npm run build && npx serve dist` → 브라우저 탭 제목이 홈="업소용 중고가전 직거래…", `/products`="업소용 중고가전 전체…" 로 뜨는지
    - [ ] `/products?cat=refrigerator` 진입 시 화면 h1 이 "업소용 중고 냉장고", 탭 제목도 "업소용 중고 냉장고 - 영업용 냉장고·냉동고…" 로 바뀌는지 (에어컨·주방·세탁기도 각각 다르게)
    - [ ] `/products?q=제빙기` 검색 시 h1·제목이 "'제빙기' 검색 결과" 로 (카테고리 카피 안 나와야)
    - [ ] 상품 상세 탭 제목이 "브랜드 모델명 중고 — 890,000원 | rekit" 형태인지
    - [ ] 홈 sr-only h1 이 화면엔 안 보이는데(레이아웃 안 밀림) 개발자도구 Elements 엔 있는지, 모바일에서도 깨진 여백 없는지
    - [ ] **배포 후 프로덕션**: `curl -s https://rekit.co.kr/ | grep '<title>'` / `curl -s https://rekit.co.kr/products/ | grep '<title>'` 새 제목 나오는지 (nginx `try_files` 확인 겸)
    - [ ] 배포 후 Google Search Console → URL 검사로 `https://rekit.co.kr/` 와 `/products` "실사용 테스트" → 렌더된 HTML 에 새 title/h1 보이는지 → 색인 요청
    - [ ] 네이버 서치어드바이저 → 웹페이지 수집 요청 (홈 + /products)
    - [ ] 카카오톡/슬랙에 https://rekit.co.kr 링크 붙여넣어 미리보기 제목·설명·이미지(og-cover) 정상인지
- [ ] CI: type-check + build 자동화

---

## 결정이 필요한 항목 (잔여)

| # | 항목 | 상태 |
|---|------|------|
| D7 | 다크 모드 지원 여부 | 디자인엔 없음, 보류 |
| D8 | ~~결제 PG 재도입 여부~~ | ✅ 해결 — 토스페이먼츠 결제 위젯으로 확정, 연동 완료. `docs/api.md` §10 최신화만 남음 |

> D1(백엔드), D2(소셜 로그인 일부), D5(이미지 호스팅 — 실연동 완료로 해소), D6(RBAC) 모두 결정 완료. D3/D4(PortOne)는 실제 구현이 계좌이체로 바뀌어 D8로 재오픈.
