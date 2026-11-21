import { NextResponse } from "next/server";
import { createSupabaseAdminClient, isSupabaseConfigured } from "@/lib/db";
import { verifyDodoWebhook, type DodoWebhookEvent } from "@/lib/dodo";

export async function POST(request: Request) {
  const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_KEY?.trim();
  if (!webhookSecret || webhookSecret === "whsec_your-dodo-webhook-secret") {
    return NextResponse.json(
      { error: "DODO_PAYMENTS_WEBHOOK_KEY is not configured." },
      { status: 500 }
    );
  }

  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Supabase service credentials are not configured." },
      { status: 500 }
    );
  }

  const webhookId = request.headers.get("webhook-id");
  const webhookSignature = request.headers.get("webhook-signature");
  const webhookTimestamp = request.headers.get("webhook-timestamp");

  if (!webhookId || !webhookSignature || !webhookTimestamp) {
    return NextResponse.json(
      { error: "Missing Standard Webhooks headers." },
      { status: 400 }
    );
  }

  // Must verify against raw unparsed body bytes.
  const rawBody = await request.text();

  let event: DodoWebhookEvent;
  try {
    event = verifyDodoWebhook(rawBody, {
      "webhook-id": webhookId,
      "webhook-signature": webhookSignature,
      "webhook-timestamp": webhookTimestamp,
    });
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const eventType = event.type ?? event.event_type ?? "unknown";
  const supabase = createSupabaseAdminClient();

  // Claim webhook_id first so concurrent or retried deliveries are idempotent.
  const { error: claimError } = await supabase
    .from("processed_webhooks")
    .insert({ webhook_id: webhookId, event_type: eventType });

  if (claimError) {
    if (claimError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    return NextResponse.json(
      { error: `Failed to record webhook: ${claimError.message}` },
      { status: 500 }
    );
  }

  if (eventType === "payment.succeeded") {
    const userId = event.data?.metadata?.user_id?.trim();
    const fallbackEmail =
      event.data?.metadata?.user_email?.trim().toLowerCase() ??
      event.data?.customer?.email?.trim().toLowerCase();

    let updateError: { message: string } | null = null;

    if (userId) {
      const { error } = await supabase
        .from("profiles")
        .update({
          plan: "founding_pass",
          founding_pass_unlocked_at: new Date().toISOString(),
        })
        .eq("id", userId);
      updateError = error;
    } else if (fallbackEmail) {
      const { error } = await supabase
        .from("profiles")
        .update({
          plan: "founding_pass",
          founding_pass_unlocked_at: new Date().toISOString(),
        })
        .ilike("email", fallbackEmail);
      updateError = error;
    }

    if (updateError) {
      // Release idempotency claim so Dodo can retry cleanly.
      await supabase
        .from("processed_webhooks")
        .delete()
        .eq("webhook_id", webhookId);

      return NextResponse.json(
        { error: `Failed to unlock Founding Pass: ${updateError.message}` },
        { status: 500 }
      );
    }

    console.info(
      JSON.stringify({
        tag: "PINGCUE_DODO_UNLOCK",
        webhookId,
        paymentId: event.data?.payment_id ?? null,
        userId: userId ?? null,
      })
    );
  }

  return NextResponse.json({ received: true });
}
