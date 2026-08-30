<script setup lang="ts">
import { RouterLink } from 'vue-router'
import RekitLogo from '@/components/ds/RekitLogo.vue'

// 사업자등록증 상 정보와 완전히 일치해야 함 (전자상거래법 §10 표시 의무)
const BUSINESS_INFO = [
  { label: '상호명', value: '리키트(REKIT)' },
  { label: '대표자명', value: '박진은' },
  { label: '사업자등록번호', value: '326-49-01161' },
  { label: '사업장 주소', value: '인천광역시 강화군 강화읍 강화대로 191-14, 102동 6층 8호(강화현대아파트)' },
] as const
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

    <dl class="ft__biz">
      <div v-for="row in BUSINESS_INFO" :key="row.label" class="ft__biz-row">
        <dt>{{ row.label }}</dt>
        <dd>{{ row.value }}</dd>
      </div>
    </dl>

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

.ft__biz {
  max-width: 1280px;
  margin: 0 auto;
  padding: 20px;
  border-top: 1px solid var(--rekit-border);
  display: flex;
  flex-wrap: wrap;
  gap: 6px 18px;
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--rekit-ink-subtle);
}

.ft__biz-row {
  display: flex;
  gap: 6px;
}

.ft__biz dt {
  font-weight: 600;
  color: var(--rekit-ink-muted);
}

.ft__biz dd {
  margin: 0;
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

  .ft__biz {
    padding: 24px 32px;
  }
}
</style>
