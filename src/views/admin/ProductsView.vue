<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { won } from '@/design/tokens'
import AdminShell from '@/components/admin/AdminShell.vue'
import Button from '@/components/ds/Button.vue'
import Badge from '@/components/ds/Badge.vue'
import IconBase from '@/components/ds/IconBase.vue'
import {
  listAdminProducts,
  deleteAdminProduct,
} from '@/api/admin/products'
import type { AdminProductDetailResponse, ProductStatus } from '@/api/admin/products'
import { ApiError } from '@/api/client'

type FilterId = 'all' | 'sale' | 'soldout' | 'private'

const filterDefs: { id: FilterId; label: string; status?: ProductStatus }[] = [
  { id: 'all', label: '전체' },
  { id: 'sale', label: '판매중', status: 'ACTIVE' },
  { id: 'soldout', label: '품절', status: 'SOLD_OUT' },
  { id: 'private', label: '비공개', status: 'INACTIVE' },
]

const search = ref('')
const filter = ref<FilterId>('all')
const products = ref<AdminProductDetailResponse[]>([])
const counts = ref<Record<FilterId, number>>({ all: 0, sale: 0, soldout: 0, private: 0 })
const loading = ref(false)
const actionError = ref('')

let searchTimer: ReturnType<typeof setTimeout>

async function load() {
  loading.value = true
  try {
    const f = filterDefs.find((fd) => fd.id === filter.value)
    const res = await listAdminProducts({
      status: f?.status,
      q: search.value.trim() || undefined,
      size: 50,
    })
    products.value = res.items
    counts.value[filter.value] = res.meta.total
  } catch (err) {
    console.error('[admin/products]', err)
  } finally {
    loading.value = false
  }
}

async function loadCounts() {
  try {
    const [all, active, soldout, inactive] = await Promise.all([
      listAdminProducts({ size: 1 }),
      listAdminProducts({ status: 'ACTIVE', size: 1 }),
      listAdminProducts({ status: 'SOLD_OUT', size: 1 }),
      listAdminProducts({ status: 'INACTIVE', size: 1 }),
    ])
    counts.value = {
      all: all.meta.total,
      sale: active.meta.total,
      soldout: soldout.meta.total,
      private: inactive.meta.total,
    }
  } catch {}
}

function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(load, 300)
}

function switchFilter(id: FilterId) {
  filter.value = id
  load()
}

async function deleteProduct(id: number, title: string) {
  if (!confirm(`"${title}" 상품을 삭제(비공개 전환)하시겠습니까?`)) return
  try {
    await deleteAdminProduct(id)
    await Promise.all([load(), loadCounts()])
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : '삭제 중 오류가 발생했습니다.'
  }
}

function gradeTone(grade: string): 'accent' | 'info' | 'neutral' {
  return grade === 'A' ? 'accent' : grade === 'B' ? 'info' : 'neutral'
}

function statusBadgeTone(s: ProductStatus): 'accent' | 'danger' | 'neutral' {
  return s === 'ACTIVE' ? 'accent' : s === 'SOLD_OUT' ? 'danger' : 'neutral'
}

function statusText(s: ProductStatus): string {
  return s === 'ACTIVE' ? '판매중' : s === 'SOLD_OUT' ? '품절' : '비공개'
}

function discountPct(p: AdminProductDetailResponse): number | null {
  if (p.discount_pct !== null) return p.discount_pct
  if (p.original_price && p.original_price > p.price) {
    return Math.round(((p.original_price - p.price) / p.original_price) * 100)
  }
  return null
}

onMounted(() => Promise.all([load(), loadCounts()]))
</script>

