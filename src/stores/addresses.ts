import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

export interface Address {
  id: string
  /** Optional nickname like "집", "회사". */
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

function load(): Address[] {
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
        id: generateId(),
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

function generateId(): string {
  return `addr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export const useAddressStore = defineStore('addresses', () => {
  const addresses = ref<Address[]>(load())

  watch(
    addresses,
    (val) => {
      if (typeof localStorage === 'undefined') return
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    },
    { deep: true },
  )

  const count = computed(() => addresses.value.length)
  const defaultAddress = computed<Address | null>(
    () => addresses.value.find((a) => a.isDefault) ?? addresses.value[0] ?? null,
  )

  function add(input: Omit<Address, 'id' | 'isDefault'> & { isDefault?: boolean }) {
    const isFirst = addresses.value.length === 0
    const id = generateId()
    const next: Address = {
      ...input,
      id,
      isDefault: input.isDefault ?? isFirst,
    }
    if (next.isDefault) {
      addresses.value.forEach((a) => (a.isDefault = false))
    }
    addresses.value.push(next)
    return next
  }

  function update(id: string, patch: Partial<Omit<Address, 'id'>>) {
    const a = addresses.value.find((x) => x.id === id)
    if (!a) return
    if (patch.isDefault) {
      addresses.value.forEach((x) => (x.isDefault = x.id === id))
      Object.assign(a, patch, { isDefault: true })
    } else {
      Object.assign(a, patch)
    }
  }

  function remove(id: string) {
    const idx = addresses.value.findIndex((a) => a.id === id)
    if (idx < 0) return
    const wasDefault = addresses.value[idx]!.isDefault
    addresses.value.splice(idx, 1)
    if (wasDefault && addresses.value[0]) addresses.value[0].isDefault = true
  }

  function setDefault(id: string) {
    addresses.value.forEach((a) => (a.isDefault = a.id === id))
  }

  return { addresses, count, defaultAddress, add, update, remove, setDefault }
})
