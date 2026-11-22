import assert from "node:assert/strict";
import test from "node:test";
import { Webhook } from "standardwebhooks";
import {
  extractDodoMetadataString,
  isDodoCheckoutEnabled,
  isDodoLiveMode,
  isFoundingPassPaymentEvent,
  verifyDodoWebhook,
} from "./dodo.ts";

test("verifyDodoWebhook validates real Standard Webhooks signatures and rejects tampering", () => {
  // Valid base64 secret prefixed with whsec_
  const testSecret = "whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw";
  const wh = new Webhook(testSecret);
  const webhookId = "msg_test_123";
  const timestamp = new Date();
  const payload = JSON.stringify({
    type: "payment.succeeded",
    data: {
      payment_id: "pay_test_1",
      metadata: { user_id: "user-abc", plan: "founding_pass" },
    },
  });

  const signature = wh.sign(webhookId, timestamp, payload);
  const headers = {
    "webhook-id": webhookId,
    "webhook-signature": signature,
    "webhook-timestamp": String(Math.floor(timestamp.getTime() / 1000)),
  };

  const verified = verifyDodoWebhook(payload, headers, testSecret);
  assert.equal(verified.type, "payment.succeeded");
  assert.equal(verified.data?.metadata?.user_id, "user-abc");

  assert.throws(() => {
    verifyDodoWebhook(payload.replace("user-abc", "user-evil"), headers, testSecret);
  });
});

test("extractDodoMetadataString safely coerces strings, numbers, booleans, and missing keys", () => {
  const metadata = {
    user_id: "  user-123  ",
    attempt: 2,
    is_founder: true,
    empty: "   ",
    nested: { a: 1 },
  };

  assert.equal(extractDodoMetadataString(metadata, "user_id"), "user-123");
  assert.equal(extractDodoMetadataString(metadata, "attempt"), "2");
  assert.equal(extractDodoMetadataString(metadata, "is_founder"), "true");
  assert.equal(extractDodoMetadataString(metadata, "empty"), null);
  assert.equal(extractDodoMetadataString(metadata, "nested"), null);
  assert.equal(extractDodoMetadataString(metadata, "missing"), null);
  assert.equal(extractDodoMetadataString(undefined, "user_id"), null);
});

test("isFoundingPassPaymentEvent verifies founding_pass plan and matching product cart", () => {
  assert.equal(
    isFoundingPassPaymentEvent(
      {
        type: "payment.succeeded",
        data: {
          metadata: { plan: "founding_pass" },
          product_cart: [{ product_id: "pdt_live_123", quantity: 1 }],
        },
      },
      "pdt_live_123"
    ),
    true
  );

  assert.equal(
    isFoundingPassPaymentEvent(
      {
        type: "payment.succeeded",
        data: {
          metadata: { plan: "other_plan" },
          product_cart: [{ product_id: "pdt_live_123", quantity: 1 }],
        },
      },
      "pdt_live_123"
    ),
    false
  );

  assert.equal(
    isFoundingPassPaymentEvent(
      {
        type: "payment.succeeded",
        data: {
          metadata: { plan: "founding_pass" },
          product_cart: [{ product_id: "pdt_wrong", quantity: 1 }],
        },
      },
      "pdt_live_123"
    ),
    false
  );

  // When product_cart is omitted or empty in a webhook payload, plan metadata still passes.
  assert.equal(
    isFoundingPassPaymentEvent(
      {
        type: "payment.succeeded",
        data: {
          metadata: { plan: "founding_pass" },
          product_cart: [],
        },
      },
      "pdt_live_123"
    ),
    true
  );
});

test("isDodoLiveMode and isDodoCheckoutEnabled block test_mode checkout in production", () => {
  const prevEnv = process.env.DODO_PAYMENTS_ENVIRONMENT;
  const prevApiKey = process.env.DODO_PAYMENTS_API_KEY;
  const prevProductId = process.env.DODO_FOUNDING_PASS_PRODUCT_ID;

  try {
    process.env.DODO_PAYMENTS_API_KEY = "dodo_test_key_123";
    process.env.DODO_FOUNDING_PASS_PRODUCT_ID = "pdt_real_123";
    process.env.DODO_PAYMENTS_ENVIRONMENT = "test_mode";

    assert.equal(isDodoLiveMode(), false);
    assert.equal(isDodoCheckoutEnabled("development"), true);
    assert.equal(isDodoCheckoutEnabled("production"), false);

    process.env.DODO_PAYMENTS_ENVIRONMENT = "live_mode";
    assert.equal(isDodoLiveMode(), true);
    assert.equal(isDodoCheckoutEnabled("production"), true);

    process.env.DODO_PAYMENTS_API_KEY = "your-dodo-api-key";
    assert.equal(isDodoCheckoutEnabled("production"), false);
  } finally {
    if (prevEnv === undefined) delete process.env.DODO_PAYMENTS_ENVIRONMENT;
    else process.env.DODO_PAYMENTS_ENVIRONMENT = prevEnv;

    if (prevApiKey === undefined) delete process.env.DODO_PAYMENTS_API_KEY;
    else process.env.DODO_PAYMENTS_API_KEY = prevApiKey;

    if (prevProductId === undefined)
      delete process.env.DODO_FOUNDING_PASS_PRODUCT_ID;
    else process.env.DODO_FOUNDING_PASS_PRODUCT_ID = prevProductId;
  }
});
