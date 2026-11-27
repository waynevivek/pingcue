import type { Metadata, Viewport } from "next";
import { Figtree, JetBrains_Mono } from "next/font/google";
import { AnalyticsProviders } from "@/app/components/AnalyticsProviders";
import {
  getMetadataBase,
  getTwitterHandle,
  getVerificationTokens,
  isIndexingAllowed,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
} from "@/lib/site-config";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-figtree",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
});

const indexingAllowed = isIndexingAllowed();
const verificationTokens = getVerificationTokens();
const twitterHandle = getTwitterHandle();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FFFFFF",
};

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  applicationName: SITE_NAME,
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: [
    "PingCue",
    "automated invoice reminders",
    "invoice chaser for freelancers",
    "payment link reminders",
    "overdue invoice follow up email",
    "WhatsApp payment reminder",
    "freelance invoice reminder app",
    "Stripe payment link reminder",
    "Wise PayPal UPI payment reminder",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Finance & Productivity",
  referrer: "strict-origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: indexingAllowed
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      }
    : {
        index: false,
        follow: false,
      },
  ...(verificationTokens.google ||
  verificationTokens.bing ||
  verificationTokens.yandex
    ? {
        verification: {
          ...(verificationTokens.google
            ? { google: verificationTokens.google }
            : {}),
          ...(verificationTokens.yandex
            ? { yandex: verificationTokens.yandex }
            : {}),
          ...(verificationTokens.bing
            ? { other: { "msvalidate.01": verificationTokens.bing } }
            : {}),
        },
      }
    : {}),
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    ...(twitterHandle ? { site: twitterHandle, creator: twitterHandle } : {}),
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${figtree.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          defer
          src="https://www.ship-or-die.com/hackathon/verify.js"
          data-site="a35f839d5bfd45b002946ef70cb6b46e10a59388"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
        <AnalyticsProviders />
      </body>
    </html>
  );
}
