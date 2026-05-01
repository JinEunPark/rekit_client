import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export interface User {
  /** Account ID for login. */
  username: string
  email: string
  name: string
  /** Set later by 본인인증 (identity verification) flow before checkout. */
  phone?: string
  verified: boolean
  ecoKg: number
}

const STORAGE_KEY = 'rekit.auth.user.v2'

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
  const initial = computed(() => (user.value ? user.value.name.charAt(0) : ''))

  function persist() {
    if (typeof localStorage === 'undefined') return
    if (user.value) localStorage.setItem(STORAGE_KEY, JSON.stringify(user.value))
    else localStorage.removeItem(STORAGE_KEY)
  }

  /**
   * Mock login. Real backend will replace this with a token + profile fetch.
   * Any field can be overridden; missing fields fall back to demo values
   * so the screen has something to render.
   */
  function login(input: Partial<User> = {}) {
    const username = input.username ?? 'eunyoung_kim'
    user.value = {
      username,
      name: input.name ?? '박은영',
      email: input.email ?? `${username}@rekit.kr`,
      phone: input.phone,
      verified: input.verified ?? false,
      ecoKg: input.ecoKg ?? 86,
    }
    persist()
  }

  function logout() {
    user.value = null
    persist()
  }

  return { user, isAuthenticated, initial, login, logout }
})
