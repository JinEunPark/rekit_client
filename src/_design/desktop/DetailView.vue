<script setup lang="ts">
import { REKIT, won } from '@/design/tokens'
import { PRODUCTS, discountPct } from '@/data/products'
import DesktopShell from '@/_design/components/DesktopShell.vue'
import IconBase from '@/components/ds/IconBase.vue'
import Button from '@/components/ds/Button.vue'
import Badge from '@/components/ds/Badge.vue'
import ProductTile from '@/components/ds/ProductTile.vue'
import type { Tone } from '@/data/products'

const p = PRODUCTS[0]!

const thumbs: { l: string; t: Tone; sel?: boolean }[] = [
  { l: '정면', t: 'mint', sel: true },
  { l: '측면', t: 'sage' },
  { l: '내부', t: 'cool' },
  { l: '흠집', t: 'sand' },
  { l: '뒷면', t: 'stone' },
  { l: '제품번호', t: 'cream' },
]

const specs: [string, string][] = [
  ['용량', '384L'],
  ['크기', '595×668×1715mm'],
  ['무게', '약 76kg'],
  ['연식', '2021년식 (추정)'],
]
</script>

<template>
  <DesktopShell>
    <div class="crumb" :style="{ color: REKIT.color.inkSubtle }">
      <span>홈</span>
      <IconBase name="chevronRight" :size="12" />
      <span>냉장고</span>
      <IconBase name="chevronRight" :size="12" />
      <span :style="{ color: REKIT.color.ink, fontWeight: 600 }">{{ p.title }}</span>
    </div>

    <section class="grid">
      <div>
        <ProductTile :kind="p.kind" :tone="p.tone" ratio="1/1" :radius="REKIT.radius.xl" />
        <div class="thumbs">
          <div v-for="th in thumbs" :key="th.l">
            <div
              :style="{
                border: th.sel ? `2px solid ${REKIT.color.ink}` : `1px solid ${REKIT.color.border}`,
                borderRadius: REKIT.radius.md,
                padding: '1px',
              }"
            >
              <ProductTile
                :kind="p.kind"
                :tone="th.t"
                ratio="1/1"
                :radius="REKIT.radius.sm"
                :show-label="false"
              />
            </div>
            <div :style="{ fontSize: '10.5px', color: REKIT.color.inkMuted, textAlign: 'center', marginTop: '4px', fontWeight: 500 }">
              {{ th.l }}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div style="display: flex; gap: 6px">
          <Badge tone="a" size="md" :style="{ fontWeight: 700 }">A급 · 거의 새 것</Badge>
          <Badge tone="accent" size="md"><IconBase name="check" :size="11" /> 동작보증</Badge>
        </div>
        <div :style="{ fontSize: '12.5px', color: REKIT.color.inkSubtle, fontWeight: 600, marginTop: '14px' }">
          {{ p.brand }} · {{ p.model }} · {{ p.year }}
        </div>
        <h1>{{ p.title }}</h1>

        <div class="price-card" :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }">
          <div style="display: flex; align-items: baseline; gap: 8px">
            <span :style="{ fontSize: '13px', color: REKIT.color.inkSubtle, textDecoration: 'line-through' }">
              {{ won(p.original) }}
            </span>
            <span :style="{ fontSize: '13px', fontWeight: 700, color: REKIT.color.danger }">
              {{ discountPct(p) }}% 할인
            </span>
          </div>
          <div :style="{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.03em', marginTop: '4px' }">
            {{ won(p.price) }}
          </div>
          <div :style="{ fontSize: '12.5px', color: REKIT.color.accentDeep, marginTop: '4px' }">
            원가 대비 <b>{{ won(p.original - p.price) }}</b> 절약
          </div>
        </div>

        <div class="spec" :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }">
          <div
            v-for="([k, v], i) in specs"
            :key="k"
            class="spec__cell"
            :style="{
              borderRight: i % 2 === 0 ? `1px solid ${REKIT.color.border}` : 'none',
              borderTop: i > 1 ? `1px solid ${REKIT.color.border}` : 'none',
            }"
          >
            <div :style="{ fontSize: '11px', color: REKIT.color.inkSubtle, fontWeight: 600 }">{{ k }}</div>
            <div :style="{ fontSize: '14px', fontWeight: 700, marginTop: '4px' }">{{ v }}</div>
          </div>
        </div>

        <div class="warn">
          <IconBase name="warning" :size="18" :style="{ color: '#B5762A', flexShrink: 0, marginTop: '1px' }" />
          <div style="font-size: 12px; color: #7a4f1a; line-height: 1.55">
            <b>중고 가전 안내</b> · A/S 제공 불가, 단순 변심 반품 제한. 동작 불량은 7일 이내 환불 가능합니다.
          </div>
        </div>

        <div class="cta">
          <button class="cta__heart" :style="{ border: `1px solid ${REKIT.color.border}`, background: '#fff' }">
            <IconBase name="heart" :size="22" />
          </button>
          <Button variant="secondary" size="lg" :style="{ flex: 1 }">장바구니</Button>
          <Button variant="accent" size="lg" :style="{ flex: 1.3 }">바로 구매</Button>
        </div>
      </div>
    </section>
  </DesktopShell>
</template>

<style scoped>
.crumb {
  padding: 24px 48px 12px;
  font-size: 12px;
  display: flex;
  gap: 6px;
  align-items: center;
}
.grid {
  padding: 12px 48px 48px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}
.thumbs {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  margin-top: 12px;
}
h1 {
  margin: 6px 0 0;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.25;
}
.price-card {
  margin-top: 20px;
  padding: 20px;
  border-radius: 16px;
}
.spec {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-radius: 16px;
  overflow: hidden;
}
.spec__cell {
  padding: 14px 16px;
}
.warn {
  margin-top: 16px;
  background: #fef3e5;
  border: 1px solid #f4dcb6;
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  gap: 10px;
}
.cta {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
.cta__heart {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
