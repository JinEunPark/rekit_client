<script setup lang="ts">
import { REKIT } from '@/design/tokens'

withDefaults(
  defineProps<{
    statusBg?: string
    tint?: string
  }>(),
  { statusBg: '#fff' },
)
</script>

<template>
  <div
    class="phone-shell"
    :style="{ background: REKIT.color.bg }"
  >
    <div
      class="phone-shell__status"
      :style="{ background: statusBg, color: tint ?? REKIT.color.ink }"
    >
      <span>9:41</span>
      <span class="phone-shell__icons">
        <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor">
          <rect x="0" y="6" width="2" height="4" rx="0.5" />
          <rect x="4" y="4" width="2" height="6" rx="0.5" />
          <rect x="8" y="2" width="2" height="8" rx="0.5" />
          <rect x="12" y="0" width="2" height="10" rx="0.5" />
        </svg>
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" stroke-width="1.4">
          <path d="M1 4 Q7 -1 13 4" />
          <path d="M3.5 6 Q7 3 10.5 6" />
          <circle cx="7" cy="8" r="0.8" fill="currentColor" />
        </svg>
        <svg width="22" height="10" viewBox="0 0 22 10" fill="none" stroke="currentColor" stroke-width="1">
          <rect x="0.5" y="0.5" width="18" height="9" rx="2" />
          <rect x="2" y="2" width="14" height="6" rx="1" fill="currentColor" />
          <rect x="20" y="3.5" width="1.5" height="3" rx="0.5" fill="currentColor" />
        </svg>
      </span>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.phone-shell {
  width: 390px;
  height: 844px;
  position: relative;
  overflow: hidden;
  font-size: 14px;
  border-radius: 40px;
  box-shadow: 0 1px 2px rgba(20, 20, 15, 0.04), 0 24px 60px rgba(20, 20, 15, 0.12);
}
.phone-shell__status {
  height: 48px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 24px 6px;
  font-weight: 600;
  font-size: 14px;
  position: relative;
  z-index: 5;
}
.phone-shell__icons {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}
</style>
