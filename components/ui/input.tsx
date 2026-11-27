import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-xl border border-black/12 bg-[#FAFAFA] px-3.5 py-2.5 text-base text-[#111111] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#63636A] focus-visible:border-[#111111] focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]/10 disabled:cursor-not-allowed disabled:bg-[#F4F4F5] disabled:opacity-70 aria-invalid:border-[#E11D48] aria-invalid:focus-visible:ring-[#E11D48]/20 sm:text-sm",
        className
      )}
      {...props}
    />
  );
}
