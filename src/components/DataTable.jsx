import { useMemo, useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { applyFilters } from "@/utils/mergeData";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ── Column definitions ──────────────────────────────────────────────────────

const COLUMNS = [
  {
    accessorKey: "date",
    header: "Date",
    enableGlobalFilter: false,
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-muted-foreground">{getValue() ?? "—"}</span>
    ),
  },
  {
    accessorKey: "user_id",
    header: "User ID",
    enableGlobalFilter: true,
    cell: ({ getValue }) => (
      <span className="font-mono text-xs">{getValue() ?? "—"}</span>
    ),
  },
  {
    accessorKey: "case_type",
    header: "Case Type",
    enableGlobalFilter: true,
  },
  {
    accessorKey: "score",
    header: "Score",
    enableGlobalFilter: false,
    cell: ({ getValue }) => {
      const v = parseFloat(getValue());
      if (isNaN(v)) return <span className="text-muted-foreground">—</span>;
      const color = v >= 75 ? "text-indigo-600" : v >= 60 ? "text-violet-500" : "text-rose-500";
      return <span className={`font-semibold ${color}`}>{v.toFixed(1)}</span>;
    },
  },
  {
    accessorKey: "duration_mins",
    header: "Duration",
    enableGlobalFilter: false,
    cell: ({ getValue }) => {
      const v = parseFloat(getValue());
      return isNaN(v)
        ? <span className="text-muted-foreground">—</span>
        : <span>{v.toFixed(0)} min</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    enableGlobalFilter: true,
    cell: ({ getValue }) => {
      const v = getValue();
      if (!v) return <span className="text-muted-foreground">—</span>;
      const normalized = v.toLowerCase();
      const variant = normalized === "completed" ? "green" : normalized === "abandoned" ? "red" : "default";
      return <Badge variant={variant}>{v}</Badge>;
    },
  },
  {
    accessorKey: "source",
    header: "Source",
    enableGlobalFilter: false,
    cell: ({ getValue }) => {
      const v = getValue();
      return v === "sheets"
        ? <Badge variant="indigo">Sheets</Badge>
        : v === "uploaded"
        ? <Badge variant="violet">Uploaded</Badge>
        : <span className="text-muted-foreground">—</span>;
    },
  },
  {
    accessorKey: "duplicate",
    header: "Duplicate",
    enableGlobalFilter: false,
    cell: ({ getValue }) =>
      getValue() ? <Badge variant="amber">Duplicate</Badge> : null,
  },
];

// ── Sort icon ───────────────────────────────────────────────────────────────

function SortIcon({ column }) {
  if (!column.getCanSort()) return null;
  const sorted = column.getIsSorted();
  if (sorted === "asc")  return <ChevronUp  className="ml-1 h-3.5 w-3.5 inline" />;
  if (sorted === "desc") return <ChevronDown className="ml-1 h-3.5 w-3.5 inline" />;
  return <ChevronsUpDown className="ml-1 h-3.5 w-3.5 inline opacity-40" />;
}

// ── Custom global filter function ───────────────────────────────────────────
// Filters across user_id, case_type, status only (columns with enableGlobalFilter: true).

function multiColumnFilter(row, _columnId, filterValue) {
  const q = filterValue.toLowerCase();
  const searchable = ["user_id", "case_type", "status"];
  return searchable.some((key) => {
    const v = row.getValue(key);
    return v != null && String(v).toLowerCase().includes(q);
  });
}
multiColumnFilter.autoRemove = (val) => !val;

// ── Component ───────────────────────────────────────────────────────────────

export default function DataTable() {
  const { state } = useDashboard();
  const { mergedData, filters, loading } = state;

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);

  const data = useMemo(() => applyFilters(mergedData, filters), [mergedData, filters]);

  // Reset to page 1 on filter/search change
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [globalFilter, filters]);

  const table = useReactTable({
    data,
    columns: COLUMNS,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    globalFilterFn: multiColumnFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  });

  const pageCount = table.getPageCount();
  const { pageIndex } = table.getState().pagination;

  return (
    <div className="card p-5 space-y-4">
      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Session Records</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {table.getFilteredRowModel().rows.length.toLocaleString()} rows
          </p>
        </div>
        <input
          type="search"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search by user, case type, status…"
          className="h-8 w-full rounded-md border border-border bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring sm:w-64"
        />
      </div>

      {/* Table */}
      {loading.sessions ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-9 animate-pulse rounded-md bg-muted" style={{ opacity: 1 - i * 0.1 }} />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border">
          <p className="text-sm font-medium text-muted-foreground">No data available.</p>
          <p className="text-xs text-muted-foreground">Adjust filters or upload a file.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    <SortIcon column={header.column} />
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between gap-4 pt-1 text-xs text-muted-foreground">
          <span>
            Page {pageIndex + 1} of {pageCount} &nbsp;·&nbsp;{" "}
            {table.getFilteredRowModel().rows.length.toLocaleString()} total rows
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="flex h-7 w-7 items-center justify-center rounded border border-border bg-card text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="flex h-7 w-7 items-center justify-center rounded border border-border bg-card text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
