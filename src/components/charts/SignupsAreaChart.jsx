import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useDashboard } from "@/context/DashboardContext";

// ── Custom tooltip ─────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const byKey = Object.fromEntries(payload.map((p) => [p.dataKey, p.value]));
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-md text-sm min-w-[150px]">
      <p className="font-medium text-foreground mb-1.5">{label}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-[#6366f1]" />
            New Signups
          </span>
          <span className="font-semibold text-foreground">{byKey.new_signups ?? "—"}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-[#f43f5e]" />
            Churned
          </span>
          <span className="font-semibold text-foreground">{byKey.churned ?? "—"}</span>
        </div>
      </div>
    </div>
  );
}

// ── Custom legend ──────────────────────────────────────────────────────────

function ChartLegend() {
  return (
    <div className="mt-2 flex justify-center gap-5 text-xs text-muted-foreground">
      {[
        { color: "#6366f1", label: "New Signups" },
        { color: "#f43f5e", label: "Churned" },
      ].map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
          {label}
        </div>
      ))}
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="h-[300px] animate-pulse rounded-lg bg-muted" />
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export default function SignupsAreaChart() {
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

    // Group by month, summing both fields.
    const byMonth = new Map();
    for (const row of filtered) {
      const month = row.month ?? "Unknown";
      const prev  = byMonth.get(month) ?? { new_signups: 0, churned: 0 };
      byMonth.set(month, {
        new_signups: prev.new_signups + (parseInt(row.new_signups, 10) || 0),
        churned:     prev.churned     + (parseInt(row.churned,     10) || 0),
      });
    }

    return Array.from(byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, vals]) => ({ month, ...vals }));
  }, [revenueMetrics, dateRange]);

  return (
    <div className="card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Signups vs Churn</h3>

      {loading.revenue ? (
        <Skeleton />
      ) : chartData.length === 0 ? (
        <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
          No revenue data for the selected period.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: 4 }}>
            <defs>
              <linearGradient id="gradSignups" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0}   />
              </linearGradient>
              <linearGradient id="gradChurned" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0}   />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 89%)" vertical={false} />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "hsl(220, 10%, 52%)" }}
              axisLine={false}
              tickLine={false}
              dy={6}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(220, 10%, 52%)" }}
              axisLine={false}
              tickLine={false}
              width={28}
            />

            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "hsl(220, 14%, 89%)", strokeWidth: 1 }} />
            <Legend content={<ChartLegend />} />

            <Area
              type="monotone"
              dataKey="new_signups"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#gradSignups)"
              dot={false}
              activeDot={{ r: 4, fill: "#6366f1", stroke: "white", strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="churned"
              stroke="#f43f5e"
              strokeWidth={2}
              fill="url(#gradChurned)"
              dot={false}
              activeDot={{ r: 4, fill: "#f43f5e", stroke: "white", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
