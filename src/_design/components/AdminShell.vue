<script setup lang="ts">
import { REKIT } from '@/design/tokens'
import IconBase from '@/components/ds/IconBase.vue'
import RekitLogo from '@/components/ds/RekitLogo.vue'
import type { IconName } from '@/design/icons'

withDefaults(
  defineProps<{
    active?: 'dashboard' | 'products' | 'orders' | 'members' | 'sales'
    title: string
    subtitle?: string
  }>(),
  { active: 'dashboard' },
)

const nav: { id: 'dashboard' | 'products' | 'orders' | 'members' | 'sales'; i: IconName; t: string }[] = [
  { id: 'dashboard', i: 'chart', t: '대시보드' },
  { id: 'products', i: 'box', t: '상품 관리' },
  { id: 'orders', i: 'cart', t: '주문 관리' },
  { id: 'members', i: 'user', t: '회원 관리' },
  { id: 'sales', i: 'wallet', t: '매출 / 정산' },
]
</script>

<template>
  <div class="admin-shell" :style="{ background: REKIT.color.bg }">
    <aside
      class="admin-shell__aside"
      :style="{ background: REKIT.color.surface, borderRight: `1px solid ${REKIT.color.border}` }"
    >
      <div class="admin-shell__brand">
        <RekitLogo :size="22" />
        <div class="admin-shell__kicker" :style="{ color: REKIT.color.inkSubtle }">ADMIN CONSOLE</div>
      </div>
      <nav class="admin-shell__nav">
        <RouterLink
          v-for="n in nav"
          :key="n.id"
          :to="`/_design/admin${n.id === 'dashboard' ? '' : '/' + n.id}`"
          class="admin-shell__nav-item"
          :style="{
            background: active === n.id ? REKIT.color.ink : 'transparent',
            color: active === n.id ? '#fff' : REKIT.color.inkMuted,
            fontWeight: active === n.id ? 700 : 500,
          }"
        >
          <IconBase :name="n.i" :size="18" :stroke="active === n.id ? 2 : 1.6" />
          {{ n.t }}
        </RouterLink>
      </nav>
      <div style="flex: 1" />
      <div
        class="admin-shell__user"
        :style="{ background: REKIT.color.surfaceMuted }"
      >
        <div class="admin-shell__avatar" :style="{ background: REKIT.color.accent }">김</div>
        <div style="flex: 1; min-width: 0">
          <div style="font-size: 12.5px; font-weight: 600">김철거</div>
          <div :style="{ fontSize: '10.5px', color: REKIT.color.inkSubtle }">운영자</div>
        </div>
      </div>
    </aside>

    <main class="admin-shell__main">
      <header
        class="admin-shell__header"
        :style="{ background: REKIT.color.surface, borderBottom: `1px solid ${REKIT.color.border}` }"
      >
        <div>
          <h1 class="admin-shell__title">{{ title }}</h1>
          <div v-if="subtitle" class="admin-shell__subtitle" :style="{ color: REKIT.color.inkSubtle }">
            {{ subtitle }}
          </div>
        </div>
        <div class="admin-shell__header-right">
          <slot name="header-right" />
        </div>
      </header>
      <div class="admin-shell__body rekit-no-scrollbar">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-shell {
  width: 1440px;
  height: 900px;
  display: flex;
  overflow: hidden;
  font-size: 14px;
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(20, 20, 15, 0.04), 0 24px 60px rgba(20, 20, 15, 0.08);
}
.admin-shell__aside {
  width: 240px;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
}
.admin-shell__brand {
  padding: 0 8px 24px;
}
.admin-shell__kicker {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.06em;
  margin-top: 4px;
}
.admin-shell__nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.admin-shell__nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 13.5px;
  text-decoration: none;
}
.admin-shell__user {
  padding: 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.admin-shell__avatar {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
}
.admin-shell__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.admin-shell__header {
  padding: 24px 32px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.admin-shell__title {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin: 0;
}
.admin-shell__subtitle {
  font-size: 12.5px;
  margin-top: 4px;
}
.admin-shell__header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.admin-shell__body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
}
</style>
