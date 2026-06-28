<script setup lang="ts">
import { computed, reactive, ref, type ComponentPublicInstance } from 'vue'
import { RouterLink } from 'vue-router'
import AppModal from '@/components/ds/AppModal.vue'
import Badge from '@/components/ds/Badge.vue'
import Button from '@/components/ds/Button.vue'
import IconBase from '@/components/ds/IconBase.vue'
import { useAddressStore, type Address } from '@/stores/addresses'
import { useAuthStore } from '@/stores/auth'
import { useKakaoPostcode } from '@/composables/useKakaoPostcode'

const addresses = useAddressStore()
const auth = useAuthStore()
const { searching: searchingZip, sdkLoading: zipLoading, container: zipContainer, openSearch } = useKakaoPostcode()

interface FormState {
  label: string
  recipient: string
  phone: string
  zipcode: string
  address: string
  addressDetail: string
  memo: string
  isDefault: boolean
}

function blankForm(): FormState {
  return {
    label: '',
    recipient: auth.user?.username ?? '',
    phone: auth.user?.phone ?? '',
    zipcode: '',
    address: '',
    addressDetail: '',
    memo: '',
    isDefault: addresses.count === 0,
  }
}

const form = reactive<FormState>(blankForm())
const editingId = ref<string | null>(null)
const open = ref(false)
const submitted = ref(false)
const saving = ref(false)
const saveError = ref('')

const phoneValid = computed(() => /^\d{2,3}-?\d{3,4}-?\d{4}$/.test(form.phone.trim()))
const isValid = computed(
  () =>
    form.recipient.trim() &&
    phoneValid.value &&
    form.zipcode.trim() &&
    form.address.trim(),
)

function openModal() {
  submitted.value = false
  saveError.value = ''
  searchingZip.value = false
  open.value = true
}

function openNew() {
  Object.assign(form, blankForm())
  editingId.value = null
  openModal()
}

function openEdit(a: Address) {
  Object.assign(form, {
    label: a.label ?? '',
    recipient: a.recipient,
    phone: a.phone,
    zipcode: a.zipcode,
    address: a.address,
    addressDetail: a.addressDetail,
    memo: a.memo ?? '',
    isDefault: a.isDefault,
  })
  editingId.value = a.id
  openModal()
}

async function save() {
  submitted.value = true
  if (!isValid.value) return
  saving.value = true
  saveError.value = ''
  const payload = {
    label: form.label.trim() || undefined,
    recipient: form.recipient.trim(),
    phone: form.phone.trim(),
    zipcode: form.zipcode.trim(),
    address: form.address.trim(),
    addressDetail: form.addressDetail.trim(),
    memo: form.memo.trim() || undefined,
    isDefault: form.isDefault,
  }
  try {
    if (editingId.value) {
      await addresses.update(editingId.value, payload)
    } else {
      await addresses.add(payload)
    }
    open.value = false
  } catch (e) {
    saveError.value = e instanceof Error ? e.message : '저장에 실패했어요. 다시 시도해 주세요.'
  } finally {
    saving.value = false
  }
}

async function removeAddr(id: string) {
  if (!window.confirm('이 배송지를 삭제할까요?')) return
  await addresses.remove(id)
}

function setDefault(id: string) {
  void addresses.setDefault(id)
}

function bindZipContainer(el: Element | ComponentPublicInstance | null) {
  zipContainer.value = el instanceof HTMLElement ? el : null
}

async function openZipSearch() {
  await openSearch((result) => {
    form.zipcode = result.zipcode
    form.address = result.address
  })
}
</script>

