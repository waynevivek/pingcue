"use client";

import { track } from "@vercel/analytics";

export type AnalyticsEventName =
  | "founding_pass_click"
  | "founding_pass_email"
  | "checkout_initiated"
  | "checkout_redirect_login"
  | "template_copy"
  | "guide_cta_click";

export type AnalyticsEventProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (
      command: "event" | "config" | "js",
      target: string | Date,
      params?: Record<string, unknown>
    ) => void;
  }
}

/**
 * Privacy-safe client event dispatcher.
 * Sends non-PII scalar properties to Vercel Web Analytics and, when configured,
 * Google Analytics 4. Never pass email addresses or client names in props.
 */
export function trackEvent(
  name: AnalyticsEventName,
  props?: AnalyticsEventProps
): void {
  const safeProps: AnalyticsEventProps | undefined = props
    ? Object.fromEntries(
        Object.entries(props).filter(
          ([key, value]) =>
            !key.toLowerCase().includes("email") &&
            (typeof value === "string" ||
              typeof value === "number" ||
              typeof value === "boolean")
        )
      )
    : undefined;

  try {
    track(name, safeProps);
  } catch {
    // Analytics must never interrupt user flows
  }

  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", name, safeProps);
    }
  } catch {
    // Ignore third-party tag errors
  }
}
