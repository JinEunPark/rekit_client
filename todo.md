# rekit — 실제 앱 구현 작업 목록

> 디자인 시안(`/_design/*`)을 레퍼런스로 두고, 실제 반응형 웹앱을 새로 만든다.
> 디자인 토큰·아이콘·더미 데이터·디자인 프리미티브(Badge/Button/IconBase/RekitLogo/ApplianceGlyph/ProductTile)는 **재사용**한다.
> 폰 프레임/9:41 상태바/홈 인디케이터/1440 고정 데스크탑 셸 등 캔버스 장식은 **버린다**.

## 현재 상태

- ✅ Vue 3 + TS + Vite + Pinia + Vue Router + ESLint/Prettier 셋업
- ✅ 디자인 시스템 토큰(`src/design/tokens.ts`)과 더미 데이터(`src/data/products.ts`)
- ✅ 디자인 프리미티브(`src/components/ds/*`)
- ✅ 디자인 시안 14개 화면을 `/_design/*`에 보존 (랜딩 `/`에서 진입)
- ❌ 실제 구매자 사이트
- ❌ 실제 관리자 콘솔
- ❌ 인증 / 상태 관리 / API 통신

## 결정이 필요한 항목

| # | 항목 | 비고 |
|---|---|---|
| D1 | 백엔드: 별도 API 서버 / Supabase / Firebase / Mock 만 | 결정 후 데이터 레이어 설계 |
| D2 | 인증 방식: 자체 이메일+OTP / 소셜(카카오·네이버) / 둘 다 | 디자인은 둘 다 반영 |
| D3 | 결제 PG: 토스페이먼츠 / KG이니시스 / 포트원 / 결제 없이 데모만 | |
| D4 | 본인인증 PG: 토스 / KCP / NICE / 생략 | |
| D5 | 상품 이미지 호스팅: S3 / Cloudflare R2 / 정적 / glyph 유지 | |
| D6 | 관리자 권한 분리: RBAC 필요? 단순 운영자 1롤? | |
| D7 | 다크 모드 지원 여부 | 디자인엔 없음 |

---

## Phase 0 — 공용 인프라

> 본격적인 화면을 만들기 전에 라우팅/레이아웃/상태/유틸 골격을 잡는다.

- [ ] **반응형 브레이크포인트 정의** (`src/design/breakpoints.ts`)
  - `sm: 640`, `md: 768`, `lg: 1024`, `xl: 1280` 정도
  - `useBreakpoint()` 컴포저블로 `isMobile / isTablet / isDesktop` 노출
- [ ] **Layout 분리**
  - `BuyerLayout.vue` — 헤더(좁으면 햄버거+로고+카트 / 넓으면 풀 네비), 본문, 푸터, 모바일 전용 하단 탭바
  - `AdminLayout.vue` — 좁으면 드로어 사이드바 / 넓으면 고정 사이드바
  - `BlankLayout.vue` — 인증, 결제완료 등 단독 화면용
- [ ] **메타 라우터 셋업**
  - 라우트별 `meta: { layout: 'buyer' | 'admin' | 'blank', requiresAuth?: boolean, requiresVerified?: boolean, role?: 'user' | 'admin' }`
  - 글로벌 가드에서 처리
- [ ] **Pinia 스토어 골격**
  - `useAuthStore` — user, login/logout, isAuthenticated, isVerified
  - `useCartStore` — items, add/remove/setQty, totals, persist (localStorage)
  - `useProductStore` — list, detail, filters (정렬/카테고리/가격대/등급)
  - `useOrderStore` — checkout draft, recentOrders
- [ ] **API 추상화 레이어**
  - `src/lib/api.ts` — fetch wrapper, base URL, 에러 처리
  - 처음에는 `src/data/products.ts`의 더미를 비동기처럼 흉내 내는 mock adapter
- [ ] **포맷 유틸**
  - 통화(`won`은 이미 있음), 날짜(`dayjs` 도입 검토), 전화번호 마스킹
