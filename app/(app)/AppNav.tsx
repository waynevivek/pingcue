"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/invoices", label: "Invoices" },
  { href: "/settings", label: "Settings" },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-black/[0.07] bg-[#F4F4F5]/85 p-1 text-[13px] font-medium text-[#52525B]">
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-full px-3 py-1 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]",
              isActive
                ? "bg-white font-semibold text-[#111111] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                : "hover:bg-white/70 hover:text-[#111111]"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
