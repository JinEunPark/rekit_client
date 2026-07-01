<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { won } from '@/design/tokens'
import IconBase from '@/components/ds/IconBase.vue'
import Badge from '@/components/ds/Badge.vue'
import Button from '@/components/ds/Button.vue'
import ProductTile from '@/components/ds/ProductTile.vue'
import CheckoutSteps from '@/components/checkout/CheckoutSteps.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useProductStore } from '@/stores/products'
import type { Product } from '@/data/products'
import { useOrderStore } from '@/stores/orders'
import type { ShipmentMethod } from '@/api/orders'
import { toNumId } from '@/stores/utils'
import { useAddressStore } from '@/stores/addresses'
import { ApiError } from '@/api/client'

type DeliveryMethod = 'direct' | 'cargo'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()
const productStore = useProductStore()
const orders = useOrderStore()
const addresses = useAddressStore()

interface Snapshot {
  productId: string
  qty: number
  product: Product
}

const snapshot = ref<Snapshot[]>([])
const snapshotLoading = ref(false)

onBeforeMount(() => {
  if (!auth.user) {
    router.replace(`/auth/sign-in?redirect=${encodeURIComponent('/checkout/order')}`)
    return
  }
  if (!auth.user.verified) {
    router.replace('/checkout/identity')
    return
  }
  const selected = cart.items.filter((i) => i.selected)
  if (selected.length === 0) {
    router.replace('/cart')
    return
  }
  snapshotLoading.value = true
  void (async () => {
    try {
      const productMap = await productStore.fetchByIds(selected.map((i) => i.productId))
      snapshot.value = selected.flatMap((i) =>
        productMap[i.productId] ? [{ productId: i.productId, qty: i.qty, product: productMap[i.productId]! }] : []
      )
    } finally {
      snapshotLoading.value = false
    }
  })()
})

/* ────────────── Address ────────────── */

const selectedAddrId = ref<string | null>(addresses.defaultAddress?.id ?? null)
const selectedAddr = computed(() =>
  selectedAddrId.value
    ? (addresses.addresses.find((a) => a.id === selectedAddrId.value) ?? null)
    : null,
)

/* ────────────── Delivery ────────────── */

const deliveryMethod = ref<DeliveryMethod>('direct')
const deliveryOptions: { key: DeliveryMethod; t: string; s: string; fee: number }[] = [
  { key: 'direct', t: '직접 배송', s: '서울/경기 · 시간 협의 · 1~2일', fee: 40_000 },
  { key: 'cargo', t: '화물택배', s: '대형 가전 · 2~4일', fee: 60_000 },
]
const shippingFee = computed(
  () => deliveryOptions.find((o) => o.key === deliveryMethod.value)?.fee ?? 0,
)

/* ────────────── Payment ────────────── */

// 계좌이체(무통장입금) only — fixed company account, deposit-name matching by orderId.
const paymentLabel = '계좌이체 (무통장입금)'

/* ────────────── Totals ────────────── */

const itemsTotal = computed(() =>
  snapshot.value.reduce((sum, s) => sum + (s.product?.price ?? 0) * s.qty, 0),
)
const finalTotal = computed(() => itemsTotal.value + shippingFee.value)

/* ────────────── Validation ────────────── */

const formValid = computed(() => !!selectedAddrId.value && toNumId(selectedAddrId.value) !== null)

/* ────────────── Submit ────────────── */

const paying = ref(false)
const payError = ref('')

async function pay() {
  if (!formValid.value) {
    payError.value = '배송지를 선택해 주세요.'
    return
  }

  paying.value = true
  payError.value = ''

  try {
    const addressId = toNumId(selectedAddrId.value!)!

    const shippingMethod: ShipmentMethod =
      deliveryMethod.value === 'direct' ? 'DIRECT'
      : deliveryMethod.value === 'cargo' ? 'FREIGHT'
      : 'PARCEL'

    const order = await orders.create({
      items: snapshot.value.map((s) => ({
        product_id: parseInt(s.productId, 10),
        quantity: s.qty,
      })),
      address_id: addressId,
      shipping_method: shippingMethod,
      memo: selectedAddr.value?.memo || null,
    })

    snapshot.value.forEach((s) => cart.remove(s.productId))
    router.replace(`/checkout/complete?order=${order.orderNumber}`)
  } catch (err) {
    console.error('[pay]', err)
    if (err instanceof ApiError) {
      payError.value = err.message || `오류가 발생했어요. (${err.status})`
    } else if (err instanceof Error) {
      payError.value = err.message
    } else {
      payError.value = '주문 처리 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.'
    }
  } finally {
    paying.value = false
  }
}
</script>

