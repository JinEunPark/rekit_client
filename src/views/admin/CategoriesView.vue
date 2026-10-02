<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AdminShell from '@/components/admin/AdminShell.vue'
import Button from '@/components/ds/Button.vue'
import IconBase from '@/components/ds/IconBase.vue'
import ApplianceGlyph from '@/components/ds/ApplianceGlyph.vue'
import {
  listAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from '@/api/admin/categories'
import type { AdminCategoryResponse } from '@/api/admin/categories'
import { uploadImage } from '@/api/uploads'
import { ApiError } from '@/api/client'
import type { ApplianceKind } from '@/data/products'
import { ICON_PATHS, type IconName } from '@/design/icons'

// 백엔드 icon 값은 ApplianceGlyph 종류("fridge" 등) 또는 IconBase 이름("menu" 등) 둘 중 하나로 내려온다.
// 관리자는 더 이상 이모지를 직접 입력하지 않음 — 신규 생성 시 DB 기본값과 동일한 "menu" 로 고정,
// 실제 표시는 이미지(image_url) 업로드로 대체하는 흐름을 유도한다.
const DEFAULT_ICON = 'menu'
const APPLIANCE_KINDS = new Set<ApplianceKind>([
  'fridge',
  'washer',
  'tv',
  'aircon',
  'microwave',
  'vacuum',
  'fryer',
  'dishwasher',
])
const ICON_NAMES = new Set<string>(Object.keys(ICON_PATHS))

function applianceKind(icon: string): ApplianceKind | null {
  return APPLIANCE_KINDS.has(icon as ApplianceKind) ? (icon as ApplianceKind) : null
}
function iconName(icon: string): IconName | null {
  return ICON_NAMES.has(icon) ? (icon as IconName) : null
}

const categories = ref<AdminCategoryResponse[]>([])
const loading = ref(false)
const actionError = ref('')

// 신규 추가 폼
const showAddForm = ref(false)
const newId = ref('')
const newTitle = ref('')
const newImageUrl = ref<string | null>(null)
const newImageUploading = ref(false)
const addSaving = ref(false)

// 인라인 수정
const editingId = ref<string | null>(null)
const editTitle = ref('')
const editImageUrl = ref<string | null>(null)
const editImageUploading = ref(false)
const editSaving = ref(false)

// 드래그로 순서 변경
const draggingId = ref<string | null>(null)
const dragOverId = ref<string | null>(null)
const reordering = ref(false)

async function load() {
  loading.value = true
  try {
    categories.value = await listAdminCategories()
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : '불러오기 실패'
  } finally {
    loading.value = false
  }
}

function startEdit(c: AdminCategoryResponse) {
  editingId.value = c.id
  editTitle.value = c.title
  editImageUrl.value = c.image_url
}

function cancelEdit() {
  editingId.value = null
}

async function onEditImagePicked(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  editImageUploading.value = true
  actionError.value = ''
  try {
    const { public_url } = await uploadImage(file, 'category_image')
    editImageUrl.value = public_url
  } catch (err) {
    actionError.value = err instanceof Error ? err.message : '이미지 업로드 실패'
  } finally {
    editImageUploading.value = false
  }
}

function clearEditImage() {
  editImageUrl.value = null
}

async function saveEdit(id: string) {
  if (!editTitle.value.trim()) {
    actionError.value = '이름은 비울 수 없습니다.'
    return
  }
  editSaving.value = true
  actionError.value = ''
  try {
    const updated = await updateAdminCategory(id, {
      title: editTitle.value.trim(),
      image_url: editImageUrl.value,
    })
    const idx = categories.value.findIndex((c) => c.id === id)
    if (idx !== -1) categories.value[idx] = updated
    editingId.value = null
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : '수정 실패'
  } finally {
    editSaving.value = false
  }
}

async function remove(id: string, title: string) {
  if (!confirm(`"${title}" 카테고리를 삭제하시겠습니까?\n해당 카테고리의 상품들이 영향을 받을 수 있습니다.`)) return
  actionError.value = ''
  try {
    await deleteAdminCategory(id)
    categories.value = categories.value.filter((c) => c.id !== id)
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : '삭제 실패'
  }
}

async function onNewImagePicked(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  newImageUploading.value = true
  actionError.value = ''
  try {
    const { public_url } = await uploadImage(file, 'category_image')
    newImageUrl.value = public_url
  } catch (err) {
    actionError.value = err instanceof Error ? err.message : '이미지 업로드 실패'
  } finally {
    newImageUploading.value = false
  }
}

function clearNewImage() {
  newImageUrl.value = null
}

async function addCategory() {
  if (!newId.value.trim() || !newTitle.value.trim()) {
    actionError.value = 'ID와 이름은 필수입니다.'
    return
  }
  addSaving.value = true
  actionError.value = ''
  try {
    const created = await createAdminCategory({
      id: newId.value.trim().toUpperCase(),
      title: newTitle.value.trim(),
      icon: DEFAULT_ICON,
      image_url: newImageUrl.value,
      sort_order: categories.value.length, // 목록 맨 끝에 추가 — 순서는 드래그로 조정
    })
    categories.value.push(created)
    newId.value = ''
    newTitle.value = ''
    newImageUrl.value = null
    showAddForm.value = false
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : '추가 실패'
  } finally {
    addSaving.value = false
  }
}

// ── 드래그로 순서 변경 ──────────────────────────────────────

function onDragStart(id: string) {
  draggingId.value = id
}

function onDragEnd() {
  draggingId.value = null
  dragOverId.value = null
}

async function onDrop(targetId: string) {
  const fromId = draggingId.value
  dragOverId.value = null
  draggingId.value = null
  if (!fromId || fromId === targetId) return

  const fromIndex = categories.value.findIndex((c) => c.id === fromId)
  const toIndex = categories.value.findIndex((c) => c.id === targetId)
  if (fromIndex === -1 || toIndex === -1) return

  const reordered = [...categories.value]
  const [moved] = reordered.splice(fromIndex, 1)
  if (!moved) return
  reordered.splice(toIndex, 0, moved)
  categories.value = reordered

  await persistOrder()
}

async function persistOrder() {
  reordering.value = true
  actionError.value = ''
  try {
    const changed = categories.value
      .map((c, index) => ({ c, newOrder: index }))
      .filter(({ c, newOrder }) => c.sort_order !== newOrder)

    const updated = await Promise.all(
      changed.map(({ c, newOrder }) => updateAdminCategory(c.id, { sort_order: newOrder })),
    )
    for (const u of updated) {
      const idx = categories.value.findIndex((c) => c.id === u.id)
      if (idx !== -1) categories.value[idx] = u
    }
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : '순서 저장 실패'
    await load() // 실패 시 서버 상태로 되돌림
  } finally {
    reordering.value = false
  }
}

onMounted(load)
</script>

<template>
  <AdminShell
    active="categories"
    title="카테고리 관리"
    :subtitle="`${categories.length}개 카테고리`"
  >
    <template #header-right>
      <Button variant="primary" size="sm" leading-icon="plus" @click="showAddForm = !showAddForm">
        카테고리 추가
      </Button>
    </template>

    <div v-if="actionError" class="action-error">
      <IconBase name="info" :size="14" />
      {{ actionError }}
      <button type="button" class="action-error__close" @click="actionError = ''">✕</button>
    </div>

    <!-- 추가 폼 -->
    <div v-if="showAddForm" class="add-form">
      <div class="add-form__title">새 카테고리 추가</div>
      <div class="add-form__grid">
        <div class="field">
          <label class="field__label">ID <span class="req">*</span></label>
          <input v-model="newId" class="input" type="text" placeholder="예: DISHWASHER" />
          <div class="field__hint">영문 대문자·언더스코어, 변경 불가</div>
        </div>
        <div class="field">
          <label class="field__label">이름 <span class="req">*</span></label>
          <input v-model="newTitle" class="input" type="text" placeholder="예: 식기세척기" />
        </div>
        <div class="field">
          <label class="field__label">이미지</label>
          <div class="image-picker">
            <img v-if="newImageUrl" :src="newImageUrl" class="image-picker__thumb" alt="" />
            <label class="upload-btn">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                class="file-input-hidden"
                :disabled="newImageUploading"
                @change="onNewImagePicked"
              />
              {{ newImageUploading ? '업로드 중…' : newImageUrl ? '이미지 교체' : '이미지 선택' }}
            </label>
            <button v-if="newImageUrl" type="button" class="link-btn" @click="clearNewImage">삭제</button>
          </div>
          <div class="field__hint">목록 맨 끝에 추가됩니다 — 순서는 추가 후 드래그로 조정하세요.</div>
        </div>
      </div>
      <div class="add-form__actions">
        <Button variant="secondary" size="sm" @click="showAddForm = false">취소</Button>
        <Button variant="primary" size="sm" :disabled="addSaving" @click="addCategory">
          {{ addSaving ? '추가 중…' : '추가하기' }}
        </Button>
      </div>
    </div>

    <div class="table">
      <div class="table__head">
        <span />
        <span>아이콘</span>
        <span>ID</span>
        <span>이름</span>
        <span />
      </div>

      <div v-if="loading" class="empty">불러오는 중…</div>
      <div v-else-if="categories.length === 0" class="empty">등록된 카테고리가 없습니다.</div>

      <div
        v-for="(c, i) in categories"
        :key="c.id"
        class="table__row"
        :class="{ 'table__row--first': i === 0, 'table__row--drag-over': dragOverId === c.id }"
        @dragover.prevent="dragOverId = c.id"
        @dragleave="dragOverId = dragOverId === c.id ? null : dragOverId"
        @drop="onDrop(c.id)"
      >
        <div v-if="editingId === c.id" class="edit-row">
          <div class="edit-row__image">
            <img v-if="editImageUrl" :src="editImageUrl" class="image-picker__thumb" alt="" />
            <span v-else class="icon-cell">
              <ApplianceGlyph v-if="applianceKind(c.icon)" :kind="applianceKind(c.icon)!" :size="22" />
              <IconBase v-else-if="iconName(c.icon)" :name="iconName(c.icon)!" :size="20" />
              <template v-else>{{ c.icon }}</template>
            </span>
            <label class="upload-btn">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                class="file-input-hidden"
                :disabled="editImageUploading"
                @change="onEditImagePicked"
              />
              {{ editImageUploading ? '업로드 중…' : editImageUrl ? '이미지 교체' : '이미지 선택' }}
            </label>
            <button v-if="editImageUrl" type="button" class="link-btn" @click="clearEditImage">삭제</button>
          </div>
          <span class="id-cell mono">{{ c.id }}</span>
          <input v-model="editTitle" class="input-sm edit-row__title" type="text" />
          <div class="row-actions">
            <Button variant="primary" size="sm" :disabled="editSaving" @click="saveEdit(c.id)">
              {{ editSaving ? '…' : '저장' }}
            </Button>
            <Button variant="secondary" size="sm" @click="cancelEdit">취소</Button>
          </div>
        </div>

        <template v-else>
          <span
            class="drag-handle"
            :class="{ 'drag-handle--disabled': editingId !== null || reordering }"
            :draggable="editingId === null && !reordering"
            title="드래그해서 순서 변경"
            @dragstart="onDragStart(c.id)"
            @dragend="onDragEnd"
          >
            <IconBase name="menu" :size="14" />
          </span>
          <span class="icon-cell">
            <img v-if="c.image_url" :src="c.image_url" class="icon-cell__img" alt="" />
            <ApplianceGlyph v-else-if="applianceKind(c.icon)" :kind="applianceKind(c.icon)!" :size="22" />
            <IconBase v-else-if="iconName(c.icon)" :name="iconName(c.icon)!" :size="20" />
            <template v-else>{{ c.icon }}</template>
          </span>
          <span class="id-cell mono">{{ c.id }}</span>
          <span class="name">{{ c.title }}</span>
          <div class="row-actions">
            <button class="row-action" aria-label="수정" @click="startEdit(c)">
              <IconBase name="edit" :size="15" />
            </button>
            <button class="row-action row-action--danger" aria-label="삭제" @click="remove(c.id, c.title)">
              <IconBase name="close" :size="15" />
            </button>
          </div>
        </template>
      </div>
    </div>
  </AdminShell>
</template>

<style scoped>
.action-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #FFF0F0;
  border: 1px solid var(--rekit-danger);
  border-radius: 12px;
  font-size: 12.5px;
  color: var(--rekit-danger);
  margin-bottom: 12px;
}
.action-error__close {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--rekit-danger);
  font-size: 12px;
}

