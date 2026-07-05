<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AdminShell from '@/components/admin/AdminShell.vue'
import Button from '@/components/ds/Button.vue'
import Badge from '@/components/ds/Badge.vue'
import IconBase from '@/components/ds/IconBase.vue'
import { won, formatDateTime, formatLineItemCalc } from '@/design/tokens'
import { statusLabel, statusTone } from '@/stores/orders-helpers'
import { getAdminOrder, updateAdminOrderStatus, inputShipment, cancelAdminOrder } from '@/api/admin/orders'
import type { AdminOrderDetail, ShipmentStatus } from '@/api/admin/orders'
import { ApiError } from '@/api/client'

const route = useRoute()
const orderNumber = computed(() => String(route.params.orderNumber))

const order = ref<AdminOrderDetail | null>(null)
const loading = ref(true)
const errorMessage = ref('')
const actionError = ref('')
const actionSaving = ref(false)

const carrier = ref('')
const trackingNumber = ref('')

const SHIPMENT_STATUS_LABEL: Record<ShipmentStatus, string> = {
  PREPARING: '준비중',
  IN_TRANSIT: '배송중',
  DELIVERED: '배송완료',
}

function shippingMethodLabel(method: string) {
  if (method === 'DIRECT') return '직접배송'
  if (method === 'FREIGHT') return '화물택배'
  return '택배'
}

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    order.value = await getAdminOrder(orderNumber.value)
  } catch (err) {
    errorMessage.value = err instanceof ApiError ? err.message : '주문을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

async function startPrepping() {
  actionSaving.value = true
  actionError.value = ''
  try {
    order.value = await updateAdminOrderStatus(orderNumber.value, 'PREPARING')
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : '오류가 발생했습니다.'
  } finally {
    actionSaving.value = false
  }
}

async function submitShipment() {
  if (!carrier.value.trim() || !trackingNumber.value.trim()) return
  actionSaving.value = true
  actionError.value = ''
  try {
    order.value = await inputShipment(orderNumber.value, carrier.value.trim(), trackingNumber.value.trim())
    carrier.value = ''
    trackingNumber.value = ''
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : '오류가 발생했습니다.'
  } finally {
    actionSaving.value = false
  }
}

async function cancel() {
  if (!confirm(`주문 ${orderNumber.value}을 취소하시겠습니까?`)) return
  actionSaving.value = true
  actionError.value = ''
  try {
    order.value = await cancelAdminOrder(orderNumber.value, '관리자 취소')
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : '오류가 발생했습니다.'
  } finally {
    actionSaving.value = false
  }
}

onMounted(load)
</script>

<template>
  <AdminShell active="orders" title="주문 상세" :subtitle="orderNumber">
    <RouterLink to="/admin/orders" class="back">
      <IconBase name="chevronLeft" :size="16" /> 주문 관리
    </RouterLink>

    <div v-if="loading" class="state">불러오는 중…</div>
    <div v-else-if="errorMessage" class="state state--error">{{ errorMessage }}</div>

    <template v-else-if="order">
      <div v-if="actionError" class="action-error">
        <IconBase name="info" :size="14" />
        {{ actionError }}
        <button type="button" class="action-error__close" @click="actionError = ''">✕</button>
      </div>

      <section class="block">
        <div class="block__head">
          <Badge :tone="statusTone(order.status)" size="md">{{ statusLabel(order.status) }}</Badge>
          <span class="block__date">{{ formatDateTime(order.created_at) }}</span>
        </div>

        <div class="actions">
          <Button v-if="order.status === 'PAID'" variant="primary" size="sm" :disabled="actionSaving" @click="startPrepping">
            준비 시작
          </Button>
          <template v-else-if="order.status === 'PREPARING'">
            <input v-model="carrier" class="input input--inline" placeholder="택배사" />
            <input v-model="trackingNumber" class="input input--inline" placeholder="송장번호" />
            <Button
              variant="primary"
              size="sm"
              :disabled="actionSaving || !carrier.trim() || !trackingNumber.trim()"
              @click="submitShipment"
            >
              송장입력
            </Button>
          </template>
          <Button
            v-else-if="!['CANCELLED', 'DELIVERED', 'REFUNDED'].includes(order.status)"
            variant="secondary"
            size="sm"
            :disabled="actionSaving"
            @click="cancel"
          >
            취소
          </Button>
        </div>
      </section>

      <section class="block">
        <h2 class="block__title">주문자</h2>
        <dl class="kv">
          <div class="kv__row"><dt>이름</dt><dd>{{ order.username }}</dd></div>
          <div class="kv__row"><dt>이메일</dt><dd>{{ order.email }}</dd></div>
        </dl>
      </section>

      <section class="block">
        <h2 class="block__title">배송지</h2>
        <div class="addr">
          <div class="addr__name">{{ order.recipient_name }}</div>
          <div class="addr__line">{{ order.recipient_phone }}</div>
          <div class="addr__line">({{ order.zipcode }}) {{ order.address1 }}{{ order.address2 ? ' ' + order.address2 : '' }}</div>
          <div v-if="order.memo" class="addr__memo">메모 · {{ order.memo }}</div>
          <div class="addr__method">{{ shippingMethodLabel(order.shipping_method) }}</div>
        </div>
      </section>

      <section class="block">
        <h2 class="block__title">주문 상품 <span class="block__count">{{ order.items.length }}건</span></h2>
        <ul class="items">
          <li v-for="(item, i) in order.items" :key="i" class="item">
            <div class="item__thumb">
              <img v-if="item.product_image_url_snapshot" :src="item.product_image_url_snapshot" :alt="item.product_title_snapshot" />
              <IconBase v-else name="box" :size="20" class="item__thumb-fallback" />
            </div>
            <div class="item__body">
              <div class="item__info">
                <div v-if="item.product_brand_snapshot || item.product_model_name_snapshot" class="item__meta">
                  <span v-if="item.product_brand_snapshot">{{ item.product_brand_snapshot }}</span>
                  <span v-if="item.product_brand_snapshot && item.product_model_name_snapshot" class="item__meta-sep">·</span>
                  <span v-if="item.product_model_name_snapshot">{{ item.product_model_name_snapshot }}</span>
                </div>
                <RouterLink :to="`/admin/products/${item.product_id}/edit`" class="item__title">
                  {{ item.product_title_snapshot }}
                </RouterLink>
              </div>
              <div class="item__pricing">
                <span class="item__calc">{{ formatLineItemCalc(item.price_snapshot, item.quantity) }}</span>
                <span class="item__subtotal">{{ won(item.price_snapshot * item.quantity) }}</span>
              </div>
            </div>
          </li>
        </ul>
      </section>

      <section class="block">
        <h2 class="block__title">결제</h2>
        <dl class="kv">
          <div class="kv__row"><dt>결제수단</dt><dd>{{ order.payment_method ?? '—' }}</dd></div>
          <div class="kv__row"><dt>결제일시</dt><dd>{{ order.paid_at ? formatDateTime(order.paid_at) : '결제 전' }}</dd></div>
          <div v-if="order.cancelled_at" class="kv__row"><dt>취소일시</dt><dd>{{ formatDateTime(order.cancelled_at) }}</dd></div>
          <div class="kv__row"><dt>상품 금액</dt><dd>{{ won(order.items.reduce((sum, i) => sum + i.price_snapshot * i.quantity, 0)) }}</dd></div>
          <div class="kv__row"><dt>배송비</dt><dd>+ {{ won(order.shipping_fee) }}</dd></div>
          <div v-if="order.discount_amount > 0" class="kv__row"><dt>할인</dt><dd>- {{ won(order.discount_amount) }}</dd></div>
          <div class="kv__row kv__row--total"><dt>최종 결제 금액</dt><dd>{{ won(order.total_amount) }}</dd></div>
        </dl>
      </section>

      <section v-if="order.shipment" class="block">
        <h2 class="block__title">배송</h2>
        <dl class="kv">
          <div class="kv__row"><dt>택배사</dt><dd>{{ order.shipment.carrier ?? '—' }}</dd></div>
          <div class="kv__row"><dt>송장번호</dt><dd>{{ order.shipment.tracking_number ?? '—' }}</dd></div>
          <div class="kv__row"><dt>배송상태</dt><dd>{{ SHIPMENT_STATUS_LABEL[order.shipment.status] }}</dd></div>
          <div v-if="order.shipment.shipped_at" class="kv__row"><dt>발송일시</dt><dd>{{ formatDateTime(order.shipment.shipped_at) }}</dd></div>
          <div v-if="order.shipment.delivered_at" class="kv__row"><dt>도착일시</dt><dd>{{ formatDateTime(order.shipment.delivered_at) }}</dd></div>
        </dl>
      </section>
    </template>
  </AdminShell>
</template>

<style scoped>
.back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--rekit-ink-muted);
  text-decoration: none;
  margin-bottom: 16px;
}
.back:hover { color: var(--rekit-ink); }

