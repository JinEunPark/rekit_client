<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import IconBase from '@/components/ds/IconBase.vue'

const props = defineProps<{
  open: boolean
  images: { url?: string; label: string }[]
  modelValue: number
}>()

const emit = defineEmits<{
  close: []
  'update:modelValue': [number]
}>()

function go(delta: number) {
  const len = props.images.length
  if (len < 2) return
  emit('update:modelValue', (props.modelValue + delta + len) % len)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
  else if (e.key === 'ArrowLeft') go(-1)
  else if (e.key === 'ArrowRight') go(1)
}

// Lock page scroll and listen for keyboard nav only while the lightbox is actually open.
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      window.addEventListener('keydown', onKeydown)
      document.body.style.overflow = 'hidden'
    } else {
      window.removeEventListener('keydown', onKeydown)
      document.body.style.overflow = ''
    }
  },
)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

const touchStartX = ref<number | null>(null)
function onTouchStart(e: TouchEvent) {
  touchStartX.value = e.touches[0]?.clientX ?? null
}
function onTouchEnd(e: TouchEvent) {
  if (touchStartX.value === null) return
  const endX = e.changedTouches[0]?.clientX ?? touchStartX.value
  const delta = endX - touchStartX.value
  if (Math.abs(delta) > 40) go(delta > 0 ? -1 : 1)
  touchStartX.value = null
}
</script>

<template>
  <Transition name="lightbox">
    <div v-if="open" class="lightbox" @click.self="emit('close')">
      <div class="lightbox__head">
        <span class="lightbox__count">{{ modelValue + 1 }} / {{ images.length }}</span>
        <button type="button" class="lightbox__close" aria-label="닫기" @click="emit('close')">
          <IconBase name="close" :size="22" />
        </button>
      </div>

      <div class="lightbox__stage" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
        <button
          v-if="images.length > 1"
          type="button"
          class="lightbox__nav lightbox__nav--prev"
          aria-label="이전 사진"
          @click.stop="go(-1)"
        >
          <IconBase name="chevronLeft" :size="22" />
        </button>

        <img
          v-if="images[modelValue]?.url"
          :src="images[modelValue]!.url"
          :alt="images[modelValue]!.label"
          class="lightbox__img"
        />

        <button
          v-if="images.length > 1"
          type="button"
          class="lightbox__nav lightbox__nav--next"
          aria-label="다음 사진"
          @click.stop="go(1)"
        >
          <IconBase name="chevronRight" :size="22" />
        </button>
      </div>

      <div v-if="images.length > 1" class="lightbox__thumbs rekit-no-scrollbar">
        <button
          v-for="(img, i) in images"
          :key="i"
          type="button"
          class="lightbox__thumb"
          :class="{ 'lightbox__thumb--active': i === modelValue }"
          @click="emit('update:modelValue', i)"
        >
          <img v-if="img.url" :src="img.url" :alt="img.label" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(10, 10, 8, 0.94);
  display: flex;
  flex-direction: column;
}
.lightbox__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: max(14px, env(safe-area-inset-top)) 16px 8px;
  flex-shrink: 0;
}
.lightbox__count {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 600;
}
.lightbox__close {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border-radius: 999px;
}
.lightbox__close:hover {
  background: rgba(255, 255, 255, 0.1);
}
.lightbox__stage {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: 0 8px;
}
.lightbox__img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}
.lightbox__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 1;
}
.lightbox__nav:hover {
  background: rgba(255, 255, 255, 0.16);
}
.lightbox__nav--prev {
  left: 8px;
}
.lightbox__nav--next {
  right: 8px;
}
@media (min-width: 768px) {
  .lightbox__nav--prev {
    left: 20px;
  }
  .lightbox__nav--next {
    right: 20px;
  }
}

.lightbox__thumbs {
  flex-shrink: 0;
  display: flex;
  gap: 8px;
  padding: 12px 16px max(12px, env(safe-area-inset-bottom));
  overflow-x: auto;
  justify-content: center;
}
.lightbox__thumb {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  opacity: 0.45;
  border: 2px solid transparent;
  background: rgba(255, 255, 255, 0.06);
  transition: opacity 0.15s ease;
}
.lightbox__thumb:hover {
  opacity: 0.75;
}
.lightbox__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.lightbox__thumb--active {
  opacity: 1;
  border-color: var(--rekit-accent);
}

.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.18s ease;
}
.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
</style>
