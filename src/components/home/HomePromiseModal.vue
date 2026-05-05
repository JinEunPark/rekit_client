<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import IconBase from '@/components/ds/IconBase.vue'
import ApplianceGlyph from '@/components/ds/ApplianceGlyph.vue'
import type { ApplianceKind } from '@/data/products'
import type { IconName } from '@/design/icons'

type PromiseCard = {
  glyph?: ApplianceKind
  icon?: IconName
  tint: 'mint' | 'sand' | 'sage'
  title: string
  desc: string
  badge: string
}

const promises: PromiseCard[] = [
  {
    glyph: 'fridge',
    tint: 'mint',
    title: '모든 상품은 입고 시\n작동을 확인해요',
    desc: '검수를 통과한 상품만 등록되며, 도착 후 7일 이내 동작 불량은 전액 환불해드려요.',
    badge: '동작 보증',
  },
  {
    icon: 'truck',
    tint: 'sand',
    title: '서울·경기는 당일\n직배송도 가능해요',
    desc: '대형가전 전문 기사가 운반·설치까지 함께 진행해요. 무거운 가전, 걱정하지 않아도 돼요.',
    badge: '직배송',
  },
  {
    icon: 'leaf',
    tint: 'sage',
    title: '새 가전 가격의\n70~80% 정도예요',
    desc: '폐업 매장에서 바로 도착해 평균 73% 할인. 영업용 가전이 많아 내구성도 더 검증됐어요.',
    badge: '합리적',
  },
]

const STORAGE_KEY = 'rekit.home-promise.v1'

const open = ref(false)

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

function lockBodyScroll() {
  if (typeof document !== 'undefined') document.body.style.overflow = 'hidden'
}

function unlockBodyScroll() {
  if (typeof document !== 'undefined') document.body.style.overflow = ''
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  if (typeof localStorage !== 'undefined') {
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (dismissed === todayISO()) return
  }
  open.value = true
  lockBodyScroll()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  unlockBodyScroll()
})

function close() {
  open.value = false
  unlockBodyScroll()
}

function dismissForToday() {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, todayISO())
  }
  close()
}
</script>

<template>
  <Transition name="promise">
    <div v-if="open" class="modal" role="dialog" aria-modal="true" aria-labelledby="promise-title">
      <button class="modal__scrim" aria-label="닫기" @click="close" />
      <div class="modal__panel">
        <button class="modal__close" aria-label="닫기" @click="close">
          <IconBase name="close" :size="20" />
        </button>

        <header class="head">
          <div class="head__kicker">REKIT PROMISE</div>
          <h2 id="promise-title" class="head__h">rekit만의 약속</h2>
          <p class="head__sub">폐업 매장의 영업용 가전, 새 가전처럼 만나보세요</p>
        </header>

        <div class="grid">
          <article
            v-for="p in promises"
            :key="p.badge"
            class="pcard"
            :class="`pcard--${p.tint}`"
          >
            <div class="pcard__avatar">
              <ApplianceGlyph v-if="p.glyph" :kind="p.glyph" />
              <IconBase v-else-if="p.icon" :name="p.icon" :size="32" :stroke="1.5" />
            </div>
            <div class="pcard__body">
              <h3 class="pcard__title">{{ p.title }}</h3>
              <p class="pcard__desc">{{ p.desc }}</p>
            </div>
            <span class="pcard__badge">{{ p.badge }}</span>
          </article>
        </div>

        <footer class="foot">
          <button type="button" class="foot__dismiss" @click="dismissForToday">
            오늘 하루 보지 않기
          </button>
          <button type="button" class="foot__close" @click="close">닫기</button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
}
.modal__scrim {
  position: absolute;
  inset: 0;
  background: rgba(20, 20, 15, 0.5);
  border: 0;
  cursor: pointer;
}
.modal__panel {
  position: relative;
  background: var(--rekit-surface);
  width: 100%;
  max-width: 560px;
  max-height: 92vh;
  border-radius: 24px 24px 0 0;
  padding: 24px 20px 16px;
  overflow-y: auto;
  box-shadow: 0 -8px 40px rgba(20, 20, 15, 0.12);
}
.modal__close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: var(--rekit-surface-muted);
  border: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--rekit-ink);
  cursor: pointer;
}
.modal__close:hover { background: var(--rekit-border); }

.head {
  text-align: center;
  margin: 4px 0 20px;
  padding: 0 28px;
}
.head__kicker {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--rekit-accent-deep);
}
.head__h {
  margin: 8px 0 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.025em;
}
.head__sub {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--rekit-ink-muted);
}

.grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pcard {
  background: var(--rekit-surface-muted);
  border-radius: 16px;
  padding: 16px 16px 14px;
  display: grid;
  grid-template-columns: 56px 1fr auto;
  align-items: center;
  gap: 12px;
}
.pcard__avatar {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pcard__avatar > svg {
  width: 36px;
  height: 36px;
}
.pcard--mint .pcard__avatar { background: #e9f4ee; color: var(--rekit-accent-deep); }
.pcard--sand .pcard__avatar { background: #f3ebdb; color: #9b6e2e; }
.pcard--sage .pcard__avatar { background: #ecedd9; color: #5e7150; }

.pcard__body { min-width: 0; }
.pcard__title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.35;
  white-space: pre-line;
}
.pcard__desc {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--rekit-ink-muted);
  line-height: 1.55;
}
.pcard__badge {
  align-self: flex-start;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--rekit-accent-soft);
  color: var(--rekit-accent-deep);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.foot {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--rekit-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.foot__dismiss {
  background: none;
  border: 0;
  color: var(--rekit-ink-subtle);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 4px;
}
.foot__dismiss:hover { color: var(--rekit-ink); }
.foot__close {
  background: var(--rekit-ink);
  color: #fff;
  border: 0;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

@media (min-width: 640px) {
  .modal {
    align-items: center;
    padding: 24px;
  }
  .modal__panel {
    border-radius: 24px;
    padding: 28px 28px 20px;
    max-height: 88vh;
  }
}

.promise-enter-active,
.promise-leave-active { transition: opacity 0.2s ease; }
.promise-enter-active .modal__panel,
.promise-leave-active .modal__panel { transition: transform 0.24s cubic-bezier(0.2, 0.7, 0.2, 1); }
.promise-enter-from,
.promise-leave-to { opacity: 0; }
.promise-enter-from .modal__panel,
.promise-leave-to .modal__panel { transform: translateY(24px); }
</style>
