import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  Pause,
  Plus,
} from "lucide-react";
import {
  InlineEnvelopeSticker,
  PerchedPingMascot,
} from "@/app/components/HeroStickers";
import { UpgradeCheckoutButton } from "@/app/components/UpgradeCheckoutButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getUserProfile,
  listInvoices,
  listSentEmailLogsByUser,
  requireUser,
} from "@/lib/db";
import {
  CURRENCY_SYMBOLS,
  computeCurrencyTotals,
  formatMoney,
  formatOffsetBadge,
  formatShortDate,
  getOffsetTone,
  getRemainingMinor,
  getTodayIsoDate,
  isInvoiceActive,
} from "@/lib/invoices";
import {
  getSentOffsetsForDueDate,
  getUpcomingScheduledStep,
  type UpcomingReminderStep,
} from "@/lib/reminders";
import { SUPPORT_EMAIL } from "@/lib/site-config";
import { InvoiceStatusBadges } from "../invoices/StatusBadges";
import { CheckoutReturnHandler } from "./CheckoutReturnHandler";

export const metadata: Metadata = {
  title: "Dashboard — PingCue",
};

function getGreetingName(displayName: string | null): string | null {
  if (!displayName) return null;
  const first = displayName.trim().split(/\s+/)[0];
  return first ? first : null;
}

