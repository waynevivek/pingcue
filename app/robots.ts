import type { MetadataRoute } from "next";
import { getSiteUrl, isIndexingAllowed } from "@/lib/site-config";

const PRIVATE_DISALLOW_PATHS = [
  "/dashboard",
  "/invoices",
  "/settings",
  "/auth/",
  "/api/",
];

const SEARCH_AND_AI_CITABILITY_BOTS = [
  "Googlebot",
  "Bingbot",
  "Applebot",
  "DuckDuckBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "Claude-SearchBot",
  "Claude-User",
];

const AI_TRAINING_AND_CONTROL_TOKENS = [
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  if (!isIndexingAllowed()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_DISALLOW_PATHS,
      },
      {
        userAgent: SEARCH_AND_AI_CITABILITY_BOTS,
        allow: "/",
        disallow: PRIVATE_DISALLOW_PATHS,
      },
      {
        userAgent: AI_TRAINING_AND_CONTROL_TOKENS,
        allow: "/",
        disallow: PRIVATE_DISALLOW_PATHS,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
