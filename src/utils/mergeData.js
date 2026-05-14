/**
 * mergeSessionData — combines Google Sheets rows with uploaded CSV rows.
 *
 * @param {object[]} sheetsData   - Rows from the user_sessions sheet (keyed objects).
 * @param {object[]} uploadedData - Rows parsed from the offline CSV upload.
 * @returns {{ mergedData: object[], schemaWarnings: string[], duplicateCount: number }}
 */
export function mergeSessionData(sheetsData = [], uploadedData = []) {
  // ── Schema drift detection ────────────────────────────────────────────────
  const sheetsColumns = new Set(sheetsData.flatMap(Object.keys));
  const schemaWarnings = [
    ...new Set(uploadedData.flatMap(Object.keys)),
  ].filter((col) => !sheetsColumns.has(col));

  // ── Tag each row with its source ─────────────────────────────────────────
  const tagged = [
    ...sheetsData.map((row) => ({ ...row, source: "sheets" })),
    ...uploadedData.map((row) => ({ ...row, source: "uploaded" })),
  ];

  // ── Duplicate detection ───────────────────────────────────────────────────

  const pairCounts = new Map();
  for (const row of tagged) {
    const key = `${row.user_id}__${row.date}`;
    pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
  }

  let duplicateCount = 0;
  const mergedData = tagged.map((row) => {
    const key = `${row.user_id}__${row.date}`;
    const isDuplicate = pairCounts.get(key) > 1;
    if (isDuplicate) duplicateCount++;
    return { ...row, duplicate: isDuplicate };
  });

  // duplicateCount reflects total rows flagged (both copies of each pair).
  return { mergedData, schemaWarnings, duplicateCount };
}

/**
 * applyFilters — returns a filtered slice of mergedData based on active filters.
 *
 * All filter values default to "all" / null, which means "no restriction".
 *
 * @param {object[]} mergedData
 * @param {object}   filters
 * @param {object}   filters.dateRange        - { start: string|null, end: string|null }
 * @param {string}   filters.caseType         - case_type value or "all"
 * @param {string}   filters.status           - status value or "all"
 * @param {string}   filters.source           - "sheets" | "uploaded" | "all"
 * @param {string}   filters.experienceLevel  - passed through for profile joins
 * @param {string}   filters.targetCompany
 * @param {string}   filters.subscriptionStatus
 * @param {string}   filters.country
 * @returns {object[]}
 */
export function applyFilters(mergedData = [], filters = {}) {
  const {
    dateRange = {},
    caseType = null,
    status = null,
    source = null,
  } = filters;

  const { start = null, end = null } = dateRange ?? {};

  return mergedData.filter((row) => {
    // ── Date range (inclusive ISO string comparison) ───────────────────────
    if (start && row.date && row.date < start) return false;
    if (end && row.date && row.date > end) return false;

    // ── Case type ─────────────────────────────────────────────────────────
    if (caseType && caseType !== "all") {
      if (row.case_type !== caseType) return false;
    }

    // ── Status (normalise to lowercase before comparing) ──────────────────
    if (status && status !== "all") {
      if ((row.status ?? "").toLowerCase() !== status.toLowerCase()) return false;
    }

    // ── Source ────────────────────────────────────────────────────────────
    if (source && source !== "all") {
      if (row.source !== source) return false;
    }

    return true;
  });
}
