import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/db";
import { isResendConfigured, sendReminderEmail } from "@/lib/email";
import { buildDeliveryIssueAlertEmail } from "@/lib/reminders";
import {
  extractResendRecipients,
  getSuppressionReasonForResendEvent,
  mapResendEventToDeliveryStatus,
  verifyResendWebhook,
  type ResendWebhookEvent,
} from "@/lib/resend-webhook";
import { resolveAppOrigin } from "@/lib/site-config";
import { getSupabaseAdminEnv } from "@/lib/supabase-env";

export async function POST(request: Request) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  if (!webhookSecret || webhookSecret === "whsec_your-resend-webhook-secret") {
    return NextResponse.json(
      { error: "RESEND_WEBHOOK_SECRET is not configured." },
      { status: 500 }
    );
  }

  if (!getSupabaseAdminEnv()) {
    return NextResponse.json(
      { error: "Supabase service credentials are not configured." },
      { status: 500 }
    );
  }

  const webhookId =
    request.headers.get("svix-id") ?? request.headers.get("webhook-id");
  const webhookTimestamp =
    request.headers.get("svix-timestamp") ??
    request.headers.get("webhook-timestamp");
  const webhookSignature =
    request.headers.get("svix-signature") ??
    request.headers.get("webhook-signature");

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    return NextResponse.json(
      { error: "Missing webhook verification headers." },
      { status: 400 }
    );
  }

  const rawBody = await request.text();

  let event: ResendWebhookEvent;
  try {
    event = verifyResendWebhook(rawBody, {
      "webhook-id": webhookId,
      "webhook-timestamp": webhookTimestamp,
      "webhook-signature": webhookSignature,
    });
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const dedupeId = `resend:${webhookId}`;

  const { data: alreadyProcessed, error: dedupeError } = await supabase
    .from("processed_webhooks")
    .select("webhook_id")
    .eq("webhook_id", dedupeId)
    .maybeSingle();

  if (dedupeError) {
    return NextResponse.json(
      { error: `Failed to check webhook idempotency: ${dedupeError.message}` },
      { status: 500 }
    );
  }

  if (alreadyProcessed) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const eventType = event.type ?? "unknown";
  const emailId =
    typeof event.data?.email_id === "string" && event.data.email_id.trim()
      ? event.data.email_id.trim()
      : null;
  const deliveryStatus = mapResendEventToDeliveryStatus(eventType);

  if (deliveryStatus && emailId) {
    let query = supabase
      .from("reminder_logs")
      .update({ delivery_status: deliveryStatus })
      .eq("resend_id", emailId);

    if (deliveryStatus === "delivered") {
      query = query.eq("delivery_status", "sent");
    }

    const { error: statusError } = await query;
    if (statusError) {
      return NextResponse.json(
        { error: `Failed to update delivery status: ${statusError.message}` },
        { status: 500 }
      );
    }
  }

  const suppressionReason = getSuppressionReasonForResendEvent(event);
  if (suppressionReason) {
    const recipients = extractResendRecipients(event);
    if (recipients.length > 0) {
      const { data: existingSuppressed } = await supabase
        .from("suppressed_emails")
        .select("email")
        .in("email", recipients);

      const alreadySuppressedSet = new Set(
        (existingSuppressed ?? [])
          .map((row) =>
            typeof row.email === "string" ? row.email.trim().toLowerCase() : ""
          )
          .filter(Boolean)
      );

      const nowIso = new Date().toISOString();
      const rows = recipients.map((email) => ({
        email,
        reason: suppressionReason,
        source_resend_id: emailId,
        updated_at: nowIso,
      }));

      const { error: suppressError } = await supabase
        .from("suppressed_emails")
        .upsert(rows, { onConflict: "email" });

      if (suppressError) {
        return NextResponse.json(
          { error: `Failed to suppress recipient: ${suppressError.message}` },
          { status: 500 }
        );
      }

      console.warn(
        JSON.stringify({
          tag: "PINGCUE_RESEND_SUPPRESS",
          webhookId,
          eventType,
          reason: suppressionReason,
          count: recipients.length,
        })
      );

      // Proactively alert the freelancer once when their client reminder email is newly suppressed.
      const newlySuppressed = recipients.some(
        (email) => !alreadySuppressedSet.has(email)
      );
      if (newlySuppressed && emailId && isResendConfigured()) {
        try {
          const { data: logRow } = await supabase
            .from("reminder_logs")
            .select("invoice_id, user_id, recipient_email")
            .eq("resend_id", emailId)
            .eq("channel", "email")
            .maybeSingle();

          if (logRow?.invoice_id && logRow?.user_id) {
            const [invoiceRes, profileRes] = await Promise.all([
              supabase
                .from("invoices")
                .select("id, title, client_name, client_email")
                .eq("id", logRow.invoice_id)
                .maybeSingle(),
              supabase
                .from("profiles")
                .select("email, display_name")
                .eq("id", logRow.user_id)
                .maybeSingle(),
            ]);

            const invoice = invoiceRes.data;
            const profile = profileRes.data;
            const freelancerEmail = profile?.email?.trim().toLowerCase() ?? "";
            const affectedEmail = (
              invoice?.client_email ||
              logRow.recipient_email ||
              recipients[0]
            )
              .trim()
              .toLowerCase();

            // Guard against bounce loops if freelancer email matches the suppressed address.
            if (
              invoice &&
              freelancerEmail &&
              freelancerEmail !== affectedEmail &&
              !recipients.includes(freelancerEmail)
            ) {
              const { data: freelancerSuppressed } = await supabase
                .from("suppressed_emails")
                .select("email")
                .eq("email", freelancerEmail)
                .maybeSingle();

              if (!freelancerSuppressed) {
                const alert = buildDeliveryIssueAlertEmail({
                  freelancerName: profile?.display_name ?? null,
                  clientName: invoice.client_name,
                  clientEmail: invoice.client_email,
                  invoiceTitle: invoice.title,
                  invoiceId: invoice.id,
                  reason: suppressionReason,
                  appOrigin: resolveAppOrigin(request.url),
                });

                const sendRes = await sendReminderEmail({
                  to: freelancerEmail,
                  subject: alert.subject,
                  text: alert.text,
                  html: alert.html,
                });

                if (!sendRes.ok) {
                  console.warn(
                    `Failed to send delivery issue alert for invoice ${invoice.id}: ${sendRes.error}`
                  );
                }
              }
            }
          }
        } catch (alertErr) {
          console.warn(
            "Failed to dispatch freelancer delivery issue alert:",
            alertErr instanceof Error ? alertErr.message : "unknown error"
          );
        }
      }
    }
  }

  const { error: auditError } = await supabase
    .from("processed_webhooks")
    .upsert(
      { webhook_id: dedupeId, event_type: eventType },
      { onConflict: "webhook_id", ignoreDuplicates: true }
    );

  if (auditError) {
    console.error(
      "Failed to record Resend processed_webhooks row:",
      auditError.message
    );
  }

  return NextResponse.json({ received: true });
}
