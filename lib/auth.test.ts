import assert from "node:assert/strict";
import test from "node:test";
import { getAuthCallbackErrorMessage, sanitizeRedirectPath } from "./auth.ts";
import {
  DEFAULT_SUPPORT_EMAIL,
  getMetadataBase,
  getSiteUrl,
  getSupportEmail,
  resolveAppOrigin,
} from "./site-config.ts";

test("sanitizeRedirectPath keeps valid relative routes and rejects open redirects", () => {
  assert.equal(sanitizeRedirectPath("/dashboard"), "/dashboard");
  assert.equal(
    sanitizeRedirectPath("/dashboard?upgrade=1"),
    "/dashboard?upgrade=1"
  );
  assert.equal(
    sanitizeRedirectPath("  /auth/reset-password#form  "),
    "/auth/reset-password#form"
  );

  assert.equal(sanitizeRedirectPath(null), "/dashboard");
  assert.equal(sanitizeRedirectPath(""), "/dashboard");
  assert.equal(sanitizeRedirectPath("dashboard"), "/dashboard");
  assert.equal(sanitizeRedirectPath("//evil.com"), "/dashboard");
  assert.equal(sanitizeRedirectPath("https://evil.com/phish"), "/dashboard");
  assert.equal(sanitizeRedirectPath("/\\evil.com"), "/dashboard");
  assert.equal(sanitizeRedirectPath("/dashboard\r\nSet-Cookie: a=b"), "/dashboard");
  assert.equal(
    sanitizeRedirectPath("javascript:alert(1)", "/login"),
    "/login"
  );
});

test("getAuthCallbackErrorMessage maps only known safe error codes", () => {
  assert.ok(getAuthCallbackErrorMessage("auth_callback_failed"));
  assert.equal(getAuthCallbackErrorMessage("arbitrary_xss_text"), undefined);
  assert.equal(getAuthCallbackErrorMessage(undefined), undefined);
});

test("resolveAppOrigin enforces https non-localhost in production and supports dev fallback", () => {
  const prevUrl = process.env.NEXT_PUBLIC_APP_URL;

  try {
    process.env.NEXT_PUBLIC_APP_URL = "https://pingcue.app";
    assert.equal(
      resolveAppOrigin("http://localhost:3000/api/checkout", "production"),
      "https://pingcue.app"
    );

    process.env.NEXT_PUBLIC_APP_URL = "http://pingcue.app";
    assert.equal(
      resolveAppOrigin("https://pingcue.app/api/checkout", "production"),
      null
    );

    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    assert.equal(
      resolveAppOrigin("http://localhost:3000/api/checkout", "production"),
      null
    );
    assert.equal(
      resolveAppOrigin(undefined, "development"),
      "http://localhost:3000"
    );

    process.env.NEXT_PUBLIC_APP_URL = "https://your-domain.com";
    assert.equal(resolveAppOrigin(undefined, "production"), null);

    delete process.env.NEXT_PUBLIC_APP_URL;
    assert.equal(resolveAppOrigin(undefined, "production"), null);
    assert.equal(
      resolveAppOrigin("http://localhost:3000/api/checkout", "development"),
      "http://localhost:3000"
    );
  } finally {
    if (prevUrl === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
    else process.env.NEXT_PUBLIC_APP_URL = prevUrl;
  }
});

test("getSupportEmail uses env override when configured and falls back cleanly", () => {
  const prevSupport = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

  try {
    delete process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
    assert.equal(getSupportEmail(), DEFAULT_SUPPORT_EMAIL);

    process.env.NEXT_PUBLIC_SUPPORT_EMAIL = "  support@pingcue.app  ";
    assert.equal(getSupportEmail(), "support@pingcue.app");
  } finally {
    if (prevSupport === undefined) delete process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
    else process.env.NEXT_PUBLIC_SUPPORT_EMAIL = prevSupport;
  }
});

test("getSiteUrl and getMetadataBase resolve canonical URL and ignore placeholders", () => {
  const prevUrl = process.env.NEXT_PUBLIC_APP_URL;

  try {
    process.env.NEXT_PUBLIC_APP_URL = "https://pingcue.app/some/path";
    assert.equal(getSiteUrl(), "https://pingcue.app");
    assert.equal(getMetadataBase().origin, "https://pingcue.app");

    process.env.NEXT_PUBLIC_APP_URL = "https://your-domain.com";
    assert.equal(getSiteUrl(), "http://localhost:3000");

    delete process.env.NEXT_PUBLIC_APP_URL;
    assert.equal(getSiteUrl(), "http://localhost:3000");
  } finally {
    if (prevUrl === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
    else process.env.NEXT_PUBLIC_APP_URL = prevUrl;
  }
});
