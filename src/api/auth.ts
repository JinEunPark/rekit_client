import { apiRequest } from './client'
import type { OAuthProvider } from '@/config/oauth'

export interface TokenResponse {
  accessToken: string
  tokenType: string
  mustChangePassword: boolean
}

export interface UserResponse {
  id: number
  loginId: string
  username: string
  email: string
  phone?: string | null
  verified: boolean
  ecoKg: number
}

export interface SignInPayload {
  loginId: string
  password: string
  remember: boolean
}

export interface SignUpPayload {
  loginId: string
  username: string
  password: string
  email: string
  agreedTerms: boolean
  agreedPrivacy: boolean
  agreedMarketing: boolean
}

export function signIn(payload: SignInPayload): Promise<TokenResponse> {
  return apiRequest<TokenResponse>('/auth/sign-in', { method: 'POST', body: payload })
}

export function signUp(payload: SignUpPayload): Promise<UserResponse> {
  return apiRequest<UserResponse>('/auth/sign-up', { method: 'POST', body: payload })
}

export interface AvailabilityResponse {
  available: boolean
}
export interface SentResponse {
  sent: boolean
  maskedEmail?: string
}

export function checkLoginId(loginId: string): Promise<AvailabilityResponse> {
  return apiRequest<AvailabilityResponse>('/auth/check-login-id', {
    method: 'POST',
    body: { loginId },
  })
}

export function findId(email: string): Promise<SentResponse> {
  return apiRequest<SentResponse>('/auth/find-id', { method: 'POST', body: { email } })
}

export function findPassword(loginId: string, email: string): Promise<SentResponse> {
  return apiRequest<SentResponse>('/auth/find-password', {
    method: 'POST',
    body: { loginId, email },
  })
}

export function signOut(): Promise<void> {
  // Bearer 불필요 — refresh 쿠키만 보고 서버가 해당 쿠키 폐기.
  return apiRequest<void>('/auth/sign-out', { method: 'POST' })
}

export function refresh(): Promise<TokenResponse> {
  return apiRequest<TokenResponse>('/auth/refresh', { method: 'POST' })
}

export interface SocialCallbackResponse {
  needsSignUp: boolean
  accessToken?: string
  tokenType?: string
  mustChangePassword?: boolean
  tempToken?: string
  email?: string
  suggestedName?: string
}

export interface SocialSignUpPayload {
  tempToken: string
  loginId: string
  username: string
  agreedTerms: boolean
  agreedPrivacy: boolean
  agreedMarketing: boolean
}

export function socialCallback(
  provider: OAuthProvider,
  body: { code: string; state: string | null },
): Promise<SocialCallbackResponse> {
  return apiRequest<SocialCallbackResponse>(`/auth/social/${provider}/callback`, {
    method: 'POST',
    body,
  })
}

export function socialSignUp(payload: SocialSignUpPayload): Promise<TokenResponse> {
  return apiRequest<TokenResponse>('/auth/social/sign-up', {
    method: 'POST',
    body: payload,
  })
}
