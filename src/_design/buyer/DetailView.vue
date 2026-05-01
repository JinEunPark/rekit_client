<script setup lang="ts">
import { REKIT, won } from '@/design/tokens'
import { PRODUCTS, discountPct } from '@/data/products'
import PhoneShell from '@/_design/components/PhoneShell.vue'
import IconBase from '@/components/ds/IconBase.vue'
import Badge from '@/components/ds/Badge.vue'
import Button from '@/components/ds/Button.vue'
import ProductTile from '@/components/ds/ProductTile.vue'
import type { Tone } from '@/data/products'

const p = PRODUCTS[0]!

const thumbs: { l: string; t: Tone }[] = [
  { l: '정면', t: 'mint' },
  { l: '측면', t: 'sage' },
  { l: '내부', t: 'cool' },
  { l: '흠집', t: 'sand' },
  { l: '뒷면', t: 'stone' },
  { l: '제품번호', t: 'cream' },
]

const grades = [
  { g: 'A', cur: true, t: '거의 새 것 같은 상태, 사용감 미미' },
  { g: 'B', cur: false, t: '눈에 띄는 사용감, 동작은 정상' },
  { g: 'C', cur: false, t: '외관 흠집 다수, 부품·부속용 추천' },
] as const

const specs: [string, string][] = [
  ['브랜드', '삼성'],
  ['모델명', 'RT38K5982SL'],
  ['연식', '2021년식 (추정)'],
  ['용량', '384L'],
  ['크기', '595×668×1715mm'],
  ['무게', '약 76kg'],
]

const delivery = [
  { i: 'truck' as const, t: '화물택배', s: '대형 가전 · 약 2~4일' },
  { i: 'map' as const, t: '직접 배송 가능', s: '서울/경기 (배송비 별도 협의)' },
]
</script>

