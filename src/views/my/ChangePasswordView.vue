<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import IconBase from '@/components/ds/IconBase.vue'
import Button from '@/components/ds/Button.vue'
import { useAuthStore } from '@/stores/auth'
import { changePassword } from '@/api/users'
import { ApiError } from '@/api/client'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const currentPassword = ref('')
const newPassword = ref('')
const newPasswordConfirm = ref('')

const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

const submitting = ref(false)
const errorMessage = ref('')
const success = ref(false)

const required = computed(() => route.query.required === '1')

const currentValid = computed(() => currentPassword.value.length >= 1)
const newPolicyValid = computed(
  () =>
    newPassword.value.length >= 8 &&
    /[a-zA-Z]/.test(newPassword.value) &&
    /[0-9]/.test(newPassword.value),
)
const sameAsCurrent = computed(
  () => newPassword.value.length > 0 && newPassword.value === currentPassword.value,
)
const confirmMatch = computed(
  () => newPasswordConfirm.value.length > 0 && newPasswordConfirm.value === newPassword.value,
)

const canSubmit = computed(
  () =>
    !submitting.value &&
    currentValid.value &&
    newPolicyValid.value &&
    !sameAsCurrent.value &&
    confirmMatch.value,
)

async function submit(e: Event) {
  e.preventDefault()
  if (!canSubmit.value) return
  submitting.value = true
  errorMessage.value = ''
  try {
    await changePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    })
    success.value = true
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.code === 'INVALID_CREDENTIALS') {
        errorMessage.value = '현재 비밀번호가 일치하지 않아요.'
      } else if (err.code === 'VALIDATION_ERROR') {
        errorMessage.value = '새 비밀번호가 정책에 맞지 않아요. (영문·숫자 포함 8자 이상)'
      } else {
        errorMessage.value = `${err.message} (${err.code})`
      }
    } else {
      errorMessage.value = err instanceof Error ? err.message : '비밀번호 변경에 실패했어요.'
    }
  } finally {
    submitting.value = false
  }
}

function done() {
  router.replace('/my/profile')
}
</script>

<template>
  <!-- Guest fallback -->
  <div v-if="!auth.user" class="guest">
    <div class="guest__icon">
      <IconBase name="user" :size="36" :stroke="1.5" />
    </div>
    <h1 class="guest__t">로그인이 필요해요</h1>
    <RouterLink to="/auth/sign-in?redirect=/my/password" class="guest__btn">로그인</RouterLink>
  </div>

  <div v-else class="page">
    <header class="page__head">
      <RouterLink to="/my/profile" class="page__back" aria-label="뒤로">
        <IconBase name="chevronLeft" :size="18" />
      </RouterLink>
      <h1 class="page__title">비밀번호 변경</h1>
    </header>

    <!-- Forced change banner -->
    <div v-if="required && !success" class="notice notice--warn">
      <IconBase name="warning" :size="16" />
      <div>
        <div class="notice__t">임시 비밀번호로 로그인하셨어요</div>
        <div class="notice__b">계속 사용하려면 새 비밀번호를 설정해 주세요.</div>
      </div>
    </div>

    <!-- Success -->
    <section v-if="success" class="block block--success">
      <div class="success">
        <div class="success__icon">
          <IconBase name="check" :size="28" :stroke="2.6" />
        </div>
        <div class="success__t">비밀번호가 변경됐어요</div>
        <p class="success__b">새 비밀번호로 다음 로그인부터 사용해 주세요.</p>
        <Button variant="accent" size="lg" full @click="done">내 정보로 돌아가기</Button>
      </div>
    </section>

    <!-- Form -->
    <section v-else class="block">
      <form class="form" @submit="submit">
        <label class="field">
          <span class="field__label">현재 비밀번호</span>
          <div class="field__row">
            <input
              v-model="currentPassword"
              :type="showCurrent ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="현재 비밀번호"
            />
            <button
              type="button"
              class="field__action field__action--ghost"
              @click="showCurrent = !showCurrent"
            >
              {{ showCurrent ? '숨기기' : '표시' }}
            </button>
          </div>
        </label>

        <label class="field">
          <span class="field__label">새 비밀번호</span>
          <div class="field__row">
            <input
              v-model="newPassword"
              :type="showNew ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="영문·숫자 포함 8자 이상"
            />
            <button
              type="button"
              class="field__action field__action--ghost"
              @click="showNew = !showNew"
            >
              {{ showNew ? '숨기기' : '표시' }}
            </button>
          </div>
          <span
            v-if="newPassword.length > 0 && !newPolicyValid"
            class="field__hint field__hint--muted"
          >
            영문과 숫자를 모두 포함해 8자 이상 입력해 주세요
          </span>
          <span
            v-else-if="sameAsCurrent"
            class="field__hint field__hint--err"
          >
            <IconBase name="warning" :size="12" /> 현재 비밀번호와 달라야 해요
          </span>
          <span
            v-else-if="newPolicyValid"
            class="field__hint field__hint--ok"
          >
            <IconBase name="check" :size="12" :stroke="2.4" /> 사용 가능한 비밀번호예요
          </span>
        </label>

        <label class="field">
          <span class="field__label">새 비밀번호 확인</span>
          <div class="field__row">
            <input
              v-model="newPasswordConfirm"
              :type="showConfirm ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="새 비밀번호를 한 번 더 입력"
            />
            <button
              type="button"
              class="field__action field__action--ghost"
              @click="showConfirm = !showConfirm"
            >
              {{ showConfirm ? '숨기기' : '표시' }}
            </button>
          </div>
          <span
            v-if="newPasswordConfirm.length > 0 && confirmMatch"
            class="field__hint field__hint--ok"
          >
            <IconBase name="check" :size="12" :stroke="2.4" /> 비밀번호가 일치해요
          </span>
          <span
            v-else-if="newPasswordConfirm.length > 0 && !confirmMatch"
            class="field__hint field__hint--err"
          >
            <IconBase name="warning" :size="12" /> 비밀번호가 일치하지 않아요
          </span>
        </label>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        <Button type="submit" variant="accent" size="lg" full :disabled="!canSubmit">
          {{ submitting ? '변경 중…' : '비밀번호 변경' }}
        </Button>
      </form>

      <p class="hint">
        <IconBase name="info" :size="13" />
        비밀번호는 영문·숫자 조합 8자 이상이어야 하며, 다른 사이트와 다르게 설정하는 게 좋아요.
      </p>
    </section>
  </div>
