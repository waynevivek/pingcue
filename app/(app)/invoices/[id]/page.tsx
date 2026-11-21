import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getInvoiceById,
  getUserProfile,
  listReminderLogs,
  requireUser,
} from "@/lib/db";
import {
  addDaysIso,
  formatMoney,
  formatOffsetBadge,
  formatShortDate,
  getOffsetTone,
  getRemainingMinor,
  getTodayIsoDate,
  isInvoiceActive,
  isInvoicePaused,
  minorToMajorInput,
} from "@/lib/invoices";
import { buildWhatsappNudge, getNextReminderOffset } from "@/lib/reminders";
import { pauseInvoiceAction, recordPaymentAction } from "../actions";
import { DeleteInvoiceButton } from "../DeleteInvoiceButton";
import { InvoiceForm } from "../InvoiceForm";
import { SendTestEmailButton } from "../SendTestEmailButton";
import { InvoiceStatusBadges } from "../StatusBadges";

export const metadata: Metadata = {
  title: "Invoice details — PingCue",
};

function formatSentTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

async function InvoiceDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireUser();
  const { id } = await params;
  const todayIso = getTodayIsoDate();

  const [invoice, profile, logs] = await Promise.all([
    getInvoiceById(user.id, id),
    getUserProfile(user.id, user.email ?? ""),
    listReminderLogs(user.id, id),
  ]);

  if (!invoice) {
    notFound();
  }

  const remainingMinor = getRemainingMinor(
    invoice.amount_minor,
    invoice.amount_received_minor
  );
  const active = isInvoiceActive(invoice);
  const paused = isInvoicePaused(invoice, todayIso);
  const sentEmailOffsets = new Set(
    logs.filter((log) => log.channel === "email").map((log) => log.offset_days)
  );
  const nextOffset = getNextReminderOffset(invoice, sentEmailOffsets, todayIso);
  const whatsapp = buildWhatsappNudge({ invoice, offsetDays: nextOffset });
  const isFoundingPass = profile.plan === "founding_pass";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Link
            href="/invoices"
            className="text-sm font-medium text-blue-700 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
          >
            ← Back to invoices
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl text-slate-900">
              {invoice.title}
            </h1>
            <InvoiceStatusBadges invoice={invoice} todayIso={todayIso} />
          </div>
          <p className="text-sm text-slate-600">
            {invoice.client_name} · {invoice.client_email}
            {invoice.client_whatsapp ? ` · WhatsApp ${invoice.client_whatsapp}` : ""}
            {" · "}Due {formatShortDate(invoice.due_date)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-left shadow-2xs sm:text-right">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Remaining balance
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold text-slate-900">
            {formatMoney(remainingMinor, invoice.currency)}
          </p>
          <p className="font-mono text-xs text-slate-500">
            {formatMoney(invoice.amount_received_minor, invoice.currency)} of{" "}
            {formatMoney(invoice.amount_minor, invoice.currency)} received
          </p>
        </div>
      </div>

      {/* Quick Actions Row: Payment & Pause */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Progress */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
          <h2 className="text-base font-semibold text-slate-900">
            Payment progress
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Update amount received manually. Reminders chase only the remaining
            balance and stop automatically once paid.
          </p>

          <form
            action={recordPaymentAction.bind(null, invoice.id)}
            className="mt-4 flex flex-wrap items-end gap-3"
          >
            <div className="min-w-[160px] flex-1">
              <label
                htmlFor="quick-amount-received"
                className="block text-xs font-medium text-slate-700"
              >
                Total received ({invoice.currency})
              </label>
              <input
                id="quick-amount-received"
                name="amount_received"
                type="text"
                inputMode="decimal"
                defaultValue={minorToMajorInput(invoice.amount_received_minor)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
            >
              Save payment
            </button>
          </form>

          {active && (
            <form
              action={recordPaymentAction.bind(null, invoice.id)}
              className="mt-3"
            >
              <input type="hidden" name="mark_full" value="1" />
              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 cursor-pointer"
              >
                Mark fully paid ({formatMoney(invoice.amount_minor, invoice.currency)})
              </button>
            </form>
          )}
        </section>

        {/* Pause Reminders */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
          <h2 className="text-base font-semibold text-slate-900">
            Pause reminders
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            {paused && invoice.paused_until
              ? `Reminders are paused through ${formatShortDate(invoice.paused_until)}.`
              : "Client promised to pay on a specific date? Pause automated sends until then."}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <form action={pauseInvoiceAction.bind(null, invoice.id)}>
              <input type="hidden" name="mode" value="plus7" />
              <button
                type="submit"
                className="rounded-lg bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
              >
                Pause 7 days
              </button>
            </form>

            {paused && (
              <form action={pauseInvoiceAction.bind(null, invoice.id)}>
                <input type="hidden" name="mode" value="resume" />
                <button
                  type="submit"
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
                >
                  Resume reminders
                </button>
              </form>
            )}
          </div>

          <form
            action={pauseInvoiceAction.bind(null, invoice.id)}
            className="mt-4 flex flex-wrap items-end gap-2.5"
          >
            <input type="hidden" name="mode" value="date" />
            <div className="min-w-[160px] flex-1">
              <label
                htmlFor="quick-paused-until"
                className="block text-xs font-medium text-slate-700"
              >
                Or pause until date
              </label>
              <input
                id="quick-paused-until"
                name="paused_until"
                type="date"
                required
                defaultValue={invoice.paused_until ?? addDaysIso(todayIso, 7)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
            >
              Set pause date
            </button>
          </form>
        </section>
      </div>

      {/* Send Test Email & Zero-API WhatsApp Nudge */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Send Test Email */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900">
              Preview email in your inbox
            </h2>
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 font-mono text-xs font-medium text-blue-800">
              Next: {formatOffsetBadge(nextOffset)} · {getOffsetTone(nextOffset)}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
            Sends the next reminder email to{" "}
            <span className="font-mono text-slate-800">{user.email}</span> (with{" "}
            <code className="font-mono">Reply-To</code> set to you) so you can
            check tone and formatting before anything goes to your client.
          </p>

          <div className="mt-4">
            <SendTestEmailButton invoiceId={invoice.id} />
          </div>
        </section>

        {/* Zero-API WhatsApp Nudge */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900">
              Send on WhatsApp
            </h2>
            <span
              className={`rounded-full border px-2.5 py-0.5 font-mono text-xs font-medium ${
                isFoundingPass
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              {isFoundingPass ? "Zero-API wa.me" : "Founding Pass"}
            </span>
          </div>

          {isFoundingPass ? (
            <>
              <p className="mt-1.5 text-xs text-slate-600">
                Opens WhatsApp with a prefilled {getOffsetTone(nextOffset).toLowerCase()}{" "}
                nudge and remaining balance—zero WhatsApp API setup required.
              </p>
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
                {whatsapp.message}
              </div>
              <div className="mt-4">
                {!active ? (
                  <p className="text-xs font-medium text-emerald-800">
                    Invoice is marked paid—no WhatsApp nudge needed.
                  </p>
                ) : whatsapp.waUrl ? (
                  <a
                    href={whatsapp.waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      fill="none"
                      className="h-4 w-4 shrink-0"
                    >
                      <path
                        d="M17 9.75a7 7 0 0 1-10.3 6.18L3 17l1.2-4.15A7 7 0 1 1 17 9.75Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Send on WhatsApp ↗</span>
                  </a>
                ) : (
                  <p className="text-xs text-slate-600">
                    Add a client WhatsApp number in the Edit form below (e.g.{" "}
                    <span className="font-mono">919876543210</span>) to enable
                    1-click WhatsApp nudges.
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="mt-1.5 text-xs text-slate-600">
                Your polite WhatsApp message for {invoice.client_name} is ready
                to send in 1 click—unlock with the one-time Founding Pass.
              </p>
              <div className="relative mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
                <span>{whatsapp.teaserLine} </span>
                {whatsapp.blurredRemainder && (
                  <span
                    aria-hidden="true"
                    className="select-none blur-[4px] text-slate-500"
                  >
                    {whatsapp.blurredRemainder}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <Link
                  href="/#pricing"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C2410C] px-4 py-2.5 text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-[#9A3412] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-4 w-4 shrink-0"
                  >
                    <path
                      d="M6.5 9V6.75a3.5 3.5 0 1 1 7 0V9m-8 0h9a1.5 1.5 0 0 1 1.5 1.5v5A1.5 1.5 0 0 1 14.5 17h-9A1.5 1.5 0 0 1 4 15.5v-5A1.5 1.5 0 0 1 5.5 9Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Unlock WhatsApp nudges — $19 one-time</span>
                </Link>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Computed Reminder Schedule */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Computed reminder schedule
            </h2>
            <p className="mt-0.5 text-xs text-slate-600">
              Daily cron runs at 04:00 UTC (09:30 IST), sending each unpaused
              step once with your email set as Reply-To.
            </p>
          </div>
          {invoice.payment_link && (
            <a
              href={invoice.payment_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-blue-700 underline hover:text-blue-800"
            >
              Open payment link ↗
            </a>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {invoice.reminder_offsets.map((offset) => {
            const scheduledIso = addDaysIso(invoice.due_date, offset);
            const tone = getOffsetTone(offset);
            const wasSent = sentEmailOffsets.has(offset);
            const toneClasses = wasSent
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : tone === "Friendly"
                ? "border-blue-200 bg-blue-50 text-blue-800"
                : tone === "Firm"
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-red-200 bg-red-50 text-red-700";

            return (
              <div
                key={offset}
                className={`rounded-xl border p-3 ${
                  wasSent
                    ? "border-emerald-200 bg-emerald-50/40"
                    : "border-slate-200 bg-slate-50/60"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-xs font-semibold text-slate-900">
                    {formatOffsetBadge(offset)}
                  </span>
                  <span
                    className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${toneClasses}`}
                  >
                    {wasSent ? "Sent" : tone}
                  </span>
                </div>
                <p className="mt-2 font-mono text-xs text-slate-600">
                  {formatShortDate(scheduledIso)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Reminder Activity Log */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <h2 className="text-base font-semibold text-slate-900">
          Reminder history ({logs.length})
        </h2>

        {logs.length === 0 ? (
          <p className="mt-2 text-xs text-slate-600">
            No emails sent for this invoice yet. Click &ldquo;Send test email to
            me&rdquo; above to preview how your reminder looks in your inbox.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200 text-xs">
            {logs.map((log) => (
              <li
                key={log.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2.5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono font-semibold text-slate-800">
                    {formatOffsetBadge(log.offset_days)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium ${
                      log.channel === "email"
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-blue-50 text-blue-800"
                    }`}
                  >
                    {log.channel === "email" ? "Scheduled email" : "Test email"}
                  </span>
                  <span className="text-slate-600">to {log.recipient_email}</span>
                </div>
                <span className="font-mono text-slate-500">
                  {formatSentTimestamp(log.sent_at)} UTC
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Edit Invoice Form */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs sm:p-8">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">
          Edit invoice details
        </h2>
        <InvoiceForm mode="edit" invoice={invoice} />
      </section>

      {/* Danger Zone */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-red-200/80 bg-white p-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Delete invoice
          </h2>
          <p className="text-xs text-slate-600">
            Permanently removes this invoice and its reminder logs.
          </p>
        </div>
        <DeleteInvoiceButton invoiceId={invoice.id} />
      </section>
    </div>
  );
}

export default function InvoiceDetailPage(props: PageProps<"/invoices/[id]">) {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-200" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            <div className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          </div>
        </div>
      }
    >
      <InvoiceDetailContent params={props.params} />
    </Suspense>
  );
}
