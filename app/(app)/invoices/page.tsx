import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
          <h1 className="font-sans text-[28px] font-semibold tracking-[-0.03em] text-[#111111] sm:text-[32px]">
            Invoices
          </h1>
          <p className="mt-1 text-sm text-[#52525B]">
            Manage clients, track partial payments, and pause or edit reminder
            schedules.
          </p>
        </div>

        <Button asChild>
          <Link href="/invoices/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>New invoice</span>
          </Link>
        </Button>
      </div>

      {/* Filter tabs */}
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
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] ${
                isSelected
                  ? "border-[#111111] bg-[#111111] text-white"
                  : "border-black/[0.08] bg-white text-[#111111] hover:bg-[#F4F4F5]"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm font-medium text-[#111111]">
            {invoices.length === 0
              ? "You haven't added any invoices yet."
              : "No invoices match this filter."}
          </p>
          <div className="mt-4">
            <Button asChild>
              <Link href={invoices.length === 0 ? "/invoices/new" : "/invoices"}>
                {invoices.length === 0 ? "Create invoice" : "Show all invoices"}
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="min-w-full divide-y divide-black/[0.06] text-left text-sm">
            <thead className="bg-[#FAFAFA] font-sans text-xs font-semibold uppercase tracking-wider text-[#52525B]">
              <tr>
                <th className="px-5 py-3.5">Client &amp; Invoice</th>
                <th className="px-5 py-3.5">Remaining / Total</th>
                <th className="px-5 py-3.5">Due date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06]">
              {filtered.map((invoice) => {
                const remaining = getRemainingMinor(
                  invoice.amount_minor,
                  invoice.amount_received_minor
                );
                return (
                  <tr
                    key={invoice.id}
                    className="transition-colors hover:bg-[#FAFAFA]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#111111]">
                        {invoice.title}
                      </p>
                      <p className="text-xs text-[#52525B]">
                        {invoice.client_name} · {invoice.client_email}
                      </p>
                    </td>
                    <td className="px-5 py-4 font-mono tabular-nums">
                      <p className="font-semibold text-[#111111]">
                        {formatMoney(remaining, invoice.currency)}
                      </p>
                      <p className="text-xs text-[#52525B]">
                        of {formatMoney(invoice.amount_minor, invoice.currency)}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-sans text-xs font-medium text-[#52525B] tabular-nums">
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
                        className="inline-flex items-center gap-1 rounded-full bg-[#F4F4F5] px-3 py-1 text-xs font-semibold text-[#111111] transition-colors hover:bg-[#EAEAEF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
                      >
                        <span>Manage</span>
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

export default function InvoicesPage(props: PageProps<"/invoices">) {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-9 w-40 animate-pulse rounded-lg bg-muted" />
          <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
        </div>
      }
    >
      <InvoicesListContent searchParams={props.searchParams} />
    </Suspense>
  );
}
