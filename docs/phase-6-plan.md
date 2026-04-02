# Phase 6: Finance & HR Frontend Integration

**Goal**: Replace all mock data in `accounting/page.tsx` and `employees/page.tsx` with live API data, add full CRUD and action support, and build the TypeScript/hook layer for the Finance and HR modules.

**Prerequisites**: Phase 5 (Finance & HR backend) is complete. All API endpoints are live and security-audited.

---

## Allowed APIs

### Finance Endpoints
| Method | URL | Purpose |
|--------|-----|---------|
| GET/POST | `/api/accounts/` | List/create GL accounts |
| GET/PATCH/DELETE | `/api/accounts/{id}/` | Retrieve/update/delete account |
| GET/POST | `/api/fiscal-periods/` | List/create fiscal periods |
| GET/PATCH/DELETE | `/api/fiscal-periods/{id}/` | Retrieve/update/delete period |
| POST | `/api/fiscal-periods/{id}/close/` | Close a fiscal period |
| GET/POST | `/api/journal-entries/` | List/create journal entries |
| GET/PATCH/DELETE | `/api/journal-entries/{id}/` | Retrieve/update/delete entry |
| POST | `/api/journal-entries/{id}/post/` | Post a draft entry |
| POST | `/api/journal-entries/{id}/void/` | Void a posted entry |
| GET | `/api/finance/trial-balance/` | Trial balance (params: `as_of_date`, `outlet`) |
| GET | `/api/finance/profit-loss/` | P&L (params: `date_from`, `date_to`, `outlet`) |
| GET | `/api/finance/balance-sheet/` | Balance sheet (params: `as_of_date`, `outlet`) |
| GET | `/api/finance/account-ledger/{id}/` | Account ledger (params: `date_from`, `date_to`) |

### HR Endpoints
| Method | URL | Purpose |
|--------|-----|---------|
| GET/POST | `/api/departments/` | List/create departments |
| GET/PATCH/DELETE | `/api/departments/{id}/` | Retrieve/update/delete department |
| GET/POST | `/api/employees/` | List/create employees |
| GET/PATCH/DELETE | `/api/employees/{id}/` | Retrieve/update/delete employee |
| POST | `/api/employees/{id}/terminate/` | Terminate an employee |
| GET/POST | `/api/leave-types/` | List/create leave types |
| GET/PATCH/DELETE | `/api/leave-types/{id}/` | Retrieve/update/delete leave type |
| GET | `/api/leave-balances/` | List leave balances (params: `employee`, `year`) |
| GET/POST | `/api/leave-requests/` | List/create leave requests |
| GET/PATCH/DELETE | `/api/leave-requests/{id}/` | Retrieve/update/delete leave request |
| POST | `/api/leave-requests/{id}/approve/` | Approve a leave request |
| POST | `/api/leave-requests/{id}/reject/` | Reject a leave request |
| POST | `/api/leave-requests/{id}/cancel/` | Cancel a leave request |
| GET | `/api/attendance/` | List attendance records (params: `employee`, `date_from`, `date_to`) |
| POST | `/api/attendance/clock-in/` | Clock in |
| POST | `/api/attendance/clock-out/` | Clock out |
| GET | `/api/attendance/my-today/` | Today's attendance for current user |
| GET/POST | `/api/payroll-periods/` | List/create payroll periods |
| GET/PATCH/DELETE | `/api/payroll-periods/{id}/` | Retrieve/update/delete payroll period |
| POST | `/api/payroll-periods/{id}/process/` | Process payroll |
| POST | `/api/payroll-periods/{id}/approve/` | Approve payroll |
| GET | `/api/pay-slips/` | List pay slips (params: `employee`, `payroll_period`) |
| GET | `/api/pay-slips/{id}/` | Retrieve pay slip detail |

### Existing Patterns to Copy
- Hook pattern: `frontend/src/lib/hooks/useInventory.ts` (CRUD + custom actions)
- Report hook pattern: `frontend/src/lib/hooks/useReports.ts`
- Types pattern: `frontend/src/lib/types.ts` (existing interfaces)
- Page pattern: `frontend/src/app/dashboard/inventory/page.tsx` (tabbed layout, real data)
- API client: `frontend/src/lib/api.ts` (existing `apiClient` function)

