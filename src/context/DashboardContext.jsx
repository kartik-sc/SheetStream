import { createContext, useContext, useReducer, useMemo } from "react";

// ─── Initial State ────────────────────────────────────────────────────────────

const initialFilters = {
  dateRange: { start: null, end: null },
  experienceLevel: "all",
  targetCompany: "all",
  subscriptionStatus: "all",
  country: "all",
  source: "all",
};

const initialState = {
  // Raw rows fetched from each Google Sheet tab
  userSessions: [],
  revenueMetrics: [],
  userProfiles: [],
  userEngagement: [],    // optional sheet; may remain empty

  // Rows parsed from data/offline_sessions.csv via file upload
  uploadedSessions: [],

  // Final dataset produced by the merge/transform step; fed directly to charts
  mergedData: [],

  // Active filter selections; components read these to slice mergedData
  filters: initialFilters,

  // Per-source loading flags; used to show skeleton / spinner states
  loading: {
    sessions: false,
    revenue: false,
    profiles: false,
    engagement: false,
  },

  // Per-source error state; null means no error for that source
  error: {
    sessions: null,
    revenue: null,
    profiles: null,
    engagement: null,
  },
};

// ─── Action Types ─────────────────────────────────────────────────────────────

export const ACTIONS = {
  SET_USER_SESSIONS:    "SET_USER_SESSIONS",
  SET_REVENUE_METRICS:  "SET_REVENUE_METRICS",
  SET_USER_PROFILES:    "SET_USER_PROFILES",
  SET_USER_ENGAGEMENT:  "SET_USER_ENGAGEMENT",
  SET_UPLOADED_SESSIONS:"SET_UPLOADED_SESSIONS",
  SET_MERGED_DATA:      "SET_MERGED_DATA",
  SET_FILTER:           "SET_FILTER",
  SET_LOADING:          "SET_LOADING",
  SET_ERROR:            "SET_ERROR",
  RESET_FILTERS:        "RESET_FILTERS",
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function dashboardReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_USER_SESSIONS:
      return { ...state, userSessions: action.payload };

    case ACTIONS.SET_REVENUE_METRICS:
      return { ...state, revenueMetrics: action.payload };

    case ACTIONS.SET_USER_PROFILES:
      return { ...state, userProfiles: action.payload };

    case ACTIONS.SET_USER_ENGAGEMENT:
      return { ...state, userEngagement: action.payload };

    case ACTIONS.SET_UPLOADED_SESSIONS:
      return { ...state, uploadedSessions: action.payload };

    case ACTIONS.SET_MERGED_DATA:
      return { ...state, mergedData: action.payload };

    // SET_FILTER: merges a single { key, value } pair into filters so callers
    // don't have to spread the whole object themselves.
    case ACTIONS.SET_FILTER:
      return {
        ...state,
        filters: { ...state.filters, [action.payload.key]: action.payload.value },
      };

    // SET_LOADING: merges a { key, value } pair into the loading map.
    // Dispatch: { type: SET_LOADING, payload: { key: "sessions", value: true } }
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value },
      };

    // SET_ERROR: merges a { key, value } pair into the error map.
    // Dispatch: { type: SET_ERROR, payload: { key: "profiles", value: err } }
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: { ...state.error, [action.payload.key]: action.payload.value },
      };

    case ACTIONS.RESET_FILTERS:
      return { ...state, filters: initialFilters };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const DashboardContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function DashboardProvider({ children }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  // Memoize the context value so consumers only re-render when state or
  // dispatch actually changes — dispatch is stable across renders.
  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return ctx;
}
