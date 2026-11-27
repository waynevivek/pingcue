import type { Metadata } from "next";
import {
  getSiteUrl,
  getSocialLinks,
  getSupportEmail,
  getTwitterHandle,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
} from "./site-config.ts";

export const FOUNDER_NAME = "Vivek Yadav";
export const FOUNDER_JOB_TITLE = "Founder";
export const FOUNDER_BYLINE = `${FOUNDER_NAME} — Founder, ${SITE_NAME}`;

export type FaqSchemaItem = {
  q: string;
  a: string;
};

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export type JsonLdValue = Record<string, unknown>;

export function toAbsoluteUrl(path: string, siteUrl = getSiteUrl()): string {
  const cleanOrigin = siteUrl.replace(/\/+$/, "");
  if (!path || path === "/") return `${cleanOrigin}/`;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanOrigin}${normalizedPath}`;
}

export function serializeJsonLd(data: JsonLdValue): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function buildPageMetadata({
  title,
  description,
  path,
  type = "website",
  keywords,
  noIndex = false,
  publishedTime,
  modifiedTime,
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  keywords?: string[];
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
}): Metadata {
  const twitterHandle = getTwitterHandle();
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: {
      canonical: path,
    },
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: false,
          },
        }
      : {}),
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "en_US",
      type,
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
      ...(type === "article" && modifiedTime ? { modifiedTime } : {}),
      ...(type === "article" ? { authors: [FOUNDER_NAME] } : {}),
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: SITE_TITLE,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(twitterHandle ? { site: twitterHandle, creator: twitterHandle } : {}),
      images: ["/opengraph-image"],
    },
  };
}

export function buildOrganizationJsonLd(siteUrl = getSiteUrl()): JsonLdValue {
  const sameAs = getSocialLinks();
  const supportEmail = getSupportEmail();

  return {
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: SITE_NAME,
    alternateName: [
      "PingCue Invoice Chaser",
      "PingCue Payment Reminders",
      "PingCue Web App",
    ],
    url: `${siteUrl}/`,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/apple-icon`,
      width: 180,
      height: 180,
    },
    image: `${siteUrl}/opengraph-image`,
    email: supportEmail,
    founder: {
      "@id": `${siteUrl}/#founder`,
    },
    description:
      "PingCue is an automated invoice payment reminder web application built for independent freelancers who send payment links by email or WhatsApp.",
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: supportEmail,
        availableLanguage: ["English"],
      },
    ],
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function buildFounderPersonJsonLd(siteUrl = getSiteUrl()): JsonLdValue {
  return {
    "@type": "Person",
    "@id": `${siteUrl}/#founder`,
    name: FOUNDER_NAME,
    jobTitle: FOUNDER_JOB_TITLE,
    worksFor: {
      "@id": `${siteUrl}/#organization`,
    },
  };
}

export function buildWebSiteJsonLd(siteUrl = getSiteUrl()): JsonLdValue {
  return {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: SITE_NAME,
    alternateName: "PingCue Invoice Chaser",
    url: `${siteUrl}/`,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    publisher: {
      "@id": `${siteUrl}/#organization`,
    },
  };
}

export function buildSoftwareApplicationJsonLd(
  siteUrl = getSiteUrl()
): JsonLdValue {
  return {
    "@type": ["WebApplication", "SoftwareApplication"],
    "@id": `${siteUrl}/#software`,
    name: SITE_NAME,
    alternateName: "PingCue Automated Invoice Reminder Web App",
    applicationCategory: "FinanceApplication",
    applicationSubCategory: "Invoice Payment Reminder Software",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript. Modern web browser.",
    url: `${siteUrl}/`,
    image: `${siteUrl}/opengraph-image`,
    screenshot: `${siteUrl}/opengraph-image`,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    isAccessibleForFree: true,
    audience: {
      "@type": "Audience",
      audienceType: "Independent freelancers and solo studios",
    },
    featureList: [
      "Automated escalating email reminders (-3d, 0d, +3d, +7d, +14d, +30d)",
      "Customizable reminder schedule per invoice",
      "Works with any HTTPS payment link (Stripe links, Wise, PayPal, UPI, Razorpay, bank transfer)",
      "Sends with freelancer display name and Reply-To email so client replies land in your inbox",
      "1-click Pause until a client's promised payment date",
      "Inline tone preview and Send test email to me",
      "Zero-API 1-click WhatsApp prefilled nudges via wa.me links",
      "Partial payment tracking across USD, EUR, GBP, and INR without FX guesswork",
    ],
    offers: [
      {
        "@type": "Offer",
        name: "PingCue Free Plan",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${siteUrl}/login`,
        description:
          "1 active invoice at a time forever, full escalating email schedule (-3d to +30d), custom schedule, 1-click Pause, and test email previews.",
      },
      {
        "@type": "Offer",
        name: "PingCue Founding Pass (One-Time)",
        price: "19",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${siteUrl}/#pricing`,
        description:
          "One-time $19 payment with no recurring subscription: unlimited active invoices, 1-click WhatsApp nudges, 12 months of V1.5 Document Chaser, and a 7-day refund guarantee.",
      },
    ],
    author: {
      "@id": `${siteUrl}/#founder`,
    },
    publisher: {
      "@id": `${siteUrl}/#organization`,
    },
  };
}

export function buildFaqJsonLd(
  items: readonly FaqSchemaItem[],
  id?: string
): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(id ? { "@id": id } : {}),
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function buildHomeJsonLd(
  faqs: readonly FaqSchemaItem[],
  siteUrl = getSiteUrl()
): JsonLdValue {
  const faqNode = buildFaqJsonLd(faqs, `${siteUrl}/#faq`);
  const { "@context": _ignored, ...faqWithoutContext } = faqNode;
  void _ignored;

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationJsonLd(siteUrl),
      buildFounderPersonJsonLd(siteUrl),
      buildWebSiteJsonLd(siteUrl),
      buildSoftwareApplicationJsonLd(siteUrl),
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/#webpage`,
        url: `${siteUrl}/`,
        name: SITE_TITLE,
        description: SITE_DESCRIPTION,
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#software` },
        primaryImageOfPage: `${siteUrl}/opengraph-image`,
        inLanguage: "en",
      },
      faqWithoutContext,
    ],
  };
}

export function buildBreadcrumbJsonLd(
  items: readonly BreadcrumbItem[],
  siteUrl = getSiteUrl()
): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path, siteUrl),
    })),
  };
}

export function buildArticleJsonLd({
  headline,
  description,
  path,
  datePublished,
  dateModified,
  siteUrl = getSiteUrl(),
}: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified: string;
  siteUrl?: string;
}): JsonLdValue {
  const pageUrl = toAbsoluteUrl(path, siteUrl);

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationJsonLd(siteUrl),
      buildFounderPersonJsonLd(siteUrl),
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        headline,
        description,
        url: pageUrl,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": pageUrl,
        },
        image: `${siteUrl}/opengraph-image`,
        datePublished,
        dateModified,
        inLanguage: "en",
        author: {
          "@id": `${siteUrl}/#founder`,
        },
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
      },
    ],
  };
}
