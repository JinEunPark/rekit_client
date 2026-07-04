<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import StaticPage from '@/components/layout/StaticPage.vue'
import Badge from '@/components/ds/Badge.vue'
import { getNoticeDetail, type NoticeDetail } from '@/api/help'
import { ApiError } from '@/api/client'
import { formatDate } from '@/design/tokens'

const route = useRoute()
const noticeId = computed(() => Number(route.params.id))

const notice = ref<NoticeDetail | null>(null)
const loading = ref(true)
const errorMessage = ref('')

async function load(id: number) {
  loading.value = true
  errorMessage.value = ''
  try {
    notice.value = await getNoticeDetail(id)
  } catch (err) {
    errorMessage.value = err instanceof ApiError ? err.message : '공지사항을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

onMounted(() => void load(noticeId.value))
watch(noticeId, (id) => void load(id))
</script>

<template>
  <StaticPage kicker="NOTICE" :title="notice?.title ?? '공지사항'">
    <div v-if="loading" class="state">불러오는 중…</div>
    <div v-else-if="errorMessage" class="state state--error">{{ errorMessage }}</div>

    <template v-else-if="notice">
      <div class="meta">
        <span class="meta__date">{{ formatDate(notice.created_at) }}</span>
        <Badge v-if="notice.is_pinned" tone="accent" size="xs">고정</Badge>
      </div>
      <p class="content">{{ notice.content }}</p>
    </template>

    <RouterLink to="/help/notice" class="back">공지사항 목록으로</RouterLink>
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
.meta {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--rekit-border);
  margin-bottom: 20px;
}
.meta__date {
  font-family: var(--rekit-font-mono);
  font-size: 12px;
  color: var(--rekit-ink-subtle);
  font-weight: 600;
}
.content {
  font-size: 14.5px;
  line-height: 1.8;
  color: var(--rekit-ink);
  white-space: pre-line;
}
.back {
  display: inline-block;
  margin-top: 32px;
  font-size: 13px;
  font-weight: 600;
  color: var(--rekit-ink-muted);
  text-decoration: none;
}
.back:hover {
  color: var(--rekit-ink);
}
</style>