---

## Phase 1: TypeScript Interfaces

**File**: `frontend/src/lib/types.ts` — append to existing interfaces

### Finance Interfaces to Add
```typescript
// Accounts
interface Account {
  id: number;
  code: string;
  name: string;
  account_type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  parent: number | null;
  parent_name: string | null;
  description: string;
  is_active: boolean;
  is_system: boolean;
  outlet: number | null;
  outlet_name: string | null;
  children_count: number;
  created_at: string;
  updated_at: string;
}

interface AccountCreate {
  code: string;
  name: string;
  account_type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  parent?: number;
  description?: string;
  is_active?: boolean;
  outlet?: number;
}

// Fiscal Periods
interface FiscalPeriod {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_closed: boolean;
  closed_by: number | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Journal Entries
interface JournalEntryLine {
  id: number;
  account: number;
  account_code: string;
  account_name: string;
  description: string;
  debit: string;
  credit: string;
  outlet: number | null;
}

interface JournalEntryLineCreate {
  account_id: number;
  description: string;
  debit: string;
  credit: string;
  outlet_id?: number;
}

interface JournalEntry {
  id: number;
  entry_number: string;
  date: string;
  fiscal_period: number | null;
  fiscal_period_name: string | null;
  description: string;
  source: 'MANUAL' | 'SALE' | 'VOID_SALE' | 'PURCHASE' | 'PAYROLL' | 'TRANSFER';
  reference_type: string | null;
  reference_id: number | null;
  status: 'DRAFT' | 'POSTED' | 'VOIDED';
  created_by: number | null;
  posted_by: number | null;
  posted_at: string | null;
  voided_by: number | null;
  voided_at: string | null;
  lines: JournalEntryLine[];
  created_at: string;
  updated_at: string;
}

interface JournalEntryCreate {
  date: string;
  description: string;
  lines: JournalEntryLineCreate[];
}

// Financial Reports
interface TrialBalanceRow {
  account_id: number;
  account_code: string;
  account_name: string;
  account_type: string;
  debit: string;
  credit: string;
}

interface TrialBalance {
  as_of_date: string;
  rows: TrialBalanceRow[];
  total_debit: string;
  total_credit: string;
}

interface ProfitLossSection {
  accounts: { account_id: number; account_code: string; account_name: string; amount: string }[];
  total: string;
}

interface ProfitLoss {
  date_from: string;
  date_to: string;
  revenue: ProfitLossSection;
  expenses: ProfitLossSection;
  net_income: string;
}

interface BalanceSheetSection {
  accounts: { account_id: number; account_code: string; account_name: string; amount: string }[];
  total: string;
}

interface BalanceSheet {
  as_of_date: string;
  assets: BalanceSheetSection;
  liabilities: BalanceSheetSection;
  equity: BalanceSheetSection;
  total_assets: string;
  total_liabilities_and_equity: string;
}
```

### HR Interfaces to Add
```typescript
interface Department {
  id: number;
  name: string;
  description: string;
  outlet: number | null;
  outlet_name: string | null;
  is_active: boolean;
  employee_count: number;
  created_at: string;
  updated_at: string;
}

interface Employee {
  id: number;
  user_id: number;
  employee_number: string;
  department: number | null;
  department_name: string | null;
  outlet: number | null;
  outlet_name: string | null;
  designation: string;
  employment_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
  employment_status: 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'TERMINATED';
  date_hired: string;
  date_terminated: string | null;
  basic_salary: string;
  bank_name: string;
  bank_account: string;
  mobile_money_number: string;
  nssf_number: string;
  tin_number: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface EmployeeCreate {
  user_id: number;
  department?: number;
  outlet?: number;
  designation: string;
  employment_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
  date_hired: string;
  basic_salary: string;
  bank_name?: string;
  bank_account?: string;
  mobile_money_number?: string;
  nssf_number?: string;
  tin_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
}

interface LeaveType {
  id: number;
  name: string;
  days_per_year: number;
  is_paid: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface LeaveBalance {
  id: number;
  employee: number;
  employee_number: string;
  leave_type: number;
  leave_type_name: string;
  year: number;
  entitled_days: number;
  used_days: number;
  carried_over: number;
  remaining_days: number;
}

interface LeaveRequest {
  id: number;
  employee: number;
  employee_number: string;
  leave_type: number;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approved_by: number | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

interface LeaveRequestCreate {
  leave_type: number;
  start_date: string;
  end_date: string;
  days_requested: number;
  reason: string;
}

interface Attendance {
  id: number;
  employee: number;
  employee_number: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  outlet: number | null;
  hours_worked: number | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface PaySlipLine {
  id: number;
  line_type: 'EARNING' | 'DEDUCTION';
  description: string;
  amount: string;
}

interface PaySlip {
  id: number;
  payroll_period: number;
  employee: number;
  employee_number: string;
  basic_salary: string;
  gross_pay: string;
  total_deductions: string;
  net_pay: string;
  lines: PaySlipLine[];
  created_at: string;
}

interface PayrollPeriod {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  status: 'DRAFT' | 'PROCESSING' | 'APPROVED' | 'PAID';
  processed_by: number | null;
  approved_by: number | null;
  journal_entry: number | null;
  total_gross: string;
  total_deductions: string;
  total_net: string;
  pay_slips_count: number;
  created_at: string;
  updated_at: string;
}
```

