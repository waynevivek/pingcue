import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { InlineEnvelopeSticker } from "@/app/components/HeroStickers";
import { UpgradeCheckoutButton } from "@/app/components/UpgradeCheckoutButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getUserProfile, listInvoices, requireUser } from "@/lib/db";
import {
  computeCurrencyTotals,
  formatMoney,
  formatShortDate,
  getRemainingMinor,
  getTodayIsoDate,
  isInvoiceActive,
} from "@/lib/invoices";
import { InvoiceStatusBadges } from "../invoices/StatusBadges";

export const metadata: Metadata = {
  title: "Dashboard — PingCue",
};

async function DashboardContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user } = await requireUser();
  const todayIso = getTodayIsoDate();

  const [resolvedParams, profile, invoices] = await Promise.all([
    searchParams,
    getUserProfile(user.id, user.email ?? ""),
    listInvoices(user.id),
  ]);

  const statusParam = Array.isArray(resolvedParams.status)
    ? resolvedParams.status[0]
    : resolvedParams.status;
  const checkoutParam = Array.isArray(resolvedParams.checkout)
    ? resolvedParams.checkout[0]
    : resolvedParams.checkout;
  const checkoutFailed =
    Boolean(checkoutParam) &&
    (statusParam === "failed" || statusParam === "cancelled");
  const checkoutSucceeded =
    Boolean(checkoutParam) &&
    !checkoutFailed &&
    (statusParam === "succeeded" || statusParam === "success");
  const activeInvoices = invoices.filter(isInvoiceActive);
  const currencyTotals = computeCurrencyTotals(invoices, todayIso);
  const isFree = profile.plan === "free";

  return (
    <div className="space-y-8">
      {checkoutFailed && (
        <div
          role="alert"
          className="rounded-2xl border border-[#FDE047] bg-[#FEF9C3] px-5 py-3.5 text-sm text-[#713F12]"
        >
          Payment didn&apos;t go through. No charge was made—try another
          payment method or retry anytime.
        </div>
      )}

      {checkoutSucceeded && (
        <div
          role="status"
          className="rounded-2xl border border-[#BBF7D0] bg-[#DCFCE7] px-5 py-3.5 text-sm text-[#14532D]"
        >
          {isFree
            ? "Payment received! Your Founding Pass is unlocking—refresh in a moment if your plan badge still shows Free."
            : "Founding Pass unlocked! Unlimited active invoices and 1-click WhatsApp nudges are now active."}
        </div>
      )}

      {/* Header row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-sans text-[28px] font-semibold tracking-[-0.03em] text-[#111111] sm:text-[32px]">
              Dashboard
            </h1>
            <Badge variant={isFree ? "neutral" : "paid"}>
              {isFree
                ? `Free plan · ${Math.min(activeInvoices.length, 1)}/1 active invoice`
                : "Founding Pass · Unlimited"}
            </Badge>
            {isFree && (
              <UpgradeCheckoutButton variant="compact" label="Upgrade — $19" />
            )}
          </div>
          <p className="mt-1 text-sm text-[#52525B]">
            Amounts owed, overdue, and collected grouped by currency (no FX
            conversion).
          </p>
        </div>

        <Button asChild>
          <Link href="/invoices/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>New invoice</span>
          </Link>
        </Button>
      </div>

      {/* Currency Totals */}
      {currencyTotals.length === 0 ? (
        <Card className="p-8 text-center sm:p-10">
          <div className="mx-auto mb-4 flex justify-center">
            <InlineEnvelopeSticker className="h-12 w-auto -rotate-[5deg]" />
          </div>
          <h2 className="font-sans text-2xl font-semibold tracking-[-0.025em] text-[#111111]">
            No invoices yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#52525B]">
            Add your first client invoice—name, email, amount, due date, and
            payment link—to start your automated reminder cadence.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/invoices/new">Create your first invoice</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <section aria-label="Totals by currency" className="space-y-4">
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#111111]">
            Totals by currency
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {currencyTotals.map((bucket) => (
              <Card key={bucket.currency} className="p-5 sm:p-6">
                <div className="flex items-center justify-between border-b border-black/[0.06] pb-3.5">
                  <span className="inline-flex items-center rounded-full bg-[#F4F4F5] px-3 py-1 font-sans text-xs font-bold tracking-wide text-[#111111]">
                    {bucket.currency}
                  </span>
                  <span className="font-sans text-xs font-medium text-[#52525B] tabular-nums">
                    {bucket.activeCount} active
                    {bucket.overdueCount > 0
                      ? ` · ${bucket.overdueCount} overdue`
                      : ""}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs font-medium text-[#52525B]">Owed</p>
                    <p className="mt-1 font-mono text-base font-semibold text-[#111111] tabular-nums sm:text-lg">
                      {formatMoney(bucket.owedMinor, bucket.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#BE123C]">
                      Overdue
                    </p>
                    <p className="mt-1 font-mono text-base font-semibold text-[#BE123C] tabular-nums sm:text-lg">
                      {formatMoney(bucket.overdueMinor, bucket.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#15803D]">
                      Collected
                    </p>
                    <p className="mt-1 font-mono text-base font-semibold text-[#15803D] tabular-nums sm:text-lg">
                      {formatMoney(bucket.collectedMinor, bucket.currency)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Active & Overdue Invoices */}
      {invoices.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#111111]">
              Active invoices ({activeInvoices.length})
            </h2>
            <Link
              href="/invoices"
              className="inline-flex items-center gap-1 rounded-full bg-[#F4F4F5] px-3.5 py-1.5 text-xs font-semibold text-[#111111] transition-colors hover:bg-[#EAEAEF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
            >
              <span>View all invoices</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {activeInvoices.length === 0 ? (
            <div className="rounded-[24px] border border-[#BBF7D0] bg-[#DCFCE7] p-6 text-sm font-medium text-[#14532D]">
              Every invoice is marked paid. Ready to add your next one.
            </div>
          ) : (
            <Card className="divide-y divide-black/[0.06] overflow-hidden">
              {activeInvoices.map((invoice) => {
                const remaining = getRemainingMinor(
                  invoice.amount_minor,
                  invoice.amount_received_minor
                );
                return (
                  <Link
                    key={invoice.id}
                    href={`/invoices/${invoice.id}`}
                    className="flex flex-col gap-3 p-4 transition-colors hover:bg-[#FAFAFA] sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-semibold text-[#111111]">
                          {invoice.title}
                        </span>
                        <InvoiceStatusBadges
                          invoice={invoice}
                          todayIso={todayIso}
                        />
                      </div>
                      <p className="text-xs text-[#52525B]">
                        {invoice.client_name} · {invoice.client_email} · Due{" "}
                        {formatShortDate(invoice.due_date)}
                      </p>
                    </div>

                    <div className="shrink-0 text-left sm:text-right">
                      <p className="font-mono text-base font-semibold text-[#111111] tabular-nums">
                        {formatMoney(remaining, invoice.currency)}{" "}
                        <span className="font-sans text-xs font-normal text-[#52525B]">
                          left
                        </span>
                      </p>
                      <p className="font-mono text-xs text-[#52525B] tabular-nums">
                        of {formatMoney(invoice.amount_minor, invoice.currency)}
                      </p>
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
        <div className="space-y-4">
          <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-36 animate-pulse rounded-xl border border-border bg-card" />
            <div className="h-36 animate-pulse rounded-xl border border-border bg-card" />
          </div>
        </div>
      }
    >
      <DashboardContent searchParams={props.searchParams} />
    </Suspense>
  );
}
