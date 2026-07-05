<script setup lang="ts">
import { computed, ref } from 'vue'
import IconBase from '@/components/ds/IconBase.vue'
import { replaceProductImages, updateProductImage } from '@/api/admin/products'
import { uploadImage, UPLOAD_CONTENT_TYPES } from '@/api/uploads'
import { ApiError } from '@/api/client'

export interface EditableImage {
  id?: number
  url: string
  label: string | null
}

const props = withDefaults(
  defineProps<{
    images: EditableImage[]
    productId?: number | null
    disabled?: boolean
    max?: number
    min?: number
  }>(),
  { productId: null, disabled: false, max: 10, min: 4 },
)

const emit = defineEmits<{
  'update:images': [EditableImage[]]
  error: [string]
}>()

const MAX_SIZE = 5 * 1024 * 1024

const fileInput = ref<HTMLInputElement | null>(null)
const uploadingCount = ref(0)
const isUploading = computed(() => uploadingCount.value > 0)

const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

function onDragStart(index: number, e: DragEvent) {
  if (props.disabled) return
  dragIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }
}

function onDragEnter(index: number) {
  if (dragIndex.value === null) return
  dragOverIndex.value = index
}

function onDragEnd() {
  dragIndex.value = null
  dragOverIndex.value = null
}

async function onDrop(index: number) {
  const from = dragIndex.value
  dragIndex.value = null
  dragOverIndex.value = null
  if (from === null || from === index) return
  const next = [...props.images]
  const [moved] = next.splice(from, 1)
  if (!moved) return
  next.splice(index, 0, moved)
  await persist(next)
}

function openPicker() {
  if (props.disabled || props.images.length >= props.max) return
  fileInput.value?.click()
}

// PUT /admin/products/{id}/images replaces the full array and returns it back
// with server-assigned `id`/`sort_order` — sync from that response so later
// single-image PATCH calls (label edits) have a real image id to target.
async function persist(next: EditableImage[]) {
  if (!props.productId) {
    emit('update:images', next)
    return
  }
  try {
    const updated = await replaceProductImages(
      props.productId,
      next.map((img) => ({ url: img.url, label: img.label })),
    )
    const synced = [...updated.images]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => ({ id: img.id, url: img.url, label: img.label }))
    emit('update:images', synced)
  } catch (err) {
    emit('error', err instanceof ApiError ? err.message : '이미지 저장 중 오류가 발생했습니다.')
    emit('update:images', next)
  }
}

async function onFilesPicked(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''
  if (!files.length) return

  const room = props.max - props.images.length
  const toUpload = files.slice(0, room)

  const next = [...props.images]
  for (const file of toUpload) {
    if (!UPLOAD_CONTENT_TYPES.includes(file.type as (typeof UPLOAD_CONTENT_TYPES)[number])) {
      emit('error', `${file.name}: JPG, PNG, WEBP 파일만 업로드할 수 있습니다.`)
      continue
    }
    if (file.size > MAX_SIZE) {
      emit('error', `${file.name}: 5MB 이하 파일만 업로드할 수 있습니다.`)
      continue
    }
    uploadingCount.value++
    try {
      const { public_url } = await uploadImage(file)
      next.push({ url: public_url, label: null })
    } catch (err) {
      emit('error', err instanceof ApiError ? err.message : `${file.name} 업로드 중 오류가 발생했습니다.`)
    } finally {
      uploadingCount.value--
    }
  }
  await persist(next)
}

async function removeImage(index: number) {
  const next = props.images.filter((_, i) => i !== index)
  await persist(next)
}

async function moveImage(index: number, dir: -1 | 1) {
  const target = index + dir
  if (target < 0 || target >= props.images.length) return
  const next = [...props.images]
  const a = next[index]
  const b = next[target]
  if (!a || !b) return
  next[index] = b
  next[target] = a
  await persist(next)
}

function updateLabel(index: number, value: string) {
  const next = props.images.map((img, i) => (i === index ? { ...img, label: value.trim() || null } : img))
  emit('update:images', next)
}

// Prefer the single-image PATCH (§13.7) when we already know the image's id —
// smaller payload than resending the full array through persist()/PUT.
async function commitLabel(index: number) {
  const img = props.images[index]
  if (!img) return
  if (props.productId && img.id) {
    try {
      await updateProductImage(props.productId, img.id, { label: img.label })
    } catch (err) {
      emit('error', err instanceof ApiError ? err.message : '라벨 저장 중 오류가 발생했습니다.')
    }
    return
  }
  await persist(props.images)
}
</script>

