import { apiRequest } from './client'

export interface AddressResponse {
  id: number
  recipient: string
  phone: string
  zipcode: string
  address1: string
  address2: string | null
  label: string | null
  memo: string | null
  isDefault: boolean
}

export interface AddressCreate {
  recipient: string
  phone: string
  zipcode: string
  address1: string
  address2?: string | null
  label?: string | null
  memo?: string | null
  is_default?: boolean
}

export interface AddressUpdate {
  recipient?: string | null
  phone?: string | null
  zipcode?: string | null
  address1?: string | null
  address2?: string | null
  label?: string | null
  memo?: string | null
  is_default?: boolean | null
}

export function listAddresses(): Promise<AddressResponse[]> {
  return apiRequest<AddressResponse[]>('/addresses', { method: 'GET', auth: true })
}

export function createAddress(body: AddressCreate): Promise<AddressResponse> {
  return apiRequest<AddressResponse>('/addresses', { method: 'POST', body, auth: true })
}

export function updateAddress(id: number, body: AddressUpdate): Promise<AddressResponse> {
  return apiRequest<AddressResponse>(`/addresses/${id}`, { method: 'PATCH', body, auth: true })
}

export function deleteAddress(id: number): Promise<void> {
  return apiRequest<void>(`/addresses/${id}`, { method: 'DELETE', auth: true })
}
