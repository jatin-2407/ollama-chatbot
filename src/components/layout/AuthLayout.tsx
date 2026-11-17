import type { ReactNode } from "react";
import { Bot, Lock } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const FEATURES = [
  { icon: Bot, text: "Chat with any model running on your local Ollama" },
  { icon: Lock, text: "Your conversations stay on your own machine" },
];

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export const AuthLayout = ({ title, subtitle, children, footer }: AuthLayoutProps) => (
  <div className="flex min-h-full">
    <aside className="m-3 hidden w-[42%] flex-col justify-between rounded-3xl bg-primary p-10 text-primary-foreground lg:flex">
      <Logo subtitle="Local LLM playground" className="[&>div:first-child]:bg-primary-foreground/15 [&>div:first-child]:shadow-none" />
      <div className="space-y-6">
        <h2 className="max-w-sm text-4xl font-semibold leading-tight tracking-tight">
          Talk to your <span className="text-primary-foreground/70">local models.</span>
        </h2>
        <ul className="space-y-4">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-primary-foreground/85">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary-foreground/15">
                <Icon className="size-4" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xs text-primary-foreground/60">Powered by Ollama</p>
    </aside>

    <main className="relative flex flex-1 items-center justify-center p-6">
      <ThemeToggle className="absolute top-5 right-5" />
      <div className="w-full max-w-sm rounded-3xl border bg-card p-8 shadow-xl shadow-primary/5">
        <Logo className="mb-8 lg:hidden" />
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-8">{children}</div>
        <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
      </div>
    </main>
  </div>
);
