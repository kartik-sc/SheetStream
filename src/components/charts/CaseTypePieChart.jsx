import { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { useDashboard } from "@/context/DashboardContext";
import { applyFilters } from "@/utils/mergeData";

// ── Constants ──────────────────────────────────────────────────────────────

const CASE_TYPES = ["Profitability", "Market Entry", "M&A", "Growth Strategy"];

const COLORS = {
  "Profitability":   "#6366f1",
  "Market Entry":    "#8b5cf6",
  "M&A":             "#a78bfa",
  "Growth Strategy": "#c4b5fd",
};

// ── Custom label rendered inside each segment ──────────────────────────────

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.05) return null; // skip tiny slices
  const RAD = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RAD);
  const y = cy + r * Math.sin(-midAngle * RAD);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ── Custom tooltip ─────────────────────────────────────────────────────────

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: data } = payload[0];
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-md text-sm">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ background: COLORS[name] ?? "#888" }}
        />
        <span className="font-medium text-foreground">{name}</span>
      </div>
      <p className="text-muted-foreground">
        Sessions:{" "}
        <span className="font-semibold text-foreground">{value}</span>
      </p>
      <p className="text-muted-foreground">
        Share:{" "}
        <span className="font-semibold text-foreground">
          {`${(data.percent * 100).toFixed(1)}%`}
        </span>
      </p>
    </div>
  );
}

// ── Custom legend ──────────────────────────────────────────────────────────

function ChartLegend({ payload }) {
  return (
    <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: entry.color }}
          />
          {entry.value}
        </div>
      ))}
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="flex h-[300px] flex-col items-center justify-center gap-4">
      <div className="h-44 w-44 animate-pulse rounded-full bg-muted" />
      <div className="flex gap-3">
        {[80, 64, 72, 56].map((w, i) => (
          <div key={i} className="h-3 animate-pulse rounded bg-muted" style={{ width: w }} />
        ))}
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export default function CaseTypePieChart() {
  const { state } = useDashboard();
  const { mergedData, filters, loading } = state;

  const chartData = useMemo(() => {
    const filtered = applyFilters(mergedData, filters);

    const counts = Object.fromEntries(CASE_TYPES.map((t) => [t, 0]));
    for (const row of filtered) {
      const type = row.case_type;
      if (type && counts[type] !== undefined) {
        counts[type]++;
      }
    }

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return CASE_TYPES
      .map((name) => ({ name, value: counts[name], percent: total ? counts[name] / total : 0 }))
      .filter((d) => d.value > 0);
  }, [mergedData, filters]);

  return (
    <div className="card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        Case Type Distribution
      </h3>

      {loading.sessions ? (
        <Skeleton />
      ) : chartData.length === 0 ? (
        <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
          No session data for the selected period.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              outerRadius={110}
              labelLine={false}
              label={<PieLabel />}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[entry.name] ?? "#888"}
                  stroke="white"
                  strokeWidth={2}
                />
              ))}
            </Pie>

            <Tooltip content={<ChartTooltip />} />
            <Legend content={<ChartLegend />} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
