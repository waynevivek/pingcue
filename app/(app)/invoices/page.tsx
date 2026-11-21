import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { listInvoices, requireUser } from "@/lib/db";
import {
  formatMoney,
  formatShortDate,
  getRemainingMinor,
  getTodayIsoDate,
  isInvoiceActive,
  isInvoiceOverdue,
} from "@/lib/invoices";
import { InvoiceStatusBadges } from "./StatusBadges";

export const metadata: Metadata = {
  title: "Invoices — PingCue",
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "overdue", label: "Overdue" },
  { key: "paid", label: "Paid" },
] as const;

async function InvoicesListContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user } = await requireUser();
  const todayIso = getTodayIsoDate();
  const [resolvedParams, invoices] = await Promise.all([
    searchParams,
    listInvoices(user.id),
  ]);

  const rawStatus = Array.isArray(resolvedParams.status)
    ? resolvedParams.status[0]
    : resolvedParams.status;
  const activeFilter = FILTERS.some((f) => f.key === rawStatus)
    ? (rawStatus as (typeof FILTERS)[number]["key"])
    : "all";

  const filtered = invoices.filter((invoice) => {
    if (activeFilter === "active") return isInvoiceActive(invoice);
    if (activeFilter === "overdue") return isInvoiceOverdue(invoice, todayIso);
    if (activeFilter === "paid") return !isInvoiceActive(invoice);
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Invoices</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage clients, track partial payments, and pause or edit reminder
            schedules.
          </p>
        </div>

        <Link
          href="/invoices/new"
          className="inline-flex items-center justify-center rounded-lg bg-[#C2410C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#9A3412] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          + New invoice
        </Link>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((filter) => {
          const isSelected = activeFilter === filter.key;
          const href =
            filter.key === "all"
              ? "/invoices"
              : `/invoices?status=${filter.key}`;
          return (
            <Link
              key={filter.key}
              href={href}
              className={`rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                isSelected
                  ? "border-blue-600 bg-blue-50 text-blue-800"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-2xs">
          <p className="text-sm font-medium text-slate-700">
            {invoices.length === 0
              ? "You haven't added any invoices yet."
              : "No invoices match this filter."}
          </p>
          <div className="mt-4">
            <Link
              href={invoices.length === 0 ? "/invoices/new" : "/invoices"}
              className="inline-flex items-center rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              {invoices.length === 0 ? "Create invoice" : "Show all invoices"}
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Client &amp; Invoice</th>
                <th className="px-5 py-3.5">Remaining / Total</th>
                <th className="px-5 py-3.5">Due date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((invoice) => {
                const remaining = getRemainingMinor(
                  invoice.amount_minor,
                  invoice.amount_received_minor
                );
                return (
                  <tr key={invoice.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {invoice.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {invoice.client_name} · {invoice.client_email}
                      </p>
                    </td>
                    <td className="px-5 py-4 font-mono">
                      <p className="font-semibold text-slate-900">
                        {formatMoney(remaining, invoice.currency)}
                      </p>
                      <p className="text-xs text-slate-500">
                        of {formatMoney(invoice.amount_minor, invoice.currency)}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-slate-700">
                      {formatShortDate(invoice.due_date)}
                    </td>
                    <td className="px-5 py-4">
                      <InvoiceStatusBadges
                        invoice={invoice}
                        todayIso={todayIso}
                      />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="font-medium text-blue-700 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function InvoicesPage(props: PageProps<"/invoices">) {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-9 w-40 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        </div>
      }
    >
      <InvoicesListContent searchParams={props.searchParams} />
    </Suspense>
  );
}
