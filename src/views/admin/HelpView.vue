<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from 'vue'
import AdminShell from '@/components/admin/AdminShell.vue'
import Button from '@/components/ds/Button.vue'
import Badge from '@/components/ds/Badge.vue'
import IconBase from '@/components/ds/IconBase.vue'
import {
  listAdminNotices,
  createAdminNotice,
  updateAdminNotice,
  deleteAdminNotice,
  listAdminFaqs,
  createAdminFaq,
  updateAdminFaq,
  deleteAdminFaq,
  listAdminContacts,
  getAdminContact,
  updateAdminContactStatus,
  answerAdminContact,
  ANSWER_MAX_LENGTH,
  type AdminNoticeResponse,
  type AdminFaqResponse,
  type AdminContactListItem,
  type AdminContactDetail,
  type ContactStatus,
} from '@/api/admin/help'
import { ApiError } from '@/api/client'
import { formatDate } from '@/design/tokens'
import { contactStatusLabel, contactStatusTone } from '@/stores/contacts-helpers'

const TABS = [
  { id: 'notices' as const, label: '공지사항' },
  { id: 'faqs' as const, label: 'FAQ' },
  { id: 'contacts' as const, label: '1:1 문의' },
]
const activeTab = ref<(typeof TABS)[number]['id']>('notices')

const actionError = ref('')

/** Swap an item in a list ref for its freshly-saved server copy, matched by id. */
function replaceById<T extends { id: number }>(list: Ref<T[]>, updated: T) {
  const idx = list.value.findIndex((x) => x.id === updated.id)
  if (idx !== -1) list.value[idx] = updated
}

// ── 공지사항 ──────────────────────────────────
const notices = ref<AdminNoticeResponse[]>([])
const noticesLoading = ref(false)
const noticeForm = ref(false)
const editingNotice = ref<AdminNoticeResponse | null>(null)
const noticeTitle = ref('')
const noticeContent = ref('')
const noticePinned = ref(false)
const noticePublished = ref(true)
const noticeSaving = ref(false)

async function loadNotices() {
  noticesLoading.value = true
  try {
    const res = await listAdminNotices({ size: 100 })
    notices.value = res.items
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : '공지사항을 불러오지 못했습니다.'
  } finally {
    noticesLoading.value = false
  }
}

function openNoticeAdd() {
  editingNotice.value = null
  noticeTitle.value = ''
  noticeContent.value = ''
  noticePinned.value = false
  noticePublished.value = true
  noticeForm.value = true
}

function openNoticeEdit(n: AdminNoticeResponse) {
  editingNotice.value = n
  noticeTitle.value = n.title
  noticeContent.value = n.content
  noticePinned.value = n.is_pinned
  noticePublished.value = n.is_published
  noticeForm.value = true
}

async function saveNotice() {
  if (!noticeTitle.value.trim() || !noticeContent.value.trim()) {
    actionError.value = '제목과 내용은 필수입니다.'
    return
  }
  noticeSaving.value = true
  actionError.value = ''
  try {
    const body = {
      title: noticeTitle.value.trim(),
      content: noticeContent.value.trim(),
      is_pinned: noticePinned.value,
      is_published: noticePublished.value,
    }
    if (editingNotice.value) {
      replaceById(notices, await updateAdminNotice(editingNotice.value.id, body))
    } else {
      notices.value.unshift(await createAdminNotice(body))
    }
    noticeForm.value = false
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : '공지사항 저장에 실패했습니다.'
  } finally {
    noticeSaving.value = false
  }
}

async function removeNotice(n: AdminNoticeResponse) {
  if (!confirm(`"${n.title}" 공지사항을 삭제하시겠습니까?`)) return
  try {
    await deleteAdminNotice(n.id)
    notices.value = notices.value.filter((x) => x.id !== n.id)
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : '삭제에 실패했습니다.'
  }
}

// ── FAQ ──────────────────────────────────
const faqs = ref<AdminFaqResponse[]>([])
const faqsLoading = ref(false)
const faqForm = ref(false)
const editingFaq = ref<AdminFaqResponse | null>(null)
const faqCategory = ref('')
const faqQuestion = ref('')
const faqAnswer = ref('')
const faqOrder = ref('0')
const faqPublished = ref(true)
const faqSaving = ref(false)

async function loadFaqs() {
  faqsLoading.value = true
  try {
    const res = await listAdminFaqs({ size: 100 })
    faqs.value = res.items
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : 'FAQ를 불러오지 못했습니다.'
  } finally {
    faqsLoading.value = false
  }
}

