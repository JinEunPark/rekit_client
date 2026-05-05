<script setup lang="ts">
import IconBase from '@/components/ds/IconBase.vue'
import StaticPage from '@/components/layout/StaticPage.vue'
import type { IconName } from '@/design/icons'

const steps: { i: IconName; t: string; b: string }[] = [
  { i: 'truck', t: '폐업 매장 입고', b: '협력 정리 업체에서 폐업 매장의 가전을 회수해 물류센터로 가져와요. 카페·식당·매장에서 쓰던 영업용 가전이 많아요.' },
  { i: 'shield', t: '전수 검수', b: '전원·기능·외관을 직접 확인하고 등급(A/B/C)을 매겨요.' },
  { i: 'box', t: '상품 등록', b: '실측 사이즈와 흠집 사진까지 모두 공개해 등록해요.' },
  { i: 'home', t: '직배송 / 화물택배', b: '서울·경기는 직배송, 그 외 지역은 화물택배로 보내드려요.' },
]

const reasons: { t: string; b: string }[] = [
  {
    t: '왜 이렇게 저렴해요?',
    b: '폐업하는 카페·식당·매장에서는 멀쩡한 영업용 가전이 단지 ‘받아줄 곳이 없다’는 이유로 함께 폐기돼요. rekit은 그 가전을 직접 회수하기 때문에 유통 단계가 생략되고, 평균 새 제품의 30% 가격으로 만나볼 수 있어요.',
  },
  {
    t: '왜 영업용 가전이 많나요?',
    b: '주된 입고처가 폐업 매장이다 보니, 자연스럽게 업소용 냉장고·세탁기·에어컨·주방가전 비중이 높아요. 가정용보다 내구성과 용량 기준이 더 까다로운 제품들이라 같은 가격대에서도 더 오래 쓰실 수 있어요.',
  },
  {
    t: '안전한가요?',
    b: '모든 상품은 입고 시 동작 확인을 거치고, 등급에 맞는 사진과 사이즈가 공개돼요. 도착 후 7일 이내 동작 불량은 전액 환불해드려요.',
  },
  {
    t: 'A/S는 어떻게 되나요?',
    b: '중고 가전 특성상 제조사 A/S는 보장되지 않습니다. 단, 입고 시 점검 결과는 상세 페이지에 공개되며, 동작 보증 표시가 있는 상품은 7일 환불 가능 범위를 함께 안내드려요.',
  },
]
</script>

<template>
  <StaticPage
    kicker="HOW IT WORKS"
    title="폐업 매장에서 우리집까지,&#10;이렇게 작동해요"
    lead="rekit은 폐업 매장의 검수된 영업용 가전을 새 가전 가격의 30% 수준으로 다시 살려내는 직거래 플랫폼입니다."
  >
    <h2>이용 흐름</h2>
    <ol class="steps">
      <li v-for="(s, i) in steps" :key="s.t" class="step">
        <span class="step__num">{{ String(i + 1).padStart(2, '0') }}</span>
        <div class="step__icon">
          <IconBase :name="s.i" :size="20" />
        </div>
        <div class="step__body">
          <div class="step__t">{{ s.t }}</div>
          <p class="step__b">{{ s.b }}</p>
        </div>
      </li>
    </ol>

    <template v-for="r in reasons" :key="r.t">
      <h2>{{ r.t }}</h2>
      <p>{{ r.b }}</p>
    </template>
  </StaticPage>
</template>

<style scoped>
.steps {
  list-style: none;
  padding: 0;
  margin: 16px 0 0;
  display: grid;
  gap: 10px;
}
.step {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  padding: 16px 18px;
}
.step__num {
  font-family: var(--rekit-font-mono);
  font-size: 12px;
  font-weight: 700;
  color: var(--rekit-ink-subtle);
}
.step__icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--rekit-accent-soft);
  color: var(--rekit-accent-deep);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.step__body {
  flex: 1;
  min-width: 0;
}
.step__t {
  font-size: 14.5px;
  font-weight: 700;
  letter-spacing: -0.015em;
}
.step__b {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--rekit-ink-muted);
  line-height: 1.55;
}
</style>
