import { apiRequest } from './client'
import type { UserResponse } from './auth'

export function getMe(): Promise<UserResponse> {
  return apiRequest<UserResponse>('/users/me', { method: 'GET', auth: true })
}
