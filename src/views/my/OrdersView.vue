<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { won } from '@/design/tokens'
import IconBase from '@/components/ds/IconBase.vue'
import Badge from '@/components/ds/Badge.vue'
import Button from '@/components/ds/Button.vue'
import { useAuthStore } from '@/stores/auth'
import { useOrderStore, type OrderStatus } from '@/stores/orders'
import { statusLabel, statusTone } from '@/stores/orders-helpers'

const route = useRoute()
const auth = useAuthStore()
const orders = useOrderStore()

const FILTERS: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'PENDING', label: '결제대기' },
  { key: 'PAID', label: '결제완료' },
  { key: 'PREPARING', label: '준비중' },
  { key: 'SHIPPING', label: '배송중' },
  { key: 'DELIVERED', label: '배송완료' },
  { key: 'CANCELLED', label: '취소' },
]

type FilterKey = OrderStatus | 'all'
const filter = ref<FilterKey>((route.query.status as FilterKey) ?? 'all')

const filteredOrders = computed(() => {
  if (filter.value === 'all') return orders.orders
  return orders.orders.filter((o) => o.status === filter.value)
})

const counts = computed(() => {
  const map: Partial<Record<FilterKey, number>> = { all: orders.orders.length }
  for (const o of orders.orders) {
    map[o.status] = (map[o.status] ?? 0) + 1
  }
  return map
})

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function summarizeItems(o: (typeof orders.orders)[number]) {
  const first = o.items[0]
  if (!first) return ''
  if (o.items.length === 1) return first.titleSnapshot
  return `${first.titleSnapshot} 외 ${o.items.length - 1}건`
}

function shippingLabel(method: string) {
  if (method === 'DIRECT') return '직접배송'
  if (method === 'FREIGHT') return '화물택배'
  return '택배'
}
</script>

<template>
  <!-- Guest fallback (mirrors MyView pattern) -->
  <div v-if="!auth.user" class="guest">
    <div class="guest__icon">
      <IconBase name="box" :size="36" :stroke="1.5" />
    </div>
    <h1 class="guest__t">로그인하면 주문 내역을 볼 수 있어요</h1>
    <p class="guest__b">결제하신 주문과 배송 현황을 한 눈에 확인하세요.</p>
    <RouterLink to="/auth/sign-in?redirect=/my/orders" class="guest__btn">로그인</RouterLink>
  </div>

  <div v-else class="page">
    <header class="page__head">
      <h1 class="page__title">주문 내역</h1>
      <span class="page__count">총 {{ orders.total }}건</span>
    </header>

    <!-- Status tabs -->
    <nav class="tabs rekit-no-scrollbar" aria-label="상태 필터">
      <button
        v-for="f in FILTERS"
        :key="f.key"
        type="button"
        class="tab"
        :class="{ 'tab--active': filter === f.key }"
        @click="filter = f.key"
      >
        {{ f.label }}
        <span class="tab__count">{{ counts[f.key] ?? 0 }}</span>
      </button>
    </nav>

    <!-- Empty -->
    <div v-if="filteredOrders.length === 0" class="empty">
      <div class="empty__icon">
        <IconBase name="box" :size="32" :stroke="1.5" />
      </div>
      <h2 class="empty__t">
        {{ filter === 'all' ? '아직 주문 내역이 없어요' : '해당 상태의 주문이 없어요' }}
      </h2>
      <p v-if="filter === 'all'" class="empty__b">
        검수 완료된 가전을 평균 73% 할인 가격으로 만나보세요.
      </p>
      <RouterLink v-if="filter === 'all'" to="/products" class="empty__btn">
        상품 둘러보기
      </RouterLink>
    </div>

    <!-- List -->
    <ul v-else class="list">
      <li v-for="o in filteredOrders" :key="o.orderNumber" class="card">
        <header class="card__head">
          <Badge :tone="statusTone(o.status)" size="sm">{{ statusLabel(o.status) }}</Badge>
          <span class="card__id">{{ o.orderNumber }}</span>
          <span class="card__date">{{ formatDate(o.createdAt) }}</span>
        </header>
        <RouterLink :to="`/my/orders/${o.orderNumber}`" class="card__body">
          <div class="card__row">
            <div class="card__title">{{ summarizeItems(o) }}</div>
            <IconBase name="chevronRight" :size="16" class="card__chev" />
          </div>
          <div class="card__meta">
            <span>{{ shippingLabel(o.shippingMethod) }}</span>
          </div>
        </RouterLink>
        <footer class="card__foot">
          <div class="card__total">
            <span class="card__total-l">결제 금액</span>
            <span class="card__total-v">{{ won(o.totalAmount) }}</span>
          </div>
          <div class="card__actions">
            <Button variant="secondary" size="sm">배송조회</Button>
            <RouterLink :to="'/my/orders/' + o.orderNumber">
              <Button variant="secondary" size="sm">주문상세</Button>
            </RouterLink>
          </div>
        </footer>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.page {
  max-width: 720px;
  margin: 0 auto;
  padding: 16px 16px 32px;
}
@media (min-width: 768px) {
  .page {
    padding: 32px 24px 56px;
  }
}

