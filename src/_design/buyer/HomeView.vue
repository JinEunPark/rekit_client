<script setup lang="ts">
import { REKIT } from '@/design/tokens'
import { won } from '@/design/tokens'
import { PRODUCTS, discountPct } from '@/data/products'
import PhoneShell from '@/_design/components/PhoneShell.vue'
import TabBar from '@/_design/components/TabBar.vue'
import HomeIndicator from '@/_design/components/HomeIndicator.vue'
import RekitLogo from '@/components/ds/RekitLogo.vue'
import IconBase from '@/components/ds/IconBase.vue'
import ApplianceGlyph from '@/components/ds/ApplianceGlyph.vue'
import ProductTile from '@/components/ds/ProductTile.vue'
import Badge from '@/components/ds/Badge.vue'
import type { ApplianceKind } from '@/data/products'
import type { IconName } from '@/design/icons'

const cats = ['냉장고', '세탁기', 'TV', '에어컨', '주방가전', '청소기', '소형가전', '전체']
const kinds: (ApplianceKind | IconName)[] = ['fridge', 'washer', 'tv', 'aircon', 'microwave', 'vacuum', 'microwave', 'grid']

const trust: { i: IconName; t: string; s: string }[] = [
  { i: 'shield', t: '동작 보증', s: '검수 완료' },
  { i: 'truck', t: '직배송', s: '서울/경기' },
  { i: 'leaf', t: '친환경', s: '재사용' },
]

const featured = PRODUCTS.slice(0, 4)
</script>

<template>
  <PhoneShell>
    <div class="header">
      <RekitLogo :size="22" />
      <div class="header__icons">
        <IconBase name="bell" :size="22" />
        <IconBase name="cart" :size="22" />
      </div>
    </div>

    <div class="search">
      <div class="search__bar" :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }">
        <IconBase name="search" :size="18" :style="{ color: REKIT.color.inkSubtle }" />
        <span :style="{ color: REKIT.color.inkPlaceholder }">모델명, 브랜드 검색</span>
      </div>
    </div>

    <div class="scroll rekit-no-scrollbar">
      <div class="hero-wrap">
        <div class="hero">
          <div class="hero__kicker">RE·CYCLE · RE·KLE</div>
          <div class="hero__title">버려질 가전이<br />다시 누군가의 집으로</div>
          <div class="hero__sub">철거 현장에서 직배송 · 평균 73% 할인</div>
          <div class="hero__deco">
            <ApplianceGlyph kind="fridge" :size="140" tone="#fff" />
          </div>
        </div>
      </div>

      <div class="cats">
        <div v-for="(c, i) in cats" :key="c" class="cats__item">
          <div class="cats__icon" :style="{ background: REKIT.color.accentSoft }">
            <div v-if="i < 6" style="width: 38px; height: 38px">
              <ApplianceGlyph :kind="(kinds[i] as ApplianceKind)" :tone="REKIT.color.accentDeep" />
            </div>
            <IconBase v-else :name="(kinds[i] as IconName)" :size="22" :style="{ color: REKIT.color.accentDeep }" />
          </div>
          <span>{{ c }}</span>
        </div>
      </div>

      <div class="trust">
        <div
          class="trust__card"
          :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }"
        >
          <div v-for="x in trust" :key="x.t" class="trust__item">
            <IconBase :name="x.i" :size="20" :style="{ color: REKIT.color.accent }" />
            <div class="trust__t">{{ x.t }}</div>
            <div class="trust__s" :style="{ color: REKIT.color.inkSubtle }">{{ x.s }}</div>
          </div>
        </div>
      </div>

      <div class="section-title">
        <div>
          <div class="section-title__h">오늘 입고된 상품</div>
          <div class="section-title__s" :style="{ color: REKIT.color.inkSubtle }">
            새 현장에서 막 도착했어요
          </div>
        </div>
        <span class="section-title__more" :style="{ color: REKIT.color.inkMuted }">
          전체 <IconBase name="chevronRight" :size="14" />
        </span>
      </div>

      <div class="grid">
        <RouterLink v-for="p in featured" :key="p.id" to="/_design/buyer/detail" class="card">
          <ProductTile :kind="p.kind" :tone="p.tone" :grade="p.grade" ratio="1/1" />
          <div class="card__body">
            <div class="card__brand" :style="{ color: REKIT.color.inkSubtle }">{{ p.brand }} · {{ p.year }}</div>
            <div class="card__title">{{ p.title }}</div>
            <div class="card__price">
              <span class="card__pct" :style="{ color: REKIT.color.danger }">{{ discountPct(p) }}%</span>
              <span class="card__won">{{ won(p.price) }}</span>
            </div>
            <div v-if="p.warranty" class="card__warranty">
              <Badge tone="accent" size="xs">
                <IconBase name="check" :size="10" /> 동작보증
              </Badge>
            </div>
          </div>
        </RouterLink>
      </div>

      <div style="height: 8px" />
    </div>

    <TabBar active="home" />
    <HomeIndicator />
  </PhoneShell>
</template>

<style scoped>
.header {
  padding: 8px 20px 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--rekit-bg);
}
.header__icons {
  display: flex;
  gap: 12px;
}
.search {
  padding: 10px 20px 12px;
}
.search__bar {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 16px;
  padding: 12px 14px;
  font-size: 14px;
}
.scroll {
  overflow-y: auto;
  height: calc(844px - 48px - 60px - 86px);
}
.hero-wrap {
  padding: 4px 20px 20px;
}
.hero {
  background: linear-gradient(135deg, #2d7a60, #4fa88b);
  color: #fff;
  border-radius: 20px;
  padding: 22px 20px;
  position: relative;
  overflow: hidden;
}
.hero__kicker {
  font-size: 11px;
  font-weight: 600;
  opacity: 0.85;
  letter-spacing: 0.04em;
  margin-bottom: 6px;
}
.hero__title {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.25;
}
.hero__sub {
  font-size: 12.5px;
  opacity: 0.85;
  margin-top: 8px;
}
.hero__deco {
  position: absolute;
  right: -10px;
  bottom: -10px;
  opacity: 0.18;
}
.cats {
  padding: 0 20px 16px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.cats__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.cats__item span {
  font-size: 12px;
  font-weight: 500;
}
.cats__icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.trust {
  padding: 0 20px 20px;
}
.trust__card {
  border-radius: 16px;
  padding: 14px 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  text-align: center;
}
.trust__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.trust__t {
  font-size: 12px;
  font-weight: 700;
}
.trust__s {
  font-size: 10.5px;
}
.section-title {
  padding: 4px 20px 12px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.section-title__h {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.section-title__s {
  font-size: 12px;
  margin-top: 2px;
}
.section-title__more {
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
.grid {
  padding: 0 20px 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.card {
  text-decoration: none;
  color: inherit;
  display: block;
}
.card__body {
  padding: 10px 2px 0;
}
.card__brand {
  font-size: 11px;
  font-weight: 600;
}
.card__title {
  font-size: 13px;
  font-weight: 600;
  margin-top: 2px;
  line-height: 1.35;
  letter-spacing: -0.015em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card__price {
  margin-top: 6px;
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.card__pct {
  font-size: 13px;
  font-weight: 800;
}
.card__won {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.card__warranty {
  margin-top: 6px;
}
</style>
