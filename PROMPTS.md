# SheetStream – Development Notes / Prompt History

## Initial Setup (self)

- Setup Vite + React dashboard project
- Configure TailwindCSS + shadcn/ui
- Add Recharts and TanStack Table
- Create clean folder structure:
  - components/
  - charts/
  - context/
  - services/
  - pages/

---
## Prompt 1 — Google Sheets Integration
**Context:** Fetching analytics data from Sheets

Create a Google Sheets service in `src/services/googleSheets.js`.

Requirements:
- Fetch data from these sheets:
  - user_sessions
  - revenue_metrics
  - user_profiles
  - user_engagement
- Use Google Sheets API v4
- Use environment variables for:
  - spreadsheet ID
  - API key
- Convert rows into structured JSON objects
- Add loading + error handling
- Export reusable fetch functions

---

## Prompt 2 — Dashboard Context and Reducer
**Context:** Global state management

Create a React Context in `src/context/DashboardContext.jsx`.

State should include:
```
js
{
  userSessions: [],
  revenueMetrics: [],
  userProfiles: [],
  userEngagement: [],
  uploadedSessions: [],
  mergedData: [],

  filters: {
    dateRange: { start: null, end: null },
    experienceLevel: 'all',
    targetCompany: 'all',
    subscriptionStatus: 'all',
    country: 'all',
    source: 'all'
  },

  loading: {
    sessions: false,
    revenue: false,
    profiles: false,
    engagement: false
  },

  error: {
    sessions: null,
    revenue: null,
    profiles: null,
    engagement: null
  }
}

Reducer actions:

SET_USER_SESSIONS
SET_REVENUE_METRICS
SET_USER_PROFILES
SET_USER_ENGAGEMENT
SET_UPLOADED_SESSIONS
SET_MERGED_DATA
SET_FILTER
SET_LOADING
SET_ERROR
RESET_FILTERS

Export:

DashboardProvider
useDashboard()

Wrap app in provider from App.jsx.

```
## Prompt 3 — CSV Upload Support

Context: Uploading offline session data

Create a FileUpload component.

Requirements:

Support CSV and XLSX uploads
Parse uploaded rows
Validate required columns
Store uploaded data in context
Add source field:
Sheets
Uploaded
Show upload success/error states
Use shadcn Button and Card components


## Prompt 4 — Data Merge Utility

Context: Combining sheets + uploaded data

Create a merge utility for analytics data.

Requirements:

Merge user_sessions with uploaded offline_sessions
Preserve original rows
Add duplicate detection
Add computed duplicate boolean field
Keep merge logic reusable and isolated

## Prompt 5 — KPI Cards

Context: Dashboard summary metrics

Create reusable KPI cards.

Metrics:

Total Revenue
Active Users
Avg Score
Conversion Rate
Total Sessions
New Signups

Requirements:

Responsive grid layout
Currency formatting
Trend indicators
Loading skeletons
Shared card styling

## Prompt 6 — Filters Component

Context: Dashboard filtering

Create a Filters component.

Requirements:

Date range filter
Country filter
Subscription status filter
Experience level filter
Source filter
Update context filters dynamically
Responsive mobile layout
Use shadcn Select and DatePicker components


## Prompt 7 — Revenue Line Chart

Context: Monthly revenue trend visualization

Create a RevenueLineChart component in src/components/charts/RevenueLineChart.jsx.

Requirements:

Use Recharts LineChart
Data source: revenueMetrics
Filter by selected date range
X axis: month
Y axis: revenue_usd
Smooth curve
Tooltip formatting
ResponsiveContainer
Wrap inside Card component
### Pie Chart

Context: Case type distribution visualization

Create a CaseTypePieChart component.

Requirements:

Use Recharts PieChart
Aggregate case_type counts from mergedData
Show:
Profitability
Market Entry
M&A
Growth
Add percentage labels
Add tooltip + legend
Use indigo/violet palette

### Bar Chart

Context: Average score by case type

Create a ScoreBarChart component.

Requirements:

Use Recharts BarChart
Aggregate mean(score) by case_type
Y-axis range: 0–100
Add target reference line at 70
Tooltip formatting
Responsive layout

### Area Chart

Context: Signups vs churn over time

Create a SignupsAreaChart component.

Requirements:

Use Recharts AreaChart
Data source: revenueMetrics
Compare:
new_signups
churned_users
Shared X-axis by month
Semi-transparent overlapping areas
Tooltip showing both values
ResponsiveContainer

--
### Radar Chart
Context: Performance comparison across subscription tiers

Create a ScoreRadarChart component.

Requirements:

Join mergedData with userProfiles on user_id
Compute average score grouped by:
Free
Pro
Enterprise
Axis: case_type
Use Recharts RadarChart
Add legend and tooltip
Responsive layout
Prompt 13 — Data Table

Context: Searchable analytics table

Create a DataTable component using TanStack Table v8.

Requirements:

Sorting
Pagination
Global search
Empty states
Responsive overflow handling

Columns:

date
user_id
case_type
score
duration_mins
status
source
duplicate
subscription_plan
country

Render:

source as Badge
duplicate as warning Badge


## Prompt 8 — Dashboard Layout

Context: Final dashboard assembly

Create the main Dashboard page.

Layout:

Header
Filters
KPI grid
Charts grid
Data table

Requirements:

max-w-7xl centered layout
responsive grid
consistent spacing
loading skeletons
error alerts
Prompt 15 — Responsive + Polish Pass

Context: Final UI cleanup

Review and improve dashboard responsiveness.

Requirements:

Mobile-friendly charts
Responsive KPI grid
Vertical filter stacking on mobile
Skeleton loaders
Table horizontal scrolling
Consistent spacing + border radius
Indigo/violet color palette
Rose for negative indicators

## Prompt 9 — README
Write a concise professional README.md.

Sections:

Overview
Tech Stack
Setup Instructions
Architecture
Assumptions
Limitations
Future Improvements
