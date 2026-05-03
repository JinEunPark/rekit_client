<script setup lang="ts">
import { useProductStore } from '@/stores/products'
import { won } from '@/design/tokens'
import AdminShell from '@/components/admin/AdminShell.vue'
import Button from '@/components/ds/Button.vue'
import IconBase from '@/components/ds/IconBase.vue'
import ProductTile from '@/components/ds/ProductTile.vue'

const products = useProductStore()

const headlineKpis = [
  { l: '주문 건수', v: '94', s: '건' },
  { l: '평균 주문', v: '349,361', s: '원' },
  { l: '취소율', v: '3.2', s: '%' },
]

const payments = [
  { m: '신용카드',   v: '21,440,000원', p: 65, c: 'var(--rekit-accent)' },
  { m: '계좌이체',   v: '5,910,000원',  p: 18, c: 'var(--rekit-ink)' },
  { m: '카카오페이', v: '3,280,000원',  p: 10, c: '#FEE500' },
  { m: '네이버페이', v: '1,640,000원',  p: 5,  c: '#03C75A' },
  { m: '토스페이',   v: '570,000원',    p: 2,  c: '#3182F6' },
]

const dates = ['04.01', '04.06', '04.11', '04.16', '04.21', '04.26', '04.30']
const top = products.all.slice(0, 5)
const dummyCount = [4, 6, 5, 7, 3]
const linePoints: [number, number][] = [
  [0, 130], [100, 120], [200, 100], [300, 80], [400, 65], [500, 55], [600, 45],
]
</script>

<template>
  <AdminShell active="sales" title="매출 / 정산" subtitle="2026년 4월 · 누적 32,840,000원">
    <template #header-right>
      <div class="picker">
        <span>2026.04.01 — 04.30</span>
        <IconBase name="chevronDown" :size="14" />
      </div>
      <Button variant="primary" size="sm" leading-icon="download">CSV 내보내기</Button>
    </template>

    <div class="head">
      <div class="head__main">
        <div class="head__kicker">4월 총 매출</div>
        <div class="head__val">
          32,840,000<span class="head__unit">원</span>
        </div>
        <div class="head__delta">
          <span class="head__delta-pill">+24.3%</span>
          전월 대비 6,420,000원 증가
        </div>
      </div>
      <div class="head__kpis">
        <div v-for="k in headlineKpis" :key="k.l">
          <div class="head__kpi-l">{{ k.l }}</div>
          <div class="head__kpi-v">
            {{ k.v }}<span class="head__kpi-s">{{ k.s }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="card">
        <div class="card__title">일별 매출 추이</div>
        <svg viewBox="0 0 600 180" class="line-chart">
          <defs>
            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="var(--rekit-accent)" stop-opacity="0.25" />
              <stop offset="1" stop-color="var(--rekit-accent)" stop-opacity="0" />
            </linearGradient>
          </defs>
          <line v-for="y in [30, 70, 110, 150]" :key="y" x1="0" :y1="y" x2="600" :y2="y" stroke="var(--rekit-border)" stroke-width="1" stroke-dasharray="2,3" />
          <path
            d="M 0 130 L 50 110 L 100 120 L 150 90 L 200 100 L 250 70 L 300 80 L 350 50 L 400 65 L 450 40 L 500 55 L 550 30 L 600 45 L 600 180 L 0 180 Z"
            fill="url(#salesGrad)"
          />
          <path
            d="M 0 130 L 50 110 L 100 120 L 150 90 L 200 100 L 250 70 L 300 80 L 350 50 L 400 65 L 450 40 L 500 55 L 550 30 L 600 45"
            fill="none"
            stroke="var(--rekit-accent)"
            stroke-width="2.5"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
          <circle
            v-for="(pt, i) in linePoints"
            :key="i"
            :cx="pt[0]"
            :cy="pt[1]"
            r="3.5"
            fill="#fff"
            stroke="var(--rekit-accent)"
            stroke-width="2"
          />
        </svg>
        <div class="dates">
          <span v-for="d in dates" :key="d">{{ d }}</span>
        </div>
      </div>

      <div class="card">
        <div class="card__title">결제 수단별</div>
        <div v-for="r in payments" :key="r.m" class="pay">
          <div class="pay__head">
            <span class="pay__name">{{ r.m }}</span>
            <span class="pay__pct">{{ r.p }}%</span>
          </div>
          <div class="pay__amt">{{ r.v }}</div>
          <div class="bar">
            <div class="bar__fill" :style="{ width: `${r.p}%`, background: r.c }" />
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card__title">매출 상위 상품</div>
      <div v-for="(p, i) in top" :key="p.id" class="top" :class="{ 'top--last': i === top.length - 1 }">
        <span class="top__rank" :class="{ 'top__rank--podium': i < 3 }">
          {{ String(i + 1).padStart(2, '0') }}
        </span>
        <div class="top__thumb">
          <ProductTile :kind="p.kind" :tone="p.tone" ratio="1/1" radius="8px" :show-label="false" />
        </div>
        <div class="top__main">
          <div class="top__title">{{ p.title }}</div>
          <div class="top__meta">{{ p.brand }} · {{ p.category }}</div>
        </div>
        <span class="top__cnt">{{ dummyCount[i] }}건</span>
        <span class="top__amt">{{ won(p.price * (i + 2)) }}</span>
      </div>
    </div>
  </AdminShell>
</template>

<style scoped>
.picker {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 12px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--rekit-ink);
}
.picker svg { color: var(--rekit-ink-subtle); }