<template>
  <div v-if="snapshotLoading" class="loading">상품 정보를 불러오는 중…</div>
  <div v-else-if="snapshot.length > 0" class="page">
    <CheckoutSteps :current="2" />

    <!-- Verified badge -->
    <div class="verified">
      <IconBase name="shield" :size="16" />
      <span>본인인증 완료 · {{ auth.user?.username ?? '회원' }}</span>
    </div>

    <form class="form" novalidate @submit.prevent="pay">
      <!-- Address -->
      <section class="block">
        <div class="block__head">
          <h2 class="block__title">배송지</h2>
          <RouterLink to="/my/addresses" class="block__manage">배송지 관리</RouterLink>
        </div>

        <!-- No saved addresses -->
        <div v-if="addresses.addresses.length === 0" class="addr-empty">
          <IconBase name="map" :size="20" />
          <p>저장된 배송지가 없어요.</p>
          <RouterLink to="/my/addresses" class="addr-empty__link">배송지 추가하기 →</RouterLink>
        </div>

        <!-- Address chips -->
        <div v-else class="addr-picker">
          <button
            v-for="a in addresses.addresses"
            :key="a.id"
            type="button"
            class="addr-chip"
            :class="{ 'addr-chip--on': selectedAddrId === a.id }"
            @click="selectedAddrId = a.id"
          >
            <span class="addr-chip__top">
              <span class="addr-chip__label">{{ a.label }}</span>
              <span v-if="a.isDefault" class="addr-chip__default">기본</span>
            </span>
            <span class="addr-chip__name">{{ a.recipient }}</span>
            <span class="addr-chip__addr">{{ a.address }}</span>
          </button>
        </div>

        <!-- Selected address card -->
        <div v-if="selectedAddr" class="addr-card">
          <div class="addr-card__row">
            <span class="addr-card__key">받는사람</span>
            <span class="addr-card__val">{{ selectedAddr.recipient }}</span>
          </div>
          <div class="addr-card__row">
            <span class="addr-card__key">전화번호</span>
            <span class="addr-card__val">{{ selectedAddr.phone }}</span>
          </div>
          <div class="addr-card__row">
            <span class="addr-card__key">주소지</span>
            <span class="addr-card__val">{{ selectedAddr.address }}{{ selectedAddr.addressDetail ? ' ' + selectedAddr.addressDetail : '' }}</span>
          </div>
          <div v-if="selectedAddr.memo" class="addr-card__row">
            <span class="addr-card__key">메모</span>
            <span class="addr-card__val">{{ selectedAddr.memo }}</span>
          </div>
        </div>
      </section>

      <!-- Items snapshot -->
      <section class="block">
        <h2 class="block__title">주문 상품 <span class="block__count">{{ snapshot.length }}건</span></h2>
        <ul class="items">
          <li v-for="s in snapshot" :key="s.productId" class="item">
            <div class="item__thumb">
              <ProductTile
                :kind="s.product!.kind"
                :tone="s.product!.tone"
                ratio="1/1"
                radius="10px"
                :show-label="false"
              />
            </div>
            <div class="item__body">
              <div class="item__brand">{{ s.product!.brand }}</div>
              <div class="item__title">{{ s.product!.title }}</div>
              <div class="item__foot">
                <span class="item__qty">수량 {{ s.qty }}개</span>
                <span class="item__price">{{ won(s.product!.price * s.qty) }}</span>
              </div>
            </div>
          </li>
        </ul>
      </section>

      <!-- Delivery method -->
      <section class="block">
        <h2 class="block__title">배송 방식</h2>
        <div class="opts">
          <label
            v-for="o in deliveryOptions"
            :key="o.key"
            class="opt"
            :class="{ 'opt--on': deliveryMethod === o.key }"
          >
            <input v-model="deliveryMethod" type="radio" :value="o.key" />
            <span class="opt__radio">
              <span v-if="deliveryMethod === o.key" class="opt__dot" />
            </span>
            <div class="opt__body">
              <div class="opt__t">{{ o.t }}</div>
              <div class="opt__s">{{ o.s }}</div>
            </div>
            <div class="opt__fee">{{ won(o.fee) }}</div>
          </label>
        </div>
      </section>

      <!-- Payment method (계좌이체 only) -->
      <section class="block">
        <h2 class="block__title">결제 방법</h2>
        <div class="pay-only">
          <div class="pay-only__head">
            <IconBase name="wallet" :size="18" />
            <span>계좌이체 (무통장입금)</span>
          </div>
          <p class="pay-only__b">
            주문하기 버튼을 누르면 다음 화면에서 입금 계좌와 입금자명을 안내드립니다.
            영업일 9~18시 기준 평균 2시간 내 입금이 확인됩니다.
          </p>
        </div>
      </section>

      <!-- Total card -->
      <section class="total">
        <div class="total__row">
          <span>상품 금액</span>
          <span>{{ won(itemsTotal) }}</span>
        </div>
        <div class="total__row">
          <span>배송비</span>
          <span>+ {{ won(shippingFee) }}</span>
        </div>
        <div class="total__final">
          <span>최종 결제</span>
          <span>{{ won(finalTotal) }}</span>
        </div>
      </section>

      <!-- Inline CTA (desktop) -->
      <div class="inline-cta">
        <p v-if="payError" class="pay-error">{{ payError }}</p>
        <Button type="submit" variant="accent" size="lg" full :disabled="paying">
          {{ paying ? '처리 중…' : won(finalTotal) + ' 주문하기' }}
        </Button>
      </div>
    </form>

    <!-- Sticky CTA (mobile) -->
    <div class="sticky-cta">
      <p v-if="payError" class="pay-error">{{ payError }}</p>
      <Button variant="accent" size="lg" full :disabled="paying" @click="pay">
        {{ paying ? '처리 중…' : won(finalTotal) + ' 결제하기' }}
      </Button>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 720px;
  margin: 0 auto;
  padding: 16px 16px 120px;
}
@media (min-width: 768px) {
  .page {
    padding: 32px 24px 56px;
  }
}