.add-form {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
}
.add-form__title { font-size: 14px; font-weight: 700; margin-bottom: 16px; }
.add-form__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 16px;
}
.add-form__actions { display: flex; gap: 8px; justify-content: flex-end; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field__label { font-size: 12px; font-weight: 600; color: var(--rekit-ink-muted); }
.field__hint { font-size: 11px; color: var(--rekit-ink-subtle); }
.req { color: var(--rekit-danger); }

.input {
  padding: 9px 12px;
  border: 1px solid var(--rekit-border);
  border-radius: 10px;
  font-size: 13.5px;
  outline: none;
  background: var(--rekit-surface);
  color: var(--rekit-ink);
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
}
.input:focus { border-color: var(--rekit-ink); box-shadow: 0 0 0 3px rgba(26,26,23,0.06); }

.table {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  overflow: hidden;
}
.table__head,
.table__row {
  display: grid;
  grid-template-columns: 32px 60px 1fr 1.5fr 120px;
  padding: 12px 16px;
  align-items: center;
  gap: 12px;
}
.table__head {
  background: var(--rekit-surface-muted);
  color: var(--rekit-ink-muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.table__row {
  padding: 14px 16px;
  font-size: 13px;
  border-top: 1px solid var(--rekit-border);
}
.table__row--first { border-top: 0; }
.table__row--drag-over { background: var(--rekit-surface-muted); }

.drag-handle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--rekit-ink-subtle);
  cursor: grab;
}
.drag-handle--disabled { cursor: not-allowed; opacity: 0.4; }

.icon-cell { font-size: 20px; display: flex; align-items: center; }
.icon-cell__img {
  width: 28px;
  height: 28px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--rekit-border);
}
.id-cell { font-size: 12px; }
.mono { font-family: var(--rekit-font-mono); color: var(--rekit-ink-muted); }
.name { font-weight: 600; }

