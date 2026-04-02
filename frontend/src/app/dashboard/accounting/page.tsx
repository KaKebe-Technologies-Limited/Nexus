"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  useAccounts,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
  useFiscalPeriods,
  useCreateFiscalPeriod,
  useCloseFiscalPeriod,
  useJournalEntries,
  useCreateJournalEntry,
  usePostJournalEntry,
  useVoidJournalEntry,
  useProfitLoss,
  useTrialBalance,
  useBalanceSheet,
} from "@/lib/hooks/useFinance";
import type { Account, AccountCreate, JournalEntryCreate } from "@/lib/types";

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

function firstOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

const typeColor: Record<string, { bg: string; text: string }> = {
  ASSET: { bg: "bg-blue-50", text: "text-blue-700" },
  LIABILITY: { bg: "bg-red-50", text: "text-red-700" },
  EQUITY: { bg: "bg-violet-50", text: "text-violet-700" },
  REVENUE: { bg: "bg-emerald-50", text: "text-emerald-700" },
  EXPENSE: { bg: "bg-amber-50", text: "text-amber-700" },
};

const statusColor: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: "bg-gray-100", text: "text-gray-600" },
  POSTED: { bg: "bg-emerald-50", text: "text-emerald-700" },
  VOIDED: { bg: "bg-red-50", text: "text-red-600" },
};

// ── Account Modal ─────────────────────────────────────────────────────────────

