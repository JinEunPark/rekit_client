<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { PRODUCTS, type ApplianceKind } from '@/data/products'
import IconBase from '@/components/ds/IconBase.vue'
import ApplianceGlyph from '@/components/ds/ApplianceGlyph.vue'
import ProductCard from '@/components/products/ProductCard.vue'
import type { IconName } from '@/design/icons'

type PromiseCard = {
  glyph?: ApplianceKind
  icon?: IconName
  tint: 'mint' | 'sand' | 'sage'
  title: string
  desc: string
  badge: string
}

const promises: PromiseCard[] = [
  {
    glyph: 'fridge',
    tint: 'mint',
    title: '모든 상품은 입고 시\n작동을 확인해요',
    desc: '검수를 통과한 상품만 등록되며, 도착 후 7일 이내 동작 불량은 전액 환불해드려요.',
    badge: '동작 보증',
  },
  {
    icon: 'truck',
    tint: 'sand',
    title: '서울·경기는 당일\n직배송도 가능해요',
    desc: '대형가전 전문 기사가 운반·설치까지 함께 진행해요. 무거운 가전, 걱정하지 않아도 돼요.',
    badge: '직배송',
  },
  {
    icon: 'leaf',
    tint: 'sage',
    title: '새 가전 가격의\n70~80% 정도예요',
    desc: '철거 현장에서 바로 도착해 평균 73% 할인. 합리적인 소비이자 친환경적인 선택이에요.',
    badge: '합리적',
  },
]

const categories: { id: string; label: string; kind: ApplianceKind | null; icon?: IconName }[] = [
  { id: 'fridge', label: '냉장고', kind: 'fridge' },
  { id: 'washer', label: '세탁기', kind: 'washer' },
  { id: 'tv', label: 'TV', kind: 'tv' },
  { id: 'aircon', label: '에어컨', kind: 'aircon' },
  { id: 'kitchen', label: '주방가전', kind: 'microwave' },
  { id: 'cleaner', label: '청소기', kind: 'vacuum' },
  { id: 'small', label: '소형가전', kind: null, icon: 'box' },
  { id: 'all', label: '전체', kind: null, icon: 'grid' },
]

const featured = PRODUCTS.slice(0, 8)
</script>

<template>
  <div class="home">
    <!-- Intro ribbon -->
    <RouterLink to="/guide" class="intro">
      <span class="intro__dot" />
      <span class="intro__text">철거 현장에서 바로 도착, 평균 73% 할인</span>
      <IconBase name="chevronRight" :size="14" class="intro__chevron" />
    </RouterLink>

    <!-- Categories -->
    <section class="cats">
      <h2 class="section-h">카테고리</h2>
      <div class="cats__grid">
        <RouterLink
          v-for="c in categories"
          :key="c.id"
          :to="`/products?cat=${c.id}`"
          class="cats__item"
        >
          <div class="cats__icon">
            <ApplianceGlyph v-if="c.kind" :kind="c.kind" />
            <IconBase v-else :name="c.icon!" :size="22" />
          </div>
          <span>{{ c.label }}</span>
        </RouterLink>
      </div>
    </section>

    <!-- Featured products -->
    <section class="feat">
      <div class="feat__head">
        <div>
          <div class="feat__kicker">NEW ARRIVAL</div>
          <h2 class="feat__title">오늘 들어온 매물</h2>
        </div>
        <RouterLink to="/products" class="feat__more">
          전체 보기
          <IconBase name="chevronRight" :size="14" />
        </RouterLink>
      </div>
      <div class="feat__grid">
        <ProductCard v-for="p in featured" :key="p.id" :product="p" />
      </div>
    </section>

    <!-- Promise cards -->
    <section class="promise">
      <header class="promise__head">
        <div class="promise__kicker">REKIT PROMISE</div>
        <h2 class="promise__h">rekit만의 약속</h2>
        <p class="promise__sub">철거 가전이지만 새 가전처럼 만나보세요</p>
      </header>
      <div class="promise__grid">
        <article
          v-for="p in promises"
          :key="p.badge"
          class="pcard"
          :class="`pcard--${p.tint}`"
        >
          <div class="pcard__avatar">
            <ApplianceGlyph v-if="p.glyph" :kind="p.glyph" />
            <IconBase v-else-if="p.icon" :name="p.icon" :size="40" :stroke="1.5" />
          </div>
          <h3 class="pcard__title">{{ p.title }}</h3>
          <p class="pcard__desc">{{ p.desc }}</p>
          <span class="pcard__badge">{{ p.badge }}</span>
        </article>
      </div>
    </section>

  </div>
