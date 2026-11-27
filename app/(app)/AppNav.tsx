"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  FileText,
  LayoutDashboard,
  Plus,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function SidebarNav({ overdueCount = 0 }: { overdueCount?: number }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Workspace navigation" className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        const showOverdueBadge = item.href === "/invoices" && overdueCount > 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group flex items-center justify-between gap-2.5 rounded-[11px] border px-3 py-2 text-[13px] tracking-[-0.01em] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]",
              isActive
                ? "border-[#BFE883] bg-[#F4FCE6] font-semibold text-[#1A2E05] shadow-[0_1px_2px_rgba(26,46,5,0.06)]"
                : "border-transparent font-medium text-[#52525B] hover:bg-[#F6F7F2] hover:text-[#111111]"
            )}
          >
            <span className="flex items-center gap-2.5">
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive
                    ? "text-[#365314]"
                    : "text-[#63636A] group-hover:text-[#111111]"
                )}
                strokeWidth={isActive ? 2.1 : 1.8}
                aria-hidden="true"
              />
              <span>{item.label}</span>
            </span>

            {showOverdueBadge ? (
              <span
                aria-label={`${overdueCount} overdue`}
                className="shrink-0 whitespace-nowrap rounded-full border border-[#FECDD3] bg-[#FFF5F6] px-1.5 py-0.5 font-mono text-[10px] font-semibold leading-none text-[#BE123C] tabular-nums"
              >
                {overdueCount}
              </span>
            ) : isActive ? (
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-[#65A30D]"
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function WorkspaceBreadcrumb() {
  const pathname = usePathname();

  let crumbs: Array<{ label: string; href?: string }> = [
    { label: "Workspace", href: "/dashboard" },
    { label: "Overview" },
  ];

  if (pathname === "/invoices") {
    crumbs = [
      { label: "Workspace", href: "/dashboard" },
      { label: "Invoices" },
    ];
  } else if (pathname === "/invoices/new") {
    crumbs = [
      { label: "Workspace", href: "/dashboard" },
      { label: "Invoices", href: "/invoices" },
      { label: "New invoice" },
    ];
  } else if (pathname.startsWith("/invoices/")) {
    crumbs = [
      { label: "Workspace", href: "/dashboard" },
      { label: "Invoices", href: "/invoices" },
      { label: "Invoice details" },
    ];
  } else if (pathname.startsWith("/settings")) {
    crumbs = [
      { label: "Workspace", href: "/dashboard" },
      { label: "Settings" },
    ];
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden min-w-0 items-center gap-1.5 text-[13px] md:flex"
    >
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <span
            key={`${crumb.label}-${index}`}
            className="inline-flex items-center gap-1.5"
          >
            {index > 0 && (
              <ChevronRight
                className="h-3.5 w-3.5 shrink-0 text-[#A1A1AA]"
                aria-hidden="true"
              />
            )}
            {crumb.href && !isLast ? (
              <Link
                href={crumb.href}
                className="rounded font-medium text-[#63636A] transition-colors hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                aria-current="page"
                className="truncate font-semibold text-[#111111]"
              >
                {crumb.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function NewInvoiceHeaderButton() {
  const pathname = usePathname();

  if (pathname === "/invoices/new") {
    return null;
  }

  return (
    <Link
      href="/invoices/new"
      className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] border border-[#111111] bg-[#111111] px-3 text-xs font-medium tracking-[-0.01em] text-white shadow-[0_1px_2px_rgba(17,17,17,0.16)] transition-colors duration-150 hover:bg-[#262626] active:bg-[#000000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6F7F2] sm:h-8"
    >
      <Plus className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
      <span className="sm:hidden">New</span>
      <span className="hidden sm:inline">New invoice</span>
    </Link>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.08] bg-white/95 backdrop-blur-md md:hidden"
      style={{
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="mx-auto grid max-w-md grid-cols-3 px-2 pt-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-[46px] flex-col items-center justify-center gap-1 rounded-[10px] px-2 py-1 text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]",
                isActive
                  ? "font-semibold text-[#111111]"
                  : "font-medium text-[#63636A] active:text-[#111111]"
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-10 items-center justify-center rounded-full transition-colors",
                  isActive ? "bg-[#C3F584]/70 text-[#1A2E05]" : "bg-transparent"
                )}
              >
                <Icon
                  className="h-[17px] w-[17px]"
                  strokeWidth={isActive ? 2.1 : 1.75}
                  aria-hidden="true"
                />
              </span>
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
