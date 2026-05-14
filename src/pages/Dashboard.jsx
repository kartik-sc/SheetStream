import Filters from "@/components/Filters";
import KPIGrid from "@/components/KPIGrid";
import DataTable from "@/components/DataTable";
import FileUpload from "@/components/FileUpload";
import RevenueLineChart from "@/components/charts/RevenueLineChart";
import CaseTypePieChart from "@/components/charts/CaseTypePieChart";
import ScoreBarChart from "@/components/charts/ScoreBarChart";
import SignupsAreaChart from "@/components/charts/SignupsAreaChart";
import ScoreRadarChart from "@/components/charts/ScoreRadarChart";
import { Separator } from "@/components/ui/separator";
import { Alert } from "@/components/ui/alert";
import { useDashboard, ACTIONS } from "@/context/DashboardContext";
import { mergeSessionData } from "@/utils/mergeData";
import { useState } from "react";

// ── Page skeleton ───────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card h-24 bg-muted/60 rounded-xl" />
        ))}
      </div>
      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card h-72 bg-muted/60 rounded-xl" />
        <div className="card h-72 bg-muted/60 rounded-xl" />
      </div>
      {/* Charts row 2 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card h-72 bg-muted/60 rounded-xl" />
        <div className="card h-72 bg-muted/60 rounded-xl" />
      </div>
      {/* Full-width chart */}
      <div className="card h-72 bg-muted/60 rounded-xl" />
      {/* Table */}
      <div className="card h-64 bg-muted/60 rounded-xl" />
    </div>
  );
}

// ── Section heading ─────────────────────────────────────────────────────────

function SectionHeading({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

// ── Dashboard ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { state, dispatch } = useDashboard();
  const { loading, error } = state;
  const [schemaWarnings, setSchemaWarnings] = useState([]);

  const anyLoading = loading.sessions || loading.revenue;
  const sessionsError = error.sessions;
  const revenueError  = error.revenue;

  function handleUpload(rows) {
    dispatch({ type: ACTIONS.SET_UPLOADED_SESSIONS, payload: rows });
    const { mergedData, schemaWarnings: warnings } = mergeSessionData(state.userSessions, rows);
    dispatch({ type: ACTIONS.SET_MERGED_DATA, payload: mergedData });
    setSchemaWarnings(warnings);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            sheetstream
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Live sessions, revenue, and score insights.
          </p>
        </div>
        <div className="shrink-0">
          <FileUpload onData={handleUpload} schemaWarnings={schemaWarnings} compact />
        </div>
      </div>

      <Separator />

      {/* ── Error alerts ────────────────────────────────────────────────── */}
      {sessionsError && (
        <Alert variant="destructive" title="Session data failed to load">
          {sessionsError}
        </Alert>
      )}
      {revenueError && (
        <Alert variant="destructive" title="Revenue data failed to load">
          {revenueError}
        </Alert>
      )}

      {/* ── Filters ────────────────────────────────────────────────────── */}
      <Filters />

      {/* ── Full-page skeleton on first load ───────────────────────────── */}
      {anyLoading && !state.mergedData.length ? (
        <PageSkeleton />
      ) : (
        <>
          {/* KPIs */}
          <section className="space-y-3">
            <SectionHeading
              title="Key Metrics"
              subtitle="Computed from merged sessions and revenue data."
            />
            <KPIGrid />
          </section>

          {/* Charts row 1: Revenue + Signups */}
          <section className="space-y-3">
            <SectionHeading
              title="Revenue & Growth"
              subtitle="Monthly revenue trend and signup vs churn."
            />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <RevenueLineChart />
              <SignupsAreaChart />
            </div>
          </section>

          {/* Charts row 2: Score bar + Pie */}
          <section className="space-y-3">
            <SectionHeading
              title="Score & Case Distribution"
              subtitle="Average scores by type and case type breakdown."
            />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ScoreBarChart />
              <CaseTypePieChart />
            </div>
          </section>

          {/* Charts row 3: Radar full width */}
          <section className="space-y-3">
            <SectionHeading
              title="Score by Plan Tier"
              subtitle="Radar comparison of Free, Pro, and Enterprise plan performance."
            />
            <ScoreRadarChart />
          </section>

          {/* Data Table */}
          <section className="space-y-3">
            <SectionHeading
              title="Session Data"
              subtitle="All merged session records — sortable, searchable, paginated."
            />
            <DataTable />
          </section>
        </>
      )}
    </div>
  );
}
