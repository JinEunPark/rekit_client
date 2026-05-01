<script setup lang="ts">
import { computed } from 'vue'
import { REKIT } from '@/design/tokens'
import IconBase from './IconBase.vue'
import type { IconName } from '@/design/icons'

type Variant = 'primary' | 'accent' | 'soft' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg' | 'xl'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    full?: boolean
    leadingIcon?: IconName
  }>(),
  { variant: 'primary', size: 'md', full: false },
)

const VARIANTS: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: REKIT.color.ink, fg: '#fff', border: 'none' },
  accent: { bg: REKIT.color.accent, fg: '#fff', border: 'none' },
  soft: { bg: REKIT.color.accentSoft, fg: REKIT.color.accentDeep, border: 'none' },
  secondary: { bg: REKIT.color.surface, fg: REKIT.color.ink, border: `1px solid ${REKIT.color.border}` },
  ghost: { bg: 'transparent', fg: REKIT.color.ink, border: 'none' },
  danger: { bg: REKIT.color.danger, fg: '#fff', border: 'none' },
}

const SIZES: Record<Size, { p: string; f: number; r: string; h: number }> = {
  sm: { p: '8px 14px', f: 13, r: REKIT.radius.md, h: 34 },
  md: { p: '12px 20px', f: 14.5, r: REKIT.radius.md, h: 44 },
  lg: { p: '16px 24px', f: 16, r: REKIT.radius.lg, h: 52 },
  xl: { p: '20px 28px', f: 17, r: REKIT.radius.lg, h: 60 },
}

const styles = computed(() => {
  const v = VARIANTS[props.variant]
  const s = SIZES[props.size]
  return {
    background: v.bg,
    color: v.fg,
    border: v.border,
    padding: s.p,
    fontSize: `${s.f}px`,
    borderRadius: s.r,
    height: `${s.h}px`,
    width: props.full ? '100%' : 'auto',
  }
})

const iconSize = computed(() => SIZES[props.size].f + 2)
</script>

<template>
  <button class="rekit-btn" :style="styles">
    <IconBase v-if="leadingIcon" :name="leadingIcon" :size="iconSize" />
    <slot />
  </button>
</template>

<style scoped>
.rekit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 600;
  letter-spacing: -0.015em;
  transition: transform 0.08s, opacity 0.15s;
}
.rekit-btn:active {
  transform: scale(0.98);
}
</style>
