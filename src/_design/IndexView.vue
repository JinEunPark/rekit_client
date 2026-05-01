<script setup lang="ts">
import { REKIT } from '@/design/tokens'
import RekitLogo from '@/components/ds/RekitLogo.vue'
import IconBase from '@/components/ds/IconBase.vue'
import Badge from '@/components/ds/Badge.vue'

interface ScreenLink {
  to: string
  label: string
  size?: 'mobile' | 'desktop'
}

const sections: { id: string; title: string; subtitle: string; screens: ScreenLink[] }[] = [
  {
    id: 'buyer',
    title: '구매자 · 모바일',
    subtitle: '회원가입 → 홈 → 상품 → 결제 → 마이까지 9개 화면',
    screens: [
      { to: '/_design/buyer/auth', label: '01 회원가입 / 로그인' },
      { to: '/_design/buyer/home', label: '02 홈' },
      { to: '/_design/buyer/list', label: '03 상품 목록' },
      { to: '/_design/buyer/detail', label: '04 상품 상세' },
      { to: '/_design/buyer/cart', label: '05 장바구니' },
      { to: '/_design/buyer/identity', label: '06 본인인증' },
      { to: '/_design/buyer/order', label: '07 주문서 작성' },
      { to: '/_design/buyer/complete', label: '08 결제 완료' },
      { to: '/_design/buyer/my', label: '09 마이페이지' },
    ],
  },
  {
    id: 'desktop',
    title: 'Overview · Desktop',
    subtitle: '데스크탑 메인 + 상품 상세',
    screens: [
      { to: '/_design/desktop/home', label: '데스크탑 · 홈', size: 'desktop' },
      { to: '/_design/desktop/detail', label: '데스크탑 · 상품 상세', size: 'desktop' },
    ],
  },
  {
    id: 'admin',
    title: '관리자 · 데스크탑',
    subtitle: '운영을 위한 5개 콘솔 화면',
    screens: [
      { to: '/_design/admin', label: '01 대시보드', size: 'desktop' },
      { to: '/_design/admin/products', label: '02 상품 관리', size: 'desktop' },
      { to: '/_design/admin/orders', label: '03 주문 관리', size: 'desktop' },
      { to: '/_design/admin/members', label: '04 회원 관리', size: 'desktop' },
      { to: '/_design/admin/sales', label: '05 매출 / 정산', size: 'desktop' },
    ],
  },
]
</script>

<template>
  <div class="index">
    <RouterLink to="/" class="index__back">
      <IconBase name="arrowLeft" :size="14" />
      실제 앱으로
    </RouterLink>
    <header class="index__header">
      <RekitLogo :size="28" />
      <div class="index__header-text">
        <h1>철거 가전 직거래 플랫폼</h1>
        <p :style="{ color: REKIT.color.inkMuted }">
          실제 앱은 아직 구현되지 않았습니다. 현재 이 페이지에는 디자인 캔버스를 그대로 옮긴
          <b>14개의 디자인 레퍼런스 화면</b>만 보존되어 있습니다. 작업 계획은 프로젝트 루트의
          <code :style="{ background: REKIT.color.surfaceMuted, padding: '2px 6px', borderRadius: '4px', fontFamily: REKIT.font.mono, fontSize: '12px' }">todo.md</code>를
          참고하세요.
        </p>
      </div>
    </header>

    <div class="banner">
      <Badge tone="accent" size="md">DESIGN REFERENCE</Badge>
      <span>아래 화면은 디자인 시안의 1:1 포팅입니다 — 폰 프레임/9:41 상태바 등 캔버스 장식이 포함되어 있어요. 실제 반응형 사이트 구현은 별도로 진행됩니다.</span>
    </div>

    <main class="index__main">
      <section v-for="s in sections" :key="s.id" class="section">
        <div class="section__head">
          <h2>{{ s.title }}</h2>
          <span :style="{ color: REKIT.color.inkSubtle }">{{ s.subtitle }}</span>
        </div>
        <div class="section__grid">
          <RouterLink
            v-for="link in s.screens"
            :key="link.to"
            :to="link.to"
            class="link"
            :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }"
          >
            <span class="link__label">{{ link.label }}</span>
            <span class="link__meta" :style="{ color: REKIT.color.inkSubtle }">
              {{ link.size === 'desktop' ? '1440 × 900' : '390 × 844' }}
              <IconBase name="arrowRight" :size="14" />
            </span>
          </RouterLink>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.index {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 24px 96px;
}
.index__back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--rekit-ink-muted);
  text-decoration: none;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--rekit-border);
  margin-bottom: 24px;
}
.index__header {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 28px;
}
.index__header-text h1 {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin: 0 0 8px;
}
.index__header-text p {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
}
.banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--rekit-accent-soft);
  font-size: 12.5px;
  color: var(--rekit-accent-ink);
  margin-bottom: 36px;
  line-height: 1.55;
}
.index__main {
  display: flex;
  flex-direction: column;
  gap: 40px;
}
.section__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 16px;
}
.section__head h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.section__head span {
  font-size: 12px;
}
.section__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px;
}
.link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.08s ease;
}
.link:hover {
  transform: translateY(-1px);
}
.link__label {
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.link__meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--rekit-font-mono);
  font-size: 11px;
}
</style>
