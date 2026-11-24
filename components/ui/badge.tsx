import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 font-sans text-xs font-semibold tabular-nums whitespace-nowrap transition-colors",
  {
    variants: {
      variant: {
        neutral: "border-black/[0.08] bg-[#F4F4F5] text-[#52525B]",
        primary: "border-[#BFDBFE] bg-[#DBEAFE] text-[#1E3A8A]",
        firm: "border-[#FDE047] bg-[#FEF08A] text-[#713F12]",
        overdue: "border-[#FECDD3] bg-[#FFE4E6] text-[#9F1239]",
        paid: "border-[#BBF7D0] bg-[#DCFCE7] text-[#14532D]",
        outline: "border-black/10 bg-white text-[#111111]",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { badgeVariants };
