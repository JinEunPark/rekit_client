import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  type AddressUpdate,
} from '@/api/addresses'
import type { AddressResponse } from '@/api/addresses'
import { toNumId } from './utils'

export interface Address {
  id: string
  label?: string
  recipient: string
  phone: string
  zipcode: string
  address: string
  addressDetail: string
  memo?: string
  isDefault: boolean
}

const STORAGE_KEY = 'rekit.addresses.v1'
const LEGACY_DEFAULT_KEY = 'rekit.address.default.v1'

function tempId(): string {
  return `addr_${Date.now().toString(36)}`
}

function fromServer(r: AddressResponse): Address {
  return {
    id: String(r.id),
    label: r.label ?? undefined,
    recipient: r.recipient,
    phone: r.phone,
    zipcode: r.zipcode,
    address: r.address1,
    addressDetail: r.address2 ?? '',
    memo: r.memo ?? undefined,
    isDefault: r.isDefault,
  }
}

function toServerPatch(patch: Partial<Omit<Address, 'id'>>): AddressUpdate {
  const body: AddressUpdate = {}
  if (patch.label !== undefined) body.label = patch.label
  if (patch.recipient !== undefined) body.recipient = patch.recipient
  if (patch.phone !== undefined) body.phone = patch.phone
  if (patch.zipcode !== undefined) body.zipcode = patch.zipcode
  if (patch.address !== undefined) body.address1 = patch.address
  if (patch.addressDetail !== undefined) body.address2 = patch.addressDetail || null
  if (patch.memo !== undefined) body.memo = patch.memo
  if (patch.isDefault !== undefined) body.is_default = patch.isDefault
  return body
}

function loadFromStorage(): Address[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed as Address[]
    }
    // Migrate from legacy single-default-address store
    const legacy = localStorage.getItem(LEGACY_DEFAULT_KEY)
    if (legacy) {
      const legacyAddr = JSON.parse(legacy)
      const migrated: Address = {
        id: tempId(),
        label: '기본 배송지',
        recipient: legacyAddr.recipient ?? '',
        phone: legacyAddr.phone ?? '',
        zipcode: legacyAddr.zipcode ?? '',
        address: legacyAddr.address ?? '',
        addressDetail: legacyAddr.addressDetail ?? '',
        memo: legacyAddr.memo,
        isDefault: true,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify([migrated]))
      localStorage.removeItem(LEGACY_DEFAULT_KEY)
      return [migrated]
    }
  } catch {
    // ignore
  }
  return []
}

export const useAddressStore = defineStore('addresses', () => {
  const auth = useAuthStore()

  const addresses = ref<Address[]>(loadFromStorage())
  const loading = ref(false)

  // localStorage sync — 비로그인 전용
  watch(
    addresses,
    (val) => {
      if (typeof localStorage === 'undefined') return
      if (auth.isAuthenticated) return
      if (val.length === 0) localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    },
    { deep: true },
  )

  const count = computed(() => addresses.value.length)
  const defaultAddress = computed<Address | null>(
    () => addresses.value.find((a) => a.isDefault) ?? addresses.value[0] ?? null,
  )

  // --- 서버 연동 ---

  async function loadFromServer() {
    loading.value = true
    try {
      const items = await listAddresses()
      addresses.value = items.map(fromServer)
      if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY)
    } catch {
      // 서버 오류 시 현재 상태 유지
    } finally {
      loading.value = false
    }
  }

  if (typeof window !== 'undefined' && auth.isAuthenticated) void loadFromServer()

  watch(
    () => auth.isAuthenticated,
    (loggedIn, wasLoggedIn) => {
      if (loggedIn && !wasLoggedIn) void loadFromServer()
      else if (!loggedIn && wasLoggedIn) addresses.value = []
    },
  )

  // --- mutations ---

  async function add(input: Omit<Address, 'id'>) {
    const isDefault = input.isDefault ?? addresses.value.length === 0
    if (isDefault) addresses.value.forEach((a) => (a.isDefault = false))

    const temp: Address = { ...input, id: tempId(), isDefault }
    addresses.value.push(temp)

    if (auth.isAuthenticated) {
      try {
        const res = await createAddress({
          label: input.label ?? null,
          recipient: input.recipient,
          phone: input.phone,
          zipcode: input.zipcode,
          address1: input.address,
          address2: input.addressDetail || null,
          memo: input.memo ?? null,
          is_default: isDefault,
        })
        // id 기반 교체 — 동시 호출 시 포지션이 달라져도 안전
        const idx = addresses.value.findIndex((a) => a.id === temp.id)
        if (idx !== -1) addresses.value.splice(idx, 1, fromServer(res))
      } catch (e) {
        const idx = addresses.value.findIndex((a) => a.id === temp.id)
        if (idx !== -1) addresses.value.splice(idx, 1)
        throw e instanceof Error ? e : new Error('배송지 추가에 실패했어요.')
      }
    }
  }

  async function update(id: string, patch: Partial<Omit<Address, 'id'>>) {
    const a = addresses.value.find((x) => x.id === id)
    if (!a) return
    const prev = { ...a }

    if (patch.isDefault) {
      addresses.value.forEach((x) => (x.isDefault = x.id === id))
      Object.assign(a, patch, { isDefault: true })
    } else {
      Object.assign(a, patch)
    }

    if (auth.isAuthenticated) {
      const numId = toNumId(id)
      if (numId !== null) {
        try {
          await updateAddress(numId, toServerPatch(patch))
        } catch (e) {
          Object.assign(a, prev)
          throw e instanceof Error ? e : new Error('배송지 수정에 실패했어요.')
        }
      }
    }
  }

  async function remove(id: string) {
    const idx = addresses.value.findIndex((a) => a.id === id)
    if (idx < 0) return
    const wasDefault = addresses.value[idx]!.isDefault
    addresses.value.splice(idx, 1)

    let promotedNumId: number | null = null
    if (wasDefault && addresses.value[0]) {
      addresses.value[0].isDefault = true
      promotedNumId = toNumId(addresses.value[0].id)
    }

    if (auth.isAuthenticated) {
      const numId = toNumId(id)
      if (numId !== null) {
        try {
          await deleteAddress(numId)
          // 서버는 기본 배송지를 자동 승격하지 않으므로 직접 설정
          if (promotedNumId !== null) {
            updateAddress(promotedNumId, { is_default: true }).catch(() => undefined)
          }
        } catch {
          void loadFromServer()
        }
      }
    }
  }

  async function setDefault(id: string) {
    addresses.value.forEach((a) => (a.isDefault = a.id === id))

    if (auth.isAuthenticated) {
      const numId = toNumId(id)
      if (numId !== null) {
        updateAddress(numId, { is_default: true }).catch(() => void loadFromServer())
      }
    }
  }

  return { addresses, count, defaultAddress, loading, add, update, remove, setDefault }
})
