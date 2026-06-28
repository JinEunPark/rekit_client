<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import IconBase from '@/components/ds/IconBase.vue'
import Badge from '@/components/ds/Badge.vue'
import Button from '@/components/ds/Button.vue'
import AppModal from '@/components/ds/AppModal.vue'
import { useAuthStore } from '@/stores/auth'
import { withdrawMe } from '@/api/users'

const router = useRouter()
const auth = useAuthStore()

const withdrawing = ref(false)
const withdrawOpen = ref(false)
const withdrawPassword = ref('')
const withdrawError = ref('')
const editing = ref(false)
const form = reactive({
  name: auth.user?.username ?? '',
  email: auth.user?.email ?? '',
})

function startEdit() {
  if (!auth.user) return
  form.name = auth.user.username
  form.email = auth.user.email
  editing.value = true
}

function cancelEdit() {
  editing.value = false
}

const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
const canSave = computed(() => form.name.trim().length > 0 && emailValid.value)

function save() {
  if (!auth.user || !canSave.value) return
  auth.user.username = form.name.trim()
  auth.user.email = form.email.trim()
  // persist immediately
  localStorage.setItem('rekit.auth.user.v3', JSON.stringify(auth.user))
  editing.value = false
}

function logout() {
  auth.logout()
  router.replace('/')
}

function openWithdrawModal() {
  withdrawPassword.value = ''
  withdrawError.value = ''
  withdrawOpen.value = true
}

async function confirmWithdraw() {
  if (!withdrawPassword.value) {
    withdrawError.value = '비밀번호를 입력해 주세요.'
    return
  }
  withdrawing.value = true
  withdrawError.value = ''
  try {
    await withdrawMe(withdrawPassword.value)
    withdrawOpen.value = false
    auth.logout()
    router.replace('/')
  } catch (e) {
    const code = (e as { code?: string }).code
    withdrawError.value =
      code === 'INVALID_CREDENTIALS'
        ? '비밀번호가 올바르지 않아요.'
        : '탈퇴 처리 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.'
  } finally {
    withdrawing.value = false
  }
}
</script>

