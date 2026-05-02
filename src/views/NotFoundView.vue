<script setup lang="ts">
import { RouterLink } from 'vue-router'
import IconBase from '@/components/ds/IconBase.vue'
</script>

<template>
  <div class="nf">
    <div class="nf__inner">
      <div class="nf__icon">
        <IconBase name="search" :size="36" :stroke="1.4" />
      </div>
      <div class="nf__code">404</div>
      <h1 class="nf__title">찾으시는 페이지가 없어요</h1>
      <p class="nf__desc">
        주소가 변경됐거나 더 이상 사용되지 않는 페이지일 수 있어요.<br />
        홈으로 돌아가서 다른 가전을 둘러보세요.
      </p>
      <div class="nf__cta">
        <RouterLink to="/" class="nf__btn nf__btn--primary">홈으로</RouterLink>
        <RouterLink to="/products" class="nf__btn nf__btn--secondary">상품 둘러보기</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nf {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
}
.nf__inner {
  max-width: 420px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.nf__icon {
  width: 80px;
  height: 80px;
  border-radius: 999px;
  background: var(--rekit-surface-muted);
  color: var(--rekit-ink-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}
.nf__code {
  font-family: var(--rekit-font-mono);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--rekit-ink-subtle);
}
.nf__title {
  margin: 8px 0 0;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.35;
}
.nf__desc {
  margin: 12px 0 0;
  font-size: 13.5px;
  color: var(--rekit-ink-muted);
  line-height: 1.65;
}
.nf__cta {
  margin-top: 28px;
  display: flex;
  gap: 8px;
  width: 100%;
}
.nf__btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 52px;
  border-radius: 12px;
  font-size: 14.5px;
  font-weight: 700;
  letter-spacing: -0.015em;
  text-decoration: none;
}
.nf__btn--primary {
  background: var(--rekit-ink);
  color: #fff;
}
.nf__btn--secondary {
  background: var(--rekit-surface);
  color: var(--rekit-ink);
  border: 1px solid var(--rekit-border);
}
</style>
