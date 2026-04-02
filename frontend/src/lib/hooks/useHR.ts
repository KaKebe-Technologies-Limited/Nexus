'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';
import type {
  PaginatedResponse,
  Department,
  Employee,
  EmployeeCreate,
  LeaveType,
  LeaveBalance,
  LeaveRequest,
  LeaveRequestCreate,
  Attendance,
  PayrollPeriod,
  PaySlip,
} from '../types';

// ─── Departments ──────────────────────────────────────────────────────────────

export function useDepartments(params: { is_active?: boolean; outlet?: number } = {}) {
  return useQuery<PaginatedResponse<Department>>({
    queryKey: ['departments', params],
    queryFn: () => {
      const query = new URLSearchParams();
      if (params.is_active !== undefined) query.append('is_active', String(params.is_active));
      if (params.outlet) query.append('outlet', String(params.outlet));
      return apiClient(`/departments/?${query.toString()}`);
    },
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; outlet?: number; is_active?: boolean }) =>
      apiClient('/departments/', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; name?: string; description?: string; is_active?: boolean }) =>
      apiClient(`/departments/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  });
}

// ─── Employees ────────────────────────────────────────────────────────────────

export function useEmployees(params: {
  outlet?: number;
  department?: number;
  status?: string;
  page?: number;
} = {}) {
  return useQuery<PaginatedResponse<Employee>>({
    queryKey: ['employees', params],
    queryFn: () => {
      const query = new URLSearchParams();
      if (params.outlet) query.append('outlet', String(params.outlet));
      if (params.department) query.append('department', String(params.department));
      if (params.status) query.append('status', params.status);
      if (params.page) query.append('page', String(params.page));
      return apiClient(`/employees/?${query.toString()}`);
    },
  });
}

export function useEmployee(id: number) {
  return useQuery<Employee>({
    queryKey: ['employees', id],
    queryFn: () => apiClient(`/employees/${id}/`),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: EmployeeCreate) =>
      apiClient('/employees/', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<EmployeeCreate> & { id: number }) =>
      apiClient(`/employees/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });
}

export function useTerminateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date_terminated }: { id: number; date_terminated?: string }) =>
      apiClient(`/employees/${id}/terminate/`, { method: 'POST', body: JSON.stringify({ date_terminated }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });
}

// ─── Leave Types ──────────────────────────────────────────────────────────────

export function useLeaveTypes() {
  return useQuery<PaginatedResponse<LeaveType>>({
    queryKey: ['leave-types'],
    queryFn: () => apiClient('/leave-types/'),
  });
}

export function useCreateLeaveType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; days_per_year: number; is_paid: boolean; is_active?: boolean }) =>
      apiClient('/leave-types/', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leave-types'] }),
  });
}

export function useUpdateLeaveType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; name?: string; days_per_year?: number; is_paid?: boolean; is_active?: boolean }) =>
      apiClient(`/leave-types/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leave-types'] }),
  });
}

// ─── Leave Balances ───────────────────────────────────────────────────────────

export function useLeaveBalances(params: { employee?: number; year?: number } = {}) {
  return useQuery<PaginatedResponse<LeaveBalance>>({
    queryKey: ['leave-balances', params],
    queryFn: () => {
      const query = new URLSearchParams();
      if (params.employee) query.append('employee', String(params.employee));
      if (params.year) query.append('year', String(params.year));
      return apiClient(`/leave-balances/?${query.toString()}`);
    },
  });
}

// ─── Leave Requests ───────────────────────────────────────────────────────────

export function useLeaveRequests(params: { employee?: number; status?: string; page?: number } = {}) {
  return useQuery<PaginatedResponse<LeaveRequest>>({
    queryKey: ['leave-requests', params],
    queryFn: () => {
      const query = new URLSearchParams();
      if (params.employee) query.append('employee', String(params.employee));
      if (params.status) query.append('status', params.status);
      if (params.page) query.append('page', String(params.page));
      return apiClient(`/leave-requests/?${query.toString()}`);
    },
  });
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LeaveRequestCreate) =>
      apiClient('/leave-requests/', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leave-requests'] }),
  });
}

export function useApproveLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiClient(`/leave-requests/${id}/approve/`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
    },
  });
}

export function useRejectLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rejection_reason }: { id: number; rejection_reason: string }) =>
      apiClient(`/leave-requests/${id}/reject/`, { method: 'POST', body: JSON.stringify({ rejection_reason }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leave-requests'] }),
  });
}

export function useCancelLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiClient(`/leave-requests/${id}/cancel/`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
    },
  });
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export function useAttendance(params: { employee?: number; date_from?: string; date_to?: string; page?: number } = {}) {
  return useQuery<PaginatedResponse<Attendance>>({
    queryKey: ['attendance', params],
    queryFn: () => {
      const query = new URLSearchParams();
      if (params.employee) query.append('employee', String(params.employee));
      if (params.date_from) query.append('date_from', params.date_from);
      if (params.date_to) query.append('date_to', params.date_to);
      if (params.page) query.append('page', String(params.page));
      return apiClient(`/attendance/?${query.toString()}`);
    },
  });
}

export function useMyTodayAttendance() {
  return useQuery<Attendance | null>({
    queryKey: ['attendance', 'my-today'],
    queryFn: () => apiClient('/attendance/my-today/'),
    retry: false,
  });
}

export function useClockIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data?: { notes?: string }) =>
      apiClient('/attendance/clock-in/', { method: 'POST', body: JSON.stringify(data ?? {}) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
}

export function useClockOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data?: { notes?: string }) =>
      apiClient('/attendance/clock-out/', { method: 'POST', body: JSON.stringify(data ?? {}) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
}

// ─── Payroll Periods ──────────────────────────────────────────────────────────

export function usePayrollPeriods() {
  return useQuery<PaginatedResponse<PayrollPeriod>>({
    queryKey: ['payroll-periods'],
    queryFn: () => apiClient('/payroll-periods/'),
  });
}

export function usePayrollPeriod(id: number) {
  return useQuery<PayrollPeriod>({
    queryKey: ['payroll-period', id],
    queryFn: () => apiClient(`/payroll-periods/${id}/`),
    enabled: !!id,
  });
}

export function useCreatePayrollPeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; start_date: string; end_date: string }) =>
      apiClient('/payroll-periods/', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payroll-periods'] }),
  });
}

export function useProcessPayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiClient(`/payroll-periods/${id}/process/`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-periods'] });
      queryClient.invalidateQueries({ queryKey: ['pay-slips'] });
    },
  });
}

export function useApprovePayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiClient(`/payroll-periods/${id}/approve/`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payroll-periods'] }),
  });
}

// ─── Pay Slips ────────────────────────────────────────────────────────────────

export function usePaySlips(params: { employee?: number; payroll_period?: number } = {}) {
  return useQuery<PaginatedResponse<PaySlip>>({
    queryKey: ['pay-slips', params],
    queryFn: () => {
      const query = new URLSearchParams();
      if (params.employee) query.append('employee', String(params.employee));
      if (params.payroll_period) query.append('payroll_period', String(params.payroll_period));
      return apiClient(`/pay-slips/?${query.toString()}`);
    },
  });
}

export function usePaySlip(id: number) {
  return useQuery<PaySlip>({
    queryKey: ['pay-slips', id],
    queryFn: () => apiClient(`/pay-slips/${id}/`),
    enabled: !!id,
  });
}