function getNextStepToneClasses(offsetDays: number, isDueNow: boolean): string {
  if (isDueNow) {
    return "border-[#111111]/15 bg-[#111111] text-white";
  }
  const tone = getOffsetTone(offsetDays);
  if (tone === "Final notice") {
    return "border-[#FECDD3] bg-[#FFE4E6] text-[#9F1239]";
  }
  if (tone === "Firm") {
    return "border-[#FDE047] bg-[#FEF08A] text-[#713F12]";
  }
  return "border-[#BBF7D0] bg-[#DCFCE7] text-[#14532D]";
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

  const activeInvoices = invoices.filter(isInvoiceActive);
  const currencyTotals = computeCurrencyTotals(invoices, todayIso);
  const isFree = profile.plan === "free";
  const greetingName = getGreetingName(profile.display_name);

  const invoiceNextSteps = new Map<string, UpcomingReminderStep>();
  for (const invoice of activeInvoices) {
    const logs = sentLogsByInvoice.get(invoice.id) ?? [];
    const sentOffsets = getSentOffsetsForDueDate(logs, invoice.due_date);
    invoiceNextSteps.set(
      invoice.id,
      getUpcomingScheduledStep(invoice, sentOffsets, todayIso)
    );
  }

  const upcomingQueue = activeInvoices
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
    .sort((a, b) => a.step.scheduledDate.localeCompare(b.step.scheduledDate))
    .slice(0, 3);

  const singleCurrency = currencyTotals.length === 1;
  const queueGridClass =
    upcomingQueue.length === 1
      ? "grid grid-cols-1"
      : upcomingQueue.length === 2
        ? "grid gap-2.5 sm:grid-cols-2"
        : "grid gap-2.5 sm:grid-cols-3";

  return (
    <div className="space-y-5 md:space-y-7">
      <CheckoutReturnHandler
        isFree={isFree}
        checkoutReturn={checkoutReturn}
        checkoutFailed={checkoutFailed}
        checkoutExplicitSuccess={checkoutExplicitSuccess}
        wantsUpgrade={wantsUpgrade}
        passwordReset={passwordReset}
        supportEmail={SUPPORT_EMAIL}
      />

      {/* Page Header (no duplicate desktop CTA or duplicate plan badge) */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="font-sans text-[26px] font-semibold leading-tight tracking-[-0.03em] text-[#111111] sm:text-[32px]">
            {greetingName ? `Hey ${greetingName}` : "Dashboard"}
          </h1>
          <Badge variant={isFree ? "neutral" : "paid"} className="md:hidden">
            {isFree
              ? `Free · ${Math.min(activeInvoices.length, 1)}/1 active`
              : "Founding Pass"}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-[#52525B]">
          Balances by currency and upcoming automated pings.
        </p>
      </div>

      {/* Free Plan Upgrade Strip */}
      {isFree && (
        <div className="flex flex-col gap-3 rounded-[24px] border border-[#111111]/12 bg-[#FFF1A8] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#111111]">
              Unlock unlimited invoices &amp; 1-click WhatsApp nudges
            </p>
            <p className="mt-0.5 text-xs text-[#4B4116]">
              One-time $19 Founding Pass · No subscription · Includes V1.5
              Document Chaser for 12 months.
            </p>
          </div>
          <UpgradeCheckoutButton
            variant="compact"
            label="Upgrade — $19"
            className="w-full shrink-0 sm:w-auto"
          />
        </div>
      )}

      {/* Empty State vs Cashflow */}
      {currencyTotals.length === 0 ? (
        <div className="relative pt-8">
          <PerchedPingMascot
            sleeping={false}
            className="absolute left-6 top-0 z-10 h-[52px] w-[82px]"
          />
          <Card className="overflow-hidden p-6 pt-8 text-center sm:p-10">
            <div className="mx-auto mb-3 flex justify-center">
              <InlineEnvelopeSticker className="h-11 w-auto -rotate-[5deg]" />
            </div>
            <h2 className="font-sans text-[22px] font-semibold tracking-[-0.025em] text-[#111111] sm:text-2xl">
              Add your first unpaid invoice
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#52525B]">
              Paste your client&apos;s email, due date, and payment link once.
              PingCue handles polite follow-ups from -3d to +30d automatically.
            </p>

            <div className="mx-auto mt-6 grid max-w-lg grid-cols-1 gap-2.5 text-left sm:grid-cols-3">
              {[
                {
                  label: "Log link & due date",
                  tint: "bg-[#FFF1A8] text-[#4B4116]",
                },
                {
                  label: "Preview tone first",
                  tint: "bg-[#D9E6FF] text-[#1E335C]",
                },
                {
                  label: "Auto-stops when paid",
                  tint: "bg-[#D6F7A3] text-[#1A2E05]",
                },
              ].map((step) => (
                <div
                  key={step.label}
                  className={`rounded-2xl border border-black/[0.06] px-3.5 py-2.5 text-xs font-semibold ${step.tint}`}
                >
                  {step.label}
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/invoices/new">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>Create your first invoice</span>
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <section aria-label="Cashflow by currency" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#111111]">
              Cashflow
            </h2>
            {!singleCurrency && (
              <span className="text-xs font-medium text-[#52525B]">
                Separate totals · No FX
              </span>
            )}
          </div>

          <div
            className={
              singleCurrency ? "grid gap-4" : "grid gap-4 md:grid-cols-2"
            }
          >
            {currencyTotals.map((bucket) => {
              const upcomingMinor = Math.max(
                0,
                bucket.owedMinor - bucket.overdueMinor
              );
              const totalBilled = bucket.collectedMinor + bucket.owedMinor;
              const collectedPct =
                totalBilled > 0
                  ? Math.round((bucket.collectedMinor / totalBilled) * 100)
                  : 0;
              const overduePct =
                totalBilled > 0
                  ? Math.round((bucket.overdueMinor / totalBilled) * 100)
                  : 0;
              const upcomingPct =
                totalBilled > 0
                  ? Math.max(0, 100 - collectedPct - overduePct)
                  : 0;
              const symbol = CURRENCY_SYMBOLS[bucket.currency];

              return (
                <Card
                  key={bucket.currency}
                  className="overflow-hidden p-4 sm:p-6"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-[#111111] px-3 py-1 font-sans text-xs font-semibold text-white shadow-[0_2px_0_rgba(17,17,17,0.2)]">
                      <span>{symbol}</span>
                      <span>{bucket.currency}</span>
                    </span>

                    <div className="flex items-center gap-2 text-xs font-medium text-[#52525B] tabular-nums">
                      <span>{bucket.activeCount} active</span>
                      {bucket.overdueCount > 0 && (
                        <Badge variant="overdue">
                          {bucket.overdueCount} overdue
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div
                    className={
                      singleCurrency
                        ? "mt-4 grid gap-4 md:grid-cols-12 md:items-end md:gap-5"
                        : "mt-4 space-y-3.5"
                    }
                  >
                    <div className={singleCurrency ? "md:col-span-5" : ""}>
                      <p className="text-xs font-medium text-[#52525B]">
                        Outstanding balance
                      </p>
                      <p className="mt-1 font-mono text-[26px] font-semibold leading-none tracking-[-0.03em] text-[#111111] tabular-nums sm:text-[32px]">
                        {formatMoney(bucket.owedMinor, bucket.currency)}
                      </p>

                      {/* 3-Segment Proportional Cashflow Track */}
                      <div className="mt-3.5 space-y-1.5">
                        <div
                          aria-hidden="true"
                          className="flex h-2.5 w-full overflow-hidden rounded-full bg-[#F4F4F5]"
                        >
                          {collectedPct > 0 && (
                            <div
                              style={{ width: `${collectedPct}%` }}
                              className="h-full bg-[#22C55E] transition-all duration-300"
                            />
                          )}
                          {overduePct > 0 && (
                            <div
                              style={{ width: `${overduePct}%` }}
                              className="h-full bg-[#FB7185] transition-all duration-300"
                            />
                          )}
                          {upcomingPct > 0 && (
                            <div
                              style={{ width: `${upcomingPct}%` }}
                              className="h-full bg-[#D4D4D8] transition-all duration-300"
                            />
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-[#52525B] tabular-nums">
                          <span>{collectedPct}% collected</span>
                          <span>
                            {formatMoney(totalBilled, bucket.currency)} total
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Color-Keyed 3-Stat Breakdown */}
                    <div
                      className={
                        singleCurrency
                          ? "grid grid-cols-3 gap-2.5 rounded-2xl border border-black/[0.06] bg-[#FAFAFA] p-3 md:col-span-7 sm:p-4"
                          : "grid grid-cols-3 gap-2 rounded-2xl border border-black/[0.06] bg-[#FAFAFA] p-3"
                      }
                    >
                      <div className="min-w-0">
                        <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#52525B]">
                          <span
                            aria-hidden="true"
                            className="h-2 w-2 shrink-0 rounded-full bg-[#A1A1AA]"
                          />
                          <span>Upcoming</span>
                        </p>
                        <p className="mt-1 truncate font-mono text-sm font-semibold text-[#111111] tabular-nums sm:text-base">
                          {formatMoney(upcomingMinor, bucket.currency)}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#BE123C]">
                          <span
                            aria-hidden="true"
                            className="h-2 w-2 shrink-0 rounded-full bg-[#FB7185]"
                          />
                          <span>Overdue</span>
                        </p>
                        <p className="mt-1 truncate font-mono text-sm font-semibold text-[#BE123C] tabular-nums sm:text-base">
                          {formatMoney(bucket.overdueMinor, bucket.currency)}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#15803D]">
                          <span
                            aria-hidden="true"
                            className="h-2 w-2 shrink-0 rounded-full bg-[#22C55E]"
                          />
                          <span>Collected</span>
                        </p>
                        <p className="mt-1 truncate font-mono text-sm font-semibold text-[#15803D] tabular-nums sm:text-base">
                          {formatMoney(bucket.collectedMinor, bucket.currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Count-Aware Upcoming Automated Pings Strip */}
      {upcomingQueue.length > 0 && (
        <section
          aria-label="Upcoming automated reminders"
          className="rounded-[24px] border border-black/[0.07] bg-[#E8FACB] p-4 sm:p-5"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white text-[#111111] shadow-[0_2px_0_rgba(17,17,17,0.08)]">
                <CalendarClock className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold leading-tight text-[#111111]">
                  Next scheduled pings
                </h2>
                <p className="mt-0.5 text-[11px] font-medium text-[#28420C] tabular-nums sm:hidden">
                  Daily dispatch · 09:30 IST
                </p>
              </div>
            </div>
            <span className="hidden shrink-0 rounded-full bg-white/75 px-2.5 py-1 text-[11px] font-semibold text-[#28420C] tabular-nums sm:inline-flex">
              Daily dispatch · 09:30 IST
            </span>
          </div>

          <div className={`mt-3 ${queueGridClass}`}>
            {upcomingQueue.map(({ invoice, step }) => {
              const remaining = getRemainingMinor(
                invoice.amount_minor,
                invoice.amount_received_minor
              );
              const singleItem = upcomingQueue.length === 1;

              return (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className={
                    singleItem
                      ? "group flex min-w-0 flex-col gap-2 rounded-2xl border border-black/[0.08] bg-white px-4 py-3 shadow-[0_2px_0_rgba(17,17,17,0.06)] transition-all duration-150 hover:-translate-y-0.5 hover:border-black/20 active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] sm:flex-row sm:items-center sm:justify-between"
                      : "group flex min-w-0 items-center justify-between gap-2.5 rounded-2xl border border-black/[0.08] bg-white px-3.5 py-2.5 shadow-[0_2px_0_rgba(17,17,17,0.06)] transition-all duration-150 hover:-translate-y-0.5 hover:border-black/20 active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
                  }
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold tabular-nums ${getNextStepToneClasses(step.offsetDays, step.isDueNow)}`}
                      >
                        {step.isDueNow
                          ? `Due now · ${formatOffsetBadge(step.offsetDays)}`
                          : `${formatOffsetBadge(step.offsetDays)} · ${formatShortDate(step.scheduledDate)}`}
                      </span>
                      {singleItem && (
                        <span className="text-xs font-semibold text-[#111111]">
                          {invoice.client_name}
                        </span>
                      )}
                    </div>
                    {!singleItem && (
                      <p className="mt-1 truncate text-xs font-semibold text-[#111111]">
                        {invoice.client_name}
                      </p>
                    )}
                    <p
                      className={
                        singleItem
                          ? "mt-1 text-xs text-[#52525B] sm:mt-1.5"
                          : "truncate font-mono text-[11px] text-[#52525B] tabular-nums"
                      }
                    >
                      {singleItem ? (
                        invoice.title
                      ) : (
                        <>
                          {formatMoney(remaining, invoice.currency)} ·{" "}
                          {invoice.title}
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-2.5 sm:justify-end">
                    {singleItem && (
                      <span className="font-mono text-sm font-semibold text-[#111111] tabular-nums">
                        {formatMoney(remaining, invoice.currency)}
                      </span>
                    )}
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-[#71717A] transition-transform group-hover:translate-x-0.5 group-hover:text-[#111111]"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Active Invoices */}
      {invoices.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#111111]">
              Active invoices ({activeInvoices.length})
            </h2>
            <Link
              href="/invoices"
              className="inline-flex items-center gap-1 rounded-full border border-black/[0.07] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#111111] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-[#F4F4F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
            >
              <span>All invoices</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {activeInvoices.length === 0 ? (
            <div className="flex items-center gap-3 rounded-[24px] border border-[#BBF7D0] bg-[#DCFCE7] p-5 text-sm font-medium text-[#14532D]">
              <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>
                Every invoice is marked paid. Ready to add your next one.
              </span>
            </div>
          ) : (
            <Card className="divide-y divide-black/[0.06] overflow-hidden">
              {activeInvoices.map((invoice) => {
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
                const nextStep = invoiceNextSteps.get(invoice.id);

                return (
                  <Link
                    key={invoice.id}
                    href={`/invoices/${invoice.id}`}
                    className="group flex flex-col gap-3 p-4 transition-all duration-150 hover:bg-[#FAFAFA] active:scale-[0.995] sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4"
                  >
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="line-clamp-2 font-semibold text-[#111111] sm:line-clamp-1">
                          {invoice.title}
                        </span>
                        <InvoiceStatusBadges
                          invoice={invoice}
                          todayIso={todayIso}
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#52525B]">
                        <span className="font-medium text-[#27272A]">
                          {invoice.client_name}
                        </span>
                        <span className="tabular-nums">
                          Due {formatShortDate(invoice.due_date)}
                        </span>
                        {nextStep?.kind === "scheduled" && (
                          <span className="inline-flex items-center gap-1 font-medium text-[#111111] tabular-nums">
                            <CalendarClock
                              className="h-3 w-3 text-[#52525B]"
                              aria-hidden="true"
                            />
                            {nextStep.isDueNow
                              ? `Ping due (${formatOffsetBadge(nextStep.offsetDays)})`
                              : `Next ${formatOffsetBadge(nextStep.offsetDays)} · ${formatShortDate(nextStep.scheduledDate)}`}
                          </span>
                        )}
                        {nextStep?.kind === "paused" && (
                          <span className="inline-flex items-center gap-1 font-medium text-[#1E3A8A]">
                            <Pause className="h-3 w-3" aria-hidden="true" />
                            Paused
                          </span>
                        )}
                        {invoice.client_whatsapp && (
                          <span
                            title="WhatsApp ready"
                            className="inline-flex items-center gap-1 text-[#15803D]"
                          >
                            <MessageSquare
                              className="h-3 w-3"
                              aria-hidden="true"
                            />
                            <span className="sr-only">WhatsApp ready</span>
                          </span>
                        )}
                      </div>

                      {paidPct > 0 && (
                        <div className="flex max-w-[220px] items-center gap-2 pt-0.5">
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
                    </div>

                    <div className="flex shrink-0 items-center justify-between gap-3 border-t border-black/[0.05] pt-2.5 sm:border-t-0 sm:pt-0 sm:text-right">
                      <div className="font-mono tabular-nums">
                        <p className="text-base font-semibold text-[#111111]">
                          {formatMoney(remaining, invoice.currency)}{" "}
                          <span className="font-sans text-xs font-normal text-[#52525B]">
                            left
                          </span>
                        </p>
                        <p className="text-[11px] text-[#52525B]">
                          of {formatMoney(invoice.amount_minor, invoice.currency)}
                        </p>
                      </div>
                      <ChevronRight
                        className="h-4 w-4 text-[#71717A] transition-transform group-hover:translate-x-0.5 group-hover:text-[#111111]"
                        aria-hidden="true"
                      />
                    </div>
                  </Link>
                );
              })}
            </Card>
          )}
        </section>
      )}
    </div>
  );
}

export default function DashboardPage(props: PageProps<"/dashboard">) {
  return (
    <Suspense
      fallback={
        <div className="space-y-5">
          <div className="h-9 w-44 animate-pulse rounded-xl bg-black/[0.06]" />
          <div className="h-44 animate-pulse rounded-[24px] border border-black/[0.06] bg-white" />
          <div className="h-36 animate-pulse rounded-[24px] border border-black/[0.06] bg-white" />
        </div>
      }
    >
      <DashboardContent searchParams={props.searchParams} />
    </Suspense>
  );
}