function openFaqAdd() {
  editingFaq.value = null
  faqCategory.value = ''
  faqQuestion.value = ''
  faqAnswer.value = ''
  faqOrder.value = '0'
  faqPublished.value = true
  faqForm.value = true
}

function openFaqEdit(f: AdminFaqResponse) {
  editingFaq.value = f
  faqCategory.value = f.category
  faqQuestion.value = f.question
  faqAnswer.value = f.answer
  faqOrder.value = String(f.sort_order)
  faqPublished.value = f.is_published
  faqForm.value = true
}

async function saveFaq() {
  if (!faqCategory.value.trim() || !faqQuestion.value.trim() || !faqAnswer.value.trim()) {
    actionError.value = '카테고리·질문·답변은 필수입니다.'
    return
  }
  faqSaving.value = true
  actionError.value = ''
  try {
    const body = {
      category: faqCategory.value.trim(),
      question: faqQuestion.value.trim(),
      answer: faqAnswer.value.trim(),
      sort_order: Number(faqOrder.value) || 0,
      is_published: faqPublished.value,
    }
    if (editingFaq.value) {
      replaceById(faqs, await updateAdminFaq(editingFaq.value.id, body))
    } else {
      faqs.value.push(await createAdminFaq(body))
    }
    faqForm.value = false
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : 'FAQ 저장에 실패했습니다.'
  } finally {
    faqSaving.value = false
  }
}

async function removeFaq(f: AdminFaqResponse) {
  if (!confirm(`"${f.question}" FAQ를 삭제하시겠습니까?`)) return
  try {
    await deleteAdminFaq(f.id)
    faqs.value = faqs.value.filter((x) => x.id !== f.id)
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : '삭제에 실패했습니다.'
  }
}

// ── 1:1 문의 ──────────────────────────────────
const CONTACT_FILTERS: { key: ContactStatus | ''; label: string }[] = [
  { key: '', label: '전체' },
  { key: 'PENDING', label: contactStatusLabel('PENDING') },
  { key: 'ANSWERED', label: contactStatusLabel('ANSWERED') },
]

const contacts = ref<AdminContactListItem[]>([])
const contactsLoading = ref(false)
const contactStatusFilter = ref<ContactStatus | ''>('')
const expandedContactId = ref<number | null>(null)
const contactDetail = ref<AdminContactDetail | null>(null)
const contactDetailLoading = ref(false)
const contactStatusSaving = ref(false)
const replyContent = ref('')
const replySaving = ref(false)
const contactNotice = ref('')

const replyButtonLabel = computed(() => {
  if (replySaving.value) return '등록 중…'
  return contactDetail.value?.status === 'ANSWERED' ? '답변 수정' : '답변 등록'
})

async function loadContacts() {
  contactsLoading.value = true
  try {
    const res = await listAdminContacts({ size: 100, status: contactStatusFilter.value || undefined })
    contacts.value = res.items
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : '문의 목록을 불러오지 못했습니다.'
  } finally {
    contactsLoading.value = false
  }
}

async function toggleContact(c: AdminContactListItem) {
  if (expandedContactId.value === c.id) {
    expandedContactId.value = null
    contactDetail.value = null
    return
  }
  expandedContactId.value = c.id
  contactDetail.value = null
  contactNotice.value = ''
  contactDetailLoading.value = true
  try {
    contactDetail.value = await getAdminContact(c.id)
    replyContent.value = contactDetail.value.answer_content ?? ''
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : '문의 상세를 불러오지 못했습니다.'
  } finally {
    contactDetailLoading.value = false
  }
}

async function setContactStatus(status: ContactStatus) {
  if (!contactDetail.value) return
  contactStatusSaving.value = true
  contactNotice.value = ''
  try {
    const updated = await updateAdminContactStatus(contactDetail.value.id, status)
    contactDetail.value = updated
    replaceById(contacts, updated)
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : '상태 변경에 실패했습니다.'
  } finally {
    contactStatusSaving.value = false
  }
}

async function submitReply() {
  if (!contactDetail.value) return
  const answer = replyContent.value.trim()
  if (!answer || answer.length > ANSWER_MAX_LENGTH) return
  replySaving.value = true
  actionError.value = ''
  contactNotice.value = ''
  try {
    const updated = await answerAdminContact(contactDetail.value.id, answer)
    contactDetail.value = updated
    replyContent.value = updated.answer_content ?? ''
    replaceById(contacts, updated)
    contactNotice.value = '고객에게 답변 메일이 발송되었습니다.'
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : '답변 등록에 실패했습니다.'
  } finally {
    replySaving.value = false
  }
}

