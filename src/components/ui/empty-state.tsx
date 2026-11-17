import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  tone?: "default" | "dark";
}

export const EmptyState = ({ icon: Icon, title, description, action, className, tone = "default" }: EmptyStateProps) => (
  <div className={cn("flex flex-col items-center justify-center px-6 py-10 text-center", className)}>
    <div className={cn("mb-4 flex size-14 items-center justify-center rounded-2xl", tone === "dark" ? "bg-sidebar-accent text-sidebar-foreground" : "bg-secondary text-primary ring-8 ring-secondary/40")}>
      <Icon className="size-6" />
    </div>
    <p className="text-sm font-semibold">{title}</p>
    {description && <p className={cn("mt-1.5 max-w-xs text-xs leading-relaxed", tone === "dark" ? "text-sidebar-muted" : "text-muted-foreground")}>{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