<template>
  <!-- Guest fallback -->
  <div v-if="!auth.user" class="guest">
    <div class="guest__icon">
      <IconBase name="map" :size="36" :stroke="1.5" />
    </div>
    <h1 class="guest__t">로그인하면 배송지를 관리할 수 있어요</h1>
    <RouterLink to="/auth/sign-in?redirect=/my/addresses" class="guest__btn">로그인</RouterLink>
  </div>

  <div v-else class="page">
    <header class="page__head">
      <div>
        <h1 class="page__title">배송지 관리</h1>
        <p class="page__sub">자주 쓰는 배송지를 미리 저장해두면 결제가 빨라요.</p>
      </div>
      <Button variant="primary" size="sm" leading-icon="plus" @click="openNew">
        새 배송지
      </Button>
    </header>

    <!-- Empty -->
    <div v-if="addresses.count === 0" class="empty">
      <div class="empty__icon">
        <IconBase name="map" :size="32" :stroke="1.5" />
      </div>
      <h2 class="empty__t">저장된 배송지가 없어요</h2>
      <p class="empty__b">새 배송지를 추가하면 결제 시 자동으로 채워져요.</p>
      <button type="button" class="empty__btn" @click="openNew">배송지 추가</button>
    </div>

    <!-- List -->
    <ul v-else class="list">
      <li v-for="a in addresses.addresses" :key="a.id" class="card">
        <div class="card__head">
          <div class="card__name">
            {{ a.recipient }}
            <Badge v-if="a.isDefault" tone="accent" size="xs">기본배송지</Badge>
            <span v-if="a.label" class="card__label">{{ a.label }}</span>
          </div>
          <div class="card__phone">{{ a.phone }}</div>
        </div>
        <div class="card__line">
          ({{ a.zipcode }}) {{ a.address }} {{ a.addressDetail }}
        </div>
        <div v-if="a.memo" class="card__memo">메모 · {{ a.memo }}</div>
        <div class="card__actions">
          <button v-if="!a.isDefault" type="button" class="link" @click="setDefault(a.id)">
            기본으로
          </button>
          <button type="button" class="link" @click="openEdit(a)">수정</button>
          <button type="button" class="link link--danger" @click="removeAddr(a.id)">삭제</button>
        </div>
      </li>
    </ul>

    <!-- Add/edit modal -->
    <AppModal :open="open" :title="editingId ? '배송지 수정' : '새 배송지'" prevent-overlay-close @close="open = false">
      <form class="modal__form" novalidate @submit.prevent="save">
        <label class="field">
          <span class="field__label">별칭 (선택)</span>
          <input v-model="form.label" type="text" placeholder="예: 집, 회사" />
        </label>
        <div class="row">
          <label class="field" :class="{ 'field--err': submitted && !form.recipient.trim() }">
            <span class="field__label">받는 사람</span>
            <input v-model="form.recipient" type="text" placeholder="이름" />
          </label>
          <label class="field" :class="{ 'field--err': submitted && !phoneValid }">
            <span class="field__label">휴대폰</span>
            <input v-model="form.phone" type="tel" placeholder="010-1234-5678" />
          </label>
        </div>
        <div v-if="searchingZip" class="zip-embed">
          <div class="zip-embed__frame-wrap">
            <div :ref="bindZipContainer" class="zip-embed__frame" />
            <div v-if="zipLoading" class="zip-embed__loading">
              <span class="zip-embed__spinner" />
            </div>
          </div>
          <button type="button" class="zip-embed__cancel" @click="searchingZip = false">취소</button>
        </div>
        <template v-else>
          <div class="row row--zip">
            <label class="field" :class="{ 'field--err': submitted && !form.zipcode.trim() }">
              <span class="field__label">우편번호</span>
              <input v-model="form.zipcode" type="text" inputmode="numeric" placeholder="04101" />
            </label>
            <button type="button" class="zip-btn" @click="openZipSearch">주소 검색</button>
          </div>
          <label class="field" :class="{ 'field--err': submitted && !form.address.trim() }">
            <span class="field__label">주소</span>
            <input v-model="form.address" type="text" placeholder="도로명 주소" />
          </label>
        </template>
        <label class="field">
          <span class="field__label">상세 주소</span>
          <input v-model="form.addressDetail" type="text" placeholder="동·호수 등 (선택)" />
        </label>
        <label class="field">
          <span class="field__label">메모</span>
          <input v-model="form.memo" type="text" placeholder="예: 부재 시 경비실 (선택)" />
        </label>
        <label class="check">
          <input v-model="form.isDefault" type="checkbox" />
          <span class="check__box" :class="{ 'check__box--on': form.isDefault }">
            <IconBase name="check" :size="13" :stroke="2.5" />
          </span>
          기본 배송지로 설정
        </label>
        <p v-if="saveError" class="save-error">{{ saveError }}</p>
        <div class="modal__cta">
          <Button variant="secondary" size="lg" :style="{ flex: '1' }" :disabled="saving" @click="open = false">취소</Button>
          <Button type="submit" variant="accent" size="lg" :style="{ flex: '1.3' }" :disabled="saving">
            {{ saving ? '저장 중…' : '저장' }}
          </Button>
        </div>
      </form>
    </AppModal>
  </div>
</template>

<style scoped>
.page {
  max-width: 720px;
  margin: 0 auto;
  padding: 16px 16px 32px;
}
@media (min-width: 768px) {
  .page {
    padding: 32px 24px 56px;
  }
}

