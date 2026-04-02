'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';
import type {
  PaginatedResponse,
  Account,
  AccountCreate,
  FiscalPeriod,
  JournalEntry,
  JournalEntryCreate,
  TrialBalance,
  ProfitLoss,
  BalanceSheet,
} from '../types';

// ─── Accounts ────────────────────────────────────────────────────────────────

export function useAccounts(params: {
  account_type?: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  is_active?: boolean;
  root?: boolean;
  page?: number;
} = {}) {
  return useQuery<PaginatedResponse<Account>>({
    queryKey: ['accounts', params],
    queryFn: () => {
      const query = new URLSearchParams();
      if (params.account_type) query.append('account_type', params.account_type);
      if (params.is_active !== undefined) query.append('is_active', String(params.is_active));
      if (params.root !== undefined) query.append('root', String(params.root));
      if (params.page) query.append('page', String(params.page));
      return apiClient(`/accounts/?${query.toString()}`);
    },
  });
}

export function useAccount(id: number) {
  return useQuery<Account>({
    queryKey: ['accounts', id],
    queryFn: () => apiClient(`/accounts/${id}/`),
    enabled: !!id,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AccountCreate) =>
      apiClient('/accounts/', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<AccountCreate> & { id: number }) =>
      apiClient(`/accounts/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient(`/accounts/${id}/`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  });
}

// ─── Fiscal Periods ───────────────────────────────────────────────────────────

export function useFiscalPeriods() {
  return useQuery<PaginatedResponse<FiscalPeriod>>({
    queryKey: ['fiscal-periods'],
    queryFn: () => apiClient('/fiscal-periods/'),
  });
}

export function useCreateFiscalPeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; start_date: string; end_date: string }) =>
      apiClient('/fiscal-periods/', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fiscal-periods'] }),
  });
}

export function useCloseFiscalPeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiClient(`/fiscal-periods/${id}/close/`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fiscal-periods'] }),
  });
}

// ─── Journal Entries ──────────────────────────────────────────────────────────

export function useJournalEntries(params: {
  status?: 'DRAFT' | 'POSTED' | 'VOIDED';
  source?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
} = {}) {
  return useQuery<PaginatedResponse<JournalEntry>>({
    queryKey: ['journal-entries', params],
    queryFn: () => {
      const query = new URLSearchParams();
      if (params.status) query.append('status', params.status);
      if (params.source) query.append('source', params.source);
      if (params.date_from) query.append('date_from', params.date_from);
      if (params.date_to) query.append('date_to', params.date_to);
      if (params.page) query.append('page', String(params.page));
      return apiClient(`/journal-entries/?${query.toString()}`);
    },
  });
}

export function useJournalEntry(id: number) {
  return useQuery<JournalEntry>({
    queryKey: ['journal-entries', id],
    queryFn: () => apiClient(`/journal-entries/${id}/`),
    enabled: !!id,
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: JournalEntryCreate) =>
      apiClient('/journal-entries/', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journal-entries'] }),
  });
}

export function usePostJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiClient(`/journal-entries/${id}/post/`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journal-entries'] }),
  });
}

export function useVoidJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiClient(`/journal-entries/${id}/void/`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journal-entries'] }),
  });
}

// ─── Financial Reports ────────────────────────────────────────────────────────

export function useProfitLoss(params: { date_from: string; date_to: string; outlet?: number }) {
  return useQuery<ProfitLoss>({
    queryKey: ['finance', 'profit-loss', params],
    queryFn: () => {
      const query = new URLSearchParams({ date_from: params.date_from, date_to: params.date_to });
      if (params.outlet) query.append('outlet', String(params.outlet));
      return apiClient(`/finance/profit-loss/?${query.toString()}`);
    },
    enabled: !!params.date_from && !!params.date_to,
  });
}

export function useTrialBalance(params: { as_of_date: string; outlet?: number }) {
  return useQuery<TrialBalance>({
    queryKey: ['finance', 'trial-balance', params],
    queryFn: () => {
      const query = new URLSearchParams({ as_of_date: params.as_of_date });
      if (params.outlet) query.append('outlet', String(params.outlet));
      return apiClient(`/finance/trial-balance/?${query.toString()}`);
    },
    enabled: !!params.as_of_date,
  });
}

export function useBalanceSheet(params: { as_of_date: string; outlet?: number }) {
  return useQuery<BalanceSheet>({
    queryKey: ['finance', 'balance-sheet', params],
    queryFn: () => {
      const query = new URLSearchParams({ as_of_date: params.as_of_date });
      if (params.outlet) query.append('outlet', String(params.outlet));
      return apiClient(`/finance/balance-sheet/?${query.toString()}`);
    },
    enabled: !!params.as_of_date,
  });
}

export function useAccountLedger(id: number, params: { date_from?: string; date_to?: string } = {}) {
  return useQuery({
    queryKey: ['finance', 'ledger', id, params],
    queryFn: () => {
      const query = new URLSearchParams();
      if (params.date_from) query.append('date_from', params.date_from);
      if (params.date_to) query.append('date_to', params.date_to);
      return apiClient(`/finance/account-ledger/${id}/?${query.toString()}`);
    },
    enabled: !!id,
  });
}