.page__head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 16px;
}
.page__title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.025em;
}
.page__count {
  font-size: 13px;
  font-weight: 600;
  color: var(--rekit-ink-subtle);
  font-family: var(--rekit-font-mono);
}
@media (min-width: 768px) {
  .page__title {
    font-size: 28px;
  }
}

/* tabs */
.tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin: 0 -16px 16px;
  padding-left: 16px;
  padding-right: 16px;
  border-bottom: 1px solid var(--rekit-border);
}
.tab {
  flex-shrink: 0;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  background: var(--rekit-surface);
  color: var(--rekit-ink-muted);
  border: 1px solid var(--rekit-border);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  letter-spacing: -0.01em;
}
.tab--active {
  background: var(--rekit-ink);
  color: #fff;
  border-color: var(--rekit-ink);
}
.tab__count {
  font-family: var(--rekit-font-mono);
  font-size: 11.5px;
  opacity: 0.85;
}

/* list */
.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.card {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  overflow: hidden;
}
.card__head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px 0;
}
.card__id {
  font-family: var(--rekit-font-mono);
  font-size: 11.5px;
  color: var(--rekit-ink-muted);
  font-weight: 600;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card__date {
  font-size: 11.5px;
  color: var(--rekit-ink-subtle);
  font-family: var(--rekit-font-mono);
}
.card__body {
  display: block;
  padding: 12px 18px;
  text-decoration: none;
  color: inherit;
}
.card__body:hover {
  background: var(--rekit-surface-muted);
}
.card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.card__title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.015em;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card__chev {
  color: var(--rekit-ink-subtle);
  flex-shrink: 0;
}
.card__meta {
  margin-top: 4px;
  font-size: 12px;
  color: var(--rekit-ink-muted);
  display: flex;
  gap: 6px;
}
.card__sep {
  color: var(--rekit-border-strong);
}
.card__foot {
  border-top: 1px solid var(--rekit-border);
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.card__total {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.card__total-l {
  font-size: 12px;
  color: var(--rekit-ink-muted);
}
.card__total-v {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.card__actions {
  display: flex;
  gap: 6px;
}

/* empty */
.empty {
  text-align: center;
  padding: 64px 20px;
}
.empty__icon {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  background: var(--rekit-surface-muted);
  color: var(--rekit-ink-subtle);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.empty__t {
  margin: 16px 0 0;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.empty__b {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--rekit-ink-muted);
}
.empty__btn {
  margin-top: 20px;
  display: inline-block;
  padding: 12px 22px;
  background: var(--rekit-ink);
  color: #fff;
  border-radius: 12px;
  font-weight: 700;
  text-decoration: none;
  font-size: 13.5px;
}

/* guest */
.guest {
  max-width: 380px;
  margin: 80px auto;
  text-align: center;
  padding: 0 20px;
}
.guest__icon {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  background: var(--rekit-accent-soft);
  color: var(--rekit-accent-deep);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}
.guest__t {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.025em;
}
.guest__b {
  margin: 8px 0 24px;
  color: var(--rekit-ink-muted);
  font-size: 13.5px;
}
.guest__btn {
  display: inline-block;
  padding: 14px 28px;
  background: var(--rekit-accent);
  color: #fff;
  border-radius: 12px;
  font-weight: 700;
  text-decoration: none;
}
</style>
