/**
 * 색인 대상 공개 정적 라우트. gen-sitemap.mjs 와 prerender.mjs 가 공유한다.
 * 동적 상세 페이지(/products/:id, /help/notice/:id)는 백엔드 연동 후 추가.
 */
export const SITE_ORIGIN = 'https://rekit.co.kr'

/** @type {{ path: string, changefreq: string, priority: string }[]} */
export const PUBLIC_ROUTES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/products', changefreq: 'daily', priority: '0.9' },
  { path: '/guide', changefreq: 'monthly', priority: '0.7' },
  { path: '/about', changefreq: 'monthly', priority: '0.6' },
  { path: '/help/faq', changefreq: 'monthly', priority: '0.5' },
  { path: '/help/contact', changefreq: 'yearly', priority: '0.4' },
  { path: '/help/notice', changefreq: 'weekly', priority: '0.5' },
  { path: '/legal/terms', changefreq: 'yearly', priority: '0.3' },
  { path: '/legal/privacy', changefreq: 'yearly', priority: '0.3' },
]
