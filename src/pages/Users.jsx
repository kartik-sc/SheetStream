import { Users as UsersIcon } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { applyFilters } from "@/utils/mergeData";
import Filters from "@/components/Filters";

export default function Users() {
  const { state } = useDashboard();
  const filtered = applyFilters(state.mergedData, state.filters);
  const uniqueUsers = [...new Map(filtered.map((r) => [r.user_id, r])).values()];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Users</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {uniqueUsers.length} unique users across filtered sessions.
        </p>
      </div>

      <Filters />

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["User ID", "Sessions", "Avg Score", "Source"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {uniqueUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No data for the selected filters.
                </td>
              </tr>
            ) : (
              uniqueUsers.map((user) => {
                const userRows = filtered.filter((r) => r.user_id === user.user_id);
                const scores   = userRows.map((r) => parseFloat(r.score)).filter((n) => !isNaN(n));
                const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "—";
                return (
                  <tr key={user.user_id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs text-foreground">{user.user_id}</td>
                    <td className="px-4 py-2.5 text-foreground">{userRows.length}</td>
                    <td className="px-4 py-2.5 text-foreground">{avgScore}</td>
                    <td className="px-4 py-2.5">
                      <span className={[
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        user.source === "uploaded"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800",
                      ].join(" ")}>
                        {user.source ?? "sheets"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
