<script setup lang="ts">
import { REKIT, won } from '@/design/tokens'
import { PRODUCTS, discountPct } from '@/data/products'
import DesktopShell from '@/_design/components/DesktopShell.vue'
import IconBase from '@/components/ds/IconBase.vue'
import Button from '@/components/ds/Button.vue'
import Badge from '@/components/ds/Badge.vue'
import ApplianceGlyph from '@/components/ds/ApplianceGlyph.vue'
import ProductTile from '@/components/ds/ProductTile.vue'
import type { ApplianceKind, Tone } from '@/data/products'
import type { IconName } from '@/design/icons'

const heroCards: { t: string; s: string; kind: ApplianceKind; tone: Tone }[] = [
  { t: '오늘 입고', s: '신선한 매물 12건', kind: 'tv', tone: 'stone' },
  { t: '~5월 한정', s: '직배송비 50% 할인', kind: 'tv', tone: 'cream' },
]

const trust: { i: IconName; t: string; s: string }[] = [
  { i: 'shield', t: '동작 보증 검수', s: '입고 시 작동 확인 후 등록' },
  { i: 'truck', t: '대형가전 직배송', s: '서울/경기 당일 가능' },
  { i: 'leaf', t: '폐기 대신 재사용', s: '월 평균 2.4톤 절감' },
  { i: 'wallet', t: '평균 73% 할인', s: '원가 대비 합리적인 가격' },
]

const tabs = ['전체', '냉장고', '세탁기', 'TV', '에어컨']
const products = PRODUCTS.slice(0, 8)
</script>

<template>
  <DesktopShell>
    <section class="hero">
      <div class="hero__grid">
        <div class="hero__main">
          <div class="hero__kicker">RE·CYCLE · RE·KLE</div>
          <div class="hero__title">버려질 가전이<br />다시 누군가의 집으로</div>
          <div class="hero__sub">
            철거 현장에서 바로 도착한 검수 완료 가전.<br />
            새 가전의 70~80% 가격으로 만나보세요.
          </div>
          <div style="margin-top: 24px; display: flex; gap: 8px">
            <Button variant="accent" size="md" :style="{ background: '#fff', color: REKIT.color.accentInk }">
              둘러보기
            </Button>
            <Button variant="ghost" size="md" :style="{ color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }">
              판매자 안내
            </Button>
          </div>
          <div class="hero__deco">
            <ApplianceGlyph kind="fridge" :size="300" tone="#fff" />
          </div>
        </div>
        <div class="hero__side">
          <div
            v-for="(c, i) in heroCards"
            :key="c.t"
            class="hero__sub-card"
            :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }"
          >
            <div>
              <div :style="{ fontSize: '11px', color: REKIT.color.accentDeep, fontWeight: 700, letterSpacing: '0.05em' }">
                {{ i === 0 ? 'NEW IN' : 'EVENT' }}
              </div>
              <div :style="{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '6px' }">
                {{ c.t }}
              </div>
              <div :style="{ fontSize: '12.5px', color: REKIT.color.inkMuted, marginTop: '4px' }">{{ c.s }}</div>
            </div>
            <div class="hero__sub-deco">
              <ApplianceGlyph v-if="i === 0" kind="tv" />
              <IconBase v-else name="truck" :size="110" :style="{ color: REKIT.color.accentSoft }" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="trust">
      <div
        class="trust__inner"
        :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }"
      >
        <div v-for="x in trust" :key="x.t" class="trust__cell">
          <div class="trust__icon" :style="{ background: REKIT.color.accentSoft }">
            <IconBase :name="x.i" :size="22" :style="{ color: REKIT.color.accentDeep }" />
          </div>
          <div>
            <div :style="{ fontSize: '13.5px', fontWeight: 700 }">{{ x.t }}</div>
            <div :style="{ fontSize: '11.5px', color: REKIT.color.inkSubtle, marginTop: '2px' }">{{ x.s }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-h">
      <div>
        <div :style="{ fontSize: '12px', color: REKIT.color.accentDeep, fontWeight: 700, letterSpacing: '0.08em' }">
          NEW ARRIVAL
        </div>
        <div :style="{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.025em', marginTop: '6px' }">
          오늘 들어온 매물
        </div>
      </div>
      <div style="display: flex; gap: 8px">
        <span
          v-for="(c, i) in tabs"
          :key="c"
          :style="{
            padding: '8px 14px',
            borderRadius: '999px',
            fontSize: '12.5px',
            fontWeight: 600,
            background: i === 0 ? REKIT.color.ink : REKIT.color.surface,
            color: i === 0 ? '#fff' : REKIT.color.inkMuted,
            border: i === 0 ? 'none' : `1px solid ${REKIT.color.border}`,
          }"
        >
          {{ c }}
        </span>
      </div>
    </section>

    <section class="grid-wrap">
      <div class="grid">
        <RouterLink v-for="p in products" :key="p.id" to="/_design/desktop/detail" class="card">
          <div style="position: relative">
            <ProductTile :kind="p.kind" :tone="p.tone" :grade="p.grade" ratio="1/1" :radius="REKIT.radius.lg" />
            <div class="card__heart">
              <IconBase name="heart" :size="15" />
            </div>
            <div v-if="p.tag" class="card__tag" :style="{ background: REKIT.color.ink }">{{ p.tag }}</div>
          </div>
          <div class="card__body">
            <div :style="{ fontSize: '11.5px', color: REKIT.color.inkSubtle, fontWeight: 600 }">
              {{ p.brand }} · {{ p.year }}
            </div>
            <div class="card__title">{{ p.title }}</div>
            <div class="card__price">
              <span :style="{ fontSize: '14px', fontWeight: 800, color: REKIT.color.danger }">
                {{ discountPct(p) }}%
              </span>
              <span :style="{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.02em' }">{{ won(p.price) }}</span>
            </div>
            <div :style="{ fontSize: '11px', color: REKIT.color.inkSubtle, textDecoration: 'line-through', marginTop: '1px' }">
              {{ won(p.original) }}
            </div>
            <div v-if="p.warranty" style="margin-top: 8px">
              <Badge tone="accent" size="xs">
                <IconBase name="check" :size="10" :stroke="2.4" /> 동작보증
              </Badge>
            </div>
          </div>
        </RouterLink>
      </div>
    </section>

    <section class="cta-wrap">
      <div class="cta" :style="{ background: REKIT.color.ink }">
        <div>
          <div :style="{ fontSize: '12px', opacity: 0.6, fontWeight: 700, letterSpacing: '0.08em' }">
            FOR DEMOLITION PROS
          </div>
          <div :style="{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.025em', marginTop: '6px' }">
            버리지 마세요. 다시 팔 수 있어요.
          </div>
          <div :style="{ fontSize: '13px', opacity: 0.7, marginTop: '8px' }">
            철거 현장의 가전, rekit에서 새 주인을 찾아드릴게요.
          </div>
        </div>
        <Button variant="accent" size="lg">판매자 등록 문의</Button>
      </div>
    </section>
  </DesktopShell>
