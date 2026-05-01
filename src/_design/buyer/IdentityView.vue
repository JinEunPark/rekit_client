<script setup lang="ts">
import { REKIT } from '@/design/tokens'
import PhoneShell from '@/_design/components/PhoneShell.vue'
import IconBase from '@/components/ds/IconBase.vue'
import Button from '@/components/ds/Button.vue'
import type { IconName } from '@/design/icons'

const steps = [
  { n: 1, label: '본인인증', cur: true },
  { n: 2, label: '주문서 작성', cur: false },
  { n: 3, label: '결제', cur: false },
]

const options: { i: IconName; t: string; s: string; go?: boolean }[] = [
  { i: 'phone', t: '휴대폰 본인인증', s: '통신사 인증으로 1분 이내 완료', go: true },
  { i: 'wallet', t: '신용카드 인증', s: '본인 명의 카드로 인증' },
]
</script>

<template>
  <PhoneShell>
    <div class="header">
      <IconBase name="chevronLeft" :size="24" />
      <div style="font-size: 16px; font-weight: 700">본인인증</div>
    </div>

    <div class="progress">
      <template v-for="(s, i) in steps" :key="s.n">
        <div class="progress__step">
          <div
            class="progress__circle"
            :style="{
              background: s.cur ? REKIT.color.ink : REKIT.color.surfaceMuted,
              color: s.cur ? '#fff' : REKIT.color.inkSubtle,
            }"
          >
            {{ s.n }}
          </div>
          <span :style="{ color: s.cur ? REKIT.color.ink : REKIT.color.inkSubtle }">{{ s.label }}</span>
        </div>
        <div v-if="i < steps.length - 1" class="progress__line" :style="{ background: REKIT.color.border }" />
      </template>
    </div>

    <div class="hero">
      <div class="hero__icon" :style="{ background: REKIT.color.accentSoft }">
        <IconBase name="shield" :size="28" :style="{ color: REKIT.color.accent }" />
      </div>
      <h2>주문 전에<br />본인인증을 진행해 주세요</h2>
      <p :style="{ color: REKIT.color.inkMuted }">
        고가 가전 거래의 안전을 위해 첫 주문 시<br />1회 본인 확인이 필요해요. 다음 주문부터는 생략돼요.
      </p>
    </div>

    <div class="options">
      <div
        v-for="o in options"
        :key="o.t"
        class="option"
        :style="{
          background: REKIT.color.surface,
          border: `${o.go ? 2 : 1}px solid ${o.go ? REKIT.color.ink : REKIT.color.border}`,
        }"
      >
        <div class="option__icon" :style="{ background: REKIT.color.surfaceMuted }">
          <IconBase :name="o.i" :size="22" />
        </div>
        <div style="flex: 1">
          <div style="font-size: 14px; font-weight: 700">{{ o.t }}</div>
          <div :style="{ fontSize: '11.5px', color: REKIT.color.inkSubtle, marginTop: '2px' }">{{ o.s }}</div>
        </div>
        <IconBase name="chevronRight" :size="18" :style="{ color: REKIT.color.inkSubtle }" />
      </div>
    </div>

    <div class="notice">
      <div :style="{ background: REKIT.color.surfaceMuted, color: REKIT.color.inkMuted }" class="notice__box">
        · 인증 정보는 암호화 저장되며 분쟁 대응 외 사용되지 않습니다.<br />
        · 만 14세 미만은 가입 및 주문이 제한됩니다.<br />
        · 인증 제공: 토스페이먼츠
      </div>
    </div>

    <div class="cta" :style="{ background: REKIT.color.surface, borderTop: `1px solid ${REKIT.color.border}` }">
      <RouterLink to="/_design/buyer/order" style="display: block">
        <Button variant="accent" size="lg" full>휴대폰으로 인증하기</Button>
      </RouterLink>
    </div>
  </PhoneShell>
</template>

<style scoped>
.header {
  padding: 4px 20px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.progress {
  padding: 8px 20px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.progress__step {
  display: flex;
  align-items: center;
  gap: 6px;
}
.progress__circle {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.progress__step span {
  font-size: 11.5px;
  font-weight: 600;
}
.progress__line {
  flex: 1;
  height: 1px;
}
.hero {
  padding: 20px 24px 0;
}
.hero__icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}
.hero h2 {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.3;
  margin: 0;
}
.hero p {
  font-size: 13.5px;
  line-height: 1.55;
  margin-top: 12px;
}
.options {
  padding: 24px 20px 0;
}
.option {
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.option__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.notice {
  padding: 16px 20px 0;
}
.notice__box {
  border-radius: 12px;
  padding: 12px;
  font-size: 11px;
  line-height: 1.6;
}
.cta {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 20px 28px;
}
</style>
