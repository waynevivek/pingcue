import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const GA4_ID_PATTERN = /^G-[A-Z0-9]{4,20}$/i;
const CLARITY_ID_PATTERN = /^[a-z0-9]{6,20}$/i;

function getGaMeasurementId(): string | null {
  const raw = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  return raw && GA4_ID_PATTERN.test(raw) ? raw : null;
}

function getClarityProjectId(): string | null {
  const raw = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();
  return raw && CLARITY_ID_PATTERN.test(raw) ? raw : null;
}

/**
 * Mounts Vercel Web Analytics & Speed Insights globally, plus optional
 * Google Analytics 4 and Microsoft Clarity when their public env IDs are set.
 */
export function AnalyticsProviders() {
  const gaMeasurementId = getGaMeasurementId();
  const clarityProjectId = getClarityProjectId();

  return (
    <>
      <Analytics />
      <SpeedInsights />

      {gaMeasurementId && (
        <>
          <Script
            id="ga4-loader"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-config" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${gaMeasurementId}', { anonymize_ip: true });`}
          </Script>
        </>
      )}

      {clarityProjectId && (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${clarityProjectId}");`}
        </Script>
      )}
    </>
  );
}
