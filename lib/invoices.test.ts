import assert from "node:assert/strict";
import test from "node:test";
import {
  CURRENCIES,
  computeCurrencyTotals,
  filterInvoices,
  formatMoney,
  isValidIsoDate,
  normalizeWhatsappNumber,
  parseMajorToMinor,
  parseReminderOffsets,
  validateDisplayName,
  validateInvoiceFormData,
  type Invoice,
} from "./invoices.ts";
import { getSupabaseAdminEnv, getSupabasePublicEnv } from "./supabase-env.ts";

function makeValidFormData(overrides: Record<string, string> = {}): FormData {
  const formData = new FormData();
  const defaults: Record<string, string> = {
    title: "Design Retainer",
    client_name: "Priya",
    client_email: "priya@northstar.co",
    client_whatsapp: "919876543210",
    currency: "INR",
    amount: "45000",
    amount_received: "0",
    due_date: "2026-11-20",
    payment_link: "https://rzp.io/l/pay123",
    reminder_offsets: "-3, 0, 3, 7, 14, 30",
    paused_until: "",
    ...overrides,
  };
  for (const [key, value] of Object.entries(defaults)) {
    formData.set(key, value);
  }
  return formData;
}

test("isValidIsoDate accepts real calendar dates and rejects impossible ones", () => {
  assert.equal(isValidIsoDate("2026-11-20"), true);
  assert.equal(isValidIsoDate("2024-02-29"), true);
  assert.equal(isValidIsoDate("2026-02-29"), false);
  assert.equal(isValidIsoDate("2026-02-31"), false);
  assert.equal(isValidIsoDate("2026-99-99"), false);
  assert.equal(isValidIsoDate("not-a-date"), false);
});

