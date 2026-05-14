import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";
import { useDashboard } from "@/context/DashboardContext";
import { applyFilters } from "@/utils/mergeData";

// ── Constants ──────────────────────────────────────────────────────────────

const CASE_TYPES = ["Profitability", "Market Entry", "M&A", "Growth Strategy", "Operations"];
const BAR_COLOR  = "#6366f1";
const TARGET     = 70;

// ── Custom tooltip ─────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const score = payload[0]?.value;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-md text-sm">
      <p className="font-medium text-foreground mb-1">{label}</p>
      <p className="text-muted-foreground">
        Avg Score:{" "}
        <span className="font-semibold text-foreground">
          {score != null ? score.toFixed(1) : "—"}
        </span>
      </p>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="flex h-[300px] items-end gap-3 px-4 pb-4 pt-6">
      {[65, 80, 55, 90, 72].map((h, i) => (
        <div
          key={i}
          className="flex-1 animate-pulse rounded-t-md bg-muted"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ScoreBarChart() {
  const { state } = useDashboard();
  const { mergedData, filters, loading } = state;

  const chartData = useMemo(() => {
    const filtered = applyFilters(mergedData, filters);

    const totals = Object.fromEntries(CASE_TYPES.map((t) => [t, { sum: 0, count: 0 }]));
    for (const row of filtered) {
      const type  = row.case_type;
      const score = parseFloat(row.score);
      if (type && totals[type] && !isNaN(score)) {
        totals[type].sum   += score;
        totals[type].count += 1;
      }
    }

    return CASE_TYPES
      .map((name) => {
        const { sum, count } = totals[name];
        return { name, avg: count > 0 ? sum / count : null };
      })
      .filter((d) => d.avg !== null);
  }, [mergedData, filters]);

  // Short label for cramped X axis
  const tickLabel = (v) =>
    v === "Growth Strategy" ? "Growth" : v === "Market Entry" ? "Mkt Entry" : v;

  return (
    <div className="card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        Avg Score by Case Type
      </h3>

      {loading.sessions ? (
        <Skeleton />
      ) : chartData.length === 0 ? (
        <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
          No session data for the selected period.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 8 }} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 89%)" vertical={false} />

            <XAxis
              dataKey="name"
              tickFormatter={tickLabel}
              tick={{ fontSize: 11, fill: "hsl(220, 10%, 52%)" }}
              axisLine={false}
              tickLine={false}
              dy={6}
            />

            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "hsl(220, 10%, 52%)" }}
              axisLine={false}
              tickLine={false}
              width={32}
            />

            <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(220, 14%, 93%)", radius: 4 }} />

            {/* Target reference line */}
            <ReferenceLine
              y={TARGET}
              stroke="#6366f1"
              strokeDasharray="4 3"
              strokeWidth={1.5}
              label={{
                value: "Target",
                position: "insideTopRight",
                fill: "#6366f1",
                fontSize: 10,
                fontWeight: 600,
                dy: -4,
              }}
            />

            <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={BAR_COLOR} fillOpacity={0.9} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
