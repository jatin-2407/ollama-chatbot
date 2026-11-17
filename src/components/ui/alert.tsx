import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const variants = {
  error: { icon: AlertCircle, cls: "border-destructive/30 bg-destructive/10 text-destructive" },
  success: { icon: CheckCircle2, cls: "border-success/30 bg-success/10 text-success" },
  info: { icon: Info, cls: "border-primary/25 bg-secondary text-secondary-foreground" },
};

interface AlertProps {
  variant?: keyof typeof variants;
  children: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export const Alert = ({ variant = "error", children, action, onDismiss, className }: AlertProps) => {
  const { icon: Icon, cls } = variants[variant];
  return (
    <div role={variant === "error" ? "alert" : "status"} className={cn("flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm", cls, className)}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
      {action}
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
};
