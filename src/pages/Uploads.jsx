import { useState } from "react";
import { useDashboard, ACTIONS } from "@/context/DashboardContext";
import { mergeSessionData } from "@/utils/mergeData";
import FileUpload from "@/components/FileUpload";

export default function Uploads() {
  const { state, dispatch } = useDashboard();
  const [schemaWarnings, setSchemaWarnings] = useState([]);

  function handleData(rows) {
    dispatch({ type: ACTIONS.SET_UPLOADED_SESSIONS, payload: rows });

    const { mergedData, schemaWarnings: warnings, duplicateCount } =
      mergeSessionData(state.userSessions, rows);

    dispatch({ type: ACTIONS.SET_MERGED_DATA, payload: mergedData });
    setSchemaWarnings(warnings);

    if (duplicateCount > 0) {
      console.info(`[sheetstream] ${duplicateCount} duplicate rows detected after merge.`);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Uploads</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Upload offline session data (.csv, .xls, .xlsx) to merge with live sheet data.
        </p>
      </div>

      <div className="max-w-xl">
        <FileUpload onData={handleData} schemaWarnings={schemaWarnings} />
      </div>

      {state.uploadedSessions.length > 0 && (
        <div className="card p-5 space-y-2">
          <p className="text-sm font-medium text-foreground">
            Uploaded — {state.uploadedSessions.length} rows loaded
          </p>
          <p className="text-xs text-muted-foreground">
            Merged dataset: {state.mergedData.length} total rows
            {schemaWarnings.length > 0 && ` · ${schemaWarnings.length} schema warning(s)`}
          </p>
        </div>
      )}
    </div>
  );
}
