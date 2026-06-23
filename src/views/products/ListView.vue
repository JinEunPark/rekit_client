<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'
import IconBase from '@/components/ds/IconBase.vue'
import ProductCard from '@/components/products/ProductCard.vue'
import {
  DEFAULT_FILTERS,
  SORTS,
  type ProductFilters,
  type SortKey,
} from '@/stores/products'
import type { Grade } from '@/data/products'
import { useListViewModel } from './ListViewModel'
import { useCategoryStore } from '@/stores/categories'

const route = useRoute()
const router = useRouter()
const vm = useListViewModel()
const categoryStore = useCategoryStore()

/* ---------------------------------- */
/* URL <-> filters                    */
/* ---------------------------------- */

function asString(v: unknown, fallback = ''): string {
  if (Array.isArray(v)) return v[0] ?? fallback
  return typeof v === 'string' ? v : fallback
}

function parseGrades(v: unknown): Grade[] {
  const raw = asString(v)
  if (!raw) return []
  return raw
    .split(',')
    .map((g) => g.trim().toUpperCase())
    .filter((g): g is Grade => g === 'A' || g === 'B' || g === 'C')
}

function parseSort(v: unknown): SortKey {
  const raw = asString(v) as SortKey
  return SORTS.some((s) => s.key === raw) ? raw : DEFAULT_FILTERS.sort
}

const filters = computed<ProductFilters>(() => ({
  category: asString(route.query.cat, 'all'),
  sort: parseSort(route.query.sort),
  grades: parseGrades(route.query.grade),
  warrantyOnly: route.query.warranty === '1',
  q: asString(route.query.q),
}))

function patchQuery(patch: Record<string, string | undefined>) {
  const next: LocationQueryRaw = { ...route.query }
  for (const [k, v] of Object.entries(patch)) {
    if (v == null || v === '') delete next[k]
    else next[k] = v
  }
  router.replace({ query: next })
}

function setCategory(slug: string) {
  patchQuery({ cat: slug === DEFAULT_FILTERS.category ? undefined : slug })
}
function setSort(e: Event) {
  const v = (e.target as HTMLSelectElement).value as SortKey
  patchQuery({ sort: v === DEFAULT_FILTERS.sort ? undefined : v })
}
function toggleGrade(g: Grade) {
  const cur = new Set(filters.value.grades)
  if (cur.has(g)) cur.delete(g)
  else cur.add(g)
  patchQuery({ grade: cur.size ? [...cur].sort().join(',') : undefined })
}
function toggleWarranty() {
  patchQuery({ warranty: filters.value.warrantyOnly ? undefined : '1' })
}
function clearAll() {
  router.replace({ query: filters.value.q ? { q: filters.value.q } : {} })
}

/* ---------------------------------- */
/* Derived                            */
/* ---------------------------------- */

const filtered = computed(() => vm.items.value)
const activeCategory = computed(() => {
  const slug = filters.value.category
  if (!slug || slug === 'all') return { slug: 'all', label: '전체' }
  return categoryStore.bySlug(slug) ?? { slug: 'all', label: '전체' }
})

const hasNonCategoryFilters = computed(
  () => filters.value.grades.length > 0 || filters.value.warrantyOnly,
)

onMounted(() => {
  void categoryStore.load()
  void vm.load(filters.value)
})
watch(filters, (next) => void vm.load(next), { deep: true })
</script>

<template>
  <div class="list">
    <!-- Header -->
    <header class="list__head">
      <h1 class="list__title">
        {{ activeCategory.slug === 'all' ? '모든 가전' : activeCategory.label }}
      </h1>
      <div class="list__sub">
        검수를 통과한 폐업 매장의 영업용 가전을 만나보세요
      </div>
    </header>

    <!-- Category chips: 전체 + 백엔드 카테고리 -->
    <nav class="cats rekit-no-scrollbar" aria-label="카테고리">
      <button
        type="button"
        class="cats__chip"
        :class="{ 'cats__chip--active': filters.category === 'all' }"
        @click="setCategory('all')"
      >
        전체
      </button>
      <button
        v-for="c in categoryStore.items"
        :key="c.id"
        type="button"
        class="cats__chip"
        :class="{ 'cats__chip--active': c.slug === filters.category }"
        @click="setCategory(c.slug)"
      >
        {{ c.label }}
      </button>
    </nav>

    <!-- Toolbar -->
    <div class="bar">
      <div class="bar__left">
        <span class="bar__count">총 <b>{{ filtered.length }}</b>개</span>
      </div>

      <div class="bar__right">
        <div class="select">
          <select :value="filters.sort" @change="setSort">
            <option v-for="s in SORTS" :key="s.key" :value="s.key">{{ s.label }}</option>
          </select>
          <IconBase name="chevronDown" :size="14" class="select__chevron" />
        </div>
      </div>
    </div>

    <!-- Filter pills -->
    <div class="filters">
      <div class="filters__group" role="group" aria-label="등급">
        <button
          v-for="g in (['A', 'B', 'C'] as Grade[])"
          :key="g"
          type="button"
          class="pill"
          :class="{ [`pill--${g.toLowerCase()}`]: filters.grades.includes(g) }"
          @click="toggleGrade(g)"
        >
          {{ g }}급
        </button>
      </div>
      <button
        type="button"
        class="pill pill--warranty"
        :class="{ 'pill--on': filters.warrantyOnly }"
        @click="toggleWarranty"
      >
        <IconBase name="shield" :size="13" /> 동작보증만
      </button>
      <button
        v-if="hasNonCategoryFilters"
        type="button"
        class="pill pill--clear"
        @click="clearAll"
      >
        모두 지우기 <IconBase name="close" :size="12" :stroke="2" />
      </button>
    </div>

    <!-- Search badge (when q present) -->
    <div v-if="filters.q" class="qbadge">
      <span><b>“{{ filters.q }}”</b> 검색 결과</span>
      <button type="button" class="qbadge__clear" @click="patchQuery({ q: undefined })">
        <IconBase name="close" :size="12" :stroke="2.2" />
      </button>
    </div>

    <!-- Loading / error / grid / empty -->
    <div v-if="vm.loading.value && filtered.length === 0" class="empty">
      <p>상품을 불러오는 중…</p>
    </div>
    <div v-else-if="vm.errorMessage.value && filtered.length === 0" class="empty">
      <div class="empty__t">상품을 불러오지 못했어요</div>
      <p class="empty__b">{{ vm.errorMessage.value }}</p>
      <button type="button" class="empty__btn" @click="vm.load(filters)">다시 시도</button>
    </div>
    <div v-else-if="filtered.length > 0" class="grid">
      <ProductCard v-for="p in filtered" :key="p.id" :product="p" />
    </div>
    <div v-else class="empty">
      <div class="empty__icon">
        <IconBase name="search" :size="32" :stroke="1.4" />
      </div>
      <div class="empty__t">조건에 맞는 상품이 없어요</div>
      <p class="empty__b">필터를 조정하거나 다른 카테고리를 둘러보세요.</p>
      <button type="button" class="empty__btn" @click="clearAll">필터 초기화</button>
    </div>
  </div>
