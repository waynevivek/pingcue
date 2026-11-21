import { NextResponse } from "next/server";

const ALLOWED_EVENTS = new Set([
  "founding_pass_click",
  "founding_pass_email",
]);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { event, source, email } = body as Record<string, unknown>;

  if (typeof event !== "string" || !ALLOWED_EVENTS.has(event)) {
    return NextResponse.json({ error: "Unsupported event" }, { status: 400 });
  }

  const cleanSource =
    typeof source === "string" ? source.trim().slice(0, 64) : "unknown";

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
  }

  // Visible in Vercel Runtime Logs so we can track Day-1 purchase intent at ₹0
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
