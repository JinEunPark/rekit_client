<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import IconBase from '@/components/ds/IconBase.vue'
import RekitLogo from '@/components/ds/RekitLogo.vue'
import Button from '@/components/ds/Button.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const loginId = ref('')
const username = ref('')
const password = ref('')
const passwordConfirm = ref('')
const email = ref('')
const showPassword = ref(false)

const loginIdFocused = ref(false)
const usernameFocused = ref(false)
const passwordFocused = ref(false)
const passwordConfirmFocused = ref(false)
const emailFocused = ref(false)

type CheckState = 'idle' | 'checking' | 'available' | 'taken'
const loginIdCheck = ref<CheckState>('idle')

watch(loginId, () => {
  loginIdCheck.value = 'idle'
})

const loginIdValid = computed(() => /^[a-zA-Z0-9_]{4,20}$/.test(loginId.value.trim()))
const usernameValid = computed(() => username.value.trim().length >= 1)
const passwordValid = computed(() => password.value.length >= 8 && /[a-zA-Z]/.test(password.value) && /[0-9]/.test(password.value))
const passwordsMatch = computed(
  () => passwordConfirm.value.length > 0 && passwordConfirm.value === password.value,
)
const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))

const agreeTerms = ref(false)
const agreePrivacy = ref(false)
const agreeMarketing = ref(false)
const requiredAgreed = computed(() => agreeTerms.value && agreePrivacy.value)
const allAgreed = computed(() => requiredAgreed.value && agreeMarketing.value)

function toggleAll() {
  const next = !allAgreed.value
  agreeTerms.value = next
  agreePrivacy.value = next
  agreeMarketing.value = next
}

function checkLoginId() {
  if (!loginIdValid.value) return
  loginIdCheck.value = 'checking'
  // mock — ids containing 'admin/root/test' are taken; everything else is available
  setTimeout(() => {
    loginIdCheck.value = /admin|root|test/i.test(loginId.value) ? 'taken' : 'available'
  }, 500)
}

const canSubmit = computed(
  () =>
    loginIdValid.value &&
    loginIdCheck.value === 'available' &&
    usernameValid.value &&
    passwordValid.value &&
    passwordsMatch.value &&
    emailValid.value &&
    requiredAgreed.value,
)

function submit(e: Event) {
  e.preventDefault()
  if (!canSubmit.value) return
  auth.login({
    loginId: loginId.value.trim(),
    username: username.value.trim(),
    email: email.value.trim() || undefined,
  })
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
  router.replace(redirect)
}
</script>