</template>

<style scoped>
.hero {
  padding: 32px 48px 0;
}
.hero__grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;
}
.hero__main {
  background: linear-gradient(135deg, #1f4e3d, #4fa88b);
  color: #fff;
  border-radius: 28px;
  padding: 48px 40px;
  position: relative;
  overflow: hidden;
  min-height: 320px;
}
.hero__kicker {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.85;
  letter-spacing: 0.06em;
}
.hero__title {
  font-size: 40px;
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.15;
  margin-top: 14px;
}
.hero__sub {
  font-size: 14.5px;
  opacity: 0.88;
  margin-top: 14px;
  line-height: 1.55;
}
.hero__deco {
  position: absolute;
  right: -40px;
  bottom: -40px;
  opacity: 0.16;
}
.hero__side {
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
}
.hero__sub-card {
  border-radius: 28px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.hero__sub-deco {
  position: absolute;
  right: -10px;
  bottom: -10px;
  width: 130px;
  height: 130px;
  opacity: 0.6;
}
.trust {
  padding: 24px 48px 0;
}
.trust__inner {
  border-radius: 20px;
  padding: 20px 32px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}
.trust__cell {
  display: flex;
  gap: 14px;
  align-items: center;
}
.trust__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.section-h {
  padding: 40px 48px 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.grid-wrap {
  padding: 0 48px 48px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.card {
  text-decoration: none;
  color: inherit;
}
.card__heart {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}
.card__tag {
  position: absolute;
  bottom: 10px;
  left: 10px;
  padding: 4px 10px;
  border-radius: 999px;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}
.card__body {
  padding: 12px 4px 0;
}
.card__title {
  font-size: 14px;
  font-weight: 600;
  margin-top: 3px;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card__price {
  margin-top: 8px;
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.cta-wrap {
  padding: 0 48px 48px;
}
.cta {
  color: #fff;
  border-radius: 28px;
  padding: 40px 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
