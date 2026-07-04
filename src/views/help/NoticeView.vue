<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import StaticPage from '@/components/layout/StaticPage.vue'
import Badge from '@/components/ds/Badge.vue'
import { getNotices, type NoticeListItem } from '@/api/help'
import { ApiError } from '@/api/client'
import { formatDate } from '@/design/tokens'

const notices = ref<NoticeListItem[]>([])
const loading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  try {
    const res = await getNotices(1, 50)
    notices.value = res.items
  } catch (err) {
    errorMessage.value = err instanceof ApiError ? err.message : '공지사항을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <StaticPage
    kicker="NOTICE"
    title="공지사항"
    lead="rekit의 새 소식과 서비스 변경 사항을 안내드려요."
  >
    <div v-if="loading" class="state">불러오는 중…</div>
    <div v-else-if="errorMessage" class="state state--error">{{ errorMessage }}</div>
    <div v-else-if="notices.length === 0" class="state">등록된 공지사항이 없습니다.</div>

    <ul v-else class="notices">
      <li v-for="n in notices" :key="n.id" class="notice">
        <RouterLink :to="`/help/notice/${n.id}`" class="notice__link">
          <div class="notice__head">
            <span class="notice__date">{{ formatDate(n.created_at) }}</span>
            <Badge v-if="n.is_pinned" tone="accent" size="xs">고정</Badge>
          </div>
          <div class="notice__title">{{ n.title }}</div>
        </RouterLink>
      </li>
    </ul>
  </StaticPage>
</template>

<style scoped>
.state {
  padding: 40px 0;
  text-align: center;
  color: var(--rekit-ink-subtle);
  font-size: 13.5px;
}
.state--error {
  color: var(--rekit-danger);
}

.notices {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.notice {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 14px;
}
.notice__link {
  display: block;
  padding: 18px 20px;
  text-decoration: none;
  color: inherit;
}
.notice__head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.notice__date {
  font-family: var(--rekit-font-mono);
  font-size: 11.5px;
  color: var(--rekit-ink-subtle);
  font-weight: 600;
}
.notice__title {
  margin-top: 6px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.015em;
}
</style>
