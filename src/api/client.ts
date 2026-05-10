const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'

const TOKEN_KEY = 'rekit.auth.access_token.v1'

export function getAccessToken(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setAccessToken(token: string | null): void {
  if (typeof localStorage === 'undefined') return
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export interface ApiErrorBody {
  code?: string
  message?: string
  details?: unknown
}

export class ApiError extends Error {
  status: number
  code: string
  body: ApiErrorBody | null

  constructor(status: number, body: ApiErrorBody | null, fallbackMessage: string) {
    super(body?.message ?? fallbackMessage)
    this.status = status
    this.code = body?.code ?? 'HTTP_ERROR'
    this.body = body
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT'
  body?: unknown
  auth?: boolean
  /** 내부 재시도 플래그 — 401 → refresh → retry 무한 루프 방지 */
  _retry?: boolean
}

// 동시에 여러 요청이 401을 받으면 refresh 호출이 중복되지 않도록 단일 promise 공유.
let refreshInFlight: Promise<string | null> | null = null

async function attemptRefresh(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight
  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) return null
      const data = (await res.json()) as { accessToken?: string }
      if (!data.accessToken) return null
      setAccessToken(data.accessToken)
      return data.accessToken
    } catch {
      return null
    } finally {
      refreshInFlight = null
    }
  })()
  return refreshInFlight
}

function notifyAuthExpired() {
  setAccessToken(null)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('rekit:auth-expired'))
  }
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'
  if (opts.auth) {
    const token = getAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: opts.method ?? (opts.body !== undefined ? 'POST' : 'GET'),
      headers,
      credentials: 'include',
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    })
  } catch (err) {
    throw new ApiError(0, null, err instanceof Error ? err.message : '네트워크 오류')
  }

  // 401 + 인증 요청 + 첫 시도 → refresh 한 번 시도 후 재실행.
  // refresh 엔드포인트(/auth/refresh) 자체는 auth=false 라 여기 안 걸림.
  if (res.status === 401 && opts.auth && !opts._retry) {
    const newToken = await attemptRefresh()
    if (newToken) {
      return apiRequest<T>(path, { ...opts, _retry: true })
    }
    notifyAuthExpired()
  }

  if (res.status === 204) return undefined as T

  let payload: unknown = null
  const text = await res.text()
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = { message: text }
    }
  }

  if (!res.ok) {
    const errorBody =
      payload && typeof payload === 'object' && 'error' in payload
        ? ((payload as { error: ApiErrorBody }).error)
        : (payload as ApiErrorBody | null)
    throw new ApiError(res.status, errorBody, `HTTP ${res.status}`)
  }

  return payload as T
}
