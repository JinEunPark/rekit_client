<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import IconBase from '@/components/ds/IconBase.vue'
import RekitLogo from '@/components/ds/RekitLogo.vue'
import Button from '@/components/ds/Button.vue'
import { useAuthStore } from '@/stores/auth'
import { buildAuthorizeUrl, type OAuthProvider } from '@/config/oauth'
import { signIn } from '@/api/auth'
import { ApiError } from '@/api/client'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const loginId = ref('')
const password = ref('')
const showPassword = ref(false)
const remember = ref(true)
const loginIdFocused = ref(false)
const passwordFocused = ref(false)

const submitting = ref(false)
const errorMessage = ref('')

const canSubmit = computed(
  () =>
    !submitting.value && loginId.value.trim().length >= 4 && password.value.length >= 6,
)

async function submit(e: Event) {
  e.preventDefault()
  if (!canSubmit.value) return
  submitting.value = true
  errorMessage.value = ''
  try {
    const result = await signIn({
      loginId: loginId.value.trim(),
      password: password.value,
      remember: remember.value,
    })
    auth.setSession(result.accessToken, { loginId: loginId.value.trim() })
    void auth.fetchMe()
    if (result.mustChangePassword) {
      router.replace('/my/password?required=1')
      return
    }
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.replace(redirect)
  } catch (err) {
    if (err instanceof ApiError) {
      errorMessage.value =
        err.code === 'INVALID_CREDENTIALS'
          ? '아이디 또는 비밀번호가 올바르지 않아요.'
          : `${err.message} (${err.code})`
    } else {
      errorMessage.value = err instanceof Error ? err.message : '로그인에 실패했어요.'
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
        <h1>다시 살아나는 가전,<br />새로운 주인을 기다려요</h1>
        <p>아이디로 로그인하고 바로 시작하세요</p>
      </header>

      <form class="auth__form" @submit="submit">
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
              placeholder="아이디"
              @focus="loginIdFocused = true"
              @blur="loginIdFocused = false"
            />
          </div>
        </label>

        <label class="field" :class="{ 'field--focus': passwordFocused }">
          <span class="field__label">비밀번호</span>
          <div class="field__row">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="비밀번호"
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
        </label>

        <div class="auth__row">
          <label class="check">
            <input v-model="remember" type="checkbox" />
            <span class="check__box" :class="{ 'check__box--on': remember }">
              <IconBase name="check" :size="11" :stroke="2.5" />
            </span>
            로그인 상태 유지
          </label>
          <div class="links">
            <RouterLink to="/auth/find-id">아이디 찾기</RouterLink>
            <span class="links__sep" />
            <RouterLink to="/auth/find-password">비밀번호 찾기</RouterLink>
          </div>
        </div>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        <Button type="submit" variant="accent" size="lg" full :disabled="!canSubmit">
          {{ submitting ? '로그인 중…' : '로그인' }}
        </Button>

        <div class="auth__alt">
          아직 회원이 아니신가요?
          <RouterLink to="/auth/sign-up">회원가입</RouterLink>
        </div>
      </form>

      <div class="divider"><span>간편 로그인</span></div>

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
          카카오로 로그인
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
          네이버로 로그인
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
          Google로 로그인
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
  line-height: 1.35;
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
.field__action--ghost {
  background: transparent;
  color: var(--rekit-ink-muted);
  font-weight: 600;
  padding: 0 6px;
}
.field__action--ghost:hover {
  color: var(--rekit-ink);
}

.error {
  margin: 0;
  padding: 10px 14px;
  background: #fde7e7;
  color: #c0392b;
  border-radius: 10px;
  font-size: 13px;
}

/* row under password */
.auth__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 4px;
  margin-bottom: 4px;
}

.check {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--rekit-ink-muted);
  cursor: pointer;
}
.check input[type='checkbox'] {
  display: none;
}
.check__box {
  width: 18px;
  height: 18px;
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

.links {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--rekit-ink-muted);
}
.links a {
  color: inherit;
  text-decoration: none;
  font-weight: 500;
}
.links a:hover {
  color: var(--rekit-ink);
}
.links__sep {
  width: 1px;
  height: 11px;
  background: var(--rekit-border-strong);
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
    padding: 24px;
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
