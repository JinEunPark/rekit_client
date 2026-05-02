<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { won } from '@/design/tokens'
import { discountPct, type Tone } from '@/data/products'
import IconBase from '@/components/ds/IconBase.vue'
import Badge from '@/components/ds/Badge.vue'
import Button from '@/components/ds/Button.vue'
import ProductTile from '@/components/ds/ProductTile.vue'
import ProductCard from '@/components/products/ProductCard.vue'
import { useProductStore, CATEGORIES } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'

const route = useRoute()
const router = useRouter()
const store = useProductStore()
const cart = useCartStore()
const wishlist = useWishlistStore()

const productId = computed(() => route.params.id as string)
const product = computed(() => store.findById(productId.value))

const thumbs: { l: string; t: Tone }[] = [
  { l: '정면', t: 'mint' },
  { l: '측면', t: 'sage' },
  { l: '내부', t: 'cool' },
  { l: '흠집', t: 'sand' },
  { l: '뒷면', t: 'stone' },
  { l: '제품번호', t: 'cream' },
]

const grades = [
  { g: 'A', t: '거의 새 것 같은 상태, 사용감 미미' },
  { g: 'B', t: '눈에 띄는 사용감, 동작은 정상' },
  { g: 'C', t: '외관 흠집 다수, 부품·부속용 추천' },
] as const

const selectedThumb = ref(0)
const qty = ref(1)
const toast = ref<string | null>(null)

const liked = computed(() => (product.value ? wishlist.has(product.value.id) : false))
function toggleLike() {
  if (product.value) wishlist.toggle(product.value.id)
}

watch(productId, () => {
  selectedThumb.value = 0
  qty.value = 1
})

const breadcrumb = computed(() => {
  if (!product.value) return []
  const cat = CATEGORIES.find((c) => c.kinds?.includes(product.value!.kind))
  return [
    { to: '/', label: '홈' },
    { to: cat ? `/products?cat=${cat.slug}` : '/products', label: cat?.label ?? '전체' },
    { to: '', label: product.value.title },
  ]
})

const specs = computed(() => {
  if (!product.value) return []
  const p = product.value
  return [
    ['브랜드', p.brand],
    ['모델명', p.model],
    ['연식', p.year],
    ['카테고리', p.category],
    ['상태 등급', `${p.grade}급`],
    ['재고', `${p.stock}대`],
  ] as [string, string][]
})

const related = computed(() => {
  if (!product.value) return []
  return store.all
    .filter((p) => p.kind === product.value!.kind && p.id !== product.value!.id)
    .slice(0, 4)
})

function dec() {
  if (qty.value > 1) qty.value -= 1
}
function inc() {
  if (product.value && qty.value < product.value.stock) qty.value += 1
}

function showToast(msg: string) {
  toast.value = msg
  window.setTimeout(() => {
    if (toast.value === msg) toast.value = null
  }, 2400)
}

function addToCart() {
  if (!product.value) return
  cart.add(product.value.id, qty.value)
  showToast(`장바구니에 ${qty.value}개 담았어요`)
}

function buyNow() {
  if (!product.value) return
  cart.add(product.value.id, qty.value)
  router.push('/cart')
}

const gradeTone = computed(
  () => (product.value ? (product.value.grade.toLowerCase() as 'a' | 'b' | 'c') : 'a'),
)

const gradeShort = computed(() => {
  if (!product.value) return ''
  const def = grades.find((g) => g.g === product.value!.grade)
  return def ? def.t.split(',')[0] : ''
})
</script>

