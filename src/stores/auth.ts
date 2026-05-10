import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getAccessToken, setAccessToken } from '@/api/client'
import { signOut as apiSignOut } from '@/api/auth'
import { getMe } from '@/api/users'

export interface User {
  /** Login ID (username on server). */
  loginId: string
  /** Display name (user-entered). */
  username: string
  email: string
  /** Set later by 본인인증 (identity verification) flow before checkout. */
  phone?: string
  verified: boolean
  ecoKg: number
}

const STORAGE_KEY = 'rekit.auth.user.v3'

function loadUser(): User | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(loadUser())
  const isAuthenticated = computed(() => user.value !== null)
  const initial = computed(() => (user.value ? user.value.username.charAt(0) : ''))

  function persist() {
    if (typeof localStorage === 'undefined') return
    if (user.value) localStorage.setItem(STORAGE_KEY, JSON.stringify(user.value))
    else localStorage.removeItem(STORAGE_KEY)
  }

  function login(input: Partial<User> = {}) {
    const loginId = input.loginId ?? 'eunyoung_kim'
    user.value = {
      loginId,
      username: input.username ?? '박은영',
      email: input.email ?? `${loginId}@rekit.kr`,
      phone: input.phone,
      verified: input.verified ?? false,
      ecoKg: input.ecoKg ?? 86,
    }
    persist()
  }

  function setSession(accessToken: string, profile: Partial<User> = {}) {
    setAccessToken(accessToken)
    login(profile)
  }

  async function fetchMe(): Promise<void> {
    if (!getAccessToken()) return
    try {
      const me = await getMe()
      user.value = {
        loginId: me.loginId,
        username: me.username,
        email: me.email,
        phone: me.phone ?? undefined,
        verified: me.verified,
        ecoKg: me.ecoKg,
      }
      persist()
    } catch {
      // 인증 만료는 인터셉터가 처리. 그 외(네트워크 등)는 placeholder 유지.
    }
  }

  function clearLocal() {
    setAccessToken(null)
    user.value = null
    persist()
  }

  function logout() {
    const wasAuthenticated = isAuthenticated.value
    clearLocal()
    if (wasAuthenticated) {
      apiSignOut().catch(() => undefined)
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('rekit:auth-expired', clearLocal)
  }

  return { user, isAuthenticated, initial, login, setSession, fetchMe, logout }
})
