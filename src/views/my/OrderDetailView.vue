<script setup lang="ts">
import { computed, onBeforeMount } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { won } from '@/design/tokens'
import IconBase from '@/components/ds/IconBase.vue'
import Badge from '@/components/ds/Badge.vue'
import Button from '@/components/ds/Button.vue'
import DepositInfoCard from '@/components/checkout/DepositInfoCard.vue'
import { useOrderStore, type OrderStatus } from '@/stores/orders'
import { isAwaitingDeposit, statusTone } from '@/stores/orders-helpers'

const route = useRoute()
const router = useRouter()
const orders = useOrderStore()

const orderId = computed(() => route.params.id as string)
const order = computed(() => orders.findById(orderId.value))

onBeforeMount(() => {
  if (!order.value) router.replace('/my/orders')
})

const STATUS_FLOW: OrderStatus[] = ['입금대기', '결제완료', '준비중', '배송중', '배송완료']
const currentStepIdx = computed(() => {
  if (!order.value) return -1
  // 결제확인요청 is collapsed into the 입금대기 step from the buyer's perspective
  if (order.value.status === '결제확인요청') return 0
  return STATUS_FLOW.indexOf(order.value.status)
})

const awaitingDeposit = computed(() => !!order.value && isAwaitingDeposit(order.value.status))

function markPaid() {
  if (order.value) orders.markPaymentRequested(order.value.id)
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<template>
  <div v-if="order" class="page">
    <!-- Header -->
    <header class="head">
      <RouterLink to="/my/orders" class="head__back">
        <IconBase name="chevronLeft" :size="18" /> 주문 내역
      </RouterLink>
      <div class="head__id">{{ order.id }}</div>
    </header>

    <!-- Status -->
    <section class="status">
      <div class="status__top">
        <Badge :tone="statusTone(order.status)" size="md" :style="{ fontWeight: '700' }">
          {{ order.status }}
        </Badge>
        <div class="status__when">{{ formatDate(order.createdAt) }}</div>
      </div>
      <div class="status__eta">
        <IconBase name="truck" :size="16" />
        <span>{{ order.estimatedDelivery }} 도착 예정</span>
      </div>

      <!-- Step bar (skip if cancelled) -->
      <div v-if="order.status !== '취소'" class="steps">
        <template v-for="(s, i) in STATUS_FLOW" :key="s">
          <div
            class="step"
            :class="{
              'step--current': i === currentStepIdx,
              'step--done': i < currentStepIdx,
            }"
          >
            <div class="step__dot">
              <IconBase v-if="i < currentStepIdx" name="check" :size="12" :stroke="2.6" />
            </div>
            <span class="step__label">{{ s }}</span>
          </div>
          <div
            v-if="i < STATUS_FLOW.length - 1"
            class="step__line"
            :class="{ 'step__line--filled': i < currentStepIdx }"
          />
        </template>
      </div>
    </section>

    <!-- Deposit info (입금대기 / 결제확인요청) -->
    <template v-if="awaitingDeposit">
      <DepositInfoCard :amount="order.total" :order-id="order.id" />
      <div v-if="order.status === '입금대기'" class="paid-cta">
        <Button variant="accent" size="lg" full @click="markPaid">
          입금 완료했어요
        </Button>
      </div>
      <div v-else class="requested">
        <IconBase name="check" :size="16" />
        <span>입금 확인 요청이 접수됐어요. 운영자가 곧 확인합니다.</span>
      </div>
    </template>

    <!-- Items -->
    <section class="block">
      <h2 class="block__title">주문 상품 <span class="block__count">{{ order.items.length }}건</span></h2>
      <ul class="items">
        <li v-for="i in order.items" :key="i.productId" class="item">
          <div class="item__head">
            <RouterLink :to="`/products/${i.productId}`" class="item__brand">{{ i.brand }}</RouterLink>
            <RouterLink :to="`/products/${i.productId}`" class="item__more">
              상품 보기 <IconBase name="chevronRight" :size="12" />
            </RouterLink>
          </div>
          <RouterLink :to="`/products/${i.productId}`" class="item__title">{{ i.title }}</RouterLink>
          <div class="item__foot">
            <span>수량 {{ i.qty }}개</span>
            <span class="item__price">{{ won(i.price * i.qty) }}</span>
          </div>
        </li>
      </ul>
    </section>

    <!-- Address -->
    <section class="block">
      <h2 class="block__title">배송지</h2>
      <div class="addr">
        <div class="addr__name">{{ order.address.recipient }}</div>
        <div class="addr__line">{{ order.address.phone }}</div>
        <div class="addr__line">
          ({{ order.address.zipcode }}) {{ order.address.address }} {{ order.address.addressDetail }}
        </div>
        <div v-if="order.address.memo" class="addr__memo">메모 · {{ order.address.memo }}</div>
      </div>
    </section>

    <!-- Payment -->
    <section class="block">
      <h2 class="block__title">결제 정보</h2>
      <dl class="pay">
        <div class="pay__row">
          <dt>결제 수단</dt>
          <dd>{{ order.paymentMethodLabel }}</dd>
        </div>
        <div class="pay__row">
          <dt>상품 금액</dt>
          <dd>{{ won(order.itemsTotal) }}</dd>
        </div>
        <div class="pay__row">
          <dt>배송비 ({{ order.deliveryMethod === 'direct' ? '직접배송' : '화물택배' }})</dt>
          <dd>+ {{ won(order.shippingFee) }}</dd>
        </div>
        <div class="pay__total">
          <span>최종 결제 금액</span>
          <span>{{ won(order.total) }}</span>
        </div>
      </dl>
    </section>

    <!-- Actions -->
    <div class="cta">
      <Button variant="secondary" size="lg" :style="{ flex: '1' }">배송조회</Button>
      <Button
        variant="secondary"
        size="lg"
        :style="{ flex: '1', color: 'var(--rekit-danger)', borderColor: 'var(--rekit-border)' }"
      >
        환불 신청
      </Button>
    </div>
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

