<script setup lang="ts">
import { computed, onBeforeMount } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { won } from '@/design/tokens'
import IconBase from '@/components/ds/IconBase.vue'
import Button from '@/components/ds/Button.vue'
import DepositInfoCard from '@/components/checkout/DepositInfoCard.vue'
import { useOrderStore } from '@/stores/orders'

const route = useRoute()
const router = useRouter()
const orders = useOrderStore()

const orderId = computed(() => {
  const v = route.query.order
  return typeof v === 'string' ? v : ''
})

const order = computed(() => (orderId.value ? orders.findById(orderId.value) : undefined))

onBeforeMount(() => {
  if (!order.value) {
    router.replace('/')
  }
})

const isPending = computed(() => order.value?.status === '입금대기')
const isRequested = computed(() => order.value?.status === '결제확인요청')
const isApproved = computed(() => {
  const s = order.value?.status
  return s === '결제완료' || s === '준비중' || s === '배송중' || s === '배송완료'
})

const deliveryLabel = computed(() => (order.value?.deliveryMethod === 'direct' ? '직접 배송' : '화물택배'))
const deliveryNote = computed(() =>
  order.value?.deliveryMethod === 'direct'
    ? '도착 1시간 전 연락드려요'
    : '화물 도착 안내는 SMS로 발송돼요',
)

function markPaid() {
  if (order.value) orders.markPaymentRequested(order.value.id)
}
</script>

<template>
  <div v-if="order" class="page">
    <div class="page__head">
      <RouterLink to="/" class="close" aria-label="홈으로">
        <IconBase name="close" :size="22" />
      </RouterLink>
    </div>

    <main class="hero" :class="{ 'hero--pending': !isApproved }">
      <div class="hero__check">
        <IconBase :name="isApproved ? 'check' : 'wallet'" :size="36" :stroke="2.6" />
      </div>
      <div class="hero__kicker">
        {{ isApproved ? '결제가 확인됐어요' : isRequested ? '입금 확인 요청 접수됨' : '주문이 접수됐어요' }}
      </div>
      <h1 class="hero__title">
        <template v-if="isApproved">새 주인을 만난 가전,<br />곧 도착할게요</template>
        <template v-else-if="isRequested">운영자가 곧 확인합니다<br />잠시만 기다려 주세요</template>
        <template v-else>입금 후 배송이 시작됩니다</template>
      </h1>
      <div class="hero__order">
        주문번호 <b class="hero__id">{{ order.id }}</b>
      </div>
    </main>

    <!-- 입금 안내 카드 (입금 전) -->
    <DepositInfoCard
      v-if="isPending"
      :amount="order.total"
      :order-id="order.id"
    />

    <!-- 입금 완료 클릭 후 안내 -->
    <section v-else-if="isRequested" class="requested">
      <div class="requested__head">
        <IconBase name="check" :size="18" />
        <span>입금 확인 요청이 접수됐어요</span>
      </div>
      <p class="requested__b">
        운영자가 영업일 9~18시 기준 평균 2시간 내로 확인합니다.
        승인이 완료되면 카톡/SMS로 알려드릴게요.
      </p>
    </section>

    <!-- 결제 정보 (요약) -->
    <section class="card">
      <div class="card__label">결제 정보</div>
      <div class="card__total">
        <span>총 결제 금액</span>
        <span class="card__total-v">{{ won(order.total) }}</span>
      </div>
      <div class="card__sub">
        <span>{{ order.paymentMethodLabel }}</span>
        <span>{{ order.status }}</span>
      </div>

      <template v-if="isApproved">
        <div class="card__divider" />
        <div class="card__label">배송 일정</div>
        <div class="sched">
          <div class="sched__icon">
            <IconBase name="truck" :size="20" />
          </div>
          <div>
            <div class="sched__t">{{ order.estimatedDelivery }}</div>
            <div class="sched__b">{{ deliveryLabel }} · {{ deliveryNote }}</div>
          </div>
        </div>
      </template>
    </section>

    <section class="card card--items">
      <div class="card__label">주문 상품 <span class="card__count">{{ order.items.length }}건</span></div>
      <ul class="items">
        <li v-for="i in order.items" :key="i.productId" class="item">
          <div class="item__brand">{{ i.brand }}</div>
          <div class="item__title">{{ i.title }}</div>
          <div class="item__foot">
            <span>수량 {{ i.qty }}개</span>
            <span class="item__price">{{ won(i.price * i.qty) }}</span>
          </div>
        </li>
      </ul>
    </section>

    <section class="card card--addr">
      <div class="card__label">배송지</div>
      <div class="addr">
        <div class="addr__name">{{ order.address.recipient }} · {{ order.address.phone }}</div>
        <div class="addr__line">
          ({{ order.address.zipcode }}) {{ order.address.address }}
          {{ order.address.addressDetail }}
        </div>
        <div v-if="order.address.memo" class="addr__memo">메모 · {{ order.address.memo }}</div>
      </div>
    </section>

    <!-- 입금 완료 했어요 버튼 (입금대기 상태에만) -->
    <div v-if="isPending" class="paid-cta">
      <Button variant="accent" size="lg" full @click="markPaid">
        입금 완료했어요
      </Button>
      <p class="paid-cta__note">
        입금 후 이 버튼을 눌러주시면 운영자가 더 빨리 확인해요.
      </p>
    </div>

    <div class="cta">
      <RouterLink to="/" class="cta__btn cta__btn--secondary">홈으로</RouterLink>
      <RouterLink :to="`/my/orders/${order.id}`" class="cta__btn cta__btn--primary">
        주문 상세보기
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 480px;
  margin: 0 auto;
  padding: 16px 20px 40px;
}
@media (min-width: 768px) {
  .page {
    padding: 32px 24px 56px;
  }
}

