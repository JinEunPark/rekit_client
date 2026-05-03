<script setup lang="ts">
import { computed, ref } from 'vue'
import AdminShell from '@/components/admin/AdminShell.vue'
import Button from '@/components/ds/Button.vue'
import Badge from '@/components/ds/Badge.vue'

type Tone = 'info' | 'a' | 'accent' | 'danger'
type TabId = 'all' | 'paid' | 'prepping' | 'shipping' | 'delivered' | 'cancelled'

interface AdminOrder {
  id: string
  name: string
  phone: string
  items: string
  amt: string
  status: string
  tone: Tone
  date: string
  tracking: string | null
}

const orders: AdminOrder[] = [
  { id: 'RK-26050001', name: '박은영', phone: '010-1234-5678', items: '냉장고 외 2건', amt: '748,000원', status: '결제완료', tone: 'info', date: '05.01 09:24', tracking: null },
  { id: 'RK-26043099', name: '이민호', phone: '010-2345-6789', items: 'LG OLED TV 48형', amt: '480,000원', status: '준비중', tone: 'a', date: '04.30 18:11', tracking: null },
  { id: 'RK-26043098', name: '최선우', phone: '010-3456-7890', items: '캐리어 에어컨', amt: '320,000원', status: '배송중', tone: 'info', date: '04.30 14:02', tracking: '5821-0091-2345' },
  { id: 'RK-26043097', name: '정현지', phone: '010-4567-8901', items: 'LG 트롬 세탁기', amt: '240,000원', status: '배송완료', tone: 'accent', date: '04.29 11:30', tracking: '5821-0091-1992' },
  { id: 'RK-26043096', name: '윤도현', phone: '010-5678-9012', items: '쿠쿠 전자레인지', amt: '38,000원', status: '취소', tone: 'danger', date: '04.28 22:15', tracking: null },
  { id: 'RK-26043095', name: '한지민', phone: '010-6789-0123', items: '삼성 크리스탈 UHD', amt: '290,000원', status: '배송완료', tone: 'accent', date: '04.27 16:48', tracking: '5821-0090-8821' },
]

const tabs: { id: TabId; t: string; match: (o: AdminOrder) => boolean }[] = [
  { id: 'all', t: '전체', match: () => true },
  { id: 'paid', t: '결제완료', match: (o) => o.status === '결제완료' },
  { id: 'prepping', t: '준비중', match: (o) => o.status === '준비중' },
  { id: 'shipping', t: '배송중', match: (o) => o.status === '배송중' },
  { id: 'delivered', t: '배송완료', match: (o) => o.status === '배송완료' },
  { id: 'cancelled', t: '취소/환불', match: (o) => o.status === '취소' },
]

const active = ref<TabId>('all')

// Demo totals from the mockup — fixed numbers, not derived from `orders` (which is just a sample window).
const counts: Record<TabId, number> = {
  all: 124,
  paid: 4,
  prepping: 3,
  shipping: 8,
  delivered: 102,
  cancelled: 7,
}

const filtered = computed(() => {
  const tab = tabs.find((t) => t.id === active.value)!
  return orders.filter(tab.match)
})
</script>

<template>
  <AdminShell active="orders" title="주문 관리" subtitle="처리 대기 7건 · 오늘 14건">
    <template #header-right>
      <Button variant="secondary" size="sm" leading-icon="download">CSV 내보내기</Button>
    </template>

    <div class="tabs">
      <button
        v-for="s in tabs"
        :key="s.id"
        type="button"
        class="tab"
        :class="{ 'tab--active': active === s.id }"
        @click="active = s.id"
      >
        {{ s.t }}
        <span class="tab__n">{{ counts[s.id] }}</span>
      </button>
    </div>

    <div class="table">
      <div class="table__head">
        <span /><span>주문번호</span><span>주문자</span><span>상품</span><span>결제금액</span><span>상태</span><span>송장번호</span><span>관리</span>
      </div>
      <div v-for="(o, i) in filtered" :key="o.id" class="table__row" :class="{ 'table__row--first': i === 0 }">
        <span class="cb" />
        <div>
          <div class="id">{{ o.id }}</div>
          <div class="date">{{ o.date }}</div>
        </div>
        <div>
          <div class="name">{{ o.name }}</div>
          <div class="phone">{{ o.phone }}</div>
        </div>
        <span class="items">{{ o.items }}</span>
        <span class="amt">{{ o.amt }}</span>
        <span><Badge :tone="o.tone" size="sm">{{ o.status }}</Badge></span>
        <span class="tracking">{{ o.tracking || '—' }}</span>
        <span class="action">
          <Button
            v-if="o.status === '결제완료'"
            variant="primary"
            size="sm"
          >
            송장입력
          </Button>
          <Button
            v-else-if="o.status === '준비중'"
            variant="accent"
            size="sm"
          >
            송장입력
          </Button>
          <span v-else class="action__view">상세보기</span>
        </span>
      </div>
      <div v-if="filtered.length === 0" class="empty">해당 상태의 주문이 없습니다.</div>
    </div>
  </AdminShell>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  overflow-x: auto;
  scrollbar-width: none;
}
.tabs::-webkit-scrollbar { display: none; }
.tab {
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  background: var(--rekit-surface);
  color: var(--rekit-ink-muted);
  border: 1px solid var(--rekit-border);
  display: inline-flex;
  gap: 6px;
  align-items: center;
  white-space: nowrap;
  cursor: pointer;
}
.tab--active {
  background: var(--rekit-ink);
  color: #fff;
  border-color: transparent;
}
.tab__n {
  font-size: 11px;
  opacity: 1;
  font-family: var(--rekit-font-mono);
}
.tab--active .tab__n { opacity: 0.7; }

.table {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  overflow: hidden;
}
.table__head,
.table__row {
  display: grid;
  grid-template-columns: 40px 1.2fr 0.9fr 1.6fr 0.9fr 0.8fr 1.2fr 110px;
  padding: 12px 16px;
  align-items: center;
  gap: 8px;
}
.table__head {
  background: var(--rekit-surface-muted);
  color: var(--rekit-ink-muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.table__row {
  padding: 14px 16px;
  font-size: 13px;
  border-top: 1px solid var(--rekit-border);
}
.table__row--first { border-top: 0; }
.cb {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1.5px solid var(--rekit-border-strong);
}
.id {
  font-family: var(--rekit-font-mono);
  font-size: 12px;
  font-weight: 600;
}
.date,
.phone {
  font-size: 10.5px;
  color: var(--rekit-ink-subtle);
  margin-top: 2px;
}
.name { font-weight: 600; }
.items { font-size: 12.5px; }
.amt { font-weight: 700; }
.tracking {
  font-size: 11.5px;
  color: var(--rekit-ink-muted);
  font-family: var(--rekit-font-mono);
}
.action__view {
  font-size: 12px;
  color: var(--rekit-ink-subtle);
  font-weight: 600;
}
.empty {
  padding: 40px 16px;
  text-align: center;
  color: var(--rekit-ink-subtle);
  font-size: 13px;
}

@media (max-width: 1023px) {
  .table { overflow-x: auto; }
  .table__head,
  .table__row {
    min-width: 980px;
  }
}
</style>
