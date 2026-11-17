import { Check, Cpu, RefreshCw } from "lucide-react";
import type { ModelInfo } from "@/shared/types";
import { LIMITS } from "@/shared/schemas";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface ModelPickerProps {
  models: ModelInfo[];
  loading: boolean;
  error: string;
  onRetry: () => void;
  selected: string[];
  onChange: (selected: string[]) => void;
  invalid?: string;
}

const formatSize = (bytes?: number) => (bytes ? `${(bytes / 1e9).toFixed(1)} GB` : "");

export const ModelPicker = ({ models, loading, error, onRetry, selected, onChange, invalid }: ModelPickerProps) => {
  const toggle = (name: string) =>
    onChange(selected.includes(name) ? selected.filter((m) => m !== name) : selected.length < LIMITS.maxModels ? [...selected, name] : selected);

  return (
    <fieldset className="space-y-2">
      <div className="flex items-center justify-between">
        <legend className="text-sm font-medium">Models</legend>
        <span className="text-xs text-muted-foreground">{selected.length}/{LIMITS.maxModels} selected</span>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-11" />)}</div>
      ) : error ? (
        <Alert action={<button type="button" onClick={onRetry} aria-label="Retry" className="shrink-0"><RefreshCw className="size-4" /></button>}>{error}</Alert>
      ) : models.length === 0 ? (
        <Alert variant="info">No models installed. Run <code className="font-mono">ollama pull llama3</code> and try again.</Alert>
      ) : (
        <div className="scroll-thin max-h-56 space-y-1.5 overflow-y-auto pr-1">
          {models.map(({ name, size }) => {
            const isSelected = selected.includes(name);
            const disabled = !isSelected && selected.length >= LIMITS.maxModels;
            return (
              <button
                key={name}
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                disabled={disabled}
                onClick={() => toggle(name)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition",
                  isSelected ? "border-primary bg-secondary ring-2 ring-primary/15" : "bg-card hover:border-primary/40 hover:bg-muted",
                  disabled && "cursor-not-allowed opacity-50",
                )}
              >
                <Cpu className={cn("size-4 shrink-0", isSelected ? "text-primary" : "text-muted-foreground")} />
                <span className="min-w-0 flex-1 truncate font-medium">{name}</span>
                <span className="text-xs text-muted-foreground">{formatSize(size)}</span>
                <span className={cn("flex size-5 items-center justify-center rounded-full border", isSelected && "border-primary bg-primary text-primary-foreground")}>
                  {isSelected && <Check className="size-3" />}
                </span>
              </button>
            );
          })}
        </div>
      )}
      {invalid && <p className="text-xs text-destructive">{invalid}</p>}
    </fieldset>
  );
};
