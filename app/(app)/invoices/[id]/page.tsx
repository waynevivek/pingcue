import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
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
import { pauseInvoiceAction, recordPaymentAction } from "../actions";
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
        scheduledDate: formatShortDate(addDaysIso(invoice.due_date, offset)),
        wasSent: sentEmailOffsets.has(offset),
        subject: generated.subject,
        text: generated.text,
      };
    });

  return (
    <div className="space-y-8">
      {actionNoticeMessage && (
        <div
          role="status"
          className="rounded-2xl border border-[#BBF7D0] bg-[#DCFCE7] px-5 py-3.5 text-sm font-medium text-[#14532D]"
        >
          {actionNoticeMessage}
        </div>
      )}

      {rawActionError && (
        <div
          role="alert"
          className="rounded-2xl border border-[#FECDD3] bg-[#FFE4E6] px-5 py-3.5 text-sm font-medium text-[#9F1239]"
        >
          {rawActionError}
        </div>
      )}

      {clientEmailSuppressed && (
        <div
          role="alert"
          className="rounded-2xl border border-[#FECDD3] bg-[#FFE4E6] px-5 py-4 text-sm text-[#9F1239]"
        >
          <p className="font-semibold">
            Automated emails are paused for {invoice.client_email}
          </p>
          <p className="mt-1 text-xs leading-relaxed">
            An earlier email to this address bounced or was marked as spam, so
            PingCue won&apos;t send further email reminders to protect
            deliverability. Fix any typo in the client email below, or follow up
            on WhatsApp instead.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Link
            href="/invoices"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#F4F4F5] px-3.5 py-1.5 text-xs font-semibold text-[#111111] transition-colors hover:bg-[#EAEAEF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to invoices</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <h1 className="font-sans text-[26px] font-semibold tracking-[-0.03em] text-[#111111] sm:text-[32px]">
              {invoice.title}
            </h1>
            <InvoiceStatusBadges invoice={invoice} todayIso={todayIso} />
          </div>
          <p className="text-sm text-[#52525B]">
            {invoice.client_name} · {invoice.client_email}
            {invoice.client_whatsapp ? ` · WhatsApp ${invoice.client_whatsapp}` : ""}
            {" · "}Due {formatShortDate(invoice.due_date)}
          </p>
        </div>

        <Card className="px-5 py-4 text-left sm:text-right">
          <p className="text-xs font-medium text-[#52525B]">
            Remaining balance
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold text-[#111111] tabular-nums">
            {formatMoney(remainingMinor, invoice.currency)}
          </p>
          <p className="font-mono text-xs text-[#52525B] tabular-nums">
            {formatMoney(invoice.amount_received_minor, invoice.currency)} of{" "}
            {formatMoney(invoice.amount_minor, invoice.currency)} received
          </p>
        </Card>
      </div>

      {/* Quick Actions Row: Payment & Pause */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Progress */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">
            Payment progress
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Update amount received manually. Reminders chase only the remaining
            balance and stop automatically once paid.
          </p>

          <form
            action={recordPaymentAction.bind(null, invoice.id)}
            className="mt-4 flex flex-wrap items-end gap-3"
          >
            <div className="min-w-[160px] flex-1">
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
            <SubmitButton variant="outline" pendingLabel="Saving...">
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
                className="w-full"
              >
                Mark fully paid ({formatMoney(invoice.amount_minor, invoice.currency)})
              </SubmitButton>
            </form>
          )}
        </Card>

        {/* Pause Reminders */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">
            Pause reminders
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {paused && invoice.paused_until
              ? `Reminders are paused through ${formatShortDate(invoice.paused_until)}.`
              : "Client promised to pay on a specific date? Pause automated sends until then."}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <form action={pauseInvoiceAction.bind(null, invoice.id)}>
              <input type="hidden" name="mode" value="plus7" />
              <SubmitButton size="sm" pendingLabel="Pausing...">
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
                >
                  Resume reminders
                </SubmitButton>
              </form>
            )}
          </div>

          <form
            action={pauseInvoiceAction.bind(null, invoice.id)}
            className="mt-4 flex flex-wrap items-end gap-2.5"
          >
            <input type="hidden" name="mode" value="date" />
            <div className="min-w-[160px] flex-1">
              <Label htmlFor="quick-paused-until" className="text-xs">
                Or pause until date
              </Label>
              <Input
                id="quick-paused-until"
                name="paused_until"
                type="date"
                required
                defaultValue={invoice.paused_until ?? addDaysIso(todayIso, 7)}
                className="mt-1.5 h-10 font-mono"
              />
            </div>
            <SubmitButton variant="outline" pendingLabel="Updating...">
              Set pause date
            </SubmitButton>
          </form>
        </Card>
      </div>

      {/* Send Test Email & Zero-API WhatsApp Nudge */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Send Test Email */}
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-foreground">
              Preview email in your inbox
            </h2>
            <Badge variant="primary">
              Next: {formatOffsetBadge(nextOffset)} · {getOffsetTone(nextOffset)}
            </Badge>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Sends the next reminder email to{" "}
            <span className="font-mono text-foreground">{user.email}</span> (with{" "}
            <code className="font-mono">Reply-To</code> set to you) so you can
            check tone and formatting before anything goes to your client.
          </p>

          <div className="mt-4 space-y-4">
            <InlineEmailPreview
              steps={previewSteps}
              defaultOffset={nextOffset}
              clientEmail={invoice.client_email}
              replyTo={replyToEmail}
            />
            <SendTestEmailButton invoiceId={invoice.id} />
            {active && !clientEmailSuppressed && !sentEmailOffsets.has(nextOffset) && (
              <SendNowButton
                invoiceId={invoice.id}
                clientEmail={invoice.client_email}
                offsetLabel={formatOffsetBadge(nextOffset)}
                toneLabel={getOffsetTone(nextOffset)}
              />
            )}
          </div>
        </Card>

        {/* Zero-API WhatsApp Nudge */}
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-foreground">
              Send on WhatsApp
            </h2>
            <Badge variant={isFoundingPass ? "paid" : "firm"}>
              {isFoundingPass ? "Zero-API wa.me" : "Founding Pass"}
            </Badge>
          </div>

          {isFoundingPass ? (
            <>
              <p className="mt-2 text-xs text-muted-foreground">
                Opens WhatsApp with a prefilled{" "}
                {getOffsetTone(nextOffset).toLowerCase()} nudge and remaining
                balance—zero WhatsApp API setup required.
              </p>
              <div className="mt-3 rounded-lg border border-border bg-background/70 p-3 text-xs leading-relaxed text-foreground">
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
              <p className="mt-2 text-xs text-muted-foreground">
                Your polite WhatsApp message for {invoice.client_name} is ready
                to send in 1 click—unlock with the one-time Founding Pass.
              </p>
              <div className="relative mt-3 overflow-hidden rounded-lg border border-border bg-background/70 p-3 text-xs leading-relaxed text-foreground">
                <span>{whatsapp.teaserLine} </span>
                {whatsapp.blurredRemainder && (
                  <span
                    aria-hidden="true"
                    className="select-none blur-[4px] text-muted-foreground"
                  >
                    {whatsapp.blurredRemainder}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <UpgradeCheckoutButton label="Unlock WhatsApp nudges — $19 one-time" />
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Computed Reminder Schedule */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Computed reminder schedule
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Daily cron runs at 04:00 UTC (09:30 IST), sending each unpaused
              step once with your email set as Reply-To.
            </p>
          </div>
          {invoice.payment_link && (
            <a
              href={invoice.payment_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-[#F4F4F5] px-3 py-1 text-xs font-semibold text-[#111111] transition-colors hover:bg-[#EAEAEF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
            >
              <span>Open payment link</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {invoice.reminder_offsets.map((offset) => {
            const scheduledIso = addDaysIso(invoice.due_date, offset);
            const tone = getOffsetTone(offset);
            const wasSent = sentEmailOffsets.has(offset);

            const cardClasses = wasSent
              ? "border-[#BBF7D0] bg-[#DCFCE7]/75"
              : tone === "Firm"
                ? "border-[#FDE047] bg-[#FEF9C3]/80"
                : tone === "Final notice"
                  ? "border-[#FECDD3] bg-[#FFE4E6]/75"
                  : "border-black/[0.08] bg-[#FAFAFA]";

            const badgeVariant = wasSent
              ? ("paid" as const)
              : tone === "Firm"
                ? ("firm" as const)
                : tone === "Final notice"
                  ? ("overdue" as const)
                  : ("primary" as const);

            return (
              <div
                key={offset}
                className={`rounded-2xl border p-3 ${cardClasses}`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-xs font-semibold text-[#111111]">
                    {formatOffsetBadge(offset)}
                  </span>
                  <Badge variant={badgeVariant} className="px-2 py-0 text-[10px]">
                    {wasSent ? "Sent" : tone}
                  </Badge>
                </div>
                <p className="mt-2 font-mono text-xs text-[#52525B]">
                  {formatShortDate(scheduledIso)}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Reminder Activity Log */}
      <Card className="p-6">
        <h2 className="text-base font-semibold text-[#111111]">
          Reminder history ({logs.length})
        </h2>

        {logs.length === 0 ? (
          <p className="mt-2 text-xs text-[#52525B]">
            No emails sent for this invoice yet. Click &ldquo;Send test email to
            me&rdquo; above to preview how your reminder looks in your inbox.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-black/[0.06] text-xs">
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
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="neutral">
                      {formatOffsetBadge(log.offset_days)}
                    </Badge>
                    <Badge variant={channelBadge.variant}>
                      {channelBadge.label}
                    </Badge>
                    {delivery && (
                      <Badge variant={delivery.variant}>{delivery.label}</Badge>
                    )}
                    <span className="text-[#52525B]">
                      {log.channel === "whatsapp"
                        ? `via WhatsApp ${log.recipient_email}`
                        : `to ${log.recipient_email}`}
                    </span>
                  </div>
                  <LocalTimestamp iso={log.sent_at} />
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Edit Invoice Form */}
      <Card className="p-6 sm:p-8">
        <h2 className="mb-5 text-lg font-semibold text-[#111111]">
          Edit invoice details
        </h2>
        <InvoiceForm mode="edit" invoice={invoice} />
      </Card>

      {/* Danger Zone */}
      <Card className="flex flex-wrap items-center justify-between gap-4 border-[#FECDD3] p-5">
        <div>
          <h2 className="text-sm font-semibold text-[#111111]">
            Delete invoice
          </h2>
          <p className="text-xs text-[#52525B]">
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
        <div className="space-y-6">
          <div className="h-10 w-64 animate-pulse rounded-lg bg-muted" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-44 animate-pulse rounded-xl border border-border bg-card" />
            <div className="h-44 animate-pulse rounded-xl border border-border bg-card" />
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
