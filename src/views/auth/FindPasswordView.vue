<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import IconBase from '@/components/ds/IconBase.vue'
import RekitLogo from '@/components/ds/RekitLogo.vue'
import Button from '@/components/ds/Button.vue'

const loginId = ref('')
const email = ref('')
const loginIdFocused = ref(false)
const emailFocused = ref(false)

const loginIdValid = computed(() => /^[a-zA-Z0-9_]{4,20}$/.test(loginId.value.trim()))
const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))
const canSubmit = computed(() => loginIdValid.value && emailValid.value)

const sent = ref(false)

function maskEmail(addr: string): string {
  const [local, domain] = addr.split('@')
  if (!local || !domain) return addr
  const visible = local.slice(0, Math.min(2, local.length))
  return `${visible}***@${domain}`
}

function submit(e: Event) {
  e.preventDefault()
  if (!canSubmit.value) return
  sent.value = true
}

function reset() {
  sent.value = false
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

      <!-- Initial form -->
      <template v-if="!sent">
        <header class="auth__head">
          <h1>비밀번호를 잊어버리셨나요?</h1>
          <p>아이디와 가입 시 등록한 이메일을 입력하면<br />재설정 링크를 보내드려요.</p>
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

          <label class="field" :class="{ 'field--focus': emailFocused }">
            <span class="field__label">가입 이메일</span>
            <div class="field__row">
              <input
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="you@example.com"
                @focus="emailFocused = true"
                @blur="emailFocused = false"
              />
            </div>
          </label>

          <Button type="submit" variant="accent" size="lg" full :disabled="!canSubmit">
            재설정 링크 받기
          </Button>

          <div class="auth__alt">
            아이디가 기억나지 않으신가요?
            <RouterLink to="/auth/find-id">아이디 찾기</RouterLink>
          </div>
        </form>
      </template>

      <!-- Sent state -->
      <template v-else>
        <div class="result">
          <div class="result__icon">
            <IconBase name="mail" :size="32" :stroke="1.5" />
          </div>
          <h1 class="result__title">재설정 링크를 보냈어요</h1>
          <p class="result__sub">
            <b>{{ maskEmail(email) }}</b>로 비밀번호 재설정 링크를 발송했어요.<br />
            5분 이내에 이메일을 확인해 주세요.
          </p>

          <div class="result__notice">
            <IconBase name="info" :size="16" />
            <div>
              메일이 도착하지 않았다면 스팸함을 확인해 보시거나<br />
              잠시 후 다시 시도해 주세요.
            </div>
          </div>

          <div class="result__actions">
            <RouterLink to="/auth/sign-in" class="auth-btn auth-btn--primary">
              로그인으로 돌아가기
            </RouterLink>
            <button type="button" class="auth-btn auth-btn--secondary" @click="reset">
              다시 입력하기
            </button>
          </div>
        </div>
      </template>

      <!-- Bottom link -->
      <div v-if="!sent" class="auth__back-row">
        <RouterLink to="/auth/sign-in" class="auth__back">
          <IconBase name="chevronLeft" :size="14" /> 로그인으로 돌아가기
        </RouterLink>
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
  padding: 0 16px;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 12px;
  height: 54px;
  transition: border-color 0.12s, box-shadow 0.12s;
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

.auth__back-row {
  margin-top: 24px;
  text-align: center;
}
.auth__back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--rekit-ink-subtle);
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 8px;
}
.auth__back:hover {
  color: var(--rekit-ink);
  background: var(--rekit-surface-muted);
}

/* result */
.result {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.result__icon {
  width: 64px;
  height: 64px;
  border-radius: 999px;
  background: var(--rekit-accent-soft);
  color: var(--rekit-accent-deep);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.result__title {
  margin: 18px 0 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.025em;
}
.result__sub {
  margin: 8px 0 0;
  font-size: 13.5px;
  color: var(--rekit-ink-muted);
  line-height: 1.65;
}
.result__sub b {
  color: var(--rekit-ink);
  font-weight: 700;
}
.result__notice {
  margin-top: 20px;
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  background: var(--rekit-surface-muted);
  border-radius: 12px;
  text-align: left;
  font-size: 12px;
  color: var(--rekit-ink-muted);
  line-height: 1.55;
}
.result__notice svg {
  color: var(--rekit-ink-subtle);
  flex-shrink: 0;
  margin-top: 1px;
}
.result__actions {
  width: 100%;
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.auth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 52px;
  border-radius: 12px;
  font-size: 14.5px;
  font-weight: 700;
  letter-spacing: -0.015em;
  text-decoration: none;
}
.auth-btn--primary {
  background: var(--rekit-accent);
  color: #fff;
}
.auth-btn--secondary {
  background: var(--rekit-surface);
  color: var(--rekit-ink);
  border: 1px solid var(--rekit-border);
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
