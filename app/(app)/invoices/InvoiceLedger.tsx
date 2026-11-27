import Link from "next/link";
import {
  CalendarClock,
  ChevronRight,
  MailX,
  MessageSquare,
  Pause,
  Search,
  X,
} from "lucide-react";
import {
  formatMoney,
  formatOffsetBadge,
  formatShortDate,
  getRemainingMinor,
  isInvoiceActive,
  type Invoice,
  type InvoiceListFilter,
} from "@/lib/invoices";
import { type UpcomingReminderStep } from "@/lib/reminders";
import { FilteredEmptyState } from "../EmptyStateCard";
import { InvoiceStatusBadges } from "./StatusBadges";

const FILTERS: ReadonlyArray<{ key: InvoiceListFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "overdue", label: "Overdue" },
  { key: "paid", label: "Paid" },
];

const MONOGRAM_TINTS = [
  "bg-[#F1FAD9] text-[#28420C] border-[#D8F0A0]",
  "bg-[#FEF9C3] text-[#713F12] border-[#FDE68A]",
  "bg-[#E0F2FE] text-[#0C4A6E] border-[#BAE6FD]",
  "bg-[#FFE4E6] text-[#881337] border-[#FECDD3]",
] as const;

function getClientTint(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % MONOGRAM_TINTS.length;
  }
  return MONOGRAM_TINTS[Math.abs(hash) % MONOGRAM_TINTS.length];
}

function getClientInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function buildHref(
  basePath: string,
  status: InvoiceListFilter,
  query: string
): string {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (query) params.set("q", query);
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function renderNextStep(
  step: UpcomingReminderStep | undefined,
  emailSuppressed: boolean
) {
  if (!step || step.kind === "paid") {
    return <span className="text-[#63636A]">Settled</span>;
  }
  if (emailSuppressed) {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-[#BE123C]">
        <MailX className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span>Use WhatsApp</span>
      </span>
    );
  }
  if (step.kind === "paused") {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-[#1E3A8A]">
        <Pause className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span>Paused</span>
      </span>
    );
  }
  if (step.kind === "scheduled") {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-[11.5px] text-[#52525B] tabular-nums">
        <CalendarClock
          className="h-3 w-3 shrink-0 text-[#63636A]"
          aria-hidden="true"
        />
        <span>
          {step.isDueNow
            ? `Due today (${formatOffsetBadge(step.offsetDays)})`
            : `${formatOffsetBadge(step.offsetDays)} · ${formatShortDate(step.scheduledDate)}`}
        </span>
      </span>
    );
  }
  return <span className="text-[#63636A]">All sent</span>;
}

function getEmptyCopy(activeFilter: InvoiceListFilter, searchQuery: string) {
  if (searchQuery) {
    return {
      title: `No invoices match "${searchQuery}"`,
      description:
        "Check the spelling, clear the search field, or switch back to All invoices.",
    };
  }
  if (activeFilter === "overdue") {
    return {
      title: "No overdue invoices",
      description:
        "Everything active is either on schedule or already settled.",
    };
  }
  if (activeFilter === "active") {
    return {
      title: "No active invoices",
      description:
        "All logged invoices are marked paid. Add a new one whenever you send a payment link.",
    };
  }
  if (activeFilter === "paid") {
    return {
      title: "No paid invoices yet",
      description:
        "Invoices move here as soon as you record full payment on their detail screen.",
    };
  }
  return {
    title: "No matching invoices",
    description: "Try switching filter tabs or clearing your search.",
  };
}

export function InvoiceLedger({
  basePath,
  invoices,
  activeFilter,
  searchQuery,
  filterCounts,
  nextStepMap,
  suppressedEmails,
  todayIso,
  showClientEmail = false,
  showFilterTabs = true,
}: {
  basePath: "/dashboard" | "/invoices";
  invoices: Invoice[];
  activeFilter: InvoiceListFilter;
  searchQuery: string;
  filterCounts: Record<InvoiceListFilter, number>;
  nextStepMap: Map<string, UpcomingReminderStep>;
  suppressedEmails: Set<string>;
  todayIso: string;
  showClientEmail?: boolean;
  showFilterTabs?: boolean;
}) {
  const emptyCopy = getEmptyCopy(activeFilter, searchQuery);
  const activeFilterLabel =
    FILTERS.find((f) => f.key === activeFilter)?.label ?? "All";

  return (
    <section
      aria-label="Invoice ledger"
      className="overflow-hidden rounded-[18px] border border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(17,17,17,0.03),0_10px_28px_-20px_rgba(17,17,17,0.12)]"
    >
      {/* Toolbar: Segmented Filter Tabs (or Summary Caption) + Search */}
      <div className="flex flex-col gap-2.5 border-b border-black/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        {showFilterTabs ? (
          <nav
            aria-label="Filter invoices"
            className="flex w-full items-center gap-0.5 rounded-[9px] border border-black/[0.06] bg-[#F5F6F3] p-[2px] sm:inline-flex sm:w-auto"
          >
            {FILTERS.map((filter) => {
              const isSelected = activeFilter === filter.key;
              const count = filterCounts[filter.key];
              return (
                <Link
                  key={filter.key}
                  href={buildHref(basePath, filter.key, searchQuery)}
                  aria-current={isSelected ? "page" : undefined}
                  className={`inline-flex flex-auto items-center justify-center gap-1 whitespace-nowrap rounded-[7px] px-2 py-1.5 text-[11.5px] transition-colors sm:flex-none sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] ${
                    isSelected
                      ? "bg-white font-semibold text-[#111111] shadow-[0_1px_2px_rgba(17,17,17,0.07)]"
                      : "font-medium text-[#52525B] hover:text-[#111111]"
                  }`}
                >
                  <span>{filter.label}</span>
                  <span className="font-mono text-[10.5px] text-[#63636A] tabular-nums">
                    {count}
                  </span>
                </Link>
              );
            })}
          </nav>
        ) : (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-[#111111]">
              {activeFilter === "all"
                ? "All invoices"
                : `${activeFilterLabel} invoices`}
            </span>
            <span className="font-mono text-[11px] text-[#63636A] tabular-nums">
              · {invoices.length}{" "}
              {invoices.length === 1 ? "result" : "results"}
            </span>
            {(activeFilter !== "all" || searchQuery) && (
              <Link
                href={basePath}
                className="font-medium text-[#52525B] underline decoration-black/20 underline-offset-2 transition-colors hover:text-[#111111]"
              >
                Reset
              </Link>
            )}
          </div>
        )}

        <form
          method="GET"
          action={basePath}
          className="flex items-center gap-1.5 sm:w-64"
        >
          {activeFilter !== "all" && (
            <input type="hidden" name="status" value={activeFilter} />
          )}
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#63636A]"
              aria-hidden="true"
            />
            <input
              key={searchQuery}
              name="q"
              type="search"
              defaultValue={searchQuery}
              placeholder="Search client or invoice..."
              aria-label="Search invoices"
              className="h-10 w-full rounded-[8px] border border-black/[0.09] bg-[#F8F9F6] pl-8 pr-2.5 text-base text-[#111111] placeholder:text-[#63636A] transition-colors focus:border-[#111111] focus:bg-white focus:outline-none sm:h-8 sm:text-xs"
            />
          </div>
          {searchQuery && (
            <Link
              href={buildHref(basePath, activeFilter, "")}
              aria-label="Clear search"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-black/[0.09] bg-[#F8F9F6] text-[#52525B] transition-colors hover:bg-white hover:text-[#111111] sm:h-8 sm:w-8"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          )}
        </form>
      </div>

      {invoices.length === 0 ? (
        <FilteredEmptyState
          title={emptyCopy.title}
          description={emptyCopy.description}
          resetHref={basePath}
        />
      ) : (
        <>
          {/* Explicit Desktop Column Headers (lg+ so split/tablet widths never crush column 1) */}
          <div
            aria-hidden="true"
            className="hidden border-b border-black/[0.06] bg-[#F8F9F6] px-5 py-2 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[#63636A] lg:grid lg:grid-cols-[minmax(0,1.5fr)_92px_132px_minmax(124px,148px)_112px] lg:items-center lg:gap-3"
          >
            <span>Invoice &amp; client</span>
            <span>Due date</span>
            <span>Next ping</span>
            <span>Status</span>
            <span className="pr-6 text-right">Remaining</span>
          </div>

          <div className="divide-y divide-black/[0.05]">
            {invoices.map((invoice) => {
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
                  className="group flex flex-col gap-2.5 px-4 py-3.5 transition-colors hover:bg-[#FAFAF8] focus-visible:bg-[#FAFAF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#111111] lg:grid lg:grid-cols-[minmax(0,1.5fr)_92px_132px_minmax(124px,148px)_112px] lg:items-center lg:gap-3 lg:px-5"
                >
                  {/* Column 1: Client Monogram + Title & Client */}
                  <div className="flex min-w-0 items-start gap-3 lg:items-center">
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border font-mono text-[11px] font-semibold lg:mt-0 ${getClientTint(invoice.client_name)}`}
                    >
                      {getClientInitials(invoice.client_name)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3 lg:block">
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-[13.5px] font-medium leading-snug text-[#111111] lg:truncate">
                            {invoice.title}
                          </p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-[#52525B]">
                            <span className="truncate">
                              {invoice.client_name}
                            </span>
                            {showClientEmail && (
                              <>
                                <span
                                  aria-hidden="true"
                                  className="hidden sm:inline text-[#A1A1AA]"
                                >
                                  ·
                                </span>
                                <span className="hidden truncate sm:inline text-[#63636A]">
                                  {invoice.client_email}
                                </span>
                              </>
                            )}
                            <span
                              aria-hidden="true"
                              className="text-[#A1A1AA] lg:hidden"
                            >
                              ·
                            </span>
                            <span className="font-mono text-[11px] tabular-nums lg:hidden">
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

                        {/* Mobile & Compact Tablet Right-Aligned Amount */}
                        <div className="shrink-0 text-right font-mono tabular-nums lg:hidden">
                          <p
                            className={`text-[13.5px] font-semibold ${
                              active ? "text-[#111111]" : "text-[#63636A]"
                            }`}
                          >
                            {formatMoney(
                              active ? remaining : invoice.amount_minor,
                              invoice.currency
                            )}
                          </p>
                          {active && invoice.amount_received_minor > 0 && (
                            <p className="text-[10.5px] text-[#63636A]">
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
                        <div className="mt-1.5 flex max-w-[168px] items-center gap-2">
                          <div
                            aria-hidden="true"
                            className="h-1 flex-1 overflow-hidden rounded-full bg-[#ECEEE8]"
                          >
                            <div
                              style={{ width: `${paidPct}%` }}
                              className="h-full rounded-full bg-[#111111]"
                            />
                          </div>
                          <span className="font-mono text-[10px] text-[#63636A] tabular-nums">
                            {paidPct}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column 2: Desktop Due Date */}
                  <div className="hidden font-mono text-[12px] text-[#52525B] tabular-nums lg:block">
                    {formatShortDate(invoice.due_date)}
                  </div>

                  {/* Column 3: Desktop Next Ping */}
                  <div className="hidden min-w-0 text-xs lg:block">
                    {renderNextStep(nextStep, emailSuppressed)}
                  </div>

                  {/* Column 4: Status Badge + Mobile/Compact Next Ping */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pl-11 lg:justify-start lg:pl-0">
                    <InvoiceStatusBadges
                      invoice={invoice}
                      todayIso={todayIso}
                      emailSuppressed={emailSuppressed}
                    />
                    <span className="inline-flex items-center gap-1 text-xs lg:hidden">
                      {renderNextStep(nextStep, emailSuppressed)}
                      <ChevronRight
                        className="h-3.5 w-3.5 text-[#63636A]"
                        aria-hidden="true"
                      />
                    </span>
                  </div>

                  {/* Column 5: Desktop Amount + Chevron */}
                  <div className="hidden items-center justify-end gap-2 text-right font-mono tabular-nums lg:flex">
                    <div>
                      <p
                        className={`text-[13.5px] font-semibold ${
                          active ? "text-[#111111]" : "text-[#63636A]"
                        }`}
                      >
                        {formatMoney(
                          active ? remaining : invoice.amount_minor,
                          invoice.currency
                        )}
                      </p>
                      {active && invoice.amount_received_minor > 0 && (
                        <p className="text-[10.5px] text-[#63636A]">
                          of{" "}
                          {formatMoney(invoice.amount_minor, invoice.currency)}
                        </p>
                      )}
                    </div>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-[#63636A] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[#111111]"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
