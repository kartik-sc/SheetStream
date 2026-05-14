# sheetstream

A live analytics dashboard that merges Google Sheets data with uploaded CSV/Excel files and visualises the combined dataset through interactive charts, KPI cards, and a searchable data table.

Live Demo:https://sheet-stream.vercel.app/

---

## Overview

sheetstream connects to a Google Sheets spreadsheet via the Sheets API v4 and fetches four tabs on startup: `user_sessions`, `revenue_metrics`, `user_profiles`, and `user_engagement`. It simultaneously pre-loads an offline CSV (`offline_sessions.csv`) and merges both sources into a single unified dataset.

**What it visualises:**
- Revenue trend over time (line chart)
- Signup vs churn over time (area chart)
- Average case score by type against a 70-point target (bar chart)
- Case type distribution (pie chart)
- Score breakdown by plan tier — Free, Pro, Enterprise (radar chart)
- Six KPI cards: total revenue, active users, conversion rate, total sessions, avg score, new signups
- Full session records table — sortable, searchable, paginated

All charts and KPIs respond to a shared filter bar (date range, case type, status, source) and a global text search in the topbar.

---

## Tech Stack

- **React 19** — UI library; `useReducer` + Context for global state
- **Vite 8** — build tool and dev server
- **Tailwind CSS 3** — utility-first styling with CSS custom properties for the design token system
- **Recharts** — composable chart library (LineChart, AreaChart, BarChart, PieChart, RadarChart)
- **TanStack Table v8** — headless table with sorting, filtering, and pagination
- **React Router v6** — SPA routing with a shared `AppShell` layout route
- **SheetJS (xlsx)** — client-side parsing of uploaded `.xls` / `.xlsx` files
- **Lucide React** — icon set
- **clsx + tailwind-merge** — conditional class composition

---

## Setup Instructions

**1. Clone the repo**
```bash
git clone <repo-url>
cd assessment
```

**2. Configure environment variables**

Create a `.env` file in the project root:
```
VITE_GOOGLE_API_KEY=your_google_api_key
VITE_SHEET_ID=your_google_spreadsheet_id
```

The Google Sheets API key must have the Sheets API enabled. The spreadsheet must be publicly readable (or the API key scoped appropriately).

**3. Install dependencies**
```bash
npm install --legacy-peer-deps
```

**4. Run locally**
```bash
npm run dev
```

**5. Build for production**
```bash
npm run build
```
https://sheet-stream.vercel.app/

Deploy the `dist/` output to any static host. The `vercel.json` rewrite rule handles SPA routing on Vercel.

---

## Architecture

### Folder structure

```
src/
  context/
    DashboardContext.jsx   # useReducer store — single source of truth for all data + filters
  hooks/
    useDataLoader.js       # fetches all 4 sheet tabs + offline CSV in parallel on mount
    useFileUpload.js       # wraps FileReader; parses CSV and Excel files
    useGoogleSheets.js     # low-level hook: fetch one sheet range → parsed row objects
  utils/
    dataTransform.js       # parseSheetResponse(): Sheets API JSON → array of keyed objects
    mergeData.js           # mergeSessionData(): tag + deduplicate; applyFilters(): filter slice
    cn.js                  # clsx + tailwind-merge helper
  components/
    AppShell.jsx           # sidebar nav + topbar (search, notifications, user menu); mounts useDataLoader
    Filters.jsx            # date range, case type, status, source — dispatches SET_FILTER
    KPIGrid.jsx / KPICard.jsx
    DataTable.jsx          # TanStack Table; consumes applyFilters(mergedData, filters)
    FileUpload.jsx         # drag-drop zone + compact button variant; triggers re-merge on upload
    charts/                # one file per chart; each reads from context, calls applyFilters
    ui/                    # inline primitives: badge, table, alert, input, select, toggle-group, separator
  pages/
    Dashboard.jsx          # main layout: header, filters, KPIs, charts grid, DataTable
    Analytics.jsx          # charts-only view
    Users.jsx              # DataTable-only view
    Uploads.jsx            # FileUpload with merge status
    Settings.jsx           # read-only env var display
```

