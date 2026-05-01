<script setup lang="ts">
import { REKIT, won } from '@/design/tokens'
import { PRODUCTS } from '@/data/products'
import PhoneShell from '@/_design/components/PhoneShell.vue'
import IconBase from '@/components/ds/IconBase.vue'
import Badge from '@/components/ds/Badge.vue'
import Button from '@/components/ds/Button.vue'
import ProductTile from '@/components/ds/ProductTile.vue'

const orderItems = [PRODUCTS[0]!, PRODUCTS[2]!, PRODUCTS[4]!]
const delivery = [
  { t: '화물택배', s: '60,000원 · 2~4일', sel: false },
  { t: '직접 배송', s: '40,000원 · 서울/경기 · 시간 협의', sel: true },
]
const payments = [
  { t: '신용카드', sel: true },
  { t: '계좌이체', sel: false },
  { t: '간편결제', sel: false },
]
</script>

<template>
  <PhoneShell>
    <div class="header">
      <IconBase name="chevronLeft" :size="24" />
      <div style="font-size: 16px; font-weight: 700">주문서</div>
    </div>

    <div class="scroll rekit-no-scrollbar">
      <div class="block">
        <div class="verified" :style="{ background: REKIT.color.accentSoft }">
          <IconBase name="shield" :size="16" :style="{ color: REKIT.color.accentDeep }" />
          <span :style="{ color: REKIT.color.accentInk }">본인인증 완료 · 박은영</span>
        </div>
      </div>

      <div class="block">
        <div class="row">
          <div class="row__t">배송지</div>
          <span class="row__a" :style="{ color: REKIT.color.inkMuted }">변경</span>
        </div>
        <div class="address" :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px">
            <span style="font-size: 14px; font-weight: 700">박은영</span>
            <Badge tone="outline" size="xs">기본배송지</Badge>
          </div>
          <div :style="{ fontSize: '12.5px', color: REKIT.color.inkMuted }">010-1234-5678</div>
          <div :style="{ fontSize: '12.5px', color: REKIT.color.inkMuted, marginTop: '4px', lineHeight: 1.5 }">
            서울특별시 마포구 양화로 45<br />메세나폴리스 1503호 (04101)
          </div>
          <input
            placeholder="배송 메모 (예: 부재 시 경비실)"
            class="address__memo"
            :style="{ borderTop: `1px solid ${REKIT.color.border}` }"
          />
        </div>
      </div>

      <div class="block">
        <div class="row__t">주문 상품 (3건)</div>
        <div class="items" :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }">
          <div
            v-for="(p, i) in orderItems"
            :key="p.id"
            class="items__row"
            :style="{ borderBottom: i < orderItems.length - 1 ? `1px solid ${REKIT.color.border}` : 'none' }"
          >
            <div style="width: 56px">
              <ProductTile :kind="p.kind" :tone="p.tone" ratio="1/1" :radius="REKIT.radius.sm" :show-label="false" />
            </div>
            <div style="flex: 1; min-width: 0">
              <div :style="{ fontSize: '11px', color: REKIT.color.inkSubtle, fontWeight: 600 }">{{ p.brand }}</div>
              <div class="items__title">{{ p.title }}</div>
              <div :style="{ fontSize: '13px', fontWeight: 800, marginTop: '4px' }">{{ won(p.price) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="block">
        <div class="row__t">배송 방식</div>
        <div style="display: grid; gap: 8px">
          <label
            v-for="o in delivery"
            :key="o.t"
            class="opt"
            :style="{
              background: REKIT.color.surface,
              border: `${o.sel ? 2 : 1}px solid ${o.sel ? REKIT.color.ink : REKIT.color.border}`,
            }"
          >
            <span class="opt__radio" :style="{ borderColor: o.sel ? REKIT.color.ink : REKIT.color.borderStrong }">
              <span v-if="o.sel" class="opt__dot" :style="{ background: REKIT.color.ink }" />
            </span>
            <div style="flex: 1">
              <div style="font-size: 13px; font-weight: 700">{{ o.t }}</div>
              <div :style="{ fontSize: '11.5px', color: REKIT.color.inkSubtle, marginTop: '2px' }">{{ o.s }}</div>
            </div>
          </label>
        </div>
      </div>

      <div class="block">
        <div class="row__t">결제 수단</div>
        <div class="pays">
          <div
            v-for="o in payments"
            :key="o.t"
            class="pays__cell"
            :style="{
              background: REKIT.color.surface,
              border: `${o.sel ? 2 : 1}px solid ${o.sel ? REKIT.color.ink : REKIT.color.border}`,
              fontWeight: o.sel ? 700 : 500,
            }"
          >
            {{ o.t }}
          </div>
        </div>
      </div>

      <div class="block" style="padding-bottom: 24px">
        <div class="total" :style="{ background: REKIT.color.ink }">
          <div class="total__row">
            <span>상품 금액</span><span>708,000원</span>
          </div>
          <div class="total__row">
            <span>배송비</span><span>40,000원</span>
          </div>
          <div class="total__final">
            <span>최종 결제</span>
            <span>748,000원</span>
          </div>
        </div>
      </div>
    </div>

    <div class="cta" :style="{ background: REKIT.color.surface, borderTop: `1px solid ${REKIT.color.border}` }">
      <RouterLink to="/_design/buyer/complete" style="display: block">
        <Button variant="accent" size="lg" full>748,000원 결제하기</Button>
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
.scroll {
  overflow-y: auto;
  height: calc(844px - 48px - 56px - 100px);
}
.block {
  padding: 0 20px 16px;
}
.verified {
  border-radius: 12px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 600;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.row__t {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 10px;
}
.row__a {
  font-size: 12px;
  font-weight: 600;
}
.address {
  border-radius: 16px;
  padding: 16px;
}
.address__memo {
  width: 100%;
  margin-top: 12px;
  border: none;
  padding-top: 10px;
  padding-left: 0;
  font-size: 12.5px;
  outline: none;
  background: transparent;
}
.items {
  border-radius: 16px;
  padding: 4px 14px;
}
.items__row {
  display: flex;
  gap: 12px;
  padding: 12px 0;
}
.items__title {
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.4;
  margin-top: 2px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.opt {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 16px;
}
.opt__radio {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border-width: 2px;
  border-style: solid;
  display: flex;
  align-items: center;
  justify-content: center;
}
.opt__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
}
.pays {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.pays__cell {
  padding: 12px 0;
  text-align: center;
  border-radius: 12px;
  font-size: 13px;
}
.total {
  color: #fff;
  border-radius: 16px;
  padding: 16px;
}
.total__row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 12.5px;
  opacity: 0.8;
}
.total__final {
  display: flex;
  justify-content: space-between;
  padding-top: 10px;
  margin-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  align-items: baseline;
}
.total__final span:first-child {
  font-size: 13px;
  font-weight: 600;
}
.total__final span:last-child {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.cta {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 20px 28px;
}
</style>