- [ ] **공용 폼 컴포넌트**
  - `TextField`, `PhoneField`, `OtpField`, `Select`, `Checkbox`, `Radio`, `RadioCardGroup` (디자인의 라디오 카드)
  - `accent` focus, `danger` error state
- [ ] **공용 피드백 컴포넌트**
  - `Toast` (Pinia 기반 큐), `Modal`/`Sheet` (모바일 바텀시트 동작), `EmptyState`, `Skeleton`
- [ ] **에러/로딩 라우트**
  - `404 NotFound`, 글로벌 에러 바운더리

## Phase 1 — 구매자 사이트 (Buyer)

> 모바일 디자인과 데스크탑 디자인을 **하나의 반응형 페이지**로 합친다. CSS Grid/Flexbox + 컨테이너 쿼리 또는 미디어 쿼리로 분기.

### 1-1. 인증
- [ ] `/auth/sign-in` — 이메일+OTP 로그인 (디자인: `/_design/buyer/auth`)
- [ ] `/auth/sign-up` — 회원가입 (이메일·휴대폰 인증·약관)
- [ ] 카카오/네이버 OAuth 콜백 핸들링 (D2 결정 후)
- [ ] 로그아웃 / 자동 로그인 / 토큰 리프레시

### 1-2. 카탈로그
- [ ] `/` — 홈
  - 히어로(데스크탑은 카드 분할, 모바일은 단일 배너) — 디자인 `/_design/desktop/home` + `/_design/buyer/home`
  - 카테고리 칩 / 그리드
  - 신뢰 스트립(동작 보증·직배송·재사용)
  - "오늘 입고된 상품" 그리드 (모바일 2열, 태블릿 3열, 데스크탑 4열)
- [ ] `/products` — 상품 목록
  - 카테고리 필터 칩 (가로 스크롤 / 사이드 필터 분기)
  - 정렬: 최신/낮은가격/높은가격/할인율
  - 필터: 등급(A/B/C), 동작보증, 가격대, 브랜드
  - 활성 필터 칩 표시 + 개별 제거
  - URL 쿼리 동기화 (공유 가능)
  - 무한 스크롤 또는 페이지네이션
- [ ] `/products/:id` — 상품 상세
  - 이미지 갤러리(정면/측면/내부/흠집/뒷면/제품번호) — 모바일 스와이프, 데스크탑 좌우 그리드
  - 가격 카드, 등급 안내, 스펙 테이블, 중고 안내(고정 워닝 카드)
  - 배송 정보 카드
  - CTA: 좋아요 / 장바구니 / 바로 구매 (모바일은 sticky bottom)
- [ ] 좋아요(관심) — `useWishlistStore`
- [ ] 검색 — 모달/오버레이로 분리 가능

### 1-3. 장바구니 & 체크아웃
- [ ] `/cart`
  - 항목 선택, 수량 조절, 개별 삭제, 선택 삭제, 전체 선택
  - 결제 예상 금액 동적 계산
- [ ] `/checkout/identity` — 본인인증
  - 진행 단계 인디케이터 (1/3)
  - PG 연동 또는 mock (D4)
  - 인증 완료 시 `auth.isVerified = true`
- [ ] `/checkout/order` — 주문서 작성
  - 인증 정보 표시
  - 배송지 카드 + 변경 모달
  - 배송 메모
  - 배송 방식 선택 (라디오 카드)
  - 결제 수단 선택
  - 다크 결제 요약 카드
- [ ] `/checkout/complete?orderId=...` — 결제 완료
  - 동적 주문번호, 결제 정보, 배송 일정 (실제 응답 기반)

### 1-4. 마이페이지
- [ ] `/my` — 프로필 카드, 주문 통계(결제완료/준비중/배송중/배송완료)
- [ ] `/my/orders` — 주문 목록 / 상세
- [ ] `/my/wishlist` — 관심 상품
- [ ] `/my/addresses` — 배송지 CRUD
- [ ] `/my/profile` — 프로필 편집, 본인인증 상태
- [ ] 알림센터 / 공지사항 / 문의하기

## Phase 2 — 관리자 콘솔 (Admin)

