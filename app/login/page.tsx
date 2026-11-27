import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/app/components/BrandMark";
import {
  InteractiveSticker,
  PerchedPingMascot,
  SparkleSticker,
  StarBuddySticker,
} from "@/app/components/HeroStickers";
import { getAuthCallbackErrorMessage } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/db";
import { buildPageMetadata } from "@/lib/seo";
import { AuthForm, type AuthMode } from "./AuthForm";

export const metadata: Metadata = buildPageMetadata({
  title: "Sign in — PingCue",
  description:
    "Sign in or create your free PingCue account to automate invoice payment reminders.",
  path: "/login",
});

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const raw = params[key];
  return Array.isArray(raw) ? raw[0] : raw;
}

async function LoginFormSection({
  configured,
  searchParams,
}: {
  configured: boolean;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;
  const upgrade = readParam(resolvedParams, "upgrade") === "1";
  const rawMode = readParam(resolvedParams, "mode");
  const initialMode: AuthMode =
    rawMode === "signup" || rawMode === "forgot" ? rawMode : "signin";
  const callbackError = getAuthCallbackErrorMessage(
    readParam(resolvedParams, "error")
  );

  return (
    <AuthForm
      disabled={!configured}
      upgrade={upgrade}
      initialMode={initialMode}
      callbackError={callbackError}
    />
  );
}

export default function LoginPage(props: PageProps<"/login">) {
  const configured = isSupabaseConfigured();

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFFFF] text-[#111111]">
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2"
          >
            <BrandMark size="sm" />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#F4F4F5] px-3.5 py-1.5 text-xs font-semibold text-[#111111] transition-colors hover:bg-[#EAEAEF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] sm:text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to home</span>
          </Link>
        </div>
      </header>

      <main className="relative flex flex-1 items-center justify-center overflow-x-clip px-4 py-12 sm:px-6 sm:py-16">
        <div className="relative w-full max-w-[460px] space-y-5">
          {/* Desktop floating die-cut stickers flanking the stage */}
          <div className="absolute -left-24 top-10 hidden lg:block">
            <InteractiveSticker tiltClass="-rotate-[12deg] hover:-rotate-[4deg]">
              <StarBuddySticker className="h-[72px] w-[72px]" />
            </InteractiveSticker>
          </div>
          <div className="absolute -right-24 bottom-12 hidden lg:block">
            <InteractiveSticker tiltClass="rotate-[10deg] hover:rotate-[2deg]">
              <SparkleSticker className="h-[68px] w-[72px]" />
            </InteractiveSticker>
          </div>

          {!configured && (
            <section
              aria-label="Supabase setup instructions"
              className="rounded-[24px] border border-black/[0.08] bg-[#FFF1A8] p-5 text-sm text-[#4B4116]"
            >
              <h2 className="font-semibold text-[#111111]">
                Connect Supabase to unlock sign-in
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#4B4116]">
                The auth &amp; invoice screens are ready—add your free Supabase
                keys to turn them on:
              </p>
              <ol className="mt-3 list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-[#4B4116]">
                <li>Create a free project on supabase.com.</li>
                <li>
                  Open <strong>SQL Editor</strong> and run{" "}
                  <code className="rounded bg-white/80 px-1 py-0.5 font-mono text-[#111111]">
                    supabase/schema.sql
                  </code>
                  .
                </li>
                <li>
                  Add{" "}
                  <code className="rounded bg-white/80 px-1 py-0.5 font-mono text-[#111111]">
                    NEXT_PUBLIC_SUPABASE_URL
                  </code>
                  ,{" "}
                  <code className="rounded bg-white/80 px-1 py-0.5 font-mono text-[#111111]">
                    NEXT_PUBLIC_SUPABASE_ANON_KEY
                  </code>
                  , and{" "}
                  <code className="rounded bg-white/80 px-1 py-0.5 font-mono text-[#111111]">
                    SUPABASE_SERVICE_ROLE_KEY
                  </code>{" "}
                  to{" "}
                  <code className="rounded bg-white/80 px-1 py-0.5 font-mono text-[#111111]">
                    .env.local
                  </code>{" "}
                  and Vercel.
                </li>
              </ol>
            </section>
          )}

          {/* Signature Sky-and-Meadow Illustrated Stage Frame */}
          <div className="relative rounded-[32px] border border-black/[0.06] p-3 pt-11 shadow-[0_24px_64px_-24px_rgba(37,99,235,0.22)] sm:p-5 sm:pt-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px] bg-[#84D6FF]"
            >
              <div className="absolute inset-x-0 top-0 h-[36%] bg-[#5BC2FF]" />
              <svg
                viewBox="0 0 600 140"
                preserveAspectRatio="xMidYMin slice"
                className="absolute inset-x-0 top-0 h-[120px] w-full"
                fill="none"
              >
                <rect x="24" y="24" width="112" height="24" rx="12" fill="#FFFFFF" />
                <rect x="48" y="12" width="64" height="22" rx="11" fill="#FFFFFF" />
                <rect x="424" y="20" width="136" height="26" rx="13" fill="#FFFFFF" />
                <rect x="454" y="8" width="76" height="24" rx="12" fill="#FFFFFF" />
                <rect x="440" y="37" width="104" height="8" rx="4" fill="#FFE0EB" />
              </svg>
              <svg
                viewBox="0 0 600 140"
                preserveAspectRatio="xMidYMax slice"
                className="absolute inset-x-0 bottom-0 h-[120px] w-full"
                fill="none"
              >
                <path
                  d="M0 44C120 4 250 54 390 28C490 10 550 24 600 34V140H0V44Z"
                  fill="#C7F584"
                />
                <path
                  d="M0 78C160 46 350 96 600 64V140H0V78Z"
                  fill="#A8EC62"
                />
                <circle cx="52" cy="108" r="4" fill="#FFE875" />
                <circle cx="536" cy="104" r="4.5" fill="#FFFFFF" />
              </svg>
            </div>

            <div className="relative z-10">
              <PerchedPingMascot
                sleeping={false}
                className="absolute -top-[40px] left-5 z-20 h-[54px] w-[84px] sm:-top-[44px] sm:left-6 sm:h-[58px] sm:w-[92px]"
              />

              <div className="rounded-[22px] border border-black/[0.08] bg-white p-6 shadow-[0_20px_50px_-14px_rgba(15,23,42,0.2)] sm:p-8">
                <div className="mb-6">
                  <h1 className="font-sans text-[26px] font-semibold leading-tight tracking-[-0.03em] text-[#111111] sm:text-[28px]">
                    Welcome to PingCue
                  </h1>
                  <p className="mt-1.5 text-sm text-[#52525B]">
                    Start free with 1 active invoice—no credit card needed.
                  </p>
                </div>

                <Suspense
                  fallback={
                    <div className="space-y-4">
                      <div className="h-10 w-full animate-pulse rounded-full bg-[#F4F4F5]" />
                      <div className="h-11 w-full animate-pulse rounded-xl bg-[#F4F4F5]" />
                      <div className="h-11 w-full animate-pulse rounded-xl bg-[#F4F4F5]" />
                      <div className="h-12 w-full animate-pulse rounded-full bg-[#F4F4F5]" />
                    </div>
                  }
                >
                  <LoginFormSection
                    configured={configured}
                    searchParams={props.searchParams}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
