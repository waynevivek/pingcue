import { Resend } from "resend";

export function isResendConfigured(): boolean {
  const key = process.env.RESEND_API_KEY?.trim();
  return Boolean(key && key.startsWith("re_") && key !== "re_your_api_key");
}

export function getResendFromEmail(): string {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() || "PingCue <onboarding@resend.dev>"
  );
}

/** Formats a safe human-readable sender label ("Name via PingCue" or "PingCue"). */
export function formatSenderDisplayName(senderName?: string | null): string {
  const cleaned = (senderName ?? "")
    .replace(/[\r\n\x00-\x1f\x7f"<>\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "PingCue";
  if (/via pingcue$/i.test(cleaned)) return cleaned;
  return `${cleaned} via PingCue`;
}

/** Combines a sanitized freelancer display name with the authenticated Resend From address. */
export function formatSenderFromAddress(
  baseFrom: string,
  senderName?: string | null
): string {
  const trimmedBase = baseFrom.trim();
  const displayName = formatSenderDisplayName(senderName);

  const angleMatch = trimmedBase.match(/<([^<>]+)>/);
  const address = (angleMatch ? angleMatch[1] : trimmedBase).trim();
  if (!address || !address.includes("@")) {
    return trimmedBase;
  }

  const needsQuotes = /[,.:;@()[\]]/.test(displayName);
  const formattedName = needsQuotes ? `"${displayName}"` : displayName;
  return `${formattedName} <${address}>`;
}

export function isResendUsingSandboxFrom(): boolean {
  return getResendFromEmail().toLowerCase().includes("onboarding@resend.dev");
}

let warnedSandboxInProd = false;

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string; quotaExceeded?: boolean };

/** Sends one reminder email via Resend with freelancer display name, Reply-To, and clear error handling. */
export async function sendReminderEmail({
  to,
  replyTo,
  fromName,
  subject,
  text,
  html,
}: {
  to: string;
  replyTo?: string;
  fromName?: string | null;
  subject: string;
  text: string;
  html: string;
}): Promise<SendEmailResult> {
  if (!isResendConfigured()) {
    return {
      ok: false,
      error:
        "Resend is not configured yet. Add RESEND_API_KEY to .env.local (and Vercel) to send emails.",
    };
  }

  if (
    process.env.NODE_ENV === "production" &&
    isResendUsingSandboxFrom() &&
    !warnedSandboxInProd
  ) {
    warnedSandboxInProd = true;
    console.warn(
      "RESEND_FROM_EMAIL is still set to onboarding@resend.dev in production; Resend will only deliver to your own Resend account email until a custom domain is verified."
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: formatSenderFromAddress(getResendFromEmail(), fromName),
      to: [to],
      ...(replyTo ? { replyTo } : {}),
      subject,
      text,
      html,
    });

    if (error) {
      const msg = error.message || "Resend rejected the email request.";
      const lower = msg.toLowerCase();

      if (
        lower.includes("daily_quota_exceeded") ||
        lower.includes("daily quota")
      ) {
        return {
          ok: false,
          quotaExceeded: true,
          error:
            "Resend daily free limit (100 emails/day) reached. Remaining sends will resume tomorrow.",
        };
      }

      if (error.statusCode === 429) {
        return {
          ok: false,
          quotaExceeded: false,
          error: "Resend rate limit hit (too many requests per second).",
        };
      }

      if (
        error.statusCode === 403 ||
        lower.includes("verify a domain") ||
        lower.includes("testing emails")
      ) {
        return {
          ok: false,
          error:
            "Resend sandbox (onboarding@resend.dev) can only send to your own Resend account email. Verify a custom domain in Resend to email clients.",
        };
      }

      return { ok: false, error: msg };
    }

    return { ok: true, id: data?.id ?? "" };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Unexpected network error while sending email.",
    };
  }
}
