import KPIGrid from "@/components/KPIGrid";
import Filters from "@/components/Filters";
import RevenueLineChart from "@/components/charts/RevenueLineChart";
import CaseTypePieChart from "@/components/charts/CaseTypePieChart";
import ScoreBarChart from "@/components/charts/ScoreBarChart";
import SignupsAreaChart from "@/components/charts/SignupsAreaChart";
import ScoreRadarChart from "@/components/charts/ScoreRadarChart";

function SectionHeading({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Overview</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Analytics across all sessions and revenue sources.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-[hsl(var(--green))]" />
          Live data
        </div>
      </div>

      {/* Filters */}
      <Filters />

      {/* KPIs */}
      <section className="space-y-3">
        <SectionHeading
          title="Key Metrics"
          subtitle="Computed from merged sessions and revenue data."
        />
        <KPIGrid />
      </section>

      {/* Charts row 1 */}
      <section className="space-y-3">
        <SectionHeading
          title="Revenue & Distribution"
          subtitle="Monthly revenue trend and case type breakdown."
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <RevenueLineChart />
          <CaseTypePieChart />
        </div>
      </section>

      {/* Charts row 2 */}
      <section className="space-y-3">
        <SectionHeading
          title="Score Performance"
          subtitle="Average case score by type against the 70-point target."
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ScoreBarChart />
          <ScoreRadarChart />
        </div>
      </section>

      {/* Charts row 3 */}
      <section className="space-y-3">
        <SectionHeading
          title="Growth"
          subtitle="New signups versus churned users over time."
        />
        <SignupsAreaChart />
      </section>
    </div>
  );
}
