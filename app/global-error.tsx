"use client";

import Link from "next/link";
import { useEffect } from "react";
import { SUPPORT_EMAIL } from "@/lib/site-config";

export default function GlobalError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled PingCue root error:", error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Something went wrong — PingCue</title>
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          backgroundColor: "#FAFAFA",
          color: "#111111",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif",
        }}
      >
        <main
          style={{
            width: "100%",
            maxWidth: "440px",
            backgroundColor: "#FFFFFF",
            border: "1px solid rgba(17, 17, 17, 0.08)",
            borderRadius: "28px",
            padding: "32px",
            textAlign: "center",
            boxShadow: "0 12px 36px -20px rgba(15, 23, 42, 0.12)",
          }}
        >
          <span
            style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: "9999px",
              border: "1px solid #FECDD3",
              backgroundColor: "#FFE4E6",
              color: "#9F1239",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            Something went wrong
          </span>

          <h1
            style={{
              margin: "16px 0 0",
              fontSize: "24px",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
            }}
          >
            We hit an unexpected snag
          </h1>

          <p
            style={{
              margin: "10px 0 0",
              fontSize: "14px",
              lineHeight: 1.6,
              color: "#52525B",
            }}
          >
            Try reloading this page. If it keeps happening, email{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              style={{
                color: "#111111",
                fontWeight: 600,
                textDecoration: "underline",
              }}
            >
              {SUPPORT_EMAIL}
            </a>
            .
          </p>

          <div
            style={{
              marginTop: "24px",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <button
              type="button"
              onClick={() => retry()}
              style={{
                height: "40px",
                padding: "0 20px",
                borderRadius: "9999px",
                border: "none",
                backgroundColor: "#111111",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>

            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: "40px",
                padding: "0 20px",
                borderRadius: "9999px",
                border: "1px solid rgba(17, 17, 17, 0.12)",
                backgroundColor: "#FFFFFF",
                color: "#111111",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Back to home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
