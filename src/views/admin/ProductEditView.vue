<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AdminShell from '@/components/admin/AdminShell.vue'
import ProductImageEditor, { type EditableImage } from '@/components/admin/ProductImageEditor.vue'
import Button from '@/components/ds/Button.vue'
import Badge from '@/components/ds/Badge.vue'
import IconBase from '@/components/ds/IconBase.vue'
import { getAdminProduct, updateAdminProduct } from '@/api/admin/products'
import { ApiError } from '@/api/client'
import {
  CATEGORY_OPTS,
  GRADE_DEFS as grades,
  OPERATION_OPTS as operationOpts,
  DAMAGE_OPTS as damageOpts,
  VISIBILITY_OPTS as visibilityOpts,
  parseNum,
  calcDiscountPct,
} from './productFormHelpers'
import type { ConditionGrade } from './productFormHelpers'

const route = useRoute()
const router = useRouter()

const productId = computed(() => Number(route.params.id))

const loading = ref(true)
const saving = ref(false)
const loadError = ref('')
const saveError = ref('')

const title = ref('')
const brand = ref('')
const model = ref('')
const category = ref('REFRIGERATOR')
const year = ref('')
const size = ref('')
const grade = ref<ConditionGrade>('A')
const operation = ref(0)
const damage = ref(0)
const stateDesc = ref('')
const original = ref('')
const price = ref('')
const stock = ref('1')
const visibility = ref<'public' | 'private'>('public')
const images = ref<EditableImage[]>([])

const discountPct = computed(() => calcDiscountPct(original.value, price.value))

const isReady = computed(() => title.value.trim() && price.value.trim() && parseNum(stock.value) > 0)

onMounted(async () => {
  try {
    const p = await getAdminProduct(productId.value)
    title.value = p.title
    brand.value = p.brand ?? ''
    model.value = p.model_name ?? ''
    category.value = p.category
    year.value = p.year_estimate ? String(p.year_estimate) : ''
    const dims = [p.weight_kg ? `${p.weight_kg}kg` : '', p.width_cm ? `${p.width_cm}×${p.depth_cm}×${p.height_cm}cm` : ''].filter(Boolean).join(' / ')
    size.value = dims
    grade.value = p.condition_grade
    operation.value = p.warranty_works ? 0 : 1
    stateDesc.value = p.description ?? ''
    price.value = p.price ? p.price.toLocaleString('ko-KR') : ''
    original.value = p.original_price ? p.original_price.toLocaleString('ko-KR') : ''
    stock.value = String(p.stock)
    visibility.value = p.status === 'ACTIVE' ? 'public' : 'private'
    images.value = [...p.images]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => ({ id: img.id, url: img.url, label: img.label }))
  } catch (err) {
    loadError.value = err instanceof ApiError ? err.message : '상품 정보를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
})

async function handleSave() {
  if (!title.value.trim() || !price.value.trim()) {
    saveError.value = '상품명과 판매가는 필수입니다.'
    return
  }
  saving.value = true
  saveError.value = ''
  try {
    await updateAdminProduct(productId.value, {
      title: title.value.trim(),
      description: stateDesc.value.trim() || undefined,
      category: category.value,
      brand: brand.value.trim() || null,
      model_name: model.value.trim() || null,
      condition_grade: grade.value,
      warranty_works: operation.value === 0,
      price: parseNum(price.value),
      original_price: parseNum(original.value) || null,
      stock: parseNum(stock.value) || 1,
      status: visibility.value === 'public' ? 'ACTIVE' : 'INACTIVE',
    })
    router.push('/admin/products')
  } catch (err) {
    saveError.value = err instanceof ApiError ? err.message : '저장 중 오류가 발생했습니다.'
    saving.value = false
  }
}
</script>

