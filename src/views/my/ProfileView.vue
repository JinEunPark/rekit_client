<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import IconBase from '@/components/ds/IconBase.vue'
import Badge from '@/components/ds/Badge.vue'
import Button from '@/components/ds/Button.vue'
import AppModal from '@/components/ds/AppModal.vue'
import PhoneVerifyForm from '@/components/auth/PhoneVerifyForm.vue'
import { useAuthStore } from '@/stores/auth'
import { withdrawMe } from '@/api/users'
import { buildAuthorizeUrl, type OAuthProvider } from '@/config/oauth'

const router = useRouter()
const auth = useAuthStore()

// ── 이름 수정 ──────────────────────────────────────────────
const editing = ref(false)
const saving = ref(false)
const saveError = ref('')
const form = reactive({ name: auth.user?.username ?? '' })

function startEdit() {
  if (!auth.user) return
  form.name = auth.user.username
  saveError.value = ''
  editing.value = true
}

function cancelEdit() {
  editing.value = false
  saveError.value = ''
}

async function save() {
  if (!auth.user || !form.name.trim()) return
  saving.value = true
  saveError.value = ''
  try {
    await auth.updateProfile({ username: form.name.trim() })
    editing.value = false
  } catch {
    saveError.value = '저장에 실패했어요. 잠시 후 다시 시도해 주세요.'
  } finally {
    saving.value = false
  }
}

// ── 휴대폰 변경 ────────────────────────────────────────────
// PhoneVerifyForm(Octomo QR 인증)이 phone 입력·발급·검증을 전부 관리한다 —
// verifyPhone 이 백엔드에서 user.phone 까지 같이 갱신하므로, 여기서는
// 패널을 열고 닫는 것과 완료 후 최신 상태를 반영하는 것만 담당한다.
const phoneEditOpen = ref(false)

function togglePhoneEdit() {
  phoneEditOpen.value = !phoneEditOpen.value
}

async function handlePhoneVerified() {
  await auth.fetchMe() // user.phone/verified/phone_verified_at 최신화
  phoneEditOpen.value = false
}

// ── 로그아웃 / 탈퇴 ────────────────────────────────────────
// hasPassword=false면 소셜 전용 가입 — 비밀번호 대신 소셜 재인증(reauth-for-withdrawal)으로 탈퇴.
const hasPassword = computed(() => auth.user?.hasPassword ?? true)
const withdrawing = ref(false)
const withdrawOpen = ref(false)
const withdrawPassword = ref('')
const withdrawError = ref('')

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
    await withdrawMe({ password: withdrawPassword.value })
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

