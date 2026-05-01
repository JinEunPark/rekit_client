<script setup lang="ts">
import { computed } from 'vue'
import { REKIT } from '@/design/tokens'
import type { ApplianceKind } from '@/data/products'

const props = withDefaults(
  defineProps<{
    kind: ApplianceKind
    size?: number | string
    tone?: string
  }>(),
  { size: '100%' },
)

const ink = computed(() => props.tone ?? REKIT.color.inkMuted)
const acc = REKIT.color.accent
const accentSoft = REKIT.color.accentSoft
const surfaceMuted = REKIT.color.surfaceMuted
</script>

<template>
  <svg viewBox="0 0 100 100" :width="size" :height="size" style="display: block">
    <g v-if="kind === 'fridge'">
      <rect x="22" y="10" width="56" height="80" rx="6" fill="#fff" :stroke="ink" stroke-width="1.6" />
      <line x1="22" y1="40" x2="78" y2="40" :stroke="ink" stroke-width="1.4" />
      <rect x="28" y="18" width="3" height="14" rx="1.5" :fill="ink" />
      <rect x="28" y="48" width="3" height="20" rx="1.5" :fill="ink" />
      <circle cx="68" cy="22" r="2" :fill="acc" />
    </g>
    <g v-else-if="kind === 'washer'">
      <rect x="18" y="14" width="64" height="72" rx="6" fill="#fff" :stroke="ink" stroke-width="1.6" />
      <circle cx="50" cy="56" r="20" fill="none" :stroke="ink" stroke-width="1.4" />
      <circle cx="50" cy="56" r="13" :fill="accentSoft" :stroke="ink" stroke-width="1" />
      <circle cx="28" cy="24" r="2" :fill="ink" />
      <circle cx="36" cy="24" r="2" :fill="ink" />
      <rect x="64" y="22" width="10" height="4" rx="1" :fill="acc" />
    </g>
    <g v-else-if="kind === 'tv'">
      <rect x="10" y="20" width="80" height="50" rx="4" fill="#fff" :stroke="ink" stroke-width="1.6" />
      <rect x="14" y="24" width="72" height="42" rx="2" :fill="surfaceMuted" />
      <line x1="40" y1="76" x2="60" y2="76" :stroke="ink" stroke-width="1.4" />
      <line x1="50" y1="70" x2="50" y2="82" :stroke="ink" stroke-width="1.4" />
      <circle cx="76" cy="60" r="2" :fill="acc" />
    </g>
    <g v-else-if="kind === 'aircon'">
      <rect x="10" y="28" width="80" height="32" rx="4" fill="#fff" :stroke="ink" stroke-width="1.6" />
      <line x1="14" y1="38" x2="86" y2="38" :stroke="ink" stroke-width="1" />
      <line x1="14" y1="44" x2="86" y2="44" :stroke="ink" stroke-width="1" />
      <line x1="14" y1="50" x2="86" y2="50" :stroke="ink" stroke-width="1" />
      <path d="M30 66 Q35 74 30 80" :stroke="acc" stroke-width="1.4" fill="none" stroke-linecap="round" />
      <path d="M50 66 Q55 74 50 80" :stroke="acc" stroke-width="1.4" fill="none" stroke-linecap="round" />
      <path d="M70 66 Q75 74 70 80" :stroke="acc" stroke-width="1.4" fill="none" stroke-linecap="round" />
    </g>
    <g v-else-if="kind === 'microwave'">
      <rect x="10" y="28" width="80" height="44" rx="4" fill="#fff" :stroke="ink" stroke-width="1.6" />
      <rect x="14" y="32" width="56" height="36" rx="2" :fill="surfaceMuted" />
      <rect x="74" y="36" width="12" height="3" rx="1" :fill="ink" />
      <rect x="74" y="42" width="12" height="3" rx="1" :fill="ink" />
      <circle cx="80" cy="58" r="3" :fill="acc" />
    </g>
    <g v-else-if="kind === 'vacuum'">
      <circle cx="50" cy="55" r="28" fill="#fff" :stroke="ink" stroke-width="1.6" />
      <circle cx="50" cy="55" r="10" :fill="accentSoft" :stroke="ink" stroke-width="1" />
      <circle cx="50" cy="55" r="3" :fill="acc" />
      <path d="M50 27 L50 16 L62 16" :stroke="ink" stroke-width="1.4" fill="none" stroke-linecap="round" />
    </g>
  </svg>
</template>