<template>
  <AdminShell active="products" title="상품 수정" subtitle="상품 정보를 수정합니다">
    <template #header-right>
      <RouterLink to="/admin/products" class="cancel-link">
        <Button variant="secondary" size="sm">취소</Button>
      </RouterLink>
      <Button variant="primary" size="sm" leading-icon="check" :disabled="saving || !isReady" @click="handleSave">
        {{ saving ? '저장 중…' : '수정 저장' }}
      </Button>
    </template>

    <div class="crumb">
      <RouterLink to="/admin/products" class="crumb__back">상품 관리</RouterLink>
      <IconBase name="chevronRight" :size="14" />
      <span class="crumb__here">상품 수정</span>
    </div>

    <div v-if="loadError" class="load-error">
      <IconBase name="warning" :size="16" />
      {{ loadError }}
    </div>

    <div v-else-if="loading" class="loading">불러오는 중…</div>

    <div v-else class="layout">
      <div class="form">
        <section class="card">
          <header class="card__head"><h3 class="card__title">기본 정보</h3></header>
          <p class="card__sub">구매자에게 보여질 상품의 핵심 정보입니다</p>
          <div class="grid2">
            <div class="field field--full">
              <label class="field__label">상품명 <span class="req">*</span></label>
              <input v-model="title" class="input input--filled" type="text" />
            </div>
            <div class="field">
              <label class="field__label">브랜드</label>
              <input v-model="brand" class="input" type="text" />
            </div>
            <div class="field">
              <label class="field__label">모델명</label>
              <input v-model="model" class="input" type="text" />
            </div>
            <div class="field">
              <label class="field__label">카테고리 <span class="req">*</span></label>
              <select v-model="category" class="input input--filled">
                <option v-for="c in CATEGORY_OPTS" :key="c.id" :value="c.id">{{ c.label }}</option>
              </select>
            </div>
            <div class="field">
              <label class="field__label">제조연도</label>
              <input v-model="year" class="input" type="text" placeholder="예: 2022" />
            </div>
            <div class="field">
              <label class="field__label">용량 / 사이즈</label>
              <input v-model="size" class="input" type="text" />
            </div>
          </div>
        </section>

        <section class="card">
          <header class="card__head">
            <h3 class="card__title">상태 등급</h3>
            <Badge tone="accent" size="sm">동작 보증 필수</Badge>
          </header>
          <p class="card__sub">등급은 구매자에게 그대로 노출됩니다. 신중하게 평가해 주세요</p>
          <div class="grades">
            <button
              v-for="g in grades"
              :key="g.g"
              type="button"
              class="grade"
              :class="{ 'grade--sel': grade === g.g }"
              :style="grade === g.g ? { borderColor: g.color, background: g.bg } : undefined"
              @click="grade = g.g"
            >
              <span v-if="grade === g.g" class="grade__check" :style="{ background: g.color }">
                <IconBase name="check" :size="11" :stroke="3" />
              </span>
              <div class="grade__head">
                <span class="grade__letter" :style="{ color: g.color }">{{ g.g }}</span>
                <span class="grade__label">{{ g.label }}</span>
              </div>
              <div class="grade__desc">{{ g.desc }}</div>
            </button>
          </div>
          <div class="grid2">
            <div class="field">
              <label class="field__label">동작 상태 <span class="req">*</span></label>
              <div class="seg">
                <button
                  v-for="(v, i) in operationOpts"
                  :key="v"
                  type="button"
                  class="seg__opt"
                  :class="{ 'seg__opt--sel': operation === i }"
                  @click="operation = i"
                >{{ v }}</button>
              </div>
            </div>
            <div class="field">
              <label class="field__label">흠집 / 손상</label>
              <div class="seg">
                <button
                  v-for="(v, i) in damageOpts"
                  :key="v"
                  type="button"
                  class="seg__opt"
                  :class="{ 'seg__opt--sel': damage === i }"
                  @click="damage = i"
                >{{ v }}</button>
              </div>
            </div>
            <div class="field field--full">
              <label class="field__label">상태 상세 설명</label>
              <textarea v-model="stateDesc" class="input textarea" />
            </div>
          </div>
        </section>

        <section class="card">
          <header class="card__head"><h3 class="card__title">상품 이미지</h3></header>
          <p class="card__sub">정면·측면·흠집 부위를 모두 포함하여 최소 2장 이상 등록해 주세요</p>
          <ProductImageEditor
            v-model:images="images"
            :product-id="productId"
            :disabled="saving"
            :min="2"
            @error="(msg) => (saveError = msg)"
          />
        </section>

        <section class="card">
          <header class="card__head"><h3 class="card__title">가격 정보</h3></header>
          <p class="card__sub">원가 대비 할인율은 자동으로 계산됩니다</p>
          <div class="grid2">
            <div class="field">
              <label class="field__label">원가 (신품 정가)</label>
              <div class="input-suffix">
                <input v-model="original" class="input" type="text" />
                <span class="input-suffix__s">원</span>
              </div>
            </div>
            <div class="field">
              <label class="field__label">판매가 <span class="req">*</span></label>
              <div class="input-suffix">
                <input v-model="price" class="input input--filled" type="text" />
                <span class="input-suffix__s">원</span>
              </div>
            </div>
          </div>
          <div v-if="discountPct > 0" class="discount">
            <div class="discount__l">
              <IconBase name="leaf" :size="16" />
              <span>할인율 자동 계산</span>
            </div>
            <span class="discount__v">{{ discountPct }}% 할인</span>
          </div>
        </section>

        <section class="card">
          <header class="card__head"><h3 class="card__title">배송 / 재고</h3></header>
          <div class="grid2">
            <div class="field">
              <label class="field__label">재고 수량 <span class="req">*</span></label>
              <input v-model="stock" class="input input--filled" type="text" />
            </div>
          </div>
        </section>
      </div>

      <aside class="aside">
        <div class="card preview">
          <div class="preview__kicker">미리보기</div>
          <div class="preview__img"><IconBase name="box" :size="48" /></div>
          <div class="preview__row">
            <Badge tone="accent" size="sm">{{ grade }} {{ grades.find((g) => g.g === grade)!.label }}</Badge>
          </div>
          <div class="preview__title">{{ title || '(상품명 입력)' }}</div>
          <div class="preview__price">
            <span v-if="discountPct > 0" class="preview__pct">{{ discountPct }}%</span>
            <span class="preview__amt">{{ price || '—' }}원</span>
          </div>
          <div v-if="original" class="preview__o">{{ original }}원</div>
        </div>

        <div class="card">
          <div class="card__small-title">공개 설정</div>
          <div class="radio-list">
            <button
              v-for="o in visibilityOpts"
              :key="o.id"
              type="button"
              class="radio"
              @click="visibility = o.id"
            >
              <span class="radio__dot" :class="{ 'radio__dot--sel': visibility === o.id }" />
              <span class="radio__l" :class="{ 'radio__l--sel': visibility === o.id }">{{ o.label }}</span>
            </button>
          </div>
        </div>

        <div class="checklist">
          <div class="checklist__kicker">수정 완료 후 저장</div>
          <div v-if="saveError" class="save-error">{{ saveError }}</div>
          <Button variant="accent" size="md" full leading-icon="check" :disabled="saving || !isReady" @click="handleSave">
            {{ saving ? '저장 중…' : '수정 저장' }}
          </Button>
        </div>
      </aside>
    </div>
  </AdminShell>