.page__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}
.page__title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.025em;
}
.page__sub {
  margin: 4px 0 0;
  font-size: 12.5px;
  color: var(--rekit-ink-muted);
}
@media (min-width: 768px) {
  .page__title {
    font-size: 28px;
  }
}

/* list */
.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.card {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  padding: 16px 18px;
}
.card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.card__name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14.5px;
  font-weight: 700;
  letter-spacing: -0.015em;
}
.card__label {
  margin-left: 4px;
  font-size: 11.5px;
  color: var(--rekit-ink-subtle);
  font-weight: 600;
}
.card__phone {
  font-size: 12.5px;
  color: var(--rekit-ink-muted);
}
.card__line {
  margin-top: 6px;
  font-size: 13px;
  color: var(--rekit-ink-muted);
  line-height: 1.55;
}
.card__memo {
  margin-top: 6px;
  font-size: 11.5px;
  color: var(--rekit-ink-subtle);
}
.card__actions {
  margin-top: 12px;
  display: flex;
  gap: 4px;
  border-top: 1px solid var(--rekit-border);
  padding-top: 12px;
}
.link {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--rekit-ink-muted);
  border-radius: 6px;
}
.link:hover {
  color: var(--rekit-ink);
  background: var(--rekit-surface-muted);
}
.link--danger:hover {
  color: var(--rekit-danger);
}

/* empty */
.empty {
  text-align: center;
  padding: 64px 20px;
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
}
.empty__btn {
  margin-top: 20px;
  padding: 12px 22px;
  background: var(--rekit-ink);
  color: #fff;
  border-radius: 12px;
  font-weight: 700;
  font-size: 13.5px;
}

.modal__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.save-error {
  margin: 0;
  padding: 10px 12px;
  background: #fff0f0;
  border-radius: 8px;
  font-size: 12.5px;
  color: var(--rekit-danger);
}
.modal__cta {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

/* shared field */
.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.field__label {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--rekit-ink-muted);
}
.field input {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  color: var(--rekit-ink);
  outline: none;
  transition: border-color 0.12s, box-shadow 0.12s;
}
.field input:focus {
  border-color: var(--rekit-ink);
  box-shadow: 0 0 0 3px rgba(26, 26, 23, 0.06);
}
.field input::placeholder {
  color: var(--rekit-ink-placeholder);
}
.field--err input {
  border-color: var(--rekit-danger);
}

.row {
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr 1fr;
}
.row--zip {
  grid-template-columns: 1fr auto;
  align-items: end;
}
.zip-btn {
  height: 48px;
  padding: 0 16px;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--rekit-ink-muted);
  white-space: nowrap;
  transition: background 0.12s, color 0.12s;
}
.zip-btn:hover {
  background: var(--rekit-surface-muted);
  color: var(--rekit-ink);
}
.zip-embed {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.zip-embed__frame-wrap {
  position: relative;
  height: 400px;
  border: 1px solid var(--rekit-border);
  border-radius: 10px;
  overflow: hidden;
}
.zip-embed__frame {
  width: 100%;
  height: 100%;
}
.zip-embed__loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--rekit-surface);
}
.zip-embed__spinner {
  display: block;
  width: 32px;
  height: 32px;
  border: 3px solid var(--rekit-border);
  border-top-color: var(--rekit-accent);
  border-radius: 50%;
  animation: zip-spin 0.7s linear infinite;
}
@keyframes zip-spin {
  to { transform: rotate(360deg); }
}
.zip-embed__cancel {
  align-self: flex-end;
  padding: 6px 14px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--rekit-ink-muted);
  border-radius: 6px;
  transition: background 0.1s;
}
.zip-embed__cancel:hover {
  background: var(--rekit-surface-muted);
  color: var(--rekit-ink);
}

.check {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 13px;
  cursor: pointer;
}
.check input {
  display: none;
}
.check__box {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: var(--rekit-surface);
  border: 1.5px solid var(--rekit-border-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}
.check__box--on {
  background: var(--rekit-ink);
  border-color: var(--rekit-ink);
  color: #fff;
}

/* guest */
.guest {
  max-width: 380px;
  margin: 80px auto;
  text-align: center;
  padding: 0 20px;
}
.guest__icon {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  background: var(--rekit-accent-soft);
  color: var(--rekit-accent-deep);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}
.guest__t {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.025em;
}
.guest__btn {
  display: inline-block;
  margin-top: 20px;
  padding: 14px 28px;
  background: var(--rekit-accent);
  color: #fff;
  border-radius: 12px;
  font-weight: 700;
  text-decoration: none;
}

</style>
