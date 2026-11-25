"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function CollapsibleSection({
  title,
  description,
  defaultOpen = false,
  children,
}: {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-[24px] border border-black/[0.08] bg-white shadow-[0_8px_28px_-18px_rgba(15,23,42,0.1)]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 rounded-[24px] px-5 py-4 text-left transition-colors hover:bg-[#FAFAFA] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] sm:px-6 sm:py-5"
      >
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-[#111111]">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-[#52525B]">{description}</p>
          )}
        </div>
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/[0.08] bg-[#F4F4F5] text-[#111111]"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-150",
              open && "rotate-180"
            )}
          />
        </span>
      </button>

      {open && (
        <div className="border-t border-black/[0.06] p-5 sm:p-6">
          {children}
        </div>
      )}
    </div>
  );
}
