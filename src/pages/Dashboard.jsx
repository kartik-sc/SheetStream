import {
  LayoutDashboard,
  BarChart3,
  Users,
  Upload,
  Settings,
  Bell,
  Search,
  ChevronDown,
  Zap,
} from "lucide-react";
import KPIGrid from "@/components/KPIGrid";

// ── Sidebar nav items ──────────────────────────────────────────────────────

const navItems = [
  { icon: LayoutDashboard, label: "Overview",   active: true  },
  { icon: BarChart3,       label: "Analytics",  active: false },
  { icon: Users,           label: "Users",      active: false },
  { icon: Upload,          label: "Uploads",    active: false },
  { icon: Settings,        label: "Settings",   active: false },
];

function NavItem({ icon: Icon, label, active }) {
  return (
    <button
      className={[
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-white/10 text-white"
          : "text-[hsl(var(--sidebar-muted))] hover:bg-white/5 hover:text-[hsl(var(--sidebar-fg))]",
      ].join(" ")}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.5 : 2} />
      {label}
    </button>
  );
}

// ── Topbar ─────────────────────────────────────────────────────────────────

function Topbar() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground">
        <Search className="h-3.5 w-3.5" />
        <span>Search…</span>
        <kbd className="ml-6 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]" />
        </button>

        <div className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-accent cursor-pointer">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            K
          </div>
          <span className="font-medium text-foreground">Kartik</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}

// ── Page section header ────────────────────────────────────────────────────

function SectionHeading({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────

export default function Dashboard() {
  return (
    <div className="flex h-screen overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="sidebar flex shrink-0 flex-col">
        {/* Logo */}
        <div className="flex h-14 items-center gap-2.5 border-b border-[hsl(var(--sidebar-border))] px-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
            <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">
            sheetstream
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--sidebar-muted))]">
            Workspace
          </p>
          {navItems.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-[hsl(var(--sidebar-border))] p-4">
          <p className="text-[10px] text-[hsl(var(--sidebar-muted))]">
            v0.1.0 · sheetstream
          </p>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto bg-background px-6 py-6">
          {/* Page title */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Overview
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Analytics across all sessions and revenue sources.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-[hsl(var(--green))]" />
              Live data
            </div>
          </div>

          {/* KPI row */}
          <section className="space-y-3">
            <SectionHeading
              title="Key Metrics"
              subtitle="Computed from merged sessions and revenue data."
            />
            <KPIGrid />
          </section>

          {/* Placeholder zones for future chart rows */}
          <section className="mt-8 space-y-3">
            <SectionHeading
              title="Session Trends"
              subtitle="Coming soon — chart panels will render here."
            />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="card flex h-48 items-center justify-center text-sm text-muted-foreground"
                >
                  Chart placeholder {n}
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
