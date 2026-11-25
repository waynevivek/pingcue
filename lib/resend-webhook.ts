import { Webhook } from "standardwebhooks";

export type ResendWebhookEvent = {
  type?: string;
  created_at?: string;
  data?: {
    email_id?: string;
    to?: string[];
    bounce?: {
      type?: string;
      subType?: string;
      message?: string;
    };
    suppressed?: {
      type?: string;
      message?: string;
    };
  };
};

export function verifyResendWebhook(
  rawBody: string,
  headers: {
    "webhook-id": string;
    "webhook-timestamp": string;
    "webhook-signature": string;
  },
  secretOverride?: string
): ResendWebhookEvent {
  const secret = (secretOverride ?? process.env.RESEND_WEBHOOK_SECRET)?.trim();
  if (!secret || secret === "whsec_your-resend-webhook-secret") {
    throw new Error("RESEND_WEBHOOK_SECRET is not configured.");
  }

  const webhook = new Webhook(secret);
  return webhook.verify(rawBody, headers) as ResendWebhookEvent;
}

export function mapResendEventToDeliveryStatus(
  eventType: string | undefined
): "delivered" | "bounced" | "complained" | null {
  switch (eventType) {
    case "email.delivered":
      return "delivered";
    case "email.bounced":
    case "email.suppressed":
      return "bounced";
    case "email.complained":
      return "complained";
    default:
      return null;
  }
}

export function getSuppressionReasonForResendEvent(
  event: ResendWebhookEvent
): "bounced" | "complained" | "suppressed" | null {
  switch (event.type) {
    case "email.complained":
      return "complained";
    case "email.suppressed":
      return "suppressed";
    case "email.bounced": {
      const bounceType = event.data?.bounce?.type?.trim().toLowerCase();
      if (bounceType === "transient") {
        return null;
      }
      return "bounced";
    }
    default:
      return null;
  }
}

export function extractResendRecipients(event: ResendWebhookEvent): string[] {
  const raw = event.data?.to;
  if (!Array.isArray(raw)) return [];
  const unique = new Set<string>();
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const clean = item.trim().toLowerCase();
    if (clean) unique.add(clean);
  }
  return Array.from(unique);
}
