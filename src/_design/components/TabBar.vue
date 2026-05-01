<script setup lang="ts">
import { REKIT } from '@/design/tokens'
import IconBase from '@/components/ds/IconBase.vue'
import type { IconName } from '@/design/icons'

withDefaults(
  defineProps<{
    active?: 'home' | 'cat' | 'heart' | 'order' | 'me'
  }>(),
  { active: 'home' },
)

const tabs: { id: 'home' | 'cat' | 'heart' | 'order' | 'me'; icon: IconName; label: string }[] = [
  { id: 'home', icon: 'home', label: '홈' },
  { id: 'cat', icon: 'grid', label: '카테고리' },
  { id: 'heart', icon: 'heart', label: '관심' },
  { id: 'order', icon: 'box', label: '주문' },
  { id: 'me', icon: 'user', label: '마이' },
]
</script>

<template>
  <div
    class="tab-bar"
    :style="{ background: REKIT.color.surface, borderTop: `1px solid ${REKIT.color.border}` }"
  >
    <div
      v-for="t in tabs"
      :key="t.id"
      class="tab-bar__item"
      :style="{ color: active === t.id ? REKIT.color.ink : REKIT.color.inkSubtle }"
    >
      <IconBase :name="t.icon" :size="22" :stroke="active === t.id ? 2 : 1.5" />
      <span :style="{ fontWeight: active === t.id ? 700 : 500 }">{{ t.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.tab-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px 0 28px;
  display: flex;
  justify-content: space-around;
}
.tab-bar__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.tab-bar__item span {
  font-size: 10.5px;
}
</style>
