import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  ArrowUpRight,
  FileText,
  LayoutDashboard,
  Settings,
  Sparkles,
} from "lucide-react";
import { BrandMark } from "@/app/components/BrandMark";
import {
  countActiveInvoices,
  getUserProfile,
  listInvoices,
  requireUser,
} from "@/lib/db";
import { getTodayIsoDate, isInvoiceOverdue } from "@/lib/invoices";
import {
  MobileBottomNav,
  NewInvoiceHeaderButton,
  SidebarNav,
  WorkspaceBreadcrumb,
} from "./AppNav";

function getInitial(displayName: string | null, email: string): string {
  const source = displayName?.trim() || email.trim() || "P";
  return source.charAt(0).toUpperCase();
}

async function SidebarNavWithOverdue() {
  await connection();
  const { user } = await requireUser();
  const invoices = await listInvoices(user.id);
  const todayIso = getTodayIsoDate();
  const overdueCount = invoices.filter((inv) =>
    isInvoiceOverdue(inv, todayIso)
  ).length;

  return <SidebarNav overdueCount={overdueCount} />;
}

async function SidebarAccountFooter() {
  await connection();
  const { user } = await requireUser();
  const [profile, activeCount] = await Promise.all([
    getUserProfile(user.id, user.email ?? ""),
    countActiveInvoices(user.id),
  ]);

  const isPass = profile.plan === "founding_pass";
  const accountEmail = profile.email || user.email || "";
  const trimmedName = profile.display_name?.trim() || "";
  const primaryLabel = trimmedName || accountEmail;
  const secondaryLabel = trimmedName
    ? accountEmail
    : isPass
      ? "Founding Pass"
      : "Free plan";
  const initial = getInitial(profile.display_name, accountEmail);
  const clampedFreeCount = Math.min(activeCount, 1);

  return (
    <div className="space-y-2.5">
      {isPass ? (
        <Link
          href="/settings"
          className="group block rounded-[14px] border border-[#BFE883] bg-[#F4FCE6] p-3 transition-colors hover:border-[#A3D95B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#1A2E05]">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-[#16A34A]"
              />
              Founding Pass
            </span>
            <span className="font-mono text-[10px] font-semibold text-[#365314]">
              LIFETIME
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-snug text-[#3F6212]">
            Unlimited invoices &amp; WhatsApp nudges active.
          </p>
        </Link>
      ) : (
        <div className="rounded-[14px] border border-black/[0.08] bg-[#F6F7F2] p-3">
          <div className="flex items-center justify-between gap-2 text-[11.5px]">
            <span className="font-semibold text-[#111111]">Free plan</span>
            <span className="font-mono text-[11px] text-[#52525B] tabular-nums">
              {clampedFreeCount}/1 active
            </span>
          </div>
          <div
            aria-hidden="true"
            className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.07]"
          >
            <div
              style={{ width: `${clampedFreeCount * 100}%` }}
              className={`h-full rounded-full transition-all duration-300 ${
                clampedFreeCount >= 1 ? "bg-[#111111]" : "bg-[#65A30D]"
              }`}
            />
          </div>
          <Link
            href="/dashboard?upgrade=1"
            className="mt-2.5 inline-flex w-full items-center justify-between gap-1.5 rounded-[9px] border border-[#BFE883] bg-[#F4FCE6] px-2.5 py-1.5 text-[11.5px] font-semibold text-[#1A2E05] transition-colors hover:bg-[#E7F9C9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
          >
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>Pass — $19 once</span>
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          </Link>
        </div>
      )}

      <Link
        href="/settings"
        className="flex items-center gap-2.5 rounded-[11px] px-2 py-1.5 transition-colors hover:bg-[#F6F7F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
      >
        <span className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-black/10 bg-[#F6F7F2] text-[11px] font-semibold text-[#111111]">
          <span>{initial}</span>
          {isPass && (
            <span
              aria-hidden="true"
              className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#16A34A]"
            />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-semibold leading-tight text-[#111111]">
            {primaryLabel}
          </span>
          <span className="block truncate text-[11px] leading-tight text-[#63636A]">
            {secondaryLabel}
          </span>
        </span>
      </Link>
    </div>
  );
}

async function MobileAvatarAction() {
  await connection();
  const { user } = await requireUser();
  const profile = await getUserProfile(user.id, user.email ?? "");
  const isPass = profile.plan === "founding_pass";
  const accountEmail = profile.email || user.email || "";
  const initial = getInitial(profile.display_name, accountEmail);
  const label = isPass
    ? `${accountEmail} · Founding Pass`
    : `${accountEmail} · Free plan`;

  return (
    <Link
      href="/settings"
      aria-label={`Account settings (${label})`}
      title={label}
      className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-xs font-semibold text-[#111111] shadow-[0_1px_2px_rgba(17,17,17,0.04)] transition-colors hover:border-black/20 active:bg-[#F6F7F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] md:hidden"
    >
      <span>{initial}</span>
      {isPass && (
        <span
          aria-hidden="true"
          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#16A34A]"
        />
      )}
    </Link>
  );
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen bg-[#F6F7F2] text-[#111111]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:inline-flex focus:h-9 focus:items-center focus:rounded-[9px] focus:border focus:border-[#111111] focus:bg-[#111111] focus:px-3.5 focus:text-xs focus:font-medium focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#C3F584]"
      >
        Skip to main content
      </a>

      {/* Desktop Crisp White Left Sidebar Rail */}
      <aside className="sticky top-0 hidden h-screen w-[228px] shrink-0 flex-col justify-between border-r border-black/[0.07] bg-white md:flex">
        <div>
          <div className="flex h-14 items-center border-b border-black/[0.05] px-4">
            <Link
              href="/dashboard"
              className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <BrandMark size="sm" />
            </Link>
          </div>

          <div className="p-3">
            <Suspense
              fallback={
                <div className="space-y-1">
                  <div className="h-9 rounded-[11px] bg-[#F4FCE6]" />
                  <div className="h-9 rounded-[11px] bg-[#F6F7F2]" />
                  <div className="h-9 rounded-[11px] bg-[#F6F7F2]" />
                </div>
              }
            >
              <SidebarNavWithOverdue />
            </Suspense>
          </div>
        </div>

        <div className="border-t border-black/[0.05] p-3">
          <Suspense
            fallback={
              <div className="space-y-2.5">
                <div className="h-24 animate-pulse rounded-[14px] bg-[#F6F7F2]" />
                <div className="h-10 animate-pulse rounded-[11px] bg-[#F6F7F2]" />
              </div>
            }
          >
            <SidebarAccountFooter />
          </Suspense>
        </div>
      </aside>

      {/* Main Warm Daylight Bento Canvas */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        {/* Sticky Frosted Daylight Top Chrome Bar */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-black/[0.06] bg-[#F6F7F2]/90 px-4 backdrop-blur-md sm:px-6 md:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/dashboard"
              className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] md:hidden"
            >
              <BrandMark size="sm" />
            </Link>

            <Suspense
              fallback={
                <div className="hidden h-4 w-32 animate-pulse rounded bg-black/[0.05] md:block" />
              }
            >
              <WorkspaceBreadcrumb />
            </Suspense>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Suspense
              fallback={
                <div
                  aria-hidden="true"
                  className="h-8 w-16 animate-pulse rounded-[10px] bg-black/[0.06] sm:w-28"
                />
              }
            >
              <NewInvoiceHeaderButton />
            </Suspense>

            <Suspense
              fallback={
                <div
                  aria-hidden="true"
                  className="h-9 w-9 animate-pulse rounded-full bg-black/[0.06] md:hidden"
                />
              }
            >
              <MobileAvatarAction />
            </Suspense>
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1060px] min-w-0 flex-1 px-4 pb-24 pt-5 outline-none sm:px-6 md:px-7 md:pb-12 md:pt-6"
        >
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <Suspense
        fallback={
          <div
            aria-hidden="true"
            className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.08] bg-white/95 backdrop-blur-md md:hidden"
            style={{
              paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
            }}
          >
            <div className="mx-auto grid max-w-md grid-cols-3 px-2 pt-2 text-[11px] font-medium text-[#63636A]">
              <span className="flex min-h-[44px] flex-col items-center justify-center gap-1">
                <LayoutDashboard className="h-[17px] w-[17px]" />
                <span>Overview</span>
              </span>
              <span className="flex min-h-[44px] flex-col items-center justify-center gap-1">
                <FileText className="h-[17px] w-[17px]" />
                <span>Invoices</span>
              </span>
              <span className="flex min-h-[44px] flex-col items-center justify-center gap-1">
                <Settings className="h-[17px] w-[17px]" />
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
