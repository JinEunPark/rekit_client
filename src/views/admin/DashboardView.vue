<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AdminShell from '@/components/admin/AdminShell.vue'
import Button from '@/components/ds/Button.vue'
import Badge from '@/components/ds/Badge.vue'
import { won } from '@/design/tokens'
import {
  getDashboardSummary,
  getDashboardSalesChart,
  getDashboardPendingOrders,
  getDashboardPopularCategories,
  getDashboardStockAlerts,
} from '@/api/admin/dashboard'
import type { DashboardSummary, PendingOrderItem, CategoryStat, StockAlertItem } from '@/api/admin/dashboard'
import type { SalesDataPoint } from '@/api/admin/sales'
import { statusTone, statusLabel } from '@/stores/orders-helpers'

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']
const periods = [
  { days: 7, label: '7일' },
  { days: 30, label: '30일' },
  { days: 90, label: '90일' },
]
const period = ref(0)

const summary = ref<DashboardSummary | null>(null)
const chartData = ref<SalesDataPoint[]>([])
const pendingOrders = ref<PendingOrderItem[]>([])
const popularCats = ref<CategoryStat[]>([])
const stockAlerts = ref<StockAlertItem[]>([])

const kpis = computed(() => {
  const s = summary.value
  if (!s) return []
  return [
    { l: '오늘 주문', v: String(s.today_orders), s: '건', d: '', tone: 'accent' as const },
    { l: '오늘 매출', v: won(s.today_revenue).replace('원', '').trim(), s: '원', d: '', tone: 'accent' as const },
    { l: '처리 대기', v: String(s.pending_count), s: '건', d: s.pending_count > 0 ? '긴급 확인' : '', tone: 'danger' as const },
    { l: '재고 부족', v: String(s.low_stock_count), s: '품목', d: '', tone: 'warn' as const },
  ]
})

const bars = computed(() => {
  if (!chartData.value.length) return []
  const maxRev = Math.max(...chartData.value.map((d) => d.revenue), 1)
  return chartData.value.map((d, i) => ({
    d: DAY_LABELS[new Date(d.date).getDay()],
    v: d.revenue / maxRev,
    val: d.revenue >= 1_000_000
      ? `${(d.revenue / 1_000_000).toFixed(1)}M`
      : `${Math.round(d.revenue / 1000)}K`,
    cur: i === chartData.value.length - 1,
  }))
})

const catsWithPct = computed(() => {
  if (!popularCats.value.length) return []
  const max = Math.max(...popularCats.value.map((c) => c.order_count), 1)
  return popularCats.value.map((c) => ({
    c: c.category,
    n: c.order_count,
    p: Math.round((c.order_count / max) * 100),
  }))
})

const stocks = computed(() =>
  stockAlerts.value.map((s) => ({
    p: s.title,
    s: s.stock === 0 ? '재고 0' : `재고 ${s.stock}개`,
    tone: (s.stock === 0 ? 'danger' : 'warn') as 'danger' | 'warn',
  })),
)

function relativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

async function loadChart() {
  try {
    const res = await getDashboardSalesChart(periods[period.value]!.days)
    chartData.value = res.data
  } catch {}
}

watch(period, loadChart)

onMounted(async () => {
  try {
    const [sum, pending, cats, stockRes] = await Promise.all([
      getDashboardSummary(),
      getDashboardPendingOrders(),
      getDashboardPopularCategories(),
      getDashboardStockAlerts(),
    ])
    summary.value = sum
    pendingOrders.value = pending
    popularCats.value = cats
    stockAlerts.value = stockRes
  } catch (err) {
    console.error('[dashboard]', err)
  }
  loadChart()
})
</script>

