<script setup lang="ts">
import { RouterLink } from 'vue-router'
import RekitLogo from '@/components/ds/RekitLogo.vue'
</script>

<template>
  <footer class="ft">
    <div class="ft__inner">
      <div class="ft__brand">
        <RekitLogo :size="20" />
        <p>폐업 매장의 영업용 가전을 다시 살리는 직거래 플랫폼.</p>
      </div>

      <div class="ft__links">
        <div class="ft__group">
          <div class="ft__title">서비스</div>
          <RouterLink to="/products">상품 둘러보기</RouterLink>
          <RouterLink to="/sell">판매자 등록</RouterLink>
          <RouterLink to="/guide">이용 안내</RouterLink>
        </div>
        <div class="ft__group">
          <div class="ft__title">고객지원</div>
          <RouterLink to="/help/faq">자주 묻는 질문</RouterLink>
          <RouterLink to="/help/contact">문의하기</RouterLink>
          <RouterLink to="/help/notice">공지사항</RouterLink>
        </div>
        <div class="ft__group">
          <div class="ft__title">회사</div>
          <RouterLink to="/about">회사 소개</RouterLink>
          <RouterLink to="/legal/terms">이용약관</RouterLink>
          <RouterLink to="/legal/privacy">개인정보처리방침</RouterLink>
        </div>
      </div>
    </div>
    <div class="ft__bottom">© 2026 rekit. All rights reserved.</div>
  </footer>
</template>

<style scoped>
.ft {
  margin-top: 80px;
  background: var(--rekit-surface);
  border-top: 1px solid var(--rekit-border);
}

.ft__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 40px 20px;
  display: grid;
  gap: 32px;
}

.ft__brand p {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--rekit-ink-muted);
  line-height: 1.55;
}

.ft__links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.ft__group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ft__title {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--rekit-ink);
  margin-bottom: 4px;
}

.ft__group a {
  font-size: 12.5px;
  color: var(--rekit-ink-muted);
  text-decoration: none;
}

.ft__group a:hover {
  color: var(--rekit-ink);
}

.ft__bottom {
  border-top: 1px solid var(--rekit-border);
  padding: 16px 20px;
  font-size: 11.5px;
  font-family: var(--rekit-font-mono);
  color: var(--rekit-ink-subtle);
  text-align: center;
}

@media (min-width: 768px) {
  .ft__inner {
    grid-template-columns: 1.2fr 2fr;
    padding: 56px 32px;
  }
}
</style>