<template>
  <!-- Guest fallback -->
  <div v-if="!auth.user" class="guest">
    <div class="guest__icon">
      <IconBase name="user" :size="36" :stroke="1.5" />
    </div>
    <h1 class="guest__t">로그인하면 프로필을 관리할 수 있어요</h1>
    <RouterLink to="/auth/sign-in?redirect=/my/profile" class="guest__btn">로그인</RouterLink>
  </div>

  <div v-else class="page">
    <header class="page__head">
      <h1 class="page__title">내 정보</h1>
    </header>

    <!-- Profile card -->
    <section class="profile">
      <div class="profile__avatar">{{ auth.initial }}</div>
      <div class="profile__info">
        <div class="profile__name">
          {{ auth.user.username }}
          <Badge v-if="auth.user.verified" tone="accent" size="xs">
            <IconBase name="shield" :size="9" /> 인증완료
          </Badge>
        </div>
        <div class="profile__id">@{{ auth.user.loginId }}</div>
      </div>
    </section>

    <!-- Editable info -->
    <section class="block">
      <header class="block__head">
        <h2>기본 정보</h2>
        <button v-if="!editing" type="button" class="link" @click="startEdit">수정</button>
        <button v-else type="button" class="link" @click="cancelEdit">취소</button>
      </header>

      <dl v-if="!editing" class="info">
        <div class="info__row">
          <dt>이름</dt>
          <dd>{{ auth.user.username }}</dd>
        </div>
        <div class="info__row">
          <dt>아이디</dt>
          <dd>{{ auth.user.loginId }}</dd>
        </div>
        <div class="info__row">
          <dt>이메일</dt>
          <dd>{{ auth.user.email }}</dd>
        </div>
        <div class="info__row">
          <dt>휴대폰</dt>
          <dd>
            <span v-if="auth.user.phone">{{ auth.user.phone }}</span>
            <span v-else class="info__empty">미등록 (본인인증 시 자동 등록)</span>
          </dd>
        </div>
      </dl>

      <form v-else class="form" novalidate @submit.prevent="save">
        <label class="field">
          <span class="field__label">이름</span>
          <input v-model="form.name" type="text" placeholder="이름" />
        </label>
        <label class="field" :class="{ 'field--err': !emailValid && form.email.length > 0 }">
          <span class="field__label">이메일</span>
          <input v-model="form.email" type="email" placeholder="you@example.com" />
        </label>
        <Button type="submit" variant="accent" size="md" full :disabled="!canSave">저장</Button>
      </form>
    </section>

    <!-- Verification status -->
    <section class="block">
      <h2 class="block__title">본인인증 상태</h2>
      <div v-if="auth.user.verified" class="verify verify--on">
        <IconBase name="shield" :size="20" />
        <div>
          <div class="verify__t">인증완료</div>
          <div class="verify__b">주문 시 본인인증 단계가 자동으로 생략돼요.</div>
        </div>
      </div>
      <div v-else class="verify">
        <IconBase name="warning" :size="20" />
        <div>
          <div class="verify__t">아직 인증되지 않았어요</div>
          <div class="verify__b">첫 주문 시 본인인증 단계가 자동으로 진행돼요.</div>
        </div>
      </div>
    </section>

    <!-- Security -->
    <section class="block">
      <h2 class="block__title">보안</h2>
      <ul class="actions">
        <li>
          <RouterLink to="/my/password" class="action">
            <span>비밀번호 변경</span>
            <IconBase name="chevronRight" :size="14" />
          </RouterLink>
        </li>
        <li>
          <button type="button" class="action">
            <span>알림 수신 설정</span>
            <IconBase name="chevronRight" :size="14" />
          </button>
        </li>
      </ul>
    </section>

    <!-- Account -->
    <section class="block">
      <h2 class="block__title">계정</h2>
      <ul class="actions">
        <li>
          <button type="button" class="action" @click="logout">
            <span>로그아웃</span>
            <IconBase name="chevronRight" :size="14" />
          </button>
        </li>
        <li>
          <button type="button" class="action action--danger" @click="openWithdrawModal">
            <span>회원탈퇴</span>
            <IconBase name="chevronRight" :size="14" />
          </button>
        </li>
      </ul>
    </section>

    <!-- 회원탈퇴 확인 모달 -->
    <AppModal :open="withdrawOpen" title="회원탈퇴" @close="withdrawOpen = false">
      <p class="modal__desc">
        탈퇴하면 관심상품·쿠폰 등 혜택이 모두 삭제돼요.<br>
        주문 내역은 전자상거래법에 따라 5년간 보존됩니다.
      </p>
      <form novalidate @submit.prevent="confirmWithdraw">
        <label class="field" :class="{ 'field--err': !!withdrawError }">
          <span class="field__label">현재 비밀번호</span>
          <input
            v-model="withdrawPassword"
            type="password"
            placeholder="비밀번호 입력"
            autocomplete="current-password"
          />
        </label>
        <p v-if="withdrawError" class="field__errmsg">{{ withdrawError }}</p>
        <div class="modal__cta">
          <Button variant="secondary" size="lg" :style="{ flex: '1' }" :disabled="withdrawing" @click="withdrawOpen = false">취소</Button>
          <Button type="submit" variant="danger" size="lg" :style="{ flex: '1.3' }" :disabled="withdrawing">
            {{ withdrawing ? '처리 중…' : '탈퇴하기' }}
          </Button>
        </div>
      </form>
    </AppModal>
  </div>
</template>

