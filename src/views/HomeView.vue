<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { PRODUCTS, type ApplianceKind } from '@/data/products'
import IconBase from '@/components/ds/IconBase.vue'
import ApplianceGlyph from '@/components/ds/ApplianceGlyph.vue'
import ProductCard from '@/components/products/ProductCard.vue'
import HomePromiseModal from '@/components/home/HomePromiseModal.vue'
import type { IconName } from '@/design/icons'

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
      <span class="intro__text">폐업 매장 영업용 가전, 평균 73% 할인</span>
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

    <HomePromiseModal />
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
