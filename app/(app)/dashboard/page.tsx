import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { UpgradeCheckoutButton } from "@/app/components/UpgradeCheckoutButton";
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
          className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5 text-sm text-amber-950"
        >
          Payment didn&apos;t go through. No charge was made—try another
          payment method or retry anytime.
        </div>
      )}

      {checkoutSucceeded && (
        <div
          role="status"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm text-emerald-900"
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
            <h1 className="font-display text-3xl text-slate-900">Dashboard</h1>
            <span
              className={`rounded-full border px-3 py-0.5 font-mono text-xs font-medium ${
                isFree
                  ? "border-slate-200 bg-white text-slate-700"
                  : "border-blue-200 bg-blue-50 text-blue-800"
              }`}
            >
              {isFree
                ? `Free plan · ${Math.min(activeInvoices.length, 1)}/1 active invoice`
                : "Founding Pass · Unlimited"}
            </span>
            {isFree && (
              <UpgradeCheckoutButton variant="compact" label="Upgrade — $19" />
            )}
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Amounts owed, overdue, and collected grouped by currency (no FX
            conversion).
          </p>
        </div>

        <Link
          href="/invoices/new"
          className="inline-flex items-center justify-center rounded-lg bg-[#C2410C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#9A3412] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          + New invoice
        </Link>
      </div>

      {/* Currency Totals */}
      {currencyTotals.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-2xs">
          <h2 className="font-display text-2xl text-slate-900">
            No invoices yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            Add your first client invoice—name, email, amount, due date, and
            payment link—to start your automated reminder cadence.
          </p>
          <div className="mt-6">
            <Link
              href="/invoices/new"
              className="inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Create your first invoice
            </Link>
          </div>
        </section>
      ) : (
        <section aria-label="Totals by currency" className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Totals by currency
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {currencyTotals.map((bucket) => (
              <div
                key={bucket.currency}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="font-mono text-sm font-semibold text-slate-900">
                    {bucket.currency}
                  </span>
                  <span className="text-xs text-slate-500">
                    {bucket.activeCount} active
                    {bucket.overdueCount > 0
                      ? ` · ${bucket.overdueCount} overdue`
                      : ""}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Owed</p>
                    <p className="mt-1 font-mono text-base font-semibold text-slate-900 sm:text-lg">
                      {formatMoney(bucket.owedMinor, bucket.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-red-700">Overdue</p>
                    <p className="mt-1 font-mono text-base font-semibold text-red-700 sm:text-lg">
                      {formatMoney(bucket.overdueMinor, bucket.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-emerald-700">
                      Collected
                    </p>
                    <p className="mt-1 font-mono text-base font-semibold text-emerald-700 sm:text-lg">
                      {formatMoney(bucket.collectedMinor, bucket.currency)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Active & Overdue Invoices */}
      {invoices.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Active invoices ({activeInvoices.length})
            </h2>
            <Link
              href="/invoices"
              className="text-sm font-medium text-blue-700 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
            >
              View all invoices →
            </Link>
          </div>

          {activeInvoices.length === 0 ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-sm text-emerald-900">
              Every invoice is marked paid. Ready to add your next one!
            </div>
          ) : (
            <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-2xs">
              {activeInvoices.map((invoice) => {
                const remaining = getRemainingMinor(
                  invoice.amount_minor,
                  invoice.amount_received_minor
                );
                return (
                  <Link
                    key={invoice.id}
                    href={`/invoices/${invoice.id}`}
                    className="flex flex-col gap-3 p-4 transition-colors hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-semibold text-slate-900">
                          {invoice.title}
                        </span>
                        <InvoiceStatusBadges
                          invoice={invoice}
                          todayIso={todayIso}
                        />
                      </div>
                      <p className="text-xs text-slate-500">
                        {invoice.client_name} · {invoice.client_email} · Due{" "}
                        {formatShortDate(invoice.due_date)}
                      </p>
                    </div>

                    <div className="shrink-0 text-left sm:text-right">
                      <p className="font-mono text-base font-semibold text-slate-900">
                        {formatMoney(remaining, invoice.currency)}{" "}
                        <span className="text-xs font-normal text-slate-500">
                          left
                        </span>
                      </p>
                      <p className="font-mono text-xs text-slate-500">
                        of {formatMoney(invoice.amount_minor, invoice.currency)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
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
          <div className="h-9 w-48 animate-pulse rounded-lg bg-slate-200" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-36 animate-pulse rounded-2xl bg-white border border-slate-200" />
            <div className="h-36 animate-pulse rounded-2xl bg-white border border-slate-200" />
          </div>
        </div>
      }
    >
      <DashboardContent searchParams={props.searchParams} />
    </Suspense>
  );
}