<template>
  <PhoneShell>
    <div class="scroll rekit-no-scrollbar">
      <div class="float-header">
        <div class="float-btn">
          <IconBase name="chevronLeft" :size="20" />
        </div>
        <div style="display: flex; gap: 8px">
          <div class="float-btn">
            <IconBase name="heart" :size="18" />
          </div>
          <div class="float-btn">
            <IconBase name="cart" :size="18" />
          </div>
        </div>
      </div>

      <div class="gallery">
        <ProductTile :kind="p.kind" :tone="p.tone" ratio="1/1" radius="0" />
        <div class="gallery__dots">
          <div
            v-for="i in 4"
            :key="i"
            :style="{
              width: i === 1 ? '16px' : '5px',
              height: '5px',
              borderRadius: '3px',
              background: i === 1 ? REKIT.color.ink : 'rgba(26,26,23,0.25)',
            }"
          />
        </div>
        <div class="gallery__count">1 / 6</div>
      </div>

      <div class="thumbs rekit-no-scrollbar">
        <div v-for="(th, i) in thumbs" :key="th.l" class="thumbs__item">
          <div :style="{ border: i === 0 ? `2px solid ${REKIT.color.ink}` : 'none', borderRadius: '8px' }">
            <ProductTile :kind="p.kind" :tone="th.t" ratio="1/1" :radius="REKIT.radius.sm" :show-label="false" />
          </div>
          <div class="thumbs__label" :style="{ color: REKIT.color.inkMuted }">{{ th.l }}</div>
        </div>
      </div>

      <div class="title">
        <div :style="{ fontSize: '12px', color: REKIT.color.inkSubtle, fontWeight: 600 }">
          {{ p.brand }} · {{ p.model }} · {{ p.year }}
        </div>
        <h1>{{ p.title }}</h1>
        <div class="title__badges">
          <Badge tone="a" size="md" :style="{ fontWeight: 700 }">A급 · 거의 새 것</Badge>
          <Badge tone="accent" size="md"><IconBase name="check" :size="11" /> 동작보증</Badge>
        </div>
        <div class="title__pricerow">
          <span :style="{ fontSize: '13px', color: REKIT.color.inkSubtle, textDecoration: 'line-through' }">
            {{ won(p.original) }}
          </span>
          <span :style="{ fontSize: '13px', fontWeight: 700, color: REKIT.color.danger }">
            {{ discountPct(p) }}% 할인
          </span>
        </div>
        <div class="title__price">{{ won(p.price) }}</div>
        <div :style="{ fontSize: '12px', color: REKIT.color.inkSubtle, marginTop: '2px' }">
          원가 대비 <b :style="{ color: REKIT.color.accent }">{{ won(p.original - p.price) }}</b> 절약
        </div>
      </div>

      <div class="card-wrap">
        <div class="card" :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }">
          <div class="card__head">
            <div class="card__title">상태 등급 안내</div>
            <IconBase name="chevronRight" :size="16" :style="{ color: REKIT.color.inkSubtle }" />
          </div>
          <div class="grades">
            <div
              v-for="r in grades"
              :key="r.g"
              class="grades__row"
              :style="{ opacity: r.cur ? 1 : 0.5 }"
            >
              <Badge :tone="r.g.toLowerCase() as 'a' | 'b' | 'c'" size="sm" :style="{ width: '22px', justifyContent: 'center' }">
                {{ r.g }}
              </Badge>
              <span :style="{ fontSize: '12.5px', fontWeight: r.cur ? 600 : 500 }">{{ r.t }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card-wrap">
        <div class="section-h">제품 정보</div>
        <div class="spec" :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }">
          <div
            v-for="([k, v], i) in specs"
            :key="k"
            class="spec__row"
            :style="{ borderBottom: i < specs.length - 1 ? `1px solid ${REKIT.color.border}` : 'none' }"
          >
            <span class="spec__k" :style="{ color: REKIT.color.inkMuted }">{{ k }}</span>
            <span class="spec__v">{{ v }}</span>
          </div>
        </div>
      </div>

      <div class="card-wrap">
        <div class="warn">
          <IconBase name="warning" :size="18" :style="{ color: '#B5762A', flexShrink: 0, marginTop: '1px' }" />
          <div>
            <div class="warn__t">중고 가전 안내</div>
            <div class="warn__b">
              A/S 제공이 불가합니다. 배송 후 7일 이내 동작 불량은 환불 가능합니다. 단순 변심 반품은 대형 가전 특성상
              불가합니다.
            </div>
          </div>
        </div>
      </div>

      <div class="card-wrap" style="padding-bottom: 24px">
        <div class="section-h">배송 정보</div>
        <div class="card" :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}`, padding: '14px 16px' }">
          <div v-for="x in delivery" :key="x.t" class="delivery">
            <div class="delivery__icon" :style="{ background: REKIT.color.accentSoft }">
              <IconBase :name="x.i" :size="18" :style="{ color: REKIT.color.accentDeep }" />
            </div>
            <div>
              <div :style="{ fontSize: '13px', fontWeight: 600 }">{{ x.t }}</div>
              <div :style="{ fontSize: '11.5px', color: REKIT.color.inkSubtle, marginTop: '2px' }">{{ x.s }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="cta" :style="{ background: REKIT.color.surface, borderTop: `1px solid ${REKIT.color.border}` }">
      <button class="cta__heart" :style="{ border: `1px solid ${REKIT.color.border}`, background: '#fff' }">
        <IconBase name="heart" :size="22" />
      </button>
      <Button variant="secondary" size="lg" :style="{ flex: 1, height: '52px' }">장바구니</Button>
      <RouterLink to="/_design/buyer/cart" style="flex: 1.3; display: flex">
        <Button variant="accent" size="lg" :style="{ flex: 1, height: '52px' }">바로 구매</Button>
      </RouterLink>
    </div>
  </PhoneShell>
</template>

<style scoped>
.scroll {
  overflow-y: auto;
  height: calc(844px - 48px - 88px);
  position: relative;
}
.float-header {
  position: sticky;
  top: 0;
  z-index: 5;
  padding: 4px 20px 12px;
  background: var(--rekit-bg);
  display: flex;
  justify-content: space-between;
}
.float-btn {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(20, 20, 15, 0.04), 0 2px 8px rgba(20, 20, 15, 0.04);
}
.gallery {
  position: relative;
  margin-top: -52px;
}
.gallery__dots {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 5px;
}
.gallery__count {
  position: absolute;
  bottom: 12px;
  right: 16px;
  padding: 4px 10px;
  background: rgba(26, 26, 23, 0.7);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 999px;
}
.thumbs {
  padding: 12px 20px 0;
  display: flex;
  gap: 6px;
  overflow-x: auto;
}
.thumbs__item {
  flex: 0 0 64px;
  width: 64px;
}
.thumbs__label {
  font-size: 10px;
  text-align: center;
  margin-top: 3px;
  font-weight: 500;
}
.title {
  padding: 20px 20px 12px;
}
.title h1 {
  margin: 6px 0 0;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.3;
}
.title__badges {
  display: flex;
  gap: 6px;
  margin-top: 12px;
}
.title__pricerow {
  margin-top: 16px;
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.title__price {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin-top: 2px;
}
.card-wrap {
  padding: 0 20px 16px;
}
.card {
  border-radius: 16px;
  padding: 14px 16px;
}
.card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card__title {
  font-size: 13px;
  font-weight: 700;
}
.grades {
  margin-top: 12px;
  display: grid;
  gap: 8px;
}
.grades__row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.section-h {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 10px;
}
.spec {
  border-radius: 16px;
  padding: 4px 16px;
}
.spec__row {
  display: flex;
  padding: 12px 0;
}
.spec__k {
  width: 90px;
  font-size: 12.5px;
}
.spec__v {
  font-size: 12.5px;
  font-weight: 600;
}
.warn {
  background: #fef3e5;
  border: 1px solid #f4dcb6;
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  gap: 10px;
}
.warn__t {
  font-size: 13px;
  font-weight: 700;
  color: #7a4f1a;
}
.warn__b {
  font-size: 11.5px;
  color: #7a4f1a;
  margin-top: 4px;
  line-height: 1.55;
}
.delivery {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}
.delivery__icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cta {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 20px 28px;
  display: flex;
  gap: 8px;
}
.cta__heart {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
