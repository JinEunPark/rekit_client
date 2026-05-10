<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import IconBase from '@/components/ds/IconBase.vue'
import RekitLogo from '@/components/ds/RekitLogo.vue'
import Button from '@/components/ds/Button.vue'
import { findId } from '@/api/auth'
import { ApiError } from '@/api/client'

const email = ref('')
const emailFocused = ref(false)

const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))

const sent = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const sentEmail = ref('')

function maskEmail(addr: string): string {
  const [local, domain] = addr.split('@')
  if (!local || !domain) return addr
  const visible = local.slice(0, Math.min(2, local.length))
  return `${visible}***@${domain}`
}

async function submit(e: Event) {
  e.preventDefault()
  if (!emailValid.value || submitting.value) return
  submitting.value = true
  errorMessage.value = ''
  try {
    await findId(email.value.trim())
    sentEmail.value = email.value.trim()
    sent.value = true
  } catch (err) {
    errorMessage.value =
      err instanceof ApiError
        ? `${err.message} (${err.code})`
        : err instanceof Error
          ? err.message
          : '요청에 실패했어요.'
  } finally {
    submitting.value = false
  }
}

function reset() {
  sent.value = false
  errorMessage.value = ''
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
          <h1>아이디를 잊어버리셨나요?</h1>
          <p>가입 시 등록한 이메일로 아이디를 보내드려요.</p>
        </header>

        <form class="auth__form" @submit="submit">
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

          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

          <Button
            type="submit"
            variant="accent"
            size="lg"
            full
            :disabled="!emailValid || submitting"
          >
            {{ submitting ? '발송 중…' : '아이디 메일 받기' }}
          </Button>

          <div class="auth__alt">
            아이디는 기억나는데 비밀번호를?
            <RouterLink to="/auth/find-password">비밀번호 찾기</RouterLink>
          </div>
        </form>
      </template>

      <!-- Sent state -->
      <template v-else>
        <div class="result">
          <div class="result__check">
            <IconBase name="check" :size="32" :stroke="2.6" />
          </div>
          <h1 class="result__title">아이디를 발송했어요</h1>
          <p class="result__sub">
            <b>{{ maskEmail(sentEmail) }}</b>로 가입 아이디를 보내드렸어요.<br />
            5분 이내에 이메일을 확인해 주세요.
          </p>

          <div class="result__actions">
            <RouterLink to="/auth/sign-in" class="auth-btn auth-btn--primary">
              로그인하기
            </RouterLink>
            <RouterLink to="/auth/find-password" class="auth-btn auth-btn--secondary">
              비밀번호 찾기
            </RouterLink>
          </div>

          <button type="button" class="result__retry" @click="reset">
            다른 이메일로 다시 보내기
          </button>
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

.error {
  margin: 0;
  padding: 10px 14px;
  background: #fde7e7;
  color: #c0392b;
  border-radius: 10px;
  font-size: 13px;
}

/* result */
.result {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.result__check {
  width: 64px;
  height: 64px;
  border-radius: 999px;
  background: var(--rekit-accent);
  color: #fff;
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
.result__id {
  margin: 24px 0 0;
  width: 100%;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  padding: 22px;
}
.result__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--rekit-ink-muted);
}
.result__value {
  margin-top: 8px;
  font-family: var(--rekit-font-mono);
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: var(--rekit-ink);
}
.result__meta {
  margin-top: 8px;
  font-size: 11.5px;
  color: var(--rekit-ink-subtle);
  font-family: var(--rekit-font-mono);
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
.result__retry {
  margin-top: 16px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--rekit-ink-subtle);
  padding: 8px 12px;
}
.result__retry:hover {
  color: var(--rekit-ink-muted);
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
