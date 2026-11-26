import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  MailX,
  MessageSquare,
  Pause,
  Plus,
  Search,
  X,
} from "lucide-react";
import { PerchedPingMascot } from "@/app/components/HeroStickers";
import { UpgradeCheckoutButton } from "@/app/components/UpgradeCheckoutButton";
import {
  getUserProfile,
  listInvoices,
  listSentEmailLogsByUser,
  listSuppressedEmails,
  requireUser,
} from "@/lib/db";
import {
  computeCurrencyTotals,
  filterInvoices,
  formatMoney,
  formatOffsetBadge,
  formatShortDate,
  getOffsetTone,
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
import { SUPPORT_EMAIL } from "@/lib/site-config";
import { InvoiceStatusBadges } from "../invoices/StatusBadges";
import { CashflowBentoCard } from "./CashflowBentoCard";
import { CheckoutReturnHandler } from "./CheckoutReturnHandler";

export const metadata: Metadata = {
  title: "Overview — PingCue",
};

const FILTERS: ReadonlyArray<{ key: InvoiceListFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "overdue", label: "Overdue" },
  { key: "paid", label: "Paid" },
];

function getGreetingName(displayName: string | null): string | null {
  if (!displayName) return null;
  const first = displayName.trim().split(/\s+/)[0];
  return first || null;
}

function buildDashboardHref(status: InvoiceListFilter, query: string): string {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (query) params.set("q", query);
  const qs = params.toString();
  return qs ? `/dashboard?${qs}` : "/dashboard";
}

function getToneDotClass(offsetDays: number): string {
  const tone = getOffsetTone(offsetDays);
  if (tone === "Final notice") return "bg-[#E11D48]";
  if (tone === "Firm") return "bg-[#D97706]";
  return "bg-[#16A34A]";
}

