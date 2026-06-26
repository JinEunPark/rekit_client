<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { won } from '@/design/tokens'
import IconBase from '@/components/ds/IconBase.vue'
import Button from '@/components/ds/Button.vue'
import ProductTile from '@/components/ds/ProductTile.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import type { Product } from '@/data/products'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

interface Line {
  productId: string
  qty: number
  selected: boolean
  product: Product | undefined
}

const productMap = ref<Record<string, Product>>({})

// productIds가 바뀔 때마다(로그인 동기화 포함) 상품 정보 재조회
watch(
  () => cart.items.map((i) => i.productId).join(','),
  async () => { productMap.value = await cart.loadProducts() },
  { immediate: true },
)

/** Default 직접배송 (서울/경기) — to be selectable in checkout. */
const SHIPPING_FEE = 40_000

const lines = computed<Line[]>(() =>
  cart.items.map((i) => ({
    productId: i.productId,
    qty: i.qty,
    selected: i.selected,
    product: productMap.value[i.productId],
  })),
)

const validLines = computed(() => lines.value.filter((l) => l.product))
const selectedLines = computed(() => validLines.value.filter((l) => l.selected))

const allSelected = computed(
  () => validLines.value.length > 0 && validLines.value.every((l) => l.selected),
)
const selectedCount = computed(() => selectedLines.value.length)

const itemsTotal = computed(() =>
  selectedLines.value.reduce((sum, l) => sum + (l.product?.price ?? 0) * l.qty, 0),
)
const shipping = computed(() => (selectedLines.value.length > 0 ? SHIPPING_FEE : 0))
const finalTotal = computed(() => itemsTotal.value + shipping.value)

function toggleAll() {
  cart.setAllSelected(!allSelected.value)
}

async function removeSelected() {
  if (selectedLines.value.length === 0) return
  if (!window.confirm(`선택한 ${selectedLines.value.length}건을 삭제할까요?`)) return
  await cart.removeAllSelected()
}

function dec(line: Line) {
  if (line.qty > 1) cart.setQty(line.productId, line.qty - 1)
}
function inc(line: Line) {
  const max = line.product?.stock ?? 99
  if (line.qty < max) cart.setQty(line.productId, line.qty + 1)
}

function checkout() {
  if (selectedCount.value === 0) return
  if (!auth.user) {
    const target = '/checkout/identity'
    router.push(`/auth/sign-in?redirect=${encodeURIComponent(target)}`)
    return
  }
  router.push(auth.user.verified ? '/checkout/order' : '/checkout/identity')
}
</script>

