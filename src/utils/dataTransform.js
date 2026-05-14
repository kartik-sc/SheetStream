/**
 * Converts a Google Sheets API v4 response into an array of plain objects.
 *
 * The Sheets API returns:
 *   { values: [headerRow, ...dataRows] }
 *
 * Each data row is a sparse string array — cells beyond the last non-empty
 * cell are simply absent. We normalise every missing or empty cell to null.
 */
export function parseSheetResponse(response) {
  const values = response?.values;

  if (!Array.isArray(values) || values.length === 0) {
    return [];
  }

  const [headers, ...rows] = values;

  return rows.map((row) =>
    Object.fromEntries(
      headers.map((header, i) => {
        const cell = row[i];
        // Coerce absent cells (undefined) and empty strings to null.
        const value = cell === undefined || cell === "" ? null : cell;
        return [header, value];
      })
    )
  );
}
