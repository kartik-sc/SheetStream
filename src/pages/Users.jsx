import Filters from "@/components/Filters";
import DataTable from "@/components/DataTable";

export default function Users() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Users</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Sortable, searchable session records across all sources.
        </p>
      </div>

      <Filters />

      <DataTable />
    </div>
  );
}