### Data flow

```
Google Sheets API v4
        │
        ▼
useDataLoader (on AppShell mount)
        │  parallel fetch: user_sessions, revenue_metrics, user_profiles, user_engagement
        │  + fetch /data/offline_sessions.csv
        ▼
parseSheetResponse / parseCsv
        │  normalise field names (plandate→plan, churned_users→churned)
        ▼
mergeSessionData(sheetsRows, csvRows)
        │  tag source, detect duplicates by (user_id, date) pair
        ▼
DashboardContext  ← dispatch SET_MERGED_DATA, SET_REVENUE_METRICS, …
        │
        ▼
applyFilters(mergedData, filters)   ← called inside every chart + DataTable via useMemo
        │
        ▼
Recharts / TanStack Table
```

### Merge logic

`mergeSessionData` in `src/utils/mergeData.js`:
1. Tags every row with `source: "sheets"` or `source: "uploaded"`.
2. Builds a frequency map keyed on `user_id__date`. Any key with count > 1 marks both rows as `duplicate: true`.
3. Returns `{ mergedData, schemaWarnings, duplicateCount }`. `schemaWarnings` lists columns present in the upload but absent from the sheets data — surfaced in the FileUpload UI.

`applyFilters` is a pure function (no React dependency) that slices `mergedData` by date range, case type, status, source, and a global text search string. Every consumer calls it inside `useMemo` so filtering never causes unnecessary re-renders.

---

## Assumptions Made

- **Sheet tab names are fixed**: `user_sessions`, `revenue_metrics`, `user_profiles`, `user_engagement`. The loader hard-codes these.
- **`user_sessions` has a `plandate` column containing plan tier** (`Free`/`Pro`/`Enterprise`). The loader renames it to `plan` at the boundary. If the column is missing, the radar chart falls back to `planFromUserId()` — a deterministic modulo-3 assignment based on the numeric suffix of the user ID.
- **`revenue_metrics` has a `churned_users` column**, renamed to `churned` on load to match chart expectations.
- **The offline CSV has no header row.** Headers are assigned in order: `date, user_id, case_type, score, duration_mins, status, name`.
- **Deduplication key is `(user_id, date)`**, not a primary key. Two sessions for the same user on the same day are flagged as duplicates even if the case type differs.
- **Date filter compares ISO strings lexicographically** (`"2026-01" < "2026-03"`) — this works correctly as long as all date/month values follow ISO format.
- **No authentication layer.** The Google Sheets API key is exposed client-side. This is acceptable for a read-only public spreadsheet but not for production use with sensitive data.
- **Plan tier deltas in KPI cards default to "No prior period"** when no date range is set, because the prior-period window is derived from the selected range length.

---

## Known Limitations and What I'd Add Next

**Current limitations:**
- The bundle is a single unspilt chunk (~1.1 MB gzipped: ~345 KB). Recharts and SheetJS together account for most of it. Code-splitting by route would cut initial load significantly.
- The Sheets API key is in the client bundle. A thin backend proxy or a service account with server-side rendering would be needed for production.
- Filters don't persist across page reloads — state is in-memory only.
- The `user_engagement` and `user_profiles` sheets are fetched but not yet surfaced in any chart.
- Mobile layout works for the content area, but the sidebar is always visible — a slide-in drawer for small screens is missing.
- No real-time refresh; data is fetched once on mount.

**What I'd add next:**
- Route-based code splitting (`React.lazy`) to reduce initial bundle
- A sidebar drawer / hamburger menu for mobile viewports
- Engagement and profile data visualised (e.g., session-length distribution, country map)
- Filter state persisted to URL query params so links are shareable
- A backend proxy endpoint to keep the API key out of the client
- Polling or WebSocket refresh for live data
- Export button on the DataTable (CSV download from filtered rows)
- Unit tests for `mergeSessionData` and `applyFilters` — both are pure functions and trivially testable

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
