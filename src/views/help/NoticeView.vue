<script setup lang="ts">
import StaticPage from '@/components/layout/StaticPage.vue'
import Badge from '@/components/ds/Badge.vue'

const notices: { date: string; tag?: string; tone?: 'accent' | 'info'; t: string; b: string }[] = [
  {
    date: '2026.04.30',
    tag: '이벤트',
    tone: 'accent',
    t: '5월 한정, 직배송비 50% 할인',
    b: '5월 한 달 동안 서울·경기 직배송비를 절반 가격으로 제공합니다.',
  },
  {
    date: '2026.04.22',
    tag: '서비스',
    tone: 'info',
    t: '환불 신청 절차가 더 간단해졌어요',
    b: '주문 상세에서 사진 첨부 후 한 번에 신청, 24시간 내 회신을 약속드립니다.',
  },
  {
    date: '2026.04.15',
    t: '신규 카테고리 — 주방가전 입점',
    b: '전자레인지·인덕션·식기세척기 등 주방가전이 정식 카테고리로 추가됐어요.',
  },
  {
    date: '2026.04.04',
    tag: '점검',
    tone: 'info',
    t: '4월 9일(목) 새벽 3~5시 정기 점검 안내',
    b: '서비스 일부가 일시 중단될 수 있습니다. 이용에 참고 부탁드려요.',
  },
  {
    date: '2026.03.28',
    t: '협력 철거업체 모집',
    b: '서울·수도권 철거 현장과 함께 가전을 다시 살릴 파트너를 찾고 있어요.',
  },
]
</script>

<template>
  <StaticPage
    kicker="NOTICE"
    title="공지사항"
    lead="rekit의 새 소식과 서비스 변경 사항을 안내드려요."
  >
    <ul class="notices">
      <li v-for="(n, i) in notices" :key="i" class="notice">
        <div class="notice__head">
          <span class="notice__date">{{ n.date }}</span>
          <Badge v-if="n.tag" :tone="n.tone ?? 'neutral'" size="xs">{{ n.tag }}</Badge>
        </div>
        <div class="notice__title">{{ n.t }}</div>
        <p class="notice__body">{{ n.b }}</p>
      </li>
    </ul>
  </StaticPage>
</template>

<style scoped>
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
  padding: 18px 20px;
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
.notice__body {
  margin: 4px 0 0;
  font-size: 13.5px;
  color: var(--rekit-ink-muted);
  line-height: 1.6;
}
</style>