onMounted(() => {
  void loadNotices()
  void loadFaqs()
  void loadContacts()
})
</script>

<template>
  <AdminShell active="help" title="고객센터" subtitle="공지사항 · FAQ · 1:1 문의 관리">
    <div v-if="actionError" class="action-error">
      <IconBase name="info" :size="14" />
      {{ actionError }}
      <button type="button" class="action-error__close" @click="actionError = ''">✕</button>
    </div>

    <div class="tabs">
      <button
        v-for="t in TABS"
        :key="t.id"
        type="button"
        class="tab"
        :class="{ 'tab--active': activeTab === t.id }"
        @click="activeTab = t.id"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- 공지사항 -->
    <section v-if="activeTab === 'notices'">
      <div class="section-head">
        <Button variant="primary" size="sm" leading-icon="plus" @click="openNoticeAdd">공지 추가</Button>
      </div>

      <div v-if="noticeForm" class="form-panel">
        <div class="form-panel__title">{{ editingNotice ? '공지사항 수정' : '새 공지사항' }}</div>
        <div class="field">
          <label class="field__label">제목 <span class="req">*</span></label>
          <input v-model="noticeTitle" class="input" type="text" />
        </div>
        <div class="field">
          <label class="field__label">내용 <span class="req">*</span></label>
          <textarea v-model="noticeContent" class="input textarea" />
        </div>
        <div class="checks">
          <label class="check"><input v-model="noticePinned" type="checkbox" /> 상단 고정</label>
          <label class="check"><input v-model="noticePublished" type="checkbox" /> 게시 (구매자에게 노출)</label>
        </div>
        <div class="form-panel__actions">
          <Button variant="secondary" size="sm" @click="noticeForm = false">취소</Button>
          <Button variant="primary" size="sm" :disabled="noticeSaving" @click="saveNotice">
            {{ noticeSaving ? '저장 중…' : '저장' }}
          </Button>
        </div>
      </div>

      <div class="table">
        <div class="table__head notice-cols">
          <span>제목</span>
          <span>고정</span>
          <span>게시</span>
          <span>작성일</span>
          <span />
        </div>
        <div v-if="noticesLoading" class="empty">불러오는 중…</div>
        <div v-else-if="notices.length === 0" class="empty">등록된 공지사항이 없습니다.</div>
        <div v-for="n in notices" :key="n.id" class="table__row notice-cols">
          <span class="name">{{ n.title }}</span>
          <span><Badge v-if="n.is_pinned" tone="accent" size="xs">고정</Badge></span>
          <span><Badge :tone="n.is_published ? 'accent' : 'neutral'" size="xs">{{ n.is_published ? '게시중' : '비공개' }}</Badge></span>
          <span class="mono">{{ formatDate(n.created_at) }}</span>
          <div class="row-actions">
            <button class="row-action" aria-label="수정" @click="openNoticeEdit(n)">
              <IconBase name="edit" :size="15" />
            </button>
            <button class="row-action row-action--danger" aria-label="삭제" @click="removeNotice(n)">
              <IconBase name="close" :size="15" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section v-else-if="activeTab === 'faqs'">
      <div class="section-head">
        <Button variant="primary" size="sm" leading-icon="plus" @click="openFaqAdd">FAQ 추가</Button>
      </div>

      <div v-if="faqForm" class="form-panel">
        <div class="form-panel__title">{{ editingFaq ? 'FAQ 수정' : '새 FAQ' }}</div>
        <div class="form-panel__grid">
          <div class="field">
            <label class="field__label">카테고리 <span class="req">*</span></label>
            <input v-model="faqCategory" class="input" type="text" placeholder="예: 주문, 배송, 결제" />
          </div>
          <div class="field">
            <label class="field__label">정렬 순서</label>
            <input v-model="faqOrder" class="input" type="number" />
          </div>
        </div>
        <div class="field">
          <label class="field__label">질문 <span class="req">*</span></label>
          <input v-model="faqQuestion" class="input" type="text" />
        </div>
        <div class="field">
          <label class="field__label">답변 <span class="req">*</span></label>
          <textarea v-model="faqAnswer" class="input textarea" />
        </div>
        <div class="checks">
          <label class="check"><input v-model="faqPublished" type="checkbox" /> 게시 (구매자에게 노출)</label>
        </div>
        <div class="form-panel__actions">
          <Button variant="secondary" size="sm" @click="faqForm = false">취소</Button>
          <Button variant="primary" size="sm" :disabled="faqSaving" @click="saveFaq">
            {{ faqSaving ? '저장 중…' : '저장' }}
          </Button>
        </div>
      </div>

      <div class="table">
        <div class="table__head faq-cols">
          <span>카테고리</span>
          <span>질문</span>
          <span>정렬</span>
          <span>게시</span>
          <span />
        </div>
        <div v-if="faqsLoading" class="empty">불러오는 중…</div>
        <div v-else-if="faqs.length === 0" class="empty">등록된 FAQ가 없습니다.</div>
        <div v-for="f in faqs" :key="f.id" class="table__row faq-cols">
          <span class="mono">{{ f.category }}</span>
          <span class="name">{{ f.question }}</span>
          <span class="order">{{ f.sort_order }}</span>
          <span><Badge :tone="f.is_published ? 'accent' : 'neutral'" size="xs">{{ f.is_published ? '게시중' : '비공개' }}</Badge></span>
          <div class="row-actions">
            <button class="row-action" aria-label="수정" @click="openFaqEdit(f)">
              <IconBase name="edit" :size="15" />
            </button>
            <button class="row-action row-action--danger" aria-label="삭제" @click="removeFaq(f)">
              <IconBase name="close" :size="15" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 1:1 문의 -->
    <section v-else>
      <div class="section-head">
        <div class="seg">
          <button
            v-for="f in CONTACT_FILTERS"
            :key="f.key"
            type="button"
            class="seg__opt"
            :class="{ 'seg__opt--sel': contactStatusFilter === f.key }"
            :disabled="contactsLoading"
            @click="contactStatusFilter = f.key; loadContacts()"
          >
            {{ f.label }}
          </button>
        </div>
      </div>

      <div class="table">
        <div class="table__head contact-cols">
          <span>이름</span>
          <span>제목</span>
          <span>이메일</span>
          <span>상태</span>
          <span>접수일</span>
        </div>
        <div v-if="contactsLoading" class="empty">불러오는 중…</div>
        <div v-else-if="contacts.length === 0" class="empty">문의가 없습니다.</div>
        <template v-for="c in contacts" :key="c.id">
          <button type="button" class="table__row contact-cols contact-row" @click="toggleContact(c)">
            <span class="name">{{ c.name }}</span>
            <span class="ellipsis">{{ c.title }}</span>
            <span class="mono">{{ c.email }}</span>
            <span><Badge :tone="contactStatusTone(c.status)" size="xs">{{ contactStatusLabel(c.status) }}</Badge></span>
            <span class="mono">{{ formatDate(c.created_at) }}</span>
          </button>
          <div v-if="expandedContactId === c.id" class="contact-detail">
            <div v-if="contactDetailLoading" class="empty">불러오는 중…</div>
            <template v-else-if="contactDetail">
              <p class="contact-detail__content">{{ contactDetail.content }}</p>

              <div class="field">
                <label class="field__label">
                  답변
                  <span v-if="contactDetail.answered_at" class="answered-at">
                    ({{ formatDate(contactDetail.answered_at) }} 답변)
                  </span>
                </label>
                <textarea
                  v-model="replyContent"
                  class="input textarea"
                  :maxlength="ANSWER_MAX_LENGTH"
                  placeholder="문의자에게 보낼 답변을 입력하세요. 등록 시 이메일로 답변 완료 안내가 발송됩니다."
                />
                <div class="char-count" :class="{ 'char-count--over': replyContent.length > ANSWER_MAX_LENGTH }">
                  {{ replyContent.length }} / {{ ANSWER_MAX_LENGTH }}
                </div>
              </div>

              <p v-if="contactNotice" class="contact-notice">{{ contactNotice }}</p>

              <div class="contact-detail__actions">
                <Button
                  v-if="contactDetail.status === 'ANSWERED'"
                  variant="secondary"
                  size="sm"
                  :disabled="contactStatusSaving"
                  @click="setContactStatus('PENDING')"
                >
                  대기중으로 되돌리기
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  :disabled="replySaving || !replyContent.trim() || replyContent.length > ANSWER_MAX_LENGTH"
                  @click="submitReply"
                >
                  {{ replyButtonLabel }}
                </Button>
              </div>
            </template>
          </div>
        </template>
      </div>
    </section>
  </AdminShell>
