<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import IconBase from '@/components/ds/IconBase.vue'
import Badge from '@/components/ds/Badge.vue'
import Button from '@/components/ds/Button.vue'
import ProductTile from '@/components/ds/ProductTile.vue'
import { useAuthStore } from '@/stores/auth'
import type { IconName } from '@/design/icons'

const router = useRouter()
const auth = useAuthStore()

const orderCounts = [
  { n: 1, l: '결제완료' },
  { n: 2, l: '준비중' },
  { n: 1, l: '배송중' },
  { n: 5, l: '배송완료' },
]

const menus: { i: IconName; t: string; n?: string; tone?: 'accent'; to: string }[] = [
  { i: 'heart', t: '관심상품', n: '12', to: '/my/wishlist' },
  { i: 'map', t: '배송지 관리', n: '2', to: '/my/addresses' },
  { i: 'shield', t: '본인인증 상태', n: '인증완료', tone: 'accent', to: '/my/profile' },
  { i: 'info', t: '공지사항', to: '/help/notice' },
  { i: 'mail', t: '문의하기', to: '/help/contact' },
]

function logout() {
  auth.logout()
  router.replace('/')
}
</script>

<template>
  <!-- Unauthenticated: friendly empty state guiding to login / sign-up -->
  <div v-if="!auth.user" class="my my--guest">
    <div class="guest">
      <div class="guest__icon">
        <IconBase name="user" :size="40" :stroke="1.5" />
      </div>
      <h1 class="guest__title">로그인하고<br />마이페이지를 확인하세요</h1>
      <p class="guest__sub">
        주문 내역과 배송 현황, 관심 상품을 한 곳에서<br class="guest__br" />
        간편하게 관리할 수 있어요.
      </p>
      <div class="guest__cta">
        <RouterLink to="/auth/sign-in" class="guest__btn guest__btn--primary">
          로그인
        </RouterLink>
        <RouterLink to="/auth/sign-up" class="guest__btn guest__btn--secondary">
          회원가입
        </RouterLink>
      </div>
      <ul class="guest__bullets">
        <li>
          <IconBase name="check" :size="14" :stroke="2.4" />
          주문·배송 상태 한 눈에 보기
        </li>
        <li>
          <IconBase name="check" :size="14" :stroke="2.4" />
          관심 가전 저장하고 재입고 알림 받기
        </li>
        <li>
          <IconBase name="check" :size="14" :stroke="2.4" />
          배송지·결제수단 미리 등록해두기
        </li>
      </ul>
    </div>
  </div>

  <div v-else class="my">
    <!-- Profile -->
    <section class="profile">
      <div class="profile__row">
        <div class="profile__avatar">{{ auth.initial }}</div>
        <div class="profile__info">
          <div class="profile__name">
            {{ auth.user.name }} 님
            <Badge v-if="auth.user.verified" tone="accent" size="xs">
              <IconBase name="shield" :size="9" /> 인증완료
            </Badge>
          </div>
          <div class="profile__email">{{ auth.user.email }}</div>
        </div>
        <RouterLink to="/my/profile" class="profile__edit" aria-label="프로필 수정">
          <IconBase name="settings" :size="18" />
        </RouterLink>
      </div>
      <div class="profile__eco">
        <IconBase name="leaf" :size="18" />
        <div>
          지금까지 <b>약 {{ auth.user.ecoKg }}kg</b>의 가전을 다시 살렸어요
        </div>
      </div>
    </section>

    <!-- Order summary -->
    <section class="block">
      <div class="block__head">
        <h2>주문 / 배송</h2>
        <RouterLink to="/my/orders" class="block__more">전체보기</RouterLink>
      </div>
      <div class="counts">
        <RouterLink
          v-for="(s, i) in orderCounts"
          :key="s.l"
          :to="`/my/orders?status=${s.l}`"
          class="counts__cell"
          :class="{ 'counts__cell--last': i === orderCounts.length - 1 }"
        >
          <div class="counts__n">{{ s.n }}</div>
          <div class="counts__l">{{ s.l }}</div>
        </RouterLink>
      </div>
    </section>

    <!-- Recent order -->
    <section class="block">
      <div class="block__head">
        <h2>진행 중인 주문</h2>
      </div>
      <article class="recent">
        <header class="recent__head">
          <Badge tone="info" size="sm">배송중</Badge>
          <span class="recent__id">RK-26050001</span>
        </header>
        <div class="recent__body">
          <div class="recent__thumb">
            <ProductTile kind="fridge" tone="mint" ratio="1/1" radius="12px" :show-label="false" />
          </div>
          <div class="recent__info">
            <div class="recent__title">삼성 양문형 냉장고 384L 외 2건</div>
            <div class="recent__sub">5월 3일(토) 도착 예정</div>
            <div class="recent__actions">
              <Button variant="secondary" size="sm">배송조회</Button>
              <Button variant="secondary" size="sm">주문상세</Button>
            </div>
          </div>
        </div>
      </article>
    </section>

    <!-- Menu list -->
    <section class="block">
      <div class="menu">
        <RouterLink
          v-for="(m, i) in menus"
          :key="m.t"
          :to="m.to"
          class="menu__row"
          :class="{ 'menu__row--last': i === menus.length - 1 }"
        >
          <IconBase :name="m.i" :size="18" class="menu__icon" />
          <span class="menu__label">{{ m.t }}</span>
          <span v-if="m.n" class="menu__meta" :class="{ 'menu__meta--accent': m.tone === 'accent' }">
            {{ m.n }}
          </span>
          <IconBase name="chevronRight" :size="16" class="menu__chevron" />
        </RouterLink>
      </div>
    </section>

    <button type="button" class="logout" @click="logout">
      <IconBase name="arrowRight" :size="14" /> 로그아웃
    </button>
  </div>
