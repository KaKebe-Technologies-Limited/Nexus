'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api';
import type {
  DashboardData,
  SalesSummary,
  SalesByOutlet,
  SalesByProduct,
  SalesByPaymentMethod,
  HourlySales,
  StockLevel,
  StockAuditLog,
  ShiftSummaryReport,
} from '../types';

interface ReportDateParams {
  date_from?: string;
  date_to?: string;
  outlet?: number;
}

function buildReportQuery(params: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
  });
  return query.toString();
}

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['reports', 'dashboard'],
    queryFn: () => apiClient('/reports/dashboard/'),
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useSalesSummary(params: ReportDateParams = {}) {
  return useQuery<SalesSummary>({
    queryKey: ['reports', 'sales-summary', params],
    queryFn: () => apiClient(`/reports/sales-summary/?${buildReportQuery(params)}`),
  });
}

export function useSalesByOutlet(params: ReportDateParams = {}) {
  return useQuery<SalesByOutlet[]>({
    queryKey: ['reports', 'sales-by-outlet', params],
    queryFn: () => apiClient(`/reports/sales-by-outlet/?${buildReportQuery(params)}`),
  });
}

export function useSalesByProduct(params: ReportDateParams & { category?: number } = {}) {
  return useQuery<SalesByProduct[]>({
    queryKey: ['reports', 'sales-by-product', params],
    queryFn: () => apiClient(`/reports/sales-by-product/?${buildReportQuery(params)}`),
  });
}

export function useSalesByPaymentMethod(params: ReportDateParams = {}) {
  return useQuery<SalesByPaymentMethod[]>({
    queryKey: ['reports', 'sales-by-payment-method', params],
    queryFn: () => apiClient(`/reports/sales-by-payment-method/?${buildReportQuery(params)}`),
  });
}

export function useHourlySales(params: { date?: string; outlet?: number } = {}) {
  return useQuery<HourlySales[]>({
    queryKey: ['reports', 'hourly-sales', params],
    queryFn: () => apiClient(`/reports/hourly-sales/?${buildReportQuery(params)}`),
  });
}

export function useStockLevels(params: { outlet?: number; low_stock?: boolean } = {}) {
  return useQuery<StockLevel[]>({
    queryKey: ['reports', 'stock-levels', params],
    queryFn: () => apiClient(`/reports/stock-levels/?${buildReportQuery(params)}`),
  });
}

export function useStockMovement(params: ReportDateParams & { product?: number; movement_type?: string } = {}) {
  return useQuery<StockAuditLog[]>({
    queryKey: ['reports', 'stock-movement', params],
    queryFn: () => apiClient(`/reports/stock-movement/?${buildReportQuery(params)}`),
  });
}

export function useShiftSummary(params: ReportDateParams & { user_id?: number } = {}) {
  return useQuery<ShiftSummaryReport[]>({
    queryKey: ['reports', 'shift-summary', params],
    queryFn: () => apiClient(`/reports/shift-summary/?${buildReportQuery(params)}`),
  });
}
