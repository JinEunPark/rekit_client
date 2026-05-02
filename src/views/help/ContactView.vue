<script setup lang="ts">
import { ref } from 'vue'
import StaticPage from '@/components/layout/StaticPage.vue'
import Button from '@/components/ds/Button.vue'
import IconBase from '@/components/ds/IconBase.vue'

const topics = ['주문/배송', '환불/교환', '상품 문의', '판매 입점', '기타']
const topic = ref(topics[0])
const email = ref('')
const message = ref('')
const submitted = ref(false)

function submit(e: Event) {
  e.preventDefault()
  if (!email.value || !message.value) return
  submitted.value = true
}
</script>

<template>
  <StaticPage
    kicker="CONTACT"
    title="문의하기"
    lead="평일 10:00~18:00 사이에 영업일 기준 1~2일 내 회신드려요."
  >
    <div v-if="submitted" class="ok">
      <div class="ok__icon">
        <IconBase name="check" :size="28" :stroke="2.5" />
      </div>
      <h2 class="ok__t">문의가 접수됐어요</h2>
      <p class="ok__b">
        영업일 1~2일 내 <b>{{ email }}</b>로 답변드릴게요.
      </p>
    </div>

    <form v-else class="form" @submit="submit">
      <label class="field">
        <span class="field__label">문의 유형</span>
        <select v-model="topic">
          <option v-for="t in topics" :key="t" :value="t">{{ t }}</option>
        </select>
      </label>

      <label class="field">
        <span class="field__label">답변 받을 이메일</span>
        <input v-model="email" type="email" placeholder="you@example.com" required />
      </label>

      <label class="field">
        <span class="field__label">문의 내용</span>
        <textarea
          v-model="message"
          rows="6"
          placeholder="자세한 상황을 적어주시면 더 빠르게 도와드릴 수 있어요."
          required
        />
      </label>

      <Button type="submit" variant="accent" size="lg" full>문의 보내기</Button>
    </form>

    <div class="alt">
      <h2>다른 방법</h2>
      <ul>
        <li>이메일 — <b>help@rekit.kr</b></li>
        <li>전화 (평일 10~18시) — <b>1599-0000</b></li>
        <li>카카오 채널 — <b>@rekit</b></li>
      </ul>
    </div>
  </StaticPage>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--rekit-ink-muted);
}
.field input,
.field select,
.field textarea {
  width: 100%;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 15px;
  font-family: inherit;
  color: var(--rekit-ink);
  letter-spacing: -0.01em;
  outline: none;
  transition: border-color 0.12s, box-shadow 0.12s;
}
.field textarea {
  resize: vertical;
  min-height: 140px;
  line-height: 1.55;
}
.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: var(--rekit-ink);
  box-shadow: 0 0 0 3px rgba(26, 26, 23, 0.06);
}
.field input::placeholder,
.field textarea::placeholder {
  color: var(--rekit-ink-placeholder);
}

.ok {
  text-align: center;
  padding: 32px 16px;
}
.ok__icon {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  background: var(--rekit-accent);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.ok__t {
  margin: 20px 0 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.025em;
}
.ok__b {
  margin: 8px 0 0;
  font-size: 14px;
  color: var(--rekit-ink-muted);
}

.alt {
  margin-top: 20px;
  padding: 20px 22px;
  background: var(--rekit-surface-muted);
  border-radius: 14px;
}
.alt :deep(h2) {
  margin: 0 0 8px;
  font-size: 14px;
}
.alt :deep(li) {
  font-size: 13.5px;
  color: var(--rekit-ink-muted);
}
</style>
