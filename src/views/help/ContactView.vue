<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import StaticPage from '@/components/layout/StaticPage.vue'
import Button from '@/components/ds/Button.vue'
import IconBase from '@/components/ds/IconBase.vue'
import { submitContact, CONTACT_TITLE_MAX_LENGTH, CONTACT_CONTENT_MIN_LENGTH } from '@/api/help'
import { ApiError } from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { usePageSeo } from '@/composables/usePageSeo'

usePageSeo({
  title: '1:1 문의',
  description: '주문·배송·상품 문의를 남기면 rekit 고객센터가 순차적으로 답변드립니다.',
})

const auth = useAuthStore()

const topics = ['주문/배송', '환불/교환', '상품 문의', '판매 입점', '기타']
const topic = ref(topics[0])
const subject = ref('')
const message = ref('')
const submitted = ref(false)
const submitting = ref(false)
const errorMessage = ref('')

// 서버에는 "[문의 유형] 제목" 형태로 합쳐서 전송되므로, 접두어 길이만큼 제목 입력 가능 글자 수가 줄어든다.
const subjectMaxLength = computed(() => Math.max(0, CONTACT_TITLE_MAX_LENGTH - `[${topic.value}] `.length))
const isContentValid = computed(() => message.value.trim().length >= CONTACT_CONTENT_MIN_LENGTH)
const isFormValid = computed(() => !!subject.value.trim() && isContentValid.value)

async function submit(e: Event) {
  e.preventDefault()
  if (!isFormValid.value) return
  submitting.value = true
  errorMessage.value = ''
  try {
    await submitContact({
      title: `[${topic.value}] ${subject.value.trim()}`,
      content: message.value.trim(),
    })
    submitted.value = true
  } catch (err) {
    errorMessage.value = err instanceof ApiError ? err.message : '문의 접수 중 오류가 발생했습니다.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <StaticPage kicker="CONTACT" title="문의하기!" lead="평일 10:00~18:00 사이에 영업일 기준 1~2일 내 회신드려요.">
    <!-- Guest: contact requires login -->
    <div v-if="!auth.isAuthenticated" class="guest">
      <div class="guest__icon">
        <IconBase name="mail" :size="32" :stroke="1.5" />
      </div>
      <h2 class="guest__t">로그인 후 문의하실 수 있어요</h2>
      <p class="guest__b">문의 내역과 답변은 로그인된 계정 기준으로 관리돼요.</p>
      <RouterLink to="/auth/sign-in?redirect=/help/contact" class="guest__btn">로그인</RouterLink>
    </div>

    <div v-else-if="submitted" class="ok">
      <div class="ok__icon">
        <IconBase name="check" :size="28" :stroke="2.5" />
      </div>
      <h2 class="ok__t">문의가 접수됐어요</h2>
      <p class="ok__b">
        영업일 1~2일 내 답변드릴게요.<br />
        <RouterLink to="/my/contacts" class="ok__link">내 문의내역</RouterLink>에서 진행 상황을 확인하실 수 있어요.
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
        <span class="field__label">제목</span>
        <input
          v-model="subject"
          type="text"
          placeholder="문의 제목을 입력해 주세요"
          :maxlength="subjectMaxLength"
          required
        />
      </label>

      <label class="field">
        <span class="field__label">문의 내용</span>
        <textarea
          v-model="message"
          rows="6"
          placeholder="자세한 상황을 적어주시면 더 빠르게 도와드릴 수 있어요."
          required
        />
        <span class="field__hint" :class="{ 'field__hint--warn': !isContentValid }">
          {{ message.trim().length }} / 최소 {{ CONTACT_CONTENT_MIN_LENGTH }}자
        </span>
      </label>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <Button type="submit" variant="accent" size="lg" full :disabled="submitting || !isFormValid">
        {{ submitting ? '접수 중…' : '문의 보내기' }}
      </Button>
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

.field__hint {
  align-self: flex-end;
  font-size: 11.5px;
  color: var(--rekit-ink-subtle);
}

.field__hint--warn {
  color: var(--rekit-danger);
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

.error {
  margin: 0;
  font-size: 12.5px;
  color: var(--rekit-danger);
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
  line-height: 1.6;
}

.ok__link {
  color: var(--rekit-accent-deep);
  font-weight: 700;
  text-decoration: none;
}
.ok__link:hover {
  text-decoration: underline;
}

.guest {
  text-align: center;
  padding: 40px 16px;
}

.guest__icon {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  background: var(--rekit-accent-soft);
  color: var(--rekit-accent-deep);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.guest__t {
  margin: 20px 0 0;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.025em;
}

.guest__b {
  margin: 8px 0 0;
  font-size: 13.5px;
  color: var(--rekit-ink-muted);
}

.guest__btn {
  margin-top: 20px;
  display: inline-block;
  padding: 14px 28px;
  background: var(--rekit-accent);
  color: #fff;
  border-radius: 12px;
  font-weight: 700;
  text-decoration: none;
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
