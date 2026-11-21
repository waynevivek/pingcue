import assert from "node:assert/strict";
import test from "node:test";
import type { Invoice } from "./invoices";
import {
  buildReminderEmail,
  buildWhatsappNudge,
  findDueReminderOffset,
  getNextReminderOffset,
} from "./reminders";

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
