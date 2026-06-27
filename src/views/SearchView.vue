<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import IconBase from '@/components/ds/IconBase.vue'
import ProductCard from '@/components/products/ProductCard.vue'
import { CATEGORIES } from '@/stores/products'
import { POPULAR_KEYWORDS, useSearchHistory } from '@/composables/useSearchHistory'
import { listProducts } from '@/api/catalog'
import { toProduct } from '@/views/products/mappers'
import { useCategoryStore } from '@/stores/categories'
import type { Product } from '@/data/products'

const route = useRoute()
const router = useRouter()
const categoryStore = useCategoryStore()
const { recents, add: addRecent, remove: removeRecent, clearAll: clearRecents } = useSearchHistory()

function asString(v: unknown): string {
  if (Array.isArray(v)) return v[0] ?? ''
  return typeof v === 'string' ? v : ''
}

const q = ref(asString(route.query.q))
const results = ref<Product[]>([])
const searchLoading = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => route.query.q,
  (val) => {
    const next = asString(val)
    if (next !== q.value) q.value = next
  },
)

async function doSearch(query: string) {
  searchLoading.value = true
  try {
    const [res] = await Promise.all([listProducts({ q: query, size: 20 }), categoryStore.load()])
    results.value = res.items.map(toProduct)
  } catch {
    results.value = []
  } finally {
    searchLoading.value = false
  }
}

watch(q, (val) => {
  if (searchTimer) clearTimeout(searchTimer)
  if (!val.trim()) { results.value = []; return }
  searchTimer = setTimeout(() => void doSearch(val.trim()), 300)
}, { immediate: true })

function submit() {
  const t = q.value.trim()
  if (!t) return
  addRecent(t)
  router.replace({ query: { q: t } })
}

function chipSearch(term: string) {
  q.value = term
  addRecent(term)
  router.replace({ query: { q: term } })
}

function clearQuery() {
  q.value = ''
  router.replace({ query: {} })
}

const showResults = computed(() => q.value.trim().length > 0)

/* Categories shown when no query, excluding "all" */
const browseCats = CATEGORIES.filter((c) => c.slug !== 'all')
</script>

<template>
  <div class="page">
    <!-- Sticky search bar -->
    <header class="bar-wrap">
      <RouterLink to="/" class="bar__back" aria-label="뒤로">
        <IconBase name="chevronLeft" :size="20" />
      </RouterLink>
      <form class="bar" @submit.prevent="submit">
        <IconBase name="search" :size="18" class="bar__icon" />
        <input
          v-model="q"
          type="search"
          placeholder="모델명, 브랜드 검색"
          autocomplete="off"
          autofocus
        />
        <button
          v-if="q"
          type="button"
          class="bar__clear"
          aria-label="지우기"
          @click="clearQuery"
        >
          <IconBase name="close" :size="14" :stroke="2.2" />
        </button>
      </form>
    </header>

    <main class="body">
      <!-- ============ NO QUERY ============ -->
      <template v-if="!showResults">
        <!-- Recent searches -->
        <section v-if="recents.length > 0" class="block">
          <header class="block__head">
            <h2>최근 검색어</h2>
            <button type="button" class="link" @click="clearRecents(true)">모두 삭제</button>
          </header>
          <div class="chips">
            <div v-for="r in recents" :key="r" class="chip">
              <button type="button" class="chip__main" @click="chipSearch(r)">
                <IconBase name="refresh" :size="11" />
                {{ r }}
              </button>
              <button
                type="button"
                class="chip__x"
                aria-label="삭제"
                @click="removeRecent(r)"
              >
                <IconBase name="close" :size="11" :stroke="2.2" />
              </button>
            </div>
          </div>
        </section>

        <!-- Popular keywords -->
        <section class="block">
          <header class="block__head">
            <h2>
              <IconBase name="chart" :size="14" />
              <span>인기 검색어</span>
            </h2>
            <span class="block__date">{{ new Date().getMonth() + 1 }}월 {{ new Date().getDate() }}일 기준</span>
          </header>
          <ol class="popular">
            <li v-for="(p, i) in POPULAR_KEYWORDS" :key="p" class="popular__item">
              <button type="button" @click="chipSearch(p)">
                <span class="popular__rank" :class="{ 'popular__rank--top': i < 3 }">
                  {{ i + 1 }}
                </span>
                <span class="popular__term">{{ p }}</span>
              </button>
            </li>
          </ol>
        </section>

        <!-- Browse by category -->
        <section class="block">
          <h2 class="block__title">카테고리로 둘러보기</h2>
          <div class="catgrid">
            <RouterLink
              v-for="c in browseCats"
              :key="c.slug"
              :to="`/products?cat=${c.slug}`"
              class="catgrid__item"
            >
              {{ c.label }}
            </RouterLink>
          </div>
        </section>
      </template>

      <!-- ============ HAS QUERY ============ -->
      <template v-else>
        <div class="meta">
          <span><b>"{{ q }}"</b> 검색 결과</span>
          <span class="meta__count">{{ searchLoading ? '…' : `${results.length}개` }}</span>
        </div>

        <div v-if="searchLoading && results.length === 0" class="empty">
          <p style="color: var(--rekit-ink-muted); font-size: 13px;">검색 중…</p>
        </div>
        <div v-else-if="results.length > 0" class="grid">
          <ProductCard v-for="p in results" :key="p.id" :product="p" />
        </div>

        <div v-else class="empty">
          <div class="empty__icon">
            <IconBase name="search" :size="32" :stroke="1.4" />
          </div>
          <h2 class="empty__t">검색 결과가 없어요</h2>
          <p class="empty__b">
            다른 키워드로 검색하거나<br class="empty__br" />
            아래 인기 검색어를 둘러보세요.
          </p>
          <div class="empty__chips">
            <button
              v-for="p in POPULAR_KEYWORDS.slice(0, 5)"
              :key="p"
              type="button"
              class="chip__main chip__main--standalone"
              @click="chipSearch(p)"
            >
              {{ p }}
            </button>
          </div>
          <RouterLink to="/products" class="empty__btn">상품 목록으로</RouterLink>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
