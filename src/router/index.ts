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
    { path: '/auth/find-id', name: 'find-id', component: () => import('../views/auth/FindIdView.vue') },
    { path: '/auth/find-password', name: 'find-password', component: () => import('../views/auth/FindPasswordView.vue') },
    { path: '/auth/callback/:provider', name: 'auth-callback', component: () => import('../views/auth/CallbackView.vue') },
    { path: '/auth/social/sign-up', name: 'social-sign-up', component: () => import('../views/auth/SocialSignUpView.vue') },

    // My page — handles unauthenticated state inline
    { path: '/my', name: 'my', component: () => import('../views/my/MyView.vue') },
    { path: '/my/orders', name: 'my-orders', component: () => import('../views/my/OrdersView.vue') },
    { path: '/my/orders/:id', name: 'my-order-detail', component: () => import('../views/my/OrderDetailView.vue') },
    { path: '/my/wishlist', name: 'my-wishlist', component: () => import('../views/my/WishlistView.vue') },
    { path: '/my/addresses', name: 'my-addresses', component: () => import('../views/my/AddressesView.vue') },
    { path: '/my/profile', name: 'my-profile', component: () => import('../views/my/ProfileView.vue') },

    // Products
    { path: '/products', name: 'products', component: () => import('../views/products/ListView.vue') },
    { path: '/products/:id', name: 'product-detail', component: () => import('../views/products/DetailView.vue') },

    // Search
    { path: '/search', name: 'search', component: () => import('../views/SearchView.vue') },

    // Cart
    { path: '/cart', name: 'cart', component: () => import('../views/cart/CartView.vue') },

    // Checkout
    { path: '/checkout/identity', name: 'checkout-identity', component: () => import('../views/checkout/IdentityView.vue') },
    { path: '/checkout/order', name: 'checkout-order', component: () => import('../views/checkout/OrderView.vue') },
    { path: '/checkout/complete', name: 'checkout-complete', component: () => import('../views/checkout/CompleteView.vue') },

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

    // Admin console
    { path: '/admin', name: 'admin-dashboard', component: () => import('../views/admin/DashboardView.vue') },
    { path: '/admin/products', name: 'admin-products', component: () => import('../views/admin/ProductsView.vue') },
    { path: '/admin/products/new', name: 'admin-product-new', component: () => import('../views/admin/ProductNewView.vue') },
    { path: '/admin/orders', name: 'admin-orders', component: () => import('../views/admin/OrdersView.vue') },
    { path: '/admin/members', name: 'admin-members', component: () => import('../views/admin/MembersView.vue') },
    { path: '/admin/sales', name: 'admin-sales', component: () => import('../views/admin/SalesView.vue') },

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