</template>

<style scoped>
.page {
  max-width: 720px;
  margin: 0 auto;
  padding: 16px 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
@media (min-width: 768px) {
  .page {
    padding: 32px 24px 56px;
  }
}

.page__head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.page__back {
  width: 36px;
  height: 36px;
  margin-left: -8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: var(--rekit-ink-muted);
  text-decoration: none;
}
.page__back:hover {
  background: var(--rekit-surface-muted);
  color: var(--rekit-ink);
}
.page__title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.025em;
}
@media (min-width: 768px) {
  .page__title {
    font-size: 28px;
  }
}

/* notice */
.notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.5;
}
.notice--warn {
  background: #fef3e5;
  color: #7a4f1a;
}
.notice--warn svg {
  color: #b5762a;
  flex-shrink: 0;
  margin-top: 2px;
}
.notice__t {
  font-weight: 700;
  font-size: 13.5px;
}
.notice__b {
  margin-top: 2px;
  font-size: 12.5px;
  opacity: 0.85;
}

/* block */
.block {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  padding: 22px 20px;
}
.block--success {
  text-align: center;
}

/* form */
.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* field */
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--rekit-ink-muted);
}
.field__row {
  display: flex;
  align-items: stretch;
  gap: 8px;
  padding: 0 14px;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 12px;
  height: 50px;
  transition: border-color 0.12s ease, box-shadow 0.12s ease;
}
.field__row:focus-within {
  border-color: var(--rekit-ink);
  box-shadow: 0 0 0 3px rgba(26, 26, 23, 0.06);
}
.field__row input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14.5px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--rekit-ink);
  min-width: 0;
  font-family: inherit;
}
.field__row input::placeholder {
  color: var(--rekit-ink-placeholder);
}
.field__action {
  background: transparent;
  color: var(--rekit-ink-muted);
  font-weight: 600;
  font-size: 12.5px;
  padding: 0 4px;
  align-self: center;
  white-space: nowrap;
}
.field__action--ghost:hover {
  color: var(--rekit-ink);
}
.field__hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}
.field__hint--ok {
  color: var(--rekit-accent-deep);
}
.field__hint--err {
  color: var(--rekit-danger);
}
.field__hint--muted {
  color: var(--rekit-ink-subtle);
}

/* error banner */
.error {
  margin: 0;
  padding: 10px 14px;
  background: #fde7e7;
  color: #c0392b;
  border-radius: 10px;
  font-size: 13px;
}

/* hint footnote */
.hint {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 18px 0 0;
  padding: 0;
  font-size: 12px;
  color: var(--rekit-ink-subtle);
  line-height: 1.55;
}
.hint svg {
  flex-shrink: 0;
  margin-top: 1px;
}

/* success */
.success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 4px;
}
.success__icon {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: var(--rekit-accent);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}
.success__t {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.025em;
}
.success__b {
  margin: 0 0 18px;
  font-size: 13px;
  color: var(--rekit-ink-muted);
  line-height: 1.55;
}

/* guest */
.guest {
  max-width: 360px;
  margin: 80px auto;
  text-align: center;
  padding: 0 20px;
}
.guest__icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  border-radius: 999px;
  background: var(--rekit-surface-muted);
  color: var(--rekit-ink-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}
.guest__t {
  font-size: 17px;
  font-weight: 700;
  margin: 0 0 18px;
}
.guest__btn {
  display: inline-block;
  padding: 12px 28px;
  background: var(--rekit-ink);
  color: #fff;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  text-decoration: none;
}
</style>
