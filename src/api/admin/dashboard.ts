import { apiRequest } from '@/api/client'
import type { OrderStatus } from '@/api/orders'
import type { SalesDataPoint } from './sales'

export interface DashboardSummary {
  today_orders: number
  today_revenue: number
  pending_count: number
  low_stock_count: number
}

export type { SalesDataPoint }

export interface SalesChart {
  period: string
  data: SalesDataPoint[]
}

export interface PendingOrderItem {
  order_number: string
  created_at: string
  username: string
  total_amount: number
  status: OrderStatus
}

export interface CategoryStat {
  category: string
  order_count: number
  revenue: number
}

export interface StockAlertItem {
  product_id: number
  title: string
  brand: string | null
  stock: number
  category: string
}

export function getDashboardSummary(): Promise<DashboardSummary> {
  return apiRequest<DashboardSummary>('/admin/dashboard/summary', { method: 'GET', auth: true })
}

export function getDashboardSalesChart(days?: number): Promise<SalesChart> {
  const qs = days ? `?days=${days}` : ''
  return apiRequest<SalesChart>(`/admin/dashboard/sales-chart${qs}`, { method: 'GET', auth: true })
}

export function getDashboardPendingOrders(): Promise<PendingOrderItem[]> {
  return apiRequest<PendingOrderItem[]>('/admin/dashboard/pending-orders', { method: 'GET', auth: true })
}

export function getDashboardPopularCategories(): Promise<CategoryStat[]> {
  return apiRequest<CategoryStat[]>('/admin/dashboard/popular-categories', { method: 'GET', auth: true })
}

export function getDashboardStockAlerts(): Promise<StockAlertItem[]> {
  return apiRequest<StockAlertItem[]>('/admin/dashboard/stock-alerts', { method: 'GET', auth: true })
}