<style scoped>
.page {
  max-width: 720px;
  margin: 0 auto;
  padding: 16px 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
@media (min-width: 768px) {
  .page {
    padding: 32px 24px 56px;
  }
}

.page__head {
  margin-bottom: 4px;
}
.page__title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.025em;
}
@media (min-width: 768px) {
  .page__title {
    font-size: 28px;
  }
}

/* profile card */
.profile {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.profile__avatar {
  width: 60px;
  height: 60px;
  border-radius: 999px;
  background: var(--rekit-accent-soft);
  color: var(--rekit-accent-deep);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 800;
  flex-shrink: 0;
}
.profile__info {
  flex: 1;
}
.profile__name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.025em;
}
.profile__id {
  margin-top: 2px;
  font-size: 12.5px;
  color: var(--rekit-ink-subtle);
  font-family: var(--rekit-font-mono);
}

/* shared block */
.block {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  padding: 18px 20px;
}
.block__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.block__head h2,
.block__title {
  margin: 0 0 14px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.block__head h2 {
  margin: 0;
}

.link {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--rekit-ink-muted);
  padding: 4px 8px;
  border-radius: 6px;
}
.link:hover {
  color: var(--rekit-ink);
  background: var(--rekit-surface-muted);
}

/* info */
.info {
  margin: 0;
}
.info__row {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid var(--rekit-border);
  font-size: 13.5px;
}
.info__row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.info__row:first-child {
  padding-top: 0;
}
.info__row dt {
  width: 80px;
  margin: 0;
  color: var(--rekit-ink-muted);
}
.info__row dd {
  margin: 0;
  font-weight: 600;
  flex: 1;
}
.info__empty {
  color: var(--rekit-ink-subtle);
  font-weight: 500;
}

/* form */
.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.field__label {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--rekit-ink-muted);
}
.field input {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  color: var(--rekit-ink);
  outline: none;
  transition: border-color 0.12s, box-shadow 0.12s;
}
.field input:focus {
  border-color: var(--rekit-ink);
  box-shadow: 0 0 0 3px rgba(26, 26, 23, 0.06);
}
.field--err input {
  border-color: var(--rekit-danger);
}

/* verify */
.verify {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fef3e5;
  color: #7a4f1a;
  border-radius: 12px;
}
.verify svg {
  color: #b5762a;
  flex-shrink: 0;
}
.verify--on {
  background: var(--rekit-accent-soft);
  color: var(--rekit-accent-ink);
}
.verify--on svg {
  color: var(--rekit-accent-deep);
}
.verify__t {
  font-size: 13.5px;
  font-weight: 700;
}
.verify__b {
  margin-top: 2px;
  font-size: 12px;
  opacity: 0.85;
}

/* actions */
.actions {
  list-style: none;
  padding: 0;
  margin: 0;
}
.action {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid var(--rekit-border);
  font-size: 13.5px;
  font-weight: 500;
  color: var(--rekit-ink);
  text-align: left;
}
.actions li:last-child .action {
  border-bottom: none;
  padding-bottom: 0;
}
.actions li:first-child .action {
  padding-top: 0;
}
.action svg {
  color: var(--rekit-ink-subtle);
}
.action--danger {
  color: var(--rekit-danger);
}

/* withdraw modal content */
.modal__desc {
  margin: 0;
  font-size: 13px;
  color: var(--rekit-ink-muted);
  line-height: 1.65;
}
.field__errmsg {
  margin: -6px 0 0;
  font-size: 12px;
  color: var(--rekit-danger);
}
.modal__cta {
  display: flex;
  gap: 8px;
}

/* guest */
.guest {
  max-width: 380px;
  margin: 80px auto;
  text-align: center;
  padding: 0 20px;
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
  margin-bottom: 16px;
}
.guest__t {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.025em;
}
.guest__btn {
  display: inline-block;
  margin-top: 20px;
  padding: 14px 28px;
  background: var(--rekit-accent);
  color: #fff;
  border-radius: 12px;
  font-weight: 700;
  text-decoration: none;
}
</style>
