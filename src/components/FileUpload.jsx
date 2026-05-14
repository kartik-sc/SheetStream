import { useRef, useState } from "react";
import { Upload, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";

/**
 * FileUpload — drag-and-drop / click-to-upload zone for CSV and Excel files.
 *
 * Props:
 *   onData          (rows: object[]) => void   — receives the parsed row array
 *   schemaWarnings  string[]                   — extra columns detected by mergeData
 */
export default function FileUpload({ onData, schemaWarnings = [] }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileInfo, setFileInfo] = useState(null); // { name, rowCount }

  function handleParsed(rows) {
    setFileInfo({ name: currentFileName.current, rowCount: rows.length });
    onData(rows);
  }

  const { handleFile, uploading, error } = useFileUpload(handleParsed);

  // Keep track of the filename across the async parse boundary.
  const currentFileName = useRef("");

  function processFile(file) {
    if (!file) return;
    currentFileName.current = file.name;
    handleFile(file);
  }

  // ── Drag handlers ─────────────────────────────────────────────────────────
  function onDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }
  function onDragLeave() {
    setIsDragging(false);
  }
  function onDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  }
  function onInputChange(e) {
    processFile(e.target.files?.[0]);
    // Reset input so the same file can be re-uploaded if needed.
    e.target.value = "";
  }

  return (
    <div className="w-full space-y-3">
      {/* ── Drop zone card ────────────────────────────────────────────── */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={[
          "relative flex flex-col items-center justify-center gap-3",
          "cursor-pointer rounded-xl border-2 border-dashed px-6 py-10",
          "transition-colors duration-150 select-none",
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
            : "border-zinc-300 bg-zinc-50 hover:border-zinc-400 hover:bg-zinc-100",
          "dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-500",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xls,.xlsx"
          className="sr-only"
          onChange={onInputChange}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-zinc-500">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-500" />
            <span className="text-sm">Parsing file…</span>
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 text-zinc-400" />
            <div className="text-center">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Drag &amp; drop your file here
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                CSV, XLS, or XLSX · click to browse
              </p>
            </div>
          </>
        )}
      </div>

      {/* ── Success badge ─────────────────────────────────────────────── */}
      {fileInfo && !error && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 dark:border-green-800 dark:bg-green-950/30">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <FileText className="h-3.5 w-3.5 shrink-0 text-green-600" />
            <span className="truncate text-sm font-medium text-green-800 dark:text-green-300">
              {fileInfo.name}
            </span>
            <span className="ml-auto shrink-0 rounded-full bg-green-200 px-2 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-800 dark:text-green-100">
              {fileInfo.rowCount} rows
            </span>
          </div>
        </div>
      )}

      {/* ── Schema warnings ───────────────────────────────────────────── */}
      {schemaWarnings.length > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 dark:border-amber-700 dark:bg-amber-950/30">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Schema mismatch — extra columns detected
              </p>
              <div className="flex flex-wrap gap-1.5">
                {schemaWarnings.map((col) => (
                  <span
                    key={col}
                    className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-mono font-semibold text-amber-900 dark:bg-amber-800 dark:text-amber-100"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Parse error ───────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 dark:border-red-800 dark:bg-red-950/30">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
          <p className="text-sm text-red-700 dark:text-red-300">{error.message}</p>
        </div>
      )}
    </div>
  );
}
