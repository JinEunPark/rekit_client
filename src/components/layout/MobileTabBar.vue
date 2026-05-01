<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import IconBase from '@/components/ds/IconBase.vue'
import type { IconName } from '@/design/icons'

const route = useRoute()

const tabs: { to: string; match: (p: string) => boolean; icon: IconName; label: string }[] = [
  { to: '/', match: (p) => p === '/', icon: 'home', label: '홈' },
  { to: '/products', match: (p) => p.startsWith('/products') || p.startsWith('/category'), icon: 'grid', label: '카테고리' },
  { to: '/my/wishlist', match: (p) => p.startsWith('/my/wishlist'), icon: 'heart', label: '관심' },
  { to: '/my/orders', match: (p) => p.startsWith('/my/orders'), icon: 'box', label: '주문' },
  { to: '/my', match: (p) => p === '/my' || p.startsWith('/my/profile'), icon: 'user', label: '마이' },
]

const activeIdx = computed(() => tabs.findIndex((t) => t.match(route.path)))
</script>

<template>
  <nav class="tab" aria-label="모바일 내비게이션">
    <RouterLink v-for="(t, i) in tabs" :key="t.to" :to="t.to" class="tab__item" :class="{ 'tab__item--active': activeIdx === i }">
      <IconBase :name="t.icon" :size="22" :stroke="activeIdx === i ? 2 : 1.5" />
      <span>{{ t.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.tab {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 40;
  display: flex;
  justify-content: space-around;
  background: var(--rekit-surface);
  border-top: 1px solid var(--rekit-border);
  padding: 8px 0 max(8px, env(safe-area-inset-bottom));
}

.tab__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 4px 0;
  color: var(--rekit-ink-subtle);
  text-decoration: none;
  font-size: 10.5px;
  font-weight: 500;
}

.tab__item--active {
  color: var(--rekit-ink);
  font-weight: 700;
}

@media (min-width: 768px) {
  .tab {
    display: none;
  }
}
</style>
