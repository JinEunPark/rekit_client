<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminShell from '@/components/admin/AdminShell.vue'
import Button from '@/components/ds/Button.vue'
import Badge from '@/components/ds/Badge.vue'
import IconBase from '@/components/ds/IconBase.vue'
import { won } from '@/design/tokens'
import { statusLabel, statusTone } from '@/stores/orders-helpers'
import type { OrderStatus } from '@/api/orders'
import {
  listAdminOrders,
  updateAdminOrderStatus,
  inputShipment,
  cancelAdminOrder,
  exportOrdersCsv,
} from '@/api/admin/orders'
import type { AdminOrderListItem, AdminOrderStatusCounts } from '@/api/admin/orders'
import { ApiError } from '@/api/client'

type TabId = keyof AdminOrderStatusCounts

const tabs: { id: TabId; t: string; status?: OrderStatus }[] = [
  { id: 'all', t: '전체' },
  { id: 'paid', t: '결제완료', status: 'PAID' },
  { id: 'preparing', t: '준비중', status: 'PREPARING' },
  { id: 'shipping', t: '배송중', status: 'SHIPPING' },
  { id: 'delivered', t: '배송완료', status: 'DELIVERED' },
  { id: 'cancelled', t: '취소/환불', status: 'CANCELLED' },
]

const active = ref<TabId>('all')
const orders = ref<AdminOrderListItem[]>([])
const counts = ref<AdminOrderStatusCounts>({ all: 0, paid: 0, preparing: 0, shipping: 0, delivered: 0, cancelled: 0 })
const loading = ref(false)
const actionError = ref('')

// 송장 입력 모달 상태
const shipmentTarget = ref<string | null>(null)
const carrier = ref('')
const trackingNumber = ref('')

const exportHref = computed(() => exportOrdersCsv(tabs.find((t) => t.id === active.value)?.status))

async function load() {
  loading.value = true
  actionError.value = ''
  try {
    const tab = tabs.find((t) => t.id === active.value)
    const res = await listAdminOrders({ status: tab?.status, size: 50 })
    orders.value = res.items
    counts.value = res.counts
  } catch (err) {
    console.error('[admin/orders]', err)
  } finally {
    loading.value = false
  }
}

async function startPrepping(orderNumber: string) {
  try {
    await updateAdminOrderStatus(orderNumber, 'PREPARING')
    await load()
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : '오류가 발생했습니다.'
  }
}

async function submitShipment() {
  if (!shipmentTarget.value || !carrier.value.trim() || !trackingNumber.value.trim()) return
  try {
    await inputShipment(shipmentTarget.value, carrier.value.trim(), trackingNumber.value.trim())
    shipmentTarget.value = null
    carrier.value = ''
    trackingNumber.value = ''
    await load()
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : '오류가 발생했습니다.'
  }
}

async function cancel(orderNumber: string) {
  if (!confirm(`주문 ${orderNumber}을 취소하시겠습니까?`)) return
  try {
    await cancelAdminOrder(orderNumber, '관리자 취소')
    await load()
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : '오류가 발생했습니다.'
  }
}