<template>
  <div class="pie">
    <div class="pie__grid">
      <div
        v-for="(img, i) in images"
        :key="`${img.url}-${i}`"
        class="pie__tile"
        :class="{ 'pie__tile--dragging': dragIndex === i, 'pie__tile--drop-target': dragOverIndex === i && dragIndex !== null && dragIndex !== i }"
        :draggable="!disabled && images.length > 1"
        @dragstart="onDragStart(i, $event)"
        @dragenter.prevent="onDragEnter(i)"
        @dragover.prevent
        @drop.prevent="onDrop(i)"
        @dragend="onDragEnd"
      >
        <div class="pie__imgbox">
          <img :src="img.url" :alt="img.label || `상품 이미지 ${i + 1}`" class="pie__img" />
          <span v-if="i === 0" class="pie__primary">대표</span>
          <button
            type="button"
            class="pie__remove"
            :disabled="disabled"
            aria-label="이미지 삭제"
            @click.stop.prevent="removeImage(i)"
          >
            <IconBase name="close" :size="12" :stroke="2.5" />
          </button>
          <div v-if="images.length > 1" class="pie__reorder">
            <button
              type="button"
              class="pie__reorder-btn"
              :disabled="disabled || i === 0"
              aria-label="앞으로 이동"
              @click.stop.prevent="moveImage(i, -1)"
            >
              <IconBase name="chevronLeft" :size="13" />
            </button>
            <button
              type="button"
              class="pie__reorder-btn"
              :disabled="disabled || i === images.length - 1"
              aria-label="뒤로 이동"
              @click.stop.prevent="moveImage(i, 1)"
            >
              <IconBase name="chevronRight" :size="13" />
            </button>
          </div>
        </div>
        <input
          class="pie__label"
          type="text"
          placeholder="라벨 (예: 정면)"
          :value="img.label ?? ''"
          :disabled="disabled"
          @input="updateLabel(i, ($event.target as HTMLInputElement).value)"
          @blur="commitLabel(i)"
        />
      </div>

      <button
        v-if="images.length < max"
        type="button"
        class="pie__tile pie__add"
        :disabled="disabled || isUploading"
        @click="openPicker"
      >
        <span v-if="isUploading" class="pie__spinner" />
        <IconBase v-else name="plus" :size="22" />
        <span>{{ isUploading ? '업로드 중…' : '이미지 추가' }}</span>
      </button>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      multiple
      class="pie__file-input"
      @change="onFilesPicked"
    />

    <div class="pie__hint">
      <IconBase name="info" :size="14" />
      <span>
        최소 {{ min }}장 / 최대 {{ max }}장 · 5MB 이하 · JPG, PNG, WEBP · 첫 번째 이미지가 대표 이미지로 노출됩니다 · 이미지를 드래그해서 순서를 바꿀 수 있어요
        <template v-if="images.length < min">· 현재 {{ images.length }}장 ({{ min - images.length }}장 더 필요)</template>
      </span>
    </div>
  </div>
</template>

<style scoped>
.pie__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.pie__tile {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pie__tile[draggable='true'] { cursor: grab; }
.pie__tile--dragging { opacity: 0.4; }
.pie__tile--drop-target .pie__imgbox {
  outline: 2px solid var(--rekit-accent);
  outline-offset: 2px;
}
.pie__imgbox {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: var(--rekit-surface-muted);
  border: 1px solid var(--rekit-border);
}
.pie__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.pie__primary {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 3px 7px;
  background: var(--rekit-ink);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: 4px;
}
.pie__remove {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.pie__remove:disabled { opacity: 0.5; cursor: not-allowed; }
.pie__reorder {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  padding: 3px;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 999px;
}
.pie__reorder-btn {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: transparent;
  color: #fff;
  border: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.pie__reorder-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.pie__label {
  width: 100%;
  padding: 6px 9px;
  font-size: 11.5px;
  border: 1px solid var(--rekit-border);
  border-radius: 8px;
  background: var(--rekit-surface);
  color: var(--rekit-ink);
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
}
.pie__label:focus { border-color: var(--rekit-ink); box-shadow: 0 0 0 3px rgba(26, 26, 23, 0.06); }

.pie__add {
  aspect-ratio: 1;
  align-self: start;
  width: 100%;
  border-radius: 12px;
  background: var(--rekit-surface);
  border: 1.5px dashed var(--rekit-border-strong);
  color: var(--rekit-ink-subtle);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
}
.pie__add span { font-size: 11.5px; font-weight: 600; }
.pie__add:disabled { opacity: 0.6; cursor: not-allowed; }

.pie__spinner {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 2px solid var(--rekit-border-strong);
  border-top-color: var(--rekit-accent);
  animation: pie-spin 0.7s linear infinite;
}
@keyframes pie-spin {
  to { transform: rotate(360deg); }
}

.pie__file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.pie__hint {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--rekit-surface-muted);
  border-radius: 12px;
  font-size: 12px;
  color: var(--rekit-ink-muted);
}
.pie__hint svg { color: var(--rekit-ink-subtle); flex-shrink: 0; }

@media (min-width: 768px) {
  .pie__grid { grid-template-columns: repeat(5, 1fr); }
}
</style>
