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

function generateState(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function buildAuthorizeUrl(provider: OAuthProvider): string {
  const cfg = OAUTH_PROVIDERS[provider]
  if (!cfg.clientId) {
    throw new Error(`[oauth] ${provider} client id가 .env.local에 설정되지 않았습니다.`)
  }

  const state = generateState()
  sessionStorage.setItem(STATE_KEY_PREFIX + provider, state)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    state,
  })
  if (cfg.scope) params.set('scope', cfg.scope)

  return `${cfg.authUrl}?${params.toString()}`
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
