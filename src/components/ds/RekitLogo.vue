<script setup lang="ts">
import { computed } from 'vue'
import { REKIT } from '@/design/tokens'

const props = withDefaults(
  defineProps<{
    size?: number
    color?: string
  }>(),
  { size: 22 },
)

const wordStyle = computed(() => ({
  fontFamily: REKIT.font.sans,
  fontWeight: 800,
  fontSize: `${props.size}px`,
  letterSpacing: '-0.04em',
  color: props.color ?? REKIT.color.ink,
}))

const glyphSize = computed(() => Math.round(props.size * 0.95))
</script>

<template>
  <span class="rekit-logo" :style="wordStyle">
    <svg :width="glyphSize" :height="glyphSize" viewBox="0 0 24 24" fill="none" style="margin-right: 1px">
      <path
        d="M5 19c0-8 6-14 16-14 0 10-6 16-14 16-1.5 0-2-1-2-2z"
        :stroke="REKIT.color.accent"
        stroke-width="1.8"
        :fill="REKIT.color.accentSoft"
      />
      <path
        d="M5 19c3-3 6-6 11-11"
        :stroke="REKIT.color.accent"
        stroke-width="1.8"
        stroke-linecap="round"
      />
    </svg>
    rekit
  </span>
</template>

<style scoped>
.rekit-logo {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
