<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AdminShell from '@/components/admin/AdminShell.vue'
import Button from '@/components/ds/Button.vue'
import Badge from '@/components/ds/Badge.vue'
import IconBase from '@/components/ds/IconBase.vue'

type Grade = 'A' | 'B' | 'C'
type Visibility = 'public' | 'private' | 'scheduled'

const title = ref('삼성 비스포크 4도어 냉장고 RF85B9000AP')
const brand = ref('삼성전자')
const model = ref('RF85B9000AP')
const category = ref('냉장고')
const subCategory = ref('4도어')
const year = ref('2022년')
const size = ref('856L · 912 × 1853 × 716 mm')

const grade = ref<Grade>('A')
const operation = ref(0) // 0=정상, 1=부분이상, 2=미작동
const damage = ref(1) // 0=없음, 1=경미, 2=있음
const stateDesc = ref(
  '좌측 도어 하단에 1cm 가량의 미세 스크래치 1개. 내부 선반·서랍 모두 정상. 제빙기 동작 확인 완료. 도어 패킹 양호.',
)

const original = ref('3,890,000')
const price = ref('1,290,000')
const stock = ref('1')
const shippingMethod = ref('전문 설치 배송')
const shippingFee = ref('40,000')
const installArea = ref('수도권 전 지역')

const visibility = ref<Visibility>('public')

const grades: { g: Grade; label: string; desc: string; color: string; bg: string }[] = [
  { g: 'A', label: '상급', desc: '외관 거의 새것\n동작 완벽', color: 'var(--rekit-accent)', bg: 'var(--rekit-accent-soft)' },
  { g: 'B', label: '중급', desc: '사용 흔적 약간\n동작 정상', color: '#D4A23A', bg: '#F8F0DC' },
  { g: 'C', label: '하급', desc: '흠집/얼룩 다수\n동작 정상', color: '#C97A3F', bg: '#F8E8DA' },
]

const operationOpts = ['정상 동작', '부분 이상', '미작동']
const damageOpts = ['없음', '경미', '있음']

const images: { label: string | null; primary?: boolean; warn?: boolean; filled: boolean }[] = [
  { label: '정면', primary: true, filled: true },
  { label: '측면', filled: true },
  { label: '내부', filled: true },
  { label: '흠집부위', filled: true, warn: true },
  { label: null, filled: false },
]

const visibilityOpts: { id: Visibility; label: string }[] = [
  { id: 'public', label: '판매중 (즉시 공개)' },
  { id: 'private', label: '비공개 (임시 저장)' },
  { id: 'scheduled', label: '예약 공개' },
]

const checklist = computed(() => [
  { t: '기본 정보 입력', done: !!title.value && !!brand.value && !!model.value },
  { t: '상태 등급 선택', done: !!grade.value },
  { t: '이미지 4장 이상', done: images.filter((i) => i.filled).length >= 4 },
  { t: '판매가 입력', done: !!price.value.trim() },
  { t: '배송 정보 입력', done: false },
])

const discountPct = computed(() => {
  const o = Number(original.value.replace(/[^0-9]/g, ''))
  const p = Number(price.value.replace(/[^0-9]/g, ''))
  if (!o || !p) return 0
  return Math.round((1 - p / o) * 100)
})
</script>