.state {
  padding: 40px 0;
  text-align: center;
  color: var(--rekit-ink-subtle);
  font-size: 13.5px;
}
.state--error { color: var(--rekit-danger); }

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

.block {
  background: var(--rekit-surface);
  border: 1px solid var(--rekit-border);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 12px;
}
.block__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.block__date {
  font-size: 11.5px;
  color: var(--rekit-ink-subtle);
  font-family: var(--rekit-font-mono);
}
.block__title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.block__count {
  margin-left: 4px;
  font-size: 11.5px;
  color: var(--rekit-ink-subtle);
  font-family: var(--rekit-font-mono);
  font-weight: 600;
}

.actions {
  margin-top: 14px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.input {
  padding: 9px 12px;
  border: 1px solid var(--rekit-border);
  border-radius: 10px;
  font-size: 13px;
  outline: none;
  background: var(--rekit-surface);
  color: var(--rekit-ink);
}
.input:focus { border-color: var(--rekit-ink); box-shadow: 0 0 0 3px rgba(26,26,23,0.06); }
.input--inline { width: 140px; }

.kv { margin: 0; }
.kv__row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
}
.kv__row dt { margin: 0; color: var(--rekit-ink-muted); }
.kv__row dd { margin: 0; font-weight: 600; }
.kv__row--total {
  padding-top: 12px;
  margin-top: 6px;
  border-top: 1px solid var(--rekit-border);
}
.kv__row--total dt { font-weight: 700; color: var(--rekit-ink); }
.kv__row--total dd { font-size: 16px; font-weight: 800; letter-spacing: -0.02em; }

