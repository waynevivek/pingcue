import type { Metadata } from "next";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/db";
import { AuthForm } from "./AuthForm";

export const metadata: Metadata = {
  title: "Sign in — PingCue",
  description: "Sign in or create your PingCue account to manage invoice reminders.",
};

export default function LoginPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-md"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB] text-white shadow-xs">
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                className="h-4.5 w-4.5"
              >
                <path
                  d="M3.5 10.5 8 15l8.5-9.5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="font-display text-xl tracking-tight">PingCue</span>
          </Link>

          <Link
            href="/"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
          >
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md space-y-5">
          {!configured && (
            <section
              aria-label="Supabase setup instructions"
              className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950 shadow-2xs"
            >
              <h2 className="font-semibold text-amber-950">
                Connect Supabase to unlock sign-in
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-amber-900">
                The auth &amp; invoice screens are ready—add your free Supabase keys
                to turn them on:
              </p>
              <ol className="mt-3 list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-amber-900">
                <li>Create a free project on supabase.com.</li>
                <li>
                  Open <strong>SQL Editor</strong> and run{" "}
                  <code className="rounded bg-amber-100 px-1 py-0.5 font-mono">
                    supabase/schema.sql
                  </code>
                  .
                </li>
                <li>
                  Add{" "}
                  <code className="rounded bg-amber-100 px-1 py-0.5 font-mono">
                    NEXT_PUBLIC_SUPABASE_URL
                  </code>
                  ,{" "}
                  <code className="rounded bg-amber-100 px-1 py-0.5 font-mono">
                    NEXT_PUBLIC_SUPABASE_ANON_KEY
                  </code>
                  , and{" "}
                  <code className="rounded bg-amber-100 px-1 py-0.5 font-mono">
                    SUPABASE_SERVICE_ROLE_KEY
                  </code>{" "}
                  to <code className="font-mono">.env.local</code> and Vercel.
                </li>
              </ol>
            </section>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <h1 className="font-display text-2xl text-slate-900 sm:text-3xl">
                Welcome to PingCue
              </h1>
              <p className="mt-1.5 text-sm text-slate-600">
                Start free with 1 active invoice—no credit card needed.
              </p>
            </div>

            <AuthForm disabled={!configured} />
          </div>
        </div>
      </main>
    </div>
  );
}
