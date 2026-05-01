<script setup lang="ts">
import { REKIT } from '@/design/tokens'
import PhoneShell from '@/_design/components/PhoneShell.vue'
import TabBar from '@/_design/components/TabBar.vue'
import HomeIndicator from '@/_design/components/HomeIndicator.vue'
import IconBase from '@/components/ds/IconBase.vue'
import Badge from '@/components/ds/Badge.vue'
import Button from '@/components/ds/Button.vue'
import ProductTile from '@/components/ds/ProductTile.vue'
import type { IconName } from '@/design/icons'

const counts = [
  { n: 1, l: '결제완료' },
  { n: 2, l: '준비중' },
  { n: 1, l: '배송중' },
  { n: 5, l: '배송완료' },
]

const menus: { i: IconName; t: string; n?: string; tone?: 'accent' }[] = [
  { i: 'heart', t: '관심상품', n: '12' },
  { i: 'map', t: '배송지 관리', n: '2' },
  { i: 'shield', t: '본인인증 상태', n: '인증완료', tone: 'accent' },
  { i: 'info', t: '공지사항' },
  { i: 'mail', t: '문의하기' },
]
</script>

<template>
  <PhoneShell>
    <div class="header">
      <div style="font-size: 18px; font-weight: 800; letter-spacing: -0.02em">마이페이지</div>
      <div style="display: flex; gap: 12px">
        <IconBase name="bell" :size="22" />
        <IconBase name="settings" :size="22" />
      </div>
    </div>

    <div class="scroll rekit-no-scrollbar">
      <div class="block">
        <div class="profile" :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }">
          <div class="profile__row">
            <div
              class="profile__avatar"
              :style="{ background: REKIT.color.accentSoft, color: REKIT.color.accentDeep }"
            >
              박
            </div>
            <div style="flex: 1">
              <div class="profile__name">
                박은영 님
                <Badge tone="accent" size="xs"><IconBase name="shield" :size="9" /> 인증완료</Badge>
              </div>
              <div :style="{ fontSize: '12px', color: REKIT.color.inkSubtle, marginTop: '2px' }">
                eunyoung@rekit.kr
              </div>
            </div>
            <IconBase name="chevronRight" :size="18" :style="{ color: REKIT.color.inkSubtle }" />
          </div>
          <div class="profile__eco" :style="{ background: REKIT.color.accentSoft }">
            <IconBase name="leaf" :size="18" :style="{ color: REKIT.color.accentDeep }" />
            <div :style="{ flex: 1, fontSize: '12px', color: REKIT.color.accentInk, fontWeight: 600 }">
              지금까지 <b>약 86kg</b>의 가전을 다시 살렸어요
            </div>
          </div>
        </div>
      </div>

      <div class="block">
        <div class="row">
          <div class="row__t">주문 / 배송</div>
          <span :style="{ fontSize: '12px', fontWeight: 600, color: REKIT.color.inkMuted }">전체보기</span>
        </div>
        <div class="counts" :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }">
          <div
            v-for="(s, i) in counts"
            :key="s.l"
            class="counts__cell"
            :style="{ borderRight: i < counts.length - 1 ? `1px solid ${REKIT.color.border}` : 'none' }"
          >
            <div class="counts__n">{{ s.n }}</div>
            <div class="counts__l" :style="{ color: REKIT.color.inkSubtle }">{{ s.l }}</div>
          </div>
        </div>
      </div>

      <div class="block">
        <div class="recent" :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }">
          <div class="recent__head">
            <Badge tone="info" size="sm">배송중</Badge>
            <span :style="{ fontSize: '11px', color: REKIT.color.inkSubtle, fontFamily: REKIT.font.mono }">
              RK-26050001
            </span>
          </div>
          <div style="display: flex; gap: 12px">
            <div style="width: 56px">
              <ProductTile kind="fridge" tone="mint" ratio="1/1" :radius="REKIT.radius.sm" :show-label="false" />
            </div>
            <div style="flex: 1">
              <div style="font-size: 13px; font-weight: 600">삼성 양문형 냉장고 384L 외 2건</div>
              <div :style="{ fontSize: '11.5px', color: REKIT.color.inkSubtle, marginTop: '2px' }">
                5월 3일(토) 도착 예정
              </div>
              <div style="margin-top: 8px; display: flex; gap: 6px">
                <Button variant="secondary" size="sm">배송조회</Button>
                <Button variant="ghost" size="sm" :style="{ border: `1px solid ${REKIT.color.border}` }">
                  주문상세
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="block" style="padding-bottom: 24px">
        <div class="menu" :style="{ background: REKIT.color.surface, border: `1px solid ${REKIT.color.border}` }">
          <div
            v-for="(m, i) in menus"
            :key="m.t"
            class="menu__row"
            :style="{ borderBottom: i < menus.length - 1 ? `1px solid ${REKIT.color.border}` : 'none' }"
          >
            <IconBase :name="m.i" :size="18" :style="{ color: REKIT.color.inkMuted }" />
            <span style="flex: 1; font-size: 13.5px; font-weight: 500">{{ m.t }}</span>
            <span
              v-if="m.n"
              :style="{
                fontSize: '12px',
                color: m.tone === 'accent' ? REKIT.color.accentDeep : REKIT.color.inkSubtle,
                fontWeight: 600,
              }"
            >
              {{ m.n }}
            </span>
            <IconBase name="chevronRight" :size="16" :style="{ color: REKIT.color.inkSubtle }" />
          </div>
        </div>
      </div>
    </div>

    <TabBar active="me" />
    <HomeIndicator />
  </PhoneShell>
</template>

<style scoped>
.header {
  padding: 4px 20px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.scroll {
  overflow-y: auto;
  height: calc(844px - 48px - 56px - 86px);
}
.block {
  padding: 0 20px 16px;
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
}
.profile {
  border-radius: 20px;
  padding: 18px;
}
.profile__row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.profile__avatar {
  width: 52px;
  height: 52px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
}
.profile__name {
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}
.profile__eco {
  margin-top: 14px;
  padding: 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.counts {
  border-radius: 16px;
  padding: 14px 0;
  display: flex;
}
.counts__cell {
  flex: 1;
  text-align: center;
}
.counts__n {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.counts__l {
  font-size: 11px;
  margin-top: 2px;
}
.recent {
  border-radius: 16px;
  padding: 14px;
}
.recent__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.menu {
  border-radius: 16px;
  overflow: hidden;
}
.menu__row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
}
</style>
