<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import IconBase from '@/components/ds/IconBase.vue'
import CheckoutSteps from '@/components/checkout/CheckoutSteps.vue'
import PhoneVerifyForm from '@/components/auth/PhoneVerifyForm.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

onBeforeMount(() => {
  if (!auth.user) {
    router.replace(`/auth/sign-in?redirect=${encodeURIComponent('/checkout/identity')}`)
    return
  }
  const selected = cart.items.filter((i) => i.selected)
  if (selected.length === 0) {
    router.replace('/cart')
    return
  }
  if (auth.user.verified) {
    router.replace('/checkout/order')
  }
})

async function handleVerified() {
  await auth.fetchMe() // user.verified/phone/phone_verified_at 최신화
  router.replace('/checkout/order')
}
</script>

<template>
  <div v-if="auth.user && !auth.user.verified" class="page">
    <CheckoutSteps :current="1" />

    <header class="hero">
      <div class="hero__icon">
        <IconBase name="shield" :size="28" />
      </div>
      <h1 class="hero__title">주문 전에<br />휴대폰 인증을 진행해 주세요</h1>
      <p class="hero__sub">
        고가 가전 거래의 안전을 위해 첫 주문 시 1회 본인 확인이 필요해요.<br />
        <b>다음 주문부터는 자동으로 생략돼요.</b>
      </p>
    </header>

    <div class="verify-block">
      <PhoneVerifyForm
        :initial-phone="auth.user.phone ?? ''"
        :lock-phone="!!auth.user.phone"
        @verified="handleVerified"
      />
    </div>

    <div class="notice">
      · 전화번호는 암호화 저장되며 분쟁 대응 외 사용되지 않습니다.<br />
      · 인증 제공: Octomo
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 480px;
  margin: 0 auto;
  padding: 16px 20px 48px;
}
@media (min-width: 768px) {
  .page {
    padding: 32px 24px 56px;
  }
}

.hero {
  margin-top: 16px;
}
.hero__icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--rekit-accent-soft);
  color: var(--rekit-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}
.hero__title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.3;
}
.hero__sub {
  margin: 12px 0 0;
  font-size: 13.5px;
  color: var(--rekit-ink-muted);
  line-height: 1.65;
}

.verify-block {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.notice {
  background: var(--rekit-surface-muted);
  color: var(--rekit-ink-muted);
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 11px;
  line-height: 1.7;
  margin-top: 4px;
}
</style>
