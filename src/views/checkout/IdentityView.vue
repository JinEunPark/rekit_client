<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'
import { useRouter } from 'vue-router'
import IconBase from '@/components/ds/IconBase.vue'
import Button from '@/components/ds/Button.vue'
import CheckoutSteps from '@/components/checkout/CheckoutSteps.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

onBeforeMount(() => {
  if (!auth.user) {
    router.replace(`/auth/sign-in?redirect=${encodeURIComponent('/checkout/identity')}`)
    return
  }
  const selected = cart.items.filter((i) => i.selected)
  if (selected.length === 0) {
    router.replace('/cart')
    return
  }
  if (auth.user.verified) {
    router.replace('/checkout/order')
  }
})

const phone = ref('')
const otp = ref('')
const otpSent = ref(false)
const phoneFocused = ref(false)
const otpFocused = ref(false)

const phoneValid = computed(() => phone.value.replace(/\D/g, '').length >= 10)
const canSubmit = computed(() => otpSent.value && otp.value.length >= 6)

function requestOtp() {
  if (!phoneValid.value) return
  otpSent.value = true
}

function submit(e: Event) {
  e.preventDefault()
  if (!canSubmit.value || !auth.user) return
  // mock — in production, PG verifies and returns identity claim
  auth.user.verified = true
  auth.user.phone = phone.value
  // persist immediately
  localStorage.setItem('rekit.auth.user.v2', JSON.stringify(auth.user))
  router.replace('/checkout/order')
}
</script>

<template>
  <div v-if="auth.user && !auth.user.verified" class="page">
    <CheckoutSteps :current="1" />

    <header class="hero">
      <div class="hero__icon">
        <IconBase name="shield" :size="28" />
      </div>
      <h1 class="hero__title">주문 전에<br />본인인증을 진행해 주세요</h1>
      <p class="hero__sub">
        고가 가전 거래의 안전을 위해 첫 주문 시 1회 본인 확인이 필요해요.<br />
        <b>다음 주문부터는 자동으로 생략돼요.</b>
      </p>
    </header>

    <form class="form" @submit="submit">
      <label class="field" :class="{ 'field--focus': phoneFocused }">
        <span class="field__label">휴대폰 번호</span>
        <div class="field__row">
          <input
            v-model="phone"
            type="tel"
            inputmode="numeric"
            autocomplete="tel"
            placeholder="010-1234-5678"
            @focus="phoneFocused = true"
            @blur="phoneFocused = false"
          />
          <button
            type="button"
            class="field__action"
            :disabled="!phoneValid"
            @click="requestOtp"
          >
            {{ otpSent ? '재전송' : '인증요청' }}
          </button>
        </div>
      </label>

      <label
        class="field"
        :class="{ 'field--focus': otpFocused, 'field--disabled': !otpSent }"
      >
        <span class="field__label">인증번호</span>
        <div class="field__row">
          <input
            v-model="otp"
            type="text"
            inputmode="numeric"
            maxlength="6"
            placeholder="6자리 입력"
            :disabled="!otpSent"
            class="field__input--mono"
            @focus="otpFocused = true"
            @blur="otpFocused = false"
          />
          <span v-if="otpSent" class="field__timer">02:43</span>
        </div>
        <span v-if="otpSent" class="field__hint">
          <IconBase name="check" :size="12" :stroke="2.4" /> 인증번호가 발송됐어요
        </span>
      </label>

      <div class="notice">
        · 인증 정보는 암호화 저장되며 분쟁 대응 외 사용되지 않습니다.<br />
        · 만 14세 미만은 가입 및 주문이 제한됩니다.<br />
        · 인증 제공: 토스페이먼츠
      </div>

      <Button type="submit" variant="accent" size="lg" full :disabled="!canSubmit">
        인증하고 주문서로 이동
      </Button>
    </form>
  </div>
</template>

<style scoped>
.page {
  max-width: 480px;
  margin: 0 auto;
  padding: 16px 20px 48px;
}
@media (min-width: 768px) {
  .page {
    padding: 32px 24px 56px;
  }
}

.hero {
  margin-top: 16px;
}
.hero__icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--rekit-accent-soft);
  color: var(--rekit-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}
.hero__title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.3;
}
.hero__sub {
  margin: 12px 0 0;
  font-size: 13.5px;
  color: var(--rekit-ink-muted);
  line-height: 1.65;
}

.form {
  margin-top: 28px;
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
  gap: 8px;
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
.field--disabled .field__row {
  background: var(--rekit-surface-muted);
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
.field__row input:disabled {
  color: var(--rekit-ink-subtle);
}
.field__row input::placeholder {
  color: var(--rekit-ink-placeholder);
}
.field__input--mono {
  font-family: var(--rekit-font-mono);
  letter-spacing: 0.18em;
  font-size: 16px !important;
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
.field__timer {
  align-self: center;
  color: var(--rekit-danger);
  font-family: var(--rekit-font-mono);
  font-size: 13px;
  font-weight: 600;
}
.field__hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--rekit-accent-deep);
}

.notice {
  background: var(--rekit-surface-muted);
  color: var(--rekit-ink-muted);
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 11px;
  line-height: 1.7;
  margin-top: 4px;
}
</style>
