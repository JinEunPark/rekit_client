import { apiRequest } from './client'
import type { UserResponse } from './auth'

export function getMe(): Promise<UserResponse> {
  return apiRequest<UserResponse>('/users/me', { method: 'GET', auth: true })
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