function AccountModal({
  account,
  onClose,
}: {
  account?: Account;
  onClose: () => void;
}) {
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const [form, setForm] = useState<AccountCreate>({
    code: account?.code ?? "",
    name: account?.name ?? "",
    account_type: account?.account_type ?? "ASSET",
    description: account?.description ?? "",
    is_active: account?.is_active ?? true,
  });

  const isEditing = !!account;
  const pending = createAccount.isPending || updateAccount.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEditing) {
      await updateAccount.mutateAsync({ id: account.id, ...form });
    } else {
      await createAccount.mutateAsync(form);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{isEditing ? "Edit Account" : "New Account"}</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</label>
              <input
                required
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                placeholder="1000"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</label>
              <select
                value={form.account_type}
                onChange={(e) => setForm((f) => ({ ...f, account_type: e.target.value as AccountCreate["account_type"] }))}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
              >
                {["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
              placeholder="Account name"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
            <input
              value={form.description ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
              placeholder="Optional"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_active ?? true}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              className="rounded"
            />
            <label className="text-sm text-gray-700">Active</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={pending} className="px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-zinc-800 disabled:opacity-50">
              {pending ? "Saving..." : isEditing ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Journal Entry Modal ───────────────────────────────────────────────────────

function JournalEntryModal({ onClose }: { onClose: () => void }) {
  const createEntry = useCreateJournalEntry();
  const { data: accountsData } = useAccounts({ is_active: true });
  const accounts = accountsData?.results ?? [];

  const [form, setForm] = useState<JournalEntryCreate>({
    date: today(),
    description: "",
    lines: [
      { account_id: 0, description: "", debit: "0", credit: "0" },
      { account_id: 0, description: "", debit: "0", credit: "0" },
    ],
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createEntry.mutateAsync(form);
    onClose();
  }

  function updateLine(i: number, field: string, value: string | number) {
    setForm((f) => ({
      ...f,
      lines: f.lines.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)),
    }));
  }

  function addLine() {
    setForm((f) => ({ ...f, lines: [...f.lines, { account_id: 0, description: "", debit: "0", credit: "0" }] }));
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">New Journal Entry</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
              <input
                required
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                placeholder="Entry description"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Lines</label>
            <div className="space-y-2">
              {form.lines.map((line, i) => (
                <div key={i} className="grid grid-cols-4 gap-2">
                  <select
                    required
                    value={line.account_id}
                    onChange={(e) => updateLine(i, "account_id", Number(e.target.value))}
                    className="col-span-2 border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  >
                    <option value={0}>Select account</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                    ))}
                  </select>
                  <input
                    placeholder="Debit"
                    value={line.debit}
                    onChange={(e) => updateLine(i, "debit", e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  />
                  <input
                    placeholder="Credit"
                    value={line.credit}
                    onChange={(e) => updateLine(i, "credit", e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
              ))}
            </div>
            <button type="button" onClick={addLine} className="mt-2 text-xs font-semibold text-gray-500 hover:text-gray-900">
              + Add line
            </button>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={createEntry.isPending} className="px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-zinc-800 disabled:opacity-50">
              {createEntry.isPending ? "Saving..." : "Create Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AccountingPage() {
  const [activeView, setActiveView] = useState<"overview" | "ledger" | "journal" | "periods" | "reports">("overview");
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();

  return (
    <div className="space-y-6 max-w-[1400px]">
      {showAccountModal && (
        <AccountModal
          account={editingAccount}
          onClose={() => { setShowAccountModal(false); setEditingAccount(undefined); }}
        />
      )}
      {showEntryModal && (
        <JournalEntryModal onClose={() => setShowEntryModal(false)} />
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Accounting</h1>
          <p className="text-sm text-gray-500 mt-1">General ledger, journal entries, fiscal periods, and financial reports</p>
        </div>
        <div className="flex gap-2">
          {activeView === "ledger" && (
            <button
              onClick={() => { setEditingAccount(undefined); setShowAccountModal(true); }}
              className="px-4 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-zinc-800 transition-all shadow-sm"
            >
              + New Account
            </button>
          )}
          {(activeView === "overview" || activeView === "journal") && (
            <button
              onClick={() => setShowEntryModal(true)}
              className="px-4 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-zinc-800 transition-all shadow-sm"
            >
              + New Entry
            </button>
          )}
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {([
          { id: "overview", label: "Overview" },
          { id: "ledger", label: "Chart of Accounts" },
          { id: "journal", label: "Journal Entries" },
          { id: "periods", label: "Fiscal Periods" },
          { id: "reports", label: "Financial Reports" },
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

      {activeView === "overview" && <OverviewView onNewEntry={() => setShowEntryModal(true)} />}
      {activeView === "ledger" && (
        <LedgerView
          onEdit={(a) => { setEditingAccount(a); setShowAccountModal(true); }}
        />
      )}
      {activeView === "journal" && <JournalView />}
      {activeView === "periods" && <PeriodsView />}
      {activeView === "reports" && <ReportsView />}
    </div>
  );
}

// ── Overview ──────────────────────────────────────────────────────────────────

function OverviewView({ onNewEntry }: { onNewEntry: () => void }) {
  const dateFrom = firstOfMonth();
  const dateTo = today();
  const { data: pl, isLoading } = useProfitLoss({ date_from: dateFrom, date_to: dateTo });
  const { data: entriesData } = useJournalEntries({ status: "POSTED" });
  const entries = entriesData?.results ?? [];

  const revenue = pl?.revenue.total ?? "0";
  const expenses = pl?.expenses.total ?? "0";
  const netIncome = pl?.net_income ?? "0";
  const netNum = parseFloat(netIncome);
  const revNum = parseFloat(revenue);
  const margin = revNum > 0 ? ((netNum / revNum) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Revenue</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{isLoading ? "—" : fmtAmount(revenue)}</p>
          <p className="text-xs text-gray-400 mt-1">This month</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Expenses</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{isLoading ? "—" : fmtAmount(expenses)}</p>
          <p className="text-xs text-gray-400 mt-1">This month</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Net Income</p>
          <p className={cn("text-2xl font-extrabold mt-1", netNum >= 0 ? "text-emerald-600" : "text-red-600")}>
            {isLoading ? "—" : fmtAmount(netIncome)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{margin}% margin</p>
        </div>
      </div>

      {/* P&L Summary */}
      {pl && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Profit & Loss — This Month</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-emerald-50 p-5">
              <p className="text-sm font-semibold text-emerald-700 mb-3">Revenue</p>
              <div className="space-y-2">
                {pl.revenue.accounts.slice(0, 5).map((a) => (
                  <div key={a.account_id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{a.account_name}</span>
                    <span className="font-semibold text-gray-900">{fmtAmount(a.amount)}</span>
                  </div>
                ))}
                <div className="border-t border-emerald-200 pt-2 mt-2 flex justify-between text-sm font-bold">
                  <span>Total Revenue</span>
                  <span className="text-emerald-700">{fmtAmount(pl.revenue.total)}</span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-red-50 p-5">
              <p className="text-sm font-semibold text-red-700 mb-3">Expenses</p>
              <div className="space-y-2">
                {pl.expenses.accounts.slice(0, 5).map((a) => (
                  <div key={a.account_id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{a.account_name}</span>
                    <span className="font-semibold text-gray-900">{fmtAmount(a.amount)}</span>
                  </div>
                ))}
                <div className="border-t border-red-200 pt-2 mt-2 flex justify-between text-sm font-bold">
                  <span>Total Expenses</span>
                  <span className="text-red-700">{fmtAmount(pl.expenses.total)}</span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-black text-white p-5 flex flex-col justify-between">
              <p className="text-sm font-semibold text-gray-400 mb-3">Net Income</p>
              <p className={cn("text-4xl font-extrabold", netNum >= 0 ? "text-emerald-400" : "text-red-400")}>
                {fmtAmount(netIncome)}
              </p>
              <p className="text-sm text-gray-400 mt-2">{margin}% margin</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Journal Entries */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Recent Posted Entries</h2>
          <button onClick={onNewEntry} className="text-sm font-semibold text-gray-500 hover:text-gray-900">+ New</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Number</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Description</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Source</th>
                <th className="text-center px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {entries.slice(0, 10).map((entry) => {
                const sc = statusColor[entry.status] ?? statusColor.DRAFT;
                return (
                  <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900">{entry.entry_number}</td>
                    <td className="px-6 py-3 text-gray-500 whitespace-nowrap">{entry.date}</td>
                    <td className="px-6 py-3 text-gray-900">{entry.description}</td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">{entry.source}</span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", sc.bg, sc.text)}>{entry.status}</span>
                    </td>
                  </tr>
                );
              })}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">No posted entries yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Chart of Accounts ─────────────────────────────────────────────────────────

function LedgerView({ onEdit }: { onEdit: (a: Account) => void }) {
  const deleteAccount = useDeleteAccount();
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const { data, isLoading } = useAccounts(
    typeFilter !== "ALL" ? { account_type: typeFilter as Account["account_type"] } : {}
  );
  const accounts = data?.results ?? [];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {["ALL", "ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all",
              typeFilter === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Chart of Accounts</h2>
          <p className="text-sm text-gray-500 mt-1">{data?.count ?? 0} accounts</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Code</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Type</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Sub-accounts</th>
                <th className="text-center px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Active</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">Loading...</td></tr>
              )}
              {accounts.map((account) => {
                const tc = typeColor[account.account_type] ?? { bg: "bg-gray-100", text: "text-gray-700" };
                return (
                  <tr key={account.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-mono font-bold">{account.code}</span>
                    </td>
                    <td className="px-6 py-3 font-semibold text-gray-900">{account.name}</td>
                    <td className="px-6 py-3">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", tc.bg, tc.text)}>{account.account_type}</span>
                    </td>
                    <td className="px-6 py-3 text-right text-gray-500">{account.children_count}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold", account.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500")}>
                        {account.is_active ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(account)}
                          className="text-xs font-semibold text-gray-500 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        {!account.is_system && account.children_count === 0 && (
                          <button
                            onClick={() => {
                              if (confirm(`Delete account ${account.code}?`)) deleteAccount.mutate(account.id);
                            }}
                            className="text-xs font-semibold text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && accounts.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">No accounts found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Journal Entries ───────────────────────────────────────────────────────────

function JournalView() {
  const postEntry = usePostJournalEntry();
  const voidEntry = useVoidJournalEntry();
  const [statusFilter, setStatusFilter] = useState<"" | "DRAFT" | "POSTED" | "VOIDED">("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data, isLoading } = useJournalEntries(statusFilter ? { status: statusFilter } : {});
  const entries = data?.results ?? [];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[{ val: "", label: "All" }, { val: "DRAFT", label: "Draft" }, { val: "POSTED", label: "Posted" }, { val: "VOIDED", label: "Voided" }].map((f) => (
          <button
            key={f.val}
            onClick={() => setStatusFilter(f.val as typeof statusFilter)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all",
              statusFilter === f.val ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Journal Entries</h2>
          <p className="text-sm text-gray-500 mt-1">{data?.count ?? 0} entries</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Number</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Description</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Source</th>
                <th className="text-center px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">Loading...</td></tr>
              )}
              {entries.map((entry) => {
                const sc = statusColor[entry.status] ?? statusColor.DRAFT;
                const isExpanded = expandedId === entry.id;
                return (
                  <>
                    <tr
                      key={entry.id}
                      className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    >
                      <td className="px-6 py-3 font-medium text-gray-900">{entry.entry_number}</td>
                      <td className="px-6 py-3 text-gray-500 whitespace-nowrap">{entry.date}</td>
                      <td className="px-6 py-3 text-gray-900">{entry.description}</td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">{entry.source}</span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", sc.bg, sc.text)}>{entry.status}</span>
                      </td>
                      <td className="px-6 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          {entry.status === "DRAFT" && (
                            <button
                              onClick={() => postEntry.mutate(entry.id)}
                              className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 px-2 py-1 rounded hover:bg-emerald-50"
                            >
                              Post
                            </button>
                          )}
                          {entry.status === "POSTED" && (
                            <button
                              onClick={() => { if (confirm("Void this entry?")) voidEntry.mutate(entry.id); }}
                              className="text-xs font-semibold text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                            >
                              Void
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && entry.lines.length > 0 && (
                      <tr key={`${entry.id}-lines`} className="bg-gray-50/50">
                        <td colSpan={6} className="px-6 py-3">
                          <table className="w-full text-xs">
                            <thead>
                              <tr>
                                <th className="text-left font-semibold text-gray-400 pb-1">Account</th>
                                <th className="text-left font-semibold text-gray-400 pb-1">Description</th>
                                <th className="text-right font-semibold text-gray-400 pb-1">Debit</th>
                                <th className="text-right font-semibold text-gray-400 pb-1">Credit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {entry.lines.map((line) => (
                                <tr key={line.id}>
                                  <td className="py-1 text-gray-600">{line.account_code} — {line.account_name}</td>
                                  <td className="py-1 text-gray-500">{line.description}</td>
                                  <td className="py-1 text-right font-mono text-gray-900">{parseFloat(line.debit) > 0 ? fmtAmount(line.debit) : "—"}</td>
                                  <td className="py-1 text-right font-mono text-gray-900">{parseFloat(line.credit) > 0 ? fmtAmount(line.credit) : "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {!isLoading && entries.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">No journal entries</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Fiscal Periods ────────────────────────────────────────────────────────────

function PeriodsView() {
  const { data, isLoading } = useFiscalPeriods();
  const createPeriod = useCreateFiscalPeriod();
  const closePeriod = useCloseFiscalPeriod();
  const periods = data?.results ?? [];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", start_date: "", end_date: "" });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createPeriod.mutateAsync(form);
    setShowForm(false);
    setForm({ name: "", start_date: "", end_date: "" });
  }

  return (
    <div className="space-y-4">
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">New Fiscal Period</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</label>
              <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10" placeholder="e.g. Q1 2026" />
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
                {createPeriod.isPending ? "Creating..." : "Create Period"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Fiscal Periods</h2>
          <button onClick={() => setShowForm(true)} className="text-sm font-semibold text-gray-500 hover:text-gray-900">+ New Period</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Start</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">End</th>
                <th className="text-center px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading && <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">Loading...</td></tr>}
              {periods.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3 font-semibold text-gray-900">{p.name}</td>
                  <td className="px-6 py-3 text-gray-500">{p.start_date}</td>
                  <td className="px-6 py-3 text-gray-500">{p.end_date}</td>
                  <td className="px-6 py-3 text-center">
                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", p.is_closed ? "bg-gray-100 text-gray-600" : "bg-emerald-50 text-emerald-700")}>
                      {p.is_closed ? "Closed" : "Open"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    {!p.is_closed && (
                      <button
                        onClick={() => { if (confirm(`Close period "${p.name}"? This cannot be undone.`)) closePeriod.mutate(p.id); }}
                        className="text-xs font-semibold text-amber-600 hover:text-amber-800 px-2 py-1 rounded hover:bg-amber-50"
                      >
                        Close
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!isLoading && periods.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">No fiscal periods yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Financial Reports ─────────────────────────────────────────────────────────

function ReportsView() {
  const [reportType, setReportType] = useState<"pl" | "trial" | "balance">("pl");
  const [dateFrom, setDateFrom] = useState(firstOfMonth());
  const [dateTo, setDateTo] = useState(today());
  const [asOf, setAsOf] = useState(today());

  const pl = useProfitLoss({ date_from: dateFrom, date_to: dateTo });
  const trial = useTrialBalance({ as_of_date: asOf });
  const balance = useBalanceSheet({ as_of_date: asOf });

  return (
    <div className="space-y-4">
      {/* Report Type Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[{ id: "pl", label: "Profit & Loss" }, { id: "trial", label: "Trial Balance" }, { id: "balance", label: "Balance Sheet" }].map((r) => (
          <button
            key={r.id}
            onClick={() => setReportType(r.id as typeof reportType)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all",
              reportType === r.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Date Controls */}
      <div className="flex flex-wrap gap-4 items-end">
        {reportType === "pl" ? (
          <>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">To</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10" />
            </div>
          </>
        ) : (
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">As of Date</label>
            <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)}
              className="mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10" />
          </div>
        )}
      </div>

      {/* P&L Report */}
      {reportType === "pl" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-bold text-gray-900">Profit & Loss: {dateFrom} → {dateTo}</h2>
          {pl.isLoading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : pl.data ? (
            <>
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-sm font-bold text-emerald-700 mb-2">Revenue</p>
                {pl.data.revenue.accounts.map((a) => (
                  <div key={a.account_id} className="flex justify-between text-sm py-1">
                    <span className="text-gray-700">{a.account_code} — {a.account_name}</span>
                    <span className="font-semibold">{fmtAmount(a.amount)}</span>
                  </div>
                ))}
                <div className="border-t border-emerald-200 pt-2 mt-1 flex justify-between font-bold text-sm">
                  <span>Total Revenue</span><span className="text-emerald-700">{fmtAmount(pl.data.revenue.total)}</span>
                </div>
              </div>
              <div className="rounded-xl bg-red-50 p-4">
                <p className="text-sm font-bold text-red-700 mb-2">Expenses</p>
                {pl.data.expenses.accounts.map((a) => (
                  <div key={a.account_id} className="flex justify-between text-sm py-1">
                    <span className="text-gray-700">{a.account_code} — {a.account_name}</span>
                    <span className="font-semibold">{fmtAmount(a.amount)}</span>
                  </div>
                ))}
                <div className="border-t border-red-200 pt-2 mt-1 flex justify-between font-bold text-sm">
                  <span>Total Expenses</span><span className="text-red-700">{fmtAmount(pl.data.expenses.total)}</span>
                </div>
              </div>
              <div className="rounded-xl bg-black p-4 text-white flex justify-between items-center">
                <span className="font-bold">Net Income</span>
                <span className={cn("text-2xl font-extrabold", parseFloat(pl.data.net_income) >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {fmtAmount(pl.data.net_income)}
                </span>
              </div>
            </>
          ) : <p className="text-sm text-gray-400">No data available</p>}
        </div>
      )}

      {/* Trial Balance */}
      {reportType === "trial" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Trial Balance as of {asOf}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Code</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Account</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Type</th>
                  <th className="text-right px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Debit</th>
                  <th className="text-right px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {trial.isLoading && <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">Loading...</td></tr>}
                {trial.data?.rows.map((row) => (
                  <tr key={row.account_id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 font-mono text-xs text-gray-600">{row.account_code}</td>
                    <td className="px-6 py-3 text-gray-900">{row.account_name}</td>
                    <td className="px-6 py-3">
                      <span className={cn("px-2 py-0.5 rounded text-xs font-semibold", typeColor[row.account_type]?.bg, typeColor[row.account_type]?.text)}>{row.account_type}</span>
                    </td>
                    <td className="px-6 py-3 text-right font-mono">{parseFloat(row.debit) > 0 ? fmtAmount(row.debit) : "—"}</td>
                    <td className="px-6 py-3 text-right font-mono">{parseFloat(row.credit) > 0 ? fmtAmount(row.credit) : "—"}</td>
                  </tr>
                ))}
                {trial.data && (
                  <tr className="bg-gray-50 font-bold">
                    <td colSpan={3} className="px-6 py-3 text-gray-900">Totals</td>
                    <td className="px-6 py-3 text-right">{fmtAmount(trial.data.total_debit)}</td>
                    <td className="px-6 py-3 text-right">{fmtAmount(trial.data.total_credit)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Balance Sheet */}
      {reportType === "balance" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-bold text-gray-900">Balance Sheet as of {asOf}</h2>
          {balance.isLoading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : balance.data ? (
            <>
              {[
                { label: "Assets", data: balance.data.assets, color: "blue" },
                { label: "Liabilities", data: balance.data.liabilities, color: "red" },
                { label: "Equity", data: balance.data.equity, color: "violet" },
              ].map(({ label, data: section, color }) => (
                <div key={label} className={cn("rounded-xl p-4", `bg-${color}-50`)}>
                  <p className={cn("text-sm font-bold mb-2", `text-${color}-700`)}>{label}</p>
                  {section.accounts.map((a) => (
                    <div key={a.account_id} className="flex justify-between text-sm py-0.5">
                      <span className="text-gray-700">{a.account_code} — {a.account_name}</span>
                      <span className="font-semibold">{fmtAmount(a.amount)}</span>
                    </div>
                  ))}
                  <div className={cn("border-t pt-2 mt-1 flex justify-between font-bold text-sm", `border-${color}-200`)}>
                    <span>Total {label}</span><span>{fmtAmount(section.total)}</span>
                  </div>
                </div>
              ))}
              <div className="rounded-xl bg-black text-white p-4 flex justify-between items-center">
                <span className="font-bold">Total Assets</span>
                <span className="text-xl font-extrabold">{fmtAmount(balance.data.total_assets)}</span>
              </div>
            </>
          ) : <p className="text-sm text-gray-400">No data available</p>}
        </div>
      )}
    </div>
  );
}
