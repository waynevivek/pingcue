import assert from "node:assert/strict";
import test from "node:test";
import { Webhook } from "standardwebhooks";
import {
  extractResendRecipients,
  getSuppressionReasonForResendEvent,
  mapResendEventToDeliveryStatus,
  verifyResendWebhook,
} from "./resend-webhook.ts";
import {
  createMemoryRateLimiter,
  isAllowedSameOrigin,
  isTimingSafeBearerMatch,
} from "./security.ts";

test("isAllowedSameOrigin verifies Origin header against configured and request origins", () => {
  assert.equal(
    isAllowedSameOrigin(
      "https://pingcue.app",
      "https://pingcue.app/api/events",
      "https://pingcue.app",
      "production"
    ),
    true
  );
  assert.equal(
    isAllowedSameOrigin(
      "https://evil.com",
      "https://pingcue.app/api/events",
      "https://pingcue.app",
      "production"
    ),
    false
  );
  assert.equal(
    isAllowedSameOrigin(
      null,
      "https://pingcue.app/api/events",
      "https://pingcue.app",
      "production"
    ),
    false
  );
  assert.equal(
    isAllowedSameOrigin(
      null,
      "http://localhost:3000/api/events",
      "http://localhost:3000",
      "development"
    ),
    true
  );
  assert.equal(
    isAllowedSameOrigin(
      "https://preview-123.vercel.app",
      "http://0.0.0.0:3000/api/events",
      "https://pingcue.app",
      "production",
      "preview-123.vercel.app",
      "https"
    ),
    true
  );
});

test("createMemoryRateLimiter enforces sliding-window caps per key", () => {
  const limiter = createMemoryRateLimiter({ maxRequests: 2, windowMs: 1000 });
  assert.equal(limiter.check("1.2.3.4", 100), true);
  assert.equal(limiter.check("1.2.3.4", 200), true);
  assert.equal(limiter.check("1.2.3.4", 300), false);
  assert.equal(limiter.check("5.6.7.8", 300), true);
  assert.equal(limiter.check("1.2.3.4", 1200), true);
});

test("verifyResendWebhook validates signatures and rejects tampered payloads", () => {
  const secret = "whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw";
  const wh = new Webhook(secret);
  const id = "msg_resend_1";
  const ts = new Date();
  const payload = JSON.stringify({
    type: "email.bounced",
    data: {
      email_id: "re_123",
      to: ["Bounce@Client.co"],
      bounce: { type: "Permanent" },
    },
  });

  const sig = wh.sign(id, ts, payload);
  const headers = {
    "webhook-id": id,
    "webhook-timestamp": String(Math.floor(ts.getTime() / 1000)),
    "webhook-signature": sig,
  };

  const event = verifyResendWebhook(payload, headers, secret);
  assert.equal(event.type, "email.bounced");
  assert.deepEqual(extractResendRecipients(event), ["bounce@client.co"]);

  assert.throws(() => {
    verifyResendWebhook(payload.replace("re_123", "re_evil"), headers, secret);
  });
});

test("Resend delivery status and suppression helpers handle hard vs transient bounces", () => {
  assert.equal(mapResendEventToDeliveryStatus("email.delivered"), "delivered");
  assert.equal(mapResendEventToDeliveryStatus("email.bounced"), "bounced");
  assert.equal(mapResendEventToDeliveryStatus("email.suppressed"), "bounced");
  assert.equal(mapResendEventToDeliveryStatus("email.complained"), "complained");
  assert.equal(mapResendEventToDeliveryStatus("email.opened"), null);

  assert.equal(
    getSuppressionReasonForResendEvent({
      type: "email.bounced",
      data: { bounce: { type: "Permanent" } },
    }),
    "bounced"
  );
  assert.equal(
    getSuppressionReasonForResendEvent({
      type: "email.bounced",
      data: { bounce: { type: "Transient" } },
    }),
    null
  );
  assert.equal(
    getSuppressionReasonForResendEvent({ type: "email.complained" }),
    "complained"
  );
  assert.equal(
    getSuppressionReasonForResendEvent({ type: "email.suppressed" }),
    "suppressed"
  );
  assert.equal(
    getSuppressionReasonForResendEvent({ type: "email.delivered" }),
    null
  );
});

test("isTimingSafeBearerMatch validates exact Bearer tokens in constant time", () => {
  assert.equal(isTimingSafeBearerMatch("Bearer super-secret-key", "super-secret-key"), true);
  assert.equal(isTimingSafeBearerMatch("Bearer wrong-secret-key", "super-secret-key"), false);
  assert.equal(isTimingSafeBearerMatch("Bearer short", "super-secret-key"), false);
  assert.equal(isTimingSafeBearerMatch("super-secret-key", "super-secret-key"), false);
  assert.equal(isTimingSafeBearerMatch(null, "super-secret-key"), false);
  assert.equal(isTimingSafeBearerMatch("Bearer ", ""), false);
});
