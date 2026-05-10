<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import RekitLogo from '@/components/ds/RekitLogo.vue'
import Button from '@/components/ds/Button.vue'
import { useAuthStore } from '@/stores/auth'
import {
  OAUTH_PROVIDERS,
  consumeStoredState,
  isOAuthProvider,
  type OAuthProvider,
} from '@/config/oauth'
import { socialCallback } from '@/api/auth'
import { ApiError } from '@/api/client'

type Status = 'processing' | 'success' | 'error'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const status = ref<Status>('processing')
const errorMessage = ref('')
const provider = computed<OAuthProvider | null>(() => {
  const raw = String(route.params.provider ?? '')
  return isOAuthProvider(raw) ? raw : null
})
const providerLabel = computed(() => (provider.value ? OAUTH_PROVIDERS[provider.value].label : ''))

onMounted(async () => {
  if (!provider.value) {
    fail('알 수 없는 소셜 로그인 제공자입니다.')
    return
  }

  const query = route.query
  if (typeof query.error === 'string') {
    fail(typeof query.error_description === 'string' ? query.error_description : query.error)
    return
  }

  const code = typeof query.code === 'string' ? query.code : ''
  const returnedState = typeof query.state === 'string' ? query.state : ''
  const expectedState = consumeStoredState(provider.value)

  if (!code) {
    fail('인증 코드가 전달되지 않았습니다.')
    return
  }
  if (!expectedState || expectedState !== returnedState) {
    fail('보안 검증(state)에 실패했습니다. 다시 시도해 주세요.')
    return
  }

  try {
    const result = await socialCallback(provider.value, { code, state: returnedState })

    if (result.needsSignUp) {
      router.replace({
        name: 'social-sign-up',
        query: {
          provider: provider.value,
          tempToken: result.tempToken ?? '',
          email: result.email ?? '',
          suggestedName: result.suggestedName ?? '',
        },
      })
      return
    }

    if (!result.accessToken) {
      fail('로그인 토큰을 받지 못했습니다.')
      return
    }

    auth.setSession(result.accessToken, {
      loginId: `${provider.value}_user`,
      username: `${providerLabel.value} 사용자`,
      email: result.email ?? `${provider.value}_user@rekit.kr`,
    })
    void auth.fetchMe()
    status.value = 'success'

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    window.setTimeout(() => router.replace(redirect), 800)
  } catch (err) {
    if (err instanceof ApiError) {
      fail(`${err.message} (${err.code})`)
    } else {
      fail(err instanceof Error ? err.message : '알 수 없는 오류')
    }
  }
})

function fail(message: string) {
  errorMessage.value = message
  status.value = 'error'
}
</script>

<template>
  <div class="callback">
    <main class="callback__card">
      <div class="callback__brand">
        <RekitLogo :size="28" />
      </div>

      <template v-if="status === 'processing'">
        <div class="spinner" aria-hidden="true" />
        <h1>{{ providerLabel }} 로그인 처리 중…</h1>
        <p>잠시만 기다려 주세요.</p>
      </template>

      <template v-else-if="status === 'success'">
        <div class="badge badge--ok" aria-hidden="true">✓</div>
        <h1>{{ providerLabel }} 로그인 완료</h1>
        <p>홈으로 이동하고 있어요…</p>
      </template>

      <template v-else>
        <div class="badge badge--err" aria-hidden="true">!</div>
        <h1>로그인에 실패했어요</h1>
        <p>{{ errorMessage }}</p>
        <RouterLink to="/auth/sign-in" v-slot="{ navigate }">
          <Button variant="accent" size="lg" full @click="navigate">로그인 화면으로</Button>
        </RouterLink>
      </template>
    </main>
  </div>
</template>

<style scoped>
.callback {
  min-height: 100vh;
  background: var(--rekit-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.callback__card {
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 14px;
  padding: 40px 28px;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 24px;
  box-shadow: 0 1px 2px rgba(20, 20, 15, 0.04), 0 12px 40px rgba(20, 20, 15, 0.06);
}
.callback__brand {
  margin-bottom: 8px;
}
.callback__card h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.callback__card p {
  margin: 0;
  font-size: 13px;
  color: var(--rekit-ink-muted);
  line-height: 1.55;
}
.spinner {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 3px solid var(--rekit-border);
  border-top-color: var(--rekit-ink);
  animation: spin 0.7s linear infinite;
  margin-bottom: 4px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.badge {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
}
.badge--ok {
  background: var(--rekit-accent-soft);
  color: var(--rekit-accent-deep);
}
.badge--err {
  background: #fde7e7;
  color: #c0392b;
}
</style>
