<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { won } from '@/design/tokens'
import AdminShell from '@/components/admin/AdminShell.vue'
import Button from '@/components/ds/Button.vue'
import IconBase from '@/components/ds/IconBase.vue'
import {
  getSalesSummary,
  getSalesByPaymentMethod,
  getSalesTopProducts,
  getSalesTimeSeries,
  exportSalesCsv,
} from '@/api/admin/sales'
import type { SalesSummary, PaymentMethodStat, TopProductItem } from '@/api/admin/sales'
import type { PaymentMethod } from '@/api/admin/payments'

type PeriodId = '7d' | '30d' | 'month'

const periodDefs: { id: PeriodId; label: string }[] = [
  { id: '7d', label: '7일' },
  { id: '30d', label: '30일' },
  { id: 'month', label: '이번달' },
]
const activePeriod = ref<PeriodId>('month')

const summary = ref<SalesSummary | null>(null)
const paymentStats = ref<PaymentMethodStat[]>([])
const topProducts = ref<TopProductItem[]>([])
const timeseriesPoints = ref<{ x: number; y: number; label: string }[]>([])

function getDateRange(period: PeriodId): { start: string; end: string } {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const end = fmt(now)
  if (period === '7d') {
    const s = new Date(now); s.setDate(s.getDate() - 6)
    return { start: fmt(s), end }
  }
  if (period === '30d') {
    const s = new Date(now); s.setDate(s.getDate() - 29)
    return { start: fmt(s), end }
  }
  // this month
  return { start: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`, end }
}

const dateRange = computed(() => getDateRange(activePeriod.value))
const periodLabel = computed(() => {
  const { start, end } = dateRange.value
  return `${start.slice(5).replace('-', '.')} — ${end.slice(5).replace('-', '.')}`
})

const paymentMethodLabel: Record<PaymentMethod, string> = {
  CARD: '신용카드', BANK: '계좌이체',
  KAKAO_PAY: '카카오페이', NAVER_PAY: '네이버페이', TOSS_PAY: '토스페이',
}
const paymentMethodColor: Record<PaymentMethod, string> = {
  CARD: 'var(--rekit-accent)', BANK: 'var(--rekit-ink)',
  KAKAO_PAY: '#FEE500', NAVER_PAY: '#03C75A', TOSS_PAY: '#3182F6',
}

const paymentsWithPct = computed(() => {
  const total = paymentStats.value.reduce((s, p) => s + p.revenue, 0)
  return paymentStats.value.map((p) => ({
    m: paymentMethodLabel[p.method] ?? p.method,
    v: won(p.revenue),
    p: total > 0 ? Math.round((p.revenue / total) * 100) : 0,
    c: paymentMethodColor[p.method] ?? 'var(--rekit-accent)',
  }))
})

// SVG path from timeseries data — viewBox 0 0 600 180
const svgPath = computed(() => {
  const pts = timeseriesPoints.value
  if (pts.length < 2) return { line: '', area: '', dots: [] }
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const last = pts[pts.length - 1]!
  const first = pts[0]!
  return {
    line: d,
    area: `${d} L ${last.x} 180 L ${first.x} 180 Z`,
    dots: pts.filter((_, i) => i % Math.max(1, Math.floor(pts.length / 7)) === 0),
  }
})

const yGridLines = [30, 70, 110, 150]

async function load() {
  const params = dateRange.value
  try {
    const [sum, payments, top, ts] = await Promise.all([
      getSalesSummary(params),
      getSalesByPaymentMethod(params),
      getSalesTopProducts({ ...params, limit: 5 }),
      getSalesTimeSeries(params),
    ])
    summary.value = sum
    paymentStats.value = payments
    topProducts.value = top

    // Map timeseries to SVG coords
    const data = ts.data as Record<string, unknown>[]
    if (data.length > 1) {
      const revenues = data.map((d) => Number(d.revenue ?? 0))
      const maxRev = Math.max(...revenues, 1)
      const w = 600; const h = 160; const padY = 20
      timeseriesPoints.value = data.map((d, i) => ({
        x: (i / (data.length - 1)) * w,
        y: h - ((Number(d.revenue ?? 0) / maxRev) * (h - padY)) + padY,
        label: String(d.date ?? '').slice(5).replace('-', '.'),
      }))
    } else {
      timeseriesPoints.value = []
    }
  } catch (err) {
    console.error('[admin/sales]', err)
  }
}

watch(activePeriod, load)
onMounted(load)
</script>

<template>
  <AdminShell
    active="sales"
    title="매출 / 정산"
    :subtitle="summary ? `누적 ${won(summary.total_revenue)}` : ''"
  >
    <template #header-right>
      <div class="periods">
        <button
          v-for="p in periodDefs"
          :key="p.id"
          type="button"
          class="period"
          :class="{ 'period--active': activePeriod === p.id }"
          @click="activePeriod = p.id"
        >
          {{ p.label }}
        </button>
      </div>
      <div class="picker">
        <span>{{ periodLabel }}</span>
        <IconBase name="chevronDown" :size="14" />
      </div>
      <a :href="exportSalesCsv(dateRange)" download>
        <Button variant="primary" size="sm" leading-icon="download">CSV 내보내기</Button>
      </a>
    </template>

    <!-- 요약 헤더 -->
    <div v-if="summary" class="head">
      <div class="head__main">
        <div class="head__kicker">기간 총 매출</div>
        <div class="head__val">
          {{ won(summary.total_revenue).replace('원', '') }}<span class="head__unit">원</span>
        </div>
      </div>
      <div class="head__kpis">
        <div>
          <div class="head__kpi-l">주문 건수</div>
          <div class="head__kpi-v">{{ summary.order_count }}<span class="head__kpi-s">건</span></div>
        </div>
        <div>
          <div class="head__kpi-l">평균 주문</div>
          <div class="head__kpi-v">{{ won(summary.avg_order_value).replace('원', '') }}<span class="head__kpi-s">원</span></div>
        </div>
        <div>
          <div class="head__kpi-l">취소율</div>
          <div class="head__kpi-v">{{ (summary.cancel_rate * 100).toFixed(1) }}<span class="head__kpi-s">%</span></div>
        </div>
      </div>
    </div>

    <div class="row">
      <!-- 일별 매출 추이 -->
      <div class="card">
        <div class="card__title">매출 추이</div>
        <svg viewBox="0 0 600 180" class="line-chart">
          <defs>
            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="var(--rekit-accent)" stop-opacity="0.25" />
              <stop offset="1" stop-color="var(--rekit-accent)" stop-opacity="0" />
            </linearGradient>
          </defs>
          <line
            v-for="y in yGridLines"
            :key="y"
            x1="0" :y1="y" x2="600" :y2="y"
            stroke="var(--rekit-border)"
            stroke-width="1"
            stroke-dasharray="2,3"
          />
          <template v-if="svgPath.line">
            <path :d="svgPath.area" fill="url(#salesGrad)" />
            <path
              :d="svgPath.line"
              fill="none"
              stroke="var(--rekit-accent)"
              stroke-width="2.5"
              stroke-linejoin="round"
              stroke-linecap="round"
            />
            <circle
              v-for="(pt, i) in svgPath.dots"
              :key="i"
              :cx="pt.x"
              :cy="pt.y"
              r="3.5"
              fill="#fff"
              stroke="var(--rekit-accent)"
              stroke-width="2"
            />
          </template>
          <text v-else x="300" y="95" text-anchor="middle" fill="var(--rekit-ink-subtle)" font-size="13">데이터 없음</text>
        </svg>
        <div class="dates">
          <span v-for="pt in svgPath.dots" :key="pt.label">{{ pt.label }}</span>
        </div>
      </div>

      <!-- 결제 수단별 -->
      <div class="card">
        <div class="card__title">결제 수단별</div>
        <div v-if="paymentsWithPct.length === 0" class="empty-inline">데이터 없음</div>
        <div v-for="r in paymentsWithPct" :key="r.m" class="pay">
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

    <!-- 매출 상위 상품 -->
    <div class="card">
      <div class="card__title">매출 상위 상품</div>
      <div v-if="topProducts.length === 0" class="empty-inline">데이터 없음</div>
      <div
        v-for="(p, i) in topProducts"
        :key="p.product_id"
        class="top"
        :class="{ 'top--last': i === topProducts.length - 1 }"
      >
        <span class="top__rank" :class="{ 'top__rank--podium': i < 3 }">
          {{ String(i + 1).padStart(2, '0') }}
        </span>
        <div class="top__main">
          <div class="top__title">{{ p.title }}</div>
        </div>
        <span class="top__cnt">{{ p.quantity_sold }}건</span>
        <span class="top__amt">{{ won(p.revenue) }}</span>
      </div>
    </div>
  </AdminShell>
</template>

<style scoped>
.periods {
  display: flex;
  gap: 4px;
}
.period {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: var(--rekit-surface);
  color: var(--rekit-ink-muted);
  border: 1px solid var(--rekit-border);
  cursor: pointer;
}
.period--active {
  background: var(--rekit-ink);
  color: #fff;
  border-color: transparent;
}
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
.head__unit { font-size: 20px; margin-left: 4px; opacity: 0.7; }
.head__kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.head__kpi-l { font-size: 11px; opacity: 0.6; font-weight: 600; }
.head__kpi-v { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; margin-top: 4px; }
.head__kpi-s { font-size: 12px; margin-left: 3px; opacity: 0.7; }

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
.card__title { font-size: 14px; font-weight: 700; margin-bottom: 18px; }
.empty-inline {
  color: var(--rekit-ink-subtle);
  font-size: 13px;
  padding: 20px 0;
  text-align: center;
}

.line-chart { width: 100%; height: 180px; display: block; }
.dates {
  display: flex;
  justify-content: space-between;
  font-size: 10.5px;
  margin-top: 6px;
  color: var(--rekit-ink-subtle);
}

.pay { margin-bottom: 14px; }
.pay:last-child { margin-bottom: 0; }
.pay__head { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
.pay__name { font-weight: 600; }
.pay__pct { color: var(--rekit-ink-subtle); }
.pay__amt { font-size: 13px; font-weight: 700; margin-bottom: 4px; }
.bar { height: 4px; border-radius: 2px; overflow: hidden; background: var(--rekit-surface-muted); }
.bar__fill { height: 100%; }

.top {
  display: grid;
  grid-template-columns: 28px 1fr auto auto;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--rekit-border);
}
.top--last { border-bottom: 0; }
.top__rank { font-size: 13px; font-weight: 800; color: var(--rekit-ink-subtle); }
.top__rank--podium { color: var(--rekit-accent-deep); }
.top__title { font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.top__cnt { font-size: 12.5px; color: var(--rekit-ink-muted); white-space: nowrap; }
.top__amt { font-size: 14px; font-weight: 800; text-align: right; min-width: 96px; }

@media (min-width: 768px) {
  .head { flex-direction: row; align-items: center; justify-content: space-between; padding: 28px; margin-bottom: 20px; }
  .head__val { font-size: 44px; }
  .head__unit { font-size: 24px; }
  .head__kpis { display: flex; gap: 28px; }
  .card { padding: 24px; }
}
@media (min-width: 1024px) {
  .row { grid-template-columns: 1.6fr 1fr; margin-bottom: 20px; }
}
</style>
