import assert from "node:assert/strict";
import test from "node:test";
import { Webhook } from "standardwebhooks";
import { verifyDodoWebhook } from "./dodo";

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
