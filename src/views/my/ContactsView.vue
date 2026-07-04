<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import IconBase from '@/components/ds/IconBase.vue'
import Badge from '@/components/ds/Badge.vue'
import { useAuthStore } from '@/stores/auth'
import { getMyContacts, type MyContactListItem, type MyContactStatus } from '@/api/help'
import { ApiError } from '@/api/client'
import { formatDate } from '@/design/tokens'
import { contactStatusLabel, contactStatusTone } from '@/stores/contacts-helpers'

const auth = useAuthStore()

const FILTERS: { key: MyContactStatus | 'all'; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'PENDING', label: contactStatusLabel('PENDING') },
  { key: 'ANSWERED', label: contactStatusLabel('ANSWERED') },
]

const filter = ref<MyContactStatus | 'all'>('all')
const contacts = ref<MyContactListItem[]>([])
const loading = ref(true)
const errorMessage = ref('')

async function load() {
  if (!auth.isAuthenticated) return
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await getMyContacts(1, 50)
    contacts.value = res.items
  } catch (err) {
    errorMessage.value = err instanceof ApiError ? err.message : '문의 내역을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

onMounted(load)

const filteredContacts = computed(() =>
  contacts.value.filter((c) => filter.value === 'all' || c.status === filter.value),
)
</script>

<template>
  <!-- Guest fallback (mirrors OrdersView pattern) -->
  <div v-if="!auth.isAuthenticated" class="guest">
    <div class="guest__icon">
      <IconBase name="mail" :size="36" :stroke="1.5" />
    </div>
    <h1 class="guest__t">로그인하면 문의 내역을 볼 수 있어요</h1>
    <p class="guest__b">내가 남긴 1:1 문의와 답변 상태를 확인하세요.</p>
    <RouterLink to="/auth/sign-in?redirect=/my/contacts" class="guest__btn">로그인</RouterLink>
  </div>

  <div v-else class="page">
    <header class="page__head">
      <h1 class="page__title">내 문의내역</h1>
      <RouterLink to="/help/contact" class="page__new">문의하기</RouterLink>
    </header>

    <nav class="tabs" aria-label="상태 필터">
      <button
        v-for="f in FILTERS"
        :key="f.key"
        type="button"
        class="tab"
        :class="{ 'tab--active': filter === f.key }"
        @click="filter = f.key"
      >
        {{ f.label }}
      </button>
    </nav>

    <div v-if="loading" class="state">불러오는 중…</div>
    <div v-else-if="errorMessage" class="state state--error">{{ errorMessage }}</div>

    <template v-else>
      <div v-if="filteredContacts.length === 0" class="empty">
        <div class="empty__icon">
          <IconBase name="mail" :size="32" :stroke="1.5" />
        </div>
        <h2 class="empty__t">
          {{ filter === 'all' ? '아직 문의 내역이 없어요' : '해당 상태의 문의가 없어요' }}
        </h2>
        <RouterLink v-if="filter === 'all'" to="/help/contact" class="empty__btn">문의하기</RouterLink>
      </div>

      <ul v-else class="list">
        <li v-for="c in filteredContacts" :key="c.id">
          <RouterLink :to="`/my/contacts/${c.id}`" class="card">
            <div class="card__head">
              <Badge :tone="contactStatusTone(c.status)" size="sm">
                {{ contactStatusLabel(c.status) }}
              </Badge>
              <span class="card__date">{{ formatDate(c.created_at) }}</span>
            </div>
            <div class="card__row">
              <div class="card__title">{{ c.title }}</div>
              <IconBase name="chevronRight" :size="16" class="card__chev" />
            </div>
          </RouterLink>
        </li>
      </ul>
    </template>
  </div>
</template>

<style scoped>
.page {
  max-width: 720px;
  margin: 0 auto;
  padding: 16px 16px 32px;
}
@media (min-width: 768px) {
  .page {
    padding: 32px 24px 56px;
  }
}

.page__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.page__title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.025em;
}
@media (min-width: 768px) {
  .page__title {
    font-size: 28px;
  }
}
.page__new {
  font-size: 13px;
  font-weight: 700;
  color: var(--rekit-accent-deep);
  text-decoration: none;
}
.page__new:hover {
  text-decoration: underline;
}

.tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
}
.tab {
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  background: var(--rekit-surface);
  color: var(--rekit-ink-muted);
  border: 1px solid var(--rekit-border);
  cursor: pointer;
}
.tab--active {
  background: var(--rekit-ink);
  color: #fff;
  border-color: var(--rekit-ink);
}

.state {
  padding: 40px 0;
  text-align: center;
  color: var(--rekit-ink-subtle);
  font-size: 13.5px;
}
.state--error {
  color: var(--rekit-danger);
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.card {
  display: block;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  padding: 16px 18px;
  text-decoration: none;
  color: inherit;
}
.card:hover {
  background: var(--rekit-surface-muted);
}
.card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card__date {
  font-size: 11.5px;
  color: var(--rekit-ink-subtle);
  font-family: var(--rekit-font-mono);
}
.card__row {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.card__title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.015em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card__chev {
  color: var(--rekit-ink-subtle);
  flex-shrink: 0;
}

.empty {
  text-align: center;
  padding: 64px 20px;
}
.empty__icon {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  background: var(--rekit-surface-muted);
  color: var(--rekit-ink-subtle);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.empty__t {
  margin: 16px 0 0;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.empty__btn {
  margin-top: 20px;
  display: inline-block;
  padding: 12px 22px;
  background: var(--rekit-ink);
  color: #fff;
  border-radius: 12px;
  font-weight: 700;
  text-decoration: none;
  font-size: 13.5px;
}

.guest {
  max-width: 380px;
  margin: 80px auto;
  text-align: center;
  padding: 0 20px;
}
.guest__icon {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  background: var(--rekit-accent-soft);
  color: var(--rekit-accent-deep);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}
.guest__t {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.025em;
}
.guest__b {
  margin: 8px 0 24px;
  color: var(--rekit-ink-muted);
  font-size: 13.5px;
}
.guest__btn {
  display: inline-block;
  padding: 14px 28px;
  background: var(--rekit-accent);
  color: #fff;
  border-radius: 12px;
  font-weight: 700;
  text-decoration: none;
}
</style>