<template>
  <div v-if="!product" class="missing">
    <h1>상품을 찾을 수 없어요</h1>
    <p>이미 판매가 종료됐거나 잘못된 주소일 수 있어요.</p>
    <RouterLink to="/products" class="missing__btn">상품 목록 보기</RouterLink>
  </div>

  <div v-else class="detail">
    <!-- Breadcrumb -->
    <nav class="crumb" aria-label="경로">
      <template v-for="(b, i) in breadcrumb" :key="i">
        <RouterLink v-if="b.to" :to="b.to" class="crumb__link">{{ b.label }}</RouterLink>
        <span v-else class="crumb__current">{{ b.label }}</span>
        <IconBase v-if="i < breadcrumb.length - 1" name="chevronRight" :size="12" class="crumb__sep" />
      </template>
    </nav>

    <!-- Main grid: gallery | info -->
    <div class="grid">
      <!-- Gallery -->
      <section class="gallery">
        <div class="gallery__main">
          <ProductTile
            :kind="product.kind"
            :tone="thumbs[selectedThumb]!.t"
            ratio="1/1"
            radius="20px"
            :show-label="false"
          />
          <div class="gallery__counter">
            {{ selectedThumb + 1 }} / {{ thumbs.length }}
          </div>
        </div>
        <div class="gallery__thumbs rekit-no-scrollbar">
          <button
            v-for="(th, i) in thumbs"
            :key="th.l"
            type="button"
            class="thumb"
            :class="{ 'thumb--active': selectedThumb === i }"
            @click="selectedThumb = i"
          >
            <ProductTile
              :kind="product.kind"
              :tone="th.t"
              ratio="1/1"
              radius="10px"
              :show-label="false"
            />
            <span class="thumb__label">{{ th.l }}</span>
          </button>
        </div>
      </section>

      <!-- Info -->
      <section class="info">
        <div class="info__badges">
          <Badge :tone="gradeTone" size="md" :style="{ fontWeight: '700' }">
            {{ product.grade }}급 · {{ gradeShort }}
          </Badge>
          <Badge v-if="product.warranty" tone="accent" size="md">
            <IconBase name="check" :size="11" :stroke="2.4" />
            동작보증
          </Badge>
        </div>

        <div class="info__meta">{{ product.brand }} · {{ product.model }} · {{ product.year }}</div>
        <h1 class="info__title">{{ product.title }}</h1>

        <div class="price-card">
          <div class="price-card__row">
            <span class="price-card__orig">{{ won(product.original) }}</span>
            <span class="price-card__pct">{{ discountPct(product) }}% 할인</span>
          </div>
          <div class="price-card__main">{{ won(product.price) }}</div>
          <div class="price-card__save">
            원가 대비 <b>{{ won(product.original - product.price) }}</b> 절약
          </div>
        </div>

        <!-- Quantity -->
        <div class="qty-row">
          <span class="qty-row__label">수량</span>
          <div class="qty">
            <button type="button" :disabled="qty <= 1" @click="dec" aria-label="수량 감소">
              <IconBase name="minus" :size="14" />
            </button>
            <span class="qty__n">{{ qty }}</span>
            <button
              type="button"
              :disabled="qty >= product.stock"
              @click="inc"
              aria-label="수량 증가"
            >
              <IconBase name="plus" :size="14" />
            </button>
          </div>
          <span class="qty-row__stock">재고 {{ product.stock }}대</span>
        </div>

        <div class="cta">
          <button
            type="button"
            class="cta__heart"
            :class="{ 'cta__heart--on': liked }"
            aria-label="관심상품"
            @click="toggleLike"
          >
            <IconBase name="heart" :size="22" />
          </button>
          <Button variant="secondary" size="lg" :style="{ flex: '1' }" @click="addToCart">
            장바구니
          </Button>
          <Button variant="accent" size="lg" :style="{ flex: '1.3' }" @click="buyNow">
            바로 구매
          </Button>
        </div>
      </section>
    </div>

    <!-- Detail sections -->
    <div class="sections">
      <!-- Spec -->
      <section class="block">
        <h2 class="block__title">제품 정보</h2>
        <div class="spec">
          <div v-for="([k, v]) in specs" :key="k" class="spec__row">
            <span class="spec__k">{{ k }}</span>
            <span class="spec__v">{{ v }}</span>
          </div>
        </div>
      </section>

      <!-- Grade guide -->
      <section class="block">
        <h2 class="block__title">상태 등급 안내</h2>
        <div class="grade-list">
          <div
            v-for="g in grades"
            :key="g.g"
            class="grade-row"
            :class="{ 'grade-row--current': g.g === product.grade }"
          >
            <Badge :tone="g.g.toLowerCase() as 'a' | 'b' | 'c'" size="sm" :style="{ width: '24px', justifyContent: 'center' }">
              {{ g.g }}
            </Badge>
            <span class="grade-row__t">{{ g.t }}</span>
            <span v-if="g.g === product.grade" class="grade-row__cur">현재 상품</span>
          </div>
        </div>
      </section>

      <!-- Warning -->
      <section class="block">
        <div class="warn">
          <IconBase name="warning" :size="20" class="warn__icon" />
          <div>
            <div class="warn__t">중고 가전 안내</div>
            <p class="warn__b">
              제조사 A/S는 보장되지 않습니다. 도착 후 7일 이내 동작 불량은 전액 환불 가능하며, 단순
              변심 반품은 대형 가전 특성상 제한될 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      <!-- Delivery -->
      <section class="block">
        <h2 class="block__title">배송 정보</h2>
        <ul class="delivery">
          <li class="delivery__row">
            <div class="delivery__icon">
              <IconBase name="truck" :size="20" />
            </div>
            <div>
              <div class="delivery__t">화물택배</div>
              <p class="delivery__b">대형 가전 · 도착까지 약 2~4일 · 배송비 60,000원</p>
            </div>
          </li>
          <li class="delivery__row">
            <div class="delivery__icon">
              <IconBase name="map" :size="20" />
            </div>
            <div>
              <div class="delivery__t">직접 배송 (서울/경기)</div>
              <p class="delivery__b">전문 기사가 운반·설치까지 · 1~2일 · 배송비 40,000원</p>
            </div>
          </li>
        </ul>
      </section>

      <!-- Related -->
      <section v-if="related.length > 0" class="block">
        <h2 class="block__title">비슷한 상품</h2>
        <div class="related">
          <ProductCard v-for="p in related" :key="p.id" :product="p" />
        </div>
      </section>
    </div>

    <!-- Sticky bottom CTA (mobile only) -->
    <div class="sticky-cta">
      <button
        type="button"
        class="sticky-cta__heart"
        :class="{ 'sticky-cta__heart--on': liked }"
        aria-label="관심상품"
        @click="toggleLike"
      >
        <IconBase name="heart" :size="22" />
      </button>
      <Button variant="secondary" size="lg" :style="{ flex: '1' }" @click="addToCart">
        장바구니
      </Button>
      <Button variant="accent" size="lg" :style="{ flex: '1.3' }" @click="buyNow">
        바로 구매
      </Button>
    </div>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast" class="toast">
        <IconBase name="check" :size="16" :stroke="2.4" />
        <span>{{ toast }}</span>
        <RouterLink to="/cart" class="toast__link">장바구니 보기</RouterLink>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.detail {
  max-width: 1280px;
  margin: 0 auto;
  padding: 16px 16px 120px; /* extra bottom for sticky CTA */
}