<template>
  <div class="auth">
    <RouterLink to="/" class="auth__close" aria-label="닫기">
      <IconBase name="close" :size="22" />
    </RouterLink>

    <main class="auth__card">
      <div class="auth__brand">
        <RekitLogo :size="28" />
      </div>

      <header class="auth__head">
        <h1>처음 오셨군요</h1>
        <p>몇 가지만 입력하면 가입이 끝나요</p>
      </header>

      <form class="auth__form" @submit="submit">
        <!-- Login ID -->
        <label class="field" :class="{ 'field--focus': loginIdFocused }">
          <span class="field__label">아이디</span>
          <div class="field__row">
            <input
              v-model="loginId"
              type="text"
              autocomplete="username"
              autocapitalize="off"
              autocorrect="off"
              spellcheck="false"
              placeholder="영문·숫자·_ 4~20자"
              @focus="loginIdFocused = true"
              @blur="loginIdFocused = false"
            />
            <button
              type="button"
              class="field__action"
              :disabled="!loginIdValid || loginIdCheck === 'checking'"
              @click="checkLoginId"
            >
              {{ loginIdCheck === 'checking' ? '확인 중' : '중복확인' }}
            </button>
          </div>
          <span
            v-if="loginIdCheck === 'available'"
            class="field__hint field__hint--ok"
          >
            <IconBase name="check" :size="12" :stroke="2.4" /> 사용 가능한 아이디예요
          </span>
          <span
            v-else-if="loginIdCheck === 'taken'"
            class="field__hint field__hint--err"
          >
            <IconBase name="warning" :size="12" /> 이미 사용 중인 아이디예요
          </span>
          <span
            v-else-if="loginId.length > 0 && !loginIdValid"
            class="field__hint field__hint--muted"
          >
            영문·숫자·_ 조합으로 4~20자 입력해 주세요
          </span>
        </label>

        <!-- Username (display name) -->
        <label class="field" :class="{ 'field--focus': usernameFocused }">
          <span class="field__label">이름</span>
          <div class="field__row">
            <input
              v-model="username"
              type="text"
              autocomplete="name"
              placeholder="화면에 표시될 이름"
              @focus="usernameFocused = true"
              @blur="usernameFocused = false"
            />
          </div>
        </label>

        <!-- Password -->
        <label class="field" :class="{ 'field--focus': passwordFocused }">
          <span class="field__label">비밀번호</span>
          <div class="field__row">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="영문·숫자 포함 8자 이상"
              @focus="passwordFocused = true"
              @blur="passwordFocused = false"
            />
            <button
              type="button"
              class="field__action field__action--ghost"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '숨기기' : '표시' }}
            </button>
          </div>
          <span
            v-if="password.length > 0 && !passwordValid"
            class="field__hint field__hint--muted"
          >
            영문과 숫자를 모두 포함해 8자 이상 입력해 주세요
          </span>
        </label>

        <!-- Password confirm -->
        <label class="field" :class="{ 'field--focus': passwordConfirmFocused }">
          <span class="field__label">비밀번호 확인</span>
          <div class="field__row">
            <input
              v-model="passwordConfirm"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="비밀번호를 한 번 더 입력"
              @focus="passwordConfirmFocused = true"
              @blur="passwordConfirmFocused = false"
            />
          </div>
          <span
            v-if="passwordConfirm.length > 0 && passwordsMatch"
            class="field__hint field__hint--ok"
          >
            <IconBase name="check" :size="12" :stroke="2.4" /> 비밀번호가 일치해요
          </span>
          <span
            v-else-if="passwordConfirm.length > 0 && !passwordsMatch"
            class="field__hint field__hint--err"
          >
            <IconBase name="warning" :size="12" /> 비밀번호가 일치하지 않아요
          </span>
        </label>

        <!-- Email -->
        <label class="field" :class="{ 'field--focus': emailFocused }">
          <span class="field__label">이메일</span>
          <div class="field__row">
            <input
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="비밀번호 찾기 등 본인 확인용"
              @focus="emailFocused = true"
              @blur="emailFocused = false"
            />
          </div>
        </label>

        <!-- Agreements -->
        <fieldset class="agree">
          <label class="agree__row agree__row--all">
            <input type="checkbox" :checked="allAgreed" @change="toggleAll" />
            <span class="agree__check" :class="{ 'agree__check--on': allAgreed }">
              <IconBase name="check" :size="14" :stroke="2.5" />
            </span>
            전체 동의
          </label>
          <div class="agree__group">
            <label class="agree__row">
              <input v-model="agreeTerms" type="checkbox" />
              <span class="agree__check" :class="{ 'agree__check--on': agreeTerms }">
                <IconBase name="check" :size="12" :stroke="2.5" />
              </span>
              <span class="agree__text">
                <span class="agree__req">[필수]</span> 이용약관 동의
              </span>
              <RouterLink to="/legal/terms" class="agree__view">보기</RouterLink>
            </label>
            <label class="agree__row">
              <input v-model="agreePrivacy" type="checkbox" />
              <span class="agree__check" :class="{ 'agree__check--on': agreePrivacy }">
                <IconBase name="check" :size="12" :stroke="2.5" />
              </span>
              <span class="agree__text">
                <span class="agree__req">[필수]</span> 개인정보 수집·이용 동의
              </span>
              <RouterLink to="/legal/privacy" class="agree__view">보기</RouterLink>
            </label>
            <label class="agree__row">
              <input v-model="agreeMarketing" type="checkbox" />
              <span class="agree__check" :class="{ 'agree__check--on': agreeMarketing }">
                <IconBase name="check" :size="12" :stroke="2.5" />
              </span>
              <span class="agree__text">
                <span class="agree__opt">[선택]</span> 마케팅 정보 수신 동의
              </span>
            </label>
          </div>
        </fieldset>

        <Button type="submit" variant="accent" size="lg" full :disabled="!canSubmit">
          가입하고 시작하기
        </Button>

        <div class="auth__alt">
          이미 계정이 있으신가요?
          <RouterLink to="/auth/sign-in">로그인</RouterLink>
        </div>
      </form>

      <div class="divider"><span>간편 가입</span></div>

      <div class="socials">
        <button type="button" class="social social--kakao">
          <span class="social__dot social__dot--kakao" />
          카카오로 가입
        </button>
        <button type="button" class="social social--naver">
          <span class="social__dot social__dot--naver">N</span>
          네이버로 가입
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.auth {
  min-height: 100vh;
  background: var(--rekit-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56px 20px 40px;
  position: relative;
}

.auth__close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: var(--rekit-ink-muted);
  text-decoration: none;
}
.auth__close:hover {
  background: var(--rekit-surface-muted);
  color: var(--rekit-ink);
}

