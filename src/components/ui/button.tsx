import type { ComponentProps } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  primary: "bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline: "border bg-card hover:bg-muted",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
} as const;

const SIZES = {
  md: "h-9 px-4",
  lg: "h-11 px-6",
  icon: "size-9",
  "icon-sm": "size-8",
} as const;

interface ButtonProps extends ComponentProps<"button"> {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  loading?: boolean;
}

export const Button = ({ variant = "primary", size = "md", loading = false, disabled, className, children, type = "button", ...props }: ButtonProps) => (
  <button
    type={type}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    className={cn(
      "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium outline-none transition-all",
      "focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      VARIANTS[variant],
      SIZES[size],
      className,
    )}
    {...props}
  >
    {loading && <Loader2 className="animate-spin" />}
    {children}
  </button>
);