@media (min-width: 768px) {
  .detail {
    padding: 24px 32px 56px;
  }
}

.missing {
  max-width: 480px;
  margin: 80px auto;
  text-align: center;
  padding: 0 20px;
}
.missing h1 {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.025em;
}
.missing p {
  margin: 8px 0 24px;
  color: var(--rekit-ink-muted);
}
.missing__btn {
  display: inline-block;
  padding: 14px 24px;
  background: var(--rekit-ink);
  color: #fff;
  border-radius: 12px;
  font-weight: 700;
  text-decoration: none;
}

/* breadcrumb */
.crumb {
  display: none;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--rekit-ink-subtle);
  padding-bottom: 16px;
}
.crumb__link {
  color: inherit;
  text-decoration: none;
}
.crumb__link:hover {
  color: var(--rekit-ink);
}
.crumb__current {
  color: var(--rekit-ink);
  font-weight: 600;
}
.crumb__sep {
  color: var(--rekit-border-strong);
}
@media (min-width: 768px) {
  .crumb {
    display: flex;
  }
}

/* main grid */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 48px;
  }
}

/* gallery */
.gallery__main {
  position: relative;
}
.gallery__counter {
  position: absolute;
  bottom: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(26, 26, 23, 0.7);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
}
.gallery__thumbs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  margin-top: 10px;
}
.thumb {
  flex: 0 0 64px;
  width: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 2px;
  border-radius: 12px;
  border: 2px solid transparent;
  background: transparent;
}
.thumb--active {
  border-color: var(--rekit-ink);
}
.thumb__label {
  font-size: 10px;
  color: var(--rekit-ink-muted);
  font-weight: 500;
}
@media (min-width: 1024px) {
  .gallery__thumbs {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
  }
  .thumb {
    flex: initial;
    width: auto;
  }
}

/* info */
.info__badges {
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
}
.info__meta {
  font-size: 12.5px;
  color: var(--rekit-ink-subtle);
  font-weight: 600;
}
.info__title {
  margin: 6px 0 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.3;
}
@media (min-width: 768px) {
  .info__title {
    font-size: 28px;
  }
}

.price-card {
  margin-top: 20px;
  padding: 20px;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
}
.price-card__row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.price-card__orig {
  font-size: 13px;
  color: var(--rekit-ink-subtle);
  text-decoration: line-through;
}
.price-card__pct {
  font-size: 13px;
  font-weight: 700;
  color: var(--rekit-danger);
}
.price-card__main {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-top: 4px;
}
.price-card__save {
  margin-top: 4px;
  font-size: 12.5px;
  color: var(--rekit-accent-deep);
}
.price-card__save b {
  font-weight: 700;
}

