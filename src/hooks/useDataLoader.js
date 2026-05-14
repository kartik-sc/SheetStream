import { useEffect, useCallback } from "react";
import { useDashboard, ACTIONS } from "@/context/DashboardContext";
import { parseSheetResponse } from "@/utils/dataTransform";
import { mergeSessionData } from "@/utils/mergeData";

const BASE_URL = "https://sheets.googleapis.com/v4/spreadsheets";
const SHEET_ID = import.meta.env.VITE_SHEET_ID;
const API_KEY  = import.meta.env.VITE_GOOGLE_API_KEY;

function sheetUrl(tab) {
  return `${BASE_URL}/${SHEET_ID}/values/${encodeURIComponent(tab)}?key=${API_KEY}`;
}

// Normalize user_sessions rows: "plandate" column → "plan"
function normalizeSessions(rows) {
  return rows
    .filter((r) => r.user_id) // drop the stray empty first row the sheet has
    .map((r) => {
      const out = { ...r };
      if ("plandate" in out && !("plan" in out)) {
        out.plan = out.plandate;
        delete out.plandate;
      }
      return out;
    });
}

// Normalize revenue_metrics rows: "churned_users" → "churned"
function normalizeRevenue(rows) {
  return rows.map((r) => {
    const out = { ...r };
    if ("churned_users" in out && !("churned" in out)) {
      out.churned = out.churned_users;
      delete out.churned_users;
    }
    return out;
  });
}

// Parse the offline CSV from /data/offline_sessions.csv (no header row)
// Columns: date, user_id, case_type, score, duration_mins, status, name
const CSV_HEADERS = ["date", "user_id", "case_type", "score", "duration_mins", "status", "name"];

async function fetchOfflineCsv(signal) {
  const res = await fetch("/data/offline_sessions.csv", { signal });
  if (!res.ok) throw new Error(`CSV fetch failed: ${res.status}`);
  const text = await res.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  return lines.map((line) => {
    const cells = line.split(",");
    return Object.fromEntries(
      CSV_HEADERS.map((h, i) => {
        const v = cells[i]?.trim();
        return [h, v || null];
      })
    );
  });
}

async function fetchSheet(tab, signal) {
  const res = await fetch(sheetUrl(tab), { signal });
  if (!res.ok) throw new Error(`Sheets API error ${res.status} for tab "${tab}"`);
  return parseSheetResponse(await res.json());
}

export function useDataLoader() {
  const { state, dispatch } = useDashboard();

  const load = useCallback(async () => {
    if (!SHEET_ID || !API_KEY) return;

    const controller = new AbortController();
    const { signal } = controller;

    // Mark all sources as loading
    ["sessions", "revenue", "profiles", "engagement"].forEach((k) =>
      dispatch({ type: ACTIONS.SET_LOADING, payload: { key: k, value: true } })
    );

    try {
      // Fetch all sources in parallel
      const [rawSessions, rawRevenue, rawProfiles, rawEngagement, offlineCsv] =
        await Promise.allSettled([
          fetchSheet("user_sessions", signal),
          fetchSheet("revenue_metrics", signal),
          fetchSheet("user_profiles", signal),
          fetchSheet("user_engagement", signal),
          fetchOfflineCsv(signal),
        ]);

      // ── Sessions ─────────────────────────────────────────────────────────
      if (rawSessions.status === "fulfilled") {
        const sessions = normalizeSessions(rawSessions.value);
        dispatch({ type: ACTIONS.SET_USER_SESSIONS, payload: sessions });
        dispatch({ type: ACTIONS.SET_LOADING, payload: { key: "sessions", value: false } });

        // Auto-load offline CSV and merge immediately
        const csvRows =
          offlineCsv.status === "fulfilled" ? offlineCsv.value : state.uploadedSessions;

        if (csvRows.length > 0) {
          dispatch({ type: ACTIONS.SET_UPLOADED_SESSIONS, payload: csvRows });
          const { mergedData } = mergeSessionData(sessions, csvRows);
          dispatch({ type: ACTIONS.SET_MERGED_DATA, payload: mergedData });
        } else {
          // No CSV — merged = sheets only
          const { mergedData } = mergeSessionData(sessions, []);
          dispatch({ type: ACTIONS.SET_MERGED_DATA, payload: mergedData });
        }
      } else {
        dispatch({ type: ACTIONS.SET_ERROR, payload: { key: "sessions", value: rawSessions.reason?.message ?? "Failed to load sessions" } });
        dispatch({ type: ACTIONS.SET_LOADING, payload: { key: "sessions", value: false } });
      }

      // ── Revenue ───────────────────────────────────────────────────────────
      if (rawRevenue.status === "fulfilled") {
        dispatch({ type: ACTIONS.SET_REVENUE_METRICS, payload: normalizeRevenue(rawRevenue.value) });
      } else {
        dispatch({ type: ACTIONS.SET_ERROR, payload: { key: "revenue", value: rawRevenue.reason?.message ?? "Failed to load revenue" } });
      }
      dispatch({ type: ACTIONS.SET_LOADING, payload: { key: "revenue", value: false } });

      // ── Profiles ──────────────────────────────────────────────────────────
      if (rawProfiles.status === "fulfilled") {
        dispatch({ type: ACTIONS.SET_USER_PROFILES, payload: rawProfiles.value });
      } else {
        dispatch({ type: ACTIONS.SET_ERROR, payload: { key: "profiles", value: rawProfiles.reason?.message ?? "Failed to load profiles" } });
      }
      dispatch({ type: ACTIONS.SET_LOADING, payload: { key: "profiles", value: false } });

      // ── Engagement ────────────────────────────────────────────────────────
      if (rawEngagement.status === "fulfilled") {
        dispatch({ type: ACTIONS.SET_USER_ENGAGEMENT, payload: rawEngagement.value });
      } else {
        dispatch({ type: ACTIONS.SET_ERROR, payload: { key: "engagement", value: rawEngagement.reason?.message ?? "Failed to load engagement" } });
      }
      dispatch({ type: ACTIONS.SET_LOADING, payload: { key: "engagement", value: false } });

    } catch (err) {
      if (err.name === "AbortError") return;
      ["sessions", "revenue", "profiles", "engagement"].forEach((k) => {
        dispatch({ type: ACTIONS.SET_ERROR,   payload: { key: k, value: err.message } });
        dispatch({ type: ACTIONS.SET_LOADING, payload: { key: k, value: false } });
      });
    }

    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const cleanup = load();
    return () => cleanup?.then?.((fn) => fn?.());
  }, [load]);
}
