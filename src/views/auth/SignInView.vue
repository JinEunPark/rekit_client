<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import IconBase from '@/components/ds/IconBase.vue'
import RekitLogo from '@/components/ds/RekitLogo.vue'
import Button from '@/components/ds/Button.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const remember = ref(true)
const usernameFocused = ref(false)
const passwordFocused = ref(false)

const canSubmit = computed(() => username.value.trim().length >= 4 && password.value.length >= 6)

function submit(e: Event) {
  e.preventDefault()
  if (!canSubmit.value) return
  auth.login({ username: username.value.trim() })
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
        <h1>다시 살아나는 가전,<br />새로운 주인을 기다려요</h1>
        <p>아이디로 로그인하고 바로 시작하세요</p>
      </header>

      <form class="auth__form" @submit="submit">
        <label class="field" :class="{ 'field--focus': usernameFocused }">
          <span class="field__label">아이디</span>
          <div class="field__row">
            <input
              v-model="username"
              type="text"
              autocomplete="username"
              autocapitalize="off"
              autocorrect="off"
              spellcheck="false"
              placeholder="아이디"
              @focus="usernameFocused = true"
              @blur="usernameFocused = false"
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

        <Button type="submit" variant="accent" size="lg" full :disabled="!canSubmit">
          로그인
        </Button>

        <div class="auth__alt">
          아직 회원이 아니신가요?
          <RouterLink to="/auth/sign-up">회원가입</RouterLink>
        </div>
      </form>

      <div class="divider"><span>간편 로그인</span></div>

      <div class="socials">
        <button type="button" class="social social--kakao">
          <span class="social__dot social__dot--kakao" />
          카카오로 로그인
        </button>
        <button type="button" class="social social--naver">
          <span class="social__dot social__dot--naver">N</span>
          네이버로 로그인
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