<template>
  <div class="cart">
    <header class="cart__head">
      <h1 class="cart__title">장바구니</h1>
      <span v-if="validLines.length > 0" class="cart__count">{{ validLines.length }}건</span>
    </header>

    <!-- Empty state -->
    <div v-if="validLines.length === 0" class="empty">
      <div class="empty__icon">
        <IconBase name="cart" :size="36" :stroke="1.4" />
      </div>
      <h2 class="empty__t">장바구니가 비어있어요</h2>
      <p class="empty__b">검수 완료된 가전을 담아보세요. 평균 73% 할인된 가격으로 만나볼 수 있어요.</p>
      <RouterLink to="/products" class="empty__btn">상품 둘러보기</RouterLink>
    </div>

    <template v-else>
      <!-- Select bar -->
      <div class="selectbar">
        <label class="check">
          <input type="checkbox" :checked="allSelected" @change="toggleAll" />
          <span class="check__box" :class="{ 'check__box--on': allSelected }">
            <IconBase name="check" :size="13" :stroke="2.5" />
          </span>
          <span class="check__label">
            전체 선택
            <span class="check__count">({{ selectedCount }}/{{ validLines.length }})</span>
          </span>
        </label>
        <button
          type="button"
          class="del-btn"
          :disabled="selectedCount === 0"
          @click="removeSelected"
        >
          선택 삭제
        </button>
      </div>

      <!-- Item list -->
      <ul class="items">
        <li
          v-for="line in validLines"
          :key="line.productId"
          class="item"
          :class="{ 'item--off': !line.selected }"
        >
          <label class="item__check">
            <input
              type="checkbox"
              :checked="line.selected"
              @change="cart.toggleSelected(line.productId)"
            />
            <span class="check__box" :class="{ 'check__box--on': line.selected }">
              <IconBase name="check" :size="13" :stroke="2.5" />
            </span>
          </label>

          <RouterLink :to="`/products/${line.productId}`" class="item__thumb">
            <ProductTile
              :kind="line.product!.kind"
              :tone="line.product!.tone"
              ratio="1/1"
              radius="10px"
              :show-label="false"
            />
          </RouterLink>

          <div class="item__body">
            <div class="item__head">
              <RouterLink :to="`/products/${line.productId}`" class="item__brand">
                {{ line.product!.brand }} · {{ line.product!.year }}
              </RouterLink>
              <button
                type="button"
                class="item__remove"
                aria-label="삭제"
                @click="cart.remove(line.productId)"
              >
                <IconBase name="close" :size="16" />
              </button>
            </div>
            <RouterLink :to="`/products/${line.productId}`" class="item__title">
              {{ line.product!.title }}
            </RouterLink>
            <div class="item__foot">
              <div class="qty">
                <button type="button" :disabled="line.qty <= 1" @click="dec(line)" aria-label="수량 감소">
                  <IconBase name="minus" :size="12" />
                </button>
                <span class="qty__n">{{ line.qty }}</span>
                <button
                  type="button"
                  :disabled="line.qty >= (line.product!.stock ?? 99)"
                  @click="inc(line)"
                  aria-label="수량 증가"
                >
                  <IconBase name="plus" :size="12" />
                </button>
              </div>
              <div class="item__price">{{ won(line.product!.price * line.qty) }}</div>
            </div>
          </div>
        </li>
      </ul>

      <!-- Summary -->
      <section class="summary">
        <h2 class="summary__title">결제 예정 금액</h2>
        <dl class="summary__list">
          <div class="summary__row">
            <dt>상품 금액</dt>
            <dd>{{ won(itemsTotal) }}</dd>
          </div>
          <div class="summary__row">
            <dt>배송비 <span class="summary__hint">직접배송 · 서울/경기</span></dt>
            <dd>{{ shipping > 0 ? `+ ${won(shipping)}` : '0원' }}</dd>
          </div>
        </dl>
        <div class="summary__total">
          <span class="summary__total-l">최종 결제 금액</span>
          <span class="summary__total-v">{{ won(finalTotal) }}</span>
        </div>
        <p class="summary__note">
          배송 방식은 결제 단계에서 변경할 수 있어요. 화물택배는 60,000원, 그 외 지역 직배송은 별도 협의입니다.
        </p>
      </section>

      <!-- Desktop CTA (inline below summary) -->
      <div class="inline-cta">
        <Button variant="accent" size="lg" full :disabled="selectedCount === 0" @click="checkout">
          {{ selectedCount === 0 ? '결제할 상품을 선택해 주세요' : `${selectedCount}건 · ${won(finalTotal)} 주문하기` }}
        </Button>
      </div>

      <!-- Sticky bottom CTA (mobile) -->
      <div class="sticky-cta">
        <Button variant="accent" size="lg" full :disabled="selectedCount === 0" @click="checkout">
          {{ selectedCount === 0 ? '결제할 상품을 선택해 주세요' : `${selectedCount}건 · ${won(finalTotal)} 주문하기` }}
        </Button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.cart {
  max-width: 720px;
  margin: 0 auto;
  padding: 16px 16px 120px;
}

@media (min-width: 768px) {
  .cart {
    padding: 32px 24px 56px;
  }
}

/* header */
.cart__head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 16px;
}
.cart__title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.025em;
}
.cart__count {
  font-size: 13px;
  font-weight: 600;
  color: var(--rekit-ink-subtle);
  font-family: var(--rekit-font-mono);
}
@media (min-width: 768px) {
  .cart__title {
    font-size: 28px;
  }
}

