<script setup lang="ts">
import { REKIT } from '@/design/tokens'
import IconBase from '@/components/ds/IconBase.vue'
import RekitLogo from '@/components/ds/RekitLogo.vue'

const navItems = ['홈', '냉장고', '세탁기', 'TV', '에어컨', '주방가전', '기획전']
</script>

<template>
  <div class="desktop-shell" :style="{ background: REKIT.color.bg }">
    <header
      class="desktop-shell__header"
      :style="{ background: REKIT.color.surface, borderBottom: `1px solid ${REKIT.color.border}` }"
    >
      <RekitLogo :size="22" />
      <nav class="desktop-shell__nav">
        <span
          v-for="(c, i) in navItems"
          :key="c"
          :style="{ color: i === 0 ? REKIT.color.ink : REKIT.color.inkMuted }"
        >
          {{ c }}
        </span>
      </nav>
      <div
        class="desktop-shell__search"
        :style="{ background: REKIT.color.bg, border: `1px solid ${REKIT.color.border}` }"
      >
        <IconBase name="search" :size="16" :style="{ color: REKIT.color.inkSubtle }" />
        <span :style="{ color: REKIT.color.inkPlaceholder }">모델명, 브랜드 검색</span>
      </div>
      <div class="desktop-shell__icons">
        <IconBase name="heart" :size="20" :style="{ color: REKIT.color.inkMuted }" />
        <IconBase name="cart" :size="20" :style="{ color: REKIT.color.inkMuted }" />
        <IconBase name="user" :size="20" :style="{ color: REKIT.color.inkMuted }" />
      </div>
    </header>
    <div class="desktop-shell__body rekit-no-scrollbar">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.desktop-shell {
  width: 1440px;
  height: 900px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(20, 20, 15, 0.04), 0 24px 60px rgba(20, 20, 15, 0.08);
}
.desktop-shell__header {
  padding: 14px 48px;
  display: flex;
  align-items: center;
  gap: 32px;
}
.desktop-shell__nav {
  display: flex;
  gap: 24px;
  font-size: 13.5px;
  font-weight: 600;
}
.desktop-shell__search {
  flex: 1;
  max-width: 460px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 13px;
}
.desktop-shell__icons {
  display: flex;
  gap: 16px;
  align-items: center;
}
.desktop-shell__body {
  flex: 1;
  overflow-y: auto;
}
</style>
