export const SITE_NAME = "PingCue";
export const DEFAULT_SUPPORT_EMAIL = "pingcue.support@gmail.com";

const PLACEHOLDER_APP_HOSTS = new Set(["your-domain.com", "yourdomain.com"]);

/** Returns configured support email with fallback until the custom domain is live. */
export function getSupportEmail(): string {
  const configured = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();
  return configured || DEFAULT_SUPPORT_EMAIL;
}

export const SUPPORT_EMAIL = getSupportEmail();

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

/** Returns the best available canonical site URL for metadata, robots, and sitemap. */
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
      // Fall through to default local origin
    }
  }
  return "http://localhost:3000";
}

export function getMetadataBase(): URL {
  return new URL(getSiteUrl());
}
