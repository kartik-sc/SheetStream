import Filters from "@/components/Filters";
import RevenueLineChart from "@/components/charts/RevenueLineChart";
import CaseTypePieChart from "@/components/charts/CaseTypePieChart";
import ScoreBarChart from "@/components/charts/ScoreBarChart";
import SignupsAreaChart from "@/components/charts/SignupsAreaChart";
import ScoreRadarChart from "@/components/charts/ScoreRadarChart";

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Analytics</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Deep-dive charts across sessions, scores, and revenue.
        </p>
      </div>

      <Filters />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RevenueLineChart />
        <CaseTypePieChart />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ScoreBarChart />
        <ScoreRadarChart />
      </div>

      <SignupsAreaChart />
    </div>
  );
}