</template>

<style scoped>
.my {
  max-width: 720px;
  margin: 0 auto;
  padding: 16px 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (min-width: 768px) {
  .my {
    padding: 32px 24px 56px;
    gap: 24px;
  }
}

/* ====== GUEST EMPTY STATE ====== */
.my--guest {
  min-height: calc(100vh - 64px);
  align-items: center;
  justify-content: center;
  padding: 48px 20px 32px;
}
.guest {
  width: 100%;
  max-width: 380px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.guest__icon {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  background: var(--rekit-accent-soft);
  color: var(--rekit-accent-deep);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}
.guest__title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.35;
}
.guest__sub {
  margin: 12px 0 0;
  font-size: 13.5px;
  color: var(--rekit-ink-muted);
  line-height: 1.6;
}
.guest__br {
  display: none;
}
.guest__cta {
  margin-top: 28px;
  display: flex;
  gap: 8px;
  width: 100%;
}
.guest__btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 52px;
  border-radius: 12px;
  font-size: 14.5px;
  font-weight: 700;
  letter-spacing: -0.015em;
  text-decoration: none;
  transition: opacity 0.12s;
}
.guest__btn--primary {
  background: var(--rekit-accent);
  color: #fff;
}
.guest__btn--secondary {
  background: var(--rekit-surface);
  color: var(--rekit-ink);
  border: 1px solid var(--rekit-border);
}
.guest__btn:hover {
  opacity: 0.9;
}
.guest__bullets {
  margin: 28px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}
.guest__bullets li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--rekit-surface-muted);
  border-radius: 10px;
  font-size: 12.5px;
  color: var(--rekit-ink-muted);
  text-align: left;
}
.guest__bullets svg {
  color: var(--rekit-accent-deep);
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .guest__title {
    font-size: 26px;
  }
  .guest__br {
    display: inline;
  }
}

/* ====== PROFILE ====== */
.profile {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 20px;
  padding: 20px;
}
.profile__row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.profile__avatar {
  width: 52px;
  height: 52px;
  border-radius: 999px;
  background: var(--rekit-accent-soft);
  color: var(--rekit-accent-deep);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
  flex-shrink: 0;
}
.profile__info {
  flex: 1;
  min-width: 0;
}
.profile__name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.profile__email {
  margin-top: 2px;
  font-size: 12px;
  color: var(--rekit-ink-subtle);
}
.profile__edit {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--rekit-ink-muted);
  text-decoration: none;
}
.profile__edit:hover {
  background: var(--rekit-surface-muted);
  color: var(--rekit-ink);
}
.profile__eco {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: var(--rekit-accent-soft);
  color: var(--rekit-accent-ink);
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 600;
}
.profile__eco svg {
  color: var(--rekit-accent-deep);
  flex-shrink: 0;
}

/* ====== BLOCK ====== */
.block__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 10px;
}
.block__head h2 {
  margin: 0;
  font-size: 14.5px;
  font-weight: 700;
  letter-spacing: -0.015em;
}
.block__more {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--rekit-ink-muted);
  text-decoration: none;
}
.block__more:hover {
  color: var(--rekit-ink);
}

/* ====== ORDER COUNTS ====== */
.counts {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  padding: 14px 0;
  display: flex;
}
.counts__cell {
  flex: 1;
  text-align: center;
  border-right: 1px solid var(--rekit-border);
  text-decoration: none;
  color: inherit;
  padding: 4px 0;
}
.counts__cell--last {
  border-right: none;
}
.counts__cell:hover {
  background: var(--rekit-surface-muted);
}
.counts__n {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.counts__l {
  font-size: 11px;
  margin-top: 2px;
  color: var(--rekit-ink-subtle);
}

/* ====== RECENT ORDER ====== */
.recent {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  padding: 16px;
}
.recent__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.recent__id {
  font-size: 11.5px;
  color: var(--rekit-ink-subtle);
  font-family: var(--rekit-font-mono);
}
.recent__body {
  display: flex;
  gap: 12px;
}
.recent__thumb {
  width: 64px;
  flex-shrink: 0;
}
.recent__info {
  flex: 1;
  min-width: 0;
}
.recent__title {
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: -0.015em;
}
.recent__sub {
  margin-top: 2px;
  font-size: 12px;
  color: var(--rekit-ink-subtle);
}
.recent__actions {
  margin-top: 10px;
  display: flex;
  gap: 6px;
}

/* ====== MENU ====== */
.menu {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  overflow: hidden;
}
.menu__row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--rekit-border);
  text-decoration: none;
  color: inherit;
}
.menu__row--last {
  border-bottom: none;
}
.menu__row:hover {
  background: var(--rekit-surface-muted);
}
.menu__icon {
  color: var(--rekit-ink-muted);
  flex-shrink: 0;
}
.menu__label {
  flex: 1;
  font-size: 13.5px;
  font-weight: 500;
}
.menu__meta {
  font-size: 12px;
  color: var(--rekit-ink-subtle);
  font-weight: 600;
}
.menu__meta--accent {
  color: var(--rekit-accent-deep);
}
.menu__chevron {
  color: var(--rekit-ink-subtle);
  flex-shrink: 0;
}

/* ====== LOGOUT ====== */
.logout {
  align-self: center;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 10px 16px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--rekit-ink-subtle);
  letter-spacing: -0.01em;
}
.logout:hover {
  color: var(--rekit-ink-muted);
}
</style>
