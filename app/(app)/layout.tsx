import Link from "next/link";
import { Suspense } from "react";
import { FileText, LayoutDashboard, Settings } from "lucide-react";
import { BrandMark } from "@/app/components/BrandMark";
import { getUserProfile, requireUser } from "@/lib/db";
import { AppNav, MobileBottomNav, NewInvoiceHeaderButton } from "./AppNav";

function getInitial(displayName: string | null, email: string): string {
  const source = displayName?.trim() || email.trim() || "P";
  return source.charAt(0).toUpperCase();
}

async function UserNavActions() {
  const { user } = await requireUser();
  const profile = await getUserProfile(user.id, user.email ?? "");
  const isPass = profile.plan === "founding_pass";
  const accountEmail = profile.email || user.email || "";
  const initial = getInitial(profile.display_name, accountEmail);
  const label = isPass
    ? `${accountEmail} · Founding Pass`
    : `${accountEmail} · Free plan`;

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Suspense
        fallback={
          <div
            aria-hidden="true"
            className="h-8 w-16 animate-pulse rounded-[9px] bg-black/[0.06] md:w-28"
          />
        }
      >
        <NewInvoiceHeaderButton />
      </Suspense>

      <Link
        href="/settings"
        aria-label={`Account settings (${label})`}
        title={label}
        className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-xs font-semibold text-[#131316] shadow-[0_1px_2px_rgba(19,19,22,0.04)] transition-colors hover:border-black/20 hover:bg-[#FAFAFA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#131316] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F5F3]"
      >
        <span>{initial}</span>
        {isPass && (
          <span
            aria-hidden="true"
            className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#F5F5F3] bg-[#22C55E]"
          />
        )}
      </Link>
    </div>
  );
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F3] text-[#131316]">
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-[#F5F5F3]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1040px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#131316] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F5F3]"
          >
            <BrandMark size="sm" />
          </Link>

          <nav aria-label="App navigation" className="hidden items-center md:flex">
            <Suspense
              fallback={
                <div className="hidden items-center gap-0.5 rounded-[10px] bg-black/[0.055] p-[3px] text-[12.5px] font-medium text-[#63636A] md:flex">
                  <span className="rounded-[7px] px-3 py-1">Overview</span>
                  <span className="rounded-[7px] px-3 py-1">Invoices</span>
                  <span className="rounded-[7px] px-3 py-1">Settings</span>
                </div>
              }
            >
              <AppNav />
            </Suspense>
          </nav>

          <Suspense
            fallback={
              <div className="flex shrink-0 items-center gap-2">
                <div
                  aria-hidden="true"
                  className="h-8 w-16 animate-pulse rounded-[9px] bg-black/[0.06] md:w-28"
                />
                <div
                  aria-hidden="true"
                  className="h-8 w-8 animate-pulse rounded-full bg-black/[0.06]"
                />
              </div>
            }
          >
            <UserNavActions />
          </Suspense>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1040px] min-w-0 flex-1 px-4 pb-24 pt-5 sm:px-6 md:pb-14 md:pt-7 lg:px-8">
        {children}
      </main>

      <Suspense
        fallback={
          <div
            aria-hidden="true"
            className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.07] bg-white/90 backdrop-blur-xl md:hidden"
            style={{
              paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
            }}
          >
            <div className="mx-auto grid max-w-md grid-cols-3 px-2 pt-2 text-[10.5px] font-medium text-[#8E8E93]">
              <span className="flex min-h-[44px] flex-col items-center justify-center gap-1">
                <LayoutDashboard className="h-[18px] w-[18px]" />
                <span>Overview</span>
              </span>
              <span className="flex min-h-[44px] flex-col items-center justify-center gap-1">
                <FileText className="h-[18px] w-[18px]" />
                <span>Invoices</span>
              </span>
              <span className="flex min-h-[44px] flex-col items-center justify-center gap-1">
                <Settings className="h-[18px] w-[18px]" />
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