.page__head {
  display: flex;
  justify-content: flex-end;
}
.close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  color: var(--rekit-ink-muted);
  text-decoration: none;
}
.close:hover {
  background: var(--rekit-surface-muted);
  color: var(--rekit-ink);
}

.hero {
  text-align: center;
  padding: 24px 0 32px;
}
.hero__check {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  background: var(--rekit-accent);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.hero--pending .hero__check {
  background: var(--rekit-ink);
}
.hero__kicker {
  margin-top: 18px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--rekit-accent-deep);
}
.hero--pending .hero__kicker {
  color: var(--rekit-ink-muted);
}
.hero__title {
  margin: 8px 0 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.35;
}
.hero__order {
  margin-top: 12px;
  font-size: 13px;
  color: var(--rekit-ink-muted);
}
.hero__id {
  color: var(--rekit-ink);
  font-weight: 700;
  font-family: var(--rekit-font-mono);
  margin-left: 4px;
}

.requested {
  background: var(--rekit-accent-soft);
  border: 1px solid #cce4d6;
  border-radius: 16px;
  padding: 16px 18px;
  margin-bottom: 12px;
}
.requested__head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--rekit-accent-ink);
}
.requested__head svg {
  color: var(--rekit-accent-deep);
}
.requested__b {
  margin: 8px 0 0;
  font-size: 12.5px;
  color: var(--rekit-accent-ink);
  line-height: 1.55;
  opacity: 0.85;
}

.card {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  padding: 18px 20px;
  margin-bottom: 12px;
}
.card__label {
  font-size: 12px;
  font-weight: 700;
  color: var(--rekit-ink-muted);
  letter-spacing: -0.01em;
}
.card__count {
  margin-left: 4px;
  font-size: 11.5px;
  color: var(--rekit-ink-subtle);
  font-family: var(--rekit-font-mono);
  font-weight: 600;
}
.card__total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: 8px;
}
.card__total span:first-child {
  font-size: 14px;
  font-weight: 700;
}
.card__total-v {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.025em;
}
.card__sub {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 12.5px;
  color: var(--rekit-ink-muted);
}
.card__divider {
  border-top: 1px solid var(--rekit-border);
  margin: 14px 0 12px;
}

.sched {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}
.sched__icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: var(--rekit-accent-soft);
  color: var(--rekit-accent-deep);
  display: flex;
  align-items: center;
  justify-content: center;
}
.sched__t {
  font-size: 13.5px;
  font-weight: 700;
}
.sched__b {
  margin-top: 2px;
  font-size: 11.5px;
  color: var(--rekit-ink-subtle);
}

.items {
  list-style: none;
  padding: 0;
  margin: 12px 0 0;
}
.item {
  padding: 12px 0;
  border-bottom: 1px solid var(--rekit-border);
}
.item:last-child {
  border-bottom: none;
}
.item__brand {
  font-size: 11px;
  color: var(--rekit-ink-subtle);
  font-weight: 600;
}
.item__title {
  margin-top: 2px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.015em;
}
.item__foot {
  margin-top: 6px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--rekit-ink-muted);
}
.item__price {
  font-weight: 700;
  color: var(--rekit-ink);
}

.addr {
  margin-top: 8px;
}
.addr__name {
  font-size: 13.5px;
  font-weight: 700;
}
.addr__line {
  margin-top: 4px;
  font-size: 12.5px;
  color: var(--rekit-ink-muted);
  line-height: 1.55;
}
.addr__memo {
  margin-top: 6px;
  font-size: 11.5px;
  color: var(--rekit-ink-subtle);
}

.paid-cta {
  margin-top: 16px;
}
.paid-cta__note {
  margin: 8px 4px 0;
  font-size: 11.5px;
  color: var(--rekit-ink-subtle);
  text-align: center;
}

.cta {
  margin-top: 16px;
  display: flex;
  gap: 8px;
}
.cta__btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 52px;
  border-radius: 12px;
  font-size: 14.5px;
  font-weight: 700;
  text-decoration: none;
  letter-spacing: -0.015em;
}
.cta__btn--secondary {
  background: var(--rekit-surface);
  color: var(--rekit-ink);
  border: 1px solid var(--rekit-border);
}
.cta__btn--primary {
  background: var(--rekit-ink);
  color: #fff;
  flex: 1.3;
}
</style>
