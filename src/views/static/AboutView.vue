<script setup lang="ts">
import StaticPage from '@/components/layout/StaticPage.vue'

const stats = [
  { v: '2,400+', l: '재거래된 가전' },
  { v: '월 2.4t', l: '폐기 절감 무게' },
  { v: '평균 73%', l: '새 제품 대비 절감' },
]
</script>

<template>
  <StaticPage
    kicker="ABOUT REKIT"
    title="버려질 가전이&#10;다시 누군가의 집으로"
    lead="rekit은 철거 현장의 가전을 다시 살려내는 직거래 플랫폼입니다. 폐기될 가전이 누군가의 새로운 시작이 되도록, 검수와 직배송으로 안전한 거래를 만들어요."
  >
    <h2>우리가 풀고 있는 문제</h2>
    <p>
      국내에서는 매년 수십만 대의 멀쩡한 가전이 ‘이사 시점이 맞지 않는다’는 이유로 철거와 함께
      폐기됩니다. 동시에 새 가전 가격은 부담스럽고, 중고 거래는 동작 여부가 불투명해 사기 위험이
      따릅니다. rekit은 이 두 문제를 동시에 해결합니다.
    </p>

    <h2>임팩트</h2>
    <ul class="stats">
      <li v-for="s in stats" :key="s.l" class="stat">
        <span class="stat__v">{{ s.v }}</span>
        <span class="stat__l">{{ s.l }}</span>
      </li>
    </ul>

    <h2>우리의 약속</h2>
    <ul>
      <li>모든 상품은 입고 시 작동 확인 후 등록합니다.</li>
      <li>외관·흠집·사이즈를 가감 없이 공개합니다.</li>
      <li>도착 후 7일 이내 동작 불량은 전액 환불합니다.</li>
      <li>철거 현장에서 다시 살릴 수 있는 가전을 1대라도 더 구합니다.</li>
    </ul>
  </StaticPage>
</template>

<style scoped>
.stats {
  list-style: none;
  padding: 0;
  margin: 16px 0 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.stat {
  background: var(--rekit-accent-soft);
  border-radius: 14px;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.stat__v {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: var(--rekit-accent-ink);
}
.stat__l {
  margin-top: 4px;
  font-size: 12px;
  color: var(--rekit-accent-deep);
  font-weight: 600;
}

@media (min-width: 768px) {
  .stat__v {
    font-size: 28px;
  }
}
</style>