</template>

<style scoped>
.home {
  max-width: 1280px;
  margin: 0 auto;
  padding: 16px 16px 32px;
}

.section-h {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 14px;
}

/* ====== INTRO RIBBON ====== */
.intro {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: var(--rekit-accent-soft);
  border-radius: 999px;
  text-decoration: none;
  color: var(--rekit-accent-ink);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.015em;
}

.intro__dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--rekit-accent);
  flex-shrink: 0;
}

.intro__text {
  flex: 1;
}

.intro__chevron {
  color: var(--rekit-accent-deep);
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .intro {
    padding: 14px 20px;
    font-size: 14px;
  }
}

@media (min-width: 768px) {
  .home {
    padding: 24px 32px 56px;
  }
}

/* ====== PROMISE ====== */
.promise {
  margin: 56px -16px 0;
  padding: 56px 16px;
  background: var(--rekit-surface-muted);
}

.promise__head {
  text-align: center;
  margin-bottom: 32px;
}

.promise__kicker {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--rekit-accent-deep);
}

.promise__h {
  margin: 8px 0 0;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.025em;
}

.promise__sub {
  margin: 8px 0 0;
  font-size: 13.5px;
  color: var(--rekit-ink-muted);
}

.promise__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  max-width: 1120px;
  margin: 0 auto;
}

/* card */
.pcard {
  background: var(--rekit-surface);
  border-radius: 24px;
  padding: 32px 28px 28px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-shadow: 0 1px 2px rgba(20, 20, 15, 0.03), 0 8px 24px rgba(20, 20, 15, 0.04);
}

.pcard__avatar {
  width: 80px;
  height: 80px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.pcard--mint .pcard__avatar {
  background: #e9f4ee;
  color: var(--rekit-accent-deep);
}
.pcard--sand .pcard__avatar {
  background: #f3ebdb;
  color: #9b6e2e;
}
.pcard--sage .pcard__avatar {
  background: #ecedd9;
  color: #5e7150;
}

.pcard__avatar > svg {
  width: 56px;
  height: 56px;
}

.pcard__title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.35;
  white-space: pre-line;
}

.pcard__desc {
  margin: 16px 0 0;
  font-size: 13.5px;
  color: var(--rekit-ink-muted);
  line-height: 1.65;
}

.pcard__badge {
  margin-top: 24px;
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--rekit-accent-soft);
  color: var(--rekit-accent-deep);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

@media (min-width: 768px) {
  .promise {
    margin: 72px -32px 0;
    padding: 80px 32px;
  }
  .promise__h {
    font-size: 30px;
  }
  .promise__sub {
    font-size: 14.5px;
  }
  .promise__grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  .pcard {
    padding: 40px 36px 32px;
  }
  .pcard__title {
    font-size: 22px;
  }
}

/* ====== CATEGORIES ====== */
.cats {
  margin-top: 32px;
}

.cats__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.cats__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: var(--rekit-ink);
  font-size: 12px;
  font-weight: 500;
}

.cats__icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--rekit-accent-soft);
  color: var(--rekit-accent-deep);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 9px;
}

.cats__icon > svg {
  width: 100%;
  height: 100%;
}

@media (min-width: 768px) {
  .cats {
    margin-top: 48px;
  }
  .cats__grid {
    grid-template-columns: repeat(8, 1fr);
    gap: 16px;
  }
  .cats__icon {
    width: 72px;
    height: 72px;
    border-radius: 20px;
  }
  .cats__item {
    font-size: 13px;
  }
}

/* ====== FEATURED ====== */
.feat {
  margin-top: 36px;
}

.feat__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 14px;
}

.feat__kicker {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--rekit-accent-deep);
}

.feat__title {
  margin: 4px 0 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.025em;
}

.feat__more {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--rekit-ink-muted);
  text-decoration: none;
}

.feat__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

@media (min-width: 640px) {
  .feat__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .feat__grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  .feat__title {
    font-size: 28px;
  }
}

</style>
