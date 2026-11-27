import type { NextConfig } from "next";

const INDEXNOW_KEY_PATTERN = /^[a-zA-Z0-9-]{8,128}$/;

function getConfiguredIndexNowKey(): string | null {
  const key = process.env.INDEXNOW_API_KEY?.trim();
  if (!key || !INDEXNOW_KEY_PATTERN.test(key)) return null;
  return key;
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  async headers() {
    const isPreview = process.env.VERCEL_ENV === "preview";

    const baseHeaders = [
      {
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      ...(isPreview
        ? [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }]
        : []),
    ];

    const noIndexHeader = [
      { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
    ];

    return [
      {
        source: "/(.*)",
        headers: baseHeaders,
      },
      {
        source: "/dashboard/:path*",
        headers: noIndexHeader,
      },
      {
        source: "/invoices/:path*",
        headers: noIndexHeader,
      },
      {
        source: "/settings/:path*",
        headers: noIndexHeader,
      },
      {
        source: "/auth/:path*",
        headers: noIndexHeader,
      },
      {
        source: "/api/:path*",
        headers: noIndexHeader,
      },
    ];
  },
  async rewrites() {
    const indexNowKey = getConfiguredIndexNowKey();
    if (!indexNowKey) return [];

    return [
      {
        source: `/${indexNowKey}.txt`,
        destination: "/api/indexnow/key",
      },
    ];
  },
};

export default nextConfig;
