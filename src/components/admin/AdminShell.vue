<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import IconBase from '@/components/ds/IconBase.vue'
import RekitLogo from '@/components/ds/RekitLogo.vue'
import type { IconName } from '@/design/icons'
import { useAuthStore } from '@/stores/auth'

withDefaults(
  defineProps<{
    active?: 'dashboard' | 'products' | 'orders' | 'members' | 'sales'
    title: string
    subtitle?: string
  }>(),
  { active: 'dashboard' },
)

const route = useRoute()
const auth = useAuthStore()

const nav: { id: 'dashboard' | 'products' | 'orders' | 'members' | 'sales'; to: string; i: IconName; t: string }[] = [
  { id: 'dashboard', to: '/admin', i: 'chart', t: '대시보드' },
  { id: 'products', to: '/admin/products', i: 'box', t: '상품 관리' },
  { id: 'orders', to: '/admin/orders', i: 'cart', t: '주문 관리' },
  { id: 'members', to: '/admin/members', i: 'user', t: '회원 관리' },
  { id: 'sales', to: '/admin/sales', i: 'wallet', t: '매출 / 정산' },
]

const drawerOpen = ref(false)
watch(() => route.path, () => { drawerOpen.value = false })

const operatorName = computed(() => auth.user?.username ?? '운영자')
const operatorInitial = computed(() => operatorName.value.charAt(0))
</script>

<template>
  <div class="admin">
    <aside class="admin__aside" :class="{ 'admin__aside--open': drawerOpen }">
      <div class="admin__brand">
        <RekitLogo :size="22" />
        <div class="admin__kicker">ADMIN CONSOLE</div>
      </div>
      <nav class="admin__nav">
        <RouterLink
          v-for="n in nav"
          :key="n.id"
          :to="n.to"
          class="admin__nav-item"
          :class="{ 'admin__nav-item--active': active === n.id }"
        >
          <IconBase :name="n.i" :size="18" :stroke="active === n.id ? 2 : 1.6" />
          {{ n.t }}
        </RouterLink>
      </nav>
      <div style="flex: 1" />
      <div class="admin__user">
        <div class="admin__avatar">{{ operatorInitial }}</div>
        <div style="flex: 1; min-width: 0">
          <div class="admin__user-name">{{ operatorName }}</div>
          <div class="admin__user-role">운영자</div>
        </div>
      </div>
    </aside>

    <button
      v-if="drawerOpen"
      class="admin__scrim"
      aria-label="메뉴 닫기"
      @click="drawerOpen = false"
    />

    <main class="admin__main">
      <header class="admin__header">
        <button
          class="admin__menu-btn"
          aria-label="메뉴 열기"
          @click="drawerOpen = true"
        >
          <IconBase name="menu" :size="20" />
        </button>
        <div class="admin__heading">
          <h1 class="admin__title">{{ title }}</h1>
          <div v-if="subtitle" class="admin__subtitle">{{ subtitle }}</div>
        </div>
        <div class="admin__header-right">
          <slot name="header-right" />
        </div>
      </header>
      <div class="admin__body">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin {
  min-height: 100vh;
  background: var(--rekit-bg);
  display: flex;
  font-size: 14px;
  color: var(--rekit-ink);
}

.admin__aside {
  width: 240px;
  background: var(--rekit-surface);
  border-right: 1px solid var(--rekit-border);
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  flex-shrink: 0;
}

.admin__brand {
  padding: 0 8px 24px;
}
.admin__kicker {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.06em;
  margin-top: 4px;
  color: var(--rekit-ink-subtle);
}
.admin__nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.admin__nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 13.5px;
  text-decoration: none;
  color: var(--rekit-ink-muted);
  font-weight: 500;
}
.admin__nav-item:hover {
  background: var(--rekit-surface-muted);
}
.admin__nav-item--active,
.admin__nav-item--active:hover {
  background: var(--rekit-ink);
  color: #fff;
  font-weight: 700;
}
.admin__user {
  padding: 12px;
  border-radius: 12px;
  background: var(--rekit-surface-muted);
  display: flex;
  align-items: center;
  gap: 10px;
}
.admin__avatar {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: var(--rekit-accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
}
.admin__user-name {
  font-size: 12.5px;
  font-weight: 600;
}
.admin__user-role {
  font-size: 10.5px;
  color: var(--rekit-ink-subtle);
}

.admin__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.admin__header {
  background: var(--rekit-surface);
  border-bottom: 1px solid var(--rekit-border);
  padding: 20px 24px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: sticky;
  top: 0;
  z-index: 5;
}
.admin__heading {
  flex: 1;
  min-width: 0;
}
.admin__title {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin: 0;
}
.admin__subtitle {
  font-size: 12px;
  color: var(--rekit-ink-subtle);
  margin-top: 4px;
}
.admin__header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.admin__body {
  flex: 1;
  padding: 20px 16px 32px;
}
.admin__scrim {
  position: fixed;
  inset: 0;
  background: rgba(20, 20, 15, 0.4);
  border: 0;
  z-index: 40;
  display: none;
}
.admin__menu-btn {
  background: none;
  border: 1px solid var(--rekit-border);
  border-radius: 10px;
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--rekit-ink);
  cursor: pointer;
}

/* Mobile / tablet: sidebar becomes a drawer */
@media (max-width: 1023px) {
  .admin__aside {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 50;
    transform: translateX(-100%);
    transition: transform 0.22s ease;
    box-shadow: 0 8px 32px rgba(20, 20, 15, 0.1);
  }
  .admin__aside--open {
    transform: translateX(0);
  }
  .admin__scrim {
    display: block;
  }
}

@media (min-width: 1024px) {
  .admin__menu-btn {
    display: none;
  }
  .admin__header {
    padding: 24px 32px 20px;
  }
  .admin__title {
    font-size: 22px;
  }
  .admin__body {
    padding: 24px 32px;
  }
}
</style>
