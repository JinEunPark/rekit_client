<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import IconBase from '@/components/ds/IconBase.vue'
import RekitLogo from '@/components/ds/RekitLogo.vue'
import Button from '@/components/ds/Button.vue'
import { useAuthStore } from '@/stores/auth'
import { socialSignUp } from '@/api/auth'
import { ApiError } from '@/api/client'
import { OAUTH_PROVIDERS, isOAuthProvider } from '@/config/oauth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const providerKey = computed(() => {
  const raw = String(route.query.provider ?? '')
  return isOAuthProvider(raw) ? raw : null
})
const providerLabel = computed(() =>
  providerKey.value ? OAUTH_PROVIDERS[providerKey.value].label : '소셜',
)
const tempToken = computed(() => String(route.query.tempToken ?? ''))
const email = computed(() => String(route.query.email ?? ''))
const suggestedName = computed(() => String(route.query.suggestedName ?? ''))

const agreeTerms = ref(false)
const agreePrivacy = ref(false)
const agreeMarketing = ref(false)
const requiredAgreed = computed(() => agreeTerms.value && agreePrivacy.value)
const allAgreed = computed(() => requiredAgreed.value && agreeMarketing.value)

const submitting = ref(false)
const errorMessage = ref('')

const canSubmit = computed(
  () => !submitting.value && !!tempToken.value && requiredAgreed.value,
)

function toggleAll() {
  const next = !allAgreed.value
  agreeTerms.value = next
  agreePrivacy.value = next
  agreeMarketing.value = next
}

async function submit(e: Event) {
  e.preventDefault()
  if (!canSubmit.value) return
  submitting.value = true
  errorMessage.value = ''
  try {
    const result = await socialSignUp({
      tempToken: tempToken.value,
      agreedTerms: agreeTerms.value,
      agreedPrivacy: agreePrivacy.value,
      agreedMarketing: agreeMarketing.value,
    })
    // login_id는 서버 자동 생성, username은 소셜 닉네임 그대로 저장됨 — 정확한 값은 곧이어 fetchMe()가 채운다.
    auth.setSession(result.accessToken, {
      loginId: `${providerKey.value}_user`,
      username: suggestedName.value || `${providerLabel.value} 사용자`,
      email: email.value || undefined,
    })
    void auth.fetchMe()
    router.replace('/')
  } catch (err) {
    if (err instanceof ApiError) {
      errorMessage.value = `${err.message} (${err.code})`
    } else {
      errorMessage.value = err instanceof Error ? err.message : '가입에 실패했습니다.'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="auth">
    <RouterLink to="/auth/sign-in" class="auth__close" aria-label="닫기">
      <IconBase name="close" :size="22" />
    </RouterLink>

    <main class="auth__card">
      <div class="auth__brand">
        <RekitLogo :size="28" />
      </div>

      <header class="auth__head">
        <h1>{{ providerLabel }} 계정으로 가입을 마무리해요</h1>
        <p v-if="email">{{ email }} · 약관에 동의하면 바로 가입이 완료돼요</p>
        <p v-else>약관에 동의하면 바로 가입이 완료돼요</p>
      </header>

      <form class="auth__form" @submit="submit">
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

        <Button type="submit" variant="accent" size="lg" full :disabled="!canSubmit">
          {{ submitting ? '가입 중…' : '가입하고 시작하기' }}
        </Button>
      </form>
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
.error {
  margin: 0;
  padding: 10px 14px;
  background: #fde7e7;
  color: #c0392b;
  border-radius: 10px;
  font-size: 13px;
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
