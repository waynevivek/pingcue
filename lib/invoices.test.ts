import assert from "node:assert/strict";
import test from "node:test";
import { isValidIsoDate, validateInvoiceFormData } from "./invoices.ts";
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
