<script setup lang="ts">
withDefaults(
  defineProps<{
    kicker?: string
    title: string
    lead?: string
    /** Content max-width. Defaults to 720px (legible long-form). */
    maxWidth?: number
  }>(),
  { maxWidth: 720 },
)
</script>

<template>
  <div class="sp" :style="{ '--sp-max': `${maxWidth}px` }">
    <header class="sp__head">
      <div v-if="kicker" class="sp__kicker">{{ kicker }}</div>
      <h1 class="sp__title">{{ title }}</h1>
      <p v-if="lead" class="sp__lead">{{ lead }}</p>
    </header>
    <main class="sp__main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.sp {
  max-width: var(--sp-max);
  margin: 0 auto;
  padding: 32px 20px 64px;
}
.sp__head {
  margin-bottom: 32px;
}
.sp__kicker {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--rekit-accent-deep);
  margin-bottom: 8px;
}
.sp__title {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.25;
}
.sp__lead {
  margin: 12px 0 0;
  font-size: 14.5px;
  color: var(--rekit-ink-muted);
  line-height: 1.65;
}
.sp__main :deep(h2) {
  margin: 36px 0 12px;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.sp__main :deep(p) {
  margin: 12px 0 0;
  font-size: 14px;
  color: var(--rekit-ink);
  line-height: 1.7;
}
.sp__main :deep(strong) {
  font-weight: 700;
}
.sp__main :deep(ul),
.sp__main :deep(ol) {
  margin: 12px 0 0;
  padding-left: 22px;
}
.sp__main :deep(li) {
  font-size: 14px;
  line-height: 1.7;
  margin-top: 6px;
}

@media (min-width: 768px) {
  .sp {
    padding: 56px 24px 96px;
  }
  .sp__title {
    font-size: 32px;
  }
}
</style>
