import assert from "node:assert/strict";
import test from "node:test";
import { buildLlmsFullTxt, buildLlmsTxt } from "./llms.ts";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildHomeJsonLd,
  buildPageMetadata,
  FOUNDER_NAME,
  serializeJsonLd,
} from "./seo.ts";
import {
  getPublicAbsoluteUrls,
  getSitemapRoutes,
  LEGAL_CONTENT_LAST_MODIFIED,
  PUBLIC_SEO_ROUTES,
  SEO_CONTENT_LAST_MODIFIED,
} from "./seo-routes.ts";
import {
  getIndexNowKey,
  getSiteUrl,
  getSocialLinks,
  getTwitterHandle,
  getVerificationTokens,
  isIndexingAllowed,
  SITE_DESCRIPTION,
  SITE_TITLE,
} from "./site-config.ts";

test("getSiteUrl falls back to Vercel production URL before localhost", () => {
  const prevAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  const prevProdUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const prevVercelUrl = process.env.VERCEL_URL;

  try {
    delete process.env.NEXT_PUBLIC_APP_URL;
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "pingcue.app";
    process.env.VERCEL_URL = "pingcue-git-branch.vercel.app";
    assert.equal(getSiteUrl(), "https://pingcue.app");

    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    assert.equal(getSiteUrl(), "https://pingcue-git-branch.vercel.app");

    delete process.env.VERCEL_URL;
    assert.equal(getSiteUrl(), "http://localhost:3000");
  } finally {
    if (prevAppUrl === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
    else process.env.NEXT_PUBLIC_APP_URL = prevAppUrl;
    if (prevProdUrl === undefined)
      delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    else process.env.VERCEL_PROJECT_PRODUCTION_URL = prevProdUrl;
    if (prevVercelUrl === undefined) delete process.env.VERCEL_URL;
    else process.env.VERCEL_URL = prevVercelUrl;
  }
});

test("isIndexingAllowed blocks preview deployments and explicit opt-out", () => {
  const prevVercelEnv = process.env.VERCEL_ENV;
  const prevAllow = process.env.NEXT_PUBLIC_ALLOW_INDEXING;

  try {
    delete process.env.VERCEL_ENV;
    delete process.env.NEXT_PUBLIC_ALLOW_INDEXING;
    assert.equal(isIndexingAllowed(), true);

    process.env.VERCEL_ENV = "production";
    assert.equal(isIndexingAllowed(), true);

    process.env.VERCEL_ENV = "preview";
    assert.equal(isIndexingAllowed(), false);

    process.env.VERCEL_ENV = "production";
    process.env.NEXT_PUBLIC_ALLOW_INDEXING = "false";
    assert.equal(isIndexingAllowed(), false);
  } finally {
    if (prevVercelEnv === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = prevVercelEnv;
    if (prevAllow === undefined) delete process.env.NEXT_PUBLIC_ALLOW_INDEXING;
    else process.env.NEXT_PUBLIC_ALLOW_INDEXING = prevAllow;
  }
});

test("verification, social links, twitter handle, and IndexNow key helpers sanitize env values", () => {
  const prevGoogle = process.env.GOOGLE_SITE_VERIFICATION;
  const prevBing = process.env.BING_SITE_VERIFICATION;
  const prevSocial = process.env.NEXT_PUBLIC_SOCIAL_LINKS;
  const prevTwitter = process.env.NEXT_PUBLIC_TWITTER_HANDLE;
  const prevIndexNow = process.env.INDEXNOW_API_KEY;

  try {
    process.env.GOOGLE_SITE_VERIFICATION = "  gsc-token-123  ";
    process.env.BING_SITE_VERIFICATION = "bing-token-456";
    assert.deepEqual(getVerificationTokens(), {
      google: "gsc-token-123",
      bing: "bing-token-456",
    });

    process.env.NEXT_PUBLIC_SOCIAL_LINKS =
      "https://github.com/waynevivek/pingcue, javascript:alert(1), http://insecure.example, https://x.com/pingcue";
    assert.deepEqual(getSocialLinks(), [
      "https://github.com/waynevivek/pingcue",
      "https://x.com/pingcue",
    ]);

    process.env.NEXT_PUBLIC_TWITTER_HANDLE = "pingcue_app";
    assert.equal(getTwitterHandle(), "@pingcue_app");

    process.env.NEXT_PUBLIC_TWITTER_HANDLE = "bad handle!";
    assert.equal(getTwitterHandle(), undefined);

    process.env.INDEXNOW_API_KEY = "short";
    assert.equal(getIndexNowKey(), null);

    process.env.INDEXNOW_API_KEY = "a1b2c3d4e5f6g7h8";
    assert.equal(getIndexNowKey(), "a1b2c3d4e5f6g7h8");
  } finally {
    if (prevGoogle === undefined) delete process.env.GOOGLE_SITE_VERIFICATION;
    else process.env.GOOGLE_SITE_VERIFICATION = prevGoogle;
    if (prevBing === undefined) delete process.env.BING_SITE_VERIFICATION;
    else process.env.BING_SITE_VERIFICATION = prevBing;
    if (prevSocial === undefined) delete process.env.NEXT_PUBLIC_SOCIAL_LINKS;
    else process.env.NEXT_PUBLIC_SOCIAL_LINKS = prevSocial;
    if (prevTwitter === undefined)
      delete process.env.NEXT_PUBLIC_TWITTER_HANDLE;
    else process.env.NEXT_PUBLIC_TWITTER_HANDLE = prevTwitter;
    if (prevIndexNow === undefined) delete process.env.INDEXNOW_API_KEY;
    else process.env.INDEXNOW_API_KEY = prevIndexNow;
  }
});

test("buildPageMetadata appends brand suffix to title, enforces display bounds, and preserves OG/Twitter images on child pages", () => {
  assert.ok(SITE_TITLE.length <= 60, `SITE_TITLE too long: ${SITE_TITLE.length}`);
  assert.ok(
    SITE_DESCRIPTION.length >= 120 && SITE_DESCRIPTION.length <= 160,
    `SITE_DESCRIPTION out of bounds: ${SITE_DESCRIPTION.length}`
  );

  const meta = buildPageMetadata({
    title: "WhatsApp Payment Reminder Templates",
    description:
      "Copy 5 polite WhatsApp payment reminder messages for Stripe, Wise, PayPal, UPI, or bank links, plus wa.me URL formatting tips for freelancers.",
    path: "/templates/whatsapp-payment-reminder-messages",
    type: "article",
  });

  assert.equal(meta.title, "WhatsApp Payment Reminder Templates — PingCue");
  assert.equal(
    meta.openGraph?.title,
    "WhatsApp Payment Reminder Templates — PingCue"
  );
  assert.equal(
    meta.twitter?.title,
    "WhatsApp Payment Reminder Templates — PingCue"
  );
  assert.ok(Array.isArray(meta.openGraph?.images) && meta.openGraph.images.length === 1);
  assert.deepEqual(meta.twitter?.images, ["/opengraph-image"]);
});

test("JSON-LD builders produce valid WebApplication/Person/Article @graph schemas and escape < for XSS safety", () => {
  const home = buildHomeJsonLd(
    [{ q: "Is it free?", a: "1 active invoice is free forever." }],
    "https://pingcue.app"
  );
  const graph = home["@graph"] as Array<Record<string, unknown>>;
  assert.equal(home["@context"], "https://schema.org");
  assert.deepEqual(
    graph.map((node) => node["@type"]),
    [
      "Organization",
      "Person",
      "WebSite",
      ["WebApplication", "SoftwareApplication"],
      "WebPage",
      "FAQPage",
    ]
  );

  const founderNode = graph[1];
  assert.equal(founderNode.name, FOUNDER_NAME);
  assert.deepEqual(founderNode.worksFor, {
    "@id": "https://pingcue.app/#organization",
  });

  const serialized = serializeJsonLd({
    note: "</script><script>alert(1)</script>",
  });
  assert.equal(serialized.includes("<"), false);
  assert.equal(serialized.includes("\\u003c/script>"), true);

  const breadcrumbs = buildBreadcrumbJsonLd(
    [
      { name: "Home", path: "/" },
      { name: "Guides", path: "/guides" },
    ],
    "https://pingcue.app"
  );
  assert.equal(breadcrumbs["@type"], "BreadcrumbList");

  const article = buildArticleJsonLd({
    headline: "Test Guide",
    description: "Description",
    path: "/guides/how-to-chase-unpaid-invoices",
    datePublished: "2026-11-27",
    dateModified: "2026-11-27",
    siteUrl: "https://pingcue.app",
  });
  const articleGraph = article["@graph"] as Array<Record<string, unknown>>;
  assert.deepEqual(
    articleGraph.map((node) => node["@type"]),
    ["Organization", "Person", "Article"]
  );
  assert.deepEqual(articleGraph[2].author, {
    "@id": "https://pingcue.app/#founder",
  });
  assert.deepEqual(articleGraph[2].publisher, {
    "@id": "https://pingcue.app/#organization",
  });
});

test("PUBLIC_SEO_ROUTES, sitemap exclusions, llms.txt hygiene, and llms-full.txt stay aligned", () => {
  const uniquePaths = new Set(PUBLIC_SEO_ROUTES.map((route) => route.path));
  assert.equal(uniquePaths.size, PUBLIC_SEO_ROUTES.length);

  const sitemapPaths = getSitemapRoutes().map((route) => route.path);
  assert.equal(sitemapPaths.includes("/login"), false);
  assert.ok(sitemapPaths.includes("/"));
  assert.ok(sitemapPaths.includes("/guides"));

  const termsRoute = PUBLIC_SEO_ROUTES.find((route) => route.path === "/terms");
  const guidesRoute = PUBLIC_SEO_ROUTES.find(
    (route) => route.path === "/guides"
  );
  assert.equal(termsRoute?.lastModified, LEGAL_CONTENT_LAST_MODIFIED);
  assert.equal(guidesRoute?.lastModified, SEO_CONTENT_LAST_MODIFIED);

  const urls = getPublicAbsoluteUrls("https://pingcue.app/");
  assert.equal(urls.includes("https://pingcue.app/login"), false);
  assert.ok(
    urls.includes("https://pingcue.app/templates/invoice-payment-reminder-emails")
  );

  const llms = buildLlmsTxt("https://pingcue.app", "support@pingcue.app");
  assert.match(llms, /https:\/\/pingcue\.app\/llms-full\.txt/);
  assert.match(llms, /support@pingcue\.app/);
  assert.equal(llms.includes("## Key Facts"), false);
  // Every list item after the first H2 should be a Markdown [name](url) link
  const afterFirstH2 = llms.slice(llms.indexOf("## "));
  const listLines = afterFirstH2
    .split("\n")
    .filter((line) => line.trim().startsWith("- "));
  assert.ok(listLines.length >= 10);
  for (const line of listLines) {
    assert.match(line, /^- \[[^\]]+\]\(https:\/\/[^)]+\)/);
  }

  const llmsFull = buildLlmsFullTxt(
    "https://pingcue.app",
    "support@pingcue.app"
  );
  assert.match(llmsFull, /Escalation Cadence Reference/);
  assert.match(llmsFull, /Frequently Asked Questions/);
});
