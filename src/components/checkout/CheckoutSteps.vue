<script setup lang="ts">
import IconBase from '@/components/ds/IconBase.vue'

defineProps<{ current: 1 | 2 | 3 }>()

const steps: { n: 1 | 2 | 3; label: string }[] = [
  { n: 1, label: '본인인증' },
  { n: 2, label: '주문서 작성' },
  { n: 3, label: '결제' },
]
</script>

<template>
  <div class="steps">
    <template v-for="(s, i) in steps" :key="s.n">
      <div
        class="step"
        :class="{
          'step--current': s.n === current,
          'step--done': s.n < current,
        }"
      >
        <div class="step__circle">
          <IconBase v-if="s.n < current" name="check" :size="13" :stroke="2.6" />
          <span v-else>{{ s.n }}</span>
        </div>
        <span class="step__label">{{ s.label }}</span>
      </div>
      <div
        v-if="i < steps.length - 1"
        class="step__line"
        :class="{ 'step__line--filled': s.n < current }"
      />
    </template>
  </div>
</template>

<style scoped>
.steps {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 16px 0 4px;
}

.step {
  display: flex;
  align-items: center;
  gap: 6px;
}

.step__circle {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  background: var(--rekit-surface-muted);
  color: var(--rekit-ink-subtle);
  font-family: var(--rekit-font-mono);
  letter-spacing: -0.02em;
  flex-shrink: 0;
}

.step--current .step__circle {
  background: var(--rekit-ink);
  color: #fff;
}

.step--done .step__circle {
  background: var(--rekit-accent);
  color: #fff;
}

.step__label {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--rekit-ink-subtle);
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.step--current .step__label {
  color: var(--rekit-ink);
  font-weight: 700;
}

.step--done .step__label {
  color: var(--rekit-ink-muted);
}

.step__line {
  flex: 1;
  height: 1px;
  background: var(--rekit-border);
  min-width: 12px;
}

.step__line--filled {
  background: var(--rekit-accent);
}
</style>
