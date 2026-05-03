<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import RekitLogo from '@/components/ds/RekitLogo.vue'
import IconBase from '@/components/ds/IconBase.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import MobileTabBar from '@/components/layout/MobileTabBar.vue'

const route = useRoute()

const isDesignFrame = computed(() => route.path.startsWith('/_design/'))
const isDesignIndex = computed(() => route.path === '/_design')
const isAuth = computed(() => route.path.startsWith('/auth'))
const isCheckout = computed(() => route.path.startsWith('/checkout'))
const isSearch = computed(() => route.path === '/search')
const isAdmin = computed(() => route.path === '/admin' || route.path.startsWith('/admin/'))

const stage = computed(() => {
  if (route.path.startsWith('/_design/buyer')) return 'phone'
  if (route.path.startsWith('/_design/admin') || route.path.startsWith('/_design/desktop')) return 'desktop'
  return 'page'
})
</script>

<template>
  <!-- Design canvas frames (one screen per route) -->
  <div v-if="isDesignFrame" class="canvas" :class="`canvas--${stage}`">
    <header class="canvas__header">
      <RouterLink to="/_design" class="canvas__back">
        <IconBase name="arrowLeft" :size="16" />
        <span>모든 화면</span>
      </RouterLink>
      <RekitLogo :size="20" />
      <span class="canvas__path">DESIGN REFERENCE · {{ route.path }}</span>
    </header>
    <div class="canvas__stage">
      <RouterView />
    </div>
  </div>

  <!-- Design index (own layout) -->
  <RouterView v-else-if="isDesignIndex" />

  <!-- Auth (blank layout, focused) -->
  <RouterView v-else-if="isAuth" />

  <!-- Search (blank layout, focused — has own back + search bar) -->
  <RouterView v-else-if="isSearch" />

  <!-- Admin (own shell with sidebar + header) -->
  <RouterView v-else-if="isAdmin" />

  <!-- Real app -->
  <div v-else class="app" :class="{ 'app--focused': isCheckout }">
    <AppHeader />
    <main class="app__main">
      <RouterView />
    </main>
    <AppFooter v-if="!isCheckout" />
    <MobileTabBar v-if="!isCheckout" />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--rekit-bg);
}

.app__main {
  flex: 1;
  /* Reserve space for the fixed mobile tab bar (only matters on mobile). */
  padding-bottom: 80px;
}

/* Focused mode (checkout) hides tab bar — no extra bottom padding needed. */
.app--focused .app__main {
  padding-bottom: 0;
}

@media (min-width: 768px) {
  .app__main {
    padding-bottom: 0;
  }
}

/* Design canvas frame */
.canvas {
  min-height: 100vh;
  background: var(--rekit-surface-muted);
  display: flex;
  flex-direction: column;
}

.canvas__header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 24px;
  background: var(--rekit-surface);
  border-bottom: 1px solid var(--rekit-border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.canvas__back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--rekit-ink-muted);
  text-decoration: none;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--rekit-border);
}

.canvas__path {
  margin-left: auto;
  font-family: var(--rekit-font-mono);
  font-size: 11px;
  color: var(--rekit-ink-subtle);
}

.canvas__stage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  overflow: auto;
}

.canvas--desktop .canvas__stage {
  padding: 24px;
  align-items: flex-start;
}
</style>
