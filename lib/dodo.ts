import DodoPayments from "dodopayments";
import { Webhook } from "standardwebhooks";

export function isDodoConfigured(): boolean {
  const apiKey = process.env.DODO_PAYMENTS_API_KEY?.trim();
  const productId = process.env.DODO_FOUNDING_PASS_PRODUCT_ID?.trim();
  return Boolean(
    apiKey &&
      apiKey !== "your-dodo-api-key" &&
      productId &&
      productId !== "pdt_your-product-id"
  );
}

export function getDodoEnvironment(): "test_mode" | "live_mode" {
  return process.env.DODO_PAYMENTS_ENVIRONMENT?.trim() === "live_mode"
    ? "live_mode"
    : "test_mode";
}

export function isDodoLiveMode(): boolean {
  return getDodoEnvironment() === "live_mode";
}

export function isDodoCheckoutEnabled(
  nodeEnv: string | undefined = process.env.NODE_ENV
): boolean {
  if (!isDodoConfigured()) return false;
  if (nodeEnv === "production") {
    return isDodoLiveMode();
  }
  return true;
}

export async function createFoundingPassCheckout({
  userId,
  userEmail,
  returnUrl,
}: {
  userId: string;
  userEmail: string;
  returnUrl: string;
}): Promise<{ ok: true; checkoutUrl: string } | { ok: false; error: string }> {
  if (!isDodoConfigured()) {
    return {
      ok: false,
      error:
        "Dodo Payments is not configured yet. Add DODO_PAYMENTS_API_KEY and DODO_FOUNDING_PASS_PRODUCT_ID.",
    };
  }

  const client = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    environment: getDodoEnvironment(),
  });

  try {
    const session = await client.checkoutSessions.create({
      product_cart: [
        {
          product_id: process.env.DODO_FOUNDING_PASS_PRODUCT_ID!,
          quantity: 1,
        },
      ],
      customer: { email: userEmail },
      return_url: returnUrl,
      metadata: {
        user_id: userId,
        user_email: userEmail,
        plan: "founding_pass",
      },
    });

    if (!session.checkout_url) {
      return {
        ok: false,
        error: "Dodo Payments did not return a checkout URL.",
      };
    }

    return { ok: true, checkoutUrl: session.checkout_url };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to create Dodo Payments checkout session.",
    };
  }
}

export type DodoWebhookEvent = {
  type?: string;
  event_type?: string;
  data?: {
    payment_id?: string;
    refund_id?: string;
    dispute_id?: string;
    is_partial?: boolean;
    status?: string;
    customer?: {
      customer_id?: string | null;
      email?: string | null;
    };
    metadata?: Record<string, unknown>;
    product_cart?: Array<{ product_id?: string | null; quantity?: number }>;
  };
};

export function extractDodoPaymentId(event: DodoWebhookEvent): string | null {
  const raw = event.data?.payment_id;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function extractDodoCustomerId(event: DodoWebhookEvent): string | null {
  const raw = event.data?.customer?.customer_id;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

const REVOCATION_DISPUTE_EVENTS = new Set([
  "dispute.opened",
  "dispute.accepted",
  "dispute.lost",
]);

export function isRevocationWebhookEvent(
  eventType: string,
  event: DodoWebhookEvent
): boolean {
  if (eventType === "refund.succeeded") {
    return event.data?.is_partial !== true;
  }
  return REVOCATION_DISPUTE_EVENTS.has(eventType);
}

export function extractDodoMetadataString(
  metadata: Record<string, unknown> | undefined,
  key: string
): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const raw = metadata[key];
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return String(raw);
  }
  if (typeof raw === "boolean") {
    return String(raw);
  }
  return null;
}

export function isFoundingPassPaymentEvent(
  event: DodoWebhookEvent,
  expectedProductId?: string
): boolean {
  const plan = extractDodoMetadataString(event.data?.metadata, "plan");
  if (plan !== "founding_pass") {
    return false;
  }

  const trimmedProductId = expectedProductId?.trim();
  const cart = event.data?.product_cart;
  if (
    trimmedProductId &&
    trimmedProductId !== "pdt_your-product-id" &&
    Array.isArray(cart) &&
    cart.length > 0
  ) {
    return cart.some((item) => item?.product_id === trimmedProductId);
  }

  return true;
}

export function verifyDodoWebhook(
  rawBody: string,
  headers: {
    "webhook-id": string;
    "webhook-signature": string;
    "webhook-timestamp": string;
  },
  secretOverride?: string
): DodoWebhookEvent {
  const secret = (secretOverride ?? process.env.DODO_PAYMENTS_WEBHOOK_KEY)?.trim();
  if (!secret) {
    throw new Error("DODO_PAYMENTS_WEBHOOK_KEY is not configured.");
  }
  const webhook = new Webhook(secret);
  return webhook.verify(rawBody, headers) as DodoWebhookEvent;
}