.auth__card {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
}

.auth__brand {
  display: flex;
  justify-content: center;
  margin-bottom: 28px;
}

.auth__head {
  text-align: center;
  margin-bottom: 32px;
}
.auth__head h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.auth__head p {
  margin: 10px 0 0;
  font-size: 13.5px;
  color: var(--rekit-ink-muted);
  line-height: 1.55;
}

.auth__form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* form field */
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
  padding: 0 16px;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 12px;
  height: 54px;
  transition: border-color 0.12s ease, box-shadow 0.12s ease;
}
.field--focus .field__row {
  border-color: var(--rekit-ink);
  box-shadow: 0 0 0 3px rgba(26, 26, 23, 0.06);
}
.field__row input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--rekit-ink);
  min-width: 0;
}
.field__row input::placeholder {
  color: var(--rekit-ink-placeholder);
}
.field__action {
  background: var(--rekit-accent-soft);
  color: var(--rekit-accent-deep);
  border-radius: 8px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 700;
  align-self: center;
  height: 38px;
  white-space: nowrap;
  letter-spacing: -0.01em;
}
.field__action:disabled {
  background: var(--rekit-surface-muted);
  color: var(--rekit-ink-placeholder);
  cursor: not-allowed;
}
.field__action--ghost {
  background: transparent;
  color: var(--rekit-ink-muted);
  font-weight: 600;
  padding: 0 6px;
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

/* agreements */
.agree {
  margin-top: 4px;
  border: none;
  padding: 0;
  background: var(--rekit-surface-muted);
  border-radius: 12px;
}
.agree__row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  font-size: 13px;
  cursor: pointer;
}
.agree__row--all {
  font-weight: 700;
  font-size: 14px;
  border-bottom: 1px solid var(--rekit-border);
}
.agree__row input[type='checkbox'] {
  display: none;
}
.agree__check {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: var(--rekit-surface);
  border: 1.5px solid var(--rekit-border-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  flex-shrink: 0;
}
.agree__check--on {
  background: var(--rekit-accent);
  border-color: var(--rekit-accent);
  color: #fff;
}
.agree__row--all .agree__check {
  width: 24px;
  height: 24px;
}
.agree__group {
  padding: 4px 0 6px;
}
.agree__group .agree__row {
  padding: 8px 14px;
}
.agree__text {
  flex: 1;
  color: var(--rekit-ink-muted);
}
.agree__req {
  color: var(--rekit-ink);
  font-weight: 700;
  margin-right: 2px;
}
.agree__opt {
  color: var(--rekit-ink-subtle);
  font-weight: 600;
  margin-right: 2px;
}
.agree__view {
  color: var(--rekit-ink-subtle);
  font-size: 12px;
  text-decoration: underline;
}

/* alt */
.auth__alt {
  margin-top: 6px;
  text-align: center;
  font-size: 13px;
  color: var(--rekit-ink-muted);
}
.auth__alt a {
  margin-left: 6px;
  font-weight: 700;
  color: var(--rekit-ink);
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* divider */
.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 28px 0 16px;
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--rekit-border);
}
.divider span {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--rekit-ink-subtle);
}

/* socials */
.socials {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.social {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 52px;
  border-radius: 12px;
  font-size: 14.5px;
  font-weight: 700;
  letter-spacing: -0.015em;
}
.social--kakao {
  background: #fee500;
  color: #3b1e1e;
}
.social--naver {
  background: #03c75a;
  color: #fff;
}
.social__dot {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
}
.social__dot--kakao {
  background: #3b1e1e;
}
.social__dot--naver {
  color: #03c75a;
  background: #fff;
}

@media (min-width: 768px) {
  .auth {
    justify-content: center;
    padding: 32px 24px;
  }
  .auth__card {
    background: var(--rekit-surface);
    border: 1px solid var(--rekit-border);
    border-radius: 24px;
    padding: 48px 40px 40px;
    box-shadow: 0 1px 2px rgba(20, 20, 15, 0.04), 0 12px 40px rgba(20, 20, 15, 0.06);
  }
  .auth__head h1 {
    font-size: 24px;
  }
}
</style>
