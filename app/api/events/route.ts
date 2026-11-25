import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/db";
import {
  createMemoryRateLimiter,
  isAllowedSameOrigin,
} from "@/lib/security";
import { resolveAppOrigin } from "@/lib/site-config";
import { getSupabaseAdminEnv } from "@/lib/supabase-env";

const ALLOWED_EVENTS = new Set([
  "founding_pass_click",
  "founding_pass_email",
]);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const eventsRateLimiter = createMemoryRateLimiter({
  maxRequests: 20,
  windowMs: 5 * 60 * 1000,
});

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function POST(request: Request) {
  const configuredOrigin = resolveAppOrigin(request.url);
  if (
    !isAllowedSameOrigin(
      request.headers.get("origin"),
      request.url,
      configuredOrigin,
      process.env.NODE_ENV,
      request.headers.get("x-forwarded-host") ?? request.headers.get("host"),
      request.headers.get("x-forwarded-proto")
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!eventsRateLimiter.check(getClientIp(request))) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { event, source, email, website } = body as Record<string, unknown>;

  // Honeypot trap for bots: acknowledge cleanly without persisting spam.
  if (typeof website === "string" && website.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  if (typeof event !== "string" || !ALLOWED_EVENTS.has(event)) {
    return NextResponse.json({ error: "Unsupported event" }, { status: 400 });
  }

  const cleanSource =
    typeof source === "string" ? source.trim().slice(0, 64) : "unknown";

  const hasAdmin = Boolean(getSupabaseAdminEnv());
  const supabase = hasAdmin ? createSupabaseAdminClient() : null;

  let cleanEmail: string | undefined;
  if (event === "founding_pass_email") {
    if (
      typeof email !== "string" ||
      !EMAIL_PATTERN.test(email.trim()) ||
      email.trim().length > 254
    ) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }
    cleanEmail = email.trim().toLowerCase();

    if (supabase) {
      const { error: leadError } = await supabase
        .from("founding_pass_leads")
        .upsert(
          {
            email: cleanEmail,
            source: cleanSource,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "email" }
        );

      if (leadError) {
        console.error(
          "Failed to persist Founding Pass lead:",
          leadError.message
        );
        return NextResponse.json(
          { error: "Could not save your email right now. Please try again." },
          { status: 500 }
        );
      }
    }
  }

  if (supabase) {
    const emailDomain = cleanEmail ? cleanEmail.split("@")[1] ?? null : null;
    const { error: analyticsError } = await supabase
      .from("analytics_events")
      .insert({
        event,
        source: cleanSource,
        metadata: emailDomain ? { email_domain: emailDomain } : {},
      });

    if (analyticsError) {
      console.error(
        "Failed to persist analytics event:",
        analyticsError.message
      );
    }
  }

  console.info(
    JSON.stringify({
      tag: "PINGCUE_EVENT",
      event,
      source: cleanSource,
      ...(cleanEmail ? { email: cleanEmail } : {}),
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get("user-agent")?.slice(0, 160) ?? null,
    })
  );

  return NextResponse.json({ ok: true });
}
