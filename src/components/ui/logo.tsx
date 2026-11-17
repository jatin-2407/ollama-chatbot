import { MessagesSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export const Logo = ({ className, subtitle }: { className?: string; subtitle?: string }) => (
  <div className={cn("flex items-center gap-2.5", className)}>
    <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
      <MessagesSquare className="size-5" />
    </div>
    <div className="leading-tight">
      <p className="font-semibold tracking-tight">Ollama Chat</p>
      {subtitle && <p className="text-xs opacity-70">{subtitle}</p>}
    </div>
  </div>
);
