<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { REKIT } from '@/design/tokens'
import type { ApplianceKind, Tone, Grade } from '@/data/products'
import ApplianceGlyph from './ApplianceGlyph.vue'
import Badge from './Badge.vue'

const props = withDefaults(
  defineProps<{
    kind: ApplianceKind
    label?: string
    ratio?: string
    grade?: Grade
    tone?: Tone
    radius?: string
    showLabel?: boolean
    imageUrl?: string
  }>(),
  { ratio: '1/1', tone: 'mint', radius: REKIT.radius.lg, showLabel: true },
)

const TONES: Record<Tone, [string, string]> = {
  mint: ['#EAF4ED', '#DCE9DF'],
  sage: ['#EEEEE6', '#E2E2D8'],
  sand: ['#F2EDE2', '#E7E0D0'],
  stone: ['#EDEDE6', '#E0E0D8'],
  cool: ['#E6EDED', '#D8E0E0'],
  cream: ['#F4EFE5', '#EAE3D2'],
}

const tileStyle = computed(() => {
  const [c1, c2] = TONES[props.tone] ?? TONES.mint
  return {
    aspectRatio: props.ratio,
    width: '100%',
    borderRadius: props.radius,
    background: `linear-gradient(160deg, ${c1}, ${c2})`,
  }
})

const gradeTone = computed(
  () => (props.grade ? (props.grade.toLowerCase() as 'a' | 'b' | 'c') : undefined),
)

// 이미지 로드 실패 시 placeholder 로 폴백. 로드 중에는 shimmer 스켈레톤 → 완료 시 fade-in.
const imageFailed = ref(false)
const imageLoaded = ref(false)
watch(
  () => props.imageUrl,
  () => {
    imageFailed.value = false
    imageLoaded.value = false
  },
)
const showImage = computed(() => !!props.imageUrl && !imageFailed.value)
</script>

<template>
  <div class="rekit-tile" :style="tileStyle">
    <div v-if="showImage && !imageLoaded" class="rekit-tile__skeleton" aria-hidden="true" />
    <img
      v-if="showImage"
      :src="imageUrl"
      :alt="label ?? ''"
      class="rekit-tile__img"
      :class="{ 'rekit-tile__img--loaded': imageLoaded }"
      loading="lazy"
      decoding="async"
      @load="imageLoaded = true"
      @error="imageFailed = true"
    />
    <div v-else class="rekit-tile__glyph">
      <ApplianceGlyph :kind="kind" />
    </div>
    <div v-if="grade" class="rekit-tile__grade">
      <Badge :tone="gradeTone" size="xs" :style="{ fontWeight: 700, fontSize: '10.5px' }">
        {{ grade }}급
      </Badge>
    </div>
    <div v-if="showLabel && label" class="rekit-tile__label">{{ label }}</div>
  </div>
</template>

<style scoped>
.rekit-tile {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.rekit-tile__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0;
  transition: opacity 0.25s ease;
}
.rekit-tile__img--loaded {
  opacity: 1;
}
/* 로딩 중 shimmer — 톤 그라데이션 위에 밝은 띠가 지나간다. */
.rekit-tile__skeleton {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    100deg,
    rgba(255, 255, 255, 0) 30%,
    rgba(255, 255, 255, 0.55) 50%,
    rgba(255, 255, 255, 0) 70%
  );
  background-size: 200% 100%;
  animation: rekit-tile-shimmer 1.3s ease-in-out infinite;
}
@keyframes rekit-tile-shimmer {
  from {
    background-position: 150% 0;
  }
  to {
    background-position: -50% 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .rekit-tile__skeleton {
    animation: none;
    background: rgba(255, 255, 255, 0.35);
  }
  .rekit-tile__img {
    transition: none;
  }
}
.rekit-tile__glyph {
  width: 62%;
  height: 62%;
}
.rekit-tile__grade {
  position: absolute;
  top: 10px;
  left: 10px;
}
.rekit-tile__label {
  position: absolute;
  bottom: 8px;
  right: 10px;
  font-family: var(--rekit-font-mono);
  font-size: 9.5px;
  color: rgba(26, 26, 23, 0.4);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
</style>