.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.head__back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--rekit-ink-muted);
  text-decoration: none;
}
.head__back:hover {
  color: var(--rekit-ink);
}
.head__id {
  font-family: var(--rekit-font-mono);
  font-size: 12px;
  color: var(--rekit-ink-subtle);
}

/* status */
.status {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  padding: 18px 20px;
  margin-bottom: 12px;
}
.status__top {
  display: flex;
  align-items: center;
  gap: 10px;
}
.status__when {
  font-size: 12px;
  color: var(--rekit-ink-subtle);
  margin-left: auto;
  font-family: var(--rekit-font-mono);
}
.status__eta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 12px 14px;
  background: var(--rekit-accent-soft);
  color: var(--rekit-accent-ink);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
}
.status__eta svg {
  color: var(--rekit-accent-deep);
}

.steps {
  margin-top: 18px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.step__dot {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: var(--rekit-surface-muted);
  color: var(--rekit-ink-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
}
.step--current .step__dot {
  background: var(--rekit-ink);
  color: #fff;
}
.step--done .step__dot {
  background: var(--rekit-accent);
  color: #fff;
}
.step__label {
  font-size: 11px;
  font-weight: 600;
  color: var(--rekit-ink-subtle);
  white-space: nowrap;
}
.step--current .step__label {
  color: var(--rekit-ink);
  font-weight: 700;
}
.step__line {
  flex: 1;
  height: 1px;
  background: var(--rekit-border);
  margin: 0 -2px;
  transform: translateY(-9px);
}
.step__line--filled {
  background: var(--rekit-accent);
}

/* shared block */
.block {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  padding: 18px 20px;
  margin-bottom: 12px;
}
.block__title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.block__count {
  margin-left: 4px;
  font-size: 11.5px;
  color: var(--rekit-ink-subtle);
  font-family: var(--rekit-font-mono);
  font-weight: 600;
}

/* items */
.items {
  list-style: none;
  padding: 0;
  margin: 0;
}
.item {
  padding: 12px 0;
  border-bottom: 1px solid var(--rekit-border);
}
.item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.item:first-child {
  padding-top: 0;
}
.item__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.item__brand {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--rekit-ink-subtle);
  text-decoration: none;
}
.item__more {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--rekit-ink-subtle);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
.item__more:hover {
  color: var(--rekit-ink);
}
.item__title {
  display: block;
  margin-top: 4px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--rekit-ink);
  text-decoration: none;
  letter-spacing: -0.015em;
}
.item__foot {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--rekit-ink-muted);
}
.item__price {
  font-weight: 800;
  color: var(--rekit-ink);
  font-size: 14px;
  letter-spacing: -0.02em;
}

/* address */
.addr__name {
  font-size: 14px;
  font-weight: 700;
}
.addr__line {
  margin-top: 4px;
  font-size: 13px;
  color: var(--rekit-ink-muted);
  line-height: 1.55;
}
.addr__memo {
  margin-top: 8px;
  font-size: 11.5px;
  color: var(--rekit-ink-subtle);
  background: var(--rekit-surface-muted);
  padding: 8px 12px;
  border-radius: 8px;
}

/* payment */
.pay {
  margin: 0;
}
.pay__row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
}
.pay__row dt {
  margin: 0;
  color: var(--rekit-ink-muted);
}
.pay__row dd {
  margin: 0;
  font-weight: 600;
}
.pay__total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-top: 12px;
  margin-top: 8px;
  border-top: 1px solid var(--rekit-border);
}
.pay__total span:first-child {
  font-size: 13.5px;
  font-weight: 700;
}
.pay__total span:last-child {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.025em;
}

/* actions */
.cta {
  margin-top: 16px;
  display: flex;
  gap: 8px;
}

.paid-cta {
  margin-bottom: 12px;
}
.requested {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--rekit-accent-soft);
  border: 1px solid #cce4d6;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--rekit-accent-ink);
  margin-bottom: 12px;
}
.requested svg { color: var(--rekit-accent-deep); }
</style>
