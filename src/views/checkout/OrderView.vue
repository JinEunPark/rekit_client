<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { won } from '@/design/tokens'
import IconBase from '@/components/ds/IconBase.vue'
import Badge from '@/components/ds/Badge.vue'
import Button from '@/components/ds/Button.vue'
import ProductTile from '@/components/ds/ProductTile.vue'
import CheckoutSteps from '@/components/checkout/CheckoutSteps.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useProductStore } from '@/stores/products'
import {
  useOrderStore,
  type DeliveryMethod,
  type OrderAddress,
  type OrderLineItem,
} from '@/stores/orders'
import { useAddressStore } from '@/stores/addresses'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()
const productStore = useProductStore()
const orders = useOrderStore()
const addresses = useAddressStore()

interface Snapshot {
  productId: string
  qty: number
  product: ReturnType<typeof productStore.findById>
}

const snapshot = ref<Snapshot[]>([])

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
  // Snapshot the selected items so cart edits during checkout don't change the order
  snapshot.value = selected
    .map((i) => ({
      productId: i.productId,
      qty: i.qty,
      product: productStore.findById(i.productId),
    }))
    .filter((s) => s.product)
})

/* ────────────── Address ────────────── */

const saved = addresses.defaultAddress
const address = ref<OrderAddress>({
  recipient: saved?.recipient ?? auth.user?.username ?? '',
  phone: saved?.phone ?? auth.user?.phone ?? '',
  zipcode: saved?.zipcode ?? '',
  address: saved?.address ?? '',
  addressDetail: saved?.addressDetail ?? '',
  memo: saved?.memo ?? '',
})

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

const submitted = ref(false)
const phoneValid = computed(() => /^\d{2,3}-?\d{3,4}-?\d{4}$/.test(address.value.phone.trim()))
const errors = computed(() => ({
  recipient: submitted.value && !address.value.recipient.trim(),
  phone: submitted.value && !phoneValid.value,
  zipcode: submitted.value && !address.value.zipcode.trim(),
  address: submitted.value && !address.value.address.trim(),
}))

const formValid = computed(
  () =>
    address.value.recipient.trim() &&
    phoneValid.value &&
    address.value.zipcode.trim() &&
    address.value.address.trim(),
)

/* ────────────── Submit ────────────── */

function pay() {
  submitted.value = true
  if (!formValid.value) {
    document.querySelector<HTMLElement>('.form input[aria-invalid="true"]')?.focus()
    return
  }

  const lineItems: OrderLineItem[] = snapshot.value.map((s) => ({
    productId: s.productId,
    qty: s.qty,
    price: s.product!.price,
    title: s.product!.title,
    brand: s.product!.brand,
  }))

  const order = orders.create({
    items: lineItems,
    itemsTotal: itemsTotal.value,
    shippingFee: shippingFee.value,
    total: finalTotal.value,
    deliveryMethod: deliveryMethod.value,
    paymentMethod: 'bank',
    paymentMethodLabel: paymentLabel,
    address: { ...address.value },
  })

  // remember address for next time — update existing default or create new
  if (addresses.defaultAddress) {
    addresses.update(addresses.defaultAddress.id, address.value)
  } else {
    addresses.add({ ...address.value, label: '기본 배송지', isDefault: true })
  }

  // remove ordered lines from cart
  snapshot.value.forEach((s) => cart.remove(s.productId))

  router.replace(`/checkout/complete?order=${order.id}`)
}
</script>

<template>
  <div v-if="snapshot.length > 0" class="page">
    <CheckoutSteps :current="2" />

    <!-- Verified badge -->
    <div class="verified">
      <IconBase name="shield" :size="16" />
      <span>본인인증 완료 · {{ auth.user?.username ?? '회원' }}</span>
    </div>

    <form class="form" novalidate @submit.prevent="pay">
      <!-- Address -->
      <section class="block">
        <h2 class="block__title">배송지</h2>
        <div class="address">
          <div class="row row--2">
            <label class="field" :class="{ 'field--err': errors.recipient }">
              <span class="field__label">받는 사람</span>
              <input
                v-model="address.recipient"
                type="text"
                placeholder="이름"
                :aria-invalid="errors.recipient"
              />
            </label>
            <label class="field" :class="{ 'field--err': errors.phone }">
              <span class="field__label">휴대폰</span>
              <input
                v-model="address.phone"
                type="tel"
                inputmode="numeric"
                autocomplete="tel"
                placeholder="010-1234-5678"
                :aria-invalid="errors.phone"
              />
            </label>
          </div>
          <div class="row row--zip">
            <label class="field field--zip" :class="{ 'field--err': errors.zipcode }">
              <span class="field__label">우편번호</span>
              <input
                v-model="address.zipcode"
                type="text"
                inputmode="numeric"
                placeholder="04101"
                :aria-invalid="errors.zipcode"
              />
            </label>
            <button type="button" class="zip-btn" disabled>주소 검색</button>
          </div>
          <label class="field" :class="{ 'field--err': errors.address }">
            <span class="field__label">주소</span>
            <input
              v-model="address.address"
              type="text"
              placeholder="도로명 주소"
              :aria-invalid="errors.address"
            />
          </label>
          <label class="field">
            <span class="field__label">상세 주소</span>
            <input
              v-model="address.addressDetail"
              type="text"
              placeholder="동·호수 등 (선택)"
            />
          </label>
          <label class="field">
            <span class="field__label">배송 메모</span>
            <input
              v-model="address.memo"
              type="text"
              placeholder="예: 부재 시 경비실에 맡겨주세요 (선택)"
            />
          </label>
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
        <Button type="submit" variant="accent" size="lg" full>
          {{ won(finalTotal) }} 주문하기
        </Button>
      </div>
    </form>

    <!-- Sticky CTA (mobile) -->
    <div class="sticky-cta">
      <Button variant="accent" size="lg" full @click="pay">
        {{ won(finalTotal) }} 결제하기
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

.block__title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.block__count {
  margin-left: 6px;
  font-size: 12px;
  color: var(--rekit-ink-subtle);
  font-weight: 600;
  font-family: var(--rekit-font-mono);
}

/* address */
.address {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.row {
  display: grid;
  gap: 10px;
}
.row--2 {
  grid-template-columns: 1fr 1fr;
}
.row--zip {
  grid-template-columns: 1fr auto;
  align-items: end;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.field__label {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--rekit-ink-muted);
}
.field input {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  color: var(--rekit-ink);
  letter-spacing: -0.01em;
  outline: none;
  transition: border-color 0.12s, box-shadow 0.12s;
}
.field input:focus {
  border-color: var(--rekit-ink);
  box-shadow: 0 0 0 3px rgba(26, 26, 23, 0.06);
}
.field input::placeholder {
  color: var(--rekit-ink-placeholder);
}
.field--err input {
  border-color: var(--rekit-danger);
}
.field--err input:focus {
  box-shadow: 0 0 0 3px rgba(210, 78, 78, 0.12);
}
.zip-btn {
  height: 48px;
  padding: 0 16px;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--rekit-ink-muted);
  cursor: not-allowed;
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
</style>
