import type { UserStatus } from '@/api/admin/members'

export function statusTone(s: UserStatus): 'accent' | 'danger' | 'neutral' {
  return s === 'ACTIVE' ? 'accent' : s === 'BANNED' ? 'danger' : 'neutral'
}

export function statusLabel(s: UserStatus): string {
  const map: Record<UserStatus, string> = { ACTIVE: '활성', BANNED: '제재', DORMANT: '휴면', WITHDRAWN: '탈퇴' }
  return map[s]
}
