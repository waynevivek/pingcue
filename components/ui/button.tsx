import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#111111] text-white shadow-[0_6px_18px_-6px_rgba(17,17,17,0.4)] hover:bg-[#262626]",
        secondary:
          "bg-[#F4F4F5] text-[#111111] hover:bg-[#EAEAEF]",
        outline:
          "border border-black/10 bg-white text-[#111111] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-black/20 hover:bg-[#F4F4F5]",
        ghost: "text-[#111111] hover:bg-[#F4F4F5]",
        destructive:
          "bg-[#E11D48] text-white hover:bg-[#BE123C]",
        success:
          "border border-black/10 bg-[#C3F584] text-[#111111] hover:bg-[#b5ee6d]",
        inverted: "bg-white text-[#111111] hover:bg-[#F4F4F5]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3.5 text-xs",
        lg: "h-12 px-6 text-[15px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { buttonVariants };