/* empty */
.empty {
  text-align: center;
  padding: 64px 20px;
}
.empty__icon {
  width: 80px;
  height: 80px;
  border-radius: 999px;
  background: var(--rekit-surface-muted);
  color: var(--rekit-ink-subtle);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.empty__t {
  margin: 20px 0 0;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.025em;
}
.empty__b {
  margin: 8px auto 0;
  max-width: 360px;
  font-size: 13.5px;
  color: var(--rekit-ink-muted);
  line-height: 1.6;
}
.empty__btn {
  margin-top: 24px;
  display: inline-block;
  padding: 14px 24px;
  background: var(--rekit-ink);
  color: #fff;
  border-radius: 12px;
  font-weight: 700;
  text-decoration: none;
  font-size: 14.5px;
  letter-spacing: -0.015em;
}

/* select bar */
.selectbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 4px;
  margin-bottom: 8px;
}

.check {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.check input[type='checkbox'] {
  display: none;
}
.check__box {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: var(--rekit-surface);
  border: 1.5px solid var(--rekit-border-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  flex-shrink: 0;
}
.check__box--on {
  background: var(--rekit-accent);
  border-color: var(--rekit-accent);
  color: #fff;
}
.check__label {
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: -0.015em;
}
.check__count {
  font-weight: 600;
  color: var(--rekit-ink-subtle);
  margin-left: 4px;
}

.del-btn {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--rekit-ink-muted);
  padding: 6px 10px;
  border-radius: 8px;
}
.del-btn:hover:not(:disabled) {
  color: var(--rekit-danger);
}
.del-btn:disabled {
  color: var(--rekit-ink-placeholder);
  cursor: not-allowed;
}

/* items */
.items {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.item {
  display: grid;
  grid-template-columns: auto 88px 1fr;
  gap: 14px;
  padding: 14px;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  align-items: center;
  transition: opacity 0.15s;
}
.item--off {
  opacity: 0.55;
}
.item__check {
  cursor: pointer;
  display: flex;
  align-items: center;
}
.item__check input {
  display: none;
}
.item__thumb {
  width: 88px;
  align-self: stretch;
  display: flex;
}
.item__body {
  min-width: 0;
}
.item__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.item__brand {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--rekit-ink-subtle);
  text-decoration: none;
  letter-spacing: -0.01em;
}
.item__remove {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--rekit-ink-subtle);
}
.item__remove:hover {
  color: var(--rekit-danger);
  background: var(--rekit-surface-muted);
}
.item__title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 2px;
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.015em;
  color: var(--rekit-ink);
  text-decoration: none;
}
.item__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
}

.qty {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--rekit-border);
  border-radius: 8px;
  overflow: hidden;
}
.qty button {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--rekit-ink);
}
.qty button:disabled {
  color: var(--rekit-ink-placeholder);
  cursor: not-allowed;
}
.qty__n {
  width: 28px;
  text-align: center;
  font-size: 12.5px;
  font-weight: 700;
}
.item__price {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

@media (min-width: 768px) {
  .item {
    grid-template-columns: auto 100px 1fr;
    padding: 18px;
    gap: 18px;
  }
  .item__thumb {
    width: 100px;
  }
  .item__title {
    font-size: 14px;
  }
  .item__price {
    font-size: 17px;
  }
}

/* summary */
.summary {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  padding: 18px 20px;
  margin-bottom: 16px;
}
.summary__title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.summary__list {
  margin: 0 0 14px;
}
.summary__row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 6px 0;
  font-size: 13px;
}
.summary__row dt {
  color: var(--rekit-ink-muted);
  margin: 0;
}
.summary__row dd {
  margin: 0;
  font-weight: 600;
}
.summary__hint {
  margin-left: 6px;
  font-size: 11px;
  color: var(--rekit-ink-subtle);
  font-weight: 500;
}
.summary__total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-top: 12px;
  border-top: 1px solid var(--rekit-border);
}
.summary__total-l {
  font-size: 13.5px;
  font-weight: 700;
}
.summary__total-v {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.025em;
}
.summary__note {
  margin: 12px 0 0;
  font-size: 11.5px;
  color: var(--rekit-ink-subtle);
  line-height: 1.55;
}

/* inline CTA (desktop below summary) */
.inline-cta {
  display: none;
}
@media (min-width: 768px) {
  .inline-cta {
    display: block;
  }
}

/* sticky CTA (mobile) */
.sticky-cta {
  position: fixed;
  bottom: 80px;
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