> 사이드바가 진짜 반응형. 좁은 화면에서는 드로어, 넓은 화면에서는 고정.

- [ ] `/admin` — 대시보드
  - KPI 카드 4개 (실시간 갱신 또는 폴링)
  - 7일 매출 차트 (Chart.js / ECharts / d3 — 후보 결정 필요)
  - 처리 대기 주문 리스트
  - 인기 카테고리 / 재고 알림
- [ ] `/admin/products` — 상품 관리
  - 테이블: 정렬·필터·페이지네이션·일괄 선택
  - 상품 등록/수정 모달 또는 별도 라우트 `/admin/products/new`, `/admin/products/:id/edit`
  - 이미지 다중 업로드 (정면/측면/흠집…)
  - 상태 등급 자동 추천(추후) / 수동 지정
- [ ] `/admin/orders` — 주문 관리
  - 상태별 탭 카운트
  - 송장번호 입력 → 상태 전환 워크플로우
  - 주문 상세 사이드 패널
- [ ] `/admin/members` — 회원 관리
  - KPI, 인증/미인증/제재 필터, 회원 상세
  - 제재(블랙리스트) 토글
- [ ] `/admin/sales` — 매출 / 정산
  - 기간 선택기 (DateRangePicker)
  - 일별 매출 추이 라인차트
  - 결제수단별 진행바
  - 매출 상위 상품 리스트
  - CSV 내보내기 (서버 또는 클라이언트)

## Phase 3 — 데이터 / 인터랙션 채우기

- [ ] `useCartStore` localStorage 영속화 + SSR-safe (필요 시)
- [ ] 상품 좋아요/관심 영속화 + 로그인 시 서버 동기화
- [ ] 폼 검증 라이브러리 도입 (`vee-validate` + `zod` 또는 `valibot`)
- [ ] 결제 PG 연동 (D3 결정 후)
- [ ] 본인인증 PG 연동 (D4 결정 후)
- [ ] API 에러 → Toast / 폼 인라인 에러 매핑
- [ ] 낙관적 업데이트 (장바구니 수량 등)

## Phase 4 — 마무리

- [ ] 접근성 (포커스 링, aria-label, 키보드 내비, 스크린리더 라벨)
- [ ] 다국어 준비 (`vue-i18n` 도입 여부 결정)
- [ ] SEO: `<title>`, `<meta>`, OG, sitemap, robots
- [ ] 이미지 최적화 (`<img loading="lazy">`, 적절한 srcset)
- [ ] 성능: route-level code splitting (이미 ok), 큰 컴포넌트 lazy, 이미지 최적화
- [ ] 분석/이벤트 트래킹 (선택)
- [ ] 에러 모니터링 (Sentry 등)
- [ ] PWA 검토 (모바일 추가 설치 흐름)
- [ ] CI: lint, type-check, build, 테스트

## 테스트

- [ ] 단위: 토큰 유틸, 가격 계산, 카트 reducer
- [ ] 컴포넌트: 디자인 프리미티브 (Vitest + @vue/test-utils)
- [ ] 통합: 체크아웃 시나리오 (Playwright 또는 Cypress 중 결정)
- [ ] 시각 회귀(선택): Chromatic / Percy

## 디자인 시스템 보강

- [ ] 디자인 토큰을 CSS 변수와 TypeScript 양쪽에서 single source of truth로 (이미 부분적으로 됨, 일관화)
- [ ] Storybook 도입 검토 (디자인 프리미티브가 늘어나면)
- [ ] 추가 프리미티브: `Tabs`, `Dialog`, `Sheet`, `Drawer`, `Toast`, `Tooltip`, `Skeleton`
- [ ] 다크 모드 토큰 (D7 결정 후)

## 정리

- [ ] 디자인 레퍼런스(`/_design/*`) 경로를 production 빌드에서 제외할지 결정
  - 옵션 A: 항상 노출 (사내용)
  - 옵션 B: `import.meta.env.DEV`일 때만 등록
  - 옵션 C: 제거 후 별도 Storybook으로 이전
