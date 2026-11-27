import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  listInvoices,
  listSentEmailLogsByUser,
  listSuppressedEmails,
  requireUser,
} from "@/lib/db";
import {
  filterInvoices,
  getTodayIsoDate,
  isInvoiceActive,
  isInvoiceOverdue,
  type InvoiceListFilter,
} from "@/lib/invoices";
import {
  getSentOffsetsForDueDate,
  getUpcomingScheduledStep,
  type UpcomingReminderStep,
} from "@/lib/reminders";
import { FirstInvoiceEmptyState } from "../EmptyStateCard";
import { InvoiceLedger } from "./InvoiceLedger";

export const metadata: Metadata = {
  title: "Invoices — PingCue",
};

const VALID_FILTERS: ReadonlyArray<InvoiceListFilter> = [
  "all",
  "active",
  "overdue",
  "paid",
];

function buildFilterHref(status: InvoiceListFilter, query: string): string {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (query) params.set("q", query);
  const qs = params.toString();
  return qs ? `/invoices?${qs}` : "/invoices";
}

async function InvoicesListContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const { user } = await requireUser();
  const todayIso = getTodayIsoDate();
  const [resolvedParams, invoices, sentLogsByInvoice] = await Promise.all([
    searchParams,
    listInvoices(user.id),
    listSentEmailLogsByUser(user.id),
  ]);

  const rawStatus = Array.isArray(resolvedParams.status)
    ? resolvedParams.status[0]
    : resolvedParams.status;
  const rawQuery = Array.isArray(resolvedParams.q)
    ? resolvedParams.q[0]
    : resolvedParams.q;
  const searchQuery = (rawQuery ?? "").trim();

  const normalizedStatus = rawStatus?.toLowerCase();
  const activeFilter: InvoiceListFilter = VALID_FILTERS.includes(
    normalizedStatus as InvoiceListFilter
  )
    ? (normalizedStatus as InvoiceListFilter)
    : "all";

  const filterCounts: Record<InvoiceListFilter, number> = {
    all: invoices.length,
    active: invoices.filter(isInvoiceActive).length,
    overdue: invoices.filter((inv) => isInvoiceOverdue(inv, todayIso)).length,
    paid: invoices.filter((inv) => !isInvoiceActive(inv)).length,
  };

  const filtered = filterInvoices(invoices, {
    status: activeFilter,
    query: searchQuery,
    todayIso,
  });

  const suppressedEmails = await listSuppressedEmails(
    filtered.filter(isInvoiceActive).map((inv) => inv.client_email)
  );

  const nextStepMap = new Map<string, UpcomingReminderStep>();
  for (const invoice of filtered) {
    const logs = sentLogsByInvoice.get(invoice.id) ?? [];
    const sentOffsets = getSentOffsetsForDueDate(logs, invoice.due_date);
    nextStepMap.set(
      invoice.id,
      getUpcomingScheduledStep(invoice, sentOffsets, todayIso)
    );
  }

  const statTiles: ReadonlyArray<{
    key: InvoiceListFilter;
    label: string;
    count: number;
    dot: string;
    valueClass: string;
  }> = [
    {
      key: "all",
      label: "All invoices",
      count: filterCounts.all,
      dot: "bg-[#111111]",
      valueClass: "text-[#111111]",
    },
    {
      key: "active",
      label: "Active",
      count: filterCounts.active,
      dot: "bg-[#2563EB]",
      valueClass: "text-[#111111]",
    },
    {
      key: "overdue",
      label: "Overdue",
      count: filterCounts.overdue,
      dot: "bg-[#E11D48]",
      valueClass: filterCounts.overdue > 0 ? "text-[#BE123C]" : "text-[#111111]",
    },
    {
      key: "paid",
      label: "Paid",
      count: filterCounts.paid,
      dot: "bg-[#16A34A]",
      valueClass: filterCounts.paid > 0 ? "text-[#15803D]" : "text-[#111111]",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Page Heading */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h1 className="font-sans text-[22px] font-semibold leading-tight tracking-[-0.03em] text-[#111111] sm:text-[24px]">
          Invoices
        </h1>
        <p className="font-mono text-xs text-[#52525B] tabular-nums">
          {filterCounts.all} total · {filterCounts.active} active
          {filterCounts.overdue > 0 ? ` · ${filterCounts.overdue} overdue` : ""}
        </p>
      </div>

      {invoices.length === 0 ? (
        <FirstInvoiceEmptyState />
      ) : (
        <>
          {/* Daylight Bento 4-Stat Quick-Filter Cards */}
          <nav
            aria-label="Filter invoices by status"
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {statTiles.map((tile) => {
              const selected = activeFilter === tile.key;
              return (
                <Link
                  key={tile.key}
                  href={buildFilterHref(tile.key, searchQuery)}
                  aria-current={selected ? "page" : undefined}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-[16px] border px-4 py-3.5 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] ${
                    selected
                      ? "border-[#BFE883] bg-[#F4FCE6] shadow-[0_1px_2px_rgba(26,46,5,0.05),0_8px_20px_-14px_rgba(26,46,5,0.18)]"
                      : "border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(17,17,17,0.03),0_8px_20px_-16px_rgba(17,17,17,0.1)] hover:border-black/20"
                  }`}
                >
                  <span className="flex h-4 items-center gap-1.5 text-[11.5px] font-medium text-[#52525B]">
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${tile.dot}`}
                    />
                    <span>{tile.label}</span>
                  </span>
                  <span
                    className={`mt-2 font-mono text-[24px] font-semibold leading-none tracking-[-0.03em] tabular-nums ${tile.valueClass}`}
                  >
                    {tile.count}
                  </span>
                  {selected && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-[3px] bg-[#65A30D]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Full Structured Invoice Ledger */}
          <InvoiceLedger
            basePath="/invoices"
            invoices={filtered}
            activeFilter={activeFilter}
            searchQuery={searchQuery}
            filterCounts={filterCounts}
            nextStepMap={nextStepMap}
            suppressedEmails={suppressedEmails}
            todayIso={todayIso}
            showClientEmail={true}
            showFilterTabs={false}
          />
        </>
      )}
    </div>
  );
}

export default function InvoicesPage(props: PageProps<"/invoices">) {
  return (
    <Suspense
      fallback={
        <div className="space-y-5">
          <div className="h-7 w-32 animate-pulse rounded-lg bg-[#F5F6F3]" />
          <div className="h-20 animate-pulse rounded-[14px] border border-black/[0.06] bg-[#F8F9F6]" />
          <div className="h-64 animate-pulse rounded-[14px] border border-black/[0.06] bg-[#F8F9F6]" />
        </div>
      }
    >
      <InvoicesListContent searchParams={props.searchParams} />
    </Suspense>
  );
}
