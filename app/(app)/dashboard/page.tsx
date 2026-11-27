import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ArrowRight, CalendarClock, Plus } from "lucide-react";
import {
  PaidStampSticker,
  PerchedPingMascot,
} from "@/app/components/HeroStickers";
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
import { FirstInvoiceEmptyState } from "../EmptyStateCard";
import { InvoiceLedger } from "../invoices/InvoiceLedger";
import { CashflowBentoCard } from "./CashflowBentoCard";
import { CheckoutReturnHandler } from "./CheckoutReturnHandler";

export const metadata: Metadata = {
  title: "Overview — PingCue",
};

const VALID_FILTERS: ReadonlyArray<InvoiceListFilter> = [
  "all",
  "active",
  "overdue",
  "paid",
];

function getGreetingName(displayName: string | null): string | null {
  if (!displayName) return null;
  const first = displayName.trim().split(/\s+/)[0];
  return first || null;
}

function getToneBadgeClasses(offsetDays: number): {
  dot: string;
  pill: string;
} {
  const tone = getOffsetTone(offsetDays);
  if (tone === "Final notice") {
    return {
      dot: "bg-[#E11D48]",
      pill: "border-[#FECDD3] bg-[#FFF5F6] text-[#9F1239]",
    };
  }
  if (tone === "Firm") {
    return {
      dot: "bg-[#D97706]",
      pill: "border-[#FDE68A] bg-[#FEFDF0] text-[#713F12]",
    };
  }
  return {
    dot: "bg-[#16A34A]",
    pill: "border-[#BBF7D0] bg-[#F2FDF5] text-[#14532D]",
  };
}

