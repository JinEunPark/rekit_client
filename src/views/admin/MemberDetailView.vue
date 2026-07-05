<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AdminShell from '@/components/admin/AdminShell.vue'
import Badge from '@/components/ds/Badge.vue'
import Button from '@/components/ds/Button.vue'
import IconBase from '@/components/ds/IconBase.vue'
import { won, formatDateTime } from '@/design/tokens'
import { getAdminMember, updateMemberStatus } from '@/api/admin/members'
import type { AdminMemberDetail, UserStatus } from '@/api/admin/members'
import { ApiError } from '@/api/client'
import { statusTone, statusLabel } from '@/stores/members-helpers'

const route = useRoute()
const memberId = computed(() => Number(route.params.id))

const member = ref<AdminMemberDetail | null>(null)
const loading = ref(true)
const errorMessage = ref('')
const actionError = ref('')
const statusSaving = ref(false)

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    member.value = await getAdminMember(memberId.value)
  } catch (err) {
    errorMessage.value = err instanceof ApiError ? err.message : '회원 정보를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

async function toggleStatus() {
  if (!member.value) return
  const next: UserStatus = member.value.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE'
  const label = next === 'BANNED' ? '제재' : '활성화'
  if (!confirm(`"${member.value.username}" 회원을 ${label}하시겠습니까?`)) return
  statusSaving.value = true
  actionError.value = ''
  try {
    member.value = await updateMemberStatus(member.value.id, next)
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : '상태 변경 중 오류가 발생했습니다.'
  } finally {
    statusSaving.value = false
  }
}

onMounted(load)
</script>

<template>
  <AdminShell active="members" title="회원 상세" :subtitle="member?.username">
    <RouterLink to="/admin/members" class="back">
      <IconBase name="chevronLeft" :size="16" /> 회원 관리
    </RouterLink>

    <div v-if="loading" class="state">불러오는 중…</div>
    <div v-else-if="errorMessage" class="state state--error">{{ errorMessage }}</div>

    <template v-else-if="member">
      <div v-if="actionError" class="action-error">
        <IconBase name="info" :size="14" />
        {{ actionError }}
        <button type="button" class="action-error__close" @click="actionError = ''">✕</button>
      </div>

      <section class="block">
        <div class="block__head">
          <Badge :tone="statusTone(member.status)" size="md">{{ statusLabel(member.status) }}</Badge>
          <Badge v-if="member.role === 'ADMIN'" tone="info" size="md">관리자</Badge>
          <Badge :tone="member.verified ? 'accent' : 'neutral'" size="md">{{ member.verified ? '인증완료' : '인증미완' }}</Badge>
        </div>

        <div class="actions">
          <Button
            :variant="member.status === 'ACTIVE' ? 'secondary' : 'accent'"
            size="sm"
            :disabled="statusSaving"
            @click="toggleStatus"
          >
            {{ member.status === 'ACTIVE' ? '제재' : '활성화' }}
          </Button>
        </div>
      </section>

      <section class="block">
        <h2 class="block__title">기본 정보</h2>
        <dl class="kv">
          <div class="kv__row"><dt>아이디</dt><dd>{{ member.login_id }}</dd></div>
          <div class="kv__row"><dt>이름</dt><dd>{{ member.username }}</dd></div>
          <div class="kv__row"><dt>이메일</dt><dd>{{ member.email }}</dd></div>
          <div class="kv__row"><dt>전화번호</dt><dd>{{ member.phone ?? '—' }}</dd></div>
          <div class="kv__row"><dt>가입일</dt><dd>{{ formatDateTime(member.created_at) }}</dd></div>
        </dl>
      </section>

      <section class="block">
        <h2 class="block__title">구매 활동</h2>
        <dl class="kv">
          <div class="kv__row"><dt>주문 건수</dt><dd>{{ member.order_count }}건</dd></div>
          <div class="kv__row"><dt>누적 구매액</dt><dd>{{ won(member.total_purchased) }}</dd></div>
        </dl>
      </section>

      <section class="block">
        <h2 class="block__title">인증 상태</h2>
        <dl class="kv">
          <div class="kv__row">
            <dt>휴대폰 인증</dt>
            <dd>{{ member.phone_verified_at ? formatDateTime(member.phone_verified_at) : '미인증' }}</dd>
          </div>
          <div class="kv__row">
            <dt>본인 인증</dt>
            <dd>{{ member.identity_verified_at ? formatDateTime(member.identity_verified_at) : '미인증' }}</dd>
          </div>
          <div class="kv__row">
            <dt>마케팅 수신 동의</dt>
            <dd>{{ member.agreed_marketing_at ? formatDateTime(member.agreed_marketing_at) : '미동의' }}</dd>
          </div>
        </dl>
      </section>
    </template>
  </AdminShell>
</template>

<style scoped>
.back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--rekit-ink-muted);
  text-decoration: none;
  margin-bottom: 16px;
}
.back:hover { color: var(--rekit-ink); }

.state {
  padding: 40px 0;
  text-align: center;
  color: var(--rekit-ink-subtle);
  font-size: 13.5px;
}
.state--error { color: var(--rekit-danger); }

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
.action-error__close { margin-left: auto; background: none; border: none; cursor: pointer; color: var(--rekit-danger); font-size: 12px; }

.block {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 12px;
}
.block__head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.block__title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.actions {
  margin-top: 14px;
  display: flex;
  gap: 8px;
}

.kv { margin: 0; }
.kv__row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
}
.kv__row dt { margin: 0; color: var(--rekit-ink-muted); }
.kv__row dd { margin: 0; font-weight: 600; }
</style>
