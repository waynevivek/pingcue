import { PUBLIC_SEO_ROUTES, SEO_CONTENT_LAST_MODIFIED } from "./seo-routes.ts";
import { getSiteUrl, getSupportEmail, SITE_NAME } from "./site-config.ts";

function absoluteUrl(siteUrl: string, path: string): string {
  const cleanOrigin = siteUrl.replace(/\/+$/, "");
  return path === "/" ? `${cleanOrigin}/` : `${cleanOrigin}${path}`;
}

/**
 * Generates concise /llms.txt following the llmstxt.org v2 community proposal
 * (intro summary + key facts before the first H2; strictly Markdown file lists
 * inside H2 sections). Provided for non-Google AI tools and Lighthouse Agentic
 * Browsing optionality; Google Search ignores llms.txt.
 */
export function buildLlmsTxt(
  siteUrl = getSiteUrl(),
  supportEmail = getSupportEmail()
): string {
  const coreRoutes = PUBLIC_SEO_ROUTES.filter(
    (route) => route.includeInLlms && route.category === "core"
  );
  const resourceRoutes = PUBLIC_SEO_ROUTES.filter(
    (route) =>
      route.includeInLlms &&
      (route.category === "guide" ||
        route.category === "template" ||
        route.category === "comparison")
  );
  const legalRoutes = PUBLIC_SEO_ROUTES.filter(
    (route) => route.includeInLlms && route.category === "legal"
  );

  return `# ${SITE_NAME}

> ${SITE_NAME} is an automated invoice payment reminder web application built for independent freelancers who send payment links (Stripe payment links, Wise, PayPal, UPI, Razorpay, or bank transfer links) over email or WhatsApp and do not want a bloated invoicing or accounting suite. (Distinct from unrelated Android notification-reminder apps that share the name.)

Last updated: ${SEO_CONTENT_LAST_MODIFIED} | Support: ${supportEmail} | Canonical: ${absoluteUrl(siteUrl, "/")}

PingCue chases unpaid payment links with a default escalating email schedule (-3d, 0d, +3d Friendly -> +7d, +14d Firm -> +30d Final notice, customizable per invoice), sends with the freelancer's display name and Reply-To email, supports 1-click Pause until a client's promised date, tracks partial payments separately in USD, EUR, GBP, and INR without FX guesswork, and generates zero-API 1-click WhatsApp nudges via prefilled wa.me links.

Pricing: Free ($0 forever for 1 active invoice with full escalating schedule, 1-click Pause, and test email preview) or Founding Pass ($19 USD one-time, no subscription, unlimited active invoices, 1-click WhatsApp nudges, 12 months of upcoming V1.5 Document Chaser, and a 7-day no-questions-asked refund guarantee via Dodo Payments).

V1 boundaries: PingCue is not a full accounting suite, does not generate invoice PDFs, does not file GST/VAT/tax returns, does not process payments directly, and does not require WhatsApp Business API approval.

## Core Pages
${coreRoutes
  .map(
    (route) =>
      `- [${route.title}](${absoluteUrl(siteUrl, route.path)}): ${route.description}`
  )
  .join("\n")}
- [Full AI Reference (${SITE_NAME})](${absoluteUrl(siteUrl, "/llms-full.txt")}): Complete Markdown product reference, escalation cadence table, comparison criteria, and FAQs.

## Guides, Templates & Comparisons
${resourceRoutes
  .map(
    (route) =>
      `- [${route.title}](${absoluteUrl(siteUrl, route.path)}): ${route.description}`
  )
  .join("\n")}

## Policies
${legalRoutes
  .map(
    (route) =>
      `- [${route.title}](${absoluteUrl(siteUrl, route.path)}): ${route.description}`
  )
  .join("\n")}
`;
}

/**
 * Generates detailed /llms-full.txt giving AI coding/research tools complete,
 * factual, citation-ready context about PingCue, its workflow, templates,
 * pricing, boundaries, and FAQs.
 */