async function DashboardContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
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
  const activeFilter: InvoiceListFilter = VALID_FILTERS.includes(
    normalizedStatus as InvoiceListFilter
  )
    ? (normalizedStatus as InvoiceListFilter)
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
    <div className="space-y-5">
      <CheckoutReturnHandler
        isFree={isFree}
        checkoutReturn={checkoutReturn}
        checkoutFailed={checkoutFailed}
        checkoutExplicitSuccess={checkoutExplicitSuccess}
        wantsUpgrade={wantsUpgrade}
        passwordReset={passwordReset}
        supportEmail={SUPPORT_EMAIL}
      />

      {/* Page Heading */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h1 className="font-sans text-[22px] font-semibold leading-tight tracking-[-0.03em] text-[#111111] sm:text-[24px]">
          {greetingName ? `Overview · ${greetingName}` : "Overview"}
        </h1>
        {subtitleParts.length > 0 && (
          <p className="font-mono text-xs text-[#52525B] tabular-nums">
            {subtitleParts.join(" · ")}
          </p>
        )}
      </div>

      {/* Zero-Invoice First-Run State */}
      {invoices.length === 0 ? (
        <div className="space-y-4">
          <FirstInvoiceEmptyState />

          {isFree && (
            <div className="flex flex-col gap-3 rounded-[16px] border border-black/[0.08] bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(17,17,17,0.03)] sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#111111]">
                  Free plan includes 1 active invoice
                </p>
                <p className="mt-0.5 text-xs text-[#52525B]">
                  Upgrade once for $19 to unlock unlimited invoices and 1-tap
                  WhatsApp nudges — no subscription.
                </p>
              </div>
              <UpgradeCheckoutButton
                variant="compact"
                label="Unlock Founding Pass — $19"
                className="w-full shrink-0 rounded-[8px] sm:w-auto"
              />
            </div>
          )}
        </div>
      ) : (
        <>
          {/* 1. Asymmetric 7/5 Daylight Bento Hero: Cashflow + Next Ping on Autopilot */}
          <div className="grid gap-4 lg:grid-cols-12 lg:items-stretch">
            <div className="min-w-0 lg:col-span-7">
              <CashflowBentoCard
                buckets={currencyTotals}
                defaultCurrency={profile.default_currency}
              />
            </div>

            <div className="min-w-0 lg:col-span-5">
              {nextPing ? (
                (() => {
                  const toneBadge = getToneBadgeClasses(
                    nextPing.step.offsetDays
                  );
                  const nextRemaining = getRemainingMinor(
                    nextPing.invoice.amount_minor,
                    nextPing.invoice.amount_received_minor
                  );
                  return (
                    <section
                      aria-label="Next automated ping"
                      className="flex h-full flex-col justify-between gap-3 rounded-[18px] border border-[#BFE883] bg-[#F4FCE6] p-4 shadow-[0_1px_2px_rgba(26,46,5,0.04),0_12px_28px_-20px_rgba(26,46,5,0.18)] sm:p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="h-2 w-2 rounded-full bg-[#16A34A] shadow-[0_0_0_3px_rgba(22,163,74,0.18)]"
                          />
                          <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-[#1A2E05]">
                            Next ping
                          </h2>
                          {remainingQueuedCount > 0 && (
                            <span className="shrink-0 whitespace-nowrap rounded-full border border-[#BFE883] bg-white/90 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#365314] tabular-nums">
                              +{remainingQueuedCount} queued
                            </span>
                          )}
                        </div>

                        <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap font-mono text-[10.5px] font-medium text-[#365314] tabular-nums">
                          <CalendarClock
                            className="h-3 w-3 shrink-0"
                            aria-hidden="true"
                          />
                          <span>04:00 UTC</span>
                        </span>
                      </div>

                      {/* Elevated Pure-White Dispatch Ticket */}
                      <Link
                        href={`/invoices/${nextPing.invoice.id}`}
                        className="group flex flex-1 flex-col justify-between gap-3 rounded-[14px] border border-black/[0.08] bg-white p-4 shadow-[0_2px_10px_-4px_rgba(17,17,17,0.08)] transition-all duration-150 hover:border-black/20 hover:shadow-[0_8px_20px_-10px_rgba(17,17,17,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
                      >
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-1.5">
                            <span
                              className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[7px] border px-2 py-0.5 font-mono text-[10.5px] font-semibold tabular-nums ${toneBadge.pill}`}
                            >
                              <span
                                aria-hidden="true"
                                className={`h-1.5 w-1.5 shrink-0 rounded-full ${toneBadge.dot}`}
                              />
                              <span>
                                {formatOffsetBadge(nextPing.step.offsetDays)} ·{" "}
                                {getOffsetTone(nextPing.step.offsetDays)}
                              </span>
                            </span>
                            <span className="shrink-0 whitespace-nowrap font-mono text-[11px] font-medium text-[#52525B] tabular-nums">
                              {nextPing.step.isDueNow
                                ? "Due today"
                                : formatShortDate(nextPing.step.scheduledDate)}
                            </span>
                          </div>

                          <div className="min-w-0 pt-0.5">
                            <p className="truncate text-[14.5px] font-semibold tracking-[-0.015em] text-[#111111]">
                              {nextPing.invoice.client_name}
                            </p>
                            <p className="mt-0.5 line-clamp-1 text-[12.5px] text-[#52525B]">
                              {nextPing.invoice.title}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 border-t border-black/[0.06] pt-3">
                          <div className="min-w-0 font-mono tabular-nums">
                            <p className="truncate text-[16px] font-semibold leading-none tracking-[-0.025em] text-[#111111]">
                              {formatMoney(
                                nextRemaining,
                                nextPing.invoice.currency
                              )}
                            </p>
                            <p className="mt-1 text-[10px] text-[#63636A]">
                              remaining
                            </p>
                          </div>

                          <span className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[9px] border border-[#111111] bg-[#111111] px-3 text-xs font-medium text-white transition-colors group-hover:bg-[#262626] sm:h-8">
                            <span>Preview</span>
                            <ArrowRight
                              className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
                              aria-hidden="true"
                            />
                          </span>
                        </div>
                      </Link>
                    </section>
                  );
                })()
              ) : activeInvoices.length === 0 ? (
                /* Key State Sticker: All Settled */
                <section
                  aria-label="Autopilot settled"
                  className="flex h-full flex-col justify-between gap-4 rounded-[18px] border border-[#BBF7D0] bg-[#F2FDF5] p-5 shadow-[0_1px_2px_rgba(20,83,45,0.04)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-semibold text-[#14532D]">
                        All caught up
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-[#166534]">
                        Every invoice is settled — Autopilot is idle with zero
                        unpaid balances remaining.
                      </p>
                    </div>
                    <PaidStampSticker className="h-12 w-16 shrink-0 -rotate-[5deg]" />
                  </div>
                  <Link
                    href="/invoices/new"
                    className="inline-flex h-9 w-fit items-center justify-center gap-1.5 whitespace-nowrap rounded-[9px] border border-[#111111] bg-[#111111] px-3 text-xs font-medium text-white transition-colors hover:bg-[#262626] active:bg-[#000000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] sm:h-8"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>New invoice</span>
                  </Link>
                </section>
              ) : (
                /* Key State Sticker: Paused / Resting */
                <section
                  aria-label="Autopilot resting"
                  className="flex h-full flex-col justify-between gap-4 rounded-[18px] border border-black/[0.08] bg-white p-5 shadow-[0_1px_2px_rgba(17,17,17,0.03),0_10px_28px_-20px_rgba(17,17,17,0.12)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-semibold text-[#111111]">
                        Autopilot is resting
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-[#52525B]">
                        No automated pings are queued right now — active
                        invoices are paused or awaiting manual follow-up.
                      </p>
                    </div>
                    <PerchedPingMascot
                      sleeping={true}
                      className="h-11 w-[68px] shrink-0"
                    />
                  </div>
                  <Link
                    href="/invoices?status=active"
                    className="inline-flex h-9 w-fit items-center justify-center gap-1 whitespace-nowrap rounded-[9px] border border-black/[0.1] bg-[#F6F7F2] px-3 text-xs font-medium text-[#111111] transition-colors hover:bg-[#ECEEE6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] sm:h-8"
                  >
                    <span>Review active</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </section>
              )}
            </div>
          </div>

          {/* 2. Subtle Sender Name Prompt (only when display_name is unset) */}
          {!profile.display_name?.trim() && (
            <div className="flex flex-col gap-2 rounded-[14px] border border-black/[0.07] bg-white px-4 py-2.5 shadow-[0_1px_2px_rgba(17,17,17,0.02)] sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="min-w-0 text-xs text-[#52525B]">
                <strong className="font-semibold text-[#111111]">
                  Personalize your sender name:
                </strong>{" "}
                Add your name or studio in Settings so client reminders sign off
                cleanly instead of your login email.
              </p>
              <Link
                href="/settings"
                className="inline-flex h-9 w-fit shrink-0 items-center gap-1 whitespace-nowrap rounded-[8px] border border-black/[0.1] bg-[#F6F7F2] px-2.5 text-[11.5px] font-medium text-[#111111] transition-colors hover:bg-[#ECEEE6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] sm:h-7"
              >
                <span>Set sender name</span>
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          )}

          {/* 3. Slim 1-Line Free Plan Callout Strip */}
          {isFree && (
            <div className="flex flex-col gap-2.5 rounded-[14px] border border-black/[0.08] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(17,17,17,0.02)] sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="min-w-0 text-xs text-[#52525B]">
                <strong className="font-semibold text-[#111111]">
                  Free plan ({Math.min(activeInvoices.length, 1)}/1 active
                  invoice):
                </strong>{" "}
                Unlock unlimited invoices &amp; 1-tap WhatsApp nudges once for
                $19 — no subscription.
              </p>
              <UpgradeCheckoutButton
                variant="compact"
                label="Unlock Founding Pass — $19"
                className="w-full shrink-0 rounded-[8px] sm:w-auto"
              />
            </div>
          )}

          {/* 4. Crisp Hairline Invoice Ledger */}
          <InvoiceLedger
            basePath="/dashboard"
            invoices={filteredInvoices}
            activeFilter={activeFilter}
            searchQuery={searchQuery}
            filterCounts={filterCounts}
            nextStepMap={invoiceNextSteps}
            suppressedEmails={suppressedEmails}
            todayIso={todayIso}
          />
        </>
      )}
    </div>
  );
}

export default function DashboardPage(props: PageProps<"/dashboard">) {
  return (
    <Suspense
      fallback={
        <div className="space-y-5">
          <div className="h-7 w-40 animate-pulse rounded-lg bg-black/[0.05]" />
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="h-52 animate-pulse rounded-[18px] border border-black/[0.06] bg-white/80 lg:col-span-7" />
            <div className="h-52 animate-pulse rounded-[18px] border border-[#BFE883]/50 bg-[#F4FCE6]/80 lg:col-span-5" />
          </div>
          <div className="h-64 animate-pulse rounded-[18px] border border-black/[0.06] bg-white/80" />
        </div>
      }
    >
      <DashboardContent searchParams={props.searchParams} />
    </Suspense>
  );
}
