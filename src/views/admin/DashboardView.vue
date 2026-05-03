<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import AdminShell from '@/components/admin/AdminShell.vue'
import Button from '@/components/ds/Button.vue'
import Badge from '@/components/ds/Badge.vue'

type KpiTone = 'accent' | 'danger' | 'warn'
type OrderTone = 'info' | 'a' | 'accent' | 'danger'

const kpis: { l: string; v: string; d: string; s: string; tone: KpiTone }[] = [
  { l: '오늘 주문', v: '14', d: '+3', s: '건', tone: 'accent' },
  { l: '오늘 매출', v: '3,840,000', d: '+18%', s: '원', tone: 'accent' },
  { l: '처리 대기', v: '7', d: '긴급 2', s: '건', tone: 'danger' },
  { l: '재고 부족', v: '2', d: '품절 임박', s: '품목', tone: 'warn' },
]

const bars = [
  { d: '월', v: 0.45, val: '1.4M', cur: false },
  { d: '화', v: 0.62, val: '1.9M', cur: false },
  { d: '수', v: 0.38, val: '1.2M', cur: false },
  { d: '목', v: 0.78, val: '2.4M', cur: false },
  { d: '금', v: 0.55, val: '1.7M', cur: false },
  { d: '토', v: 0.92, val: '2.9M', cur: false },
  { d: '일', v: 1.0, val: '3.8M', cur: true },
]

const orders: { o: string; n: string; p: string; t: string; tone: OrderTone; time: string }[] = [
  { o: 'RK-26050001', n: '박은영', p: '냉장고 외 2건', t: '결제완료', tone: 'info', time: '10분 전' },
  { o: 'RK-26050002', n: '이민호', p: 'TV 55형', t: '준비중', tone: 'a', time: '32분 전' },
  { o: 'RK-26050003', n: '최선우', p: '에어컨', t: '결제완료', tone: 'info', time: '1시간 전' },
  { o: 'RK-26050004', n: '정현지', p: '세탁기', t: '준비중', tone: 'a', time: '2시간 전' },
]

const cats = [
  { c: '냉장고', n: 32, p: 78 },
  { c: '세탁기', n: 21, p: 51 },
  { c: 'TV', n: 18, p: 44 },
  { c: '에어컨', n: 9, p: 22 },
]

const stocks: { p: string; s: string; tone: 'danger' | 'warn' }[] = [
  { p: 'LG OLED TV 48형', s: '재고 0', tone: 'danger' },
  { p: '쿠쿠 전자레인지 20L', s: '재고 1개', tone: 'warn' },
  { p: '캐리어 스탠드 에어컨', s: '문의 12건 / 재고 1', tone: 'warn' },
]

const periodLabels = ['7일', '30일', '90일']
const period = ref(0)
</script>

<template>
  <AdminShell active="dashboard" title="대시보드" subtitle="2026년 5월 1일(금) · 오늘의 운영 현황">
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
          <div>
            <div class="card__title">최근 7일 매출</div>
            <div class="card__sub">2026.04.25 ~ 05.01</div>
          </div>
          <div class="periods">
            <button
              v-for="(p, i) in periodLabels"
              :key="p"
              type="button"
              class="period"
              :class="{ 'period--active': period === i }"
              @click="period = i"
            >
              {{ p }}
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
          <div v-for="o in orders" :key="o.o" class="o">
            <div class="o__main">
              <div class="o__row">
                <span class="o__id">{{ o.o }}</span>
                <Badge :tone="o.tone" size="xs">{{ o.t }}</Badge>
              </div>
              <div class="o__name">{{ o.n }} · {{ o.p }}</div>
            </div>
            <div class="o__time">{{ o.time }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="row3">
      <div class="card">
        <div class="card__title">인기 카테고리</div>
        <div v-for="r in cats" :key="r.c" class="cat">
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