<template>
  <AdminShell active="products" title="상품 등록" subtitle="새 폐업 가전 상품을 등록합니다">
    <template #header-right>
      <Button variant="secondary" size="sm">임시저장</Button>
      <RouterLink to="/admin/products" class="cancel-link">
        <Button variant="secondary" size="sm">취소</Button>
      </RouterLink>
      <Button variant="primary" size="sm" leading-icon="check">등록하기</Button>
    </template>

    <div class="crumb">
      <RouterLink to="/admin/products" class="crumb__back">상품 관리</RouterLink>
      <IconBase name="chevronRight" :size="14" />
      <span class="crumb__here">상품 등록</span>
    </div>

    <div class="layout">
      <div class="form">
        <section class="card">
          <header class="card__head">
            <h3 class="card__title">기본 정보</h3>
          </header>
          <p class="card__sub">구매자에게 보여질 상품의 핵심 정보입니다</p>
          <div class="grid2">
            <div class="field field--full">
              <label class="field__label">상품명 <span class="req">*</span></label>
              <input v-model="title" class="input input--filled" type="text" />
            </div>
            <div class="field">
              <label class="field__label">브랜드 <span class="req">*</span></label>
              <button type="button" class="input input--filled select">
                <span>{{ brand }}</span>
                <IconBase name="chevronDown" :size="16" />
              </button>
            </div>
            <div class="field">
              <label class="field__label">모델명 <span class="req">*</span></label>
              <input v-model="model" class="input input--filled" type="text" />
            </div>
            <div class="field">
              <label class="field__label">카테고리 <span class="req">*</span></label>
              <div class="row2">
                <button type="button" class="input input--filled select">
                  <span>{{ category }}</span>
                  <IconBase name="chevronDown" :size="16" />
                </button>
                <button type="button" class="input input--filled select">
                  <span>{{ subCategory }}</span>
                  <IconBase name="chevronDown" :size="16" />
                </button>
              </div>
            </div>
            <div class="field">
              <label class="field__label">제조연도</label>
              <button type="button" class="input input--filled select">
                <span>{{ year }}</span>
                <IconBase name="chevronDown" :size="16" />
              </button>
            </div>
            <div class="field">
              <label class="field__label">용량 / 사이즈</label>
              <input v-model="size" class="input" type="text" placeholder="예: 856L / 912 × 1853 × 716 mm" />
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
              :style="grade === g.g ? { borderColor: g.color, background: g.bg } : null"
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
                >
                  {{ v }}
                </button>
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
                >
                  {{ v }}
                </button>
              </div>
            </div>
            <div class="field field--full">
              <label class="field__label">상태 상세 설명</label>
              <textarea v-model="stateDesc" class="input textarea" />
            </div>
          </div>
        </section>

        <section class="card">
          <header class="card__head">
            <h3 class="card__title">상품 이미지</h3>
          </header>
          <p class="card__sub">정면·측면·흠집 부위를 모두 포함하여 최소 4장 이상 등록해 주세요</p>
          <div class="imgs">
            <div
              v-for="(img, i) in images"
              :key="i"
              class="img"
              :class="{ 'img--filled': img.filled, 'img--empty': !img.filled }"
            >
              <template v-if="img.filled">
                <span v-if="img.primary" class="img__primary">대표</span>
                <span class="img__label" :class="{ 'img__label--warn': img.warn }">{{ img.label }}</span>
                <button type="button" class="img__remove" aria-label="이미지 삭제">
                  <IconBase name="close" :size="12" :stroke="2.5" />
                </button>
                <IconBase name="box" :size="36" />
              </template>
              <template v-else>
                <IconBase name="plus" :size="22" />
                <span>이미지 추가</span>
              </template>
            </div>
          </div>
          <div class="hint">
            <IconBase name="info" :size="14" />
            <span>최소 4장 / 최대 10장 · 5MB 이하 · JPG, PNG · 첫 번째 이미지가 대표 이미지로 노출됩니다</span>
          </div>
        </section>

        <section class="card">
          <header class="card__head">
            <h3 class="card__title">가격 정보</h3>
          </header>
          <p class="card__sub">원가 대비 할인율은 자동으로 계산됩니다</p>
          <div class="grid2">
            <div class="field">
              <label class="field__label">원가 (신품 정가)</label>
              <div class="input-suffix">
                <input v-model="original" class="input" type="text" />
                <span class="input-suffix__s">원</span>
              </div>
              <div class="field__hint">제조사 권장 소비자가 기준</div>
            </div>
            <div class="field">
              <label class="field__label">판매가 <span class="req">*</span></label>
              <div class="input-suffix">
                <input v-model="price" class="input input--filled" type="text" />
                <span class="input-suffix__s">원</span>
              </div>
              <div class="field__hint">VAT 포함 · 배송비 별도</div>
            </div>
          </div>
          <div class="discount">
            <div class="discount__l">
              <IconBase name="leaf" :size="16" />
              <span>할인율 자동 계산</span>
            </div>
            <span class="discount__v">{{ discountPct }}% 할인</span>
          </div>
        </section>

        <section class="card">
          <header class="card__head">
            <h3 class="card__title">배송 / A/S 정보</h3>
          </header>
          <div class="grid2">
            <div class="field">
              <label class="field__label">재고 수량 <span class="req">*</span></label>
              <input v-model="stock" class="input input--filled" type="text" />
            </div>
            <div class="field">
              <label class="field__label">배송 방식</label>
              <button type="button" class="input input--filled select">
                <span>{{ shippingMethod }}</span>
                <IconBase name="chevronDown" :size="16" />
              </button>
            </div>
            <div class="field">
              <label class="field__label">배송비</label>
              <div class="input-suffix">
                <input v-model="shippingFee" class="input" type="text" />
                <span class="input-suffix__s">원</span>
              </div>
            </div>
            <div class="field">
              <label class="field__label">설치 가능 지역</label>
              <button type="button" class="input select">
                <span>{{ installArea }}</span>
                <IconBase name="chevronDown" :size="16" />
              </button>
            </div>
          </div>
          <div class="callout">
            <IconBase name="warning" :size="16" />
            <div>
              <div class="callout__t">A/S 불가 안내가 자동 표시됩니다</div>
              <div class="callout__b">폐업 매장에서 입고된 가전 특성상 제조사 A/S는 적용되지 않습니다. 단, 배송 후 7일 내 동작 불량 발견 시 무상 교환·환불됩니다.</div>
            </div>
          </div>
        </section>
      </div>

      <aside class="aside">
        <div class="card preview">
          <div class="preview__kicker">미리보기</div>
          <div class="preview__img">
            <IconBase name="box" :size="48" />
          </div>
          <div class="preview__row">
            <Badge tone="accent" size="sm">{{ grade }} {{ grades.find((g) => g.g === grade)!.label }}</Badge>
            <span class="preview__meta">{{ year }} · {{ size.split(' ')[0] }}</span>
          </div>
          <div class="preview__title">{{ title }}</div>
          <div class="preview__price">
            <span class="preview__pct">{{ discountPct }}%</span>
            <span class="preview__amt">{{ price }}원</span>
          </div>
          <div class="preview__o">{{ original }}원</div>
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
          <div class="checklist__kicker">등록 체크리스트</div>
          <div class="checklist__list">
            <div v-for="c in checklist" :key="c.t" class="checklist__row">
              <span class="checklist__box" :class="{ 'checklist__box--done': c.done }">
                <IconBase v-if="c.done" name="check" :size="11" :stroke="3" />
              </span>
              <span class="checklist__t" :class="{ 'checklist__t--muted': !c.done }">{{ c.t }}</span>
            </div>
          </div>
          <Button variant="accent" size="md" full leading-icon="check">등록하기</Button>
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
.crumb__back {
  color: var(--rekit-ink-muted);
  text-decoration: none;
}
.crumb__back:hover { color: var(--rekit-ink); }
.crumb__here {
  color: var(--rekit-ink);
  font-weight: 600;
}

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
.card__head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 4px;
}
.card__title {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
}
.card__sub {
  font-size: 12.5px;
  color: var(--rekit-ink-subtle);
  margin: 0 0 20px;
}
.card__small-title {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 12px;
}

