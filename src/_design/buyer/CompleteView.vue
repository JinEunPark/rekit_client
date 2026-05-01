<script setup lang="ts">
import { REKIT } from '@/design/tokens'
import PhoneShell from '@/_design/components/PhoneShell.vue'
import IconBase from '@/components/ds/IconBase.vue'
import Button from '@/components/ds/Button.vue'
</script>

<template>
  <PhoneShell>
    <div class="header">
      <IconBase name="close" :size="24" />
    </div>

    <div class="hero">
      <div class="hero__check" :style="{ background: REKIT.color.accent }">
        <IconBase name="check" :size="36" :stroke="2.5" :style="{ color: '#fff' }" />
      </div>
      <div :style="{ color: REKIT.color.accentDeep }" class="hero__kicker">주문이 완료됐어요</div>
      <h1>새 주인을 만난 가전,<br />곧 도착할게요</h1>
      <div :style="{ color: REKIT.color.inkMuted }" class="hero__order">
        주문번호 <b :style="{ color: REKIT.color.ink, fontFamily: REKIT.font.mono }">RK-26050001</b>
      </div>
    </div>

    <div class="info-wrap">
      <div class="info" :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }">
        <div :style="{ fontSize: '12px', color: REKIT.color.inkMuted, fontWeight: 600 }">결제 정보</div>
        <div class="info__total">
          <span style="font-size: 15px; font-weight: 700">총 결제 금액</span>
          <span style="font-size: 22px; font-weight: 800; letter-spacing: -0.02em">748,000원</span>
        </div>
        <div class="info__sub" :style="{ color: REKIT.color.inkMuted }">
          <span>신한카드 1234</span><span>일시불</span>
        </div>
        <div class="info__sched" :style="{ borderTop: `1px solid ${REKIT.color.border}` }">
          <div :style="{ fontSize: '12px', color: REKIT.color.inkMuted, fontWeight: 600, marginBottom: '8px' }">
            배송 일정
          </div>
          <div class="sched">
            <div class="sched__icon" :style="{ background: REKIT.color.accentSoft }">
              <IconBase name="truck" :size="18" :style="{ color: REKIT.color.accentDeep }" />
            </div>
            <div>
              <div style="font-size: 13px; font-weight: 600">5월 3일(토) ~ 5월 4일(일)</div>
              <div :style="{ fontSize: '11.5px', color: REKIT.color.inkSubtle, marginTop: '2px' }">
                직접 배송 · 도착 1시간 전 연락드려요
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="cta">
      <RouterLink to="/_design/buyer/home" style="flex: 1">
        <Button variant="secondary" size="lg" full>홈으로</Button>
      </RouterLink>
      <RouterLink to="/_design/buyer/my" style="flex: 1.3">
        <Button variant="primary" size="lg" full>주문 상세보기</Button>
      </RouterLink>
    </div>
  </PhoneShell>
</template>

<style scoped>
.header {
  padding: 4px 20px 12px;
  display: flex;
  justify-content: flex-end;
}
.hero {
  padding: 40px 24px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.hero__check {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
.hero__kicker {
  font-size: 14px;
  font-weight: 600;
}
.hero h1 {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.25;
  margin: 8px 0 0;
}
.hero__order {
  font-size: 13px;
  margin-top: 10px;
  line-height: 1.6;
}
.info-wrap {
  padding: 32px 20px 0;
}
.info {
  border-radius: 16px;
  padding: 16px;
}
.info__total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: 8px;
}
.info__sub {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 12.5px;
}
.info__sched {
  margin-top: 14px;
  padding-top: 12px;
}
.sched {
  display: flex;
  align-items: center;
  gap: 12px;
}
.sched__icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cta {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 20px 28px;
  display: flex;
  gap: 8px;
}
</style>
