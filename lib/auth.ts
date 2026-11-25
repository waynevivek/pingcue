const DEFAULT_REDIRECT_PATH = "/dashboard";

export const AUTH_CALLBACK_ERROR_MESSAGES: Record<string, string> = {
  auth_callback_failed:
    "That sign-in or confirmation link is invalid or has expired. Please try again.",
};

/**
 * Validates an internal redirect target to block open redirects (e.g. //evil.com,
 * https://evil.com, /\evil.com, control characters).
 */
export function sanitizeRedirectPath(
  raw: string | null | undefined,
  fallback = DEFAULT_REDIRECT_PATH
): string {
  if (typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  if (!trimmed) return fallback;
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//") || trimmed.startsWith("/\\")) return fallback;
  if (/[\x00-\x1f\x7f\\]/.test(trimmed)) return fallback;

  try {
    const parsed = new URL(trimmed, "https://pingcue.invalid");
    if (
      parsed.origin !== "https://pingcue.invalid" ||
      !parsed.pathname.startsWith("/")
    ) {
      return fallback;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function getAuthCallbackErrorMessage(
  code: string | null | undefined
): string | undefined {
  if (!code) return undefined;
  return AUTH_CALLBACK_ERROR_MESSAGES[code];
}
