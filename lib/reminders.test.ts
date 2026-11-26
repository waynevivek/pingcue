import assert from "node:assert/strict";
import test from "node:test";
import {
  formatSenderDisplayName,
  formatSenderFromAddress,
} from "./email.ts";
import type { Invoice } from "./invoices.ts";
import {
  buildCronAlertEmail,
  buildDeliveryIssueAlertEmail,
  buildFreelancerDigestEmail,
  buildReminderEmail,
  buildWhatsappNudge,
  findDueReminderOffset,
  getNextReminderOffset,
  getSentOffsetsForDueDate,
  getUpcomingScheduledStep,
} from "./reminders.ts";

function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: "inv-1",
    user_id: "user-1",
    title: "Landing Page Design",
    client_name: "Priya",
    client_email: "priya@northstar.co",
    client_whatsapp: "919876543210",
    currency: "INR",
    amount_minor: 4_500_000, // ₹45,000
    amount_received_minor: 0,
    due_date: "2026-11-20",
    payment_link: "https://rzp.io/l/test123",
    reminder_offsets: [-3, 0, 3, 7, 14, 30],
    paused_until: null,
    created_at: "2026-11-10T08:00:00Z",
    updated_at: "2026-11-10T08:00:00Z",
    ...overrides,
  };
}

test("findDueReminderOffset skips paid and paused invoices", () => {
  const paid = makeInvoice({ amount_received_minor: 4_500_000 });
  assert.equal(findDueReminderOffset(paid, new Set(), "2026-11-20"), null);

  const paused = makeInvoice({ paused_until: "2026-11-20" });
  assert.equal(findDueReminderOffset(paused, new Set(), "2026-11-20"), null);

  const pauseExpired = makeInvoice({ paused_until: "2026-11-19" });
  assert.equal(findDueReminderOffset(pauseExpired, new Set(), "2026-11-20"), 0);
});

test("findDueReminderOffset matches exact dates, skips sent, and respects 1-day catchup safely", () => {
  const inv = makeInvoice();

  // Exact match: -3d before Nov 20 = Nov 17
  assert.equal(findDueReminderOffset(inv, new Set(), "2026-11-17"), -3);
  // Already sent -> null
  assert.equal(findDueReminderOffset(inv, new Set([-3]), "2026-11-17"), null);

  // 1-day catchup: cron missed Nov 20 (0d), runs on Nov 21 -> sends 0d
  assert.equal(findDueReminderOffset(inv, new Set([-3]), "2026-11-21"), 0);

  // Late-created invoice must NOT retroactively fire yesterday's pre-creation offset
  const lateCreated = makeInvoice({
    due_date: "2026-11-20",
    created_at: "2026-11-21T06:00:00Z",
  });
  assert.equal(
    findDueReminderOffset(lateCreated, new Set(), "2026-11-21"),
    null
  );
});

test("buildReminderEmail escalates tone, uses remaining balance, and escapes HTML", () => {
  const partial = makeInvoice({
    amount_received_minor: 2_500_000, // ₹25,000 paid -> ₹20,000 left
    client_name: 'Priya <script>alert(1)</script>',
  });

  const friendly = buildReminderEmail({
    invoice: partial,
    offsetDays: 0,
    freelancerEmail: "me@studio.com",
    isTest: true,
  });
  assert.equal(friendly.tone, "friendly");
  assert.match(friendly.subject, /^\[TEST\] /);
  assert.match(friendly.text, /20,000/);
  assert.match(friendly.text, /25,000/);
  assert.ok(!friendly.html.includes("<script>"));
  assert.ok(friendly.html.includes("&lt;script&gt;"));

  const firm = buildReminderEmail({
    invoice: partial,
    offsetDays: 7,
    freelancerEmail: "me@studio.com",
  });
  assert.equal(firm.tone, "firm");
  assert.match(firm.subject, /7d overdue/);

  const finalNotice = buildReminderEmail({
    invoice: partial,
    offsetDays: 30,
    freelancerEmail: "me@studio.com",
  });
  assert.equal(finalNotice.tone, "final");
  assert.match(finalNotice.subject, /^Final notice:/);
});

