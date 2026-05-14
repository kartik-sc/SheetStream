import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/utils/cn";

const colorMap = {
  default: { icon: "bg-indigo-500/10 text-indigo-600" },
  green:   { icon: "bg-indigo-500/10 text-indigo-600" },
  amber:   { icon: "bg-violet-500/10 text-violet-600" },
  red:     { icon: "bg-rose-500/10   text-rose-500"   },
};

/**
 * KPICard — a single metric tile.
 *
 * @param {{ title: string, value: string, delta: number|null, icon: React.ComponentType, color: 'default'|'green'|'amber'|'red', loading?: boolean }} props
 */
export default function KPICard({ title, value, delta, icon: Icon, color = "default", loading = false }) {
  const colors = colorMap[color] ?? colorMap.default;

  const deltaPositive = delta > 0;
  const deltaZero     = delta === 0 || delta == null;
  const DeltaIcon     = deltaZero ? Minus : deltaPositive ? TrendingUp : TrendingDown;
  const deltaColor    = deltaZero
    ? "text-muted-foreground"
    : deltaPositive
    ? "text-indigo-600"
    : "text-rose-500";

  return (
    <div className="card group flex flex-col gap-4 p-5 transition-shadow duration-200 hover:shadow-md">
      {/* Header row */}
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", colors.icon)}>
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Icon className="h-4 w-4" strokeWidth={2} />
          )}
        </span>
      </div>

      {/* Value */}
      {loading ? (
        <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
      ) : (
        <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      )}

      {/* Delta */}
      <div className={cn("flex items-center gap-1 text-xs font-medium", deltaColor)}>
        <DeltaIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
        {deltaZero ? (
          <span className="text-muted-foreground">No prior period</span>
        ) : (
          <span>
            {deltaPositive ? "+" : ""}
            {delta.toFixed(1)}% vs prior period
          </span>
        )}
      </div>
    </div>
  );
}
