<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { won } from '@/design/tokens'
import { discountPct, type Product } from '@/data/products'
import IconBase from '@/components/ds/IconBase.vue'
import Badge from '@/components/ds/Badge.vue'
import ProductTile from '@/components/ds/ProductTile.vue'
import { useWishlistStore } from '@/stores/wishlist'

const props = withDefaults(
  defineProps<{
    product: Product
    /** Show original price strikethrough below the discounted price. */
    showOriginal?: boolean
  }>(),
  { showOriginal: true },
)

const wishlist = useWishlistStore()
const liked = computed(() => wishlist.has(props.product.id))

function toggleLike() {
  wishlist.toggle(props.product.id)
}
</script>

<template>
  <RouterLink :to="`/products/${product.id}`" class="card">
    <div class="card__media">
      <ProductTile
        :kind="product.kind"
        :tone="product.tone"
        :grade="product.grade"
        :image-url="product.thumbnailUrl"
        ratio="1/1"
      />
      <button
        type="button"
        class="card__heart"
        :class="{ 'card__heart--on': liked }"
        :aria-label="liked ? '관심상품 해제' : '관심상품 추가'"
        :aria-pressed="liked"
        @click.stop.prevent="toggleLike"
      >
        <IconBase name="heart" :size="15" />
      </button>
      <div v-if="product.tag" class="card__tag">{{ product.tag }}</div>
    </div>
    <div class="card__body">
      <div class="card__brand">
        {{ product.brand }}<template v-if="product.year"> · {{ product.year }}</template>
      </div>
      <div class="card__title">{{ product.title }}</div>
      <div class="card__price">
        <span class="card__pct">{{ discountPct(product) }}%</span>
        <span class="card__won">{{ won(product.price) }}</span>
      </div>
      <div v-if="showOriginal" class="card__orig">{{ won(product.original) }}</div>
      <div v-if="product.warranty" class="card__warranty">
        <Badge tone="accent" size="xs">
          <IconBase name="check" :size="10" :stroke="2.4" />
          동작보증
        </Badge>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.card {
  text-decoration: none;
  color: inherit;
  display: block;
}

.card__media {
  position: relative;
}

.card__heart {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: var(--rekit-ink-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}
.card__heart:hover,
.card__heart--on {
  color: var(--rekit-danger);
}
.card__heart--on svg {
  fill: var(--rekit-danger);
  stroke: var(--rekit-danger);
}

.card__tag {
  position: absolute;
  bottom: 8px;
  left: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--rekit-ink);
  color: #fff;
  font-size: 10.5px;
  font-weight: 700;
}

.card__body {
  padding: 10px 2px 0;
}

.card__brand {
  font-size: 11px;
  font-weight: 600;
  color: var(--rekit-ink-subtle);
}

.card__title {
  font-size: 13px;
  font-weight: 600;
  margin-top: 2px;
  line-height: 1.35;
  letter-spacing: -0.015em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card__price {
  margin-top: 6px;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.card__pct {
  font-size: 13px;
  font-weight: 800;
  color: var(--rekit-danger);
}

.card__won {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.card__orig {
  font-size: 11px;
  color: var(--rekit-ink-subtle);
  text-decoration: line-through;
  margin-top: 1px;
}

.card__warranty {
  margin-top: 8px;
}

@media (min-width: 768px) {
  .card__title {
    font-size: 14px;
  }
  .card__pct {
    font-size: 14px;
  }
  .card__won {
    font-size: 17px;
  }
}
</style>