</template>

<style scoped>
.cancel-link { display: inline-flex; text-decoration: none; }
.crumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 12.5px;
  color: var(--rekit-ink-subtle);
}
.crumb__back { color: var(--rekit-ink-muted); text-decoration: none; }
.crumb__back:hover { color: var(--rekit-ink); }
.crumb__here { color: var(--rekit-ink); font-weight: 600; }

.load-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 18px;
  background: #FFF0F0;
  border: 1px solid var(--rekit-danger);
  border-radius: 12px;
  color: var(--rekit-danger);
  font-size: 13px;
}
.loading { padding: 60px; text-align: center; color: var(--rekit-ink-subtle); font-size: 14px; }

.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  align-items: start;
}
.form { display: flex; flex-direction: column; gap: 16px; }
.aside { display: flex; flex-direction: column; gap: 12px; }

.card {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  padding: 20px;
}
.card__head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 4px; }
.card__title { font-size: 16px; font-weight: 700; letter-spacing: -0.02em; margin: 0; }
.card__sub { font-size: 12.5px; color: var(--rekit-ink-subtle); margin: 0 0 20px; }
.card__small-title { font-size: 13px; font-weight: 700; margin-bottom: 12px; }

.grid2 { display: grid; grid-template-columns: 1fr; gap: 16px; }
.field { min-width: 0; }
.field__label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--rekit-ink);
  margin-bottom: 8px;
}
.req { color: var(--rekit-danger); font-weight: 700; font-size: 11px; }

.input {
  width: 100%;
  padding: 11px 14px;
  font-size: 13.5px;
  border: 1px solid var(--rekit-border);
  border-radius: 12px;
  background: var(--rekit-surface);
  color: var(--rekit-ink);
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
}
.input:focus { border-color: var(--rekit-ink); box-shadow: 0 0 0 3px rgba(26,26,23,0.06); }
.input--filled { border: 1.5px solid var(--rekit-ink); }
.textarea { min-height: 80px; resize: vertical; line-height: 1.55; }

