<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import IconBase from '@/components/ds/IconBase.vue'
import Button from '@/components/ds/Button.vue'
import { ApiError } from '@/api/client'
import { sendPhoneVerification, verifyPhone } from '@/api/users'
import { formatPhoneNumber } from '@/utils/phone'

/**
 * Octomo QR 기반 휴대폰 인증 공용 폼.
 *
 * checkout/IdentityView.vue(첫 주문 전 게이트)와 my/ProfileView.vue(휴대폰
 * 변경)가 동일한 sendPhoneVerification/verifyPhone 흐름을 공유하므로 이 폼
 * 하나로 추출했다. 서버가 SMS 를 발송하지 않는다 — 사용자가 QR을 스캔해
 * 자기 휴대폰으로 직접 전송해야 한다(docs/octomo_migration.md 참고).
 *
 * QR 은 5분 TTL — 만료되면 자동으로 새 QR을 재발급한다(재발급 쿨다운 60초가
 * 남아있으면 그 쿨다운이 끝나는 시점에 자동 재발급). 사용자가 "재발급"
 * 버튼을 직접 눌러 강제로 새로 받을 수도 있다.
 */

const props = withDefaults(
  defineProps<{
    initialPhone?: string
    /** true면 번호 입력칸을 처음부터 잠근다 — initialPhone 을 그대로 재인증할 때만 사용(예: 체크아웃 본인인증 게이트). */
    lockPhone?: boolean
  }>(),
  { initialPhone: '', lockPhone: false },
)
const emit = defineEmits<{ verified: [phone: string] }>()

const QR_TTL_MS = 5 * 60 * 1000 // Octomo withinMinutes=5 와 동일
const RESEND_COOLDOWN_SECONDS = 60 // 백엔드 rate-limit(60초)과 동일

const phone = ref(props.initialPhone)
const phoneFocused = ref(false)
const qrCode = ref('')
const issuing = ref(false)
const verifying = ref(false)
const errorMessage = ref('')
const issued = computed(() => qrCode.value !== '')

const phoneValid = computed(() => phone.value.replace(/\D/g, '').length >= 10)

function onPhoneInput(e: Event) {
  phone.value = formatPhoneNumber((e.target as HTMLInputElement).value)
}

// QR 유효시간(5분) 카운트다운
const remainingMs = ref(0)
let countdownTimer: number | null = null

function stopCountdown() {
  if (countdownTimer !== null) {
    window.clearInterval(countdownTimer)
    countdownTimer = null
  }
}

