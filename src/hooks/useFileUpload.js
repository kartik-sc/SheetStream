import { useState } from "react";
import * as XLSX from "xlsx";

/**
 * Normalise a column name: lowercase and trim surrounding whitespace.
 * Applied to every header so callers get consistent keys regardless of
 * how the source file was authored.
 */
function normaliseKey(key) {
  return String(key).trim().toLowerCase();
}

/** Parse an ArrayBuffer / binary string via SheetJS into row objects. */
function parseExcel(buffer) {
  const workbook = XLSX.read(buffer, { type: "binary" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  // header:1 returns raw arrays; we do the key normalisation ourselves.
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

  if (rows.length === 0) return [];

  const [rawHeaders, ...dataRows] = rows;
  const headers = rawHeaders.map(normaliseKey);

  return dataRows.map((row) =>
    Object.fromEntries(
      headers.map((h, i) => {
        const cell = row[i];
        return [h, cell === undefined || cell === "" ? null : cell];
      })
    )
  );
}

/** Parse a raw CSV text string into row objects. */
function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) return [];

  const headers = lines[0].split(",").map(normaliseKey);

  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    return Object.fromEntries(
      headers.map((h, i) => {
        const cell = cells[i]?.trim();
        return [h, !cell || cell === "" ? null : cell];
      })
    );
  });
}

/** Wrap FileReader in a Promise so we can await it. */
function readFile(file, mode) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    if (mode === "binary") {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  });
}

/**
 * useFileUpload — handles .csv, .xls, and .xlsx file parsing.
 *
 * @param {(rows: object[]) => void} onData - Called with the parsed row array.
 * @returns {{ handleFile: (file: File) => void, uploading: boolean, error: Error|null }}
 */
export function useFileUpload(onData) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function handleFile(file) {
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["csv", "xls", "xlsx"].includes(ext)) {
      setError(new Error(`Unsupported file type: .${ext}. Use .csv, .xls, or .xlsx.`));
      return;
    }

    setUploading(true);
    setError(null);

    try {
      let rows;
      if (ext === "csv") {
        const text = await readFile(file, "text");
        rows = parseCsv(text);
      } else {
        const binary = await readFile(file, "binary");
        rows = parseExcel(binary);
      }
      onData(rows);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setUploading(false);
    }
  }

  return { handleFile, uploading, error };
}