.input-suffix { position: relative; }
.input-suffix .input { padding-right: 36px; }
.input-suffix__s {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
  color: var(--rekit-ink-subtle);
  pointer-events: none;
}

.grades { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
.grade {
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--rekit-border);
  background: var(--rekit-surface);
  cursor: pointer;
  position: relative;
  text-align: left;
}
.grade--sel { border-width: 2px; padding: 15px; }
.grade__check {
  position: absolute;
  top: 10px; right: 10px;
  width: 18px; height: 18px;
  border-radius: 999px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.grade__head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.grade__letter { font-size: 22px; font-weight: 800; letter-spacing: -0.04em; }
.grade__label { font-size: 13px; font-weight: 700; }
.grade__desc { font-size: 11.5px; color: var(--rekit-ink-muted); white-space: pre-line; line-height: 1.45; }

.seg { display: flex; gap: 6px; }
.seg__opt {
  flex: 1;
  text-align: center;
  padding: 10px 8px;
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 600;
  background: var(--rekit-surface);
  color: var(--rekit-ink-muted);
  border: 1px solid var(--rekit-border);
  cursor: pointer;
}
.seg__opt--sel { background: var(--rekit-ink); color: #fff; border-color: transparent; }

.discount {
  margin-top: 14px;
  padding: 14px 18px;
  background: var(--rekit-accent-soft);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.discount__l { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--rekit-accent-ink); font-weight: 600; }
.discount__l svg { color: var(--rekit-accent-deep); }
.discount__v { font-size: 18px; font-weight: 800; color: var(--rekit-accent-deep); letter-spacing: -0.02em; }

.preview__kicker { font-size: 12px; font-weight: 700; color: var(--rekit-ink-subtle); letter-spacing: 0.04em; margin-bottom: 10px; }
.preview__img {
  aspect-ratio: 1;
  background: linear-gradient(135deg, var(--rekit-surface-muted), var(--rekit-border));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: var(--rekit-ink-placeholder);
}
.preview__row { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.preview__title { font-size: 13.5px; font-weight: 600; line-height: 1.45; margin-bottom: 10px; }
.preview__price { display: flex; align-items: baseline; gap: 6px; }
.preview__pct { font-size: 13px; font-weight: 700; color: var(--rekit-accent-deep); }
.preview__amt { font-size: 18px; font-weight: 800; letter-spacing: -0.02em; }
.preview__o { font-size: 11.5px; color: var(--rekit-ink-subtle); text-decoration: line-through; margin-top: 2px; }

.radio-list { display: flex; flex-direction: column; gap: 10px; }
.radio { display: flex; align-items: center; gap: 10px; background: none; border: 0; padding: 0; cursor: pointer; text-align: left; }
.radio__dot { width: 18px; height: 18px; border-radius: 999px; background: #fff; border: 1.5px solid var(--rekit-border-strong); flex-shrink: 0; }
.radio__dot--sel { border: 5px solid var(--rekit-ink); }
.radio__l { font-size: 13px; color: var(--rekit-ink-muted); font-weight: 500; }
.radio__l--sel { color: var(--rekit-ink); font-weight: 600; }

.checklist {
  background: var(--rekit-ink);
  border-radius: 16px;
  padding: 18px;
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.checklist__kicker { font-size: 11.5px; opacity: 0.6; font-weight: 600; letter-spacing: 0.04em; }
.save-error { font-size: 12px; color: #FFB3B3; }

@media (min-width: 768px) {
  .grid2 { grid-template-columns: 1fr 1fr; }
  .field--full { grid-column: 1 / -1; }
  .card { padding: 28px; }
}
@media (min-width: 1024px) {
  .layout { grid-template-columns: 1fr 320px; gap: 20px; }
  .aside {
    position: sticky;
    top: 88px;
    /* 사이드바가 뷰포트보다 길면 sticky 로 아래쪽이 가려져 스크롤로 닿을 수
       없다 → 넘칠 때만 내부 스크롤을 허용한다. */
    max-height: calc(100vh - 88px - 24px);
    overflow-y: auto;
    overscroll-behavior: contain;
  }
}
</style>
