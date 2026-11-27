# PingCue SEO, AEO, GEO, Analytics & Google Search Console Runbook

This runbook explains **why PingCue was not showing up on Google even for an exact-name search** and gives the exact external setup steps to pair with the code changes on this branch.

---

## Why "PingCue" wasn't appearing in Google Search yet

1. **Exact-name brand collision:** An unrelated Android notification-reminder app named *PingCue* (by Radivum) is already indexed on Google Play and currently owns the bare `"PingCue"` SERP.
2. **Unindexed / newly deployed web property:** Google does not automatically index brand-new domains or `*.vercel.app` URLs without either Search Console submission or external backlinks.
3. **Previous `localhost` fallback risk:** Previously, `getSiteUrl()` fell back to `http://localhost:3000` if `NEXT_PUBLIC_APP_URL` was unset on Vercel, which would emit `localhost` inside `robots.txt`, `sitemap.xml`, `metadataBase`, and Open Graph URLs. (Fixed in `lib/site-config.ts` to fall back to `VERCEL_PROJECT_PRODUCTION_URL` and automatically set `noindex` on preview deployments.)
4. **Single-page marketing footprint:** Previously only `/` existed as indexable product copy, with no structured data (`Organization`, `WebApplication`, `Article`), no topical resource/template pages, and no `/llms.txt` (note: Google Search ignores `/llms.txt` per Google's June/July 2026 AI Optimization Guide; it is provided for non-Google AI tools and Lighthouse Agentic Browsing optionality).

---

## Step 1 — Configure Vercel Production Environment Variables

In **Vercel → Project → Settings → Environment Variables** (scope: **Production**):

| Variable | Recommended Value | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | `https://yourdomain.com` (exact preferred canonical host, no trailing slash) | Canonical tags, `sitemap.xml`, `robots.txt`, JSON-LD, `llms.txt`, auth callbacks |
| `GOOGLE_SITE_VERIFICATION` | Token from Google Search Console HTML-tag method | Emits `<meta name="google-site-verification" ...>` |
| `BING_SITE_VERIFICATION` | Token from Bing Webmaster Tools | Emits `<meta name="msvalidate.01" ...>` |
| `INDEXNOW_API_KEY` | Random 32-char alphanumeric string (e.g. `openssl rand -hex 16`) | Serves `/<key>.txt` and powers `POST /api/indexnow` for instant Bing & ChatGPT Search indexing |
| `NEXT_PUBLIC_SOCIAL_LINKS` | Comma-separated verified `https://` URLs (GitHub repo, X, LinkedIn, Product Hunt) | Populates `Organization.sameAs` for Google Knowledge Graph & LLM entity disambiguation |
| `NEXT_PUBLIC_TWITTER_HANDLE` | `@yourhandle` (optional) | Adds `twitter:site` and `twitter:creator` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` (optional) | Enables Google Analytics 4 with IP anonymization |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Clarity project ID (optional) | Enables Microsoft Clarity session heatmaps/scroll depth |

> **Canonical domain rule:** In **Vercel → Settings → Domains**, pick ONE canonical host (either apex `pingcue.app` OR `www.pingcue.app`) and set the other to **308 Permanent Redirect** to it so Google never splits authority across `www`, non-`www`, and `*.vercel.app`.

---

## Step 2 — Enable Vercel Web Analytics & Speed Insights

`@vercel/analytics` and `@vercel/speed-insights` are already wired in `app/components/AnalyticsProviders.tsx` and mounted in `app/layout.tsx`, with custom funnel events (`founding_pass_click`, `founding_pass_email`, `checkout_initiated`, `checkout_redirect_login`, `template_copy`).

1. Open your project in **Vercel Dashboard**.
2. Go to **Analytics → Enable** (free on Hobby plan).
3. Go to **Speed Insights → Enable** (tracks real-user LCP, INP, CLS, FCP, TTFB).
4. Redeploy after enabling so `/_vercel/insights/script.js` and `/_vercel/speed-insights/script.js` go live.

---

## Step 3 — Verify & Index in Google Search Console (Do This Right After Deploy)

1. Go to [Google Search Console](https://search.google.com/search-console).
2. Click **Add Property**:
   - **Best option (custom domain):** Choose **Domain** (`yourdomain.com`) and add the TXT record in your DNS provider (Cloudflare / Namecheap / GoDaddy / Vercel DNS).
   - **Alternative (URL prefix / Vercel subdomain):** Choose **URL prefix** (`https://yourdomain.com`), choose **HTML tag**, copy ONLY the `content="..."` token into `GOOGLE_SITE_VERIFICATION` in Vercel, redeploy, and click **Verify**.
3. Open **Sitemaps** in the left sidebar → enter `sitemap.xml` → click **Submit**.
4. Open **URL Inspection** (top search bar) and click **Test Live URL → Request Indexing** for these priority URLs:
   - `https://yourdomain.com/`
   - `https://yourdomain.com/guides`
   - `https://yourdomain.com/templates/invoice-payment-reminder-emails`
   - `https://yourdomain.com/templates/whatsapp-payment-reminder-messages`
   - `https://yourdomain.com/guides/how-to-chase-unpaid-invoices`
   - `https://yourdomain.com/compare/pingcue-vs-invoicing-suites`
5. Validate structured data at [Google Rich Results Test](https://search.google.com/test/rich-results) and [Schema.org Validator](https://validator.schema.org/) on `/` and `/templates/invoice-payment-reminder-emails`.

---

## Step 4 — Verify in Bing Webmaster Tools & Trigger IndexNow (Feeds ChatGPT Search!)

ChatGPT Search relies heavily on Bing's index + `OAI-SearchBot`.

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters) → **Import your sites from Google Search Console** (1-click once GSC is verified), or verify using `BING_SITE_VERIFICATION`.
2. Submit `https://yourdomain.com/sitemap.xml`.
3. Once `INDEXNOW_API_KEY` and `CRON_SECRET` are set in Vercel Production, push all public URLs immediately via:

```bash
curl -X POST "https://yourdomain.com/api/indexnow" \
  -H "Authorization: Bearer $CRON_SECRET"
```

Verify the key file resolves cleanly at `https://yourdomain.com/$INDEXNOW_API_KEY.txt`.

---

## Step 5 — Verify Live Technical SEO, AEO & GEO Endpoints

After deploying to production, verify every endpoint returns HTTP 200 with your real production domain (never `localhost`):

```bash
DOMAIN="https://yourdomain.com"
curl -sI "$DOMAIN/" | grep -iE "http/|x-robots-tag"
curl -s "$DOMAIN/robots.txt"
curl -s "$DOMAIN/sitemap.xml"
curl -s "$DOMAIN/llms.txt" | head -n 40
curl -s "$DOMAIN/manifest.webmanifest"
curl -sI "$DOMAIN/dashboard" | grep -i "x-robots-tag"   # should include noindex, nofollow
```

---

## Step 6 — Off-Page Authority & Brand Disambiguation (To Rank #1 for "PingCue")

Google ranks new domains for brand searches once it sees consistent entity signals across the open web:

1. **GitHub repository:** Set the homepage URL on `github.com/waynevivek/pingcue` to your canonical `https://yourdomain.com` and include the full description (`PingCue — Automated invoice payment reminders for freelancers`).
2. **High-trust launch & directory profiles (with exact anchor text "PingCue"):**
   - Product Hunt launch page
   - Hacker News (`Show HN: PingCue — automated invoice payment reminders for freelancers`)
   - Indie Hackers product profile
   - AlternativeTo & SaaSHub listings (categorized under Invoice Reminder / Freelance Billing)
   - X / LinkedIn founder & product posts linking directly to `/` and `/templates/invoice-payment-reminder-emails`
3. **Wire `sameAs`:** Add those verified profile URLs to `NEXT_PUBLIC_SOCIAL_LINKS` in Vercel so `Organization.sameAs` ties your brand graph together for Google, Perplexity, ChatGPT, and Gemini.
4. **Own a custom domain (if currently on `*.vercel.app`):** Custom domains (e.g., `getpingcue.com` or `pingcue.app`) build durable search equity and rank dramatically faster for exact brand searches than shared `vercel.app` subdomains.