**Verification**: `grep -n "interface Account" frontend/src/lib/types.ts` should return results.

---

## Phase 2: Finance Hooks

**Files to create**: `frontend/src/lib/hooks/useFinance.ts`

Consolidate all finance hooks into one file (following `useInventory.ts` pattern which consolidates multiple concerns).

### Hooks to implement

```typescript
// Accounts
useAccounts(params?: { account_type?, is_active?, root? })
useAccount(id: number)
useCreateAccount()       // POST /api/accounts/
useUpdateAccount()       // PATCH /api/accounts/{id}/
useDeleteAccount()       // DELETE /api/accounts/{id}/

// Fiscal Periods
useFiscalPeriods()
useCreateFiscalPeriod()  // POST /api/fiscal-periods/
useCloseFiscalPeriod()   // POST /api/fiscal-periods/{id}/close/

// Journal Entries
useJournalEntries(params?: { status?, source?, date_from?, date_to? })
useJournalEntry(id: number)
useCreateJournalEntry()  // POST /api/journal-entries/
usePostJournalEntry()    // POST /api/journal-entries/{id}/post/
useVoidJournalEntry()    // POST /api/journal-entries/{id}/void/

// Financial Reports
useProfitLoss(params: { date_from: string; date_to: string; outlet?: number })
useTrialBalance(params: { as_of_date: string; outlet?: number })
useBalanceSheet(params: { as_of_date: string; outlet?: number })
useAccountLedger(id: number, params: { date_from?: string; date_to?: string })
```

**Pattern to follow**: Copy mutation pattern from `frontend/src/lib/hooks/useInventory.ts` (invalidate relevant query keys on success).

**Query key conventions**:
- `['accounts', params]`
- `['fiscal-periods']`
- `['journal-entries', params]`
- `['finance', 'profit-loss', params]`
- `['finance', 'trial-balance', params]`
- `['finance', 'balance-sheet', params]`
- `['finance', 'ledger', id, params]`

**Verification**: `grep -n "useAccounts\|useJournalEntries\|useProfitLoss" frontend/src/lib/hooks/useFinance.ts`

---

## Phase 3: HR Hooks

**Files to create**: `frontend/src/lib/hooks/useHR.ts`

### Hooks to implement