.input-sm {
  padding: 7px 10px;
  border: 1px solid var(--rekit-border-strong);
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  background: var(--rekit-surface);
  color: var(--rekit-ink);
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
}
.input-sm:focus { border-color: var(--rekit-ink); }

.image-picker { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.image-picker__thumb {
  width: 36px;
  height: 36px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--rekit-border);
  flex-shrink: 0;
}
.upload-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 7px 12px;
  border: 1px solid var(--rekit-border-strong);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--rekit-ink);
  background: var(--rekit-surface);
  cursor: pointer;
  white-space: nowrap;
}
.file-input-hidden {
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
.link-btn {
  background: none;
  border: 0;
  padding: 0;
  font-size: 12px;
  color: var(--rekit-ink-subtle);
  text-decoration: underline;
  cursor: pointer;
}

.edit-row {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.edit-row__image { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.edit-row__title { flex: 1; min-width: 120px; }

.row-actions { display: flex; gap: 4px; align-items: center; }
.row-action {
  background: none;
  border: 0;
  padding: 6px;
  border-radius: 8px;
  color: var(--rekit-ink-subtle);
  cursor: pointer;
  display: inline-flex;
}
.row-action:hover { background: var(--rekit-surface-muted); color: var(--rekit-ink); }
.row-action--danger:hover { background: #FFF0F0; color: var(--rekit-danger); }

.empty {
  padding: 40px 16px;
  text-align: center;
  color: var(--rekit-ink-subtle);
  font-size: 13px;
}

@media (max-width: 767px) {
  .add-form__grid { grid-template-columns: 1fr; }
  .table { overflow-x: auto; }
  .table__head,
  .table__row { min-width: 560px; }
}
</style>
