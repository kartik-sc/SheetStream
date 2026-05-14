export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Configure your data sources and preferences.
        </p>
      </div>

      <div className="max-w-lg space-y-4">
        <div className="card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Google Sheets</h2>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Sheet ID</label>
            <input
              readOnly
              value={import.meta.env.VITE_SHEET_ID ?? "—"}
              className="flex h-8 w-full rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">API Key</label>
            <input
              readOnly
              value={import.meta.env.VITE_GOOGLE_API_KEY ? "••••••••••••••••" : "Not configured"}
              className="flex h-8 w-full rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground"
            />
          </div>
        </div>

        <div className="card p-5">
          <p className="text-sm text-muted-foreground">
            To update credentials, edit your <code className="rounded bg-muted px-1 py-0.5 text-xs">.env</code> file
            and redeploy.
          </p>
        </div>
      </div>
    </div>
  );
}
