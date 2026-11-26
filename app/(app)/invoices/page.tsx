import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  CalendarClock,
  ChevronRight,
  MessageSquare,
  Pause,
  Search,
  X,
} from "lucide-react";
import { InlineEnvelopeSticker } from "@/app/components/HeroStickers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listInvoices, listSentEmailLogsByUser, requireUser } from "@/lib/db";
import {
  filterInvoices,
  formatMoney,
  formatOffsetBadge,
  formatShortDate,
  getRemainingMinor,
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

function renderNextStepLabel(step: UpcomingReminderStep | undefined) {
  if (!step || step.kind === "paid") {
    return <span className="font-semibold text-[#15803D]">Settled</span>;
  }
  if (step.kind === "paused") {
    return (
      <span className="inline-flex items-center gap-1 font-medium text-[#1E3A8A]">
        <Pause className="h-3 w-3" aria-hidden="true" />
        <span>Paused until {formatShortDate(step.pausedUntil)}</span>
      </span>
    );
  }
  if (step.kind === "scheduled") {
    return (
      <span className="inline-flex items-center gap-1 font-medium text-[#1E335C] tabular-nums">
        <CalendarClock className="h-3 w-3" aria-hidden="true" />
        <span>
          {step.isDueNow
            ? `Due now (${formatOffsetBadge(step.offsetDays)})`
            : `${formatOffsetBadge(step.offsetDays)} · ${formatShortDate(step.scheduledDate)}`}
        </span>
      </span>
    );
  }
  return <span className="text-[#71717A]">All steps sent</span>;
}

async function InvoicesListContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
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

  const activeFilter: InvoiceListFilter = FILTERS.some(
    (f) => f.key === rawStatus
  )
    ? (rawStatus as InvoiceListFilter)
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

  const nextStepMap = new Map<string, UpcomingReminderStep>();
  for (const invoice of filtered) {
    const logs = sentLogsByInvoice.get(invoice.id) ?? [];
    const sentOffsets = getSentOffsetsForDueDate(logs, invoice.due_date);
    nextStepMap.set(
      invoice.id,
      getUpcomingScheduledStep(invoice, sentOffsets, todayIso)
    );
  }

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header with inline die-cut envelope sticker */}
      <div className="min-w-0">
        <h1 className="font-sans text-[28px] font-semibold leading-tight tracking-[-0.035em] text-[#111111] sm:text-[34px]">
          Invoices{" "}
          <InlineEnvelopeSticker className="ml-0.5 h-[0.78em] w-auto -rotate-[6deg]" />
        </h1>
        <p className="mt-1 text-sm text-[#52525B]">
          Track balances, pause schedules, and send email or WhatsApp nudges.
        </p>
      </div>

      {/* Tactile Keycap Filter Pills + Search */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <nav
          aria-label="Filter invoices"
          className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1 sm:gap-2"
        >
          {FILTERS.map((filter) => {
            const isSelected = activeFilter === filter.key;
            const count = filterCounts[filter.key];
            return (
              <Link
                key={filter.key}
                href={buildFilterHref(filter.key, searchQuery)}
                aria-current={isSelected ? "page" : undefined}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 active:translate-y-[1px] active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] sm:px-3.5 sm:py-2 ${
                  isSelected
                    ? "border-[#111111] bg-[#111111] text-white shadow-[0_3px_0_rgba(17,17,17,0.28)]"
                    : "border-black/10 bg-white text-[#111111] shadow-[0_3px_0_rgba(17,17,17,0.08)] hover:-translate-y-0.5 hover:bg-[#FAFAFA]"
                }`}
              >
                <span>{filter.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.25 font-mono text-[10px] tabular-nums ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-[#F4F4F5] text-[#52525B]"
                  }`}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </nav>

        {invoices.length > 0 && (
          <form
            method="GET"
            action="/invoices"
            className="flex items-center gap-2 md:w-72"
          >
            {activeFilter !== "all" && (
              <input type="hidden" name="status" value={activeFilter} />
            )}
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717A]"
                aria-hidden="true"
              />
              <Input
                name="q"
                type="search"
                defaultValue={searchQuery}
                placeholder="Search client or invoice..."
                aria-label="Search invoices"
                className="h-10 rounded-full bg-[#FAFAFA] pl-9 pr-3 text-base sm:text-sm"
              />
            </div>
            {searchQuery && (
              <Link
                href={buildFilterHref(activeFilter, "")}
                aria-label="Clear search"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-[#52525B] shadow-[0_2px_0_rgba(17,17,17,0.06)] transition-colors hover:bg-[#F4F4F5] hover:text-[#111111]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </form>
        )}
      </div>

      {/* Periwinkle Pastel Bento Tray */}
      {filtered.length === 0 ? (
        <div className="rounded-[28px] border border-black/[0.06] bg-[#FFF1A8] p-6 text-center sm:p-10">
          <div className="mx-auto mb-3 flex justify-center">
            <InlineEnvelopeSticker className="h-11 w-auto -rotate-[5deg]" />
          </div>
          <p className="text-base font-semibold text-[#111111]">
            {invoices.length === 0
              ? "No invoices yet"
              : "No matching invoices"}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-[#4B4116]">
            {invoices.length === 0
              ? "Add a client invoice with your payment link and due date to start automated follow-ups."
              : "Try switching filter tabs or clearing your search query."}
          </p>
          <div className="mt-5">
            <Button
              asChild
              className="shadow-[0_3px_0_rgba(17,17,17,0.28)] active:translate-y-[1px] active:shadow-none"
            >
              <Link href={invoices.length === 0 ? "/invoices/new" : "/invoices"}>
                {invoices.length === 0 ? "Create invoice" : "Show all invoices"}
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-[28px] border border-black/[0.06] bg-[#D9E6FF] p-3 sm:p-4">
          {/* Mobile Floating Collectible Cards */}
          <div className="space-y-2.5 md:hidden">
            {filtered.map((invoice) => {
              const remaining = getRemainingMinor(
                invoice.amount_minor,
                invoice.amount_received_minor
              );
              const paidPct =
                invoice.amount_minor > 0
                  ? Math.round(
                      (invoice.amount_received_minor / invoice.amount_minor) *
                        100
                    )
                  : 0;
              const nextStep = nextStepMap.get(invoice.id);

              return (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="block space-y-3 rounded-2xl border border-black/[0.08] bg-white p-4 shadow-[0_3px_0_rgba(17,17,17,0.08)] transition-all duration-150 active:translate-y-[1px] active:shadow-none"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-[#111111]">
                        {invoice.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-[#52525B]">
                        {invoice.client_name} · Due{" "}
                        {formatShortDate(invoice.due_date)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right font-mono tabular-nums">
                      <p className="text-[15px] font-semibold text-[#111111]">
                        {formatMoney(remaining, invoice.currency)}
                      </p>
                      <p className="text-[11px] text-[#52525B]">
                        of {formatMoney(invoice.amount_minor, invoice.currency)}
                      </p>
                    </div>
                  </div>

                  {paidPct > 0 && paidPct < 100 && (
                    <div className="flex items-center gap-2">
                      <div
                        aria-hidden="true"
                        className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#EFEFF1]"
                      >
                        <div
                          style={{ width: `${paidPct}%` }}
                          className="h-full rounded-full bg-[#111111]"
                        />
                      </div>
                      <span className="font-mono text-[10px] font-semibold text-[#52525B] tabular-nums">
                        {paidPct}% paid
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <InvoiceStatusBadges
                        invoice={invoice}
                        todayIso={todayIso}
                      />
                      {invoice.client_whatsapp && (
                        <span
                          title="WhatsApp ready"
                          className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#DCFCE7] text-[#14532D]"
                        >
                          <MessageSquare
                            className="h-3 w-3"
                            aria-hidden="true"
                          />
                          <span className="sr-only">WhatsApp ready</span>
                        </span>
                      )}
                    </div>

                    <div className="inline-flex items-center gap-1 text-xs">
                      {renderNextStepLabel(nextStep)}
                      <ChevronRight
                        className="h-3.5 w-3.5 text-[#71717A]"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Desktop Crisp White Table inside Periwinkle Tray */}
          <div className="hidden overflow-x-auto rounded-[20px] border border-black/[0.08] bg-white shadow-[0_4px_16px_-8px_rgba(15,23,42,0.1)] md:block">
            <table className="min-w-full divide-y divide-black/[0.06] text-left text-sm">
              <thead className="bg-[#FAFAFA] font-sans text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                <tr>
                  <th className="px-5 py-3.5">Client &amp; Invoice</th>
                  <th className="px-5 py-3.5">Balance</th>
                  <th className="px-5 py-3.5">Next ping</th>
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
                  const paidPct =
                    invoice.amount_minor > 0
                      ? Math.round(
                          (invoice.amount_received_minor /
                            invoice.amount_minor) *
                            100
                        )
                      : 0;
                  const nextStep = nextStepMap.get(invoice.id);

                  return (
                    <tr
                      key={invoice.id}
                      className="transition-colors hover:bg-[#FAFAFA]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/invoices/${invoice.id}`}
                            className="font-semibold text-[#111111] hover:underline"
                          >
                            {invoice.title}
                          </Link>
                          {invoice.client_whatsapp && (
                            <span
                              title="WhatsApp ready"
                              className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#DCFCE7] text-[#14532D]"
                            >
                              <MessageSquare
                                className="h-3 w-3"
                                aria-hidden="true"
                              />
                              <span className="sr-only">WhatsApp ready</span>
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-[#52525B]">
                          {invoice.client_name} · {invoice.client_email} · Due{" "}
                          {formatShortDate(invoice.due_date)}
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
                        {paidPct > 0 && paidPct < 100 && (
                          <div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-[#EFEFF1]">
                            <div
                              style={{ width: `${paidPct}%` }}
                              className="h-full rounded-full bg-[#111111]"
                            />
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs">
                        {renderNextStepLabel(nextStep)}
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
                          className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#111111] shadow-[0_2px_0_rgba(17,17,17,0.08)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#FAFAFA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
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
          </div>
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
          <div className="h-9 w-40 animate-pulse rounded-xl bg-[#F4F4F5]" />
          <div className="h-64 animate-pulse rounded-[28px] bg-[#D9E6FF]" />
        </div>
      }
    >
      <InvoicesListContent searchParams={props.searchParams} />
    </Suspense>
  );
}