.grid2 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
.row2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
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
.req {
  color: var(--rekit-danger);
  font-weight: 700;
  font-size: 11px;
}
.field__hint {
  font-size: 11.5px;
  color: var(--rekit-ink-subtle);
  margin-top: 6px;
}

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
}
.input:focus {
  border-color: var(--rekit-ink);
  box-shadow: 0 0 0 3px rgba(26, 26, 23, 0.06);
}
.input--filled {
  border: 1.5px solid var(--rekit-ink);
}
.select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  cursor: pointer;
}
.select svg { color: var(--rekit-ink-subtle); }
.textarea {
  min-height: 80px;
  resize: vertical;
  line-height: 1.55;
}

.input-suffix { position: relative; }
.input-suffix .input { padding-right: 36px; }
.input-suffix__s {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
  color: var(--rekit-ink-subtle);
  font-weight: 500;
  pointer-events: none;
}

.grades {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}
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
  top: 10px;
  right: 10px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.grade__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.grade__letter {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.04em;
}
.grade__label {
  font-size: 13px;
  font-weight: 700;
}
.grade__desc {
  font-size: 11.5px;
  color: var(--rekit-ink-muted);
  white-space: pre-line;
  line-height: 1.45;
}

.seg {
  display: flex;
  gap: 6px;
}
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
.seg__opt--sel {
  background: var(--rekit-ink);
  color: #fff;
  border-color: transparent;
}