.addr__name { font-size: 14px; font-weight: 700; }
.addr__line { margin-top: 4px; font-size: 13px; color: var(--rekit-ink-muted); line-height: 1.55; }
.addr__memo {
  margin-top: 8px;
  font-size: 11.5px;
  color: var(--rekit-ink-subtle);
  background: var(--rekit-surface-muted);
  padding: 8px 12px;
  border-radius: 8px;
}
.addr__method {
  margin-top: 10px;
  font-size: 12px;
  color: var(--rekit-ink-subtle);
}

.items {
  list-style: none;
  margin: 0;
  padding: 0;
}
.item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid var(--rekit-border);
}
.item:first-child { padding-top: 0; }
.item:last-child { padding-bottom: 0; border-bottom: none; }

.item__thumb {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--rekit-surface-muted);
  border: 1px solid var(--rekit-border);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.item__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.item__thumb-fallback { color: var(--rekit-ink-subtle); }

.item__body {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.item__info { min-width: 0; }
.item__meta {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--rekit-ink-subtle);
  margin-bottom: 3px;
}
.item__meta-sep { color: var(--rekit-border-strong); }
.item__title {
  display: block;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.015em;
  color: var(--rekit-ink);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item__title:hover { color: var(--rekit-accent-deep); text-decoration: underline; }

.item__pricing {
  flex-shrink: 0;
  text-align: right;
}
.item__calc {
  display: block;
  font-size: 11.5px;
  color: var(--rekit-ink-subtle);
  font-family: var(--rekit-font-mono);
  margin-bottom: 3px;
  white-space: nowrap;
}
.item__subtotal {
  display: block;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--rekit-ink);
}

@media (max-width: 480px) {
  .item__body { flex-direction: column; align-items: flex-start; gap: 6px; }
  .item__pricing { text-align: left; }
}
</style>
