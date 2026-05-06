<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import RekitLogo from '@/components/ds/RekitLogo.vue'
import IconBase from '@/components/ds/IconBase.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import SearchDropdown from '@/components/search/SearchDropdown.vue'
import type { IconName } from '@/design/icons'

const auth = useAuthStore()
const cart = useCartStore()

// Drawer is auxiliary navigation — primary category browsing happens via the
// home Categories grid, the /products page, and (mobile) the bottom tab bar.
// So drawer focuses on account + help links instead of duplicating categories.
const helpLinks: { to: string; icon: IconName; label: string }[] = [
  { to: '/products', icon: 'grid', label: '전체 상품 둘러보기' },
  { to: '/guide', icon: 'info', label: '이용 안내' },
  { to: '/help/faq', icon: 'shield', label: '자주 묻는 질문' },
  { to: '/help/contact', icon: 'mail', label: '문의하기' },
  { to: '/help/notice', icon: 'bell', label: '공지사항' },
]

const drawerOpen = ref(false)
</script>

<template>
  <header class="hd">
    <div class="hd__inner">
      <!-- Mobile: hamburger -->
      <button class="hd__hamburger" aria-label="메뉴" @click="drawerOpen = true">
        <IconBase name="menu" :size="22" />
      </button>

      <RouterLink to="/" class="hd__logo">
        <RekitLogo :size="22" />
      </RouterLink>

      <!-- Desktop: search dropdown (anchored panel). Mobile uses search icon link to /search. -->
      <SearchDropdown class="hd__search" />

      <div class="hd__actions">
        <RouterLink to="/search" class="hd__icon hd__icon--mobile-only" aria-label="검색">
          <IconBase name="search" :size="22" />
        </RouterLink>
        <RouterLink to="/my/wishlist" class="hd__icon hd__icon--desktop-only" aria-label="관심상품">
          <IconBase name="heart" :size="20" />
        </RouterLink>
        <RouterLink to="/cart" class="hd__icon" aria-label="장바구니">
          <IconBase name="cart" :size="20" />
          <span v-if="cart.count > 0" class="hd__icon-badge">{{ cart.count > 99 ? '99+' : cart.count }}</span>
        </RouterLink>
        <RouterLink to="/my" class="hd__icon hd__icon--desktop-only" aria-label="마이페이지">
          <IconBase name="user" :size="20" />
        </RouterLink>
      </div>
    </div>

    <!-- Mobile drawer -->
    <Transition name="drawer">
      <div v-if="drawerOpen" class="hd__overlay" @click="drawerOpen = false">
        <aside class="hd__drawer" @click.stop>
          <div class="hd__drawer-head">
            <RekitLogo :size="22" />
            <button aria-label="닫기" @click="drawerOpen = false">
              <IconBase name="close" :size="22" />
            </button>
          </div>
          <RouterLink
            v-if="!auth.user"
            to="/auth/sign-in"
            class="hd__drawer-cta"
            @click="drawerOpen = false"
          >
            <IconBase name="user" :size="18" />
            로그인 / 회원가입
          </RouterLink>
          <RouterLink
            v-else
            to="/my"
            class="hd__drawer-cta hd__drawer-cta--user"
            @click="drawerOpen = false"
          >
            <span class="hd__drawer-avatar">{{ auth.initial }}</span>
            <span class="hd__drawer-name">
              {{ auth.user.username }} 님
              <span class="hd__drawer-mail">{{ auth.user.email }}</span>
            </span>
            <IconBase name="chevronRight" :size="14" />
          </RouterLink>
          <nav class="hd__drawer-nav">
            <RouterLink
              v-for="item in helpLinks"
              :key="item.to"
              :to="item.to"
              class="hd__drawer-link"
              @click="drawerOpen = false"
            >
              <IconBase :name="item.icon" :size="18" class="hd__drawer-link-icon" />
              <span>{{ item.label }}</span>
              <IconBase name="chevronRight" :size="14" class="hd__drawer-link-chev" />
            </RouterLink>
          </nav>
        </aside>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.hd {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--rekit-surface);
  border-bottom: 1px solid var(--rekit-border);
}

.hd__inner {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}

.hd__hamburger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: var(--rekit-ink);
}

.hd__logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  flex-shrink: 0;
}

/* Wrapper for the desktop SearchDropdown — sizing only; visual styling lives in the component. */
.hd__search {
  display: none;
  flex: 1;
  max-width: 560px;
  margin: 0 auto;
}

.hd__actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.hd__icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: var(--rekit-ink-muted);
  text-decoration: none;
}

.hd__icon-badge {
  position: absolute;
  top: 4px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--rekit-danger);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  letter-spacing: -0.02em;
}

.hd__icon:hover {
  color: var(--rekit-ink);
  background: var(--rekit-surface-muted);
}

.hd__icon--desktop-only {
  display: none;
}

@media (min-width: 768px) {
  .hd__inner {
    padding: 14px 32px;
    gap: 24px;
  }
  .hd__hamburger,
  .hd__icon--mobile-only {
    display: none;
  }
  .hd__search {
    display: block;
  }
  .hd__icon--desktop-only {
    display: flex;
  }
}

/* Mobile drawer */
.hd__overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 20, 15, 0.4);
  z-index: 100;
}
.hd__drawer {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: min(320px, 80%);
  background: var(--rekit-surface);
  display: flex;
  flex-direction: column;
}
.hd__drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--rekit-border);
}
.hd__drawer-head button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hd__drawer-cta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 16px 8px;
  padding: 14px 16px;
  background: var(--rekit-accent-soft);
  color: var(--rekit-accent-ink);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
}
.hd__drawer-cta--user {
  background: var(--rekit-surface-muted);
  color: var(--rekit-ink);
}
.hd__drawer-avatar {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: var(--rekit-accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  flex-shrink: 0;
}
.hd__drawer-name {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.hd__drawer-mail {
  margin-top: 2px;
  font-size: 11.5px;
  color: var(--rekit-ink-subtle);
  font-weight: 500;
}
.hd__drawer-nav {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
}
.hd__drawer-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  color: var(--rekit-ink);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}
.hd__drawer-link:hover {
  background: var(--rekit-surface-muted);
}
.hd__drawer-link span {
  flex: 1;
}
.hd__drawer-link-icon {
  color: var(--rekit-ink-muted);
}
.hd__drawer-link-chev {
  color: var(--rekit-ink-subtle);
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.18s ease;
}
.drawer-enter-active .hd__drawer,
.drawer-leave-active .hd__drawer {
  transition: transform 0.22s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-from .hd__drawer,
.drawer-leave-to .hd__drawer {
  transform: translateX(-100%);
}
</style>
