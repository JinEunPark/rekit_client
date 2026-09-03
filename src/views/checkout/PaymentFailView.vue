<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import IconBase from '@/components/ds/IconBase.vue'
import Button from '@/components/ds/Button.vue'

/**
 * 토스 결제 위젯 failUrl 이 가리키는 프론트 페이지.
 * 결제창에서 취소하거나 인증에 실패하면 ?code=&message=&orderId= 로 돌아옵니다.
 * 이 단계는 승인 전이라 금액이 청구되지 않았습니다.
 */

const route = useRoute()
const router = useRouter()

function q(name: string): string {
  const v = route.query[name]
  return typeof v === 'string' ? v : ''
}

const code = computed(() => q('code'))
const reason = computed(() => {
  const raw = q('message')
  if (raw) return raw
  if (code.value === 'PAY_PROCESS_CANCELED') return '결제를 취소하셨어요.'
  if (code.value === 'PAY_PROCESS_ABORTED') return '결제가 중단됐어요.'
  return '결제가 완료되지 않았어요.'
})
</script>

<template>
  <div class="wrap">
    <div class="state">
      <div class="state__icon">
        <IconBase name="warning" :size="28" :stroke="2.4" />
      </div>
      <p class="state__t">결제가 완료되지 않았어요</p>
      <p class="state__s">{{ reason }}</p>
      <p v-if="code" class="state__code">{{ code }}</p>
      <p class="state__note">아직 결제 승인 전이라 금액이 청구되지 않았어요.</p>
      <div class="state__cta">
        <RouterLink to="/cart" class="ghost">장바구니로</RouterLink>
        <Button variant="accent" size="lg" @click="router.replace('/checkout/order')">
          다시 결제하기
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  max-width: 480px;
  margin: 0 auto;
  padding: 80px 24px;
  display: flex;
  justify-content: center;
}
.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.state__icon {
  width: 64px;
  height: 64px;
  border-radius: 999px;
  background: var(--rekit-ink);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.state__t {
  margin: 20px 0 0;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.state__s {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--rekit-ink-muted);
  line-height: 1.6;
}
.state__code {
  margin: 10px 0 0;
  font-family: var(--rekit-font-mono);
  font-size: 11px;
  color: var(--rekit-ink-subtle);
}
.state__note {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--rekit-ink-subtle);
}
.state__cta {
  margin-top: 24px;
  display: flex;
  gap: 8px;
  align-items: center;
}
.ghost {
  display: inline-flex;
  align-items: center;
  height: 48px;
  padding: 0 18px;
  border-radius: 12px;
  border: 1px solid var(--rekit-border);
  font-size: 14px;
  font-weight: 700;
  color: var(--rekit-ink);
  text-decoration: none;
  white-space: nowrap;
}
</style>
