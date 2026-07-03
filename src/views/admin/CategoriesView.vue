<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AdminShell from '@/components/admin/AdminShell.vue'
import Button from '@/components/ds/Button.vue'
import IconBase from '@/components/ds/IconBase.vue'
import {
  listAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from '@/api/admin/categories'
import type { AdminCategoryResponse } from '@/api/admin/categories'
import { ApiError } from '@/api/client'

const categories = ref<AdminCategoryResponse[]>([])
const loading = ref(false)
const actionError = ref('')

// 신규 추가 폼
const showAddForm = ref(false)
const newId = ref('')
const newTitle = ref('')
const newIcon = ref('')
const newOrder = ref('')
const addSaving = ref(false)

// 인라인 수정
const editingId = ref<string | null>(null)
const editTitle = ref('')
const editIcon = ref('')
const editOrder = ref('')
const editSaving = ref(false)

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
  editIcon.value = c.icon
  editOrder.value = String(c.sort_order)
}

function cancelEdit() {
  editingId.value = null
}

async function saveEdit(id: string) {
  editSaving.value = true
  actionError.value = ''
  try {
    const updated = await updateAdminCategory(id, {
      title: editTitle.value.trim() || null,
      icon: editIcon.value.trim() || null,
      sort_order: Number(editOrder.value) || null,
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
      icon: newIcon.value.trim() || '📦',
      sort_order: Number(newOrder.value) || undefined,
    })
    categories.value.push(created)
    newId.value = ''
    newTitle.value = ''
    newIcon.value = ''
    newOrder.value = ''
    showAddForm.value = false
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : '추가 실패'
  } finally {
    addSaving.value = false
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
          <label class="field__label">아이콘 (이모지)</label>
          <input v-model="newIcon" class="input" type="text" placeholder="예: 🍽️" />
        </div>
        <div class="field">
          <label class="field__label">정렬 순서</label>
          <input v-model="newOrder" class="input" type="number" placeholder="예: 10" />
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
        <span>아이콘</span>
        <span>ID</span>
        <span>이름</span>
        <span>정렬</span>
        <span />
      </div>

      <div v-if="loading" class="empty">불러오는 중…</div>
      <div v-else-if="categories.length === 0" class="empty">등록된 카테고리가 없습니다.</div>

      <div
        v-for="(c, i) in categories"
        :key="c.id"
        class="table__row"
        :class="{ 'table__row--first': i === 0 }"
      >
        <template v-if="editingId === c.id">
          <span class="icon-cell">
            <input v-model="editIcon" class="input-sm" type="text" />
          </span>
          <span class="id-cell mono">{{ c.id }}</span>
          <span>
            <input v-model="editTitle" class="input-sm" type="text" />
          </span>
          <span>
            <input v-model="editOrder" class="input-sm input-sm--narrow" type="number" />
          </span>
          <div class="row-actions">
            <Button variant="primary" size="sm" :disabled="editSaving" @click="saveEdit(c.id)">
              {{ editSaving ? '…' : '저장' }}
            </Button>
            <Button variant="secondary" size="sm" @click="cancelEdit">취소</Button>
          </div>
        </template>

        <template v-else>
          <span class="icon-cell">{{ c.icon }}</span>
          <span class="id-cell mono">{{ c.id }}</span>
          <span class="name">{{ c.title }}</span>
          <span class="order">{{ c.sort_order }}</span>
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
  grid-template-columns: 60px 1fr 1.5fr 80px 120px;
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

.icon-cell { font-size: 20px; }
.id-cell { font-size: 12px; }
.mono { font-family: var(--rekit-font-mono); color: var(--rekit-ink-muted); }
.name { font-weight: 600; }
.order { color: var(--rekit-ink-subtle); font-size: 12px; }

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
.input-sm--narrow { width: 64px; }

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