const remainingLabel = computed(() => {
  const total = Math.ceil(remainingMs.value / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
})
const qrExpired = computed(() => issued.value && remainingMs.value <= 0)
const phoneInputLocked = computed(() => props.lockPhone || (issued.value && !qrExpired.value))

// QR 만료 + 재발급 쿨다운이 둘 다 끝난 시점에만 자동 재발급한다 — 두 타이머 중
// 어느 쪽이 먼저 끝나든 동일한 조건으로 판단한다.
function maybeAutoReissue() {
  if (qrExpired.value && resendCooldown.value <= 0) void requestQr()
}

function startCountdown(durationMs: number) {
  stopCountdown()
  const expiresAt = Date.now() + durationMs
  remainingMs.value = durationMs
  countdownTimer = window.setInterval(() => {
    remainingMs.value = Math.max(0, expiresAt - Date.now())
    if (remainingMs.value <= 0) {
      stopCountdown()
      maybeAutoReissue()
    }
  }, 1000)
}

// 재발급 쿨다운(60초) — 백엔드 rate-limit 과 별개로 버튼도 미리 잠가서 헛요청 방지
const resendCooldown = ref(0)
let resendTimer: number | null = null

function startResendCooldown() {
  resendCooldown.value = RESEND_COOLDOWN_SECONDS
  if (resendTimer !== null) window.clearInterval(resendTimer)
  resendTimer = window.setInterval(() => {
    resendCooldown.value -= 1
    if (resendCooldown.value <= 0) {
      resendCooldown.value = 0
      if (resendTimer !== null) {
        window.clearInterval(resendTimer)
        resendTimer = null
      }
      maybeAutoReissue()
    }
  }, 1000)
}

onUnmounted(() => {
  stopCountdown()
  if (resendTimer !== null) window.clearInterval(resendTimer)
})

async function requestQr() {
  if (!phoneValid.value || issuing.value || resendCooldown.value > 0) return
  issuing.value = true
  errorMessage.value = ''
  try {
    const res = await sendPhoneVerification(phone.value.trim())
    qrCode.value = res.qrCode
    startCountdown(QR_TTL_MS)
    startResendCooldown()
  } catch (err) {
    if (err instanceof ApiError && err.code === 'OTP_RATE_LIMITED') {
      errorMessage.value = '잠시 후 다시 시도해 주세요. (60초)'
      startResendCooldown()
    } else {
      errorMessage.value = err instanceof Error ? err.message : 'QR 발급에 실패했어요.'
    }
  } finally {
    issuing.value = false
  }
}

async function confirmVerification() {
  if (!issued.value || verifying.value) return
  verifying.value = true
  errorMessage.value = ''
  try {
    await verifyPhone(phone.value.trim())
    stopCountdown()
    emit('verified', phone.value.trim())
  } catch (err) {
    if (err instanceof ApiError && err.code === 'OTP_INVALID') {
      errorMessage.value = qrExpired.value
        ? 'QR이 만료됐어요. 다시 발급해 주세요.'
        : '아직 문자가 도착하지 않았어요. 전송 후 다시 시도해 주세요.'
    } else {
      errorMessage.value = err instanceof Error ? err.message : '인증 확인에 실패했어요.'
    }
  } finally {
    verifying.value = false
  }
}
</script>

<template>
  <div class="phone-verify">
    <label class="field" :class="{ 'field--focus': phoneFocused }">
      <span class="field__label">휴대폰 번호</span>
      <div class="field__row">
        <input
          :value="phone"
          type="tel"
          inputmode="numeric"
          autocomplete="tel"
          placeholder="010-1234-5678"
          maxlength="13"
          :disabled="phoneInputLocked"
          @input="onPhoneInput"
          @focus="phoneFocused = true"
          @blur="phoneFocused = false"
        />
        <button
          type="button"
          class="field__action"
          :disabled="!phoneValid || issuing || resendCooldown > 0"
          @click="requestQr"
        >
          <template v-if="issuing">발급 중</template>
          <template v-else-if="resendCooldown > 0">{{ resendCooldown }}초</template>
          <template v-else-if="issued">재발급</template>
          <template v-else>인증 QR 받기</template>
        </button>
      </div>
    </label>

    <div v-if="issued" class="qr-box" :class="{ 'qr-box--expired': qrExpired }">
      <img :src="qrCode" alt="휴대폰 인증 QR 코드" class="qr-box__image" />
      <div class="qr-box__meta">
        <p class="qr-box__hint">
          <IconBase name="phone" :size="14" />
          카메라로 QR을 스캔하면 문자 앱이 열려요. 그대로 전송만 눌러주세요.
        </p>
        <span v-if="!qrExpired" class="qr-box__timer">남은 시간 {{ remainingLabel }}</span>
        <span v-else class="qr-box__timer qr-box__timer--expired">
          <IconBase name="warning" :size="12" />
          {{ issuing ? 'QR이 만료돼서 새로 발급하고 있어요…' : 'QR이 만료됐어요. 새 QR을 준비 중이에요…' }}
        </span>
      </div>
    </div>

    <p v-if="errorMessage" class="field__hint field__hint--err">
      <IconBase name="warning" :size="12" /> {{ errorMessage }}
    </p>

    <Button
      type="button"
      variant="accent"
      size="lg"
      full
      :disabled="!issued || qrExpired || verifying"
      @click="confirmVerification"
    >
      {{ verifying ? '확인 중…' : '인증하기' }}
    </Button>
  </div>
</template>

<style scoped>
.phone-verify {
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
.field__hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}
.field__hint--err {
  color: var(--rekit-danger);
}

.qr-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: var(--rekit-surface-muted);
  border-radius: 12px;
  text-align: center;
}
.qr-box__image {
  width: 168px;
  height: 168px;
  border-radius: 10px;
  background: #fff;
  padding: 8px;
}
.qr-box--expired .qr-box__image {
  opacity: 0.35;
}
.qr-box__meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.qr-box__hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 12.5px;
  color: var(--rekit-ink-muted);
  line-height: 1.5;
}
.qr-box__timer {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--rekit-font-mono);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--rekit-accent-deep);
}
.qr-box__timer--expired {
  color: var(--rekit-danger);
  font-family: inherit;
}
</style>
