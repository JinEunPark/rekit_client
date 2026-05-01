<script setup lang="ts">
import { computed } from 'vue'
import { REKIT, won } from '@/design/tokens'
import { PRODUCTS } from '@/data/products'
import PhoneShell from '@/_design/components/PhoneShell.vue'
import IconBase from '@/components/ds/IconBase.vue'
import Button from '@/components/ds/Button.vue'
import ProductTile from '@/components/ds/ProductTile.vue'

const items = [PRODUCTS[0]!, PRODUCTS[2]!, PRODUCTS[4]!]
const total = computed(() => items.reduce((s, p) => s + p.price, 0))
const final = computed(() => total.value + 40000)
</script>

<template>
  <PhoneShell>
    <div class="header">
      <IconBase name="chevronLeft" :size="24" />
      <div style="font-size: 16px; font-weight: 700">장바구니</div>
    </div>

    <div class="select-row">
      <label class="select-row__all">
        <span class="check" :style="{ background: REKIT.color.accent }">
          <IconBase name="check" :size="14" :stroke="2.5" :style="{ color: '#fff' }" />
        </span>
        전체 선택 (3/3)
      </label>
      <span class="select-row__del" :style="{ color: REKIT.color.inkMuted }">선택 삭제</span>
    </div>

    <div class="scroll rekit-no-scrollbar">
      <div v-for="p in items" :key="p.id" class="item-wrap">
        <div
          class="item"
          :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }"
        >
          <span class="check check--top" :style="{ background: REKIT.color.accent }">
            <IconBase name="check" :size="14" :stroke="2.5" :style="{ color: '#fff' }" />
          </span>
          <div class="item__thumb">
            <ProductTile :kind="p.kind" :tone="p.tone" :grade="p.grade" ratio="1/1" :radius="REKIT.radius.md" :show-label="false" />
          </div>
          <div class="item__body">
            <div class="item__head">
              <div :style="{ fontSize: '11px', color: REKIT.color.inkSubtle, fontWeight: 600 }">{{ p.brand }}</div>
              <IconBase name="close" :size="14" :style="{ color: REKIT.color.inkSubtle }" />
            </div>
            <div class="item__title">{{ p.title }}</div>
            <div class="item__foot">
              <div class="qty" :style="{ border: `1px solid ${REKIT.color.border}` }">
                <div class="qty__btn"><IconBase name="minus" :size="12" /></div>
                <span class="qty__n">1</span>
                <div class="qty__btn"><IconBase name="plus" :size="12" /></div>
              </div>
              <div class="item__price">{{ won(p.price) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="summary-wrap">
        <div class="summary" :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }">
          <div class="summary__h">결제 예정 금액</div>
          <div class="summary__row">
            <span :style="{ color: REKIT.color.inkMuted }">상품 금액</span>
            <span :style="{ fontWeight: 600 }">{{ won(total) }}</span>
          </div>
          <div class="summary__row">
            <span :style="{ color: REKIT.color.inkMuted }">배송비 (화물)</span>
            <span :style="{ fontWeight: 600 }">+ 60,000원</span>
          </div>
          <div class="summary__row">
            <span :style="{ color: REKIT.color.inkMuted }">직배송 할인</span>
            <span :style="{ fontWeight: 600 }">- 20,000원</span>
          </div>
          <div class="summary__total" :style="{ borderTop: `1px solid ${REKIT.color.border}` }">
            <span style="font-size: 13px; font-weight: 700">최종 결제 금액</span>
            <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.02em">{{ won(final) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="cta" :style="{ background: REKIT.color.surface, borderTop: `1px solid ${REKIT.color.border}` }">
      <RouterLink to="/_design/buyer/identity" style="display: block">
        <Button variant="accent" size="lg" full>3건 · {{ won(final) }} 주문하기</Button>
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
.select-row {
  padding: 8px 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.select-row__all {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
}
.check {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.check--top {
  flex-shrink: 0;
  margin-top: 2px;
}
.select-row__del {
  font-size: 12.5px;
  font-weight: 500;
}
.scroll {
  overflow-y: auto;
  height: calc(844px - 48px - 56px - 200px);
  padding: 12px 0 0;
}
.item-wrap {
  padding: 0 20px;
  margin-bottom: 8px;
}
.item {
  border-radius: 16px;
  padding: 14px;
  display: flex;
  gap: 12px;
}
.item__thumb {
  width: 78px;
  flex-shrink: 0;
}
.item__body {
  flex: 1;
  min-width: 0;
}
.item__head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
.item__title {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.35;
  margin-top: 2px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.item__foot {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 8px;
}
.qty {
  display: inline-flex;
  align-items: center;
  border-radius: 8px;
  overflow: hidden;
}
.qty__btn {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qty__n {
  width: 22px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
}
.item__price {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.summary-wrap {
  padding: 12px 20px 24px;
}
.summary {
  border-radius: 16px;
  padding: 14px 16px;
}
.summary__h {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 10px;
}
.summary__row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 12.5px;
}
.summary__total {
  display: flex;
  justify-content: space-between;
  padding-top: 10px;
  margin-top: 8px;
  align-items: baseline;
}
.cta {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 20px 28px;
}
</style>
