import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/app/components/BrandMark";
import { Button } from "@/components/ui/button";

export default function NotFound() {
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

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#F4F4F5] px-3.5 py-1.5 text-xs font-semibold text-[#111111] transition-colors hover:bg-[#EAEAEF]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to home</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-[28px] border border-black/[0.08] bg-white p-8 text-center shadow-[0_12px_36px_-20px_rgba(15,23,42,0.12)]">
          <span className="inline-flex items-center rounded-full bg-[#F4F4F5] px-3 py-1 font-mono text-xs font-semibold text-[#52525B]">
            404
          </span>
          <h1 className="mt-4 font-sans text-2xl font-semibold tracking-[-0.03em] text-[#111111]">
            Page not found
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#52525B]">
            The page or invoice link you opened doesn&apos;t exist or may have
            been removed.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/">Back to home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
