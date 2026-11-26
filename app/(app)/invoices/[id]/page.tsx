import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Mail,
  MessageSquare,
  Pause,
  Wallet,
} from "lucide-react";
import {
  PaidStampSticker,
  PaperPlaneSticker,
} from "@/app/components/HeroStickers";
import { UpgradeCheckoutButton } from "@/app/components/UpgradeCheckoutButton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getInvoiceById,
  getUserProfile,
  isEmailSuppressed,
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
import {
  buildReminderEmail,
  buildWhatsappNudge,
  getNextReminderOffset,
  getSentOffsetsForDueDate,
  type ReminderLog,
} from "@/lib/reminders";
import { DaylightStage } from "../../DaylightStage";
import { pauseInvoiceAction, recordPaymentAction } from "../actions";
import { CollapsibleSection } from "../CollapsibleSection";
import { DeleteInvoiceButton } from "../DeleteInvoiceButton";
import {
  InlineEmailPreview,
  type InlineEmailPreviewStep,
} from "../InlineEmailPreview";
import { InvoiceForm } from "../InvoiceForm";
import { LocalTimestamp } from "../LocalTimestamp";
import { SendNowButton } from "../SendNowButton";
import { SendTestEmailButton } from "../SendTestEmailButton";
import { InvoiceStatusBadges } from "../StatusBadges";
import { SubmitButton } from "../SubmitButton";
import { WhatsappNudgeActions } from "../WhatsappNudgeActions";

export const metadata: Metadata = {
  title: "Invoice details — PingCue",
};

const ACTION_NOTICES: Record<string, string> = {
  payment_saved: "Payment progress updated.",
  marked_paid: "Invoice marked fully paid—automated reminders stopped.",
  paused: "Automated reminders paused.",
  resumed: "Automated reminders resumed.",
};

