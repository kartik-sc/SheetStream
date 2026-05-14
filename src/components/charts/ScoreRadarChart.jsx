import { useMemo } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  Legend,
} from "recharts";
import { useDashboard } from "@/context/DashboardContext";
import { applyFilters } from "@/utils/mergeData";

// ── Constants ──────────────────────────────────────────────────────────────

const CASE_TYPES = ["Profitability", "Market Entry", "M&A", "Growth Strategy", "Operations"];

const PLANS = [
  { key: "Free",       color: "#a78bfa" },
  { key: "Pro",        color: "#6366f1" },
  { key: "Enterprise", color: "#4f46e5" },
];

// Deterministically assign a plan tier from a user_id string (e.g. "U1003").
// Extracts the numeric suffix and maps it to one of three plan tiers.
function planFromUserId(userId) {
  if (!userId) return "Free";
  const n = parseInt(userId.replace(/\D/g, ""), 10) || 0;
  return PLANS[n % 3].key;
}

// ── Custom tooltip ─────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-md text-sm min-w-[170px]">
      <p className="font-medium text-foreground mb-1.5">{label}</p>
      <div className="space-y-1">
        {payload.map((p) => (
          <div key={p.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
              {p.name}
            </span>
            <span className="font-semibold text-foreground">
              {p.value != null ? p.value.toFixed(1) : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Custom legend ──────────────────────────────────────────────────────────

function ChartLegend() {
  return (
    <div className="mt-2 flex justify-center gap-5 text-xs text-muted-foreground">
      {PLANS.map(({ key, color }) => (
        <div key={key} className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
          {key}
        </div>
      ))}
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="flex h-[300px] items-center justify-center">
      <div className="h-52 w-52 animate-pulse rounded-full bg-muted" />
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ScoreRadarChart() {
  const { state } = useDashboard();
  const { mergedData, filters, loading } = state;

  const chartData = useMemo(() => {
    const filtered = applyFilters(mergedData, filters);

    // Accumulate sum + count per (caseType, plan).
    const acc = {};
    for (const caseType of CASE_TYPES) {
      acc[caseType] = {};
      for (const { key } of PLANS) {
        acc[caseType][key] = { sum: 0, count: 0 };
      }
    }

    for (const row of filtered) {
      const caseType = row.case_type;
      const score    = parseFloat(row.score);
      const plan     = row.plan ?? planFromUserId(row.user_id);
      if (caseType && acc[caseType] && acc[caseType][plan] && !isNaN(score)) {
        acc[caseType][plan].sum   += score;
        acc[caseType][plan].count += 1;
      }
    }

    return CASE_TYPES.map((caseType) => {
      const entry = {
        // Shorten labels so the polar axis isn't cramped.
        subject: caseType === "Growth Strategy" ? "Growth"
               : caseType === "Market Entry"    ? "Mkt Entry"
               : caseType,
      };
      for (const { key } of PLANS) {
        const { sum, count } = acc[caseType][key];
        entry[key] = count > 0 ? sum / count : null;
      }
      return entry;
    });
  }, [mergedData, filters]);

  const hasData = chartData.some((d) => PLANS.some(({ key }) => d[key] != null));

  return (
    <div className="card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Score by Plan Tier</h3>

      {loading.sessions ? (
        <Skeleton />
      ) : !hasData ? (
        <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
          No session data for the selected period.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={chartData} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
            <PolarGrid stroke="hsl(220, 14%, 89%)" />

            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 11, fill: "hsl(220, 10%, 52%)" }}
            />

            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 9, fill: "hsl(220, 10%, 52%)" }}
              tickCount={4}
              axisLine={false}
            />

            <Tooltip content={<ChartTooltip />} />
            <Legend content={<ChartLegend />} />

            {PLANS.map(({ key, color }) => (
              <Radar
                key={key}
                name={key}
                dataKey={key}
                stroke={color}
                fill={color}
                fillOpacity={0.12}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
