<script setup lang="ts">
import { REKIT } from '@/design/tokens'
import AdminShell from '@/_design/components/AdminShell.vue'
import Button from '@/components/ds/Button.vue'
import Badge from '@/components/ds/Badge.vue'

type Tone = 'info' | 'a' | 'accent' | 'danger'

const tabs: { t: string; n: number; sel?: boolean }[] = [
  { t: '전체', n: 124, sel: true },
  { t: '결제완료', n: 4 },
  { t: '준비중', n: 3 },
  { t: '배송중', n: 8 },
  { t: '배송완료', n: 102 },
  { t: '취소/환불', n: 7 },
]

const orders: { id: string; name: string; phone: string; items: string; amt: string; status: string; tone: Tone; date: string; tracking: string | null }[] = [
  { id: 'RK-26050001', name: '박은영', phone: '010-1234-5678', items: '냉장고 외 2건', amt: '748,000원', status: '결제완료', tone: 'info', date: '05.01 09:24', tracking: null },
  { id: 'RK-26043099', name: '이민호', phone: '010-2345-6789', items: 'LG OLED TV 48형', amt: '480,000원', status: '준비중', tone: 'a', date: '04.30 18:11', tracking: null },
  { id: 'RK-26043098', name: '최선우', phone: '010-3456-7890', items: '캐리어 에어컨', amt: '320,000원', status: '배송중', tone: 'info', date: '04.30 14:02', tracking: '5821-0091-2345' },
  { id: 'RK-26043097', name: '정현지', phone: '010-4567-8901', items: 'LG 트롬 세탁기', amt: '240,000원', status: '배송완료', tone: 'accent', date: '04.29 11:30', tracking: '5821-0091-1992' },
  { id: 'RK-26043096', name: '윤도현', phone: '010-5678-9012', items: '쿠쿠 전자레인지', amt: '38,000원', status: '취소', tone: 'danger', date: '04.28 22:15', tracking: null },
  { id: 'RK-26043095', name: '한지민', phone: '010-6789-0123', items: '삼성 크리스탈 UHD', amt: '290,000원', status: '배송완료', tone: 'accent', date: '04.27 16:48', tracking: '5821-0090-8821' },
]
</script>

<template>
  <AdminShell active="orders" title="주문 관리" subtitle="처리 대기 7건 · 오늘 14건">
    <template #header-right>
      <Button variant="secondary" size="sm" leading-icon="download">CSV 내보내기</Button>
    </template>

    <div class="tabs">
      <span
        v-for="s in tabs"
        :key="s.t"
        class="tabs__t"
        :style="{
          background: s.sel ? REKIT.color.ink : REKIT.color.surface,
          color: s.sel ? '#fff' : REKIT.color.inkMuted,
          border: s.sel ? 'none' : `1px solid ${REKIT.color.border}`,
        }"
      >
        {{ s.t }}
        <span :style="{ fontSize: '11px', opacity: s.sel ? 0.7 : 1, fontFamily: REKIT.font.mono }">
          {{ s.n }}
        </span>
      </span>
    </div>

    <div class="table" :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }">
      <div class="table__head" :style="{ background: REKIT.color.surfaceMuted, color: REKIT.color.inkMuted }">
        <span /><span>주문번호</span><span>주문자</span><span>상품</span><span>결제금액</span><span>상태</span><span>송장번호</span><span>관리</span>
      </div>
      <div
        v-for="(o, i) in orders"
        :key="o.id"
        class="table__row"
        :style="{ borderTop: i > 0 ? `1px solid ${REKIT.color.border}` : 'none' }"
      >
        <span class="cb" :style="{ border: `1.5px solid ${REKIT.color.borderStrong}` }" />
        <div>
          <div :style="{ fontFamily: REKIT.font.mono, fontSize: '12px', fontWeight: 600 }">{{ o.id }}</div>
          <div :style="{ fontSize: '10.5px', color: REKIT.color.inkSubtle, marginTop: '2px' }">{{ o.date }}</div>
        </div>
        <div>
          <div style="font-weight: 600">{{ o.name }}</div>
          <div :style="{ fontSize: '10.5px', color: REKIT.color.inkSubtle, marginTop: '2px' }">{{ o.phone }}</div>
        </div>
        <span style="font-size: 12.5px">{{ o.items }}</span>
        <span style="font-weight: 700">{{ o.amt }}</span>
        <span><Badge :tone="o.tone" size="sm">{{ o.status }}</Badge></span>
        <span :style="{ fontSize: '11.5px', color: REKIT.color.inkMuted, fontFamily: REKIT.font.mono }">
          {{ o.tracking || '—' }}
        </span>
        <span>
          <Button
            v-if="o.status === '결제완료'"
            variant="primary"
            size="sm"
            :style="{ height: '30px', fontSize: '12px' }"
          >
            송장입력
          </Button>
          <Button
            v-else-if="o.status === '준비중'"
            variant="accent"
            size="sm"
            :style="{ height: '30px', fontSize: '12px' }"
          >
            송장입력
          </Button>
          <span v-else :style="{ fontSize: '12px', color: REKIT.color.inkSubtle, fontWeight: 600 }">상세보기</span>
        </span>
      </div>
    </div>
  </AdminShell>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
}
.tabs__t {
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  display: inline-flex;
  gap: 6px;
  align-items: center;
}
.table {
  border-radius: 16px;
  overflow: hidden;
}
.table__head,
.table__row {
  display: grid;
  grid-template-columns: 40px 1.2fr 0.9fr 1.6fr 0.9fr 0.8fr 1.2fr 110px;
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
