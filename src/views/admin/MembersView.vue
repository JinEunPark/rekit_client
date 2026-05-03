<script setup lang="ts">
import { computed, ref } from 'vue'
import AdminShell from '@/components/admin/AdminShell.vue'
import Badge from '@/components/ds/Badge.vue'
import IconBase from '@/components/ds/IconBase.vue'

interface Member {
  name: string
  email: string
  phone: string
  verified: boolean
  joined: string
  orders: number
  total: string
  status: '활성' | '제재'
}

const summary = [
  { l: '전체 회원', v: '312', s: '명' },
  { l: '인증 완료', v: '287', s: '명' },
  { l: '신규 (이번주)', v: '23', s: '명' },
  { l: '구매 회원', v: '184', s: '명' },
]

const members: Member[] = [
  { name: '박은영', email: 'eunyoung@rekit.kr', phone: '010-1234-5678', verified: true,  joined: '2026.04.10', orders: 3, total: '1,240,000원', status: '활성' },
  { name: '이민호', email: 'minho.lee@gmail.com', phone: '010-2345-6789', verified: true,  joined: '2026.04.12', orders: 1, total: '480,000원',  status: '활성' },
  { name: '최선우', email: 'sunwoo@naver.com',   phone: '010-3456-7890', verified: true,  joined: '2026.04.15', orders: 2, total: '610,000원',  status: '활성' },
  { name: '정현지', email: 'hyunji.j@kakao.com', phone: '010-4567-8901', verified: false, joined: '2026.04.20', orders: 0, total: '0원',        status: '활성' },
  { name: '윤도현', email: 'dohyun@gmail.com',   phone: '010-5678-9012', verified: true,  joined: '2026.04.22', orders: 1, total: '38,000원',   status: '제재' },
  { name: '한지민', email: 'jimin.han@daum.net', phone: '010-6789-0123', verified: true,  joined: '2026.04.25', orders: 1, total: '290,000원',  status: '활성' },
]

const search = ref('')
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return members
  return members.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.phone.includes(q),
  )
})
</script>

<template>
  <AdminShell active="members" title="회원 관리" subtitle="총 312명 · 인증완료 287명">
    <template #header-right>
      <div class="search">
        <IconBase name="search" :size="16" />
        <input v-model="search" type="search" placeholder="이름, 이메일, 휴대폰 검색" />
      </div>
    </template>

    <div class="kpis">
      <div v-for="k in summary" :key="k.l" class="kpi">
        <div class="kpi__label">{{ k.l }}</div>
        <div class="kpi__v">
          <span>{{ k.v }}</span>
          <span class="kpi__s">{{ k.s }}</span>
        </div>
      </div>
    </div>

    <div class="table">
      <div class="table__head">
        <span /><span>이름</span><span>이메일 / 휴대폰</span><span>본인인증</span><span>가입일</span><span>주문</span><span>구매액</span><span>상태</span><span />
      </div>
      <div v-for="(m, i) in filtered" :key="m.email" class="table__row" :class="{ 'table__row--first': i === 0 }">
        <span class="cb" />
        <div class="who">
          <div class="avatar">{{ m.name[0] }}</div>
          <span class="name">{{ m.name }}</span>
        </div>
        <div>
          <div class="email">{{ m.email }}</div>
          <div class="phone">{{ m.phone }}</div>
        </div>
        <span>
          <Badge v-if="m.verified" tone="accent" size="sm">
            <IconBase name="check" :size="10" /> 인증완료
          </Badge>
          <Badge v-else tone="outline" size="sm">미인증</Badge>
        </span>
        <span class="joined">{{ m.joined }}</span>
        <span class="orders">{{ m.orders }}건</span>
        <span class="total">{{ m.total }}</span>
        <span><Badge :tone="m.status === '제재' ? 'danger' : 'accent'" size="sm">{{ m.status }}</Badge></span>
        <button class="row-action" aria-label="상세">
          <IconBase name="chevronRight" :size="16" />
        </button>
      </div>
      <div v-if="filtered.length === 0" class="empty">검색 결과가 없습니다.</div>
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

.kpis {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}
.kpi {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  padding: 16px;
}
.kpi__label {
  font-size: 12px;
  color: var(--rekit-ink-subtle);
  font-weight: 600;
}
.kpi__v {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 6px;
}
.kpi__v span:first-child {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.025em;
}
.kpi__s {
  font-size: 12px;
  color: var(--rekit-ink-subtle);
  font-weight: 600;
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
  grid-template-columns: 40px 1.2fr 1.6fr 1fr 0.7fr 0.6fr 0.9fr 0.7fr 50px;
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
.cb {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1.5px solid var(--rekit-border-strong);
}
.who {
  display: flex;
  align-items: center;
  gap: 8px;
}
.avatar {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
  background: var(--rekit-accent-soft);
  color: var(--rekit-accent-deep);
  flex-shrink: 0;
}
.name { font-weight: 600; }
.email { font-size: 12.5px; }
.phone {
  font-size: 10.5px;
  color: var(--rekit-ink-subtle);
  margin-top: 2px;
}
.joined {
  font-size: 12px;
  color: var(--rekit-ink-muted);
}
.orders { font-weight: 600; }
.total {
  font-size: 12px;
  font-weight: 600;
}
.row-action {
  background: none;
  border: 0;
  padding: 6px;
  border-radius: 8px;
  color: var(--rekit-ink-subtle);
  cursor: pointer;
}
.row-action:hover {
  background: var(--rekit-surface-muted);
  color: var(--rekit-ink);
}
.empty {
  padding: 40px 16px;
  text-align: center;
  color: var(--rekit-ink-subtle);
  font-size: 13px;
}

@media (min-width: 768px) {
  .kpis {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }
  .kpi { padding: 18px; }
  .kpi__v span:first-child { font-size: 24px; }
}

@media (max-width: 1023px) {
  .search input { width: 160px; }
  .table { overflow-x: auto; }
  .table__head,
  .table__row {
    min-width: 1020px;
  }
}
</style>