```typescript
// Departments
useDepartments(params?: { is_active?, outlet? })
useCreateDepartment()
useUpdateDepartment()

// Employees
useEmployees(params?: { outlet?, department?, status? })
useEmployee(id: number)
useCreateEmployee()
useUpdateEmployee()
useTerminateEmployee()   // POST /api/employees/{id}/terminate/

// Leave Types
useLeaveTypes()
useCreateLeaveType()
useUpdateLeaveType()

// Leave Balances
useLeaveBalances(params?: { employee?, year? })

// Leave Requests
useLeaveRequests(params?: { employee?, status? })
useCreateLeaveRequest()
useApproveLeaveRequest() // POST /api/leave-requests/{id}/approve/
useRejectLeaveRequest()  // POST /api/leave-requests/{id}/reject/ (body: { rejection_reason })
useCancelLeaveRequest()  // POST /api/leave-requests/{id}/cancel/

// Attendance
useAttendance(params?: { employee?, date_from?, date_to? })
useMyTodayAttendance()   // GET /api/attendance/my-today/
useClockIn()             // POST /api/attendance/clock-in/
useClockOut()            // POST /api/attendance/clock-out/

// Payroll
usePayrollPeriods()
usePayrollPeriod(id: number)  // detail with pay_slips[]
useCreatePayrollPeriod()
useProcessPayroll()       // POST /api/payroll-periods/{id}/process/
useApprovePayroll()       // POST /api/payroll-periods/{id}/approve/

// Pay Slips
usePaySlips(params?: { employee?, payroll_period? })
usePaySlip(id: number)
```

**Query key conventions**:
- `['departments', params]`
- `['employees', params]`
- `['leave-types']`
- `['leave-balances', params]`
- `['leave-requests', params]`
- `['attendance', params]`
- `['payroll-periods']`
- `['payroll-period', id]`
- `['pay-slips', params]`

**Verification**: `grep -n "useEmployees\|useLeaveRequests\|useAttendance\|usePayrollPeriods" frontend/src/lib/hooks/useHR.ts`

---

## Phase 4: Rebuild accounting/page.tsx

**File**: `frontend/src/app/dashboard/accounting/page.tsx`

Keep the existing tab structure (Overview, Chart of Accounts, Journal Entries + add Fiscal Periods, Reports tabs). Replace all mock data with hook calls.

### Tab 1: Overview
- KPI cards: call `useProfitLoss({ date_from, date_to })` for current month
  - Total Revenue → `profitLoss.revenue.total`
  - Total Expenses → `profitLoss.expenses.total`
  - Net Profit → `profitLoss.net_income`
- Recent journal entries: call `useJournalEntries({ status: 'POSTED' })` limited to 10

### Tab 2: Chart of Accounts
- Table: call `useAccounts()` — show code, name, type, active status, children count
- Filter bar: filter by `account_type` (ASSET/LIABILITY/EQUITY/REVENUE/EXPENSE) and `is_active`
- "New Account" button → modal form → `useCreateAccount()`
- Edit button → modal form → `useUpdateAccount()`
- Delete button → confirm → `useDeleteAccount()` (only if `children_count === 0`)

### Tab 3: Journal Entries
- Table: call `useJournalEntries()` — show entry_number, date, description, source, status
- Filter by status (DRAFT/POSTED/VOIDED) and date range
- "New Entry" button → modal with line items → `useCreateJournalEntry()`
- "Post" action on DRAFT entries → `usePostJournalEntry()`
- "Void" action on POSTED entries → `useVoidJournalEntry()`
- Click row → expand to show lines (debits/credits)

### Tab 4: Fiscal Periods
- Table: call `useFiscalPeriods()` — show name, start/end date, is_closed
- "New Period" button → `useCreateFiscalPeriod()`
- "Close Period" button (if not closed) → confirm → `useCloseFiscalPeriod()`

### Tab 5: Financial Reports
- Sub-tabs: P&L, Trial Balance, Balance Sheet
- Date range picker (shared)
- P&L: call `useProfitLoss(params)` → show revenue section, expense section, net income
- Trial Balance: call `useTrialBalance(params)` → show account rows with debit/credit columns
- Balance Sheet: call `useBalanceSheet(params)` → show assets, liabilities, equity sections

**Anti-patterns**: Do NOT keep any hardcoded mock arrays. Remove all `mockJournalEntries`, `mockAccounts`, etc.

**Verification**:
```bash
grep -n "mock\|hardcoded\|const.*=.*\[.*{" frontend/src/app/dashboard/accounting/page.tsx
# Should return 0 results
grep -n "useAccounts\|useJournalEntries\|useProfitLoss" frontend/src/app/dashboard/accounting/page.tsx
# Should return results
```

---

## Phase 5: Rebuild employees/page.tsx

**File**: `frontend/src/app/dashboard/employees/page.tsx`

Keep the existing tab structure (Directory, Attendance, Leave Management + add Payroll tab). Replace all mock data with hook calls.

