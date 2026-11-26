"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <div className="hidden items-center gap-0.5 rounded-[10px] bg-black/[0.055] p-[3px] text-[12.5px] font-medium text-[#63636A] md:flex">
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex items-center rounded-[7px] px-3.5 py-1 tracking-[-0.01em] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#131316]",
              isActive
                ? "bg-white font-semibold text-[#131316] shadow-[0_1px_2px_rgba(19,19,22,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]"
                : "hover:text-[#131316]"
            )}
          >
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
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
      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-[9px] border border-[#131316] bg-[#131316] px-3 text-xs font-medium tracking-[-0.01em] text-white shadow-[0_1px_2px_rgba(19,19,22,0.18),inset_0_1px_0_rgba(255,255,255,0.16)] transition-all duration-150 hover:bg-[#26262B] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#131316] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F5F3]"
    >
      <Plus className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
      <span className="md:hidden">New</span>
      <span className="hidden md:inline">New invoice</span>
    </Link>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.07] bg-white/90 backdrop-blur-xl md:hidden"
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
                "flex min-h-[46px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-[10.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#131316]",
                isActive
                  ? "font-semibold text-[#131316]"
                  : "font-medium text-[#8E8E93] active:text-[#131316]"
              )}
            >
              <Icon
                className="h-[18px] w-[18px]"
                strokeWidth={isActive ? 2.1 : 1.75}
                aria-hidden="true"
              />
              <span className="leading-none">{item.label}</span>
              <span
                aria-hidden="true"
                className={cn(
                  "h-1 w-1 rounded-full transition-opacity",
                  isActive ? "bg-[#22C55E] opacity-100" : "opacity-0"
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
