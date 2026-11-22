import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/db";
import { sendReminderEmail } from "@/lib/email";
import {
  getTodayIsoDate,
  isInvoiceActive,
  isInvoicePaused,
  type Invoice,
} from "@/lib/invoices";
import { buildReminderEmail, findDueReminderOffset } from "@/lib/reminders";
import { getSupabaseAdminEnv } from "@/lib/supabase-env";

export const maxDuration = 60;

// Leave headroom under Resend's 100/day free cap for manual "Send test email" calls.
const MAX_SENDS_PER_RUN = 80;

function isAuthorizedCron(authHeader: string | null, secret: string): boolean {
  if (!authHeader) return false;
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(authHeader, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (
    !cronSecret ||
    cronSecret.length < 16 ||
    cronSecret.startsWith("replace-with-")
  ) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured on the server." },
      { status: 500 }
    );
  }

  if (!isAuthorizedCron(request.headers.get("authorization"), cronSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!getSupabaseAdminEnv()) {
    return NextResponse.json(
      { error: "Supabase service credentials are not configured." },
      { status: 500 }
    );
  }

  const supabase = createSupabaseAdminClient();
  const todayIso = getTodayIsoDate();

  const { data: allInvoices, error: invoicesError } = await supabase
    .from("invoices")
    .select(
      "id, user_id, title, client_name, client_email, client_whatsapp, currency, amount_minor, amount_received_minor, due_date, payment_link, reminder_offsets, paused_until, created_at, updated_at"
    )
    .or(`paused_until.is.null,paused_until.lt.${todayIso}`);

  if (invoicesError) {
    return NextResponse.json(
      { error: `Failed to query invoices: ${invoicesError.message}` },
      { status: 500 }
    );
  }

  const candidates = ((allInvoices ?? []) as Invoice[]).filter(
    (invoice) => isInvoiceActive(invoice) && !isInvoicePaused(invoice, todayIso)
  );

  if (candidates.length === 0) {
    return NextResponse.json({
      ok: true,
      date: todayIso,
      checked: 0,
      due: 0,
      sent: 0,
      failed: 0,
      skippedCap: 0,
    });
  }

  const userIds = Array.from(new Set(candidates.map((inv) => inv.user_id)));
  const invoiceIds = candidates.map((inv) => inv.id);

  const [profilesRes, logsRes] = await Promise.all([
    supabase.from("profiles").select("id, email").in("id", userIds),
    supabase
      .from("reminder_logs")
      .select("invoice_id, offset_days")
      .eq("channel", "email")
      .in("invoice_id", invoiceIds),
  ]);

  if (profilesRes.error || logsRes.error) {
    return NextResponse.json(
      {
        error:
          profilesRes.error?.message ??
          logsRes.error?.message ??
          "Failed to load profiles or reminder logs.",
      },
      { status: 500 }
    );
  }

  const emailByUserId = new Map<string, string>();
  for (const row of profilesRes.data ?? []) {
    if (row.id && row.email) {
      emailByUserId.set(row.id as string, row.email as string);
    }
  }

  const sentByInvoice = new Map<string, Set<number>>();
  for (const row of logsRes.data ?? []) {
    const invId = row.invoice_id as string;
    const set = sentByInvoice.get(invId) ?? new Set<number>();
    set.add(row.offset_days as number);
    sentByInvoice.set(invId, set);
  }

  let due = 0;
  let sent = 0;
  let failed = 0;
  let skippedCap = 0;
  const errors: string[] = [];

  for (const invoice of candidates) {
    const sentOffsets = sentByInvoice.get(invoice.id) ?? new Set<number>();
    const offsetDays = findDueReminderOffset(invoice, sentOffsets, todayIso);
    if (offsetDays === null) continue;

    due += 1;

    if (sent >= MAX_SENDS_PER_RUN) {
      skippedCap += 1;
      continue;
    }

    const freelancerEmail = emailByUserId.get(invoice.user_id);
    if (!freelancerEmail) {
      failed += 1;
      errors.push(`Invoice ${invoice.id}: missing freelancer profile email.`);
      continue;
    }

    const email = buildReminderEmail({
      invoice,
      offsetDays,
      freelancerEmail,
      isTest: false,
    });

    // Claim the send slot before calling Resend so crashes/timeouts cannot duplicate client emails.
    const { data: claimed, error: claimError } = await supabase
      .from("reminder_logs")
      .insert({
        invoice_id: invoice.id,
        user_id: invoice.user_id,
        offset_days: offsetDays,
        channel: "email",
        recipient_email: invoice.client_email,
        resend_id: null,
      })
      .select("id")
      .single();

    if (claimError) {
      if (claimError.code === "23505") {
        continue;
      }
      failed += 1;
      errors.push(`Invoice ${invoice.id} claim error: ${claimError.message}`);
      continue;
    }

    if (!claimed) {
      failed += 1;
      errors.push(`Invoice ${invoice.id}: failed to acquire reminder send lock.`);
      continue;
    }

    const result = await sendReminderEmail({
      to: invoice.client_email,
      replyTo: freelancerEmail,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });

    if (!result.ok) {
      const { error: releaseError } = await supabase
        .from("reminder_logs")
        .delete()
        .eq("id", claimed.id);

      if (releaseError) {
        errors.push(
          `Invoice ${invoice.id} claim release error: ${releaseError.message}`
        );
      }

      failed += 1;
      errors.push(`Invoice ${invoice.id}: ${result.error}`);
      if (result.quotaExceeded) {
        break;
      }
      continue;
    }

    const { error: updateError } = await supabase
      .from("reminder_logs")
      .update({ resend_id: result.id || null })
      .eq("id", claimed.id);

    if (updateError) {
      errors.push(`Invoice ${invoice.id} log error: ${updateError.message}`);
    }

    sent += 1;
  }

  const summary = {
    ok: failed === 0,
    date: todayIso,
    checked: candidates.length,
    due,
    sent,
    failed,
    skippedCap,
    ...(errors.length > 0 ? { errors: errors.slice(0, 10) } : {}),
  };

  if (failed > 0) {
    console.error(JSON.stringify({ tag: "PINGCUE_CRON", ...summary }));
    return NextResponse.json(summary, { status: 500 });
  }

  console.info(JSON.stringify({ tag: "PINGCUE_CRON", ...summary }));
  return NextResponse.json(summary);
}