.head {
  background: var(--rekit-ink);
  color: #fff;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.head__kicker {
  font-size: 12px;
  opacity: 0.7;
  font-weight: 600;
  letter-spacing: 0.05em;
}
.head__val {
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-top: 6px;
}
.head__unit {
  font-size: 20px;
  margin-left: 4px;
  opacity: 0.7;
}
.head__delta {
  font-size: 12.5px;
  opacity: 0.85;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.head__delta-pill {
  background: var(--rekit-accent);
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}
.head__kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.head__kpi-l {
  font-size: 11px;
  opacity: 0.6;
  font-weight: 600;
}
.head__kpi-v {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-top: 4px;
}
.head__kpi-s {
  font-size: 12px;
  margin-left: 3px;
  opacity: 0.7;
}

.row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.card {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  padding: 20px;
}
.card__title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 18px;
}

.line-chart {
  width: 100%;
  height: 180px;
  display: block;
}
.dates {
  display: flex;
  justify-content: space-between;
  font-size: 10.5px;
  margin-top: 6px;
  color: var(--rekit-ink-subtle);
}

.pay { margin-bottom: 14px; }
.pay:last-child { margin-bottom: 0; }
.pay__head {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 4px;
}
.pay__name { font-weight: 600; }
.pay__pct { color: var(--rekit-ink-subtle); }
.pay__amt {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 4px;
}
.bar {
  height: 4px;
  border-radius: 2px;
  overflow: hidden;
  background: var(--rekit-surface-muted);
}
.bar__fill { height: 100%; }

.top {
  display: grid;
  grid-template-columns: 24px 44px 1fr auto auto;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--rekit-border);
}
.top--last { border-bottom: 0; }
.top__rank {
  font-size: 13px;
  font-weight: 800;
  color: var(--rekit-ink-subtle);
}
.top__rank--podium { color: var(--rekit-accent-deep); }
.top__thumb { width: 44px; }
.top__title {
  font-size: 13px;
  font-weight: 600;
}
.top__meta {
  font-size: 11px;
  color: var(--rekit-ink-subtle);
  margin-top: 2px;
}
.top__cnt {
  font-size: 12.5px;
  color: var(--rekit-ink-muted);
}
.top__amt {
  font-size: 14px;
  font-weight: 800;
  text-align: right;
  min-width: 96px;
}

@media (min-width: 768px) {
  .head {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 28px;
    margin-bottom: 20px;
  }
  .head__val { font-size: 44px; }
  .head__unit { font-size: 24px; }
  .head__kpis {
    display: flex;
    gap: 28px;
  }
  .head__kpi-v { font-size: 22px; }
  .card { padding: 24px; }
}

@media (min-width: 1024px) {
  .row {
    grid-template-columns: 1.6fr 1fr;
    margin-bottom: 20px;
  }
}
</style>