test("buildWhatsappNudge and getNextReminderOffset produce valid wa.me links", () => {
  const inv = makeInvoice({ amount_received_minor: 2_500_000 });
  const next = getNextReminderOffset(inv, new Set([-3]), "2026-11-18");
  assert.equal(next, 0);

  const nudge = buildWhatsappNudge({ invoice: inv, offsetDays: next });
  assert.ok(nudge.waUrl?.startsWith("https://wa.me/919876543210?text="));
  assert.match(nudge.message, /20,000/);
  assert.ok(nudge.teaserLine.length > 0);
  assert.ok(nudge.blurredRemainder.length > 0);

  const noPhone = makeInvoice({ client_whatsapp: null });
  assert.equal(buildWhatsappNudge({ invoice: noPhone, offsetDays: 7 }).waUrl, null);
});

test("buildWhatsappNudge hides full text and wa.me URL when locked for Free plan", () => {
  const inv = makeInvoice({
    title: "Logo",
    client_name: "Ana",
    payment_link: "https://rzp.io/l/secret-pay-link",
  });

  const locked = buildWhatsappNudge({
    invoice: inv,
    offsetDays: 0,
    isUnlocked: false,
  });

  assert.equal(locked.message, "");
  assert.equal(locked.waUrl, null);
  assert.ok(locked.teaserLine.length > 0);
  assert.ok(locked.teaserLine.length <= 42);
  assert.ok(!locked.teaserLine.includes("secret-pay-link"));
  assert.ok(!locked.blurredRemainder.includes("secret-pay-link"));
});

test("getSentOffsetsForDueDate isolates rescheduled due dates while preserving legacy logs", () => {
  const logs = [
    { channel: "test_email" as const, offset_days: -3, scheduled_for: null },
    {
      channel: "email" as const,
      offset_days: -3,
      scheduled_for: "2026-11-17", // for original due_date 2026-11-20
    },
    {
      channel: "email" as const,
      offset_days: 0,
      scheduled_for: null, // legacy row without scheduled_for
    },
  ];

  const originalSet = getSentOffsetsForDueDate(logs, "2026-11-20");
  assert.equal(originalSet.has(-3), true);
  assert.equal(originalSet.has(0), true);

  // Pushing due_date forward to 2026-11-28 clears the old -3d lock while keeping legacy null
  const rescheduledSet = getSentOffsetsForDueDate(logs, "2026-11-28");
  assert.equal(rescheduledSet.has(-3), false);
  assert.equal(rescheduledSet.has(0), true);
});

test("buildReminderEmail signs off with freelancerName and uses #111111 CTA", () => {
  const inv = makeInvoice();
  const content = buildReminderEmail({
    invoice: inv,
    offsetDays: 0,
    freelancerEmail: "vivek@studio.com",
    freelancerName: "Vivek <Studio>",
  });

  assert.match(content.text, /Thanks,\nVivek <Studio>/);
  assert.match(content.text, /Vivek <Studio> \(vivek@studio\.com\)/);
  assert.ok(content.html.includes("background:#111111"));
  assert.ok(content.html.includes("Vivek &lt;Studio&gt;"));
});

test("buildFreelancerDigestEmail and buildCronAlertEmail format clean escaped summaries", () => {
  const digest = buildFreelancerDigestEmail({
    freelancerName: "Vivek",
    freelancerEmail: "vivek@studio.com",
    dateIso: "2026-11-20",
    items: [
      {
        title: "Design Retainer",
        clientName: "Priya",
        clientEmail: "priya@northstar.co",
        amountFormatted: "₹20,000",
        offsetDays: 7,
        tone: "firm",
      },
    ],
  });
  assert.match(digest.subject, /sent 1 reminder today \(Priya\)/);
  assert.match(digest.text, /\+7d \(firm\)/);

  const alert = buildCronAlertEmail({
    dateIso: "2026-11-20",
    summary: {
      checked: 10,
      due: 3,
      sent: 2,
      failed: 1,
      skippedCap: 0,
      errors: ["Invoice 1: <bad>"],
    },
  });
  assert.match(alert.subject, /1 failed on 2026-11-20/);
  assert.ok(alert.html.includes("&lt;bad&gt;"));
});

