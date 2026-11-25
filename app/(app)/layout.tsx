import Link from "next/link";
import { Suspense } from "react";
import { FileText, LayoutDashboard, LogOut, Plus, Settings } from "lucide-react";
import { BrandMark } from "@/app/components/BrandMark";
import { signOutAction } from "@/app/login/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUserProfile, requireUser } from "@/lib/db";
import { AppNav, MobileBottomNav } from "./AppNav";

async function UserNavStatus() {
  const { user } = await requireUser();
  const profile = await getUserProfile(user.id, user.email ?? "");
  const isPass = profile.plan === "founding_pass";

  return (
    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
      <Badge
        variant={isPass ? "paid" : "neutral"}
        className="hidden md:inline-flex"
      >
        {isPass ? "Founding Pass" : "Free plan"}
      </Badge>
      <span className="hidden max-w-[170px] truncate text-xs text-[#52525B] lg:inline">
        {profile.display_name || profile.email || user.email}
      </span>

      <Button asChild size="sm" className="h-9 px-3.5 text-xs md:hidden">
        <Link href="/invoices/new">
          <Plus className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden="true" />
          <span>New</span>
        </Link>
      </Button>

      <form action={signOutAction}>
        <Button
          type="submit"
          variant="outline"
          size="icon"
          aria-label="Sign out"
          title="Sign out"
          className="h-9 w-9 md:hidden"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button
          type="submit"
          variant="outline"
          size="sm"
          className="hidden md:inline-flex"
        >
          Sign out
        </Button>
      </form>
    </div>
  );
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F7F5] text-[#111111]">
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 md:py-3 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href="/dashboard"
              className="shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2"
            >
              <BrandMark size="sm" />
            </Link>

            <nav aria-label="App navigation" className="hidden items-center gap-3 md:flex">
              <Suspense
                fallback={
                  <div className="hidden items-center gap-0.5 rounded-full border border-black/[0.07] bg-[#F4F4F5]/90 p-1 text-[13px] font-medium text-[#52525B] md:flex">
                    <span className="rounded-full px-3.5 py-1.5">Dashboard</span>
                    <span className="rounded-full px-3.5 py-1.5">Invoices</span>
                    <span className="rounded-full px-3.5 py-1.5">Settings</span>
                  </div>
                }
              >
                <AppNav />
              </Suspense>
              <Button asChild size="sm" className="h-9 px-3.5 text-xs">
                <Link href="/invoices/new">
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden="true" />
                  <span>New invoice</span>
                </Link>
              </Button>
            </nav>
          </div>

          <Suspense
            fallback={
              <div className="flex shrink-0 items-center gap-2">
                <div
                  aria-hidden="true"
                  className="h-9 w-16 animate-pulse rounded-full bg-[#F4F4F5] md:w-28"
                />
                <div
                  aria-hidden="true"
                  className="h-9 w-9 animate-pulse rounded-full bg-[#F4F4F5] md:w-20"
                />
              </div>
            }
          >
            <UserNavStatus />
          </Suspense>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl min-w-0 flex-1 px-4 pb-28 pt-5 sm:px-6 md:pb-12 md:pt-8 lg:px-8">
        {children}
      </main>

      <Suspense
        fallback={
          <div
            aria-hidden="true"
            className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.08] bg-white/95 md:hidden"
            style={{
              paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
            }}
          >
            <div className="mx-auto grid max-w-md grid-cols-3 gap-1 px-3 pt-1.5 text-[11px] font-semibold text-[#71717A]">
              <span className="flex min-h-[48px] flex-col items-center justify-center gap-1">
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </span>
              <span className="flex min-h-[48px] flex-col items-center justify-center gap-1">
                <FileText className="h-4 w-4" />
                <span>Invoices</span>
              </span>
              <span className="flex min-h-[48px] flex-col items-center justify-center gap-1">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </span>
            </div>
          </div>
        }
      >
        <MobileBottomNav />
      </Suspense>
    </div>
  );
}
