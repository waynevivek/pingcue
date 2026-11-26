import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  CalendarClock,
  ChevronRight,
  MailX,
  MessageSquare,
  Pause,
  Plus,
  Search,
  X,
} from "lucide-react";
import {
  listInvoices,
  listSentEmailLogsByUser,
  listSuppressedEmails,
  requireUser,
} from "@/lib/db";
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

function renderNextStepLabel(
  step: UpcomingReminderStep | undefined,
  emailSuppressed = false
) {
  if (!step || step.kind === "paid") {
    return <span className="text-[#71717A]">Settled</span>;
  }
  if (emailSuppressed) {
    return (
      <span className="inline-flex items-center gap-1 font-medium text-[#BE123C]">
        <MailX className="h-3 w-3" aria-hidden="true" />
        <span>Email paused</span>
      </span>
    );
  }
  if (step.kind === "paused") {
    return (
      <span className="inline-flex items-center gap-1 text-[#1D4ED8]">
        <Pause className="h-3 w-3" aria-hidden="true" />
        <span>Paused until {formatShortDate(step.pausedUntil)}</span>
      </span>
    );
  }
  if (step.kind === "scheduled") {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-[#52525B] tabular-nums">
        <CalendarClock className="h-3 w-3 text-[#71717A]" aria-hidden="true" />
        <span>
          {step.isDueNow
            ? `Due (${formatOffsetBadge(step.offsetDays)})`
            : `${formatOffsetBadge(step.offsetDays)} · ${formatShortDate(step.scheduledDate)}`}
        </span>
      </span>
    );
  }
  return <span className="text-[#71717A]">All sent</span>;
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

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Editorial Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h1 className="font-sans text-[22px] font-semibold leading-tight tracking-[-0.03em] text-[#131316] sm:text-[24px]">
          Invoices
        </h1>
        <p className="text-xs text-[#63636A] tabular-nums">
          {filterCounts.all} total · {filterCounts.active} active
          {filterCounts.overdue > 0 ? ` · ${filterCounts.overdue} overdue` : ""}
        </p>
      </div>

      {/* Unified Hairline Ledger Card */}
      <div className="overflow-hidden rounded-[18px] border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(19,19,22,0.03),0_10px_28px_-18px_rgba(19,19,22,0.1)]">
        {/* Apple Segmented Filter + Search Header */}
        <div className="flex flex-col gap-2.5 border-b border-black/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <nav
            aria-label="Filter invoices"
            className="grid grid-cols-4 gap-0.5 rounded-[9px] bg-[#F5F5F3] p-[2px] sm:inline-flex"
          >
            {FILTERS.map((filter) => {
              const isSelected = activeFilter === filter.key;
              const count = filterCounts[filter.key];
              return (
                <Link
                  key={filter.key}
                  href={buildFilterHref(filter.key, searchQuery)}
                  aria-current={isSelected ? "page" : undefined}
                  className={`inline-flex items-center justify-center gap-1 rounded-[7px] px-2 py-1 text-[11.5px] transition-all sm:px-2.5 ${
                    isSelected
                      ? "bg-white font-semibold text-[#131316] shadow-[0_1px_2px_rgba(19,19,22,0.08)]"
                      : "font-medium text-[#63636A] hover:text-[#131316]"
                  }`}
                >
                  <span>{filter.label}</span>
                  <span className="font-mono text-[10px] text-[#71717A] tabular-nums">
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
              className="flex items-center gap-1.5 sm:w-60"
            >
              {activeFilter !== "all" && (
                <input type="hidden" name="status" value={activeFilter} />
              )}
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8E8E93]"
                  aria-hidden="true"
                />
                <input
                  name="q"
                  type="search"
                  defaultValue={searchQuery}
                  placeholder="Search client or invoice..."
                  aria-label="Search invoices"
                  className="h-8 w-full rounded-[8px] border border-black/[0.08] bg-[#F5F5F3] pl-8 pr-2.5 text-base text-[#131316] placeholder:text-[#8E8E93] transition-colors focus:border-black/25 focus:bg-white focus:outline-none sm:text-xs"
                />
              </div>
              {searchQuery && (
                <Link
                  href={buildFilterHref(activeFilter, "")}
                  aria-label="Clear search"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-black/[0.08] bg-[#F5F5F3] text-[#63636A] hover:text-[#131316]"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              )}
            </form>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-semibold text-[#131316]">
              {invoices.length === 0
                ? "No invoices yet"
                : "No matching invoices"}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-[#63636A]">
              {invoices.length === 0
                ? "Add a client invoice with your payment link and due date to start automated follow-ups."
                : "Try switching filter tabs or clearing your search query."}
            </p>
            <div className="mt-5">
              <Link
                href={invoices.length === 0 ? "/invoices/new" : "/invoices"}
                className="inline-flex h-9 items-center gap-1.5 rounded-[9px] border border-[#131316] bg-[#131316] px-3.5 text-xs font-medium text-white shadow-[0_1px_2px_rgba(19,19,22,0.16),inset_0_1px_0_rgba(255,255,255,0.14)] hover:bg-[#26262B]"
              >
                {invoices.length === 0 && (
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>
                  {invoices.length === 0
                    ? "Create invoice"
                    : "Show all invoices"}
                </span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-black/[0.05]">
            {filtered.map((invoice) => {
              const remaining = getRemainingMinor(
                invoice.amount_minor,
                invoice.amount_received_minor
              );
              const active = isInvoiceActive(invoice);
              const paidPct =
                invoice.amount_minor > 0
                  ? Math.round(
                      (invoice.amount_received_minor / invoice.amount_minor) *
                        100
                    )
                  : 0;
              const nextStep = nextStepMap.get(invoice.id);
              const emailSuppressed =
                active &&
                suppressedEmails.has(invoice.client_email.trim().toLowerCase());

              return (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="group flex flex-col gap-2.5 px-4 py-3.5 transition-colors hover:bg-[#FAFAF8] focus-visible:bg-[#FAFAF8] focus-visible:outline-none md:grid md:grid-cols-[minmax(0,1.7fr)_minmax(0,0.9fr)_auto_minmax(118px,auto)] md:items-center md:gap-4 md:px-5"
                >
                  {/* Title & Client Meta */}
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3 md:block">
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-[13.5px] font-medium leading-snug text-[#131316] md:truncate">
                          {invoice.title}
                        </p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#63636A]">
                          <span className="truncate">{invoice.client_name}</span>
                          <span aria-hidden="true">·</span>
                          <span className="hidden truncate lg:inline">
                            {invoice.client_email}
                          </span>
                          <span aria-hidden="true" className="hidden lg:inline">
                            ·
                          </span>
                          <span className="tabular-nums">
                            Due {formatShortDate(invoice.due_date)}
                          </span>
                          {invoice.client_whatsapp && (
                            <span
                              title="WhatsApp ready"
                              className="inline-flex items-center text-[#15803D]"
                            >
                              <MessageSquare
                                className="h-3 w-3"
                                aria-hidden="true"
                              />
                              <span className="sr-only">WhatsApp ready</span>
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Mobile Right-Aligned Amount */}
                      <div className="shrink-0 text-right font-mono tabular-nums md:hidden">
                        <p
                          className={`text-[13.5px] font-semibold ${
                            active ? "text-[#131316]" : "text-[#71717A]"
                          }`}
                        >
                          {formatMoney(
                            active ? remaining : invoice.amount_minor,
                            invoice.currency
                          )}
                        </p>
                        {active && invoice.amount_received_minor > 0 && (
                          <p className="text-[10.5px] text-[#71717A]">
                            of{" "}
                            {formatMoney(
                              invoice.amount_minor,
                              invoice.currency
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    {paidPct > 0 && paidPct < 100 && (
                      <div className="mt-2 flex max-w-[180px] items-center gap-2">
                        <div
                          aria-hidden="true"
                          className="h-1 flex-1 overflow-hidden rounded-full bg-[#EFEFED]"
                        >
                          <div
                            style={{ width: `${paidPct}%` }}
                            className="h-full rounded-full bg-[#131316]"
                          />
                        </div>
                        <span className="font-mono text-[10px] text-[#71717A] tabular-nums">
                          {paidPct}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Desktop Next Ping */}
                  <div className="hidden min-w-0 text-xs md:block">
                    {renderNextStepLabel(nextStep, emailSuppressed)}
                  </div>

                  {/* Status Pill + Mobile Next Ping */}
                  <div className="flex items-center justify-between gap-2 md:justify-start">
                    <InvoiceStatusBadges
                      invoice={invoice}
                      todayIso={todayIso}
                      emailSuppressed={emailSuppressed}
                    />
                    <span className="inline-flex items-center gap-1 text-xs md:hidden">
                      {renderNextStepLabel(nextStep, emailSuppressed)}
                      <ChevronRight
                        className="h-3.5 w-3.5 text-[#A1A1AA]"
                        aria-hidden="true"
                      />
                    </span>
                  </div>

                  {/* Desktop Balance + Chevron */}
                  <div className="hidden items-center justify-end gap-2.5 text-right font-mono tabular-nums md:flex">
                    <div>
                      <p
                        className={`text-[13.5px] font-semibold ${
                          active ? "text-[#131316]" : "text-[#71717A]"
                        }`}
                      >
                        {formatMoney(
                          active ? remaining : invoice.amount_minor,
                          invoice.currency
                        )}
                      </p>
                      {active && invoice.amount_received_minor > 0 && (
                        <p className="text-[10.5px] text-[#71717A]">
                          of{" "}
                          {formatMoney(invoice.amount_minor, invoice.currency)}
                        </p>
                      )}
                    </div>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-[#A1A1AA] transition-transform group-hover:translate-x-0.5 group-hover:text-[#131316]"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function InvoicesPage(props: PageProps<"/invoices">) {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-7 w-32 animate-pulse rounded-lg bg-black/[0.06]" />
          <div className="h-64 animate-pulse rounded-[18px] bg-white" />
        </div>
      }
    >
      <InvoicesListContent searchParams={props.searchParams} />
    </Suspense>
  );
}
