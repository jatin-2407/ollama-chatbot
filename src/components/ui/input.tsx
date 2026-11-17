import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const Input = ({ className, ...props }: ComponentProps<"input">) => (
  <input
    className={cn(
      "h-11 w-full min-w-0 rounded-xl border border-input bg-card px-3.5 text-sm outline-none transition-[color,box-shadow]",
      "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
      className,
    )}
    {...props}
  />
);
