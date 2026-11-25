import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listInvoices, requireUser } from "@/lib/db";
import {
  filterInvoices,
  formatMoney,
  formatShortDate,
  getRemainingMinor,
  getTodayIsoDate,
  type InvoiceListFilter,
} from "@/lib/invoices";
import { InvoiceStatusBadges } from "./StatusBadges";

export const metadata: Metadata = {
  title: "Invoices — PingCue",
};

const FILTERS: ReadonlyArray<{ key: InvoiceListFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "overdue", label: "Overdue" },
  { key: "paid", label: "Paid" },
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
  const { user } = await requireUser();
  const todayIso = getTodayIsoDate();
  const [resolvedParams, invoices] = await Promise.all([
    searchParams,
    listInvoices(user.id),
  ]);

  const rawStatus = Array.isArray(resolvedParams.status)
    ? resolvedParams.status[0]
    : resolvedParams.status;
  const rawQuery = Array.isArray(resolvedParams.q)
    ? resolvedParams.q[0]
    : resolvedParams.q;
  const searchQuery = (rawQuery ?? "").trim();

  const activeFilter: InvoiceListFilter = FILTERS.some(
    (f) => f.key === rawStatus
  )
    ? (rawStatus as InvoiceListFilter)
    : "all";

  const filtered = filterInvoices(invoices, {
    status: activeFilter,
    query: searchQuery,
    todayIso,
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

      {/* Filter tabs + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((filter) => {
            const isSelected = activeFilter === filter.key;
            return (
              <Link
                key={filter.key}
                href={buildFilterHref(filter.key, searchQuery)}
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

        {invoices.length > 0 && (
          <form
            method="GET"
            action="/invoices"
            className="flex items-center gap-2 sm:w-72"
          >
            {activeFilter !== "all" && (
              <input type="hidden" name="status" value={activeFilter} />
            )}
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#71717A]"
                aria-hidden="true"
              />
              <Input
                name="q"
                type="search"
                defaultValue={searchQuery}
                placeholder="Search client or invoice..."
                aria-label="Search invoices"
                className="h-9 rounded-full bg-white pl-8 pr-3 text-xs"
              />
            </div>
            {searchQuery && (
              <Link
                href={buildFilterHref(activeFilter, "")}
                aria-label="Clear search"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/[0.08] bg-white text-[#52525B] transition-colors hover:bg-[#F4F4F5] hover:text-[#111111]"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            )}
          </form>
        )}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm font-medium text-[#111111]">
            {invoices.length === 0
              ? "You haven't added any invoices yet."
              : "No invoices match your filter or search."}
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
        <>
          {/* Mobile card list (phone-first ergonomics) */}
          <Card className="divide-y divide-black/[0.06] overflow-hidden md:hidden">
            {filtered.map((invoice) => {
              const remaining = getRemainingMinor(
                invoice.amount_minor,
                invoice.amount_received_minor
              );
              return (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="block space-y-2.5 p-4 transition-colors hover:bg-[#FAFAFA]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#111111]">
                        {invoice.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-[#52525B]">
                        {invoice.client_name} · {invoice.client_email}
                      </p>
                    </div>
                    <div className="shrink-0 text-right font-mono tabular-nums">
                      <p className="text-sm font-semibold text-[#111111]">
                        {formatMoney(remaining, invoice.currency)}
                      </p>
                      <p className="text-[11px] text-[#52525B]">
                        of {formatMoney(invoice.amount_minor, invoice.currency)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <InvoiceStatusBadges
                      invoice={invoice}
                      todayIso={todayIso}
                    />
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#52525B] tabular-nums">
                      Due {formatShortDate(invoice.due_date)}
                      <ArrowRight className="h-3.5 w-3.5 text-[#111111]" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </Card>

          {/* Desktop table */}
          <Card className="hidden overflow-x-auto md:block">
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
                          of{" "}
                          {formatMoney(invoice.amount_minor, invoice.currency)}
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
        </>
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