<template>
  <AdminShell active="products" title="상품 관리" :subtitle="`총 ${counts.all}개 상품`">
    <template #header-right>
      <div class="search">
        <IconBase name="search" :size="16" />
        <input
          v-model="search"
          type="search"
          placeholder="모델명, 브랜드 검색"
          @input="onSearch"
        />
      </div>
      <RouterLink to="/admin/products/new" class="header-link">
        <Button variant="primary" size="sm" leading-icon="plus">상품 등록</Button>
      </RouterLink>
    </template>

    <div class="chips">
      <button
        v-for="f in filterDefs"
        :key="f.id"
        type="button"
        class="chip"
        :class="{ 'chip--active': filter === f.id }"
        @click="switchFilter(f.id)"
      >
        {{ f.label }} {{ counts[f.id] }}
      </button>
    </div>

    <div v-if="actionError" class="action-error">
      <IconBase name="info" :size="14" />
      {{ actionError }}
      <button type="button" class="action-error__close" @click="actionError = ''">✕</button>
    </div>

    <div class="table">
      <div class="table__head">
        <span /><span /><span>상품</span><span>카테고리</span><span>등급</span><span>가격</span><span>재고</span><span>상태</span><span />
      </div>
      <div
        v-for="(p, i) in products"
        :key="p.id"
        class="table__row"
        :class="{ 'table__row--first': i === 0 }"
      >
        <span class="cb" />
        <div class="thumb">
          <img v-if="p.images[0]" :src="p.images[0].url" :alt="p.title" class="thumb__img" />
          <div v-else class="thumb__placeholder">
            <IconBase name="grid" :size="20" />
          </div>
        </div>
        <div>
          <div class="meta">{{ p.brand ?? '—' }} · {{ p.model_name ?? '—' }}</div>
          <div class="title">{{ p.title }}</div>
        </div>
        <span class="cell-muted">{{ p.category }}</span>
        <span>
          <Badge :tone="gradeTone(p.condition_grade)" size="sm">{{ p.condition_grade }}급</Badge>
        </span>
        <div>
          <div class="price">{{ won(p.price) }}</div>
          <div v-if="p.original_price" class="price__o">
            {{ won(p.original_price) }}
            <span v-if="discountPct(p)" class="price__d">-{{ discountPct(p) }}%</span>
          </div>
        </div>
        <span class="stock" :class="{ 'stock--out': p.stock === 0 }">{{ p.stock }}개</span>
        <Badge :tone="statusBadgeTone(p.status)" size="sm">{{ statusText(p.status) }}</Badge>
        <div class="row-actions">
          <RouterLink :to="`/admin/products/${p.id}/edit`">
            <button class="row-action" aria-label="수정">
              <IconBase name="edit" :size="16" />
            </button>
          </RouterLink>
          <button class="row-action row-action--danger" aria-label="삭제" @click="deleteProduct(p.id, p.title)">
            <IconBase name="trash" :size="16" />
          </button>
        </div>
      </div>
      <div v-if="!loading && products.length === 0" class="empty">조건에 맞는 상품이 없습니다.</div>
      <div v-if="loading" class="empty">불러오는 중…</div>
    </div>
  </AdminShell>
</template>

<style scoped>
.header-link { display: inline-flex; text-decoration: none; }
.search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 12px;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--rekit-ink-subtle);
}
.search input {
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
  color: var(--rekit-ink);
  width: 180px;
}
.search input::placeholder { color: var(--rekit-ink-placeholder); }

.chips {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  overflow-x: auto;
  scrollbar-width: none;
}
.chips::-webkit-scrollbar { display: none; }
.chip {
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  background: var(--rekit-surface);
  color: var(--rekit-ink-muted);
  border: 1px solid var(--rekit-border);
  white-space: nowrap;
  cursor: pointer;
}
.chip--active {
  background: var(--rekit-ink);
  color: #fff;
  border-color: transparent;
}

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

.table {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  overflow: hidden;
}
.table__head,
.table__row {
  display: grid;
  grid-template-columns: 40px 64px 1.6fr 0.7fr 0.6fr 0.8fr 0.6fr 0.7fr 72px;
  padding: 12px 16px;
  align-items: center;
  gap: 8px;
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
.cb {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1.5px solid var(--rekit-border-strong);
}
.thumb { width: 56px; height: 56px; }
.thumb__img {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 8px;
}
.thumb__placeholder {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  background: var(--rekit-surface-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--rekit-ink-subtle);
}
.meta {
  font-size: 11px;
  color: var(--rekit-ink-subtle);
  font-weight: 600;
}
.title {
  font-weight: 600;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cell-muted { color: var(--rekit-ink-muted); }
.price { font-weight: 700; }
.price__o {
  font-size: 10.5px;
  color: var(--rekit-ink-subtle);
  text-decoration: line-through;
}
.price__d {
  color: var(--rekit-danger);
  text-decoration: none;
  font-weight: 700;
  margin-left: 4px;
}
.stock { font-weight: 600; }
.stock--out { color: var(--rekit-danger); }
.row-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}
.row-actions a { display: inline-flex; text-decoration: none; }
.row-action {
  background: none;
  border: 0;
  padding: 6px;
  border-radius: 8px;
  color: var(--rekit-ink-subtle);
  cursor: pointer;
  display: inline-flex;
}
.row-action:hover {
  background: var(--rekit-surface-muted);
  color: var(--rekit-ink);
}
.row-action--danger:hover {
  background: #FFF0F0;
  color: var(--rekit-danger);
}
.empty {
  padding: 40px 16px;
  text-align: center;
  color: var(--rekit-ink-subtle);
  font-size: 13px;
}

@media (max-width: 1023px) {
  .search input { width: 140px; }
  .table { overflow-x: auto; }
  .table__head,
  .table__row { min-width: 920px; }
}
</style>
