<script setup lang="ts">
import { REKIT } from '@/design/tokens'
import AdminShell from '@/_design/components/AdminShell.vue'
import Badge from '@/components/ds/Badge.vue'
import IconBase from '@/components/ds/IconBase.vue'

const summary = [
  { l: '전체 회원', v: '312', s: '명' },
  { l: '인증 완료', v: '287', s: '명' },
  { l: '신규 (이번주)', v: '23', s: '명' },
  { l: '구매 회원', v: '184', s: '명' },
]

const members = [
  { name: '박은영', email: 'eunyoung@rekit.kr', phone: '010-1234-5678', verified: true, joined: '2026.04.10', orders: 3, total: '1,240,000원', status: '활성' },
  { name: '이민호', email: 'minho.lee@gmail.com', phone: '010-2345-6789', verified: true, joined: '2026.04.12', orders: 1, total: '480,000원', status: '활성' },
  { name: '최선우', email: 'sunwoo@naver.com', phone: '010-3456-7890', verified: true, joined: '2026.04.15', orders: 2, total: '610,000원', status: '활성' },
  { name: '정현지', email: 'hyunji.j@kakao.com', phone: '010-4567-8901', verified: false, joined: '2026.04.20', orders: 0, total: '0원', status: '활성' },
  { name: '윤도현', email: 'dohyun@gmail.com', phone: '010-5678-9012', verified: true, joined: '2026.04.22', orders: 1, total: '38,000원', status: '제재' },
  { name: '한지민', email: 'jimin.han@daum.net', phone: '010-6789-0123', verified: true, joined: '2026.04.25', orders: 1, total: '290,000원', status: '활성' },
]
</script>

<template>
  <AdminShell active="members" title="회원 관리" subtitle="총 312명 · 인증완료 287명">
    <template #header-right>
      <div
        class="search"
        :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }"
      >
        <IconBase name="search" :size="16" :style="{ color: REKIT.color.inkSubtle }" />
        <span :style="{ color: REKIT.color.inkPlaceholder }">이름, 이메일, 휴대폰 검색</span>
      </div>
    </template>

    <div class="kpis">
      <div
        v-for="k in summary"
        :key="k.l"
        class="kpi"
        :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }"
      >
        <div :style="{ fontSize: '12px', color: REKIT.color.inkSubtle, fontWeight: 600 }">{{ k.l }}</div>
        <div class="kpi__v">
          <span>{{ k.v }}</span>
          <span :style="{ fontSize: '12px', color: REKIT.color.inkSubtle, fontWeight: 600 }">{{ k.s }}</span>
        </div>
      </div>
    </div>

    <div class="table" :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }">
      <div class="table__head" :style="{ background: REKIT.color.surfaceMuted, color: REKIT.color.inkMuted }">
        <span /><span>이름</span><span>이메일 / 휴대폰</span><span>본인인증</span><span>가입일</span><span>주문</span><span>구매액</span><span>상태</span><span />
      </div>
      <div
        v-for="(m, i) in members"
        :key="m.email"
        class="table__row"
        :style="{ borderTop: i > 0 ? `1px solid ${REKIT.color.border}` : 'none' }"
      >
        <span class="cb" :style="{ border: `1.5px solid ${REKIT.color.borderStrong}` }" />
        <div style="display: flex; align-items: center; gap: 8px">
          <div class="avatar" :style="{ background: REKIT.color.accentSoft, color: REKIT.color.accentDeep }">
            {{ m.name[0] }}
          </div>
          <span style="font-weight: 600">{{ m.name }}</span>
        </div>
        <div>
          <div style="font-size: 12.5px">{{ m.email }}</div>
          <div :style="{ fontSize: '10.5px', color: REKIT.color.inkSubtle, marginTop: '2px' }">{{ m.phone }}</div>
        </div>
        <span>
          <Badge v-if="m.verified" tone="accent" size="sm">
            <IconBase name="check" :size="10" /> 인증완료
          </Badge>
          <Badge v-else tone="outline" size="sm">미인증</Badge>
        </span>
        <span :style="{ fontSize: '12px', color: REKIT.color.inkMuted }">{{ m.joined }}</span>
        <span style="font-weight: 600">{{ m.orders }}건</span>
        <span style="font-size: 12px; font-weight: 600">{{ m.total }}</span>
        <span><Badge :tone="m.status === '제재' ? 'danger' : 'accent'" size="sm">{{ m.status }}</Badge></span>
        <IconBase name="chevronRight" :size="16" :style="{ color: REKIT.color.inkSubtle }" />
      </div>
    </div>
  </AdminShell>
</template>

<style scoped>
.search {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 12px;
  padding: 8px 12px;
  width: 320px;
  font-size: 13px;
}
.kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.kpi {
  border-radius: 16px;
  padding: 18px;
}
.kpi__v {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 6px;
}
.kpi__v span:first-child {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.025em;
}
.table {
  border-radius: 16px;
  overflow: hidden;
}
.table__head,
.table__row {
  display: grid;
  grid-template-columns: 40px 1.2fr 1.6fr 1fr 0.7fr 0.8fr 0.6fr 0.8fr 80px;
  padding: 12px 16px;
  align-items: center;
}
.table__head {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.table__row {
  padding: 14px 16px;
  font-size: 13px;
}
.cb {
  width: 16px;
  height: 16px;
  border-radius: 4px;
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
}
</style>
