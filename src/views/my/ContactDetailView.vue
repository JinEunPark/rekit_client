<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import IconBase from '@/components/ds/IconBase.vue'
import Badge from '@/components/ds/Badge.vue'
import { useAuthStore } from '@/stores/auth'
import { getMyContactDetail, type MyContactDetail } from '@/api/help'
import { ApiError } from '@/api/client'
import { formatDateTime } from '@/design/tokens'
import { contactStatusLabel, contactStatusTone } from '@/stores/contacts-helpers'

const route = useRoute()
const auth = useAuthStore()
const contactId = computed(() => Number(route.params.id))

const contact = ref<MyContactDetail | null>(null)
const loading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  if (!auth.isAuthenticated) {
    loading.value = false
    return
  }
  try {
    contact.value = await getMyContactDetail(contactId.value)
  } catch (err) {
    errorMessage.value = err instanceof ApiError ? err.message : '문의를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <!-- Guest fallback (mirrors ContactsView pattern) -->
  <div v-if="!auth.isAuthenticated" class="guest">
    <div class="guest__icon">
      <IconBase name="mail" :size="36" :stroke="1.5" />
    </div>
    <h1 class="guest__t">로그인이 필요해요</h1>
    <p class="guest__b">본인 문의만 확인할 수 있어요.</p>
    <RouterLink :to="`/auth/sign-in?redirect=/my/contacts/${contactId}`" class="guest__btn">로그인</RouterLink>
  </div>

  <div v-else class="page">
    <header class="head">
      <RouterLink to="/my/contacts" class="head__back">
        <IconBase name="chevronLeft" :size="18" /> 내 문의내역
      </RouterLink>
    </header>

    <div v-if="loading" class="state">불러오는 중…</div>
    <div v-else-if="errorMessage" class="state state--error">{{ errorMessage }}</div>

    <template v-else-if="contact">
      <section class="block">
        <div class="block__head">
          <Badge :tone="contactStatusTone(contact.status)" size="sm">
            {{ contactStatusLabel(contact.status) }}
          </Badge>
          <span class="block__date">{{ formatDateTime(contact.created_at) }}</span>
        </div>
        <h1 class="block__title">{{ contact.title }}</h1>
        <p class="block__content">{{ contact.content }}</p>
      </section>

      <section v-if="contact.status === 'ANSWERED'" class="block block--answer">
        <div class="block__head">
          <h2 class="answer__title">답변</h2>
          <span v-if="contact.answered_at" class="block__date">{{ formatDateTime(contact.answered_at) }}</span>
        </div>
        <p class="block__content">{{ contact.answer_content }}</p>
      </section>

      <div v-else class="waiting">
        <IconBase name="mail" :size="20" :stroke="1.5" />
        영업일 1~2일 내 답변드릴게요.
      </div>
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

.head {
  margin-bottom: 16px;
}
.head__back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--rekit-ink-muted);
  text-decoration: none;
}
.head__back:hover {
  color: var(--rekit-ink);
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

.block {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 12px;
}
.block--answer {
  background: var(--rekit-accent-soft);
  border-color: #cce4d6;
}
.block__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.block__date {
  font-size: 11.5px;
  color: var(--rekit-ink-subtle);
  font-family: var(--rekit-font-mono);
}
.block__title {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.block__content {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--rekit-ink);
  white-space: pre-line;
}
.answer__title {
  margin: 0;
  font-size: 14px;
  font-weight: 800;
  color: var(--rekit-accent-ink);
}

.waiting {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  background: var(--rekit-surface-muted);
  border-radius: 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--rekit-ink-muted);
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
