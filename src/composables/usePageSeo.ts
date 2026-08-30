import { computed, unref, type MaybeRefOrGetter } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'

/** 프로덕션 정식 도메인 (www 없음, https). canonical·OG URL 기준. */
export const SITE_ORIGIN = 'https://rekit.co.kr'
export const SITE_NAME = 'rekit'
const TITLE_SUFFIX = ' · rekit'
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-cover.png`

/** robots noindex 를 적용할 비공개 화면 경로 프리픽스. public/robots.txt 와 동기화. */
export const PRIVATE_PATH_PREFIXES = [
  '/admin',
  '/my',
  '/cart',
  '/checkout',
  '/auth',
  '/search',
  '/_design',
]

export function isPrivatePath(path: string): boolean {
  return PRIVATE_PATH_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))
}

interface PageSeoInput {
  /** 페이지 고유 제목. 미지정 시 기본 타이틀 유지. */
  title?: MaybeRefOrGetter<string | undefined>
  /** 메타 설명 (약 70~150자 권장). */
  description?: MaybeRefOrGetter<string | undefined>
  /** OG 이미지 절대 URL. 미지정 시 기본 커버. */
  image?: MaybeRefOrGetter<string | undefined>
  /** canonical 경로 강제 지정 (기본은 현재 라우트 path). */
  path?: string
}

function toValue<T>(v: MaybeRefOrGetter<T>): T {
  return typeof v === 'function' ? (v as () => T)() : unref(v as never)
}

/**
 * 라우트별 <title>·description·canonical·OpenGraph 메타를 선언한다.
 * robots(색인 허용/차단)는 App.vue 가 경로 기준으로 전역 관리하므로 여기서 다루지 않는다.
 * SPA라 초기 크롤에 한계가 있지만, 렌더 후 메타가 정확해야 색인·공유 미리보기가 산다.
 */
export function usePageSeo(input: PageSeoInput = {}) {
  const route = useRoute()

  const fullTitle = computed(() => {
    const t = toValue(input.title)
    if (!t) return `${SITE_NAME} · 폐업 가전 직거래 플랫폼`
    return t.endsWith(SITE_NAME) ? t : `${t}${TITLE_SUFFIX}`
  })
  const description = computed(() => toValue(input.description) ?? '')
  const canonical = computed(() => `${SITE_ORIGIN}${input.path ?? route.path}`)
  const image = computed(() => toValue(input.image) ?? DEFAULT_OG_IMAGE)

  useHead({
    title: fullTitle,
    link: [{ rel: 'canonical', href: canonical }],
    meta: [
      { name: 'description', content: description },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:url', content: canonical },
      { property: 'og:image', content: image },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
    ],
  })
}
