import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ========== REAL APP ==========
    { path: '/', name: 'home', component: HomeView },

    // Auth
    { path: '/auth/sign-in', name: 'sign-in', component: () => import('../views/auth/SignInView.vue') },
    { path: '/auth/sign-up', name: 'sign-up', component: () => import('../views/auth/SignUpView.vue') },

    // My page — handles unauthenticated state inline
    { path: '/my', name: 'my', component: () => import('../views/my/MyView.vue') },

    // Products
    { path: '/products', name: 'products', component: () => import('../views/products/ListView.vue') },

    // Static / marketing pages
    { path: '/guide', name: 'guide', component: () => import('../views/static/GuideView.vue') },
    { path: '/about', name: 'about', component: () => import('../views/static/AboutView.vue') },

    // Help
    { path: '/help/faq', name: 'help-faq', component: () => import('../views/help/FaqView.vue') },
    { path: '/help/contact', name: 'help-contact', component: () => import('../views/help/ContactView.vue') },
    { path: '/help/notice', name: 'help-notice', component: () => import('../views/help/NoticeView.vue') },

    // Legal
    { path: '/legal/terms', name: 'legal-terms', component: () => import('../views/legal/TermsView.vue') },
    { path: '/legal/privacy', name: 'legal-privacy', component: () => import('../views/legal/PrivacyView.vue') },

    // ========== DESIGN REFERENCE ==========
    // Faithful Vue ports of the original design canvas screens.
    // Source code lives under src/_design/. Do not import from there in real app code.

    { path: '/_design', name: 'design-index', component: () => import('../_design/IndexView.vue') },

    // Buyer (mobile mockup)
    { path: '/_design/buyer/auth', component: () => import('../_design/buyer/AuthView.vue') },
    { path: '/_design/buyer/home', component: () => import('../_design/buyer/HomeView.vue') },
    { path: '/_design/buyer/list', component: () => import('../_design/buyer/ListView.vue') },
    { path: '/_design/buyer/detail', component: () => import('../_design/buyer/DetailView.vue') },
    { path: '/_design/buyer/cart', component: () => import('../_design/buyer/CartView.vue') },
    { path: '/_design/buyer/identity', component: () => import('../_design/buyer/IdentityView.vue') },
    { path: '/_design/buyer/order', component: () => import('../_design/buyer/OrderView.vue') },
    { path: '/_design/buyer/complete', component: () => import('../_design/buyer/CompleteView.vue') },
    { path: '/_design/buyer/my', component: () => import('../_design/buyer/MyView.vue') },

    // Admin (desktop mockup)
    { path: '/_design/admin', component: () => import('../_design/admin/DashboardView.vue') },
    { path: '/_design/admin/products', component: () => import('../_design/admin/ProductsView.vue') },
    { path: '/_design/admin/orders', component: () => import('../_design/admin/OrdersView.vue') },
    { path: '/_design/admin/members', component: () => import('../_design/admin/MembersView.vue') },
    { path: '/_design/admin/sales', component: () => import('../_design/admin/SalesView.vue') },

    // Desktop overview (mockup)
    { path: '/_design/desktop/home', component: () => import('../_design/desktop/HomeView.vue') },
    { path: '/_design/desktop/detail', component: () => import('../_design/desktop/DetailView.vue') },

    // 404 catch-all (must be last)
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue') },
  ],
})

export default router