</template>

<style scoped>
.list {
  max-width: 1280px;
  margin: 0 auto;
  padding: 16px 16px 32px;
}

.list__head {
  margin-bottom: 16px;
}
.list__title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.025em;
}
.list__sub {
  margin-top: 4px;
  font-size: 13px;
  color: var(--rekit-ink-muted);
}

/* category chips */
.cats {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 6px;
  margin-bottom: 16px;
  margin-left: -16px;
  margin-right: -16px;
  padding-left: 16px;
  padding-right: 16px;
}
.cats__chip {
  flex-shrink: 0;
  padding: 9px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  background: var(--rekit-surface);
  color: var(--rekit-ink);
  border: 1px solid var(--rekit-border);
  white-space: nowrap;
  letter-spacing: -0.01em;
}
.cats__chip--active {
  background: var(--rekit-ink);
  color: #fff;
  border-color: var(--rekit-ink);
}

/* toolbar */
.bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--rekit-border);
  margin-bottom: 12px;
}
.bar__count {
  font-size: 12.5px;
  color: var(--rekit-ink-muted);
}
.bar__count b {
  color: var(--rekit-ink);
  font-weight: 700;
}

.select {
  position: relative;
  display: inline-flex;
  align-items: center;
}
.select select {
  appearance: none;
  background: transparent;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--rekit-ink);
  padding: 6px 22px 6px 10px;
  cursor: pointer;
  letter-spacing: -0.01em;
}
.select__chevron {
  position: absolute;
  right: 6px;
  pointer-events: none;
  color: var(--rekit-ink-muted);
}

/* filter pills */
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}
.filters__group {
  display: inline-flex;
  gap: 6px;
}
.pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: -0.01em;
  background: var(--rekit-surface);
  color: var(--rekit-ink-muted);
  border: 1px solid var(--rekit-border);
}
.pill:hover {
  color: var(--rekit-ink);
}
.pill--a {
  background: var(--rekit-accent-soft);
  color: var(--rekit-accent-deep);
  border-color: var(--rekit-accent-soft);
}
.pill--b {
  background: #f8f0dc;
  color: #d4a23a;
  border-color: #f8f0dc;
}
.pill--c {
  background: #f8e8da;
  color: #c97a3f;
  border-color: #f8e8da;
}
.pill--on {
  background: var(--rekit-ink);
  color: #fff;
  border-color: var(--rekit-ink);
}
.pill--clear {
  background: transparent;
  border-style: dashed;
  color: var(--rekit-ink-muted);
}

/* search badge */
.qbadge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  background: var(--rekit-accent-soft);
  color: var(--rekit-accent-deep);
  font-size: 12.5px;
  font-weight: 600;
  margin-bottom: 12px;
}
.qbadge__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  color: var(--rekit-accent-deep);
}

/* grid */
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
}

/* empty */
.empty {
  text-align: center;
  padding: 56px 20px;
}
.empty__icon {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  background: var(--rekit-surface-muted);
  color: var(--rekit-ink-subtle);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.empty__t {
  margin-top: 16px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.empty__b {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--rekit-ink-muted);
}
.empty__btn {
  margin-top: 20px;
  padding: 12px 22px;
  background: var(--rekit-ink);
  color: #fff;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 700;
}

@media (min-width: 768px) {
  .list {
    padding: 32px 32px 56px;
  }
  .list__title {
    font-size: 28px;
  }
  .list__sub {
    font-size: 14px;
  }
}
</style>