test("getUpcomingScheduledStep reports paid, paused, due-now, upcoming, and complete accurately", () => {
  const paid = makeInvoice({ amount_received_minor: 4_500_000 });
  assert.deepEqual(getUpcomingScheduledStep(paid, new Set(), "2026-11-18"), {
    kind: "paid",
  });

  const paused = makeInvoice({ paused_until: "2026-11-25" });
  assert.deepEqual(getUpcomingScheduledStep(paused, new Set(), "2026-11-18"), {
    kind: "paused",
    pausedUntil: "2026-11-25",
  });

  const active = makeInvoice();
  assert.deepEqual(
    getUpcomingScheduledStep(active, new Set(), "2026-11-17"),
    {
      kind: "scheduled",
      offsetDays: -3,
      scheduledDate: "2026-11-17",
      isDueNow: true,
    }
  );

  assert.deepEqual(
    getUpcomingScheduledStep(active, new Set([-3]), "2026-11-18"),
    {
      kind: "scheduled",
      offsetDays: 0,
      scheduledDate: "2026-11-20",
      isDueNow: false,
    }
  );

  assert.deepEqual(
    getUpcomingScheduledStep(
      active,
      new Set([-3, 0, 3, 7, 14, 30]),
      "2026-12-21"
    ),
    { kind: "complete" }
  );
});

test("formatSenderDisplayName and formatSenderFromAddress personalize and sanitize From headers", () => {
  const base = "PingCue <reminders@getpingcue.com>";

  assert.equal(formatSenderDisplayName(null), "PingCue");
  assert.equal(formatSenderDisplayName("   "), "PingCue");
  assert.equal(formatSenderDisplayName("Vivek Sharma"), "Vivek Sharma via PingCue");
  assert.equal(
    formatSenderDisplayName("Northstar via PingCue"),
    "Northstar via PingCue"
  );

  assert.equal(formatSenderFromAddress(base, ""), base);
  assert.equal(
    formatSenderFromAddress(base, "Vivek Sharma"),
    "Vivek Sharma via PingCue <reminders@getpingcue.com>"
  );
  assert.equal(
    formatSenderFromAddress("reminders@getpingcue.com", "Northstar, LLC"),
    '"Northstar, LLC via PingCue" <reminders@getpingcue.com>'
  );
  // Strips CR/LF and angle brackets to prevent header injection
  assert.equal(
    formatSenderFromAddress(base, 'Evil\r\nBcc: victim@x.co <bad>"'),
    '"Evil Bcc: victim@x.co bad via PingCue" <reminders@getpingcue.com>'
  );
});

test("buildDeliveryIssueAlertEmail formats bounce and spam alerts with escaped HTML and invoice link", () => {
  const bounceAlert = buildDeliveryIssueAlertEmail({
    freelancerName: "Vivek",
    clientName: "Priya <Agency>",
    clientEmail: "priya@bad-domain.co",
    invoiceTitle: "Brand Sprint",
    invoiceId: "inv-123",
    reason: "bounced",
    appOrigin: "https://getpingcue.com/",
  });

  assert.match(bounceAlert.subject, /bounced for Brand Sprint/);
  assert.match(bounceAlert.text, /https:\/\/getpingcue\.com\/invoices\/inv-123/);
  assert.match(bounceAlert.text, /WhatsApp nudge/i);
  assert.ok(!bounceAlert.html.includes("<Agency>"));
  assert.ok(bounceAlert.html.includes("&lt;Agency&gt;"));

  const spamAlert = buildDeliveryIssueAlertEmail({
    freelancerName: null,
    clientName: "Rohan",
    clientEmail: "rohan@client.co",
    invoiceTitle: "Retainer",
    invoiceId: "inv-456",
    reason: "complained",
    appOrigin: null,
  });

  assert.match(spamAlert.subject, /marked a PingCue reminder as spam/);
  assert.ok(!spamAlert.text.includes("Open invoice:"));
});
