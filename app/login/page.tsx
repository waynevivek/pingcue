import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/app/components/BrandMark";
import { Card } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/db";
import { AuthForm } from "./AuthForm";

export const metadata: Metadata = {
  title: "Sign in — PingCue",
  description:
    "Sign in or create your PingCue account to manage invoice reminders.",
};

export default function LoginPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link
            href="/"
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <BrandMark />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to home</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md space-y-5">
          {!configured && (
            <section
              aria-label="Supabase setup instructions"
              className="rounded-xl border border-accent-border bg-accent-surface p-5 text-sm text-accent-foreground"
            >
              <h2 className="font-semibold text-accent-foreground">
                Connect Supabase to unlock sign-in
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-accent-foreground/90">
                The auth &amp; invoice screens are ready—add your free Supabase
                keys to turn them on:
              </p>
              <ol className="mt-3 list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-accent-foreground/90">
                <li>Create a free project on supabase.com.</li>
                <li>
                  Open <strong>SQL Editor</strong> and run{" "}
                  <code className="rounded bg-card/80 px-1 py-0.5 font-mono">
                    supabase/schema.sql
                  </code>
                  .
                </li>
                <li>
                  Add{" "}
                  <code className="rounded bg-card/80 px-1 py-0.5 font-mono">
                    NEXT_PUBLIC_SUPABASE_URL
                  </code>
                  ,{" "}
                  <code className="rounded bg-card/80 px-1 py-0.5 font-mono">
                    NEXT_PUBLIC_SUPABASE_ANON_KEY
                  </code>
                  , and{" "}
                  <code className="rounded bg-card/80 px-1 py-0.5 font-mono">
                    SUPABASE_SERVICE_ROLE_KEY
                  </code>{" "}
                  to <code className="font-mono">.env.local</code> and Vercel.
                </li>
              </ol>
            </section>
          )}

          <Card className="p-6 sm:p-8">
            <div className="mb-6">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Welcome to PingCue
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Start free with 1 active invoice—no credit card needed.
              </p>
            </div>

            <AuthForm disabled={!configured} />
          </Card>
        </div>
      </main>
    </div>
  );
}
