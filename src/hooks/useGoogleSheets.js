import { useState, useEffect } from "react";
import { parseSheetResponse } from "../utils/dataTransform";

const BASE_URL = "https://sheets.googleapis.com/v4/spreadsheets";

/**
 * Fetches a range from a Google Sheet and returns parsed row objects.
 *
 * @param {string} range    - A1 notation range, e.g. "Sheet1!A1:Z".
 * @param {string} [sheetId] - Spreadsheet ID; defaults to VITE_SHEET_ID env var.
 * @returns {{ data: object[], loading: boolean, error: Error|null }}
 */
const DEFAULT_SHEET_ID = import.meta.env.VITE_SHEET_ID;

export function useGoogleSheets(range, sheetId = DEFAULT_SHEET_ID) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sheetId || !range) return;

    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const url = `${BASE_URL}/${sheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;

    const controller = new AbortController();

    async function fetchSheet() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Sheets API error: ${response.status} ${response.statusText}`);
        }

        const json = await response.json();
        setData(parseSheetResponse(json));
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        setLoading(false);
      }
    }

    fetchSheet();

    // Cancel the in-flight request if the component unmounts or params change.
    return () => controller.abort();
  }, [sheetId, range]);

  return { data, loading, error };
}
