<script setup lang="ts">
import { computed } from 'vue'
import { REKIT } from '@/design/tokens'

type Tone = 'neutral' | 'accent' | 'a' | 'b' | 'c' | 'danger' | 'info' | 'dark' | 'outline'
type Size = 'xs' | 'sm' | 'md'

const props = withDefaults(
  defineProps<{
    tone?: Tone
    size?: Size
  }>(),
  { tone: 'neutral', size: 'sm' },
)

const TONES: Record<Tone, { bg: string; fg: string; border?: string }> = {
  neutral: { bg: REKIT.color.surfaceMuted, fg: REKIT.color.inkMuted },
  accent: { bg: REKIT.color.accentSoft, fg: REKIT.color.accentDeep },
  a: { bg: REKIT.color.gradeAbg, fg: REKIT.color.gradeA },
  b: { bg: REKIT.color.gradeBbg, fg: REKIT.color.gradeB },
  c: { bg: REKIT.color.gradeCbg, fg: REKIT.color.gradeC },
  danger: { bg: REKIT.color.dangerBg, fg: REKIT.color.danger },
  info: { bg: REKIT.color.infoBg, fg: REKIT.color.info },
  dark: { bg: REKIT.color.ink, fg: '#fff' },
  outline: { bg: 'transparent', fg: REKIT.color.inkMuted, border: `1px solid ${REKIT.color.border}` },
}

const SIZES: Record<Size, { p: string; f: number }> = {
  xs: { p: '2px 6px', f: 10.5 },
  sm: { p: '3px 8px', f: 11.5 },
  md: { p: '5px 10px', f: 12.5 },
}

const styles = computed(() => {
  const t = TONES[props.tone]
  const s = SIZES[props.size]
  return {
    background: t.bg,
    color: t.fg,
    border: t.border ?? 'none',
    padding: s.p,
    fontSize: `${s.f}px`,
  }
})
</script>

<template>
  <span class="rekit-badge" :style="styles">
    <slot />
  </span>
</template>

<style scoped>
.rekit-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  border-radius: 999px;
  letter-spacing: -0.01em;
  line-height: 1.2;
  white-space: nowrap;
}
</style>
