<script setup lang="ts">
import { REKIT } from '@/design/tokens'
import PhoneShell from '@/_design/components/PhoneShell.vue'
import IconBase from '@/components/ds/IconBase.vue'
import RekitLogo from '@/components/ds/RekitLogo.vue'
import Button from '@/components/ds/Button.vue'
</script>

<template>
  <PhoneShell>
    <div class="header">
      <IconBase name="close" :size="24" />
    </div>

    <div class="hero">
      <RekitLogo :size="32" />
      <h1>다시 살아나는 가전,<br />새로운 주인을 기다려요</h1>
      <p :style="{ color: REKIT.color.inkMuted }">이메일로 1분이면 시작할 수 있어요</p>
    </div>

    <div class="form">
      <div class="form__group">
        <div>
          <label :style="{ color: REKIT.color.inkMuted }">이메일</label>
          <div class="form__field" :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }">
            eunyoung@rekit.kr
          </div>
        </div>
        <div>
          <label :style="{ color: REKIT.color.inkMuted }">휴대폰 번호</label>
          <div class="form__field form__field--row" :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }">
            <span>010-1234-5678</span>
            <Button variant="soft" size="sm">인증요청</Button>
          </div>
        </div>
        <div>
          <label :style="{ color: REKIT.color.inkMuted }">인증번호</label>
          <div class="form__field form__field--row" :style="{ background: REKIT.color.surface, border: `2px solid ${REKIT.color.ink}` }">
            <span :style="{ fontFamily: REKIT.font.mono, letterSpacing: '0.3em', fontWeight: 600 }">284│</span>
            <span :style="{ fontSize: '12px', color: REKIT.color.danger, fontWeight: 600, fontFamily: REKIT.font.mono }">
              02:43
            </span>
          </div>
          <div class="form__hint" :style="{ color: REKIT.color.accentDeep }">
            <IconBase name="check" :size="12" :stroke="2.2" /> 인증번호가 발송됐어요
          </div>
        </div>
      </div>

      <div class="agree" :style="{ background: REKIT.color.surfaceMuted }">
        <label class="agree__label">
          <span class="agree__check" :style="{ background: REKIT.color.ink }">
            <IconBase name="check" :size="12" :stroke="2.5" :style="{ color: '#fff' }" />
          </span>
          전체 약관에 동의합니다 (필수)
        </label>
      </div>
    </div>

    <div class="cta">
      <RouterLink to="/_design/buyer/home" style="display: block">
        <Button variant="accent" size="lg" full>이메일로 시작하기</Button>
      </RouterLink>
      <div class="divider">
        <div :style="{ background: REKIT.color.border }" />
        <span :style="{ color: REKIT.color.inkSubtle }">또는</span>
        <div :style="{ background: REKIT.color.border }" />
      </div>
      <div class="socials">
        <Button variant="secondary" size="lg" :style="{ flex: 1, background: '#FEE500', border: 'none', color: '#3B1E1E' }">
          카카오
        </Button>
        <Button variant="secondary" size="lg" :style="{ flex: 1, background: '#03C75A', border: 'none', color: '#fff' }">
          네이버
        </Button>
      </div>
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
}
.hero h1 {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.25;
  margin: 24px 0 0;
}
.hero p {
  font-size: 13.5px;
  margin-top: 10px;
  line-height: 1.55;
}
.form {
  padding: 32px 24px 0;
}
.form__group {
  display: grid;
  gap: 10px;
}
.form__group label {
  font-size: 11.5px;
  font-weight: 600;
}
.form__field {
  margin-top: 6px;
  height: 52px;
  border-radius: 12px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  font-size: 14px;
}
.form__field--row {
  justify-content: space-between;
}
.form__hint {
  font-size: 11.5px;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.agree {
  margin-top: 16px;
  padding: 12px;
  border-radius: 12px;
}
.agree__label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 500;
}
.agree__check {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cta {
  padding: 20px 20px 0;
}
.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
}
.divider div {
  flex: 1;
  height: 1px;
}
.divider span {
  font-size: 11px;
  font-weight: 500;
}
.socials {
  display: flex;
  gap: 10px;
}
</style>
