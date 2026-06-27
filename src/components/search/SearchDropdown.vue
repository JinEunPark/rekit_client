<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import IconBase from '@/components/ds/IconBase.vue'
import ProductTile from '@/components/ds/ProductTile.vue'
import { won } from '@/design/tokens'
import { POPULAR_KEYWORDS, useSearchHistory } from '@/composables/useSearchHistory'
import { listProducts } from '@/api/catalog'
import { toProduct } from '@/views/products/mappers'
import { useCategoryStore } from '@/stores/categories'
import type { Product } from '@/data/products'

const router = useRouter()
const route = useRoute()
const categoryStore = useCategoryStore()
const { recents, add, remove, clearAll } = useSearchHistory()

const q = ref('')
const open = ref(false)
const wrapperEl = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)
const results = ref<Product[]>([])
let searchTimer: ReturnType<typeof setTimeout> | null = null

const showResults = computed(() => q.value.trim().length > 0)

watch(q, (val) => {
  if (searchTimer) clearTimeout(searchTimer)
  if (!val.trim()) { results.value = []; return }
  searchTimer = setTimeout(async () => {
    try {
      const [res] = await Promise.all([listProducts({ q: val.trim(), size: 5 }), categoryStore.load()])
      results.value = res.items.map(toProduct)
    } catch {
      results.value = []
    }
  }, 200)
})

function focus() {
  open.value = true
}

function clearQuery() {
  q.value = ''
  inputEl.value?.focus()
}

function close() {
  open.value = false
}

function submit() {
  const t = q.value.trim()
  if (!t) return
  add(t)
  router.push(`/products?q=${encodeURIComponent(t)}`)
  q.value = ''
  close()
}

function pickKeyword(term: string) {
  q.value = term
  add(term)
  router.push(`/products?q=${encodeURIComponent(term)}`)
  q.value = ''
  close()
}

function pickResult(id: string) {
  if (q.value.trim()) add(q.value.trim())
  router.push(`/products/${id}`)
  q.value = ''
  close()
}

function onClickOutside(e: MouseEvent) {
  if (!open.value) return
  if (!wrapperEl.value?.contains(e.target as Node)) close()
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) {
    close()
    inputEl.value?.blur()
  }
}

// close dropdown on route change (in case keyword push happens elsewhere)
watch(() => route.fullPath, () => close())

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
  document.addEventListener('keydown', onKey)
})
onUnmounted(() => {
  document.removeEventListener('mousedown', onClickOutside)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="wrapperEl" class="sd" :class="{ 'sd--open': open }">
    <form class="sd__bar" @submit.prevent="submit">
      <IconBase name="search" :size="18" class="sd__icon" />
      <input
        ref="inputEl"
        v-model="q"
        type="search"
        placeholder="모델명, 브랜드 검색"
        autocomplete="off"
        @focus="focus"
      />
      <button
        v-if="q"
        type="button"
        class="sd__clear"
        aria-label="지우기"
        @click="clearQuery"
      >
        <IconBase name="close" :size="14" :stroke="2.2" />
      </button>
    </form>

    <Transition name="panel">
      <div v-if="open" class="sd__panel">
        <!-- ============ NO QUERY ============ -->
        <template v-if="!showResults">
          <section v-if="recents.length > 0" class="sec">
            <header class="sec__head">
              <h3>최근 검색어</h3>
              <button type="button" class="sec__action" @click="clearAll(true)">모두 삭제</button>
            </header>
            <div class="chips">
              <div v-for="r in recents" :key="r" class="chip">
                <button type="button" class="chip__main" @click="pickKeyword(r)">
                  <IconBase name="refresh" :size="11" />
                  {{ r }}
                </button>
                <button
                  type="button"
                  class="chip__x"
                  aria-label="삭제"
                  @click="remove(r)"
                >
                  <IconBase name="close" :size="10" :stroke="2.2" />
                </button>
              </div>
            </div>
          </section>

          <section class="sec">
            <header class="sec__head">
              <h3>
                <IconBase name="chart" :size="13" />
                인기 검색어
              </h3>
            </header>
            <ol class="popular">
              <li v-for="(p, i) in POPULAR_KEYWORDS" :key="p">
                <button type="button" @click="pickKeyword(p)">
                  <span class="rank" :class="{ 'rank--top': i < 3 }">{{ i + 1 }}</span>
                  <span class="term">{{ p }}</span>
                </button>
              </li>
            </ol>
          </section>
        </template>

        <!-- ============ HAS QUERY ============ -->
        <template v-else>
          <section class="sec">
            <header class="sec__head">
              <h3>관련 상품 <span class="sec__count">{{ results.length }}개</span></h3>
            </header>
            <ul v-if="results.length > 0" class="results">
              <li v-for="r in results" :key="r.id">
                <button type="button" class="result" @click="pickResult(r.id)">
                  <div class="result__thumb">
                    <ProductTile
                      :kind="r.kind"
                      :tone="r.tone"
                      ratio="1/1"
                      radius="8px"
                      :show-label="false"
                    />
                  </div>
                  <div class="result__body">
                    <div class="result__brand">{{ r.brand }} · {{ r.year }}</div>
                    <div class="result__title">{{ r.title }}</div>
                  </div>
                  <span class="result__price">{{ won(r.price) }}</span>
                </button>
              </li>
            </ul>
            <div v-else class="noresult">
              <IconBase name="info" :size="14" />
              <span><b>"{{ q }}"</b> 검색 결과가 없어요</span>
            </div>
          </section>
          <button v-if="results.length > 0" type="button" class="sd__all" @click="submit">
            <span><b>"{{ q }}"</b> 전체 결과 보기</span>
            <IconBase name="arrowRight" :size="14" />
          </button>
        </template>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.sd {
  position: relative;
  width: 100%;
}

.sd__bar {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 44px;
  padding: 0 16px;
  background: var(--rekit-bg);
  border: 1px solid var(--rekit-border);
  border-radius: 14px;
  transition: border-color 0.12s, box-shadow 0.12s, background 0.12s;
}
.sd--open .sd__bar,
.sd__bar:focus-within {
  background: var(--rekit-surface);
  border-color: var(--rekit-ink);
  box-shadow: 0 0 0 3px rgba(26, 26, 23, 0.06);
}
.sd__icon {
  color: var(--rekit-ink-subtle);
  flex-shrink: 0;
}
.sd__bar input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--rekit-ink);
  min-width: 0;
  font-family: inherit;
}
.sd__bar input::placeholder {
  color: var(--rekit-ink-placeholder);
}
.sd__bar input::-webkit-search-cancel-button {
  display: none;
}
.sd__clear {
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
.sd__clear:hover {
  background: var(--rekit-ink-muted);
}

/* dropdown panel */
.sd__panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 60;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(20, 20, 15, 0.08), 0 12px 40px rgba(20, 20, 15, 0.06);
  max-height: 70vh;
  overflow-y: auto;
  padding: 14px 4px;
}

