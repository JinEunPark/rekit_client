<script setup lang="ts">
import { computed, ref } from 'vue'
import AdminShell from '@/components/admin/AdminShell.vue'
import Button from '@/components/ds/Button.vue'
import Badge from '@/components/ds/Badge.vue'
import IconBase from '@/components/ds/IconBase.vue'
import { won } from '@/design/tokens'
import { useOrderStore, type Order } from '@/stores/orders'
import { isAwaitingDeposit, statusTone } from '@/stores/orders-helpers'

type TabId = 'all' | 'deposit' | 'paid' | 'prepping' | 'shipping' | 'delivered' | 'cancelled'

const orderStore = useOrderStore()

const tabs: { id: TabId; t: string; match: (o: Order) => boolean }[] = [
  { id: 'all', t: '전체', match: () => true },
  { id: 'deposit', t: '입금 안내', match: (o) => isAwaitingDeposit(o.status) },
  { id: 'paid', t: '결제완료', match: (o) => o.status === '결제완료' },
  { id: 'prepping', t: '준비중', match: (o) => o.status === '준비중' },
  { id: 'shipping', t: '배송중', match: (o) => o.status === '배송중' },
  { id: 'delivered', t: '배송완료', match: (o) => o.status === '배송완료' },
  { id: 'cancelled', t: '취소/환불', match: (o) => o.status === '취소' },
]

const active = ref<TabId>('all')

const counts = computed(() => {
  const map: Record<TabId, number> = {
    all: orderStore.orders.length,
    deposit: 0, paid: 0, prepping: 0, shipping: 0, delivered: 0, cancelled: 0,
  }
  for (const o of orderStore.orders) {
    if (isAwaitingDeposit(o.status)) map.deposit++
    if (o.status === '결제완료') map.paid++
    if (o.status === '준비중') map.prepping++
    if (o.status === '배송중') map.shipping++
    if (o.status === '배송완료') map.delivered++
    if (o.status === '취소') map.cancelled++
  }
  return map
})

const filtered = computed(() => {
  const tab = tabs.find((t) => t.id === active.value)!
  const list = orderStore.orders.filter(tab.match)
  // Within deposit-pending, push 결제확인요청(buyer-claimed paid) to the top — admin priority.
  if (active.value === 'deposit' || active.value === 'all') {
    return [...list].sort((a, b) => {
      const aReq = a.status === '결제확인요청' ? 0 : 1
      const bReq = b.status === '결제확인요청' ? 0 : 1
      return aReq - bReq
    })
  }
  return list
})

const todaySummary = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  const todayOrders = orderStore.orders.filter((o) => o.createdAt.slice(0, 10) === today)
  const pending = orderStore.orders.filter((o) => isAwaitingDeposit(o.status)).length
  return { today: todayOrders.length, pending }
})

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function approve(id: string) {
  orderStore.approvePayment(id)
}

function moveToPrepping(id: string) {
  orderStore.setStatus(id, '준비중')
}
</script>

<template>
  <AdminShell
    active="orders"
    title="주문 관리"
    :subtitle="`처리 대기 ${todaySummary.pending}건 · 오늘 ${todaySummary.today}건`"
  >
    <template #header-right>
      <Button variant="secondary" size="sm" leading-icon="download">CSV 내보내기</Button>
    </template>

    <div class="tabs">
      <button
        v-for="s in tabs"
        :key="s.id"
        type="button"
        class="tab"
        :class="{ 'tab--active': active === s.id, 'tab--alert': s.id === 'deposit' && counts.deposit > 0 }"
        @click="active = s.id"
      >
        <span v-if="s.id === 'deposit' && counts.deposit > 0" class="tab__dot" />
        {{ s.t }}
        <span class="tab__n">{{ counts[s.id] }}</span>
      </button>
    </div>

    <div class="table">
      <div class="table__head">
        <span /><span>주문번호</span><span>주문자</span><span>상품</span><span>결제금액</span><span>상태</span><span>송장번호</span><span>관리</span>
      </div>
      <div
        v-for="(o, i) in filtered"
        :key="o.id"
        class="table__row"
        :class="{
          'table__row--first': i === 0,
          'table__row--alert': o.status === '결제확인요청',
        }"
      >
        <span class="cb" />
        <div>
          <div class="id">{{ o.id }}</div>
          <div class="date">{{ formatDate(o.createdAt) }}</div>
        </div>
        <div>
          <div class="name">{{ o.address.recipient }}</div>
          <div class="phone">{{ o.address.phone }}</div>
        </div>
        <span class="items">
          {{ o.items[0]?.title ?? '—' }}{{ o.items.length > 1 ? ` 외 ${o.items.length - 1}건` : '' }}
        </span>
        <span class="amt">{{ won(o.total) }}</span>
        <span>
          <Badge :tone="statusTone(o.status)" size="sm">{{ o.status }}</Badge>
        </span>
        <span class="tracking">—</span>
        <span class="action">
          <Button
            v-if="isAwaitingDeposit(o.status)"
            variant="accent"
            size="sm"
            leading-icon="check"
            @click="approve(o.id)"
          >
            결제 승인
          </Button>
          <Button
            v-else-if="o.status === '결제완료'"
            variant="primary"
            size="sm"
            @click="moveToPrepping(o.id)"
          >
            준비 시작
          </Button>
          <Button
            v-else-if="o.status === '준비중'"
            variant="primary"
            size="sm"
          >
            송장입력
          </Button>
          <span v-else class="action__view">상세보기</span>
        </span>
      </div>
      <div v-if="filtered.length === 0" class="empty">
        <div v-if="active === 'all'" class="empty__main">
          아직 주문이 없습니다.
          <div class="empty__sub">고객이 주문하면 이곳에 표시됩니다.</div>
        </div>
        <span v-else>해당 상태의 주문이 없습니다.</span>
      </div>
    </div>

    <div v-if="counts.deposit > 0 && active !== 'deposit'" class="hint">
      <IconBase name="info" :size="14" />
      <span>입금 확인이 필요한 주문이 <b>{{ counts.deposit }}건</b> 있어요. "입금 안내" 탭에서 처리하세요.</span>
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
  position: relative;
}
.tab--active {
  background: var(--rekit-ink);
  color: #fff;
  border-color: transparent;
}
.tab--alert:not(.tab--active) {
  border-color: var(--rekit-danger);
  color: var(--rekit-danger);
}
.tab__n {
  font-size: 11px;
  opacity: 1;
  font-family: var(--rekit-font-mono);
}
.tab--active .tab__n { opacity: 0.7; }
.tab__dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--rekit-danger);
}

.table {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  overflow: hidden;
}
.table__head,
.table__row {
  display: grid;
  grid-template-columns: 40px 1.2fr 0.9fr 1.6fr 0.9fr 0.8fr 1.2fr 130px;
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
.table__row--alert {
  background: #FFF8E8;
}
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
.empty__main { font-weight: 600; color: var(--rekit-ink-muted); }
.empty__sub {
  margin-top: 4px;
  font-size: 12px;
  color: var(--rekit-ink-subtle);
  font-weight: 500;
}

.hint {
  margin-top: 12px;
  padding: 10px 14px;
  background: var(--rekit-surface-muted);
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--rekit-ink-muted);
}
.hint svg { color: var(--rekit-ink-subtle); }
.hint b { color: var(--rekit-ink); font-weight: 700; }

@media (max-width: 1023px) {
  .table { overflow-x: auto; }
  .table__head,
  .table__row {
    min-width: 1000px;
  }
}
</style>