<template>
  <AdminShell active="dashboard" title="대시보드" :subtitle="`오늘의 운영 현황`">
    <template #header-right>
      <Button variant="secondary" size="sm" leading-icon="download">CSV 내보내기</Button>
      <RouterLink to="/admin/products/new" class="header-link">
        <Button variant="primary" size="sm" leading-icon="plus">상품 등록</Button>
      </RouterLink>
    </template>

    <div class="kpis">
      <div v-for="k in kpis" :key="k.l" class="kpi">
        <div class="kpi__label">{{ k.l }}</div>
        <div class="kpi__v">
          <span>{{ k.v }}</span>
          <span class="kpi__s">{{ k.s }}</span>
        </div>
        <div class="kpi__d" :class="`kpi__d--${k.tone}`">{{ k.d }}</div>
      </div>
    </div>

    <div class="row2">
      <div class="card">
        <div class="card__head">
          <div class="card__title">최근 매출 추이</div>
          <div class="periods">
            <button
              v-for="(p, i) in periods"
              :key="p.label"
              type="button"
              class="period"
              :class="{ 'period--active': period === i }"
              @click="period = i"
            >
              {{ p.label }}
            </button>
          </div>
        </div>
        <div class="chart">
          <div v-for="b in bars" :key="b.d" class="chart__col">
            <div class="chart__val" :class="{ 'chart__val--cur': b.cur }">{{ b.val }}</div>
            <div
              class="chart__bar"
              :class="{ 'chart__bar--cur': b.cur }"
              :style="{ height: `${b.v * 150}px` }"
            />
            <div class="chart__label">{{ b.d }}</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card__title">처리 대기 주문</div>
        <div class="o-list">
          <div v-if="pendingOrders.length === 0" class="o-empty">처리 대기 주문이 없습니다.</div>
          <div v-for="o in pendingOrders" :key="o.order_number" class="o">
            <div class="o__main">
              <div class="o__row">
                <span class="o__id">{{ o.order_number }}</span>
                <Badge :tone="statusTone(o.status)" size="xs">{{ statusLabel(o.status) }}</Badge>
              </div>
              <div class="o__name">{{ o.username }} · {{ won(o.total_amount) }}</div>
            </div>
            <div class="o__time">{{ relativeTime(o.created_at) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="row3">
      <div class="card">
        <div class="card__title">인기 카테고리</div>
        <div v-for="r in catsWithPct" :key="r.c" class="cat">
          <div class="bar__head">
            <span class="cat__name">{{ r.c }}</span>
            <span class="cat__n">{{ r.n }}건 판매</span>
          </div>
          <div class="bar">
            <div class="bar__fill" :style="{ width: `${r.p}%` }" />
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card__title">재고 알림</div>
        <div v-for="r in stocks" :key="r.p" class="stock">
          <div class="stock__dot" :class="`stock__dot--${r.tone}`" />
          <span class="stock__p">{{ r.p }}</span>
          <span class="stock__s" :class="`stock__s--${r.tone}`">{{ r.s }}</span>
        </div>
      </div>
    </div>
  </AdminShell>
</template>

<style scoped>
.header-link { display: inline-flex; text-decoration: none; }
.kpis {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}
.kpi {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  padding: 16px;
}
.kpi__label {
  font-size: 12px;
  color: var(--rekit-ink-subtle);
  font-weight: 600;
}
.kpi__v {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 6px;
}
.kpi__v span:first-child {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.kpi__s {
  font-size: 12px;
  font-weight: 600;
  color: var(--rekit-ink-subtle);
}
.kpi__d {
  margin-top: 4px;
  font-size: 11.5px;
  font-weight: 600;
}
.kpi__d--accent { color: var(--rekit-accent-deep); }
.kpi__d--danger { color: var(--rekit-danger); }
.kpi__d--warn { color: #B5762A; }

.row2,
.row3 {
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
.card__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 18px;
  gap: 12px;
  flex-wrap: wrap;
}
.card__title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 14px;
}
.card__head .card__title {
  margin-bottom: 0;
}
.card__sub {
  font-size: 12px;
  color: var(--rekit-ink-subtle);
  margin-top: 2px;
}
.periods {
  display: flex;
  gap: 6px;
}
.period {
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  background: var(--rekit-surface-muted);
  color: var(--rekit-ink-muted);
  border: 0;
  cursor: pointer;
}
.period--active {
  background: var(--rekit-ink);
  color: #fff;
}

.chart {
  height: 200px;
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding-bottom: 28px;
  position: relative;
  border-bottom: 1px solid var(--rekit-border);
}
.chart__col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.chart__val {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--rekit-ink-subtle);
}
.chart__val--cur {
  color: var(--rekit-accent-deep);
}
.chart__bar {
  width: 100%;
  border-radius: 6px 6px 0 0;
  background: var(--rekit-accent-soft);
}
.chart__bar--cur {
  background: var(--rekit-accent);
}
.chart__label {
  position: absolute;
  bottom: 8px;
  font-size: 11px;
  font-weight: 600;
  color: var(--rekit-ink-subtle);
}

.o-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.o {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--rekit-border);
}
.o:last-child { border-bottom: 0; }
.o__main { flex: 1; min-width: 0; }
.o__row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.o__id {
  font-size: 11.5px;
  font-family: var(--rekit-font-mono);
  color: var(--rekit-ink-subtle);
}
.o__name {
  font-size: 12.5px;
  font-weight: 600;
  margin-top: 3px;
}
.o__time {
  font-size: 10.5px;
  color: var(--rekit-ink-subtle);
}

.cat { margin-bottom: 14px; }
.cat:last-child { margin-bottom: 0; }
.bar__head {
  display: flex;
  justify-content: space-between;
  font-size: 12.5px;
  margin-bottom: 6px;
}
.cat__name { font-weight: 600; }
.cat__n { color: var(--rekit-ink-subtle); }
.bar {
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  background: var(--rekit-surface-muted);
}
.bar__fill {
  height: 100%;
  background: var(--rekit-accent);
}

.stock {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--rekit-border);
}
.stock:last-child { border-bottom: 0; }
.stock__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.stock__dot--danger { background: var(--rekit-danger); }
.stock__dot--warn { background: #D4A23A; }
.stock__p {
  font-size: 12.5px;
  font-weight: 600;
  flex: 1;
  min-width: 0;
}
.stock__s {
  font-size: 11.5px;
  font-weight: 600;
}
.stock__s--danger { color: var(--rekit-danger); }
.stock__s--warn { color: #B5762A; }

@media (min-width: 768px) {
  .kpis {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }
  .kpi { padding: 20px; }
  .kpi__v span:first-child { font-size: 28px; }
  .kpi__label { font-size: 12px; }
  .kpi__s { font-size: 13px; }
  .row3 {
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .card { padding: 24px; }
  .chart { gap: 16px; }
}

@media (min-width: 1024px) {
  .row2 {
    grid-template-columns: 1.6fr 1fr;
    margin-bottom: 20px;
  }
}
</style>