.verified {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--rekit-accent-soft);
  color: var(--rekit-accent-ink);
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 600;
  margin: 16px 0 24px;
}
.verified svg {
  color: var(--rekit-accent-deep);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.block__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.block__title {
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.block__head .block__title {
  margin-bottom: 0;
}
.block__manage {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--rekit-ink-muted);
  text-decoration: none;
}
.block__manage:hover {
  color: var(--rekit-ink);
}
.block__count {
  margin-left: 6px;
  font-size: 12px;
  color: var(--rekit-ink-subtle);
  font-weight: 600;
  font-family: var(--rekit-font-mono);
}

/* address: no addresses */
.addr-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 28px 0;
  color: var(--rekit-ink-subtle);
  font-size: 13.5px;
}
.addr-empty p { margin: 0; }
.addr-empty__link {
  margin-top: 4px;
  font-size: 13px;
  font-weight: 700;
  color: var(--rekit-ink);
  text-decoration: none;
}
.addr-empty__link:hover { text-decoration: underline; }

/* address chips */
.addr-picker {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 0 0 4px;
  margin: 0 -16px 16px;
  padding-left: 16px;
  padding-right: 16px;
}
.addr-picker::-webkit-scrollbar { display: none; }
.addr-chip {
  flex: 0 0 156px;
  width: 156px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  padding: 12px 14px;
  background: var(--rekit-surface);
  border: 1.5px solid var(--rekit-border);
  border-radius: 14px;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
  overflow: hidden;
}
.addr-chip:hover {
  border-color: var(--rekit-ink-muted);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.addr-chip--on {
  border-color: var(--rekit-ink);
  background: var(--rekit-ink);
}
.addr-chip__top {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
}
.addr-chip__label {
  font-size: 11px;
  font-weight: 700;
  color: var(--rekit-ink-muted);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.addr-chip--on .addr-chip__label {
  color: rgba(255,255,255,0.6);
}
.addr-chip__default {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 700;
  color: var(--rekit-accent-deep);
  background: var(--rekit-accent-soft);
  padding: 1px 5px;
  border-radius: 5px;
}
.addr-chip--on .addr-chip__default {
  color: var(--rekit-ink);
  background: rgba(255,255,255,0.85);
}
.addr-chip__name {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--rekit-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
.addr-chip--on .addr-chip__name {
  color: #fff;
}
.addr-chip__addr {
  font-size: 11px;
  color: var(--rekit-ink-subtle);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
.addr-chip--on .addr-chip__addr {
  color: rgba(255,255,255,0.55);
}

/* selected address card */
.addr-card {
  padding: 16px 18px;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.addr-card__row {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 8px;
  align-items: baseline;
}
.addr-card__key {
  font-size: 12px;
  font-weight: 600;
  color: var(--rekit-ink-muted);
  white-space: nowrap;
}
.addr-card__val {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--rekit-ink);
  line-height: 1.5;
}

/* items */
.items {
  list-style: none;
  padding: 0;
  margin: 0;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 14px;
  overflow: hidden;
}
.item {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 12px;
  padding: 14px;
  border-bottom: 1px solid var(--rekit-border);
}
.item:last-child {
  border-bottom: none;
}
.item__thumb {
  width: 64px;
}
.item__body {
  min-width: 0;
}
.item__brand {
  font-size: 11px;
  font-weight: 600;
  color: var(--rekit-ink-subtle);
}
.item__title {
  margin-top: 2px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.015em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.item__foot {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.item__qty {
  font-size: 11.5px;
  color: var(--rekit-ink-subtle);
}
.item__price {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

/* radio cards */
.opts {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.opt {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 14px;
  cursor: pointer;
  transition: border-color 0.12s, box-shadow 0.12s;
}
.opt--on {
  border-color: var(--rekit-ink);
  border-width: 2px;
  padding: 13px;
}
.opt input[type='radio'] {
  display: none;
}
.opt__radio {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 2px solid var(--rekit-border-strong);
  display: flex;
  align-items: center;
  justify-content: center;
}
.opt--on .opt__radio {
  border-color: var(--rekit-ink);
}
.opt__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--rekit-ink);
}
.opt__t {
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: -0.015em;
}
.opt__s {
  margin-top: 2px;
  font-size: 11.5px;
  color: var(--rekit-ink-subtle);
}
.opt__fee {
  font-size: 13px;
  font-weight: 700;
}

/* payment (계좌이체 only) */
.pay-only {
  background: var(--rekit-accent-soft);
  border: 1px solid #cce4d6;
  border-radius: 12px;
  padding: 14px 16px;
}
.pay-only__head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--rekit-accent-ink);
}
.pay-only__head svg { color: var(--rekit-accent-deep); }
.pay-only__b {
  margin: 8px 0 0;
  font-size: 12.5px;
  color: var(--rekit-accent-ink);
  line-height: 1.55;
  opacity: 0.85;
}

/* total card (dark) */
.total {
  background: var(--rekit-ink);
  color: #fff;
  border-radius: 16px;
  padding: 18px 20px;
}
.total__row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 12.5px;
  opacity: 0.78;
}
.total__final {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-top: 12px;
  margin-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}
.total__final span:first-child {
  font-size: 13.5px;
  font-weight: 600;
}
.total__final span:last-child {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.025em;
}

/* CTAs */
.inline-cta {
  display: none;
}
@media (min-width: 768px) {
  .inline-cta {
    display: block;
  }
}

.pay-error {
  margin: 0 0 8px;
  font-size: 12.5px;
  color: var(--rekit-danger);
  text-align: center;
}
.sticky-cta {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 30;
  padding: 12px 16px max(12px, env(safe-area-inset-bottom));
  background: var(--rekit-surface);
  border-top: 1px solid var(--rekit-border);
}
@media (min-width: 768px) {
  .sticky-cta {
    display: none;
  }
}

.loading {
  padding: 80px 20px;
  text-align: center;
  font-size: 14px;
  color: var(--rekit-ink-muted);
}
</style>
