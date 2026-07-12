import { apiRequest } from './client'
import type { UserResponse } from './auth'

export function getMe(): Promise<UserResponse> {
  return apiRequest<UserResponse>('/users/me', { method: 'GET', auth: true })
}

export interface UpdateProfilePayload {
  username?: string | null
  phone?: string | null
}

export function updateProfile(payload: UpdateProfilePayload): Promise<UserResponse> {
  return apiRequest<UserResponse>('/users/me', { method: 'PATCH', body: payload, auth: true })
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export function changePassword(payload: ChangePasswordPayload): Promise<void> {
  return apiRequest<void>('/users/me/password', {
    method: 'POST',
    body: payload,
    auth: true,
  })
}

export function withdrawMe(password: string): Promise<void> {
  return apiRequest<void>('/users/me', { method: 'DELETE', body: { password }, auth: true })
}

export interface PhoneSendVerificationResponse {
  /** "data:image/png;base64,..." — QR 이미지를 그대로 <img :src> 에 표시 */
  qrCode: string
}

/** Octomo 인증 QR 발급. 서버가 SMS 를 보내지 않는다 — 사용자가 QR을 스캔해 직접 전송한다. */
export function sendPhoneVerification(phone: string): Promise<PhoneSendVerificationResponse> {
  return apiRequest<PhoneSendVerificationResponse>('/users/me/phone/send-verification', {
    method: 'POST',
    body: { phone },
    auth: true,
  })
}

/** Octomo 수신 여부 확인. code 를 별도로 넘기지 않는다 — 서버가 발급해둔 값을 스스로 재조회한다. */
export function verifyPhone(phone: string): Promise<void> {
  return apiRequest<void>('/users/me/phone/verify', {
    method: 'POST',
    body: { phone },
    auth: true,
  })
}