test("validateInvoiceFormData requires https payment links and valid calendar dates", () => {
  const valid = validateInvoiceFormData(makeValidFormData());
  assert.equal(valid.ok, true);

  const httpLink = validateInvoiceFormData(
    makeValidFormData({ payment_link: "http://rzp.io/l/pay123" })
  );
  assert.equal(httpLink.ok, false);
  if (!httpLink.ok) {
    assert.match(httpLink.fieldErrors.payment_link ?? "", /https:\/\//);
  }

  const badDue = validateInvoiceFormData(
    makeValidFormData({ due_date: "2026-02-31" })
  );
  assert.equal(badDue.ok, false);
  if (!badDue.ok) {
    assert.ok(badDue.fieldErrors.due_date);
  }

  const badPause = validateInvoiceFormData(
    makeValidFormData({ paused_until: "2026-99-99" })
  );
  assert.equal(badPause.ok, false);
  if (!badPause.ok) {
    assert.ok(badPause.fieldErrors.paused_until);
  }
});

test("getSupabasePublicEnv and getSupabaseAdminEnv reject placeholders and invalid URLs", () => {
  const prevUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const prevAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const prevPub = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const prevService = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL =
      "https://your-project-ref.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "real-looking-anon-key";
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    assert.equal(getSupabasePublicEnv(), null);

    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://abcxyz.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "your-supabase-anon-key";
    assert.equal(getSupabasePublicEnv(), null);

    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://abcxyz.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "real-anon-key";
    assert.equal(getSupabasePublicEnv(), null);

    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_real";
    assert.deepEqual(getSupabasePublicEnv(), {
      url: "http://localhost:54321",
      anonKey: "sb_publishable_real",
    });

    process.env.SUPABASE_SERVICE_ROLE_KEY = "your-supabase-service-role-key";
    assert.equal(getSupabaseAdminEnv(), null);

    process.env.SUPABASE_SERVICE_ROLE_KEY = "real-service-role-key";
    assert.deepEqual(getSupabaseAdminEnv(), {
      url: "http://localhost:54321",
      serviceKey: "real-service-role-key",
    });
  } finally {
    if (prevUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = prevUrl;

    if (prevAnon === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = prevAnon;

    if (prevPub === undefined)
      delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = prevPub;

    if (prevService === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = prevService;
  }
});

test("validateInvoiceFormData blocks header newlines, unsafe URL credentials/length, and overpayment", () => {
  const crlfTitle = validateInvoiceFormData(
    makeValidFormData({ title: "Invoice\r\nBcc: evil@attacker.com" })
  );
  assert.equal(crlfTitle.ok, false);
  if (!crlfTitle.ok) {
    assert.ok(crlfTitle.fieldErrors.title);
  }

  const crlfClient = validateInvoiceFormData(
    makeValidFormData({ client_name: "Priya\nInjected" })
  );
  assert.equal(crlfClient.ok, false);
  if (!crlfClient.ok) {
    assert.ok(crlfClient.fieldErrors.client_name);
  }

  const credUrl = validateInvoiceFormData(
    makeValidFormData({ payment_link: "https://user:pass@rzp.io/l/pay123" })
  );
  assert.equal(credUrl.ok, false);
  if (!credUrl.ok) {
    assert.ok(credUrl.fieldErrors.payment_link);
  }

  const longUrl = validateInvoiceFormData(
    makeValidFormData({ payment_link: `https://rzp.io/l/${"a".repeat(500)}` })
  );
  assert.equal(longUrl.ok, false);
  if (!longUrl.ok) {
    assert.ok(longUrl.fieldErrors.payment_link);
  }

  const overpaid = validateInvoiceFormData(
    makeValidFormData({ amount: "1000", amount_received: "1500" })
  );
  assert.equal(overpaid.ok, false);
  if (!overpaid.ok) {
    assert.ok(overpaid.fieldErrors.amount_received);
  }
});

test("validateDisplayName trims, accepts empty as null, and rejects control chars or long names", () => {
  assert.deepEqual(validateDisplayName("   "), { ok: true, value: null });
  assert.deepEqual(validateDisplayName("  Northstar Studio  "), {
    ok: true,
    value: "Northstar Studio",
  });
  assert.equal(validateDisplayName("Name\r\nBad").ok, false);
  assert.equal(validateDisplayName("a".repeat(81)).ok, false);
});

test("filterInvoices combines status tabs and case-insensitive search queries", () => {
  const base: Invoice = {
    id: "1",
    user_id: "u1",
    title: "Northstar Retainer",
    client_name: "Priya Sharma",
    client_email: "priya@northstar.co",
    client_whatsapp: null,
    currency: "INR",
    amount_minor: 10000,
    amount_received_minor: 0,
    due_date: "2026-11-10",
    payment_link: null,
    reminder_offsets: [-3, 0, 3],
    paused_until: null,
    created_at: "2026-11-01T00:00:00Z",
    updated_at: "2026-11-01T00:00:00Z",
  };

  const invoices: Invoice[] = [
    base,
    {
      ...base,
      id: "2",
      title: "Logo Sprint",
      client_name: "Alex Rivera",
      client_email: "alex@acme.io",
      currency: "USD",
      due_date: "2026-11-28",
    },
    {
      ...base,
      id: "3",
      title: "Paid Audit",
      client_name: "Priya Sharma",
      amount_received_minor: 10000,
    },
  ];

  assert.deepEqual(
    filterInvoices(invoices, {
      status: "overdue",
      todayIso: "2026-11-20",
    }).map((i) => i.id),
    ["1"]
  );
  assert.deepEqual(
    filterInvoices(invoices, {
      status: "active",
      query: "alex",
      todayIso: "2026-11-20",
    }).map((i) => i.id),
    ["2"]
  );
  assert.deepEqual(
    filterInvoices(invoices, {
      status: "all",
      query: "PRIYA",
      todayIso: "2026-11-20",
    }).map((i) => i.id),
    ["1", "3"]
  );
  assert.deepEqual(
    filterInvoices(invoices, {
      status: "paid",
      query: "priya",
      todayIso: "2026-11-20",
    }).map((i) => i.id),
    ["3"]
  );
});

test("computeCurrencyTotals aggregates owed, overdue, and collected separately by currency", () => {
  const mk = (overrides: Partial<Invoice>): Invoice => ({
    id: "1",
    user_id: "u1",
    title: "Work",
    client_name: "Client",
    client_email: "c@example.com",
    client_whatsapp: null,
    currency: "INR",
    amount_minor: 100_000,
    amount_received_minor: 0,
    due_date: "2026-11-10",
    payment_link: null,
    reminder_offsets: [-3, 0, 3],
    paused_until: null,
    created_at: "2026-11-01T00:00:00Z",
    updated_at: "2026-11-01T00:00:00Z",
    ...overrides,
  });

  const totals = computeCurrencyTotals(
    [
      mk({ id: "1", currency: "INR", amount_minor: 500_000, amount_received_minor: 200_000, due_date: "2026-11-10" }),
      mk({ id: "2", currency: "INR", amount_minor: 100_000, amount_received_minor: 100_000, due_date: "2026-11-05" }),
      mk({ id: "3", currency: "USD", amount_minor: 200_000, amount_received_minor: 0, due_date: "2026-11-25" }),
    ],
    "2026-11-20"
  );

  assert.equal(totals.length, 2);
  assert.deepEqual(totals[0], {
    currency: "USD",
    owedMinor: 200_000,
    overdueMinor: 0,
    collectedMinor: 0,
    activeCount: 1,
    overdueCount: 0,
  });
  assert.deepEqual(totals[1], {
    currency: "INR",
    owedMinor: 300_000,
    overdueMinor: 300_000,
    collectedMinor: 300_000,
    activeCount: 1,
    overdueCount: 1,
  });
});

test("parseMajorToMinor, parseReminderOffsets, and normalizeWhatsappNumber validate edge cases", () => {
  assert.equal(parseMajorToMinor("45,000.50"), 4_500_050);
  assert.equal(parseMajorToMinor("0"), 0);
  assert.equal(parseMajorToMinor("-10"), null);
  assert.equal(parseMajorToMinor("10.123"), null);

  assert.deepEqual(parseReminderOffsets("7, -3, 0, 7"), [-3, 0, 7]);
  assert.equal(parseReminderOffsets(""), null);
  assert.equal(parseReminderOffsets("-61, 0"), null);
  assert.equal(parseReminderOffsets("181"), null);

  assert.equal(normalizeWhatsappNumber("+91 98765-43210"), "919876543210");
  assert.equal(normalizeWhatsappNumber("12345"), null);
  assert.equal(normalizeWhatsappNumber("1234567890123456"), null);
});

test("validateInvoiceFormData defaults missing currency to USD, supports all 4 currencies, and formats money", () => {
  const missingCurrency = makeValidFormData();
  missingCurrency.delete("currency");
  const parsedDefault = validateInvoiceFormData(missingCurrency);
  assert.equal(parsedDefault.ok, true);
  if (parsedDefault.ok) {
    assert.equal(parsedDefault.data.currency, "USD");
  }

  for (const currency of CURRENCIES) {
    const parsed = validateInvoiceFormData(makeValidFormData({ currency }));
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.equal(parsed.data.currency, currency);
    }
  }

  const invalid = validateInvoiceFormData(makeValidFormData({ currency: "JPY" }));
  assert.equal(invalid.ok, false);
  if (!invalid.ok) {
    assert.ok(invalid.fieldErrors.currency);
  }

  assert.equal(formatMoney(120_000, "USD"), "$1,200");
  assert.equal(formatMoney(120_050, "EUR"), "€1,200.50");
  assert.equal(formatMoney(120_000, "GBP"), "£1,200");
  assert.equal(formatMoney(2_500_000, "INR"), "₹25,000");
});