async function DashboardContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user } = await requireUser();
  const todayIso = getTodayIsoDate();

  const [resolvedParams, profile, invoices, sentLogsByInvoice] =
    await Promise.all([
      searchParams,
      getUserProfile(user.id, user.email ?? ""),
      listInvoices(user.id),
      listSentEmailLogsByUser(user.id),
    ]);

  const statusParam = Array.isArray(resolvedParams.status)
    ? resolvedParams.status[0]
    : resolvedParams.status;
  const queryParam = Array.isArray(resolvedParams.q)
    ? resolvedParams.q[0]
    : resolvedParams.q;
  const checkoutParam = Array.isArray(resolvedParams.checkout)
    ? resolvedParams.checkout[0]
    : resolvedParams.checkout;
  const upgradeParam = Array.isArray(resolvedParams.upgrade)
    ? resolvedParams.upgrade[0]
    : resolvedParams.upgrade;
  const passwordResetParam = Array.isArray(resolvedParams.passwordReset)
    ? resolvedParams.passwordReset[0]
    : resolvedParams.passwordReset;

  const normalizedStatus = statusParam?.toLowerCase();
  const checkoutReturn = Boolean(checkoutParam);
  const checkoutFailed =
    checkoutReturn &&
    (normalizedStatus === "failed" ||
      normalizedStatus === "cancelled" ||
      normalizedStatus === "canceled");
  const checkoutExplicitSuccess =
    checkoutReturn &&
    !checkoutFailed &&
    (normalizedStatus === "succeeded" || normalizedStatus === "success");
  const wantsUpgrade = upgradeParam === "1";
  const passwordReset = passwordResetParam === "1";

  const searchQuery = (queryParam ?? "").trim();
  const activeFilter: InvoiceListFilter = FILTERS.some(
    (f) => f.key === statusParam
  )
    ? (statusParam as InvoiceListFilter)
    : "all";

  const activeInvoices = invoices.filter(isInvoiceActive);
  const suppressedEmails = await listSuppressedEmails(
    activeInvoices.map((inv) => inv.client_email)
  );
  const currencyTotals = computeCurrencyTotals(invoices, todayIso);
  const isFree = profile.plan === "free";
  const greetingName = getGreetingName(profile.display_name);

  const invoiceNextSteps = new Map<string, UpcomingReminderStep>();
  for (const invoice of invoices) {
    const logs = sentLogsByInvoice.get(invoice.id) ?? [];
    const sentOffsets = getSentOffsetsForDueDate(logs, invoice.due_date);
    invoiceNextSteps.set(
      invoice.id,
      getUpcomingScheduledStep(invoice, sentOffsets, todayIso)
    );
  }

  const upcomingQueue = activeInvoices
    .filter(
      (invoice) =>
        !suppressedEmails.has(invoice.client_email.trim().toLowerCase())
    )
    .map((invoice) => ({
      invoice,
      step: invoiceNextSteps.get(invoice.id),
    }))
    .filter(
      (
        entry
      ): entry is {
        invoice: (typeof activeInvoices)[number];
        step: Extract<UpcomingReminderStep, { kind: "scheduled" }>;
      } => entry.step?.kind === "scheduled"
    )
    .sort((a, b) => a.step.scheduledDate.localeCompare(b.step.scheduledDate));

  const nextPing = upcomingQueue[0] ?? null;
  const remainingQueuedCount = Math.max(0, upcomingQueue.length - 1);

  const filterCounts: Record<InvoiceListFilter, number> = {
    all: invoices.length,
    active: activeInvoices.length,
    overdue: invoices.filter((inv) => isInvoiceOverdue(inv, todayIso)).length,
    paid: invoices.filter((inv) => !isInvoiceActive(inv)).length,
  };

  const filteredInvoices = filterInvoices(invoices, {
    status: activeFilter,
    query: searchQuery,
    todayIso,
  });

  const subtitleParts: string[] = [];
  if (activeInvoices.length === 0 && invoices.length > 0) {
    subtitleParts.push("All invoices settled");
  } else if (activeInvoices.length > 0) {
    subtitleParts.push(
      `${activeInvoices.length} active ${activeInvoices.length === 1 ? "invoice" : "invoices"}`
    );
  }
  if (upcomingQueue.length > 0) {
    subtitleParts.push(
      `${upcomingQueue.length} ${upcomingQueue.length === 1 ? "ping" : "pings"} queued`
    );
  }

  return (
    <div className="space-y-4 md:space-y-5">
      <CheckoutReturnHandler
        isFree={isFree}
        checkoutReturn={checkoutReturn}
        checkoutFailed={checkoutFailed}
        checkoutExplicitSuccess={checkoutExplicitSuccess}
        wantsUpgrade={wantsUpgrade}
        passwordReset={passwordReset}
        supportEmail={SUPPORT_EMAIL}
      />

      {/* Quiet Editorial Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h1 className="font-sans text-[22px] font-semibold leading-tight tracking-[-0.03em] text-[#131316] sm:text-[24px]">
          {greetingName ? `Overview · ${greetingName}` : "Overview"}
        </h1>
        {subtitleParts.length > 0 && (
          <p className="text-xs text-[#63636A] tabular-nums">
            {subtitleParts.join(" · ")}
          </p>
        )}
      </div>

      {/* Subtle Free Plan Upgrade Strip */}
      {isFree && (
        <div className="flex flex-col gap-3 rounded-[16px] border border-black/[0.08] bg-[#FFFDF7] px-4 py-3.5 shadow-[0_1px_2px_rgba(19,19,22,0.03)] sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#131316] sm:text-[13px]">
              Free plan ({Math.min(activeInvoices.length, 1)}/1 active invoice)
            </p>
            <p className="mt-0.5 text-xs text-[#63636A]">
              Unlock unlimited invoices &amp; 1-tap WhatsApp nudges once for $19
              — no subscription.
            </p>
          </div>
          <UpgradeCheckoutButton
            variant="compact"
            label="Unlock Founding Pass — $19"
            className="w-full shrink-0 rounded-[9px] sm:w-auto"
          />
        </div>
      )}

      {/* Zero-Invoice Empty State — calm dusk.bot framed mini-poster */}
      {invoices.length === 0 ? (
        <div className="overflow-hidden rounded-[20px] border border-black/[0.07] bg-white p-6 text-center shadow-[0_1px_2px_rgba(19,19,22,0.03),0_12px_32px_-20px_rgba(19,19,22,0.1)] sm:p-10">
          <div className="relative mx-auto mb-6 h-24 w-full max-w-sm overflow-hidden rounded-[14px] border border-black/[0.06] bg-[#84D6FF]">
            <svg
              aria-hidden="true"
              viewBox="0 0 400 110"
              preserveAspectRatio="xMidYMid slice"
              className="h-full w-full"
              fill="none"
            >
              <rect width="400" height="44" fill="#5BC2FF" />
              <rect x="34" y="20" width="76" height="16" rx="8" fill="#FFFFFF" />
              <rect x="52" y="11" width="42" height="14" rx="7" fill="#FFFFFF" />
              <rect x="274" y="16" width="90" height="18" rx="9" fill="#FFFFFF" />
              <rect x="294" y="8" width="50" height="16" rx="8" fill="#FFFFFF" />
              <path
                d="M0 64C95 40 200 76 310 56C355 48 380 54 400 60V110H0V64Z"
                fill="#C7F584"
              />
              <path
                d="M0 82C130 66 260 94 400 76V110H0V82Z"
                fill="#A8EC62"
              />
            </svg>
            <PerchedPingMascot
              sleeping={false}
              className="absolute bottom-1 left-1/2 h-[48px] w-[76px] -translate-x-1/2"
            />
          </div>

          <h2 className="font-sans text-[19px] font-semibold tracking-[-0.025em] text-[#131316] sm:text-[21px]">
            Add your first unpaid invoice
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-[13.5px] leading-relaxed text-[#63636A]">
            Paste your client&apos;s email, due date, and payment link once.
            PingCue follows up politely from -3d to +30d and stops the moment
            you mark it paid.
          </p>

          <div className="mt-6">
            <Link
              href="/invoices/new"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[10px] border border-[#131316] bg-[#131316] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(19,19,22,0.18),inset_0_1px_0_rgba(255,255,255,0.16)] transition-colors hover:bg-[#26262B]"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Create your first invoice</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Asymmetric 7 / 5 Bento: Money Card + Living Autopilot Card */}
          <div className="grid gap-3.5 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-7">
              <CashflowBentoCard buckets={currencyTotals} />
            </div>

            {/* Right 5-col: Living Autopilot Card */}
            <section
              aria-label="Upcoming automated reminders"
              className="flex min-w-0 flex-col justify-between rounded-[18px] border border-black/[0.07] bg-white p-5 shadow-[0_1px_2px_rgba(19,19,22,0.03),0_10px_28px_-18px_rgba(19,19,22,0.1)] lg:col-span-5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#131316]">
                  <span
                    aria-hidden="true"
                    className={
                      nextPing
                        ? "h-2 w-2 rounded-full bg-[#22C55E] shadow-[0_0_0_3px_rgba(34,197,94,0.18)]"
                        : "h-2 w-2 rounded-full bg-[#A1A1AA]"
                    }
                  />
                  <span>{nextPing ? "Autopilot" : "Autopilot idle"}</span>
                </span>
                <span className="font-mono text-[11px] text-[#71717A] tabular-nums">
                  09:30 IST
                </span>
              </div>

              {nextPing ? (
                <Link
                  href={`/invoices/${nextPing.invoice.id}`}
                  className="group my-3.5 block rounded-[12px] border border-black/[0.06] bg-[#F7F7F5] p-3.5 transition-colors hover:border-black/15 hover:bg-[#F2F2EE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#131316]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.07] bg-white px-2.5 py-0.5 font-mono text-[10.5px] font-semibold text-[#131316] tabular-nums">
                      <span
                        aria-hidden="true"
                        className={`h-1.5 w-1.5 rounded-full ${getToneDotClass(nextPing.step.offsetDays)}`}
                      />
                      <span>
                        {formatOffsetBadge(nextPing.step.offsetDays)} ·{" "}
                        {getOffsetTone(nextPing.step.offsetDays)}
                      </span>
                    </span>
                    <span className="font-mono text-[11px] text-[#63636A] tabular-nums">
                      {nextPing.step.isDueNow
                        ? "Due today"
                        : formatShortDate(nextPing.step.scheduledDate)}
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-baseline justify-between gap-2">
                    <p className="truncate text-[13.5px] font-semibold text-[#131316]">
                      {nextPing.invoice.client_name}
                    </p>
                    <p className="shrink-0 font-mono text-[13px] font-semibold text-[#131316] tabular-nums">
                      {formatMoney(
                        getRemainingMinor(
                          nextPing.invoice.amount_minor,
                          nextPing.invoice.amount_received_minor
                        ),
                        nextPing.invoice.currency
                      )}
                    </p>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[#63636A]">
                    {nextPing.invoice.title}
                  </p>
                </Link>
              ) : (
                <div className="my-3.5 rounded-[12px] border border-black/[0.06] bg-[#F7F7F5] p-3.5 text-xs leading-relaxed text-[#63636A]">
                  {activeInvoices.length === 0 ? (
                    <span className="inline-flex items-center gap-2 font-medium text-[#15803D]">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      Every invoice is marked paid.
                    </span>
                  ) : (
                    "No automated email pings queued right now — active invoices are paused or waiting on manual follow-up."
                  )}
                </div>
              )}

              <div className="flex items-center justify-between gap-2 text-xs text-[#63636A]">
                <span className="tabular-nums">
                  {remainingQueuedCount > 0
                    ? `+${remainingQueuedCount} more queued`
                    : nextPing
                      ? "Auto-stops when marked paid"
                      : "Daily check at 09:30 IST"}
                </span>
                {nextPing ? (
                  <Link
                    href={`/invoices/${nextPing.invoice.id}`}
                    className="inline-flex items-center gap-1 font-medium text-[#131316] hover:underline"
                  >
                    <span>Preview</span>
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                ) : (
                  <Link
                    href="/invoices/new"
                    className="inline-flex items-center gap-1 font-medium text-[#131316] hover:underline"
                  >
                    <span>New invoice</span>
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                )}
              </div>
            </section>
          </div>

          {/* Unified Invoice Ledger — Single Source of Truth (no duplicate section!) */}
          <section
            aria-label="Invoices"
            className="overflow-hidden rounded-[18px] border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(19,19,22,0.03),0_10px_28px_-18px_rgba(19,19,22,0.1)]"
          >
            {/* Integrated Segmented Filter + Search Bar */}
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
                      href={buildDashboardHref(filter.key, searchQuery)}
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

              <form
                method="GET"
                action="/dashboard"
                className="flex items-center gap-1.5 sm:w-56"
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
                    href={buildDashboardHref(activeFilter, "")}
                    aria-label="Clear search"
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-black/[0.08] bg-[#F5F5F3] text-[#63636A] hover:text-[#131316]"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                )}
              </form>
            </div>

            {filteredInvoices.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm font-medium text-[#131316]">
                  No matching invoices
                </p>
                <p className="mt-1 text-xs text-[#63636A]">
                  Try another filter tab or clear your search.
                </p>
                <div className="mt-4">
                  <Link
                    href="/dashboard"
                    className="inline-flex h-8 items-center rounded-[8px] border border-black/10 bg-white px-3 text-xs font-medium text-[#131316] shadow-[0_1px_2px_rgba(19,19,22,0.04)] hover:bg-[#F5F5F3]"
                  >
                    Reset filters
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-black/[0.05]">
                {filteredInvoices.map((invoice) => {
                  const remaining = getRemainingMinor(
                    invoice.amount_minor,
                    invoice.amount_received_minor
                  );
                  const active = isInvoiceActive(invoice);
                  const nextStep = invoiceNextSteps.get(invoice.id);
                  const emailSuppressed =
                    active &&
                    suppressedEmails.has(
                      invoice.client_email.trim().toLowerCase()
                    );

                  return (
                    <Link
                      key={invoice.id}
                      href={`/invoices/${invoice.id}`}
                      className="group flex flex-col gap-2.5 px-4 py-3.5 transition-colors hover:bg-[#FAFAF8] focus-visible:bg-[#FAFAF8] focus-visible:outline-none sm:grid sm:grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)_auto_minmax(110px,auto)] sm:items-center sm:gap-4 sm:px-5"
                    >
                      {/* Title & Client */}
                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-3 sm:block">
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-[13.5px] font-medium leading-snug text-[#131316] sm:truncate">
                              {invoice.title}
                            </p>
                            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#63636A]">
                              <span className="truncate">
                                {invoice.client_name}
                              </span>
                              <span aria-hidden="true">·</span>
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
                                  <span className="sr-only">
                                    WhatsApp ready
                                  </span>
                                </span>
                              )}
                            </p>
                          </div>

                          {/* Mobile Right-Aligned Amount */}
                          <div className="shrink-0 text-right font-mono tabular-nums sm:hidden">
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
                            {active &&
                              invoice.amount_received_minor > 0 && (
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
                      </div>

                      {/* Next Ping Schedule (desktop column + mobile bottom right) */}
                      <div className="hidden min-w-0 text-xs sm:block">
                        {!active ? (
                          <span className="text-[#71717A]">Settled</span>
                        ) : emailSuppressed ? (
                          <span className="inline-flex items-center gap-1 font-medium text-[#BE123C]">
                            <MailX className="h-3 w-3" aria-hidden="true" />
                            <span>Use WhatsApp</span>
                          </span>
                        ) : nextStep?.kind === "scheduled" ? (
                          <span className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-[#52525B] tabular-nums">
                            <CalendarClock
                              className="h-3 w-3 text-[#71717A]"
                              aria-hidden="true"
                            />
                            <span>
                              {nextStep.isDueNow
                                ? `Due (${formatOffsetBadge(nextStep.offsetDays)})`
                                : `${formatOffsetBadge(nextStep.offsetDays)} · ${formatShortDate(nextStep.scheduledDate)}`}
                            </span>
                          </span>
                        ) : nextStep?.kind === "paused" ? (
                          <span className="inline-flex items-center gap-1 text-[#1D4ED8]">
                            <Pause className="h-3 w-3" aria-hidden="true" />
                            <span>Paused</span>
                          </span>
                        ) : (
                          <span className="text-[#71717A]">All sent</span>
                        )}
                      </div>

                      {/* Status + Mobile Schedule */}
                      <div className="flex items-center justify-between gap-2 sm:justify-start">
                        <InvoiceStatusBadges
                          invoice={invoice}
                          todayIso={todayIso}
                          emailSuppressed={emailSuppressed}
                        />
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#63636A] tabular-nums sm:hidden">
                          {!active
                            ? "Settled"
                            : emailSuppressed
                              ? "Use WhatsApp"
                              : nextStep?.kind === "scheduled"
                                ? `${formatOffsetBadge(nextStep.offsetDays)} · ${formatShortDate(nextStep.scheduledDate)}`
                                : nextStep?.kind === "paused"
                                  ? "Paused"
                                  : "All sent"}
                          <ChevronRight
                            className="h-3.5 w-3.5 text-[#A1A1AA]"
                            aria-hidden="true"
                          />
                        </span>
                      </div>

                      {/* Desktop Amount + Chevron */}
                      <div className="hidden items-center justify-end gap-2.5 text-right font-mono tabular-nums sm:flex">
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
                              {formatMoney(
                                invoice.amount_minor,
                                invoice.currency
                              )}
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
          </section>
        </>
      )}
    </div>
  );
}

export default function DashboardPage(props: PageProps<"/dashboard">) {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-7 w-40 animate-pulse rounded-lg bg-black/[0.06]" />
          <div className="grid gap-3.5 lg:grid-cols-12">
            <div className="h-44 animate-pulse rounded-[18px] bg-white lg:col-span-7" />
            <div className="h-44 animate-pulse rounded-[18px] bg-white lg:col-span-5" />
          </div>
          <div className="h-56 animate-pulse rounded-[18px] bg-white" />
        </div>
      }
    >
      <DashboardContent searchParams={props.searchParams} />
    </Suspense>
  );
}
