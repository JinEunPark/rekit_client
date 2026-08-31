/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_KAKAO_CLIENT_ID?: string
  readonly VITE_KAKAO_REDIRECT_URI?: string
  readonly VITE_NAVER_CLIENT_ID?: string
  readonly VITE_NAVER_REDIRECT_URI?: string
  readonly VITE_GOOGLE_CLIENT_ID?: string
  readonly VITE_GOOGLE_REDIRECT_URI?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  /**
   * 프리렌더(scripts/prerender.mjs) 헤드리스 브라우저에서만 true.
   * 일시적 UI(모달 등)를 정적 스냅샷에서 제외하는 용도. 실제 사용자 브라우저엔 없다.
   */
  __PRERENDER__?: boolean
}
