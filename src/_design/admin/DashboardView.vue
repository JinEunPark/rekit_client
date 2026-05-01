<script setup lang="ts">
import { REKIT } from '@/design/tokens'
import AdminShell from '@/_design/components/AdminShell.vue'
import Button from '@/components/ds/Button.vue'
import Badge from '@/components/ds/Badge.vue'

const kpis = [
  { l: '오늘 주문', v: '14', d: '+3', s: '건', tone: 'accent' as const },
  { l: '오늘 매출', v: '3,840,000', d: '+18%', s: '원', tone: 'accent' as const },
  { l: '처리 대기', v: '7', d: '긴급 2', s: '건', tone: 'danger' as const },
  { l: '재고 부족', v: '2', d: '품절 임박', s: '품목', tone: 'warn' as const },
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

const orders = [
  { o: 'RK-26050001', n: '박은영', p: '냉장고 외 2건', t: '결제완료', tone: 'info' as const, time: '10분 전' },
  { o: 'RK-26050002', n: '이민호', p: 'TV 55형', t: '준비중', tone: 'a' as const, time: '32분 전' },
  { o: 'RK-26050003', n: '최선우', p: '에어컨', t: '결제완료', tone: 'info' as const, time: '1시간 전' },
  { o: 'RK-26050004', n: '정현지', p: '세탁기', t: '준비중', tone: 'a' as const, time: '2시간 전' },
]

const cats = [
  { c: '냉장고', n: 32, p: 78 },
  { c: '세탁기', n: 21, p: 51 },
  { c: 'TV', n: 18, p: 44 },
  { c: '에어컨', n: 9, p: 22 },
]

const stocks = [
  { p: 'LG OLED TV 48형', s: '재고 0', tone: 'danger' },
  { p: '쿠쿠 전자레인지 20L', s: '재고 1개', tone: 'warn' },
  { p: '캐리어 스탠드 에어컨', s: '문의 12건 / 재고 1', tone: 'warn' },
]

const periodLabels = ['7일', '30일', '90일']

function kpiColor(tone: 'accent' | 'danger' | 'warn') {
  if (tone === 'danger') return REKIT.color.danger
  if (tone === 'warn') return '#B5762A'
  return REKIT.color.accentDeep
}
</script>

<template>
  <AdminShell active="dashboard" title="대시보드" subtitle="2026년 5월 1일(금) · 오늘의 운영 현황">
    <template #header-right>
      <Button variant="secondary" size="sm" leading-icon="download">CSV 내보내기</Button>
      <Button variant="primary" size="sm" leading-icon="plus">상품 등록</Button>
    </template>

    <div class="kpis">
      <div
        v-for="k in kpis"
        :key="k.l"
        class="kpi"
        :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }"
      >
        <div :style="{ fontSize: '12px', color: REKIT.color.inkSubtle, fontWeight: 600 }">{{ k.l }}</div>
        <div class="kpi__v">
          <span>{{ k.v }}</span>
          <span class="kpi__s" :style="{ color: REKIT.color.inkSubtle }">{{ k.s }}</span>
        </div>
        <div class="kpi__d" :style="{ color: kpiColor(k.tone) }">{{ k.d }}</div>
      </div>
    </div>

    <div class="row2">
      <div class="card" :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }">
        <div class="card__head">
          <div>
            <div :style="{ fontSize: '14px', fontWeight: 700 }">최근 7일 매출</div>
            <div :style="{ fontSize: '12px', color: REKIT.color.inkSubtle, marginTop: '2px' }">2026.04.25 ~ 05.01</div>
          </div>
          <div style="display: flex; gap: 6px">
            <span
              v-for="(p, i) in periodLabels"
              :key="p"
              class="period"
              :style="{
                background: i === 0 ? REKIT.color.ink : REKIT.color.surfaceMuted,
                color: i === 0 ? '#fff' : REKIT.color.inkMuted,
              }"
            >
              {{ p }}
            </span>
          </div>
        </div>
        <div class="chart" :style="{ borderBottom: `1px solid ${REKIT.color.border}` }">
          <div v-for="b in bars" :key="b.d" class="chart__col">
            <div :style="{ fontSize: '10.5px', fontWeight: 700, color: b.cur ? REKIT.color.accentDeep : REKIT.color.inkSubtle }">
              {{ b.val }}
            </div>
            <div
              class="chart__bar"
              :style="{
                height: `${b.v * 150}px`,
                background: b.cur ? REKIT.color.accent : REKIT.color.accentSoft,
              }"
            />
            <div class="chart__label" :style="{ color: REKIT.color.inkSubtle }">{{ b.d }}</div>
          </div>
        </div>
      </div>

      <div class="card" :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }">
        <div :style="{ fontSize: '14px', fontWeight: 700, marginBottom: '14px' }">처리 대기 주문</div>
        <div style="display: flex; flex-direction: column; gap: 10px">
          <div
            v-for="o in orders"
            :key="o.o"
            class="o"
            :style="{ borderBottom: `1px solid ${REKIT.color.border}` }"
          >
            <div style="flex: 1; min-width: 0">
              <div style="display: flex; align-items: center; gap: 6px">
                <span :style="{ fontSize: '11.5px', fontFamily: REKIT.font.mono, color: REKIT.color.inkSubtle }">
                  {{ o.o }}
                </span>
                <Badge :tone="o.tone" size="xs">{{ o.t }}</Badge>
              </div>
              <div :style="{ fontSize: '12.5px', fontWeight: 600, marginTop: '3px' }">
                {{ o.n }} · {{ o.p }}
              </div>
            </div>
            <div :style="{ fontSize: '10.5px', color: REKIT.color.inkSubtle }">{{ o.time }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="row3">
      <div class="card" :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }">
        <div :style="{ fontSize: '14px', fontWeight: 700, marginBottom: '14px' }">인기 카테고리</div>
        <div v-for="r in cats" :key="r.c" style="margin-bottom: 14px">
          <div class="bar__head">
            <span :style="{ fontWeight: 600 }">{{ r.c }}</span>
            <span :style="{ color: REKIT.color.inkSubtle }">{{ r.n }}건 판매</span>
          </div>
          <div class="bar" :style="{ background: REKIT.color.surfaceMuted }">
            <div :style="{ width: `${r.p}%`, height: '100%', background: REKIT.color.accent }" />
          </div>
        </div>
      </div>

      <div class="card" :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }">
        <div :style="{ fontSize: '14px', fontWeight: 700, marginBottom: '14px' }">재고 알림</div>
        <div
          v-for="r in stocks"
          :key="r.p"
          class="stock"
          :style="{ borderBottom: `1px solid ${REKIT.color.border}` }"
        >
          <div :style="{ width: '8px', height: '8px', borderRadius: '999px', background: r.tone === 'danger' ? REKIT.color.danger : '#D4A23A' }" />
          <span :style="{ fontSize: '12.5px', fontWeight: 600, flex: 1 }">{{ r.p }}</span>
          <span :style="{ fontSize: '11.5px', color: r.tone === 'danger' ? REKIT.color.danger : '#B5762A', fontWeight: 600 }">
            {{ r.s }}
          </span>
        </div>
      </div>
    </div>
  </AdminShell>
</template>

<style scoped>
.kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.kpi {
  border-radius: 16px;
  padding: 20px;
}
.kpi__v {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 6px;
}
.kpi__v span:first-child {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.kpi__s {
  font-size: 13px;
  font-weight: 600;
}
.kpi__d {
  margin-top: 4px;
  font-size: 11.5px;
  font-weight: 600;
}
.row2 {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}
.row3 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.card {
  border-radius: 16px;
  padding: 24px;
}
.card__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 18px;
}
.period {
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
}
.chart {
  height: 200px;
  display: flex;
  align-items: flex-end;
  gap: 16px;
  padding-bottom: 28px;
  position: relative;
}
.chart__col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.chart__bar {
  width: 100%;
  border-radius: 6px 6px 0 0;
}
.chart__label {
  position: absolute;
  bottom: 8px;
  font-size: 11px;
  font-weight: 600;
}
.o {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
}
.bar__head {
  display: flex;
  justify-content: space-between;
  font-size: 12.5px;
  margin-bottom: 6px;
}
.bar {
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
}
.stock {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
}
</style>