.imgs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.img {
  aspect-ratio: 1;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.img--filled {
  background: linear-gradient(135deg, var(--rekit-surface-muted), var(--rekit-border));
  border: 1px solid var(--rekit-border);
  color: var(--rekit-ink-placeholder);
}
.img--empty {
  background: var(--rekit-surface);
  border: 1.5px dashed var(--rekit-border-strong);
  color: var(--rekit-ink-subtle);
  flex-direction: column;
  gap: 6px;
}
.img--empty span { font-size: 11.5px; font-weight: 600; }
.img__primary {
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
.img__label {
  position: absolute;
  bottom: 8px;
  left: 8px;
  padding: 3px 7px;
  background: rgba(255, 255, 255, 0.92);
  font-size: 10.5px;
  font-weight: 600;
  border-radius: 4px;
  color: var(--rekit-ink);
}
.img__label--warn { color: var(--rekit-danger); }
.img__remove {
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

.hint {
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
.hint svg { color: var(--rekit-ink-subtle); flex-shrink: 0; }

.discount {
  margin-top: 14px;
  padding: 14px 18px;
  background: var(--rekit-accent-soft);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.discount__l {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--rekit-accent-ink);
  font-weight: 600;
}
.discount__l svg { color: var(--rekit-accent-deep); }
.discount__v {
  font-size: 18px;
  font-weight: 800;
  color: var(--rekit-accent-deep);
  letter-spacing: -0.02em;
}

.callout {
  margin-top: 16px;
  padding: 14px 16px;
  background: #FFF8E8;
  border-radius: 12px;
  border: 1px solid #F0D898;
  display: flex;
  gap: 10px;
}
.callout svg { color: #B5762A; flex-shrink: 0; margin-top: 2px; }
.callout__t {
  font-size: 13px;
  font-weight: 700;
  color: #7A5018;
  margin-bottom: 4px;
}
.callout__b {
  font-size: 12px;
  color: #8B5E1F;
  line-height: 1.55;
}

.preview__kicker {
  font-size: 12px;
  font-weight: 700;
  color: var(--rekit-ink-subtle);
  letter-spacing: 0.04em;
  margin-bottom: 10px;
}
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
.preview__row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}
.preview__meta {
  font-size: 11px;
  color: var(--rekit-ink-subtle);
}
.preview__title {
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.45;
  margin-bottom: 10px;
}
.preview__price {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.preview__pct {
  font-size: 13px;
  font-weight: 700;
  color: var(--rekit-accent-deep);
}
.preview__amt {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.preview__o {
  font-size: 11.5px;
  color: var(--rekit-ink-subtle);
  text-decoration: line-through;
  margin-top: 2px;
}

.radio-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.radio {
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  text-align: left;
}
.radio__dot {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #fff;
  border: 1.5px solid var(--rekit-border-strong);
  flex-shrink: 0;
}
.radio__dot--sel {
  border: 5px solid var(--rekit-ink);
}
.radio__l {
  font-size: 13px;
  color: var(--rekit-ink-muted);
  font-weight: 500;
}
.radio__l--sel {
  color: var(--rekit-ink);
  font-weight: 600;
}

.checklist {
  background: var(--rekit-ink);
  border-radius: 16px;
  padding: 18px;
  color: #fff;
}
.checklist__kicker {
  font-size: 11.5px;
  opacity: 0.6;
  font-weight: 600;
  margin-bottom: 6px;
  letter-spacing: 0.04em;
}
.checklist__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
  margin-bottom: 16px;
}
.checklist__row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.checklist__box {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.checklist__box--done {
  background: var(--rekit-accent);
  border-color: transparent;
  color: #fff;
}
.checklist__t {
  font-size: 12.5px;
}
.checklist__t--muted { opacity: 0.55; }

@media (min-width: 768px) {
  .grid2 { grid-template-columns: 1fr 1fr; }
  .field--full { grid-column: 1 / -1; }
  .imgs { grid-template-columns: repeat(5, 1fr); }
  .card { padding: 28px; }
}

@media (min-width: 1024px) {
  .layout {
    grid-template-columns: 1fr 320px;
    gap: 20px;
  }
  .aside {
    position: sticky;
    top: 88px;
  }
}
</style>
