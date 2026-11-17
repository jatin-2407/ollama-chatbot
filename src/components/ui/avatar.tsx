import { cn } from "@/lib/utils";

export const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";

export const Avatar = ({ name, className }: { name: string; className?: string }) => (
  <div aria-hidden className={cn("flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground ring-2 ring-card", className)}>
    {initials(name)}
  </div>
);