.sec {
  padding: 6px 12px 12px;
}
.sec__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 4px 10px;
}
.sec__head h3 {
  margin: 0;
  font-size: 12.5px;
  font-weight: 800;
  letter-spacing: -0.015em;
  color: var(--rekit-ink);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.sec__count {
  margin-left: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--rekit-ink-subtle);
  font-family: var(--rekit-font-mono);
}
.sec__action {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--rekit-ink-muted);
  padding: 4px 8px;
  border-radius: 6px;
}
.sec__action:hover {
  color: var(--rekit-ink);
  background: var(--rekit-surface-muted);
}

/* recent chips */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.chip {
  display: inline-flex;
  align-items: stretch;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 999px;
  overflow: hidden;
  font-size: 12px;
}
.chip__main {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
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
.chip__x {
  width: 24px;
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
  grid-template-columns: 1fr 1fr;
  column-gap: 8px;
}
.popular li button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--rekit-ink);
  text-align: left;
  border-radius: 6px;
  letter-spacing: -0.015em;
}
.popular li button:hover {
  background: var(--rekit-surface-muted);
}
.rank {
  font-family: var(--rekit-font-mono);
  font-size: 12px;
  font-weight: 800;
  color: var(--rekit-ink-subtle);
  width: 16px;
  text-align: center;
  flex-shrink: 0;
}
.rank--top {
  color: var(--rekit-accent-deep);
}

/* live results */
.results {
  list-style: none;
  padding: 0;
  margin: 0;
}
.result {
  width: 100%;
  display: grid;
  grid-template-columns: 44px 1fr auto;
  gap: 12px;
  padding: 8px;
  border-radius: 10px;
  text-align: left;
}
.result:hover {
  background: var(--rekit-surface-muted);
}
.result__thumb {
  width: 44px;
}
.result__body {
  min-width: 0;
}
.result__brand {
  font-size: 11px;
  color: var(--rekit-ink-subtle);
  font-weight: 600;
}
.result__title {
  margin-top: 2px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.015em;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.result__price {
  align-self: center;
  font-size: 13.5px;
  font-weight: 800;
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.noresult {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  font-size: 13px;
  color: var(--rekit-ink-muted);
}
.noresult svg {
  color: var(--rekit-ink-subtle);
}
.noresult b {
  color: var(--rekit-ink);
}

.sd__all {
  width: calc(100% - 24px);
  margin: 4px 12px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  background: var(--rekit-surface-muted);
  color: var(--rekit-ink);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.015em;
}
.sd__all:hover {
  background: var(--rekit-ink);
  color: #fff;
}
.sd__all b {
  color: var(--rekit-accent-deep);
}
.sd__all:hover b {
  color: var(--rekit-accent);
}

/* transition */
.panel-enter-active,
.panel-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}
.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
