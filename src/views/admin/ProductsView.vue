<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useProductStore } from '@/stores/products'
import { discountPct } from '@/data/products'
import { won } from '@/design/tokens'
import AdminShell from '@/components/admin/AdminShell.vue'
import Button from '@/components/ds/Button.vue'
import Badge from '@/components/ds/Badge.vue'
import IconBase from '@/components/ds/IconBase.vue'
import ProductTile from '@/components/ds/ProductTile.vue'

const products = useProductStore()
const search = ref('')
const filter = ref<'all' | 'sale' | 'soldout' | 'private'>('all')

const filtered = computed(() => {
  let list = products.all
  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q),
    )
  }
  if (filter.value === 'sale') list = list.filter((p) => p.stock > 0)
  if (filter.value === 'soldout') list = list.filter((p) => p.stock === 0)
  return list
})

const counts = computed(() => ({
  all: products.all.length,
  sale: products.all.filter((p) => p.stock > 0).length,
  soldout: products.all.filter((p) => p.stock === 0).length,
  private: 0,
}))

const filters: { id: 'all' | 'sale' | 'soldout' | 'private'; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'sale', label: '판매중' },
  { id: 'soldout', label: '품절' },
  { id: 'private', label: '비공개' },
]
</script>

<template>
  <AdminShell active="products" title="상품 관리" :subtitle="`총 ${counts.all}개 상품`">
    <template #header-right>
      <div class="search">
        <IconBase name="search" :size="16" />
        <input v-model="search" type="search" placeholder="모델명, 브랜드 검색" />
      </div>
      <RouterLink to="/admin/products/new" class="header-link">
        <Button variant="primary" size="sm" leading-icon="plus">상품 등록</Button>
      </RouterLink>
    </template>

    <div class="chips">
      <button
        v-for="f in filters"
        :key="f.id"
        type="button"
        class="chip"
        :class="{ 'chip--active': filter === f.id }"
        @click="filter = f.id"
      >
        {{ f.label }} {{ counts[f.id] }}
      </button>
    </div>

    <div class="table">
      <div class="table__head">
        <span /><span /><span>상품</span><span>카테고리</span><span>등급</span><span>가격</span><span>재고</span><span>상태</span><span />
      </div>
      <div v-for="(p, i) in filtered" :key="p.id" class="table__row" :class="{ 'table__row--first': i === 0 }">
        <span class="cb" />
        <div class="thumb">
          <ProductTile :kind="p.kind" :tone="p.tone" ratio="1/1" radius="8px" :show-label="false" />
        </div>
        <div>
          <div class="meta">{{ p.brand }} · {{ p.model }}</div>
          <div class="title">{{ p.title }}</div>
        </div>
        <span class="cell-muted">{{ p.category }}</span>
        <span><Badge :tone="(p.grade.toLowerCase() as 'a' | 'b' | 'c')" size="sm">{{ p.grade }}급</Badge></span>
        <div>
          <div class="price">{{ won(p.price) }}</div>
          <div class="price__o">{{ won(p.original) }} <span class="price__d">-{{ discountPct(p) }}%</span></div>
        </div>
        <span class="stock" :class="{ 'stock--out': p.stock === 0 }">{{ p.stock }}개</span>
        <Badge :tone="p.stock === 0 ? 'danger' : 'accent'" size="sm">
          {{ p.stock === 0 ? '품절' : '판매중' }}
        </Badge>
        <button class="row-action" aria-label="수정">
          <IconBase name="edit" :size="16" />
        </button>
      </div>
      <div v-if="filtered.length === 0" class="empty">조건에 맞는 상품이 없습니다.</div>
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

.table {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  overflow: hidden;
}
.table__head,
.table__row {
  display: grid;
  grid-template-columns: 40px 80px 1.6fr 0.7fr 0.6fr 0.8fr 0.6fr 0.7fr 50px;
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
.thumb { width: 56px; }
.meta {
  font-size: 11px;
  color: var(--rekit-ink-subtle);
  font-weight: 600;
}
.title {
  font-weight: 600;
  margin-top: 2px;
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
.row-action {
  background: none;
  border: 0;
  padding: 6px;
  border-radius: 8px;
  color: var(--rekit-ink-subtle);
  cursor: pointer;
}
.row-action:hover {
  background: var(--rekit-surface-muted);
  color: var(--rekit-ink);
}
.empty {
  padding: 40px 16px;
  text-align: center;
  color: var(--rekit-ink-subtle);
  font-size: 13px;
}

/* Tablet & below: scroll the table horizontally so columns stay readable */
@media (max-width: 1023px) {
  .search input { width: 140px; }
  .table { overflow-x: auto; }
  .table__head,
  .table__row {
    min-width: 920px;
  }
}
</style>
