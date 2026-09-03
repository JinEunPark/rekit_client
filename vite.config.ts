import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { tossMockPlugin, backendProxy } from './dev/tossMockPlugin'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // 로컬 결제 테스트 모드 — TOSS_TEST_SECRET_KEY(비-VITE) 가 있으면 활성화.
  // Vite dev 서버가 /api/v1/payments/{init,confirm} 를 가로채 토스로 중계하고,
  // 나머지 /api/v1/* 는 실제 백엔드로 프록시한다. (VITE_API_BASE_URL 을 /api/v1 로 두세요)
  const tossSecret = env.TOSS_TEST_SECRET_KEY
  const backendTarget = env.DEV_BACKEND_ORIGIN ?? 'http://localhost:8000'

  return {
    plugins: [
      vue(),
      vueDevTools(),
      ...(tossSecret
        ? [
            tossMockPlugin({
              secretKey: tossSecret,
              backendBaseUrl: `${backendTarget}/api/v1`,
              fallbackAmount: Number(env.TOSS_TEST_FALLBACK_AMOUNT ?? 1000),
            }),
          ]
        : []),
    ],
    server: tossSecret ? { proxy: backendProxy(backendTarget) } : undefined,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