</template>

<style scoped>
.action-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #FFF0F0;
  border: 1px solid var(--rekit-danger);
  border-radius: 12px;
  font-size: 12.5px;
  color: var(--rekit-danger);
  margin-bottom: 12px;
}
.action-error__close { margin-left: auto; background: none; border: none; cursor: pointer; color: var(--rekit-danger); font-size: 12px; }

.tabs { display: flex; gap: 6px; margin-bottom: 16px; }
.tab {
  padding: 9px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  color: var(--rekit-ink-muted);
  cursor: pointer;
}
.tab--active { background: var(--rekit-ink); color: #fff; border-color: transparent; }

.section-head { display: flex; justify-content: flex-end; margin-bottom: 12px; }

.seg { display: flex; gap: 6px; }
.seg__opt {
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 600;
  background: var(--rekit-surface);
  color: var(--rekit-ink-muted);
  border: 1px solid var(--rekit-border);
  cursor: pointer;
}
.seg__opt--sel { background: var(--rekit-ink); color: #fff; border-color: transparent; }

.form-panel {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.form-panel__title { font-size: 14px; font-weight: 700; }
.form-panel__grid { display: grid; grid-template-columns: 1fr 120px; gap: 14px; }
.form-panel__actions { display: flex; gap: 8px; justify-content: flex-end; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field__label { font-size: 12px; font-weight: 600; color: var(--rekit-ink-muted); }
.req { color: var(--rekit-danger); }

.input {
  padding: 10px 12px;
  border: 1px solid var(--rekit-border);
  border-radius: 10px;
  font-size: 13.5px;
  outline: none;
  background: var(--rekit-surface);
  color: var(--rekit-ink);
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
}
.input:focus { border-color: var(--rekit-ink); box-shadow: 0 0 0 3px rgba(26,26,23,0.06); }
.textarea { min-height: 120px; resize: vertical; line-height: 1.55; }

.checks { display: flex; gap: 18px; flex-wrap: wrap; }
.check { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--rekit-ink-muted); cursor: pointer; }

.table {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  overflow: hidden;
}
.table__head, .table__row {
  display: grid;
  padding: 12px 16px;
  align-items: center;
  gap: 12px;
}
.notice-cols { grid-template-columns: 1fr 70px 90px 100px 80px; }
.faq-cols { grid-template-columns: 110px 1fr 70px 90px 80px; }
.contact-cols { grid-template-columns: 100px 1.4fr 1fr 90px 100px; }

.table__head {
  background: var(--rekit-surface-muted);
  color: var(--rekit-ink-muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.table__row {
  padding: 14px 16px;
  font-size: 13px;
  border-top: 1px solid var(--rekit-border);
}
.contact-row {
  width: 100%;
  background: none;
  border: 0;
  border-top: 1px solid var(--rekit-border);
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  color: inherit;
}
.contact-row:hover { background: var(--rekit-surface-muted); }

.name { font-weight: 600; }
.order { color: var(--rekit-ink-subtle); font-size: 12px; }
.mono { font-family: var(--rekit-font-mono); font-size: 12px; color: var(--rekit-ink-muted); }
.ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.row-actions { display: flex; gap: 4px; align-items: center; justify-content: flex-end; }
.row-action {
  background: none;
  border: 0;
  padding: 6px;
  border-radius: 8px;
  color: var(--rekit-ink-subtle);
  cursor: pointer;
  display: inline-flex;
}
.row-action:hover { background: var(--rekit-surface-muted); color: var(--rekit-ink); }
.row-action--danger:hover { background: #FFF0F0; color: var(--rekit-danger); }

.contact-detail {
  padding: 16px 20px;
  background: var(--rekit-surface-muted);
  border-top: 1px solid var(--rekit-border);
}
.contact-detail__content { font-size: 13.5px; line-height: 1.7; color: var(--rekit-ink); white-space: pre-line; margin: 0 0 14px; }
.contact-detail__actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
.answered-at { font-weight: 500; color: var(--rekit-ink-subtle); }
.char-count { text-align: right; font-size: 11px; color: var(--rekit-ink-subtle); margin-top: 4px; }
.char-count--over { color: var(--rekit-danger); }
.contact-notice {
  margin: 10px 0 0;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--rekit-accent, var(--rekit-ink));
}

.empty {
  padding: 40px 16px;
  text-align: center;
  color: var(--rekit-ink-subtle);
  font-size: 13px;
}

@media (max-width: 767px) {
  .form-panel__grid { grid-template-columns: 1fr; }
  .table { overflow-x: auto; }
  .table__head, .table__row { min-width: 640px; }
}
</style>
