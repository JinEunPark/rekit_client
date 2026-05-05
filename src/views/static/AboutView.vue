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
    lead="rekit은 폐업 매장의 영업용 가전을 다시 살려내는 직거래 플랫폼입니다. 폐기될 가전이 누군가의 새로운 시작이 되도록, 검수와 직배송으로 안전한 거래를 만들어요."
  >
    <h2>우리가 풀고 있는 문제</h2>
    <p>
      국내에서는 매년 수많은 카페·식당·매장이 폐업하면서, 멀쩡한 영업용 냉장고·세탁기·에어컨·주방가전이
      ‘받아줄 곳이 없다’는 이유로 함께 폐기됩니다. 동시에 새 가전 가격은 부담스럽고, 중고 거래는 동작 여부가
      불투명해 사기 위험이 따릅니다. rekit은 이 두 문제를 동시에 해결합니다.
    </p>

    <h2>왜 영업용 가전이 많나요</h2>
    <p>
      주된 입고처가 폐업 매장이다 보니, 자연스럽게 업소용 가전 비중이 높습니다. 가정용보다 내구성과
      용량 기준이 더 까다로운 제품들이라 같은 가격대에서도 더 오래 쓰실 수 있어요. 가정용으로
      쓰기에는 다소 큰 모델은 사이즈를 한눈에 비교할 수 있도록 상세 페이지에 실측을 함께 공개합니다.
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
      <li>폐업 매장에서 다시 살릴 수 있는 가전을 1대라도 더 구합니다.</li>
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