function switchTab(id: TabId) {
  active.value = id
  load()
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

onMounted(load)
</script>

<template>
  <AdminShell
    active="orders"
    title="주문 관리"
    :subtitle="`전체 ${counts.all}건`"
  >
    <template #header-right>
      <a :href="exportHref" download>
        <Button variant="secondary" size="sm" leading-icon="download">CSV 내보내기</Button>
      </a>
    </template>

    <div class="tabs">
      <button
        v-for="s in tabs"
        :key="s.id"
        type="button"
        class="tab"
        :class="{ 'tab--active': active === s.id, 'tab--alert': s.id === 'paid' && counts.paid > 0 }"
        @click="switchTab(s.id)"
      >
        <span v-if="s.id === 'paid' && counts.paid > 0" class="tab__dot" />
        {{ s.t }}
        <span class="tab__n">{{ counts[s.id] }}</span>
      </button>
    </div>

    <div v-if="actionError" class="action-error">
      <IconBase name="info" :size="14" />
      {{ actionError }}
      <button type="button" class="action-error__close" @click="actionError = ''">✕</button>
    </div>

    <div class="table">
      <div class="table__head">
        <span /><span>주문번호</span><span>주문자</span><span>상품</span><span>결제금액</span><span>상태</span><span>송장번호</span><span>관리</span>
      </div>
      <div
        v-for="(o, i) in orders"
        :key="o.order_number"
        class="table__row"
        :class="{
          'table__row--first': i === 0,
          'table__row--alert': o.status === 'PAID',
        }"
      >
        <span class="cb" />
        <div>
          <div class="id">{{ o.order_number }}</div>
          <div class="date">{{ formatDate(o.created_at) }}</div>
        </div>
        <div>
          <div class="name">{{ o.username }}</div>
          <div class="phone">{{ o.recipient_phone }}</div>
        </div>
        <span class="items">
          {{ o.first_item_title }}{{ o.item_count > 1 ? ` 외 ${o.item_count - 1}건` : '' }}
        </span>
        <span class="amt">{{ won(o.total_amount) }}</span>
        <span>
          <Badge :tone="statusTone(o.status)" size="sm">{{ statusLabel(o.status) }}</Badge>
        </span>
        <span class="tracking">—</span>
        <span class="action">
          <Button
            v-if="o.status === 'PAID'"
            variant="primary"
            size="sm"
            @click="startPrepping(o.order_number)"
          >
            준비 시작
          </Button>
          <Button
            v-else-if="o.status === 'PREPARING'"
            variant="primary"
            size="sm"
            @click="shipmentTarget = o.order_number"
          >
            송장입력
          </Button>
          <Button
            v-else-if="o.status !== 'CANCELLED' && o.status !== 'DELIVERED' && o.status !== 'REFUNDED'"
            variant="secondary"
            size="sm"
            @click="cancel(o.order_number)"
          >
            취소
          </Button>
          <span v-else class="action__view">상세보기</span>
        </span>
      </div>
      <div v-if="!loading && orders.length === 0" class="empty">
        <div v-if="active === 'all'" class="empty__main">
          아직 주문이 없습니다.
          <div class="empty__sub">고객이 주문하면 이곳에 표시됩니다.</div>
        </div>
        <span v-else>해당 상태의 주문이 없습니다.</span>
      </div>
      <div v-if="loading" class="empty">불러오는 중…</div>
    </div>

    <div v-if="counts.paid > 0 && active !== 'paid'" class="hint">
      <IconBase name="info" :size="14" />
      <span>결제 완료 주문이 <b>{{ counts.paid }}건</b> 있어요. "결제완료" 탭에서 확인하세요.</span>
    </div>
  </AdminShell>

  <!-- 송장 입력 모달 -->
  <div v-if="shipmentTarget" class="modal-backdrop" @click.self="shipmentTarget = null">
    <div class="modal">
      <div class="modal__title">송장 입력</div>
      <div class="modal__order">{{ shipmentTarget }}</div>
      <div class="field">
        <label class="field__label">택배사</label>
        <input v-model="carrier" class="field__input" placeholder="예: CJ대한통운" />
      </div>
      <div class="field">
        <label class="field__label">송장번호</label>
        <input v-model="trackingNumber" class="field__input" placeholder="예: 123456789012" />
      </div>
      <div class="modal__actions">
        <Button variant="secondary" size="sm" @click="shipmentTarget = null">취소</Button>
        <Button
          variant="primary"
          size="sm"
          :disabled="!carrier.trim() || !trackingNumber.trim()"
          @click="submitShipment"
        >
          입력 완료
        </Button>
      </div>
    </div>
  </div>
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
  font-family: var(--rekit-font-mono);
}
.tab--active .tab__n { opacity: 0.7; }
.tab__dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--rekit-danger);
}

.action-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #FFF0F0;
  border: 1px solid var(--rekit-danger);
  border-radius: 12px;
  font-size: 12.5px;
  color: var(--rekit-danger);
  margin-bottom: 12px;
}
.action-error__close {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--rekit-danger);
  font-size: 12px;
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
.table__row--alert { background: #FFF8E8; }
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
  .table__row { min-width: 1000px; }
}

/* 송장 입력 모달 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: var(--rekit-surface);
  border-radius: 20px;
  padding: 28px 24px;
  width: min(400px, calc(100vw - 32px));
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.modal__title {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.modal__order {
  font-size: 12px;
  font-family: var(--rekit-font-mono);
  color: var(--rekit-ink-subtle);
  margin-top: -8px;
}
.field { display: flex; flex-direction: column; gap: 6px; }
.field__label { font-size: 12px; font-weight: 600; color: var(--rekit-ink-muted); }
.field__input {
  padding: 10px 14px;
  border: 1.5px solid var(--rekit-border-strong);
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  background: var(--rekit-surface);
  color: var(--rekit-ink);
}
.field__input:focus {
  border-color: var(--rekit-ink);
  box-shadow: 0 0 0 3px rgba(26,26,23,0.06);
}
.modal__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
