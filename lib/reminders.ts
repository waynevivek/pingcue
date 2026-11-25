import {
  addDaysIso,
  formatMoney,
  formatOffsetBadge,
  formatShortDate,
  getRemainingMinor,
  isInvoiceActive,
  isInvoicePaused,
  type Invoice,
} from "./invoices.ts";

export interface ReminderLog {
  id: string;
  invoice_id: string;
  user_id: string;
  offset_days: number;
  channel: "email" | "test_email" | "whatsapp";
  recipient_email: string;
  resend_id: string | null;
  scheduled_for?: string | null;
  delivery_status?: "sent" | "delivered" | "bounced" | "complained";
  sent_at: string;
}

/**
 * Returns scheduled offsets already sent for the invoice's current due_date.
 * Legacy rows without scheduled_for still count as sent; rows from an earlier
 * due_date are ignored after the user pushes due_date forward.
 */
export function getSentOffsetsForDueDate(
  logs: readonly Pick<ReminderLog, "channel" | "offset_days" | "scheduled_for">[],
  dueDate: string
): Set<number> {
  const sent = new Set<number>();
  for (const log of logs) {
    if (log.channel !== "email") continue;
    const expectedDate = addDaysIso(dueDate, log.offset_days);
    if (log.scheduled_for == null || log.scheduled_for === expectedDate) {
      sent.add(log.offset_days);
    }
  }
  return sent;
}

export type ReminderTone = "friendly" | "firm" | "final";

export interface ReminderEmailContent {
  offsetDays: number;
  tone: ReminderTone;
  subject: string;
  text: string;
  html: string;
}

export interface WhatsappNudge {
  message: string;
  teaserLine: string;
  blurredRemainder: string;
  waUrl: string | null;
}