.page {
  max-width: 720px;
  margin: 0 auto;
  min-height: 100vh;
}

/* sticky search bar */
.bar-wrap {
  position: sticky;
  top: 0;
  z-index: 20;
  background: var(--rekit-bg);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
}
.bar__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  color: var(--rekit-ink);
  text-decoration: none;
  flex-shrink: 0;
}
.bar__back:hover {
  background: var(--rekit-surface-muted);
}
.bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  height: 44px;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 12px;
  transition: border-color 0.12s, box-shadow 0.12s;
}
.bar:focus-within {
  border-color: var(--rekit-ink);
  box-shadow: 0 0 0 3px rgba(26, 26, 23, 0.06);
}
.bar__icon {
  color: var(--rekit-ink-subtle);
  flex-shrink: 0;
}
.bar input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--rekit-ink);
  min-width: 0;
  font-family: inherit;
}
.bar input::placeholder {
  color: var(--rekit-ink-placeholder);
}
.bar input::-webkit-search-cancel-button {
  display: none;
}
.bar__clear {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: var(--rekit-border-strong);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.bar__clear:hover {
  background: var(--rekit-ink-muted);
}

.body {
  padding: 8px 16px 32px;
}

@media (min-width: 768px) {
  .bar-wrap {
    padding: 16px 24px;
  }
  .body {
    padding: 16px 24px 56px;
  }
}

/* shared block */
.block {
  margin-bottom: 32px;
}
.block__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.block__head h2,
.block__title {
  margin: 0;
  font-size: 14.5px;
  font-weight: 800;
  letter-spacing: -0.02em;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.block__date {
  font-size: 11.5px;
  color: var(--rekit-ink-subtle);
  font-family: var(--rekit-font-mono);
}
.link {
  font-size: 12px;
  font-weight: 600;
  color: var(--rekit-ink-muted);
  padding: 4px 8px;
  border-radius: 6px;
}
.link:hover {
  color: var(--rekit-ink);
  background: var(--rekit-surface-muted);
}

/* recent search chips */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chip {
  display: inline-flex;
  align-items: stretch;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 999px;
  overflow: hidden;
}
.chip__main {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--rekit-ink-muted);
  letter-spacing: -0.01em;
}
.chip__main:hover {
  color: var(--rekit-ink);
  background: var(--rekit-surface-muted);
}
.chip__main svg {
  color: var(--rekit-ink-subtle);
}
.chip__main--standalone {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 999px;
}
.chip__x {
  width: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-left: 1px solid var(--rekit-border);
  color: var(--rekit-ink-subtle);
}
.chip__x:hover {
  background: var(--rekit-surface-muted);
  color: var(--rekit-ink);
}

/* popular */
.popular {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px;
}
@media (min-width: 480px) {
  .popular {
    grid-template-columns: 1fr 1fr;
    column-gap: 24px;
  }
}
.popular__item button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--rekit-ink);
  text-align: left;
  border-radius: 8px;
}
.popular__item button:hover {
  background: var(--rekit-surface-muted);
}
.popular__rank {
  font-family: var(--rekit-font-mono);
  font-size: 13px;
  font-weight: 800;
  color: var(--rekit-ink-subtle);
  width: 18px;
  text-align: center;
}
.popular__rank--top {
  color: var(--rekit-accent-deep);
}
.popular__term {
  flex: 1;
  letter-spacing: -0.015em;
}

/* category grid */
.catgrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.catgrid__item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px 8px;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--rekit-ink);
  text-decoration: none;
  letter-spacing: -0.015em;
}
.catgrid__item:hover {
  border-color: var(--rekit-ink);
  background: var(--rekit-surface-muted);
}

/* results */
.meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 4px 4px 14px;
  border-bottom: 1px solid var(--rekit-border);
  margin-bottom: 16px;
  font-size: 13px;
  color: var(--rekit-ink-muted);
}
.meta b {
  color: var(--rekit-ink);
  font-weight: 700;
}
.meta__count {
  font-size: 12px;
  color: var(--rekit-ink-subtle);
  font-family: var(--rekit-font-mono);
}

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
  margin: 16px 0 0;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.empty__b {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--rekit-ink-muted);
  line-height: 1.6;
}
.empty__br {
  display: none;
}
@media (min-width: 480px) {
  .empty__br {
    display: inline;
  }
}
.empty__chips {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}
.empty__btn {
  display: inline-block;
  margin-top: 24px;
  padding: 12px 22px;
  background: var(--rekit-ink);
  color: #fff;
  border-radius: 12px;
  font-weight: 700;
  font-size: 13.5px;
  text-decoration: none;
}
</style>
