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
    status?: string;
    customer?: { email?: string | null };
    metadata?: Record<string, string | undefined>;
  };
};

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