/** 소셜 전용 계정: 가입 시 쓴 소셜 계정으로 다시 동의창을 태워 본인 확인 후 탈퇴를 이어간다. */
function startSocialReauthWithdraw(provider: OAuthProvider) {
  window.location.href = buildAuthorizeUrl(provider, 'withdrawal')
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
      <h2 class="block__title">기본 정보</h2>

      <dl class="info">
        <!-- 이름 -->
        <div class="info__row">
          <dt>이름</dt>
          <dd>{{ auth.user.username }}</dd>
          <button v-if="!editing" type="button" class="link link--sm" @click="startEdit">수정</button>
          <button v-else type="button" class="link link--sm" @click="cancelEdit">취소</button>
        </div>
        <div v-if="editing" class="info__expand">
          <form novalidate @submit.prevent="save">
            <div class="verify-row">
              <input v-model="form.name" type="text" placeholder="이름" class="verify-input" />
              <button type="submit" class="verify-btn" :disabled="!form.name.trim() || saving">
                {{ saving ? '저장 중…' : '저장' }}
              </button>
            </div>
            <p v-if="saveError" class="field__errmsg">{{ saveError }}</p>
          </form>
        </div>

        <!-- 아이디 -->
        <div class="info__row">
          <dt>아이디</dt>
          <dd>{{ auth.user.loginId }}</dd>
        </div>

        <!-- 이메일 -->
        <div class="info__row">
          <dt>이메일</dt>
          <dd>{{ auth.user.email }}</dd>
        </div>

        <!-- 휴대폰 -->
        <div class="info__row">
          <dt>휴대폰</dt>
          <dd>
            <span v-if="auth.user.phone">{{ auth.user.phone }}</span>
            <span v-else class="info__empty">미등록</span>
          </dd>
          <button type="button" class="link link--sm" @click="togglePhoneEdit">
            {{ phoneEditOpen ? '취소' : auth.user.phone ? '변경' : '등록' }}
          </button>
        </div>
        <div v-if="phoneEditOpen" class="info__expand">
          <PhoneVerifyForm :initial-phone="auth.user.phone ?? ''" @verified="handlePhoneVerified" />
        </div>
      </dl>
    </section>

    <!-- Verification status -->
    <section class="block">
      <h2 class="block__title">휴대폰 인증 상태</h2>
      <div v-if="auth.user.verified" class="verify verify--on">
        <IconBase name="shield" :size="20" />
        <div>
          <div class="verify__t">인증완료</div>
          <div class="verify__b">주문 시 휴대폰 인증 단계가 자동으로 생략돼요.</div>
        </div>
      </div>
      <div v-else class="verify">
        <IconBase name="warning" :size="20" />
        <div>
          <div class="verify__t">아직 인증되지 않았어요</div>
          <div class="verify__b">첫 주문 시 휴대폰 인증 단계가 자동으로 진행돼요.</div>
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
      <form v-if="hasPassword" novalidate @submit.prevent="confirmWithdraw">
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

      <!-- 소셜 전용 가입 — 비밀번호가 없으니 가입 시 쓴 소셜 계정으로 재인증해야 탈퇴 가능 -->
      <div v-else class="withdraw-social">
        <p class="withdraw-social__hint">
          소셜 계정으로 가입해 별도 비밀번호가 없어요. 가입할 때 사용한 소셜 계정으로 다시 인증하면 탈퇴가 진행돼요.
        </p>
        <div class="withdraw-social__btns">
          <button type="button" class="social social--kakao" @click="startSocialReauthWithdraw('kakao')">카카오로 인증</button>
          <button type="button" class="social social--naver" @click="startSocialReauthWithdraw('naver')">네이버로 인증</button>
          <button type="button" class="social social--google" @click="startSocialReauthWithdraw('google')">Google로 인증</button>
        </div>
        <Button variant="secondary" size="lg" full @click="withdrawOpen = false">취소</Button>
      </div>
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

/* inline field expand */
.info__expand {
  padding: 8px 0 14px;
  border-bottom: 1px solid var(--rekit-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.info__expand form {
  display: contents;
}

/* input + button row */
.verify-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.verify-input {
  flex: 1;
  min-width: 0;
  height: 44px;
  padding: 0 12px;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  color: var(--rekit-ink);
  outline: none;
  transition: border-color 0.12s, box-shadow 0.12s;
}
.verify-input:focus {
  border-color: var(--rekit-ink);
  box-shadow: 0 0 0 3px rgba(26, 26, 23, 0.06);
}
.verify-btn {
  flex-shrink: 0;
  height: 44px;
  padding: 0 14px;
  background: var(--rekit-ink);
  color: #fff;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  white-space: nowrap;
  transition: opacity 0.12s;
}
.verify-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.verify-btn:not(:disabled):hover {
  opacity: 0.82;
}

.link--sm {
  font-size: 11.5px;
  flex-shrink: 0;
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

.withdraw-social {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.withdraw-social__hint {
  margin: 0;
  font-size: 12.5px;
  color: var(--rekit-ink-muted);
  line-height: 1.6;
}
.withdraw-social__btns {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.social {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
}
.social--kakao {
  background: #fee500;
  color: #3b1e1e;
}
.social--naver {
  background: #03c75a;
  color: #fff;
}
.social--google {
  background: var(--rekit-surface);
  color: var(--rekit-ink);
  border: 1px solid var(--rekit-border);
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
