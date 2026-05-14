import { cn } from "@/utils/cn";

/**
 * Minimal ToggleGroup — single-select segmented control.
 *
 * Props:
 *   value     string          — currently selected value
 *   onChange  (v: string) => void
 *   options   { label, value }[]
 */
export function ToggleGroup({ value, onChange, options = [], className }) {
  return (
    <div
      role="group"
      className={cn(
        "inline-flex h-8 items-center rounded-lg border border-border bg-background p-0.5",
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
