<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import IconBase from '@/components/ds/IconBase.vue'
import RekitLogo from '@/components/ds/RekitLogo.vue'
import Button from '@/components/ds/Button.vue'
import { useAuthStore } from '@/stores/auth'
import { buildAuthorizeUrl, type OAuthProvider } from '@/config/oauth'
import { checkLoginId as apiCheckLoginId, signIn as apiSignIn, signUp as apiSignUp } from '@/api/auth'
import { ApiError } from '@/api/client'

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

async function checkLoginId() {
  if (!loginIdValid.value || loginIdCheck.value === 'checking') return
  loginIdCheck.value = 'checking'
  try {
    const result = await apiCheckLoginId(loginId.value.trim())
    loginIdCheck.value = result.available ? 'available' : 'taken'
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) {
      loginIdCheck.value = 'taken'
    } else {
      loginIdCheck.value = 'idle'
      console.error('check-login-id 실패:', err)
    }
  }
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

const submitting = ref(false)
const errorMessage = ref('')

async function submit(e: Event) {
  e.preventDefault()
  if (!canSubmit.value || submitting.value) return
  submitting.value = true
  errorMessage.value = ''
  try {
    const trimmedLoginId = loginId.value.trim()
    await apiSignUp({
      loginId: trimmedLoginId,
      username: username.value.trim(),
      password: password.value,
      email: email.value.trim(),
      agreedTerms: agreeTerms.value,
      agreedPrivacy: agreePrivacy.value,
      agreedMarketing: agreeMarketing.value,
    })
    // 백엔드 sign-up 은 token 을 반환하지 않음 → 동일 자격증명으로 즉시 로그인.
    const tokens = await apiSignIn({
      loginId: trimmedLoginId,
      password: password.value,
      remember: true,
    })
    auth.setSession(tokens.accessToken, {
      loginId: trimmedLoginId,
      username: username.value.trim(),
      email: email.value.trim() || undefined,
    })
    void auth.fetchMe()
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.replace(redirect)
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.code === 'USERNAME_TAKEN' || err.code === 'LOGIN_ID_TAKEN') {
        errorMessage.value = '이미 사용 중인 아이디예요.'
        loginIdCheck.value = 'taken'
      } else if (err.code === 'EMAIL_TAKEN') {
        errorMessage.value = '이미 가입된 이메일이에요.'
      } else {
        errorMessage.value = `${err.message} (${err.code})`
      }
    } else {
      errorMessage.value = err instanceof Error ? err.message : '가입에 실패했어요.'
    }
  } finally {
    submitting.value = false
  }
}

function startSocialLogin(provider: OAuthProvider) {
  try {
    window.location.href = buildAuthorizeUrl(provider)
  } catch (err) {
    console.error(err)
    alert(err instanceof Error ? err.message : '소셜 로그인을 시작할 수 없습니다.')
  }
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

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        <Button type="submit" variant="accent" size="lg" full :disabled="!canSubmit || submitting">
          {{ submitting ? '가입 중…' : '가입하고 시작하기' }}
        </Button>

        <div class="auth__alt">
          이미 계정이 있으신가요?
          <RouterLink to="/auth/sign-in">로그인</RouterLink>
        </div>
      </form>

      <div class="divider"><span>간편 가입</span></div>

      <div class="socials">
        <button type="button" class="social social--kakao" @click="startSocialLogin('kakao')">
          <svg
            class="social__logo"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fill="#3b1e1e"
              d="M12 3.5C6.477 3.5 2 7.04 2 11.41c0 2.81 1.86 5.27 4.65 6.66-.2.74-.74 2.74-.85 3.16-.13.52.19.51.4.37.17-.11 2.66-1.81 3.74-2.55.68.1 1.37.16 2.06.16 5.523 0 10-3.54 10-7.91S17.523 3.5 12 3.5z"
            />
          </svg>
          카카오로 가입
        </button>
        <button type="button" class="social social--naver" @click="startSocialLogin('naver')">
          <svg
            class="social__logo"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fill="#fff"
              d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727z"
            />
          </svg>
          네이버로 가입
        </button>
        <button type="button" class="social social--google" @click="startSocialLogin('google')">
          <svg
            class="social__logo"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
            />
          </svg>
          Google로 가입
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

.error {
  margin: 0;
  padding: 10px 14px;
  background: #fde7e7;
  color: #c0392b;
  border-radius: 10px;
  font-size: 13px;
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
.social--google {
  background: #fff;
  color: #1f1f1f;
  border: 1px solid var(--rekit-border);
}
.social__logo {
  width: 18px;
  height: 18px;
  display: block;
  flex-shrink: 0;
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
