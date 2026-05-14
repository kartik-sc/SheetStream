import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Dot,
} from "recharts";
import { useDashboard } from "@/context/DashboardContext";

// ── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(n) {
  if (n == null) return "$—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatCurrencyShort(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return formatCurrency(n);
}

// ── Custom tooltip ─────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-md text-sm">
      <p className="font-medium text-foreground mb-1">{label}</p>
      <p className="text-muted-foreground">
        Revenue:{" "}
        <span className="font-semibold text-foreground">
          {formatCurrency(payload[0]?.value)}
        </span>
      </p>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="flex h-[300px] flex-col gap-3 p-1">
      <div className="h-4 w-40 animate-pulse rounded-md bg-muted" />
      <div className="flex-1 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export default function RevenueLineChart() {
  const { state } = useDashboard();
  const { revenueMetrics, filters, loading } = state;
  const { dateRange } = filters;

  const chartData = useMemo(() => {
    const { start, end } = dateRange ?? {};

    const filtered = revenueMetrics.filter((row) => {
      if (start && row.month && row.month < start) return false;
      if (end   && row.month && row.month > end)   return false;
      return true;
    });

    // Group by month, summing revenue_usd in case there are multiple rows per month.
    const byMonth = new Map();
    for (const row of filtered) {
      const month = row.month ?? "Unknown";
      byMonth.set(month, (byMonth.get(month) ?? 0) + (parseFloat(row.revenue_usd) || 0));
    }

    return Array.from(byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue_usd]) => ({ month, revenue_usd }));
  }, [revenueMetrics, dateRange]);

  return (
    <div className="card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        Monthly Revenue Trend
      </h3>

      {loading.revenue ? (
        <Skeleton />
      ) : chartData.length === 0 ? (
        <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
          No revenue data for the selected period.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: 8 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(220, 14%, 89%)"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "hsl(220, 10%, 52%)" }}
              axisLine={false}
              tickLine={false}
              dy={6}
            />

            <YAxis
              tickFormatter={formatCurrencyShort}
              tick={{ fontSize: 11, fill: "hsl(220, 10%, 52%)" }}
              axisLine={false}
              tickLine={false}
              width={56}
            />

            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "hsl(220, 14%, 89%)", strokeWidth: 1 }} />

            <Line
              type="monotone"
              dataKey="revenue_usd"
              stroke="hsl(222, 60%, 45%)"
              strokeWidth={2}
              dot={<Dot r={3.5} fill="hsl(222, 60%, 45%)" strokeWidth={0} />}
              activeDot={{ r: 5, fill: "hsl(222, 60%, 45%)", stroke: "white", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
