<script setup lang="ts">
import { REKIT, won } from '@/design/tokens'
import { PRODUCTS } from '@/data/products'
import AdminShell from '@/_design/components/AdminShell.vue'
import Button from '@/components/ds/Button.vue'
import IconBase from '@/components/ds/IconBase.vue'
import ProductTile from '@/components/ds/ProductTile.vue'

const headlineKpis = [
  { l: '주문 건수', v: '94', s: '건' },
  { l: '평균 주문', v: '349,361', s: '원' },
  { l: '취소율', v: '3.2', s: '%' },
]

const payments = [
  { m: '신용카드', v: '21,440,000원', p: 65, c: REKIT.color.accent },
  { m: '계좌이체', v: '5,910,000원', p: 18, c: REKIT.color.ink },
  { m: '카카오페이', v: '3,280,000원', p: 10, c: '#FEE500' },
  { m: '네이버페이', v: '1,640,000원', p: 5, c: '#03C75A' },
  { m: '토스페이', v: '570,000원', p: 2, c: '#3182F6' },
]

const dates = ['04.01', '04.06', '04.11', '04.16', '04.21', '04.26', '04.30']

const top = PRODUCTS.slice(0, 5)
const dummyCount = [4, 6, 5, 7, 3]
</script>

<template>
  <AdminShell active="sales" title="매출 / 정산" subtitle="2026년 4월 · 누적 32,840,000원">
    <template #header-right>
      <div
        class="picker"
        :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }"
      >
        <span style="font-size: 13px; font-weight: 600">2026.04.01 — 04.30</span>
        <IconBase name="chevronDown" :size="14" :style="{ color: REKIT.color.inkSubtle }" />
      </div>
      <Button variant="primary" size="sm" leading-icon="download">CSV 내보내기</Button>
    </template>

    <div class="head" :style="{ background: REKIT.color.ink }">
      <div>
        <div :style="{ fontSize: '12px', opacity: 0.7, fontWeight: 600, letterSpacing: '0.05em' }">
          4월 총 매출
        </div>
        <div class="head__val">
          32,840,000<span style="font-size: 24px; margin-left: 4px; opacity: 0.7">원</span>
        </div>
        <div class="head__delta">
          <span :style="{ background: REKIT.color.accent }">+24.3%</span>
          전월 대비 6,420,000원 증가
        </div>
      </div>
      <div class="head__kpis">
        <div v-for="k in headlineKpis" :key="k.l">
          <div :style="{ fontSize: '11px', opacity: 0.6, fontWeight: 600 }">{{ k.l }}</div>
          <div class="head__kpi-v">
            {{ k.v }}<span style="font-size: 12px; margin-left: 3px; opacity: 0.7">{{ k.s }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="card" :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }">
        <div :style="{ fontSize: '14px', fontWeight: 700, marginBottom: '18px' }">일별 매출 추이</div>
        <svg viewBox="0 0 600 180" style="width: 100%; height: 180px">
          <defs>
            <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" :stop-color="REKIT.color.accent" stop-opacity="0.25" />
              <stop offset="1" :stop-color="REKIT.color.accent" stop-opacity="0" />
            </linearGradient>
          </defs>
          <line v-for="y in [30, 70, 110, 150]" :key="y" x1="0" :y1="y" x2="600" :y2="y" :stroke="REKIT.color.border" stroke-width="1" stroke-dasharray="2,3" />
          <path
            d="M 0 130 L 50 110 L 100 120 L 150 90 L 200 100 L 250 70 L 300 80 L 350 50 L 400 65 L 450 40 L 500 55 L 550 30 L 600 45 L 600 180 L 0 180 Z"
            fill="url(#grad1)"
          />
          <path
            d="M 0 130 L 50 110 L 100 120 L 150 90 L 200 100 L 250 70 L 300 80 L 350 50 L 400 65 L 450 40 L 500 55 L 550 30 L 600 45"
            fill="none"
            :stroke="REKIT.color.accent"
            stroke-width="2.5"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
          <circle
            v-for="(pt, i) in [[0, 130], [100, 120], [200, 100], [300, 80], [400, 65], [500, 55], [600, 45]]"
            :key="i"
            :cx="pt[0]"
            :cy="pt[1]"
            r="3.5"
            fill="#fff"
            :stroke="REKIT.color.accent"
            stroke-width="2"
          />
        </svg>
        <div class="dates" :style="{ color: REKIT.color.inkSubtle }">
          <span v-for="d in dates" :key="d">{{ d }}</span>
        </div>
      </div>

      <div class="card" :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }">
        <div :style="{ fontSize: '14px', fontWeight: 700, marginBottom: '18px' }">결제 수단별</div>
        <div v-for="r in payments" :key="r.m" style="margin-bottom: 14px">
          <div class="bar__head">
            <span style="font-weight: 600">{{ r.m }}</span>
            <span :style="{ color: REKIT.color.inkSubtle }">{{ r.p }}%</span>
          </div>
          <div style="font-size: 13px; font-weight: 700; margin-bottom: 4px">{{ r.v }}</div>
          <div class="bar" :style="{ background: REKIT.color.surfaceMuted }">
            <div :style="{ width: `${r.p}%`, height: '100%', background: r.c }" />
          </div>
        </div>
      </div>
    </div>

    <div class="card" :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }">
      <div :style="{ fontSize: '14px', fontWeight: 700, marginBottom: '14px' }">매출 상위 상품</div>
      <div
        v-for="(p, i) in top"
        :key="p.id"
        class="top"
        :style="{ borderBottom: i < top.length - 1 ? `1px solid ${REKIT.color.border}` : 'none' }"
      >
        <span
          :style="{
            width: '24px',
            fontSize: '13px',
            fontWeight: 800,
            color: i < 3 ? REKIT.color.accentDeep : REKIT.color.inkSubtle,
          }"
        >
          {{ String(i + 1).padStart(2, '0') }}
        </span>
        <div style="width: 44px">
          <ProductTile :kind="p.kind" :tone="p.tone" ratio="1/1" :radius="REKIT.radius.sm" :show-label="false" />
        </div>
        <div style="flex: 1">
          <div :style="{ fontSize: '13px', fontWeight: 600 }">{{ p.title }}</div>
          <div :style="{ fontSize: '11px', color: REKIT.color.inkSubtle, marginTop: '2px' }">
            {{ p.brand }} · {{ p.category }}
          </div>
        </div>
        <span :style="{ fontSize: '12.5px', color: REKIT.color.inkMuted }">{{ dummyCount[i] }}건</span>
        <span :style="{ fontSize: '14px', fontWeight: 800, width: '110px', textAlign: 'right' }">
          {{ won(p.price * (i + 2)) }}
        </span>
      </div>
    </div>
  </AdminShell>
</template>

<style scoped>
.picker {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 12px;
  padding: 8px 12px;
}
.head {
  color: #fff;
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.head__val {
  font-size: 44px;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-top: 6px;
}
.head__delta {
  font-size: 13px;
  opacity: 0.85;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.head__delta span {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}
.head__kpis {
  display: flex;
  gap: 28px;
}
.head__kpi-v {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-top: 4px;
}
.row {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}
.card {
  border-radius: 16px;
  padding: 24px;
}
.dates {
  display: flex;
  justify-content: space-between;
  font-size: 10.5px;
  margin-top: 6px;
}
.bar__head {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 4px;
}
.bar {
  height: 4px;
  border-radius: 2px;
  overflow: hidden;
}
.top {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 0;
}
</style>