### Tab 1: Staff Directory
- KPI cards: derive from `useEmployees()` results
  - Total Employees → `employees.length`
  - Active → `employees.filter(e => e.employment_status === 'ACTIVE').length`
  - On Leave → `employees.filter(e => e.employment_status === 'ON_LEAVE').length`
- Employee table: call `useEmployees()` — show employee_number, designation, department_name, outlet_name, employment_type, employment_status
- Filter: by `department`, `status`, `outlet`
- Search: by employee_number or designation (client-side filter or backend `search` param if available)
- "Add Employee" button → modal form → `useCreateEmployee()`
- Edit button → modal → `useUpdateEmployee()`
- "Terminate" button → confirm → `useTerminateEmployee()`
- Departments card: call `useDepartments()` — show name, employee_count

### Tab 2: Attendance
- Clock in/out widget: call `useMyTodayAttendance()` → show clock_in, clock_out, hours_worked
  - "Clock In" button → `useClockIn()`
  - "Clock Out" button → `useClockOut()`
- Attendance table: call `useAttendance({ date_from, date_to })` — filter by date range
- Show: employee_number, date, clock_in, clock_out, hours_worked, outlet

### Tab 3: Leave Management
- Leave requests table: call `useLeaveRequests()` — show employee_number, leave_type_name, start/end date, days_requested, status
- Filter by status (PENDING/APPROVED/REJECTED/CANCELLED)
- "Submit Leave Request" button → modal form → `useCreateLeaveRequest()`
- For admins/managers:
  - "Approve" button on PENDING → `useApproveLeaveRequest()`
  - "Reject" button on PENDING → modal with rejection_reason → `useRejectLeaveRequest()`
- "Cancel" button on own PENDING requests → `useCancelLeaveRequest()`
- Leave balances card: call `useLeaveBalances()` → show leave_type_name, entitled_days, used_days, remaining_days

### Tab 4: Payroll
- Payroll periods table: call `usePayrollPeriods()` — show name, start/end date, status, total_gross, total_net, pay_slips_count
- "New Payroll Period" button → `useCreatePayrollPeriod()` (admin/manager)
- "Process" button on DRAFT → `useProcessPayroll()`
- "Approve" button on PROCESSING → `useApprovePayroll()`
- Click row → expand or modal showing individual pay slips from `usePayrollPeriod(id)` detail

**Anti-patterns**: Remove all mock employee arrays, mock leave requests, hardcoded shift summaries.

**Verification**:
```bash
grep -n "mock\|hardcoded" frontend/src/app/dashboard/employees/page.tsx
# Should return 0 results
grep -n "useEmployees\|useLeaveRequests\|useAttendance\|usePayrollPeriods" frontend/src/app/dashboard/employees/page.tsx
# Should return results
```

---

## Phase 6: Final Verification

1. **Type check**: `cd frontend && npx tsc --noEmit` — zero errors
2. **Grep for mock data**: `grep -rn "mock\|hardcoded\|TODO" frontend/src/app/dashboard/accounting/ frontend/src/app/dashboard/employees/` — should be clean
3. **Grep for hook usage**: confirm each new hook file exports are imported in the pages
4. **API connectivity test**: start docker, navigate to /dashboard/accounting and /dashboard/employees — tables should load real data (not mock)
5. **CRUD test**: create an account, create a journal entry, post it — verify it persists
6. **HR test**: submit a leave request, approve it — verify status changes
7. **Payroll test**: create a payroll period, process it, verify pay slips appear

---

## File Change Summary

| File | Action |
|------|--------|
| `frontend/src/lib/types.ts` | Append ~100 lines of Finance & HR interfaces |
| `frontend/src/lib/hooks/useFinance.ts` | Create — 15 hooks for accounts, fiscal periods, journal entries, financial reports |
| `frontend/src/lib/hooks/useHR.ts` | Create — 20 hooks for departments, employees, leave, attendance, payroll |
| `frontend/src/app/dashboard/accounting/page.tsx` | Full rewrite — 5 tabs with real data |
| `frontend/src/app/dashboard/employees/page.tsx` | Full rewrite — 4 tabs with real data |

**Estimated scope**: ~800–1,000 lines of new/changed frontend code.
