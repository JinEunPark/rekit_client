<script setup lang="ts">
import { ref } from 'vue'
import IconBase from '@/components/ds/IconBase.vue'
import { won } from '@/design/tokens'

defineProps<{
  amount: number
  orderId: string
}>()

const BANK = {
  name: '카카오뱅크',
  account: '3333-01-1234567',
  holder: '(주)rekit',
}

const copied = ref<'account' | 'name' | null>(null)

async function copy(text: string, kind: 'account' | 'name') {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = kind
    setTimeout(() => {
      if (copied.value === kind) copied.value = null
    }, 1600)
  } catch {
    // clipboard blocked — silent
  }
}
</script>

<template>
  <section class="deposit">
    <div class="deposit__head">
      <div class="deposit__kicker">입금 안내</div>
      <h3 class="deposit__title">아래 계좌로 입금해 주세요</h3>
      <p class="deposit__sub">
        영업일 9~18시 기준 평균 2시간 내 확인됩니다. 야간/주말 입금은 다음 영업일에 일괄 확인합니다.
      </p>
    </div>

    <dl class="info">
      <div class="info__row">
        <dt>은행 / 계좌번호</dt>
        <dd>
          <span class="info__v">{{ BANK.name }} {{ BANK.account }}</span>
          <button type="button" class="copy" @click="copy(BANK.account.replace(/-/g, ''), 'account')">
            {{ copied === 'account' ? '복사됨' : '복사' }}
          </button>
        </dd>
      </div>
      <div class="info__row">
        <dt>예금주</dt>
        <dd><span class="info__v">{{ BANK.holder }}</span></dd>
      </div>
      <div class="info__row info__row--big">
        <dt>입금 금액</dt>
        <dd><span class="info__amount">{{ won(amount) }}</span></dd>
      </div>
      <div class="info__row info__row--name">
        <dt>입금자명</dt>
        <dd>
          <span class="info__v info__v--mono">{{ orderId }}</span>
          <button type="button" class="copy" @click="copy(orderId, 'name')">
            {{ copied === 'name' ? '복사됨' : '복사' }}
          </button>
        </dd>
      </div>
    </dl>

    <div class="warn">
      <IconBase name="warning" :size="14" />
      <span>입금자명이 다르면 자동 매칭이 안 돼요. 꼭 <b>{{ orderId }}</b> 그대로 입력해 주세요.</span>
    </div>
  </section>
</template>

<style scoped>
.deposit {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 12px;
}
.deposit__head { margin-bottom: 16px; }
.deposit__kicker {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--rekit-accent-deep);
}
.deposit__title {
  margin: 6px 0 0;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.deposit__sub {
  margin: 8px 0 0;
  font-size: 12.5px;
  color: var(--rekit-ink-muted);
  line-height: 1.55;
}

.info { margin: 0; }
.info__row {
  display: grid;
  grid-template-columns: 92px 1fr;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--rekit-border);
  align-items: center;
}
.info__row:last-of-type { border-bottom: 0; }
.info__row dt {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--rekit-ink-subtle);
}
.info__row dd {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
}
.info__v {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--rekit-ink);
  word-break: break-all;
}
.info__v--mono { font-family: var(--rekit-font-mono); }
.info__amount {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: var(--rekit-ink);
}
.info__row--big { padding: 14px 0; }
.info__row--name dd { padding: 6px 0; }

.copy {
  background: var(--rekit-surface-muted);
  border: 0;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--rekit-ink-muted);
  cursor: pointer;
  flex-shrink: 0;
}
.copy:hover { background: var(--rekit-border); color: var(--rekit-ink); }

.warn {
  margin-top: 12px;
  padding: 10px 12px;
  background: #FFF8E8;
  border: 1px solid #F0D898;
  border-radius: 10px;
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 12px;
  color: #7A5018;
  line-height: 1.5;
}
.warn svg { color: #B5762A; flex-shrink: 0; margin-top: 2px; }
.warn b { color: #7A5018; font-family: var(--rekit-font-mono); font-weight: 700; }
</style>