export function getReminderToneKey(offsetDays: number): ReminderTone {
  if (offsetDays <= 3) return "friendly";
  if (offsetDays < 30) return "firm";
  return "final";
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Returns at most one unsent reminder offset due for this invoice today.
 * Includes a 1-day catch-up window for cron hiccups, but never retroactively
 * fires offsets scheduled before the invoice was created.
 */
export function findDueReminderOffset(
  invoice: Invoice,
  sentOffsets: ReadonlySet<number>,
  todayIso: string
): number | null {
  if (!isInvoiceActive(invoice) || isInvoicePaused(invoice, todayIso)) {
    return null;
  }

  const yesterdayIso = addDaysIso(todayIso, -1);
  const createdIso = (invoice.created_at || todayIso).slice(0, 10);
  const sortedOffsets = [...invoice.reminder_offsets].sort((a, b) => a - b);

  let latestDue: number | null = null;
  for (const offset of sortedOffsets) {
    if (sentOffsets.has(offset)) continue;
    const scheduledIso = addDaysIso(invoice.due_date, offset);
    const isDueToday = scheduledIso === todayIso;
    const isOneDayCatchup =
      scheduledIso === yesterdayIso && scheduledIso >= createdIso;

    if (isDueToday || isOneDayCatchup) {
      latestDue = offset;
    }
  }

  return latestDue;
}

/** Picks the next upcoming (or most relevant) offset for test emails and WhatsApp nudges. */
export function getNextReminderOffset(
  invoice: Invoice,
  sentOffsets: ReadonlySet<number>,
  todayIso: string
): number {
  const dueNow = findDueReminderOffset(invoice, sentOffsets, todayIso);
  if (dueNow !== null) return dueNow;

  const sortedOffsets =
    invoice.reminder_offsets.length > 0
      ? [...invoice.reminder_offsets].sort((a, b) => a - b)
      : [0];

  for (const offset of sortedOffsets) {
    if (sentOffsets.has(offset)) continue;
    if (addDaysIso(invoice.due_date, offset) >= todayIso) {
      return offset;
    }
  }

  for (const offset of sortedOffsets) {
    if (!sentOffsets.has(offset)) return offset;
  }

  return sortedOffsets[sortedOffsets.length - 1] ?? 0;
}

function getTimingPhrase(offsetDays: number, dueFormatted: string): string {
  if (offsetDays < 0) {
    const days = Math.abs(offsetDays);
    return `due in ${days} ${days === 1 ? "day" : "days"} (${dueFormatted})`;
  }
  if (offsetDays === 0) {
    return `due today (${dueFormatted})`;
  }
  return `${offsetDays} ${offsetDays === 1 ? "day" : "days"} overdue (was due ${dueFormatted})`;
}

/** Builds a personal, high-deliverability escalating reminder email using remaining balance only. */
export function buildReminderEmail({
  invoice,
  offsetDays,
  freelancerEmail,
  freelancerName,
  isTest = false,
}: {
  invoice: Invoice;
  offsetDays: number;
  freelancerEmail: string;
  freelancerName?: string | null;
  isTest?: boolean;
}): ReminderEmailContent {
  const tone = getReminderToneKey(offsetDays);
  const remainingMinor = getRemainingMinor(
    invoice.amount_minor,
    invoice.amount_received_minor
  );
  const displayMinor =
    remainingMinor > 0 ? remainingMinor : invoice.amount_minor;
  const amountFormatted = formatMoney(displayMinor, invoice.currency);
  const receivedFormatted = formatMoney(
    invoice.amount_received_minor,
    invoice.currency
  );
  const isPartial = invoice.amount_received_minor > 0 && remainingMinor > 0;
  const dueFormatted = formatShortDate(invoice.due_date);
  const timingPhrase = getTimingPhrase(offsetDays, dueFormatted);
  const cleanName = freelancerName?.trim() || "";
  const senderLabel = cleanName || freelancerEmail;
  const onBehalfOf = cleanName
    ? `${cleanName} (${freelancerEmail})`
    : freelancerEmail;

  let rawSubject: string;
  let opening: string;
  let closing: string;

  if (tone === "friendly") {
    rawSubject =
      offsetDays < 0
        ? `Friendly heads-up: ${invoice.title} (${amountFormatted}) is due ${dueFormatted}`
        : offsetDays === 0
          ? `Reminder: ${invoice.title} (${amountFormatted}) is due today`
          : `Quick nudge: ${invoice.title} (${amountFormatted})`;

    opening = isPartial
      ? `Thanks again for the ${receivedFormatted} already received for "${invoice.title}". This is a friendly reminder that the remaining balance of ${amountFormatted} is ${timingPhrase}.`
      : `Hope your week is going well! This is a quick, friendly reminder that "${invoice.title}" for ${amountFormatted} is ${timingPhrase}.`;

    closing =
      "If you've already sent the payment, please ignore this note—or reply directly with the receipt and I'll mark it settled right away.";
  } else if (tone === "firm") {
    rawSubject = `Follow-up: ${invoice.title} — ${amountFormatted} (${offsetDays}d overdue)`;

    opening = isPartial
      ? `Following up on "${invoice.title}". We've recorded ${receivedFormatted} so far, and the remaining balance of ${amountFormatted} is now ${timingPhrase}.`
      : `Following up on "${invoice.title}" for ${amountFormatted}, which is now ${timingPhrase}.`;

    closing =
      "Please arrange payment at your earliest convenience, or reply directly to this email with the date you expect to settle it.";
  } else {
    rawSubject = `Final notice: ${invoice.title} — ${amountFormatted} (${offsetDays}d overdue)`;

    opening = isPartial
      ? `This is a final reminder regarding "${invoice.title}". After the ${receivedFormatted} received, the remaining balance of ${amountFormatted} is now ${timingPhrase}.`
      : `This is a final reminder regarding "${invoice.title}" for ${amountFormatted}, which is now ${timingPhrase}.`;

    closing =
      "Please settle this balance today or reply directly to this email immediately so we can resolve it without further follow-up.";
  }

  const subject = isTest ? `[TEST] ${rawSubject}` : rawSubject;

  const textLines = [
    `Hi ${invoice.client_name},`,
    "",
    opening,
    ...(invoice.payment_link
      ? ["", `Payment link: ${invoice.payment_link}`]
      : []),
    "",
    closing,
    "",
    "Thanks,",
    senderLabel,
    "",
    "---",
    `Sent via PingCue on behalf of ${onBehalfOf}. Reply directly to this email if you've already paid.`,
  ];

  const safeClient = escapeHtml(invoice.client_name);
  const safeOpening = escapeHtml(opening);
  const safeClosing = escapeHtml(closing);
  const safeSenderLabel = escapeHtml(senderLabel);
  const safeOnBehalfOf = escapeHtml(onBehalfOf);
  const safeLink = invoice.payment_link
    ? escapeHtml(invoice.payment_link)
    : null;

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif;color:#111111;line-height:1.6;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:16px;padding:28px;">
      <p style="margin:0 0 16px;">Hi ${safeClient},</p>
      <p style="margin:0 0 16px;">${safeOpening}</p>
      ${
        safeLink
          ? `<p style="margin:20px 0;"><a href="${safeLink}" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;font-weight:600;padding:11px 20px;border-radius:9999px;">Pay ${escapeHtml(amountFormatted)}</a></p><p style="margin:0 0 16px;font-size:13px;color:#52525b;">Direct link: <a href="${safeLink}" style="color:#111111;word-break:break-all;">${safeLink}</a></p>`
          : ""
      }
      <p style="margin:0 0 16px;">${safeClosing}</p>
      <p style="margin:0;">Thanks,<br />${safeSenderLabel}</p>
      <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0 12px;" />
      <p style="margin:0;font-size:12px;color:#71717a;">Sent via PingCue on behalf of ${safeOnBehalfOf}. Reply directly to this email if you've already paid.</p>
    </div>
  </body>
</html>`;

  return {
    offsetDays,
    tone,
    subject,
    text: textLines.join("\n"),
    html,
  };
}

export interface DigestReminderItem {
  title: string;
  clientName: string;
  clientEmail: string;
  amountFormatted: string;
  offsetDays: number;
  tone: ReminderTone;
}

/** Builds a concise daily digest email letting the freelancer know what PingCue sent. */
export function buildFreelancerDigestEmail({
  freelancerName,
  dateIso,
  items,
}: {
  freelancerName?: string | null;
  freelancerEmail: string;
  dateIso: string;
  items: DigestReminderItem[];
}): { subject: string; text: string; html: string } {
  const count = items.length;
  const greetingName = freelancerName?.trim() || "there";
  const dateLabel = formatShortDate(dateIso);
  const subject =
    count === 1
      ? `PingCue sent 1 reminder today (${items[0].clientName})`
      : `PingCue sent ${count} reminders today (${dateLabel})`;

  const textLines = [
    `Hi ${greetingName},`,
    "",
    `PingCue sent ${count} scheduled payment ${count === 1 ? "reminder" : "reminders"} on ${dateLabel}:`,
    "",
    ...items.map(
      (item) =>
        `- ${item.title} (${item.amountFormatted}) to ${item.clientName} <${item.clientEmail}> — ${formatOffsetBadge(item.offsetDays)} (${item.tone})`
    ),
    "",
    "You can pause or mark any invoice paid anytime in your PingCue dashboard.",
  ];

  const listHtml = items
    .map(
      (item) =>
        `<li style="margin:0 0 8px;"><strong>${escapeHtml(item.title)}</strong> (${escapeHtml(item.amountFormatted)}) to ${escapeHtml(item.clientName)} &lt;${escapeHtml(item.clientEmail)}&gt; — ${escapeHtml(formatOffsetBadge(item.offsetDays))} (${escapeHtml(item.tone)})</li>`
    )
    .join("");

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif;color:#111111;line-height:1.6;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:16px;padding:28px;">
      <p style="margin:0 0 14px;">Hi ${escapeHtml(greetingName)},</p>
      <p style="margin:0 0 14px;">PingCue sent ${count} scheduled payment ${count === 1 ? "reminder" : "reminders"} on ${escapeHtml(dateLabel)}:</p>
      <ul style="margin:0 0 18px;padding-left:20px;">${listHtml}</ul>
      <p style="margin:0;font-size:13px;color:#52525b;">You can pause or mark any invoice paid anytime in your PingCue dashboard.</p>
    </div>
  </body>
</html>`;

  return { subject, text: textLines.join("\n"), html };
}

/** Builds an ops alert email when the daily reminder cron hits errors. */
export function buildCronAlertEmail({
  dateIso,
  summary,
}: {
  dateIso: string;
  summary: {
    checked: number;
    due: number;
    sent: number;
    failed: number;
    skippedCap: number;
    errors?: string[];
  };
}): { subject: string; text: string; html: string } {
  const subject = `[PingCue Cron Alert] ${summary.failed} failed on ${dateIso}`;
  const errorsList = summary.errors ?? [];
  const textLines = [
    `PingCue daily cron reported failures on ${dateIso}:`,
    "",
    `Checked: ${summary.checked}`,
    `Due: ${summary.due}`,
    `Sent: ${summary.sent}`,
    `Failed: ${summary.failed}`,
    `Skipped cap: ${summary.skippedCap}`,
    ...(errorsList.length > 0 ? ["", "Errors:", ...errorsList.map((e) => `- ${e}`)] : []),
  ];

  const errorsHtml = errorsList.length
    ? `<ul style="margin:12px 0 0;padding-left:20px;color:#9f1239;">${errorsList
        .map((e) => `<li>${escapeHtml(e)}</li>`)
        .join("")}</ul>`
    : "";

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif;color:#111111;line-height:1.6;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #fecdd3;border-radius:16px;padding:24px;">
      <p style="margin:0 0 12px;font-weight:600;color:#9f1239;">PingCue daily cron reported failures on ${escapeHtml(dateIso)}</p>
      <p style="margin:0;font-size:13px;">Checked: ${summary.checked} · Due: ${summary.due} · Sent: ${summary.sent} · Failed: ${summary.failed} · Skipped cap: ${summary.skippedCap}</p>
      ${errorsHtml}
    </div>
  </body>
</html>`;

  return { subject, text: textLines.join("\n"), html };
}

/** Builds a zero-API wa.me WhatsApp nudge link and Free-plan truncated teaser. */
export function buildWhatsappNudge({
  invoice,
  offsetDays,
  isUnlocked = true,
}: {
  invoice: Invoice;
  offsetDays: number;
  isUnlocked?: boolean;
}): WhatsappNudge {
  const tone = getReminderToneKey(offsetDays);
  const remainingMinor = getRemainingMinor(
    invoice.amount_minor,
    invoice.amount_received_minor
  );
  const displayMinor =
    remainingMinor > 0 ? remainingMinor : invoice.amount_minor;
  const amountFormatted = formatMoney(displayMinor, invoice.currency);
  const dueFormatted = formatShortDate(invoice.due_date);
  const isPartial = invoice.amount_received_minor > 0 && remainingMinor > 0;
  const balanceLabel = isPartial
    ? `remaining balance of ${amountFormatted}`
    : amountFormatted;

  let body: string;
  if (tone === "friendly") {
    body =
      offsetDays <= 0
        ? `Hi ${invoice.client_name}, quick friendly reminder about "${invoice.title}" (${balanceLabel}), due ${dueFormatted}.`
        : `Hi ${invoice.client_name}, gentle nudge on "${invoice.title}" (${balanceLabel}), which was due ${dueFormatted}.`;
  } else if (tone === "firm") {
    body = `Hi ${invoice.client_name}, following up on "${invoice.title}" (${balanceLabel}) — now ${offsetDays} days past due (${dueFormatted}). Could you share when this will be settled?`;
  } else {
    body = `Hi ${invoice.client_name}, final follow-up on "${invoice.title}" (${balanceLabel}), now ${offsetDays} days overdue. Please settle today or let me know when payment is going through.`;
  }

  const message = invoice.payment_link
    ? `${body} Payment link: ${invoice.payment_link}`
    : body;

  const maxTeaserChars = Math.min(42, Math.floor(message.length * 0.45));
  const spaceIndex = message.lastIndexOf(" ", maxTeaserChars);
  const minWordBreak = Math.min(18, Math.floor(maxTeaserChars * 0.6));
  const splitIndex = spaceIndex > minWordBreak ? spaceIndex : maxTeaserChars;
  const teaserLine = message.slice(0, splitIndex).trim();

  if (!isUnlocked) {
    return {
      message: "",
      teaserLine,
      blurredRemainder:
        "payment details and link — unlock Founding Pass to send in 1 click.",
      waUrl: null,
    };
  }

  const blurredRemainder = message.slice(splitIndex).trim();

  const waUrl = invoice.client_whatsapp
    ? `https://wa.me/${invoice.client_whatsapp}?text=${encodeURIComponent(message)}`
    : null;

  return {
    message,
    teaserLine,
    blurredRemainder,
    waUrl,
  };
}
