export type OAuthProvider = 'kakao' | 'naver' | 'google'

interface ProviderConfig {
  clientId: string
  redirectUri: string
  authUrl: string
  scope?: string
  label: string
}

export const OAUTH_PROVIDERS: Record<OAuthProvider, ProviderConfig> = {
  kakao: {
    clientId: import.meta.env.VITE_KAKAO_CLIENT_ID ?? '',
    redirectUri: import.meta.env.VITE_KAKAO_REDIRECT_URI ?? '',
    authUrl: 'https://kauth.kakao.com/oauth/authorize',
    label: '카카오',
  },
  naver: {
    clientId: import.meta.env.VITE_NAVER_CLIENT_ID ?? '',
    redirectUri: import.meta.env.VITE_NAVER_REDIRECT_URI ?? '',
    authUrl: 'https://nid.naver.com/oauth2.0/authorize',
    label: '네이버',
  },
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
    redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI ?? '',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scope: 'openid email profile',
    label: 'Google',
  },
}

const STATE_KEY_PREFIX = 'rekit.oauth.state.'
/** 콜백 페이지가 재로그인이 아니라 탈퇴 재인증 흐름인지 구분하는 플래그. 리다이렉트 왕복 동안 sessionStorage로 보존. */
const PURPOSE_KEY = 'rekit.oauth.purpose'

export type OAuthPurpose = 'withdrawal'

function generateState(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function buildAuthorizeUrl(provider: OAuthProvider, purpose?: OAuthPurpose): string {
  const cfg = OAUTH_PROVIDERS[provider]
  if (!cfg.clientId) {
    throw new Error(`[oauth] ${provider} client id가 .env.local에 설정되지 않았습니다.`)
  }

  const state = generateState()
  sessionStorage.setItem(STATE_KEY_PREFIX + provider, state)
  if (purpose) sessionStorage.setItem(PURPOSE_KEY, purpose)
  else sessionStorage.removeItem(PURPOSE_KEY)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    state,
  })
  if (cfg.scope) params.set('scope', cfg.scope)

  return `${cfg.authUrl}?${params.toString()}`
}

/** 콜백 페이지 진입 시 1회 소비 — 탈퇴 재인증 흐름이었는지 확인. */
export function consumeStoredPurpose(): OAuthPurpose | null {
  const value = sessionStorage.getItem(PURPOSE_KEY)
  sessionStorage.removeItem(PURPOSE_KEY)
  return value === 'withdrawal' ? 'withdrawal' : null
}

export function consumeStoredState(provider: OAuthProvider): string | null {
  const key = STATE_KEY_PREFIX + provider
  const value = sessionStorage.getItem(key)
  sessionStorage.removeItem(key)
  return value
}

export function isOAuthProvider(value: string): value is OAuthProvider {
  return value === 'kakao' || value === 'naver' || value === 'google'
}