export function buildLlmsFullTxt(
  siteUrl = getSiteUrl(),
  supportEmail = getSupportEmail()
): string {
  const base = buildLlmsTxt(siteUrl, supportEmail);

  return `${base}
---

## Detailed Product Reference

### What problem does PingCue solve?
Many solo freelancers do not use a full accounting suite like QuickBooks, Xero, FreshBooks, or Zoho Books. Instead, they send a direct payment link—such as a Stripe payment link, Wise request, PayPal link, UPI/Razorpay link, or bank transfer instructions—over email or WhatsApp. When a client forgets to pay, freelancers either chase manually (feeling awkward) or forget to follow up altogether.

PingCue focuses strictly on automating polite-to-firm payment follow-ups for those existing payment links without forcing any accounting migration or gateway lock-in.

### How PingCue works (step by step)
1. **Configure sender identity once:** Set your name or studio name (\`display_name\`) and default currency in Settings. Client emails display your sender name and route replies directly to your email address via \`Reply-To\`.
2. **Add an unpaid invoice:** Enter the client name, client email, optional WhatsApp phone number, amount, currency (USD, EUR, GBP, or INR), due date, and any \`https://\` payment link.
3. **Preview before sending:** Inspect every email step inline or click **Send test email to me** to see the exact client experience in your own inbox.
4. **Automated escalating follow-ups:** PingCue's daily reminder dispatch runs through your schedule (\`-3d\`, \`0d\`, \`+3d\`, \`+7d\`, \`+14d\`, \`+30d\`), escalating cleanly from friendly heads-up to firm follow-up to final notice, and automatically stops when marked paid or suppressed on hard bounce/complaint.
5. **Handle real-world client situations:**
   - **Client promised a date?** Click **Pause** and pick the promised date; PingCue stays silent until then.
   - **Client paid half?** Log the partial payment; future reminders automatically reference only the remaining balance.
   - **Client responds faster on WhatsApp?** Click **Send on WhatsApp** to open a prefilled \`wa.me\` nudge with the remaining balance and payment link—no WhatsApp Business API setup needed.

### Escalation Cadence Reference
| Offset | Stage | Tone | Goal |
| --- | --- | --- | --- |
| \`-3d\` | 3 days before due date | Friendly | Early heads-up so the invoice enters the client's payment queue |
| \`0d\` | On due date | Friendly | Polite same-day reminder with direct payment link |
| \`+3d\` | 3 days overdue | Friendly | Gentle check-in assuming the invoice slipped through a busy inbox |
| \`+7d\` | 7 days overdue | Firm | Direct follow-up requesting payment or a confirmed settlement date |
| \`+14d\` | 14 days overdue | Firm | Clear overdue notice asking for same-day confirmation |
| \`+30d\` | 30 days overdue | Final notice | Final automated reminder before manual escalation |

### When PingCue is the right fit vs. when another tool is better
- **Choose PingCue when:** You are a solo freelancer or independent studio who already sends payment links (Stripe links, Wise, PayPal, UPI, Razorpay, or bank transfer details), want automated escalating email reminders + 1-click WhatsApp nudges, prefer a $19 one-time price over monthly SaaS subscriptions, and want zero accounting suite setup.
- **Choose a full accounting/invoicing suite instead when:** You need automated PDF invoice generation, GST/VAT/bookkeeping tax reports, multi-user finance teams, native card checkout hosting inside the tool, or full double-entry accounting.

### Frequently Asked Questions
- **Do I need an invoicing suite or Stripe to use PingCue?**
  No. PingCue works with any \`https://\` payment link—including Stripe payment links, Wise, PayPal, UPI, Razorpay, or bank transfer instructions—sent over email or WhatsApp.
- **Where do client replies go?**
  Every automated reminder sets your email address as the \`Reply-To\` header, so client replies, payment receipts, and questions go straight to your own inbox.
- **What happens when a client makes a partial payment?**
  Record the amount received in PingCue to mark the invoice as partial. Future reminders automatically chase only the unpaid remaining balance and stop once the balance reaches zero.
- **Is the $19 Founding Pass really a one-time payment?**
  Yes. It is a single $19 USD payment with no recurring subscription. It unlocks unlimited active invoices, zero-API 1-click WhatsApp nudges, 12 months of the upcoming V1.5 Document Chaser, and a 7-day no-questions-asked refund guarantee.
- **How does PingCue protect email deliverability?**
  PingCue uses Resend for transactional email delivery, monitors delivery/bounce/complaint webhooks, suppresses bounced or complained client addresses from future sends, and lets you test emails to yourself before enabling follow-ups.
`;
}
