<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AdminShell from '@/components/admin/AdminShell.vue'
import Badge from '@/components/ds/Badge.vue'
import Button from '@/components/ds/Button.vue'
import IconBase from '@/components/ds/IconBase.vue'
import { won } from '@/design/tokens'
import {
  getAdminMemberSummary,
  listAdminMembers,
  updateMemberStatus,
} from '@/api/admin/members'
import type { AdminMemberItem, AdminMemberSummary, UserStatus } from '@/api/admin/members'
import { ApiError } from '@/api/client'
import { statusTone, statusLabel } from '@/stores/members-helpers'

const summary = ref<AdminMemberSummary | null>(null)
const members = ref<AdminMemberItem[]>([])
const search = ref('')
const loading = ref(false)
const actionError = ref('')

let searchTimer: ReturnType<typeof setTimeout>

const summaryCards = [
  { key: 'total' as const, l: '전체 회원', s: '명' },
  { key: 'verified' as const, l: '인증 완료', s: '명' },
  { key: 'new_this_week' as const, l: '신규 (이번주)', s: '명' },
  { key: 'purchased' as const, l: '구매 회원', s: '명' },
]

async function load() {
  loading.value = true
  try {
    const res = await listAdminMembers({
      q: search.value.trim() || undefined,
      size: 50,
    })
    members.value = res.items
  } catch (err) {
    console.error('[admin/members]', err)
  } finally {
    loading.value = false
  }
}

function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(load, 300)
}

async function toggleStatus(m: AdminMemberItem) {
  const next: UserStatus = m.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE'
  const label = next === 'BANNED' ? '제재' : '활성화'
  if (!confirm(`"${m.username}" 회원을 ${label}하시겠습니까?`)) return
  try {
    const updated = await updateMemberStatus(m.id, next)
    const idx = members.value.findIndex((x) => x.id === m.id)
    if (idx !== -1) members.value[idx] = updated as unknown as AdminMemberItem
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : '상태 변경 중 오류가 발생했습니다.'
  }
}

function formatDate(iso: string): string {
  return iso.slice(0, 10).replaceAll('-', '.')
}

onMounted(async () => {
  const [, s] = await Promise.all([load(), getAdminMemberSummary()])
  summary.value = s
})
</script>

<template>
  <AdminShell
    active="members"
    title="회원 관리"
    :subtitle="summary ? `총 ${summary.total}명 · 인증완료 ${summary.verified}명` : ''"
  >
    <template #header-right>
      <div class="search">
        <IconBase name="search" :size="16" />
        <input
          v-model="search"
          type="search"
          placeholder="이름, 이메일, 전화번호"
          @input="onSearch"
        />
      </div>
    </template>

    <div v-if="summary" class="summary-cards">
      <div v-for="c in summaryCards" :key="c.key" class="summary-card">
        <div class="summary-card__label">{{ c.l }}</div>
        <div class="summary-card__val">{{ summary[c.key] }}<span class="summary-card__s">{{ c.s }}</span></div>
      </div>
    </div>

    <div v-if="actionError" class="action-error">
      <IconBase name="info" :size="14" />
      {{ actionError }}
      <button type="button" class="action-error__close" @click="actionError = ''">✕</button>
    </div>

    <div class="table">
      <div class="table__head">
        <span>이름</span><span>이메일</span><span>전화번호</span><span>인증</span><span>가입일</span><span>주문</span><span>총구매</span><span>상태</span><span />
      </div>
      <div
        v-for="(m, i) in members"
        :key="m.id"
        class="table__row"
        :class="{ 'table__row--first': i === 0 }"
      >
        <RouterLink :to="`/admin/members/${m.id}`" class="name">{{ m.username }}</RouterLink>
        <div class="email">{{ m.email }}</div>
        <div class="phone">{{ m.phone ?? '—' }}</div>
        <Badge :tone="m.verified ? 'accent' : 'neutral'" size="sm">{{ m.verified ? '완료' : '미완' }}</Badge>
        <span class="cell-muted">{{ formatDate(m.created_at) }}</span>
        <span class="orders">{{ m.order_count }}건</span>
        <span class="total">{{ won(m.total_purchased) }}</span>
        <Badge :tone="statusTone(m.status)" size="sm">{{ statusLabel(m.status) }}</Badge>
        <Button
          :variant="m.status === 'ACTIVE' ? 'secondary' : 'accent'"
          size="sm"
          @click="toggleStatus(m)"
        >
          {{ m.status === 'ACTIVE' ? '제재' : '활성화' }}
        </Button>
      </div>
      <div v-if="!loading && members.length === 0" class="empty">회원이 없습니다.</div>
      <div v-if="loading" class="empty">불러오는 중…</div>
    </div>
  </AdminShell>
</template>

<style scoped>
.search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 12px;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--rekit-ink-subtle);
}
.search input {
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
  color: var(--rekit-ink);
  width: 200px;
}
.search input::placeholder { color: var(--rekit-ink-placeholder); }

.summary-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.summary-card {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 14px;
  padding: 16px;
}
.summary-card__label {
  font-size: 12px;
  color: var(--rekit-ink-subtle);
  font-weight: 600;
}
.summary-card__val {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-top: 6px;
}
.summary-card__s {
  font-size: 12px;
  font-weight: 600;
  color: var(--rekit-ink-subtle);
  margin-left: 4px;
}

.action-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #FFF0F0;
  border: 1px solid var(--rekit-danger);
  border-radius: 12px;
  font-size: 12.5px;
  color: var(--rekit-danger);
  margin-bottom: 12px;
}
.action-error__close {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--rekit-danger);
  font-size: 12px;
}

.table {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  overflow: hidden;
}
.table__head,
.table__row {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr 1fr 0.6fr 0.7fr 0.5fr 0.8fr 0.6fr 80px;
  padding: 12px 16px;
  align-items: center;
  gap: 8px;
}
.table__head {
  background: var(--rekit-surface-muted);
  color: var(--rekit-ink-muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.table__row {
  padding: 14px 16px;
  font-size: 13px;
  border-top: 1px solid var(--rekit-border);
}
.table__row--first { border-top: 0; }
.name { font-weight: 600; text-decoration: none; color: inherit; }
.name:hover { color: var(--rekit-accent-deep); }
.email,
.phone {
  font-size: 12px;
  color: var(--rekit-ink-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cell-muted { color: var(--rekit-ink-subtle); font-size: 12px; }
.orders { font-weight: 600; }
.total { font-weight: 700; font-size: 12.5px; }
.empty {
  padding: 40px 16px;
  text-align: center;
  color: var(--rekit-ink-subtle);
  font-size: 13px;
}

@media (min-width: 768px) {
  .summary-cards { grid-template-columns: repeat(4, 1fr); }
}

@media (max-width: 1023px) {
  .table { overflow-x: auto; }
  .table__head,
  .table__row { min-width: 960px; }
}
</style>
