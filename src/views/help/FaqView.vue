<script setup lang="ts">
import StaticPage from '@/components/layout/StaticPage.vue'
import IconBase from '@/components/ds/IconBase.vue'

const faqs = [
  {
    q: '폐업 매장에서 가져온 가전인데 정말 안전한가요?',
    a: '입고 시 전수 검수를 거쳐 동작이 확인된 상품만 등록합니다. 외관 흠집·내부 사진까지 모두 공개되며, 도착 후 7일 이내 동작 불량 시 전액 환불됩니다.',
  },
  {
    q: '영업용(업소용) 가전이 많은 이유는 뭔가요?',
    a: '주된 입고처가 폐업하는 카페·식당·매장이라 자연스럽게 업소용 냉장고·세탁기·에어컨·주방가전 비중이 높아요. 가정용보다 내구성과 용량 기준이 더 까다로운 제품들이라 같은 가격대에서도 더 오래 쓰실 수 있습니다.',
  },
  {
    q: 'A/S는 받을 수 있나요?',
    a: '제조사 A/S는 보장되지 않습니다. 다만 동작 보증 표시 상품은 도착 7일 이내 환불, 그 외 일부 부품은 사설 수리 방안을 안내해 드립니다.',
  },
  {
    q: '직배송과 화물택배는 어떻게 다른가요?',
    a: '서울/경기는 전문 기사가 운반·설치까지 직접 진행하는 직배송이 가능하며 1~2일 내 도착합니다. 그 외 지역은 화물택배(2~4일)로 보내드립니다.',
  },
  {
    q: '상태 등급(A/B/C)은 어떤 기준인가요?',
    a: 'A는 거의 새 것 같은 외관, B는 사용감 있으나 동작 정상, C는 외관 흠집이 다수이지만 부품·부속용으로 활용 가능한 상태입니다.',
  },
  {
    q: '환불은 어떻게 신청하나요?',
    a: '주문 상세 페이지에서 ‘환불 신청’ 버튼을 누르면 사진 첨부 후 24시간 내 회신드립니다. 단순 변심 반품은 대형 가전 특성상 불가합니다.',
  },
  {
    q: '판매하고 싶은 가전이 있어요.',
    a: '현재는 협력 정리 업체와 직접 계약을 통해 폐업 매장의 가전을 입고받고 있습니다. 입점 문의는 운영자 페이지를 통해 보내주시면 검토 후 연락드립니다.',
  },
]
</script>

<template>
  <StaticPage
    kicker="FAQ"
    title="자주 묻는 질문"
    lead="가장 많이 받는 질문을 모았어요. 답을 못 찾으셨다면 문의하기로 알려주세요."
  >
    <ul class="qas">
      <li v-for="(f, i) in faqs" :key="i" class="qa">
        <details>
          <summary>
            <span class="qa__q">{{ f.q }}</span>
            <IconBase name="chevronDown" :size="16" class="qa__chevron" />
          </summary>
          <p class="qa__a">{{ f.a }}</p>
        </details>
      </li>
    </ul>
  </StaticPage>
</template>

<style scoped>
.qas {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.qa {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 14px;
}
.qa details {
  padding: 18px 20px;
}
.qa summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  list-style: none;
  cursor: pointer;
}
.qa summary::-webkit-details-marker {
  display: none;
}
.qa__q {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.015em;
}
.qa__chevron {
  color: var(--rekit-ink-subtle);
  transition: transform 0.18s ease;
  flex-shrink: 0;
}
.qa details[open] .qa__chevron {
  transform: rotate(180deg);
}
.qa__a {
  margin: 12px 0 0;
  font-size: 13.5px;
  color: var(--rekit-ink-muted);
  line-height: 1.7;
}
</style>