/* qty */
.qty-row {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.qty-row__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--rekit-ink-muted);
}
.qty {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--rekit-border);
  border-radius: 10px;
  overflow: hidden;
}
.qty button {
  width: 36px;
  height: 36px;
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
  width: 36px;
  text-align: center;
  font-size: 14px;
  font-weight: 700;
}
.qty-row__stock {
  font-size: 12px;
  color: var(--rekit-ink-subtle);
  margin-left: auto;
}

/* desktop CTA */
.cta {
  display: none;
  margin-top: 24px;
  gap: 10px;
}
.cta__heart {
  width: 56px;
  height: 56px;
  border: 1px solid var(--rekit-border);
  background: var(--rekit-surface);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--rekit-ink-muted);
}
.cta__heart--on,
.sticky-cta__heart--on {
  color: var(--rekit-danger);
  border-color: var(--rekit-danger);
}
@media (min-width: 1024px) {
  .cta {
    display: flex;
  }
}

/* sticky CTA (mobile only) */
.sticky-cta {
  position: fixed;
  bottom: 80px; /* above mobile tab bar */
  left: 0;
  right: 0;
  z-index: 30;
  display: flex;
  gap: 8px;
  padding: 12px 16px max(12px, env(safe-area-inset-bottom));
  background: var(--rekit-surface);
  border-top: 1px solid var(--rekit-border);
}
.sticky-cta__heart {
  width: 48px;
  height: 48px;
  border: 1px solid var(--rekit-border);
  background: var(--rekit-surface);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--rekit-ink-muted);
  flex-shrink: 0;
}
@media (min-width: 1024px) {
  .sticky-cta {
    display: none;
  }
}

/* sections */
.sections {
  margin-top: 48px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.block__title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

/* spec */
.spec {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 14px;
  padding: 4px 18px;
}
.spec__row {
  display: flex;
  padding: 14px 0;
  border-bottom: 1px solid var(--rekit-border);
}
.spec__row:last-child {
  border-bottom: none;
}
.spec__k {
  width: 100px;
  font-size: 13px;
  color: var(--rekit-ink-muted);
}
.spec__v {
  font-size: 13px;
  font-weight: 600;
}

/* grade list */
.grade-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 14px;
  padding: 16px;
}
.grade-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 10px;
  opacity: 0.55;
}
.grade-row--current {
  opacity: 1;
  background: var(--rekit-surface-muted);
}
.grade-row__t {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
}
.grade-row__cur {
  font-size: 11px;
  font-weight: 700;
  color: var(--rekit-accent-deep);
  background: var(--rekit-accent-soft);
  padding: 4px 8px;
  border-radius: 999px;
}

/* warning */
.warn {
  display: flex;
  gap: 12px;
  padding: 16px 18px;
  background: #fef3e5;
  border: 1px solid #f4dcb6;
  border-radius: 14px;
}
.warn__icon {
  color: #b5762a;
  flex-shrink: 0;
  margin-top: 1px;
}
.warn__t {
  font-size: 13.5px;
  font-weight: 700;
  color: #7a4f1a;
}
.warn__b {
  margin: 4px 0 0;
  font-size: 12.5px;
  color: #7a4f1a;
  line-height: 1.6;
}

/* delivery */
.delivery {
  list-style: none;
  padding: 4px 18px;
  margin: 0;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 14px;
}
.delivery__row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid var(--rekit-border);
}
.delivery__row:last-child {
  border-bottom: none;
}
.delivery__icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--rekit-accent-soft);
  color: var(--rekit-accent-deep);
  display: flex;
  align-items: center;
  justify-content: center;
}
.delivery__t {
  font-size: 13.5px;
  font-weight: 700;
}
.delivery__b {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--rekit-ink-muted);
}

/* related */
.related {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
@media (min-width: 640px) {
  .related {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (min-width: 1024px) {
  .related {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
}

/* toast */
.toast {
  position: fixed;
  left: 50%;
  bottom: 160px;
  transform: translateX(-50%);
  z-index: 40;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  background: var(--rekit-ink);
  color: #fff;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(20, 20, 15, 0.18);
}
.toast svg {
  color: var(--rekit-accent);
}
.toast__link {
  color: var(--rekit-accent);
  text-decoration: underline;
  text-underline-offset: 3px;
  margin-left: 4px;
}
@media (min-width: 1024px) {
  .toast {
    bottom: 32px;
  }
}
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.18s ease, transform 0.22s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, 12px);
}
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px);
}
</style>
