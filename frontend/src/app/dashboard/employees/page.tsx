"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  useDepartments,
  useEmployees,
  useTerminateEmployee,
  useLeaveRequests,
  useCreateLeaveRequest,
  useApproveLeaveRequest,
  useRejectLeaveRequest,
  useCancelLeaveRequest,
  useLeaveBalances,
  useLeaveTypes,
  useAttendance,
  useMyTodayAttendance,
  useClockIn,
  useClockOut,
  usePayrollPeriods,
  useCreatePayrollPeriod,
  useProcessPayroll,
  useApprovePayroll,
} from "@/lib/hooks/useHR";
import type { LeaveRequestCreate } from "@/lib/types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtAmount(val: string | number | undefined) {
  if (!val) return "UGX 0";
  const n = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(n)) return "UGX 0";
  if (n >= 1_000_000_000) return `UGX ${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `UGX ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `UGX ${(n / 1_000).toFixed(0)}K`;
  return `UGX ${n.toLocaleString()}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

const statusBadge: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: "bg-emerald-50", text: "text-emerald-700" },
  ON_LEAVE: { bg: "bg-amber-50", text: "text-amber-700" },
  SUSPENDED: { bg: "bg-red-50", text: "text-red-600" },
  TERMINATED: { bg: "bg-gray-100", text: "text-gray-500" },
};

const leaveStatusBadge: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-700" },
  APPROVED: { bg: "bg-emerald-50", text: "text-emerald-700" },
  REJECTED: { bg: "bg-red-50", text: "text-red-600" },
  CANCELLED: { bg: "bg-gray-100", text: "text-gray-500" },
};

const payrollStatusBadge: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: "bg-gray-100", text: "text-gray-600" },
  PROCESSING: { bg: "bg-blue-50", text: "text-blue-700" },
  APPROVED: { bg: "bg-emerald-50", text: "text-emerald-700" },
  PAID: { bg: "bg-violet-50", text: "text-violet-700" },
};

// ── Leave Request Modal ───────────────────────────────────────────────────────

function LeaveRequestModal({ onClose }: { onClose: () => void }) {
  const { data: leaveTypesData } = useLeaveTypes();
  const leaveTypes = leaveTypesData?.results ?? [];
  const createLeave = useCreateLeaveRequest();

  const [form, setForm] = useState<LeaveRequestCreate>({
    leave_type: 0,
    start_date: today(),
    end_date: today(),
    days_requested: 1,
    reason: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createLeave.mutateAsync(form);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Submit Leave Request</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave Type</label>
            <select
              required
              value={form.leave_type}
              onChange={(e) => setForm((f) => ({ ...f, leave_type: Number(e.target.value) }))}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
            >
              <option value={0}>Select type</option>
              {leaveTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>{lt.name} ({lt.days_per_year} days/yr)</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Date</label>
              <input type="date" required value={form.start_date}
                onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">End Date</label>
              <input type="date" required value={form.end_date}
                onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Days Requested</label>
            <input type="number" min={1} required value={form.days_requested}
              onChange={(e) => setForm((f) => ({ ...f, days_requested: Number(e.target.value) }))}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</label>
            <textarea required value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              rows={3}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10 resize-none"
              placeholder="Reason for leave" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={createLeave.isPending} className="px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-zinc-800 disabled:opacity-50">
              {createLeave.isPending ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Reject Modal ─────────────────────────────────────────────────────────────

function RejectModal({ id, onClose }: { id: number; onClose: () => void }) {
  const rejectLeave = useRejectLeaveRequest();
  const [reason, setReason] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await rejectLeave.mutateAsync({ id, rejection_reason: reason });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Reject Leave Request</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</label>
            <textarea required value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10 resize-none"
              placeholder="Reason for rejection" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={rejectLeave.isPending} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
              {rejectLeave.isPending ? "Rejecting..." : "Reject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function EmployeesPage() {
  const [activeView, setActiveView] = useState<"directory" | "attendance" | "leave" | "payroll">("directory");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: employeesData, isLoading: empLoading } = useEmployees();
  const employees = employeesData?.results ?? [];

  const filteredEmployees = employees.filter((emp) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      emp.employee_number.toLowerCase().includes(q) ||
      emp.designation.toLowerCase().includes(q) ||
      (emp.department_name ?? "").toLowerCase().includes(q) ||
      (emp.outlet_name ?? "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || emp.employment_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalActive = employees.filter((e) => e.employment_status === "ACTIVE").length;
  const totalOnLeave = employees.filter((e) => e.employment_status === "ON_LEAVE").length;

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Employees</h1>
          <p className="text-sm text-gray-500 mt-1">Staff directory, attendance, leave management, and payroll</p>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {([
          { id: "directory", label: "Directory" },
          { id: "attendance", label: "Attendance" },
          { id: "leave", label: "Leave Management" },
          { id: "payroll", label: "Payroll" },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={cn(
              "px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all",
              activeView === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Employees</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{employees.length}</p>
          <p className="text-xs text-gray-400 mt-1">Registered</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Active</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{totalActive}</p>
          <p className="text-xs text-gray-400 mt-1">Currently active</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">On Leave</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{totalOnLeave}</p>
          <p className="text-xs text-gray-400 mt-1">Currently on leave</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Terminated</p>
          <p className="text-2xl font-extrabold text-red-500 mt-1">
            {employees.filter((e) => e.employment_status === "TERMINATED").length}
          </p>
          <p className="text-xs text-gray-400 mt-1">All time</p>
        </div>
      </div>

      {activeView === "directory" && (
        <DirectoryView
          employees={filteredEmployees}
          isLoading={empLoading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      )}
      {activeView === "attendance" && <AttendanceView />}
      {activeView === "leave" && <LeaveView />}
      {activeView === "payroll" && <PayrollView />}
    </div>
  );
}

// ── Directory Tab ─────────────────────────────────────────────────────────────

function DirectoryView({
  employees,
  isLoading,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}: {
  employees: ReturnType<typeof useEmployees>["data"] extends { results: infer R } ? R : never[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
}) {
  const { data: deptsData } = useDepartments();
  const depts = deptsData?.results ?? [];
  const terminateEmployee = useTerminateEmployee();

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900">Staff Directory</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {["all", "ACTIVE", "ON_LEAVE", "SUSPENDED", "TERMINATED"].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                    statusFilter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {f === "all" ? "All" : f.replace("_", " ")}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm outline-none placeholder-gray-400 w-40"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Employee #</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Designation</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Department</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Branch</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-400">Loading...</td></tr>
              )}
              {employees.map((emp) => {
                const sb = statusBadge[emp.employment_status] ?? { bg: "bg-gray-100", text: "text-gray-600" };
                return (
                  <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {emp.employee_number.slice(-2)}
                        </div>
                        <span className="font-semibold text-gray-900">{emp.employee_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{emp.designation}</td>
                    <td className="px-6 py-3 text-gray-600">{emp.department_name ?? "—"}</td>
                    <td className="px-6 py-3 text-gray-600">{emp.outlet_name ?? "—"}</td>
                    <td className="px-6 py-3 text-gray-600 capitalize">{emp.employment_type.replace("_", " ")}</td>
                    <td className="px-6 py-3">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", sb.bg, sb.text)}>
                        {emp.employment_status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      {emp.employment_status !== "TERMINATED" && (
                        <button
                          onClick={() => { if (confirm(`Terminate employee ${emp.employee_number}?`)) terminateEmployee.mutate({ id: emp.id }); }}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                        >
                          Terminate
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!isLoading && employees.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-400">No employees found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Departments */}
      {depts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Departments</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {depts.map((dept) => (
              <div key={dept.id} className="rounded-xl bg-gray-50 p-4 hover:bg-gray-100 transition-colors">
                <p className="text-sm font-bold text-gray-900">{dept.name}</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">{dept.employee_count}</p>
                <p className="text-xs text-gray-400 mt-1">{dept.outlet_name ?? "All branches"}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ── Attendance Tab ────────────────────────────────────────────────────────────

function AttendanceView() {
  const { data: myToday } = useMyTodayAttendance();
  const clockIn = useClockIn();
  const clockOut = useClockOut();
  const [dateFrom, setDateFrom] = useState(today());
  const [dateTo, setDateTo] = useState(today());
  const { data: attendanceData, isLoading } = useAttendance({ date_from: dateFrom, date_to: dateTo });
  const records = attendanceData?.results ?? [];

  const hasClockedIn = !!myToday?.clock_in;
  const hasClockedOut = !!myToday?.clock_out;

  return (
    <div className="space-y-6">
      {/* Clock In/Out Widget */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">My Attendance Today</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex gap-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Clock In</p>
              <p className="text-xl font-extrabold text-gray-900">{myToday?.clock_in ? new Date(myToday.clock_in).toLocaleTimeString() : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Clock Out</p>
              <p className="text-xl font-extrabold text-gray-900">{myToday?.clock_out ? new Date(myToday.clock_out).toLocaleTimeString() : "—"}</p>
            </div>
            {myToday?.hours_worked != null && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Hours</p>
                <p className="text-xl font-extrabold text-emerald-600">{Number(myToday.hours_worked).toFixed(1)}h</p>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            {!hasClockedIn && (
              <button
                onClick={() => clockIn.mutate()}
                disabled={clockIn.isPending}
                className="px-4 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-zinc-800 disabled:opacity-50"
              >
                {clockIn.isPending ? "Clocking in..." : "Clock In"}
              </button>
            )}
            {hasClockedIn && !hasClockedOut && (
              <button
                onClick={() => clockOut.mutate()}
                disabled={clockOut.isPending}
                className="px-4 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-50"
              >
                {clockOut.isPending ? "Clocking out..." : "Clock Out"}
              </button>
            )}
            {hasClockedIn && hasClockedOut && (
              <span className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold">Shift Complete</span>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900">Attendance Records</h2>
          <div className="flex items-center gap-3">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none" />
            <span className="text-gray-400 text-sm">→</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Employee</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Clock In</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Clock Out</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Hours</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Branch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading && <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">Loading...</td></tr>}
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3 font-medium text-gray-900">{r.employee_number}</td>
                  <td className="px-6 py-3 text-gray-600">{r.date}</td>
                  <td className="px-6 py-3 text-gray-600">{r.clock_in ? new Date(r.clock_in).toLocaleTimeString() : "—"}</td>
                  <td className="px-6 py-3 text-gray-600">{r.clock_out ? new Date(r.clock_out).toLocaleTimeString() : "—"}</td>
                  <td className="px-6 py-3 text-right font-semibold text-gray-900">
                    {r.hours_worked != null ? `${Number(r.hours_worked).toFixed(1)}h` : "—"}
                  </td>
                  <td className="px-6 py-3 text-gray-600">{r.outlet ?? "—"}</td>
                </tr>
              ))}
              {!isLoading && records.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">No attendance records for this period</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Leave Tab ─────────────────────────────────────────────────────────────────

function LeaveView() {
  const { data: requestsData, isLoading } = useLeaveRequests();
  const { data: balancesData } = useLeaveBalances();
  const approveLeave = useApproveLeaveRequest();
  const cancelLeave = useCancelLeaveRequest();
  const requests = requestsData?.results ?? [];
  const balances = balancesData?.results ?? [];
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  const filtered = statusFilter === "all" ? requests : requests.filter((r) => r.status === statusFilter);
  const pending = requests.filter((r) => r.status === "PENDING").length;
  const approved = requests.filter((r) => r.status === "APPROVED").length;

  return (
    <div className="space-y-6">
      {showLeaveModal && <LeaveRequestModal onClose={() => setShowLeaveModal(false)} />}
      {rejectingId !== null && <RejectModal id={rejectingId} onClose={() => setRejectingId(null)} />}

      {/* Leave Requests Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">Leave Requests</h2>
            <div className="flex gap-2">
              {pending > 0 && <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">{pending} Pending</span>}
              {approved > 0 && <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">{approved} Approved</span>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {["all", "PENDING", "APPROVED", "REJECTED", "CANCELLED"].map((f) => (
                <button key={f} onClick={() => setStatusFilter(f)}
                  className={cn("px-2.5 py-1 rounded-md text-xs font-semibold transition-all",
                    statusFilter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
                  {f === "all" ? "All" : f}
                </button>
              ))}
            </div>
            <button onClick={() => setShowLeaveModal(true)} className="px-3 py-2 rounded-lg bg-black text-white text-xs font-semibold hover:bg-zinc-800">
              + Request Leave
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Employee</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Start</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">End</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Days</th>
                <th className="text-center px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading && <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-400">Loading...</td></tr>}
              {filtered.map((req) => {
                const sb = leaveStatusBadge[req.status] ?? { bg: "bg-gray-100", text: "text-gray-600" };
                return (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {req.employee_number.slice(-2)}
                        </div>
                        <span className="font-semibold text-gray-900">{req.employee_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">{req.leave_type_name}</span>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{req.start_date}</td>
                    <td className="px-6 py-3 text-gray-600">{req.end_date}</td>
                    <td className="px-6 py-3 text-right font-bold text-gray-900">{req.days_requested}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", sb.bg, sb.text)}>{req.status}</span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {req.status === "PENDING" && (
                          <>
                            <button onClick={() => approveLeave.mutate(req.id)}
                              className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 px-2 py-1 rounded hover:bg-emerald-50">
                              Approve
                            </button>
                            <button onClick={() => setRejectingId(req.id)}
                              className="text-xs font-semibold text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50">
                              Reject
                            </button>
                            <button onClick={() => cancelLeave.mutate(req.id)}
                              className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100">
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-400">No leave requests</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Balances */}
      {balances.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Leave Balances</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {balances.slice(0, 6).map((b) => (
              <div key={b.id} className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm font-bold text-gray-900">{b.leave_type_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">Employee: {b.employee_number}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-gray-400">Entitled</p>
                    <p className="text-lg font-extrabold text-gray-900">{b.entitled_days}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Used</p>
                    <p className="text-lg font-extrabold text-amber-600">{b.used_days}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Remaining</p>
                    <p className="text-lg font-extrabold text-emerald-600">{b.remaining_days}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Payroll Tab ───────────────────────────────────────────────────────────────

function PayrollView() {
  const { data: periodsData, isLoading } = usePayrollPeriods();
  const createPeriod = useCreatePayrollPeriod();
  const processPayroll = useProcessPayroll();
  const approvePayroll = useApprovePayroll();
  const periods = periodsData?.results ?? [];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", start_date: "", end_date: "" });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createPeriod.mutateAsync(form);
    setShowForm(false);
    setForm({ name: "", start_date: "", end_date: "" });
  }

  const latestPaid = periods.find((p) => p.status === "PAID" || p.status === "APPROVED");

  return (
    <div className="space-y-6">
      {/* Payroll Summary Banner */}
      {latestPaid && (
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">{latestPaid.name}</h2>
              <p className="text-gray-400 text-sm mt-1">{latestPaid.start_date} → {latestPaid.end_date}</p>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Gross Pay</p>
                <p className="text-xl font-extrabold">{fmtAmount(latestPaid.total_gross)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Deductions</p>
                <p className="text-xl font-extrabold">{fmtAmount(latestPaid.total_deductions)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Net Pay</p>
                <p className="text-xl font-extrabold text-emerald-400">{fmtAmount(latestPaid.total_net)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">New Payroll Period</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</label>
              <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10" placeholder="e.g. March 2026" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Date</label>
              <input type="date" required value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">End Date</label>
              <input type="date" required value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10" />
            </div>
            <div className="sm:col-span-3 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={createPeriod.isPending} className="px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-zinc-800 disabled:opacity-50">
                {createPeriod.isPending ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Payroll Periods</h2>
          <button onClick={() => setShowForm(true)} className="text-sm font-semibold text-gray-500 hover:text-gray-900">+ New Period</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Period</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Dates</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Gross</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Deductions</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Net</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Slips</th>
                <th className="text-center px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading && <tr><td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-400">Loading...</td></tr>}
              {periods.map((p) => {
                const sb = payrollStatusBadge[p.status] ?? { bg: "bg-gray-100", text: "text-gray-600" };
                return (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3 font-semibold text-gray-900">{p.name}</td>
                    <td className="px-6 py-3 text-gray-500 whitespace-nowrap text-xs">{p.start_date} → {p.end_date}</td>
                    <td className="px-6 py-3 text-right text-gray-700">{fmtAmount(p.total_gross)}</td>
                    <td className="px-6 py-3 text-right text-gray-700">{fmtAmount(p.total_deductions)}</td>
                    <td className="px-6 py-3 text-right font-bold text-gray-900">{fmtAmount(p.total_net)}</td>
                    <td className="px-6 py-3 text-right text-gray-500">{p.pay_slips_count}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", sb.bg, sb.text)}>{p.status}</span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {p.status === "DRAFT" && (
                          <button onClick={() => processPayroll.mutate(p.id)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50">
                            Process
                          </button>
                        )}
                        {p.status === "PROCESSING" && (
                          <button onClick={() => approvePayroll.mutate(p.id)}
                            className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 px-2 py-1 rounded hover:bg-emerald-50">
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && periods.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-400">No payroll periods yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
