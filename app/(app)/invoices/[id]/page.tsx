import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, CheckCircle2, ExternalLink } from "lucide-react";
import { PaidStampSticker } from "@/app/components/HeroStickers";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getInvoiceById,
  getUserProfile,
  isEmailSuppressed,
  listReminderLogs,
  requireUser,
} from "@/lib/db";
import { formatSenderDisplayName } from "@/lib/email";
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
import { CollapsibleSection } from "../CollapsibleSection";
import { DeleteInvoiceButton } from "../DeleteInvoiceButton";
import { InvoiceForm } from "../InvoiceForm";
import { LocalTimestamp } from "../LocalTimestamp";
import { InvoiceStatusBadges } from "../StatusBadges";
import { SubmitButton } from "../SubmitButton";
import {
  UnifiedChaserStage,
  type ChaserStep,
} from "../UnifiedChaserStage";

export const metadata: Metadata = {
  title: "Invoice details — PingCue",
};

const ACTION_NOTICES: Record<string, string> = {
  payment_saved: "Payment progress updated.",
  marked_paid: "Invoice marked fully paid — automated reminders stopped.",
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

function getLogDotAndLabel(log: ReminderLog): {
  dot: string;
  label: string;
} {
  if (log.channel === "whatsapp") {
    return { dot: "bg-[#16A34A]", label: "WhatsApp nudge" };
  }
  if (log.channel === "test_email") {
    return { dot: "bg-[#A1A1AA]", label: "Test email" };
  }
  if (log.delivery_status === "delivered") {
    return { dot: "bg-[#16A34A]", label: "Delivered" };
  }
  if (log.delivery_status === "bounced") {
    return { dot: "bg-[#E11D48]", label: "Bounced" };
  }
  if (log.delivery_status === "complained") {
    return { dot: "bg-[#E11D48]", label: "Spam complaint" };
  }
  return { dot: "bg-[#3B82F6]", label: "Sent" };
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
  const replyToEmail = profile.email || user.email || "";
  const fromLabel = formatSenderDisplayName(profile.display_name);

  const steps: ChaserStep[] = [...invoice.reminder_offsets]
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
      const wa = buildWhatsappNudge({
        invoice,
        offsetDays: offset,
        isUnlocked: isFoundingPass,
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
        whatsappMessage: wa.message,
        whatsappTeaser: wa.teaserLine,
        whatsappBlurred: wa.blurredRemainder,
        waUrl: wa.waUrl,
      };
    });

  const canSendNow =
    active && !clientEmailSuppressed && !sentEmailOffsets.has(nextOffset);

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Top Breadcrumb + Title + Primary Action Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Link
            href="/invoices"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#63636A] transition-colors hover:text-[#131316]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Invoices</span>
          </Link>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <h1 className="font-sans text-[20px] font-semibold leading-tight tracking-[-0.03em] text-[#131316] sm:text-[23px]">
              {invoice.title}
            </h1>
            <InvoiceStatusBadges
              invoice={invoice}
              todayIso={todayIso}
              emailSuppressed={clientEmailSuppressed}
            />
          </div>

          <p className="mt-1 break-words text-xs text-[#63636A]">
            <span className="font-medium text-[#131316]">
              {invoice.client_name}
            </span>{" "}
            · {invoice.client_email} · Due {formatShortDate(invoice.due_date)}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {invoice.payment_link && (
            <a
              href={invoice.payment_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-black/10 bg-white px-3 text-xs font-medium text-[#131316] shadow-[0_1px_2px_rgba(19,19,22,0.04)] transition-colors hover:bg-[#FAFAF8]"
            >
              <span>Payment link</span>
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          )}

          {active ? (
            <form action={recordPaymentAction.bind(null, invoice.id)}>
              <input type="hidden" name="mark_full" value="1" />
              <SubmitButton
                size="sm"
                pendingLabel="Marking paid..."
                className="h-8 rounded-[8px] border border-[#131316] bg-[#131316] px-3 text-xs font-medium text-white shadow-[0_1px_2px_rgba(19,19,22,0.18),inset_0_1px_0_rgba(255,255,255,0.16)] hover:bg-[#26262B]"
              >
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  Mark paid ({formatMoney(remainingMinor, invoice.currency)})
                </span>
              </SubmitButton>
            </form>
          ) : (
            <PaidStampSticker className="h-11 w-14 rotate-[6deg]" />
          )}
        </div>
      </div>

      {/* Contextual Status Notices */}
      {actionNoticeMessage && (
        <div
          role="status"
          className="rounded-[12px] border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-2.5 text-xs font-medium text-[#15803D]"
        >
          {actionNoticeMessage}
        </div>
      )}

      {rawActionError && (
        <div
          role="alert"
          className="rounded-[12px] border border-[#FECDD3] bg-[#FFF1F2] px-4 py-2.5 text-xs font-medium text-[#BE123C]"
        >
          {rawActionError}
        </div>
      )}

      {clientEmailSuppressed && (
        <div
          role="alert"
          className="rounded-[14px] border border-[#FECDD3] bg-[#FFF1F2] px-4 py-3 text-xs text-[#9F1239]"
        >
          <p className="font-semibold text-[#BE123C]">
            Automated emails are paused for {invoice.client_email}
          </p>
          <p className="mt-1 leading-relaxed">
            An earlier email bounced or was marked as spam. Fix any email typo
            in <strong>Edit invoice details</strong> below to resume email
            reminders, or switch to the <strong>WhatsApp</strong> tab right now.
          </p>
        </div>
      )}

      {/* Split Workspace: Unified Chaser Stage (Left) + Control & Activity Rail (Right) */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,1fr)] lg:items-start">
        {/* 1. Unified Email + WhatsApp Chaser Stage */}
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <UnifiedChaserStage
            invoiceId={invoice.id}
            clientName={invoice.client_name}
            clientEmail={invoice.client_email}
            fromLabel={fromLabel}
            replyTo={replyToEmail}
            userEmail={user.email ?? replyToEmail}
            steps={steps}
            defaultOffset={nextOffset}
            nextOffsetBadge={formatOffsetBadge(nextOffset)}
            nextToneLabel={getOffsetTone(nextOffset)}
            active={active}
            paused={paused}
            pausedUntilFormatted={
              invoice.paused_until ? formatShortDate(invoice.paused_until) : null
            }
            clientEmailSuppressed={clientEmailSuppressed}
            canSendNow={canSendNow}
            isFoundingPass={isFoundingPass}
          />
        </div>

        {/* 2. Control & Activity Rail (Right sticky on desktop; before Edit/Delete on mobile) */}
        <aside className="min-w-0 space-y-4 lg:sticky lg:top-[72px] lg:col-start-2 lg:row-start-1 lg:row-span-2">
          {/* Balance, Payment & Schedule Controls */}
          <div className="divide-y divide-black/[0.06] overflow-hidden rounded-[18px] border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(19,19,22,0.03),0_10px_28px_-18px_rgba(19,19,22,0.1)]">
            {/* Balance & Partial Payment */}
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[#63636A]">
                  {active ? "Remaining balance" : "Settled in full"}
                </span>
                <span className="font-mono text-[11px] text-[#71717A] tabular-nums">
                  {paidPct}% paid
                </span>
              </div>

              <p className="mt-1.5 font-mono text-[26px] font-semibold leading-none tracking-[-0.035em] text-[#131316] tabular-nums">
                {formatMoney(
                  active ? remainingMinor : invoice.amount_minor,
                  invoice.currency
                )}
              </p>

              <p className="mt-1 font-mono text-[11px] text-[#71717A] tabular-nums">
                {formatMoney(invoice.amount_received_minor, invoice.currency)}{" "}
                of {formatMoney(invoice.amount_minor, invoice.currency)} received
              </p>

              <div
                aria-hidden="true"
                className="mt-3 h-[5px] w-full overflow-hidden rounded-full bg-[#EFEFED]"
              >
                <div
                  style={{ width: `${paidPct}%` }}
                  className={`h-full rounded-full transition-all duration-300 ${
                    active ? "bg-[#131316]" : "bg-[#22C55E]"
                  }`}
                />
              </div>

              <form
                action={recordPaymentAction.bind(null, invoice.id)}
                className="mt-4 space-y-2"
              >
                <Label
                  htmlFor="quick-amount-received"
                  className="text-[11.5px] font-medium text-[#63636A]"
                >
                  Record total received ({invoice.currency})
                </Label>
                <div className="flex gap-2">
                  <Input
                    key={invoice.amount_received_minor}
                    id="quick-amount-received"
                    name="amount_received"
                    type="text"
                    inputMode="decimal"
                    defaultValue={minorToMajorInput(
                      invoice.amount_received_minor
                    )}
                    className="h-9 flex-1 rounded-[8px] border-black/10 bg-[#F9F9F8] font-mono text-base sm:text-xs"
                  />
                  <SubmitButton
                    variant="outline"
                    size="sm"
                    pendingLabel="Saving..."
                    className="h-9 shrink-0 rounded-[8px] border-black/10 bg-white px-3 text-xs font-medium text-[#131316] shadow-[0_1px_2px_rgba(19,19,22,0.04)] hover:bg-[#F5F5F3]"
                  >
                    Save
                  </SubmitButton>
                </div>
              </form>
            </div>

            {/* Pause Schedule */}
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xs font-medium text-[#63636A]">
                  Reminder schedule
                </h2>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#131316]">
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full ${
                      !active
                        ? "bg-[#16A34A]"
                        : paused
                          ? "bg-[#3B82F6]"
                          : clientEmailSuppressed
                            ? "bg-[#E11D48]"
                            : "bg-[#22C55E]"
                    }`}
                  />
                  <span>
                    {!active
                      ? "Stopped"
                      : paused && invoice.paused_until
                        ? `Paused until ${formatShortDate(invoice.paused_until)}`
                        : clientEmailSuppressed
                          ? "Email paused"
                          : "Active"}
                  </span>
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <form action={pauseInvoiceAction.bind(null, invoice.id)}>
                  <input type="hidden" name="mode" value="plus7" />
                  <SubmitButton
                    variant="outline"
                    size="sm"
                    pendingLabel="Pausing..."
                    className="h-8 rounded-[8px] border-black/10 bg-white px-3 text-xs font-medium text-[#131316] shadow-[0_1px_2px_rgba(19,19,22,0.04)] hover:bg-[#F5F5F3]"
                  >
                    Pause 7 days
                  </SubmitButton>
                </form>

                {paused && (
                  <form action={pauseInvoiceAction.bind(null, invoice.id)}>
                    <input type="hidden" name="mode" value="resume" />
                    <SubmitButton
                      size="sm"
                      pendingLabel="Resuming..."
                      className="h-8 rounded-[8px] bg-[#131316] px-3 text-xs font-medium text-white hover:bg-[#26262B]"
                    >
                      Resume
                    </SubmitButton>
                  </form>
                )}
              </div>

              <form
                action={pauseInvoiceAction.bind(null, invoice.id)}
                className="mt-3 space-y-1.5"
              >
                <input type="hidden" name="mode" value="date" />
                <Label
                  htmlFor="quick-paused-until"
                  className="text-[11px] font-medium text-[#71717A]"
                >
                  Or pause until date
                </Label>
                <div className="flex gap-2">
                  <Input
                    key={invoice.paused_until ?? "unpaused"}
                    id="quick-paused-until"
                    name="paused_until"
                    type="date"
                    required
                    defaultValue={
                      invoice.paused_until ?? addDaysIso(todayIso, 7)
                    }
                    className="h-9 flex-1 rounded-[8px] border-black/10 bg-[#F9F9F8] font-mono text-base sm:text-xs"
                  />
                  <SubmitButton
                    variant="outline"
                    size="sm"
                    pendingLabel="Saving..."
                    className="h-9 shrink-0 rounded-[8px] border-black/10 bg-white px-3 text-xs font-medium text-[#131316] hover:bg-[#F5F5F3]"
                  >
                    Set
                  </SubmitButton>
                </div>
              </form>
            </div>

            {/* Client Properties */}
            <div className="p-4 sm:p-5">
              <h2 className="mb-2.5 text-xs font-medium text-[#63636A]">
                Details
              </h2>
              <dl className="space-y-2 text-xs">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-[#71717A]">Client</dt>
                  <dd className="truncate font-medium text-[#131316]">
                    {invoice.client_name}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="shrink-0 text-[#71717A]">Email</dt>
                  <dd className="min-w-0 truncate font-mono text-[11px] text-[#131316]">
                    {invoice.client_email}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-[#71717A]">WhatsApp</dt>
                  <dd className="font-mono text-[11px] text-[#131316]">
                    {invoice.client_whatsapp || (
                      <span className="font-sans text-[#8E8E93]">Not set</span>
                    )}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-[#71717A]">Due date</dt>
                  <dd className="font-mono text-[11px] text-[#131316] tabular-nums">
                    {formatShortDate(invoice.due_date)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Activity Timeline Card */}
          <div className="rounded-[18px] border border-black/[0.07] bg-white p-4 shadow-[0_1px_2px_rgba(19,19,22,0.03)] sm:p-5">
            <h2 className="text-xs font-medium text-[#63636A]">
              Activity ({logs.length})
            </h2>

            {logs.length === 0 ? (
              <p className="mt-2.5 text-xs leading-relaxed text-[#71717A]">
                No reminders sent yet. Use{" "}
                <strong className="font-medium text-[#131316]">
                  Send test to me
                </strong>{" "}
                to preview it in your inbox first.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-black/[0.05] text-xs">
                {logs.map((log) => {
                  const meta = getLogDotAndLabel(log);
                  return (
                    <li
                      key={log.id}
                      className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 font-medium text-[#131316]">
                          <span
                            aria-hidden="true"
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dot}`}
                          />
                          <span className="font-mono text-[11px] tabular-nums">
                            {formatOffsetBadge(log.offset_days)}
                          </span>
                          <span>{meta.label}</span>
                        </p>
                        <p className="mt-0.5 truncate pl-3 font-mono text-[10.5px] text-[#71717A]">
                          {log.channel === "whatsapp"
                            ? `WA ${log.recipient_email}`
                            : log.recipient_email}
                        </p>
                      </div>
                      <span className="shrink-0 whitespace-nowrap pt-0.5 text-[10.5px] text-[#71717A]">
                        <LocalTimestamp iso={log.sent_at} />
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* 3. Edit & Danger Zone (Bottom on mobile; left column row 2 on desktop) */}
        <div className="min-w-0 space-y-4 lg:col-start-1 lg:row-start-2">
          <CollapsibleSection
            title="Edit invoice details"
            description="Update client contact, WhatsApp number, payment link, amount, due date, or schedule."
          >
            <InvoiceForm mode="edit" invoice={invoice} />
          </CollapsibleSection>

          <div className="flex flex-col gap-3 rounded-[16px] border border-black/[0.07] bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h2 className="text-xs font-semibold text-[#131316]">
                Delete invoice
              </h2>
              <p className="mt-0.5 text-xs text-[#63636A]">
                Permanently removes this invoice and its reminder logs.
              </p>
            </div>
            <DeleteInvoiceButton invoiceId={invoice.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvoiceDetailPage(props: PageProps<"/invoices/[id]">) {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-14 w-64 animate-pulse rounded-xl bg-black/[0.06]" />
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,1fr)]">
            <div className="h-96 animate-pulse rounded-[18px] bg-white" />
            <div className="h-80 animate-pulse rounded-[18px] bg-white" />
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
