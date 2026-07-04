<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import StaticPage from '@/components/layout/StaticPage.vue'
import IconBase from '@/components/ds/IconBase.vue'
import { getFaqs, type FaqItem } from '@/api/help'
import { ApiError } from '@/api/client'

const faqs = ref<FaqItem[]>([])
const loading = ref(true)
const errorMessage = ref('')

const groups = computed(() => {
  const byCategory = new Map<string, FaqItem[]>()
  for (const f of faqs.value) {
    const list = byCategory.get(f.category) ?? []
    list.push(f)
    byCategory.set(f.category, list)
  }
  return [...byCategory.entries()].map(([category, items]) => ({
    category,
    items: items.slice().sort((a, b) => a.sort_order - b.sort_order),
  }))
})

onMounted(async () => {
  try {
    faqs.value = await getFaqs()
  } catch (err) {
    errorMessage.value = err instanceof ApiError ? err.message : 'FAQ를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <StaticPage
    kicker="FAQ"
    title="자주 묻는 질문"
    lead="가장 많이 받는 질문을 모았어요. 답을 못 찾으셨다면 문의하기로 알려주세요."
  >
    <div v-if="loading" class="state">불러오는 중…</div>
    <div v-else-if="errorMessage" class="state state--error">{{ errorMessage }}</div>
    <div v-else-if="faqs.length === 0" class="state">등록된 FAQ가 없습니다.</div>

    <div v-else class="groups">
      <section v-for="g in groups" :key="g.category" class="group">
        <h2 class="group__title">{{ g.category }}</h2>
        <ul class="qas">
          <li v-for="f in g.items" :key="f.id" class="qa">
            <details>
              <summary>
                <span class="qa__q">{{ f.question }}</span>
                <IconBase name="chevronDown" :size="16" class="qa__chevron" />
              </summary>
              <p class="qa__a">{{ f.answer }}</p>
            </details>
          </li>
        </ul>
      </section>
    </div>
  </StaticPage>
</template>

<style scoped>
.state {
  padding: 40px 0;
  text-align: center;
  color: var(--rekit-ink-subtle);
  font-size: 13.5px;
}
.state--error {
  color: var(--rekit-danger);
}

.groups {
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.group__title {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 700;
  color: var(--rekit-accent-deep);
  letter-spacing: -0.01em;
}
.qas {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.qa {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 14px;
}
.qa details {
  padding: 18px 20px;
}
.qa summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  list-style: none;
  cursor: pointer;
}
.qa summary::-webkit-details-marker {
  display: none;
}
.qa__q {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.015em;
}
.qa__chevron {
  color: var(--rekit-ink-subtle);
  transition: transform 0.18s ease;
  flex-shrink: 0;
}
.qa details[open] .qa__chevron {
  transform: rotate(180deg);
}
.qa__a {
  margin: 12px 0 0;
  font-size: 13.5px;
  color: var(--rekit-ink-muted);
  line-height: 1.7;
  white-space: pre-line;
}
</style>
