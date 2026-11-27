export type PublicRouteCategory = "core" | "guide" | "template" | "comparison" | "legal";

export type PublicSeoRoute = {
  path: string;
  title: string;
  description: string;
  category: PublicRouteCategory;
  lastModified: string;
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
  includeInSitemap: boolean;
  includeInLlms: boolean;
  includeOgImage?: boolean;
};

export const SEO_CONTENT_LAST_MODIFIED = "2026-11-27";
export const LEGAL_CONTENT_LAST_MODIFIED = "2026-11-24";

/**
 * Single source of truth for all public routes across sitemap.xml,
 * llms.txt, llms-full.txt, and IndexNow URL submission.
 */
export const PUBLIC_SEO_ROUTES: readonly PublicSeoRoute[] = [
  {
    path: "/",
    title: "PingCue — Automated Invoice Reminders for Freelancers",
    description:
      "Landing page for PingCue: automated escalating email reminders (-3d to +30d), 1-click Pause, partial payment tracking, and zero-API WhatsApp nudges for freelancers sending payment links.",
    category: "core",
    lastModified: SEO_CONTENT_LAST_MODIFIED,
    changeFrequency: "weekly",
    priority: 1,
    includeInSitemap: true,
    includeInLlms: true,
    includeOgImage: true,
  },
  {
    path: "/guides",
    title: "Freelance Invoice Reminder Guides & Templates",
    description:
      "Copy-ready invoice reminder email templates, polite WhatsApp nudges, an overdue follow-up playbook, and an honest comparison vs invoicing suites.",
    category: "guide",
    lastModified: SEO_CONTENT_LAST_MODIFIED,
    changeFrequency: "weekly",
    priority: 0.9,
    includeInSitemap: true,
    includeInLlms: true,
  },
  {
    path: "/templates/invoice-payment-reminder-emails",
    title: "Invoice Reminder Email Templates (-3d to +30d)",
    description:
      "Copy 8 polite-to-final invoice payment reminder email templates (-3d to +30d), partial-payment scripts, and pause notes for freelance payment links.",
    category: "template",
    lastModified: SEO_CONTENT_LAST_MODIFIED,
    changeFrequency: "monthly",
    priority: 0.9,
    includeInSitemap: true,
    includeInLlms: true,
  },
  {
    path: "/templates/whatsapp-payment-reminder-messages",
    title: "WhatsApp Payment Reminder Templates",
    description:
      "Copy 5 polite WhatsApp payment reminder messages for Stripe, Wise, PayPal, UPI, or bank links, plus wa.me URL formatting tips for freelancers.",
    category: "template",
    lastModified: SEO_CONTENT_LAST_MODIFIED,
    changeFrequency: "monthly",
    priority: 0.9,
    includeInSitemap: true,
    includeInLlms: true,
  },
  {
    path: "/guides/how-to-chase-unpaid-invoices",
    title: "How to Chase Unpaid Freelance Invoices",
    description:
      "Follow a 6-step freelance invoice cadence (-3d to +30d) covering partial payments, client promises, and WhatsApp nudges without awkwardness.",
    category: "guide",
    lastModified: SEO_CONTENT_LAST_MODIFIED,
    changeFrequency: "monthly",
    priority: 0.85,
    includeInSitemap: true,
    includeInLlms: true,
  },
  {
    path: "/compare/pingcue-vs-invoicing-suites",
    title: "PingCue vs Invoicing Suites & Manual Reminders",
    description:
      "Compare PingCue ($19 one-time payment-link chaser) with full accounting suites and manual reminders—including when each fits your freelance workflow.",
    category: "comparison",
    lastModified: SEO_CONTENT_LAST_MODIFIED,
    changeFrequency: "monthly",
    priority: 0.85,
    includeInSitemap: true,
    includeInLlms: true,
  },
  {
    path: "/login",
    title: "Sign in to PingCue",
    description:
      "Sign in or create a free PingCue account (1 active invoice free forever, no credit card required).",
    category: "core",
    lastModified: LEGAL_CONTENT_LAST_MODIFIED,
    changeFrequency: "monthly",
    priority: 0.5,
    includeInSitemap: false,
    includeInLlms: true,
  },
  {
    path: "/terms",
    title: "Terms of Service",
    description:
      "PingCue Terms of Service, acceptable use, plans, and billing terms.",
    category: "legal",
    lastModified: LEGAL_CONTENT_LAST_MODIFIED,
    changeFrequency: "yearly",
    priority: 0.3,
    includeInSitemap: true,
    includeInLlms: true,
  },
  {
    path: "/privacy",
    title: "Privacy Policy",
    description:
      "How PingCue collects, processes, protects, and deletes account and invoice reminder data.",
    category: "legal",
    lastModified: LEGAL_CONTENT_LAST_MODIFIED,
    changeFrequency: "yearly",
    priority: 0.3,
    includeInSitemap: true,
    includeInLlms: true,
  },
  {
    path: "/refund",
    title: "Refund & Cancellation Policy",
    description:
      "7-day no-questions-asked refund guarantee for the $19 one-time PingCue Founding Pass.",
    category: "legal",
    lastModified: LEGAL_CONTENT_LAST_MODIFIED,
    changeFrequency: "yearly",
    priority: 0.3,
    includeInSitemap: true,
    includeInLlms: true,
  },
];

export function getSitemapRoutes(): PublicSeoRoute[] {
  return PUBLIC_SEO_ROUTES.filter((route) => route.includeInSitemap);
}

export function getPublicAbsoluteUrls(siteUrl: string): string[] {
  const cleanOrigin = siteUrl.replace(/\/+$/, "");
  return getSitemapRoutes().map((route) =>
    route.path === "/" ? `${cleanOrigin}/` : `${cleanOrigin}${route.path}`
  );
}
