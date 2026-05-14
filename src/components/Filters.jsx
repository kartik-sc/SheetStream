import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { useDashboard, ACTIONS } from "@/context/DashboardContext";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ToggleGroup } from "@/components/ui/toggle-group";

const CASE_TYPES = [
  { label: "All Types",     value: "all"          },
  { label: "Profitability", value: "Profitability" },
  { label: "Market Entry",  value: "Market Entry"  },
  { label: "M&A",          value: "M&A"           },
  { label: "Growth",        value: "Growth Strategy"},
  { label: "Operations",    value: "Operations"    },
];

const STATUSES = [
  { label: "All Statuses", value: "all"       },
  { label: "Completed",    value: "completed" },
  { label: "Abandoned",    value: "abandoned" },
];

const SOURCES = [
  { label: "All",      value: "all"      },
  { label: "Sheets",   value: "sheets"   },
  { label: "Uploaded", value: "uploaded" },
];

export default function Filters() {
  const { state, dispatch } = useDashboard();
  const { filters } = state;

  function setFilter(key, value) {
    dispatch({ type: ACTIONS.SET_FILTER, payload: { key, value } });
  }

  function setDateRange(field, value) {
    dispatch({
      type: ACTIONS.SET_FILTER,
      payload: {
        key: "dateRange",
        value: { ...filters.dateRange, [field]: value || null },
      },
    });
  }

  function resetFilters() {
    dispatch({ type: ACTIONS.RESET_FILTERS });
  }

  const isFiltered =
    filters.dateRange.start ||
    filters.dateRange.end ||
    filters.caseType !== "all" ||
    filters.status !== "all" ||
    filters.source !== "all";

  return (
    <div className="card px-4 py-3">
      <div className="flex flex-wrap items-end gap-3">

        {/* Label */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground self-center mr-1">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
        </div>

        {/* Date range */}
        <fieldset className="flex flex-col gap-1 min-w-0">
          <legend className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Date Range
          </legend>
          <div className="flex items-center gap-1.5">
            <Input
              type="date"
              className="w-36"
              value={filters.dateRange.start ?? ""}
              max={filters.dateRange.end ?? undefined}
              onChange={(e) => setDateRange("start", e.target.value)}
            />
            <span className="text-xs text-muted-foreground">→</span>
            <Input
              type="date"
              className="w-36"
              value={filters.dateRange.end ?? ""}
              min={filters.dateRange.start ?? undefined}
              onChange={(e) => setDateRange("end", e.target.value)}
            />
          </div>
        </fieldset>

        {/* Case Type */}
        <fieldset className="flex flex-col gap-1 min-w-[140px]">
          <legend className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Case Type
          </legend>
          <Select
            value={filters.caseType ?? "all"}
            onChange={(e) => setFilter("caseType", e.target.value)}
          >
            {CASE_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </fieldset>

        {/* Status */}
        <fieldset className="flex flex-col gap-1 min-w-[130px]">
          <legend className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Status
          </legend>
          <Select
            value={filters.status ?? "all"}
            onChange={(e) => setFilter("status", e.target.value)}
          >
            {STATUSES.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </fieldset>

        {/* Source toggle */}
        <fieldset className="flex flex-col gap-1">
          <legend className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Source
          </legend>
          <ToggleGroup
            value={filters.source ?? "all"}
            onChange={(v) => setFilter("source", v)}
            options={SOURCES}
          />
        </fieldset>

        {/* Reset */}
        {isFiltered && (
          <button
            type="button"
            onClick={resetFilters}
            className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors self-end"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
