<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import IconBase from '@/components/ds/IconBase.vue'
import Button from '@/components/ds/Button.vue'
import { confirmPayment } from '@/api/payments'
import { ApiError } from '@/api/client'
import { savePaymentResult } from '@/composables/usePaymentHandoff'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/orders'

/**
 * 토스 결제 위젯 successUrl 이 가리키는 프론트 페이지.
 * ?paymentKey=&orderId=&amount= 를 받아 백엔드 승인(confirm)을 호출하고 결과에 따라 분기.
 * (결제 취소·인증 실패는 failUrl → /checkout/payment/fail 로 감)
 */

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const orders = useOrderStore()

type Phase = 'confirming' | 'failed' | 'checking'
const phase = ref<Phase>('confirming')
const message = ref('')
const orderNumber = ref('')

function q(name: string): string {
  const v = route.query[name]
  return typeof v === 'string' ? v : ''
}

onBeforeMount(async () => {
  const paymentKey = q('paymentKey')
  orderNumber.value = q('orderId')
  const amount = Number(q('amount'))

  if (!paymentKey || !orderNumber.value || !amount) {
    router.replace('/')
    return
  }

  try {
    const result = await confirmPayment({
      payment_key: paymentKey,
      order_id: orderNumber.value,
      amount,
    })
    savePaymentResult(result)

    // 결제 완료된 주문의 상품을 장바구니에서 비우고 주문 상태 최신화
    const order = await orders.fetchOrder(result.order_number)
    order?.items.forEach((i) => cart.remove(String(i.productId)))

    router.replace(`/checkout/complete?order=${encodeURIComponent(result.order_number)}`)
  } catch (err) {
    if (err instanceof ApiError && err.status === 502) {
      phase.value = 'checking'
      message.value =
        '결제 결과를 확인하고 있어요. 잠시 후 주문내역에서 결제 상태를 확인해 주세요.'
      return
    }
    phase.value = 'failed'
    if (err instanceof ApiError && err.status === 404) {
      message.value = '주문 정보를 찾을 수 없어요. 결제가 완료되지 않았습니다.'
    } else if (err instanceof ApiError) {
      message.value = err.message || '결제 승인에 실패했어요.'
    } else {
      message.value = '결제 승인 중 오류가 발생했어요.'
    }
  }
})
</script>

<template>
  <div class="wrap">
    <div v-if="phase === 'confirming'" class="state">
      <div class="spinner" />
      <p class="state__t">결제를 승인하고 있어요</p>
      <p class="state__s">잠시만 기다려 주세요. 창을 닫지 마세요.</p>
    </div>

    <div v-else-if="phase === 'checking'" class="state">
      <div class="state__icon state__icon--wait">
        <IconBase name="refresh" :size="26" :stroke="2.4" />
      </div>
      <p class="state__t">결제 확인 중이에요</p>
      <p class="state__s">{{ message }}</p>
      <div class="state__cta">
        <RouterLink to="/" class="ghost">홈으로</RouterLink>
        <RouterLink :to="`/my/orders/${orderNumber}`" class="solid">주문내역 보기</RouterLink>
      </div>
    </div>

    <div v-else class="state">
      <div class="state__icon state__icon--fail">
        <IconBase name="close" :size="28" :stroke="2.6" />
      </div>
      <p class="state__t">결제를 완료하지 못했어요</p>
      <p class="state__s">{{ message }}</p>
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
.spinner {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 3px solid var(--rekit-border);
  border-top-color: var(--rekit-accent);
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.state__icon {
  width: 64px;
  height: 64px;
  border-radius: 999px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.state__icon--fail {
  background: var(--rekit-danger);
}
.state__icon--wait {
  background: var(--rekit-ink);
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
.state__cta {
  margin-top: 24px;
  display: flex;
  gap: 8px;
  align-items: center;
}
.ghost,
.solid {
  display: inline-flex;
  align-items: center;
  height: 48px;
  padding: 0 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}
.ghost {
  border: 1px solid var(--rekit-border);
  color: var(--rekit-ink);
}
.solid {
  background: var(--rekit-ink);
  color: #fff;
}
</style>
