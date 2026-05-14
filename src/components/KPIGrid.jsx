import { useMemo } from "react";
import {
  DollarSign,
  Users,
  ArrowUpRight,
  LayoutList,
  Star,
  UserPlus,
} from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import KPICard from "./KPICard";

// ── Helpers ────────────────────────────────────────────────────────────────

function sum(rows, key) {
  return rows.reduce((acc, r) => acc + (parseFloat(r[key]) || 0), 0);
}

function mean(rows, key) {
  const valid = rows.filter((r) => r[key] != null && r[key] !== "");
  if (!valid.length) return null;
  return sum(valid, key) / valid.length;
}

function distinctCount(rows, key) {
  return new Set(rows.map((r) => r[key]).filter(Boolean)).size;
}

function formatCurrency(n) {
  if (n == null) return "$—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatNumber(n) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US").format(n);
}

/**
 * Shift a date range backward by its own length to get the "prior period."
 * Returns ISO date strings or null.
 */
function priorPeriod(start, end) {
  if (!start || !end) return { start: null, end: null };
  const s = new Date(start);
  const e = new Date(end);
  const ms = e - s;
  return {
    start: new Date(s - ms - 86_400_000).toISOString().slice(0, 10),
    end:   new Date(s - 86_400_000).toISOString().slice(0, 10),
  };
}

function filterByDate(rows, start, end) {
  return rows.filter((r) => {
    if (start && r.date && r.date < start) return false;
    if (end   && r.date && r.date > end)   return false;
    return true;
  });
}

function pctDelta(current, prev) {
  if (!prev || prev === 0) return null;
  return ((current - prev) / Math.abs(prev)) * 100;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function KPIGrid() {
  const { state } = useDashboard();
  const { mergedData, revenueMetrics, filters, loading } = state;

  const isLoading = loading.sessions || loading.revenue;

  const { dateRange } = filters;
  const prior = useMemo(
    () => priorPeriod(dateRange?.start, dateRange?.end),
    [dateRange]
  );

  const prevMerged  = useMemo(() => filterByDate(mergedData,  prior.start, prior.end), [mergedData,  prior]);
  const prevRevenue = useMemo(() => filterByDate(revenueMetrics, prior.start, prior.end), [revenueMetrics, prior]);

  const kpis = useMemo(() => {
    // 1. Total Revenue
    const rev     = sum(revenueMetrics, "revenue_usd");
    const prevRev = sum(prevRevenue,    "revenue_usd");

    // 2. Active Users
    const users     = distinctCount(mergedData, "user_id");
    const prevUsers = distinctCount(prevMerged, "user_id");

    // 3. Conversion Rate
    const signups  = sum(revenueMetrics, "new_signups");
    const churned  = sum(revenueMetrics, "churned");
    const denom    = signups + churned;
    const conv     = denom ? (signups / denom) * 100 : null;

    const pSignups = sum(prevRevenue, "new_signups");
    const pChurned = sum(prevRevenue, "churned");
    const pDenom   = pSignups + pChurned;
    const prevConv = pDenom ? (pSignups / pDenom) * 100 : null;

    // 4. Total Sessions
    const sessions     = mergedData.length;
    const prevSessions = prevMerged.length;

    // 5. Avg Case Score
    const avgScore     = mean(mergedData, "score");
    const prevAvgScore = mean(prevMerged, "score");
    const scoreColor =
      avgScore == null ? "default"
      : avgScore > 70  ? "green"
      : avgScore >= 50 ? "amber"
      :                  "red";

    // 6. New Signups
    const newSignups     = sum(revenueMetrics, "new_signups");
    const prevNewSignups = sum(prevRevenue,    "new_signups");

    return [
      {
        title: "Total Revenue",
        value: formatCurrency(rev),
        delta: pctDelta(rev, prevRev),
        icon: DollarSign,
        color: "default",
      },
      {
        title: "Active Users",
        value: formatNumber(users),
        delta: pctDelta(users, prevUsers),
        icon: Users,
        color: "default",
      },
      {
        title: "Conversion Rate",
        value: conv != null ? `${conv.toFixed(1)}%` : "—",
        delta: pctDelta(conv, prevConv),
        icon: ArrowUpRight,
        color: "default",
      },
      {
        title: "Total Sessions",
        value: formatNumber(sessions),
        delta: pctDelta(sessions, prevSessions),
        icon: LayoutList,
        color: "default",
      },
      {
        title: "Avg Case Score",
        value: avgScore != null ? avgScore.toFixed(1) : "—",
        delta: pctDelta(avgScore, prevAvgScore),
        icon: Star,
        color: scoreColor,
      },
      {
        title: "New Signups",
        value: formatNumber(newSignups),
        delta: pctDelta(newSignups, prevNewSignups),
        icon: UserPlus,
        color: "default",
      },
    ];
  }, [mergedData, revenueMetrics, prevMerged, prevRevenue]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {kpis.map((kpi) => (
        <KPICard key={kpi.title} {...kpi} loading={isLoading} />
      ))}
    </div>
  );
}
