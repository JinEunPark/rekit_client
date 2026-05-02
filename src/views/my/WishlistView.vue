<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import IconBase from '@/components/ds/IconBase.vue'
import ProductCard from '@/components/products/ProductCard.vue'
import { useWishlistStore } from '@/stores/wishlist'
import { useProductStore } from '@/stores/products'

const wishlist = useWishlistStore()
const products = useProductStore()

const items = computed(() =>
  wishlist.ids
    .map((id) => products.findById(id))
    .filter((p): p is NonNullable<typeof p> => !!p),
)
</script>

<template>
  <div class="page">
    <header class="page__head">
      <h1 class="page__title">관심상품</h1>
      <span v-if="items.length > 0" class="page__count">{{ items.length }}개</span>
    </header>

    <div v-if="items.length === 0" class="empty">
      <div class="empty__icon">
        <IconBase name="heart" :size="32" :stroke="1.5" />
      </div>
      <h2 class="empty__t">관심상품이 비어있어요</h2>
      <p class="empty__b">상품 카드의 ♡ 버튼을 누르면 여기에 모여요. 재입고·할인 알림도 받을 수 있어요.</p>
      <RouterLink to="/products" class="empty__btn">상품 둘러보기</RouterLink>
    </div>

    <div v-else class="grid">
      <ProductCard v-for="p in items" :key="p.id" :product="p" />
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 1280px;
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

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
}

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
  margin: 8px auto 0;
  max-width: 360px;
  font-size: 13px;
  color: var(--rekit-ink-muted);
  line-height: 1.6;
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
</style>
