export const SITE_NAME = "PingCue";
export const SITE_TAGLINE = "Polite Invoice Chasers for Freelancers";
export const SITE_TITLE = "PingCue — Automated Invoice Reminders for Freelancers";
export const SITE_DESCRIPTION =
  "Automate escalating invoice reminders (-3d to +30d) for Stripe, Wise, PayPal, UPI, or bank links—with 1-click Pause and WhatsApp nudges. Start free.";
export const DEFAULT_SUPPORT_EMAIL = "pingcue.support@gmail.com";

const PLACEHOLDER_APP_HOSTS = new Set(["your-domain.com", "yourdomain.com"]);
const INDEXNOW_KEY_PATTERN = /^[a-zA-Z0-9-]{8,128}$/;

/** Returns configured support email with fallback until the custom domain is live. */
export function getSupportEmail(): string {
  const configured = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();
  return configured || DEFAULT_SUPPORT_EMAIL;
}

export const SUPPORT_EMAIL = getSupportEmail();

function normalizeOrigin(raw: string | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;

  const candidate =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    if (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      !PLACEHOLDER_APP_HOSTS.has(parsed.hostname.toLowerCase())
    ) {
      return parsed.origin;
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Resolves the canonical app origin for auth callbacks and checkout return URLs.
 * In production, requires an explicit HTTPS non-localhost NEXT_PUBLIC_APP_URL.
 */
export function resolveAppOrigin(
  requestUrl?: string,
  nodeEnv: string | undefined = process.env.NODE_ENV
): string | null {
  const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (rawAppUrl) {
    try {
      const parsed = new URL(rawAppUrl);
      const isPlaceholder = PLACEHOLDER_APP_HOSTS.has(
        parsed.hostname.toLowerCase()
      );
      const isLocalhost =
        parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";

      if (!isPlaceholder) {
        if (nodeEnv === "production") {
          if (parsed.protocol === "https:" && !isLocalhost) {
            return parsed.origin;
          }
          return null;
        }
        if (parsed.protocol === "https:" || parsed.protocol === "http:") {
          return parsed.origin;
        }
      } else if (nodeEnv === "production") {
        return null;
      }
    } catch {
      if (nodeEnv === "production") {
        return null;
      }
    }
  }

  if (nodeEnv === "production") {
    return null;
  }

  if (requestUrl) {
    try {
      const parsedRequest = new URL(requestUrl);
      if (
        parsedRequest.protocol === "https:" ||
        parsedRequest.protocol === "http:"
      ) {
        return parsedRequest.origin;
      }
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Returns the best available canonical site URL for metadata, robots, sitemap,
 * JSON-LD, and llms.txt. Falls back to Vercel's production domain before localhost
 * so live deployments never emit localhost URLs if NEXT_PUBLIC_APP_URL is unset.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    try {
      const parsed = new URL(configured);
      if (
        (parsed.protocol === "https:" || parsed.protocol === "http:") &&
        !PLACEHOLDER_APP_HOSTS.has(parsed.hostname.toLowerCase())
      ) {
        return parsed.origin;
      }
    } catch {
      // Fall through to Vercel/default fallbacks
    }
  }

  const vercelProd = normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  if (vercelProd) return vercelProd;

  const vercelPreview = normalizeOrigin(process.env.VERCEL_URL);
  if (vercelPreview) return vercelPreview;

  return "http://localhost:3000";
}

export function getMetadataBase(): URL {
  return new URL(getSiteUrl());
}

/**
 * Prevents Vercel preview deployments or explicitly disabled environments from
 * being indexed by search engines and competing with the canonical domain.
 */
export function isIndexingAllowed(): boolean {
  if (process.env.NEXT_PUBLIC_ALLOW_INDEXING?.trim().toLowerCase() === "false") {
    return false;
  }
  if (process.env.VERCEL_ENV === "preview") {
    return false;
  }
  return true;
}

export function getVerificationTokens(): {
  google?: string;
  bing?: string;
  yandex?: string;
} {
  const google =
    process.env.GOOGLE_SITE_VERIFICATION?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() ||
    undefined;
  const bing =
    process.env.BING_SITE_VERIFICATION?.trim() ||
    process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION?.trim() ||
    undefined;
  const yandex =
    process.env.YANDEX_SITE_VERIFICATION?.trim() ||
    process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION?.trim() ||
    undefined;

  return {
    ...(google ? { google } : {}),
    ...(bing ? { bing } : {}),
    ...(yandex ? { yandex } : {}),
  };
}

/** Parses optional comma-separated verified https:// profile URLs for Organization.sameAs. */
export function getSocialLinks(): string[] {
  const raw = process.env.NEXT_PUBLIC_SOCIAL_LINKS?.trim();
  if (!raw) return [];

  const urls: string[] = [];
  for (const part of raw.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === "https:") {
        urls.push(parsed.toString());
      }
    } catch {
      // Ignore invalid entries
    }
  }
  return Array.from(new Set(urls));
}

export function getTwitterHandle(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_TWITTER_HANDLE?.trim();
  if (!raw) return undefined;
  const normalized = raw.startsWith("@") ? raw : `@${raw}`;
  return /^@[A-Za-z0-9_]{1,15}$/.test(normalized) ? normalized : undefined;
}

export function getIndexNowKey(): string | null {
  const key = process.env.INDEXNOW_API_KEY?.trim();
  if (!key || !INDEXNOW_KEY_PATTERN.test(key)) return null;
  return key;
}
