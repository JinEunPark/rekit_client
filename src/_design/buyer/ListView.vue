<script setup lang="ts">
import { REKIT, won } from '@/design/tokens'
import { PRODUCTS, CATEGORIES, discountPct } from '@/data/products'
import PhoneShell from '@/_design/components/PhoneShell.vue'
import TabBar from '@/_design/components/TabBar.vue'
import HomeIndicator from '@/_design/components/HomeIndicator.vue'
import IconBase from '@/components/ds/IconBase.vue'
import ProductTile from '@/components/ds/ProductTile.vue'

const filters = ['A급', '동작보증', '~30만원']
const items = PRODUCTS.slice(0, 6)
</script>

<template>
  <PhoneShell>
    <div class="header">
      <IconBase name="chevronLeft" :size="24" />
      <div
        class="header__search"
        :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }"
      >
        <IconBase name="search" :size="16" :style="{ color: REKIT.color.inkSubtle }" />
        <span>냉장고</span>
      </div>
      <IconBase name="cart" :size="22" />
    </div>

    <div class="cats rekit-no-scrollbar">
      <div
        v-for="(c, i) in CATEGORIES"
        :key="c.id"
        class="cats__pill"
        :style="{
          background: i === 1 ? REKIT.color.ink : REKIT.color.surface,
          color: i === 1 ? '#fff' : REKIT.color.ink,
          border: i === 1 ? 'none' : `1px solid ${REKIT.color.border}`,
        }"
      >
        {{ c.label }}
      </div>
    </div>

    <div class="filterbar" :style="{ borderBottom: `1px solid ${REKIT.color.border}` }">
      <div class="filterbar__count" :style="{ color: REKIT.color.inkMuted }">
        총 <b :style="{ color: REKIT.color.ink }">24</b>개
      </div>
      <div class="filterbar__right">
        <span class="filterbar__sort">
          최신순 <IconBase name="chevronDown" :size="12" />
        </span>
        <span class="filterbar__sort">
          <IconBase name="filter" :size="14" /> 필터
        </span>
      </div>
    </div>

    <div class="chips">
      <span
        v-for="c in filters"
        :key="c"
        class="chips__chip"
        :style="{ background: REKIT.color.accentSoft, color: REKIT.color.accentDeep }"
      >
        {{ c }}<IconBase name="close" :size="11" />
      </span>
    </div>

    <div class="scroll rekit-no-scrollbar">
      <div class="grid">
        <RouterLink v-for="p in items" :key="p.id" to="/_design/buyer/detail" class="card">
          <div style="position: relative">
            <ProductTile :kind="p.kind" :tone="p.tone" :grade="p.grade" ratio="1/1" />
            <div class="card__heart">
              <IconBase name="heart" :size="14" :style="{ color: REKIT.color.inkMuted }" />
            </div>
          </div>
          <div class="card__body">
            <div :style="{ fontSize: '11px', color: REKIT.color.inkSubtle, fontWeight: 600 }">
              {{ p.brand }} · {{ p.year }}
            </div>
            <div class="card__title">{{ p.title }}</div>
            <div class="card__price">
              <span class="card__pct" :style="{ color: REKIT.color.danger }">{{ discountPct(p) }}%</span>
              <span class="card__won">{{ won(p.price) }}</span>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>

    <TabBar active="cat" />
    <HomeIndicator />
  </PhoneShell>
</template>

<style scoped>
.header {
  padding: 4px 20px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--rekit-bg);
}
.header__search {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 12px;
  padding: 9px 12px;
  font-size: 13px;
}
.cats {
  padding: 0 16px 12px;
  display: flex;
  gap: 8px;
  overflow-x: auto;
}
.cats__pill {
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}
.filterbar {
  padding: 0 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.filterbar__count {
  font-size: 12px;
  padding-bottom: 8px;
}
.filterbar__right {
  display: flex;
  gap: 12px;
  align-items: center;
  padding-bottom: 8px;
}
.filterbar__sort {
  font-size: 12.5px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.chips {
  padding: 10px 20px 6px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.chips__chip {
  padding: 5px 10px 5px 12px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  display: inline-flex;
  gap: 4px;
  align-items: center;
}
.scroll {
  overflow-y: auto;
  height: calc(844px - 48px - 56px - 48px - 38px - 38px - 86px);
}
.grid {
  padding: 12px 20px 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.card {
  color: inherit;
  text-decoration: none;
}
.card__heart {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
}
.card__body {
  padding: 8px 2px 0;
}
.card__title {
  font-size: 13px;
  font-weight: 600;
  margin-top: 2px;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card__price {
  margin-top: 4px;
  display: flex;
  align-items: baseline;
  gap: 5px;
}
.card__pct {
  font-size: 12.5px;
  font-weight: 800;
}
.card__won {
  font-size: 14.5px;
  font-weight: 800;
}
</style>
