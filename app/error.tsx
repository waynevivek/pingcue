"use client";

import Link from "next/link";
import { useEffect } from "react";
import { BrandMark } from "@/app/components/BrandMark";
import { Button } from "@/components/ui/button";
import { SUPPORT_EMAIL } from "@/lib/site-config";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled PingCue route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFA] text-[#111111]">
      <header className="border-b border-black/[0.06] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2"
          >
            <BrandMark size="sm" />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-[28px] border border-black/[0.08] bg-white p-8 text-center shadow-[0_12px_36px_-20px_rgba(15,23,42,0.12)]">
          <span className="inline-flex items-center rounded-full border border-[#FECDD3] bg-[#FFE4E6] px-3 py-1 text-xs font-semibold text-[#9F1239]">
            Something went wrong
          </span>
          <h1 className="mt-4 font-sans text-2xl font-semibold tracking-[-0.03em] text-[#111111]">
            We hit an unexpected snag
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#52525B]">
            Try reloading this page. If it keeps happening, email{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-semibold text-[#111111] underline"
            >
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Button type="button" onClick={reset}>
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
