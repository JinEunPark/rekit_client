<script setup lang="ts">
import { REKIT, won } from '@/design/tokens'
import { PRODUCTS } from '@/data/products'
import AdminShell from '@/_design/components/AdminShell.vue'
import Button from '@/components/ds/Button.vue'
import Badge from '@/components/ds/Badge.vue'
import IconBase from '@/components/ds/IconBase.vue'
import ProductTile from '@/components/ds/ProductTile.vue'

const filters = ['전체 24', '판매중 18', '품절 4', '비공개 2']
</script>

<template>
  <AdminShell active="products" title="상품 관리" subtitle="총 24개 상품">
    <template #header-right>
      <div
        class="search"
        :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }"
      >
        <IconBase name="search" :size="16" :style="{ color: REKIT.color.inkSubtle }" />
        <span :style="{ color: REKIT.color.inkPlaceholder }">모델명, 브랜드 검색</span>
      </div>
      <Button variant="primary" size="sm" leading-icon="plus">상품 등록</Button>
    </template>

    <div class="chips">
      <span
        v-for="(c, i) in filters"
        :key="c"
        :style="{
          padding: '7px 14px',
          borderRadius: '999px',
          fontSize: '12.5px',
          fontWeight: 600,
          background: i === 0 ? REKIT.color.ink : REKIT.color.surface,
          color: i === 0 ? '#fff' : REKIT.color.inkMuted,
          border: i === 0 ? 'none' : `1px solid ${REKIT.color.border}`,
        }"
      >
        {{ c }}
      </span>
    </div>

    <div class="table" :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }">
      <div class="table__head" :style="{ background: REKIT.color.surfaceMuted, color: REKIT.color.inkMuted }">
        <span /><span /><span>상품</span><span>카테고리</span><span>등급</span><span>가격</span><span>재고</span><span>상태</span><span />
      </div>
      <div
        v-for="(p, i) in PRODUCTS"
        :key="p.id"
        class="table__row"
        :style="{ borderTop: i > 0 ? `1px solid ${REKIT.color.border}` : 'none' }"
      >
        <span class="cb" :style="{ border: `1.5px solid ${REKIT.color.borderStrong}` }" />
        <div style="width: 56px">
          <ProductTile :kind="p.kind" :tone="p.tone" ratio="1/1" :radius="REKIT.radius.sm" :show-label="false" />
        </div>
        <div>
          <div :style="{ fontSize: '11px', color: REKIT.color.inkSubtle, fontWeight: 600 }">
            {{ p.brand }} · {{ p.model }}
          </div>
          <div style="font-weight: 600; margin-top: 2px">{{ p.title }}</div>
        </div>
        <span :style="{ color: REKIT.color.inkMuted }">{{ p.category }}</span>
        <span><Badge :tone="p.grade.toLowerCase() as 'a' | 'b' | 'c'" size="sm">{{ p.grade }}급</Badge></span>
        <div>
          <div style="font-weight: 700">{{ won(p.price) }}</div>
          <div :style="{ fontSize: '10.5px', color: REKIT.color.inkSubtle, textDecoration: 'line-through' }">
            {{ won(p.original) }}
          </div>
        </div>
        <span :style="{ fontWeight: 600, color: p.stock === 0 ? REKIT.color.danger : REKIT.color.ink }">
          {{ p.stock }}개
        </span>
        <Badge :tone="p.stock === 0 ? 'danger' : 'accent'" size="sm">
          {{ p.stock === 0 ? '품절' : '판매중' }}
        </Badge>
        <IconBase name="edit" :size="16" :style="{ color: REKIT.color.inkSubtle }" />
      </div>
    </div>
  </AdminShell>
</template>

<style scoped>
.search {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 12px;
  padding: 8px 12px;
  width: 280px;
  font-size: 13px;
}
.chips {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
}
.table {
  border-radius: 16px;
  overflow: hidden;
}
.table__head,
.table__row {
  display: grid;
  grid-template-columns: 40px 80px 1.6fr 0.7fr 0.6fr 0.7fr 0.7fr 0.5fr 50px;
  padding: 12px 16px;
  align-items: center;
}
.table__head {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.table__row {
  padding: 14px 16px;
  font-size: 13px;
}
.cb {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}
</style>
