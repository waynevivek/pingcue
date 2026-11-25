import crypto from "node:crypto";

/** Constant-time Bearer token check for cron and internal endpoints. */
export function isTimingSafeBearerMatch(
  authHeader: string | null,
  secret: string
): boolean {
  if (!authHeader || !secret) return false;
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(authHeader, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Validates Origin against configured app origin, request URL origin, and Host/X-Forwarded-Host. */
export function isAllowedSameOrigin(
  originHeader: string | null,
  requestUrl: string,
  configuredAppOrigin: string | null,
  nodeEnv: string | undefined = process.env.NODE_ENV,
  hostHeader?: string | null,
  forwardedProto?: string | null
): boolean {
  const allowed = new Set<string>();

  if (configuredAppOrigin) {
    try {
      allowed.add(new URL(configuredAppOrigin).origin);
    } catch {
      // Ignore malformed configured origin
    }
  }

  let fallbackProto = nodeEnv === "production" ? "https:" : "http:";
  try {
    const parsedRequest = new URL(requestUrl);
    allowed.add(parsedRequest.origin);
    fallbackProto = parsedRequest.protocol;
  } catch {
    // Ignore malformed request URL
  }

  const rawHost = hostHeader?.split(",")[0]?.trim();
  if (rawHost) {
    const rawProto = forwardedProto?.split(",")[0]?.trim().toLowerCase();
    const proto =
      rawProto === "https" || rawProto === "http"
        ? `${rawProto}:`
        : fallbackProto;
    try {
      allowed.add(new URL(`${proto}//${rawHost}`).origin);
    } catch {
      // Ignore malformed Host header
    }
  }

  if (!originHeader || !originHeader.trim()) {
    return nodeEnv !== "production";
  }

  try {
    const parsedOrigin = new URL(originHeader.trim()).origin;
    return allowed.has(parsedOrigin);
  } catch {
    return false;
  }
}

/** Creates a bounded sliding-window rate limiter keyed by IP or identifier. */
export function createMemoryRateLimiter({
  maxRequests,
  windowMs,
}: {
  maxRequests: number;
  windowMs: number;
}) {
  const hits = new Map<string, number[]>();

  function pruneExpired(cutoff: number) {
    for (const [key, timestamps] of hits.entries()) {
      const fresh = timestamps.filter((ts) => ts > cutoff);
      if (fresh.length === 0) hits.delete(key);
      else hits.set(key, fresh);
    }
  }

  return {
    check(key: string, now = Date.now()): boolean {
      const normalizedKey = key.trim() || "unknown";
      const cutoff = now - windowMs;

      if (hits.size > 500) {
        pruneExpired(cutoff);
      }

      const existing = hits.get(normalizedKey) ?? [];
      const recent = existing.filter((ts) => ts > cutoff);

      if (recent.length >= maxRequests) {
        hits.set(normalizedKey, recent);
        return false;
      }

      recent.push(now);
      hits.set(normalizedKey, recent);
      return true;
    },
  };
}
