import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/db";
import { isResendConfigured, sendReminderEmail } from "@/lib/email";
import {
  addDaysIso,
  formatMoney,
  getRemainingMinor,
  getTodayIsoDate,
  isInvoiceActive,
  isInvoicePaused,
  type Invoice,
} from "@/lib/invoices";
import {
  buildCronAlertEmail,
  buildFreelancerDigestEmail,
  buildReminderEmail,
  findDueReminderOffset,
  getSentOffsetsForDueDate,
  type DigestReminderItem,
} from "@/lib/reminders";
import { isTimingSafeBearerMatch } from "@/lib/security";
import { SUPPORT_EMAIL } from "@/lib/site-config";
import { getSupabaseAdminEnv } from "@/lib/supabase-env";

export const maxDuration = 60;

// Leave headroom under Resend's 100/day free cap for manual sends & digests.
const MAX_SENDS_PER_RUN = 80;
const PAGE_SIZE = 500;
const QUERY_CHUNK_SIZE = 200;
const SEND_CONCURRENCY = 5;

type CronProfile = {
  id: string;
  email: string;
  display_name: string | null;
  notify_on_send: boolean;
};

type DueJob = {
  invoice: Invoice;
  offsetDays: number;
  profile: CronProfile;
};

function chunkArray<T>(items: readonly T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function pingCronHeartbeat(): Promise<void> {
  const rawUrl = process.env.CRON_HEARTBEAT_URL?.trim();
  if (!rawUrl) return;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:") return;
    await fetch(parsed.toString(), {
      method: "GET",
      signal: AbortSignal.timeout(4000),
    });
  } catch (err) {
    console.warn(
      "Cron heartbeat ping failed:",
      err instanceof Error ? err.message : "unknown error"
    );
  }
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

  if (
    !isTimingSafeBearerMatch(request.headers.get("authorization"), cronSecret)
  ) {
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

  // Paginate active unpaused invoices via stored is_active column to avoid PostgREST's 1,000-row cap.
  const candidates: Invoice[] = [];
  let from = 0;

  while (true) {
    const { data: page, error: invoicesError } = await supabase
      .from("invoices")
      .select(
        "id, user_id, title, client_name, client_email, client_whatsapp, currency, amount_minor, amount_received_minor, due_date, payment_link, reminder_offsets, paused_until, created_at, updated_at"
      )
      .eq("is_active", true)
      .or(`paused_until.is.null,paused_until.lt.${todayIso}`)
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (invoicesError) {
      return NextResponse.json(
        { error: `Failed to query invoices: ${invoicesError.message}` },
        { status: 500 }
      );
    }

    const rows = (page ?? []) as Invoice[];
    for (const invoice of rows) {
      if (isInvoiceActive(invoice) && !isInvoicePaused(invoice, todayIso)) {
        candidates.push(invoice);
      }
    }

    if (rows.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  if (candidates.length === 0) {
    await pingCronHeartbeat();
    return NextResponse.json({
      ok: true,
      date: todayIso,
      checked: 0,
      due: 0,
      sent: 0,
      failed: 0,
      skippedCap: 0,
      skippedUnconfirmed: 0,
      skippedSuppressed: 0,
    });
  }

  const userIds = Array.from(new Set(candidates.map((inv) => inv.user_id)));
  const invoiceIds = candidates.map((inv) => inv.id);
  const clientEmails = Array.from(
    new Set(candidates.map((inv) => inv.client_email.trim().toLowerCase()))
  );

  const profileByUserId = new Map<string, CronProfile>();
  const confirmedUserIds = new Set<string>();
  const logsByInvoice = new Map<
    string,
    Array<{
      channel: "email";
      offset_days: number;
      scheduled_for: string | null;
    }>
  >();
  const suppressedEmails = new Set<string>();

  try {
    await Promise.all([
      ...chunkArray(userIds, QUERY_CHUNK_SIZE).map(async (chunk) => {
        const [profilesRes, confirmedRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, email, display_name, notify_on_send")
            .in("id", chunk),
          supabase.rpc("get_confirmed_user_ids", { p_user_ids: chunk }),
        ]);

        if (profilesRes.error) {
          throw new Error(profilesRes.error.message);
        }
        if (confirmedRes.error) {
          throw new Error(confirmedRes.error.message);
        }

        for (const row of profilesRes.data ?? []) {
          if (row.id && row.email) {
            profileByUserId.set(row.id as string, {
              id: row.id as string,
              email: row.email as string,
              display_name: (row.display_name as string | null) ?? null,
              notify_on_send:
                typeof row.notify_on_send === "boolean"
                  ? row.notify_on_send
                  : true,
            });
          }
        }

        for (const confirmedId of (confirmedRes.data ?? []) as string[]) {
          confirmedUserIds.add(confirmedId);
        }
      }),
      ...chunkArray(invoiceIds, QUERY_CHUNK_SIZE).map(async (chunk) => {
        const logsRes = await supabase
          .from("reminder_logs")
          .select("invoice_id, offset_days, scheduled_for")
          .eq("channel", "email")
          .in("invoice_id", chunk);

        if (logsRes.error) {
          throw new Error(logsRes.error.message);
        }

        for (const row of logsRes.data ?? []) {
          const invId = row.invoice_id as string;
          const list = logsByInvoice.get(invId) ?? [];
          list.push({
            channel: "email",
            offset_days: row.offset_days as number,
            scheduled_for: (row.scheduled_for as string | null) ?? null,
          });
          logsByInvoice.set(invId, list);
        }
      }),
      ...chunkArray(clientEmails, QUERY_CHUNK_SIZE).map(async (chunk) => {
        const suppressedRes = await supabase
          .from("suppressed_emails")
          .select("email")
          .in("email", chunk);

        if (suppressedRes.error) {
          throw new Error(suppressedRes.error.message);
        }

        for (const row of suppressedRes.data ?? []) {
          if (row.email) {
            suppressedEmails.add((row.email as string).trim().toLowerCase());
          }
        }
      }),
    ]);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to load profiles, logs, or suppression state.",
      },
      { status: 500 }
    );
  }

  let due = 0;
  let failed = 0;
  let skippedCap = 0;
  let skippedUnconfirmed = 0;
  let skippedSuppressed = 0;
  const errors: string[] = [];
  const jobs: DueJob[] = [];

  for (const invoice of candidates) {
    const invoiceLogs = logsByInvoice.get(invoice.id) ?? [];
    const sentOffsets = getSentOffsetsForDueDate(invoiceLogs, invoice.due_date);
    const offsetDays = findDueReminderOffset(invoice, sentOffsets, todayIso);
    if (offsetDays === null) continue;

    due += 1;

    if (!confirmedUserIds.has(invoice.user_id)) {
      skippedUnconfirmed += 1;
      continue;
    }

    const cleanClientEmail = invoice.client_email.trim().toLowerCase();
    if (suppressedEmails.has(cleanClientEmail)) {
      skippedSuppressed += 1;
      continue;
    }

    const profile = profileByUserId.get(invoice.user_id);
    if (!profile?.email) {
      failed += 1;
      errors.push(`Invoice ${invoice.id}: missing freelancer profile email.`);
      continue;
    }

    if (jobs.length >= MAX_SENDS_PER_RUN) {
      skippedCap += 1;
      continue;
    }

    jobs.push({ invoice, offsetDays, profile });
  }

  let sent = 0;
  let quotaHit = false;
  const digestByUserId = new Map<
    string,
    { profile: CronProfile; items: DigestReminderItem[] }
  >();

  for (let i = 0; i < jobs.length; i += SEND_CONCURRENCY) {
    if (quotaHit) {
      skippedCap += jobs.length - i;
      break;
    }

    const batch = jobs.slice(i, i + SEND_CONCURRENCY);

    await Promise.all(
      batch.map(async ({ invoice, offsetDays, profile }) => {
        const scheduledFor = addDaysIso(invoice.due_date, offsetDays);
        const email = buildReminderEmail({
          invoice,
          offsetDays,
          freelancerEmail: profile.email,
          freelancerName: profile.display_name,
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
            delivery_status: "sent",
            scheduled_for: scheduledFor,
            resend_id: null,
          })
          .select("id")
          .single();

        if (claimError) {
          if (claimError.code === "23505") {
            return;
          }
          failed += 1;
          errors.push(`Invoice ${invoice.id} claim error: ${claimError.message}`);
          return;
        }

        if (!claimed) {
          failed += 1;
          errors.push(
            `Invoice ${invoice.id}: failed to acquire reminder send lock.`
          );
          return;
        }

        const result = await sendReminderEmail({
          to: invoice.client_email,
          replyTo: profile.email,
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
            quotaHit = true;
          }
          return;
        }

        const { error: updateError } = await supabase
          .from("reminder_logs")
          .update({ resend_id: result.id || null })
          .eq("id", claimed.id);

        if (updateError) {
          errors.push(`Invoice ${invoice.id} log error: ${updateError.message}`);
        }

        sent += 1;

        if (profile.notify_on_send) {
          const remainingMinor = getRemainingMinor(
            invoice.amount_minor,
            invoice.amount_received_minor
          );
          const displayMinor =
            remainingMinor > 0 ? remainingMinor : invoice.amount_minor;
          const entry = digestByUserId.get(profile.id) ?? {
            profile,
            items: [],
          };
          entry.items.push({
            title: invoice.title,
            clientName: invoice.client_name,
            clientEmail: invoice.client_email,
            amountFormatted: formatMoney(displayMinor, invoice.currency),
            offsetDays,
            tone: email.tone,
          });
          digestByUserId.set(profile.id, entry);
        }
      })
    );
  }

  // Send 1 concise daily confirmation digest per opted-in freelancer after client sends.
  if (!quotaHit && digestByUserId.size > 0) {
    for (const { profile, items } of digestByUserId.values()) {
      const digest = buildFreelancerDigestEmail({
        freelancerName: profile.display_name,
        freelancerEmail: profile.email,
        dateIso: todayIso,
        items,
      });

      const digestResult = await sendReminderEmail({
        to: profile.email,
        subject: digest.subject,
        text: digest.text,
        html: digest.html,
      });

      if (!digestResult.ok) {
        console.warn(
          `Failed to send daily digest to ${profile.id}: ${digestResult.error}`
        );
        if (digestResult.quotaExceeded) break;
      }
    }
  }

  const summary = {
    ok: failed === 0,
    date: todayIso,
    checked: candidates.length,
    due,
    sent,
    failed,
    skippedCap,
    skippedUnconfirmed,
    skippedSuppressed,
    ...(errors.length > 0 ? { errors: errors.slice(0, 10) } : {}),
  };

  if (failed > 0) {
    console.error(JSON.stringify({ tag: "PINGCUE_CRON", ...summary }));

    if (!quotaHit && isResendConfigured()) {
      try {
        const alertRecipient =
          process.env.CRON_ALERT_EMAIL?.trim() || SUPPORT_EMAIL;
        const alertEmail = buildCronAlertEmail({ dateIso: todayIso, summary });
        await sendReminderEmail({
          to: alertRecipient,
          subject: alertEmail.subject,
          text: alertEmail.text,
          html: alertEmail.html,
        });
      } catch (alertErr) {
        console.error(
          "Failed to send cron failure alert email:",
          alertErr instanceof Error ? alertErr.message : "unknown error"
        );
      }
    }

    return NextResponse.json(summary, { status: 500 });
  }

  await pingCronHeartbeat();
  console.info(JSON.stringify({ tag: "PINGCUE_CRON", ...summary }));
  return NextResponse.json(summary);
}
