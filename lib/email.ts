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

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string; quotaExceeded?: boolean };

/** Sends one reminder email via Resend with freelancer Reply-To and clear error handling. */
export async function sendReminderEmail({
  to,
  replyTo,
  subject,
  text,
  html,
}: {
  to: string;
  replyTo: string;
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

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: getResendFromEmail(),
      to: [to],
      replyTo,
      subject,
      text,
      html,
    });

    if (error) {
      const msg = error.message || "Resend rejected the email request.";
      const lower = msg.toLowerCase();

      if (
        lower.includes("daily_quota_exceeded") ||
        lower.includes("daily quota") ||
        error.statusCode === 429
      ) {
        return {
          ok: false,
          quotaExceeded: true,
          error:
            "Resend daily free limit (100 emails/day) reached. Remaining sends will resume tomorrow.",
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