function formatDayMonth(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

function getDeliveryBadge(
  status: ReminderLog["delivery_status"]
): { label: string; variant: "neutral" | "paid" | "overdue" } {
  switch (status) {
    case "delivered":
      return { label: "Delivered", variant: "paid" };
    case "bounced":
      return { label: "Bounced", variant: "overdue" };
    case "complained":
      return { label: "Spam complaint", variant: "overdue" };
    default:
      return { label: "Sent", variant: "neutral" };
  }
}

async function InvoiceDetailContent({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user } = await requireUser();
  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const { id } = resolvedParams;
  const rawActionError = Array.isArray(resolvedSearchParams.actionError)
    ? resolvedSearchParams.actionError[0]
    : resolvedSearchParams.actionError;
  const rawActionNotice = Array.isArray(resolvedSearchParams.actionNotice)
    ? resolvedSearchParams.actionNotice[0]
    : resolvedSearchParams.actionNotice;
  const actionNoticeMessage = rawActionNotice
    ? ACTION_NOTICES[rawActionNotice]
    : undefined;
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
  const paidPct =
    invoice.amount_minor > 0
      ? Math.min(
          100,
          Math.round((invoice.amount_received_minor / invoice.amount_minor) * 100)
        )
      : 0;
  const active = isInvoiceActive(invoice);
  const clientEmailSuppressed = active
    ? await isEmailSuppressed(invoice.client_email)
    : false;
  const paused = isInvoicePaused(invoice, todayIso);
  const sentEmailOffsets = getSentOffsetsForDueDate(logs, invoice.due_date);
  const nextOffset = getNextReminderOffset(invoice, sentEmailOffsets, todayIso);
  const isFoundingPass = profile.plan === "founding_pass";
  const whatsapp = buildWhatsappNudge({
    invoice,
    offsetDays: nextOffset,
    isUnlocked: isFoundingPass,
  });
  const replyToEmail = profile.email || user.email || "";
  const previewSteps: InlineEmailPreviewStep[] = [...invoice.reminder_offsets]
    .sort((a, b) => a - b)
    .map((offset) => {
      const scheduledIso = addDaysIso(invoice.due_date, offset);
      const generated = buildReminderEmail({
        invoice,
        offsetDays: offset,
        freelancerEmail: replyToEmail,
        freelancerName: profile.display_name,
        isTest: false,
      });
      return {
        offset,
        offsetBadge: formatOffsetBadge(offset),
        toneLabel: getOffsetTone(offset),
        scheduledDate: formatShortDate(scheduledIso),
        shortDate: formatDayMonth(scheduledIso),
        wasSent: sentEmailOffsets.has(offset),
        subject: generated.subject,
        text: generated.text,
      };
    });

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#111111] shadow-[0_2px_0_rgba(17,17,17,0.06)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#FAFAFA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Invoices</span>
        </Link>

        {invoice.payment_link && (
          <a
            href={invoice.payment_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#111111] shadow-[0_2px_0_rgba(17,17,17,0.06)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#FAFAFA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
          >
            <span>Payment link</span>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        )}
      </div>

      {actionNoticeMessage && (
        <div
          role="status"
          className="rounded-2xl border border-[#BBF7D0] bg-[#DCFCE7] px-4 py-3 text-sm font-medium text-[#14532D]"
        >
          {actionNoticeMessage}
        </div>
      )}

      {rawActionError && (
        <div
          role="alert"
          className="rounded-2xl border border-[#FECDD3] bg-[#FFE4E6] px-4 py-3 text-sm font-medium text-[#9F1239]"
        >
          {rawActionError}
        </div>
      )}

      {clientEmailSuppressed && (
        <div
          role="alert"
          className="rounded-2xl border border-[#FECDD3] bg-[#FFE4E6] px-4 py-3.5 text-sm text-[#9F1239]"
        >
          <p className="font-semibold">
            Automated emails are paused for {invoice.client_email}
          </p>
          <p className="mt-1 text-xs leading-relaxed">
            An earlier email to this address bounced or was marked as spam, so
            PingCue won&apos;t send further email reminders to protect
            deliverability. Fix any typo in Edit invoice below, or follow up on
            WhatsApp instead.
          </p>
        </div>
      )}

      {/* Sky-and-Meadow Framed Balance Hero Card */}
      <DaylightStage mascot sleeping={paused || !active}>
        <div
          className={`relative rounded-[22px] border-2 border-white/90 p-4 pt-5 shadow-[0_20px_50px_-16px_rgba(15,23,42,0.2)] sm:p-5 sm:pt-6 ${
            active ? "bg-[#FFF1A8]" : "bg-[#D6F7A3]"
          }`}
        >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-sans text-[22px] font-semibold leading-tight tracking-[-0.03em] text-[#111111] sm:text-[26px]">
                    {invoice.title}
                  </h1>
                  <InvoiceStatusBadges invoice={invoice} todayIso={todayIso} />
                </div>

                <div
                  className={`space-y-1.5 text-xs font-medium ${
                    active ? "text-[#4B4116]" : "text-[#1A2E05]"
                  }`}
                >
                  <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="font-semibold text-[#111111]">
                      {invoice.client_name}
                    </span>
                    <span className="break-words">{invoice.client_email}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-2.5 py-0.5 font-medium text-[#111111] tabular-nums shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                      <Calendar
                        className="h-3 w-3 text-[#52525B]"
                        aria-hidden="true"
                      />
                      <span>Due {formatShortDate(invoice.due_date)}</span>
                    </span>
                    {invoice.client_whatsapp && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-2.5 py-0.5 font-mono text-[11px] font-medium text-[#111111] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                        <MessageSquare
                          className="h-3 w-3 text-[#15803D]"
                          aria-hidden="true"
                        />
                        <span>{invoice.client_whatsapp}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center justify-between gap-3 md:flex-col md:items-end md:text-right">
                <div>
                  <p
                    className={`text-xs font-medium ${
                      active ? "text-[#4B4116]" : "text-[#1A2E05]"
                    }`}
                  >
                    {active ? "Remaining balance" : "Settled in full"}
                  </p>
                  <p className="mt-1 font-mono text-[28px] font-bold leading-none tracking-[-0.03em] text-[#111111] tabular-nums sm:text-[32px]">
                    {formatMoney(
                      active ? remainingMinor : invoice.amount_minor,
                      invoice.currency
                    )}
                  </p>
                  <p
                    className={`mt-1 font-mono text-xs tabular-nums ${
                      active ? "text-[#4B4116]" : "text-[#1A2E05]"
                    }`}
                  >
                    {formatMoney(
                      invoice.amount_received_minor,
                      invoice.currency
                    )}{" "}
                    of {formatMoney(invoice.amount_minor, invoice.currency)}{" "}
                    received
                  </p>
                </div>

                {!active && (
                  <PaidStampSticker className="h-12 w-14 rotate-[8deg] shrink-0" />
                )}
              </div>
            </div>

            {/* Settlement Progress Track */}
            <div className="mt-5 space-y-1.5">
              <div
                aria-hidden="true"
                className="h-2.5 w-full overflow-hidden rounded-full bg-white/85 p-0.5"
              >
                <div
                  style={{ width: `${paidPct}%` }}
                  className={`h-full rounded-full transition-all duration-300 ${
                    active ? "bg-[#111111]" : "bg-[#16A34A]"
                  }`}
                />
              </div>
              <div
                className={`flex flex-wrap items-center justify-between gap-2 text-xs font-semibold tabular-nums ${
                  active ? "text-[#4B4116]" : "text-[#1A2E05]"
                }`}
              >
                <span>{paidPct}% paid</span>
                <span>
                  {active
                    ? paused && invoice.paused_until
                      ? `Quiet until ${formatShortDate(invoice.paused_until)}`
                      : `Next step: ${formatOffsetBadge(nextOffset)} (${getOffsetTone(nextOffset)})`
                    : "All automated reminders stopped"}
                </span>
              </div>
            </div>
        </div>
      </DaylightStage>

      {/* Quick Controls: Payment (White Crisp Card) & Pause (Soft Coral Bento matching Landing Bento 2) */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        {/* Payment Progress */}
        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl border border-black/[0.08] bg-[#FFF1A8] text-[#111111]">
              <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <h2 className="text-base font-semibold text-[#111111]">
              Payment progress
            </h2>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-[#52525B]">
            Log partial payments anytime. Future reminders chase only the
            remaining balance and stop once settled.
          </p>

          <form
            action={recordPaymentAction.bind(null, invoice.id)}
            className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-end"
          >
            <div className="min-w-0 flex-1">
              <Label htmlFor="quick-amount-received" className="text-xs">
                Total received ({invoice.currency})
              </Label>
              <Input
                id="quick-amount-received"
                name="amount_received"
                type="text"
                inputMode="decimal"
                defaultValue={minorToMajorInput(invoice.amount_received_minor)}
                className="mt-1.5 h-10 font-mono"
              />
            </div>
            <SubmitButton
              variant="outline"
              pendingLabel="Saving..."
              className="w-full shadow-[0_2px_0_rgba(17,17,17,0.08)] active:translate-y-[1px] active:shadow-none sm:w-auto"
            >
              Save payment
            </SubmitButton>
          </form>

          {active && (
            <form
              action={recordPaymentAction.bind(null, invoice.id)}
              className="mt-3"
            >
              <input type="hidden" name="mark_full" value="1" />
              <SubmitButton
                variant="success"
                pendingLabel="Marking paid..."
                className="w-full shadow-[0_3px_0_rgba(17,17,17,0.16)] active:translate-y-[1px] active:shadow-none"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <span>
                  Mark fully paid (
                  {formatMoney(invoice.amount_minor, invoice.currency)})
                </span>
              </SubmitButton>
            </form>
          )}
        </Card>

        {/* Soft Coral Pause Reminders Bento (matching Landing Bento 2) */}
        <div className="rounded-[24px] border border-black/[0.06] bg-[#FFD7DC] p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl border border-black/10 bg-white text-[#111111] shadow-[0_2px_0_rgba(17,17,17,0.08)]">
              <Pause className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <h2 className="text-base font-semibold text-[#111111]">
              Pause reminders
            </h2>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-[#5C232B]">
            {paused && invoice.paused_until
              ? `Reminders are paused through ${formatShortDate(invoice.paused_until)}.`
              : "Client promised to pay later? Pause automated sends until that date."}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <form action={pauseInvoiceAction.bind(null, invoice.id)}>
              <input type="hidden" name="mode" value="plus7" />
              <SubmitButton
                size="sm"
                pendingLabel="Pausing..."
                className="shadow-[0_3px_0_rgba(17,17,17,0.28)] active:translate-y-[1px] active:shadow-none"
              >
                Pause 7 days
              </SubmitButton>
            </form>

            {paused && (
              <form action={pauseInvoiceAction.bind(null, invoice.id)}>
                <input type="hidden" name="mode" value="resume" />
                <SubmitButton
                  variant="outline"
                  size="sm"
                  pendingLabel="Resuming..."
                  className="bg-white shadow-[0_3px_0_rgba(17,17,17,0.1)] active:translate-y-[1px] active:shadow-none"
                >
                  Resume reminders
                </SubmitButton>
              </form>
            )}
          </div>

          <form
            action={pauseInvoiceAction.bind(null, invoice.id)}
            className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-end"
          >
            <input type="hidden" name="mode" value="date" />
            <div className="min-w-0 flex-1">
              <Label
                htmlFor="quick-paused-until"
                className="text-xs text-[#5C232B]"
              >
                Or pause until date
              </Label>
              <Input
                id="quick-paused-until"
                name="paused_until"
                type="date"
                required
                defaultValue={invoice.paused_until ?? addDaysIso(todayIso, 7)}
                className="mt-1.5 h-10 border-black/10 bg-white font-mono"
              />
            </div>
            <SubmitButton
              variant="outline"
              pendingLabel="Updating..."
              className="w-full bg-white shadow-[0_3px_0_rgba(17,17,17,0.1)] active:translate-y-[1px] active:shadow-none sm:w-auto"
            >
              Set pause date
            </SubmitButton>
          </form>
        </div>
      </div>

      {/* Unified Cadence Timeline + Live Email Preview + Test/Send Now */}
      <Card className="p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl border border-black/[0.08] bg-[#D9E6FF] text-[#111111]">
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <h2 className="text-base font-semibold text-[#111111]">
              Schedule &amp; email preview
            </h2>
          </div>
          <Badge variant="primary">
            Next: {formatOffsetBadge(nextOffset)} · {getOffsetTone(nextOffset)}
          </Badge>
        </div>

        <InlineEmailPreview
          steps={previewSteps}
          defaultOffset={nextOffset}
          clientEmail={invoice.client_email}
          replyTo={replyToEmail}
          paused={paused}
          pausedUntilFormatted={
            invoice.paused_until ? formatShortDate(invoice.paused_until) : null
          }
        />

        <div className="mt-4 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <SendTestEmailButton invoiceId={invoice.id} />
            <p className="text-xs text-[#52525B]">
              Test sends to{" "}
              <span className="font-mono text-[#111111]">{user.email}</span>{" "}
              only.
            </p>
          </div>

          {active &&
            !clientEmailSuppressed &&
            !sentEmailOffsets.has(nextOffset) && (
              <SendNowButton
                invoiceId={invoice.id}
                clientEmail={invoice.client_email}
                offsetLabel={formatOffsetBadge(nextOffset)}
                toneLabel={getOffsetTone(nextOffset)}
              />
            )}
        </div>
      </Card>

      {/* Mint-Lime WhatsApp Nudge Bento + Periwinkle Reminder History Tray */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        {/* Mint-Lime Zero-API WhatsApp Nudge (matching Landing Bento 3) */}
        <div className="rounded-[24px] border border-black/[0.06] bg-[#D6F7A3] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl border border-black/10 bg-white text-[#14532D] shadow-[0_2px_0_rgba(17,17,17,0.08)]">
                <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-[#111111]">
                  Send on WhatsApp
                </h2>
                <span className="text-[11px] font-semibold text-[#28420C]">
                  {isFoundingPass ? "Zero-API wa.me" : "Founding Pass"}
                </span>
              </div>
            </div>
            <PaperPlaneSticker className="h-10 w-12 shrink-0 rotate-[6deg]" />
          </div>

          {isFoundingPass ? (
            <>
              <p className="mt-2.5 text-xs leading-relaxed text-[#28420C]">
                Opens WhatsApp with a prefilled{" "}
                {getOffsetTone(nextOffset).toLowerCase()} nudge and remaining
                balance—no WhatsApp API needed.
              </p>
              <div className="mt-3 rounded-2xl border border-black/[0.08] bg-white p-3.5 text-xs leading-relaxed text-[#111111] shadow-[0_4px_14px_-6px_rgba(17,24,39,0.12)]">
                {whatsapp.message}
              </div>
              <WhatsappNudgeActions
                invoiceId={invoice.id}
                offsetDays={nextOffset}
                message={whatsapp.message}
                waUrl={whatsapp.waUrl}
                active={active}
              />
            </>
          ) : (
            <>
              <p className="mt-2.5 text-xs leading-relaxed text-[#28420C]">
                Your polite WhatsApp message for {invoice.client_name} is ready
                to send in 1 tap—unlock with the one-time Founding Pass.
              </p>
              <div className="relative mt-3 overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-3.5 text-xs leading-relaxed text-[#111111] shadow-[0_4px_14px_-6px_rgba(17,24,39,0.12)]">
                <span>{whatsapp.teaserLine} </span>
                {whatsapp.blurredRemainder && (
                  <span
                    aria-hidden="true"
                    className="select-none text-[#52525B] blur-[4px]"
                  >
                    {whatsapp.blurredRemainder}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <UpgradeCheckoutButton
                  label="Unlock WhatsApp nudges — $19"
                  className="w-full sm:w-auto"
                />
              </div>
            </>
          )}
        </div>

        {/* Periwinkle Reminder Activity Tray */}
        <div className="rounded-[24px] border border-black/[0.06] bg-[#D9E6FF] p-5 sm:p-6">
          <h2 className="text-base font-semibold text-[#111111]">
            Reminder history ({logs.length})
          </h2>

          {logs.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-black/[0.08] bg-white p-4 text-xs leading-relaxed text-[#52525B] shadow-[0_2px_0_rgba(17,17,17,0.06)]">
              No reminders sent for this invoice yet. Use{" "}
              <strong className="font-semibold text-[#111111]">
                Send test email to me
              </strong>{" "}
              above to preview it in your own inbox first.
            </div>
          ) : (
            <ul className="mt-3 space-y-2 text-xs">
              {logs.map((log) => {
                const delivery =
                  log.channel === "email"
                    ? getDeliveryBadge(log.delivery_status)
                    : null;
                const channelBadge =
                  log.channel === "email"
                    ? { label: "Scheduled email", variant: "paid" as const }
                    : log.channel === "whatsapp"
                      ? { label: "WhatsApp nudge", variant: "firm" as const }
                      : { label: "Test email", variant: "primary" as const };

                return (
                  <li
                    key={log.id}
                    className="flex flex-col gap-1.5 rounded-2xl border border-black/[0.08] bg-white px-3.5 py-3 shadow-[0_2px_0_rgba(17,17,17,0.06)] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                      <Badge variant="neutral">
                        {formatOffsetBadge(log.offset_days)}
                      </Badge>
                      <Badge variant={channelBadge.variant}>
                        {channelBadge.label}
                      </Badge>
                      {delivery && (
                        <Badge variant={delivery.variant}>
                          {delivery.label}
                        </Badge>
                      )}
                      <span className="truncate text-[#52525B]">
                        {log.channel === "whatsapp"
                          ? `WA ${log.recipient_email}`
                          : log.recipient_email}
                      </span>
                    </div>
                    <LocalTimestamp iso={log.sent_at} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Collapsible Edit Invoice Drawer */}
      <CollapsibleSection
        title="Edit invoice details"
        description="Update client contact, payment link, amount, due date, or custom offsets."
      >
        <InvoiceForm mode="edit" invoice={invoice} />
      </CollapsibleSection>

      {/* Danger Zone */}
      <Card className="flex flex-col gap-3 border-[#FECDD3] bg-[#FFF5F6] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[#111111]">
            Delete invoice
          </h2>
          <p className="mt-0.5 text-xs text-[#9F1239]">
            Permanently removes this invoice and its reminder logs.
          </p>
        </div>
        <DeleteInvoiceButton invoiceId={invoice.id} />
      </Card>
    </div>
  );
}

export default function InvoiceDetailPage(props: PageProps<"/invoices/[id]">) {
  return (
    <Suspense
      fallback={
        <div className="space-y-5">
          <div className="h-8 w-28 animate-pulse rounded-full bg-[#F4F4F5]" />
          <div className="h-52 animate-pulse rounded-[28px] bg-[#E0F2FE]" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-44 animate-pulse rounded-[24px] bg-[#F4F4F5]" />
            <div className="h-44 animate-pulse rounded-[24px] bg-[#FFD7DC]" />
          </div>
        </div>
      }
    >
      <InvoiceDetailContent
        params={props.params}
        searchParams={props.searchParams}
      />
    </Suspense>
  );
}
