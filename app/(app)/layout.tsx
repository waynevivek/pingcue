import Link from "next/link";
import { Suspense } from "react";
import { signOutAction } from "@/app/login/actions";
import { getUserProfile, requireUser } from "@/lib/db";

async function UserNavStatus() {
  const { user } = await requireUser();
  const profile = await getUserProfile(user.id, user.email ?? "");
  const isPass = profile.plan === "founding_pass";

  return (
    <div className="flex items-center gap-3">
      <span
        className={`hidden rounded-full border px-2.5 py-0.5 font-mono text-xs font-medium sm:inline-flex ${
          isPass
            ? "border-blue-200 bg-blue-50 text-blue-800"
            : "border-slate-200 bg-slate-50 text-slate-700"
        }`}
      >
        {isPass ? "Founding Pass" : "Free plan"}
      </span>
      <span className="hidden max-w-[180px] truncate text-xs text-slate-500 md:inline">
        {profile.email || user.email}
      </span>
      <form action={signOutAction}>
        <button
          type="submit"
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-md"
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

            <nav aria-label="App navigation" className="flex items-center gap-4 text-sm font-medium">
              <Link
                href="/dashboard"
                className="rounded-md px-2 py-1 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                Dashboard
              </Link>
              <Link
                href="/invoices"
                className="rounded-md px-2 py-1 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                Invoices
              </Link>
              <Link
                href="/invoices/new"
                className="hidden rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 sm:inline-flex"
              >
                + New invoice
              </Link>
            </nav>
          </div>

          <Suspense
            fallback={
              <div
                aria-hidden="true"
                className="h-8 w-32 animate-pulse rounded-lg bg-slate-100"
              />
            }
          >
            <UserNavStatus />
          </Suspense>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
