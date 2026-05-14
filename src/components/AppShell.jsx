import { useRef, useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
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
  LogOut,
  UserCircle,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useDataLoader } from "@/hooks/useDataLoader";
import { useDashboard, ACTIONS } from "@/context/DashboardContext";

// ── Nav items ───────────────────────────────────────────────────────────────

const navItems = [
  { icon: LayoutDashboard, label: "Overview",  to: "/"          },
  { icon: BarChart3,       label: "Analytics", to: "/analytics"  },
  { icon: Users,           label: "Users",     to: "/users"      },
  { icon: Upload,          label: "Uploads",   to: "/uploads"    },
  { icon: Settings,        label: "Settings",  to: "/settings"   },
];

// ── Sidebar nav item ────────────────────────────────────────────────────────

function SidebarNavItem({ icon: Icon, label, to }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        [
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-white/10 text-white"
            : "text-[hsl(var(--sidebar-muted))] hover:bg-white/5 hover:text-[hsl(var(--sidebar-fg))]",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <Icon className="h-4 w-4 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
          {label}
        </>
      )}
    </NavLink>
  );
}

// ── User dropdown ───────────────────────────────────────────────────────────

function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-accent transition-colors"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground select-none">
          K
        </div>
        <span className="font-medium text-foreground">Kartik</span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-52 rounded-xl border border-border bg-card shadow-lg">
          {/* Profile header */}
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Kartik SC</p>
            <p className="text-xs text-muted-foreground truncate">kartiksatishchandra@gmail.com</p>
          </div>

          <div className="py-1">
            <DropdownItem icon={UserCircle} label="Profile" onClick={() => setOpen(false)} />
            <DropdownItem icon={SlidersHorizontal} label="Preferences" onClick={() => setOpen(false)} />
          </div>

          <div className="border-t border-border py-1">
            <DropdownItem
              icon={LogOut}
              label="Sign out"
              onClick={() => setOpen(false)}
              danger
            />
          </div>
        </div>
      )}
    </div>
  );
}

function DropdownItem({ icon: Icon, label, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex w-full items-center gap-2.5 px-4 py-2 text-sm transition-colors hover:bg-accent",
        danger ? "text-red-500 hover:text-red-600" : "text-foreground",
      ].join(" ")}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {label}
    </button>
  );
}

// ── Notification bell ───────────────────────────────────────────────────────

const NOTIFICATIONS = [
  { id: 1, text: "Offline CSV auto-loaded on startup.", time: "Just now" },
  { id: 2, text: "Sheets data refreshed successfully.", time: "1 min ago" },
];

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(new Set());
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  const visible = NOTIFICATIONS.filter((n) => !dismissed.has(n.id));
  const hasUnread = visible.length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      >
        <Bell className="h-4 w-4" />
        {hasUnread && (
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-72 rounded-xl border border-border bg-card shadow-lg">
          <div className="border-b border-border px-4 py-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            {hasUnread && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {visible.length} new
              </span>
            )}
          </div>

          <div className="divide-y divide-border">
            {visible.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-muted-foreground">All caught up!</p>
            ) : (
              visible.map((n) => (
                <div key={n.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-relaxed">{n.text}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{n.time}</p>
                  </div>
                  <button
                    onClick={() => setDismissed((prev) => new Set([...prev, n.id]))}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Search bar ──────────────────────────────────────────────────────────────

function SearchBar() {
  const { dispatch } = useDashboard();
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  // Ctrl/Cmd+K focus shortcut
  useEffect(() => {
    function handleKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") inputRef.current?.blur();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  function handleChange(e) {
    setValue(e.target.value);
    dispatch({ type: ACTIONS.SET_FILTER, payload: { key: "textSearch", value: e.target.value || null } });
  }

  function handleClear() {
    setValue("");
    dispatch({ type: ACTIONS.SET_FILTER, payload: { key: "textSearch", value: null } });
    inputRef.current?.focus();
  }

  return (
    <div className="relative flex items-center">
      <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={handleChange}
        placeholder="Search sessions…"
        className="h-8 w-40 rounded-lg border border-border bg-background pl-8 pr-7 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:w-56 transition-all duration-200"
      />
      {value && (
        <button onClick={handleClear} className="absolute right-2 text-muted-foreground hover:text-foreground">
          <X className="h-3 w-3" />
        </button>
      )}
      {!value && (
        <kbd className="pointer-events-none absolute right-2 rounded bg-muted px-1 py-0.5 font-mono text-[9px] text-muted-foreground">
          ⌘K
        </kbd>
      )}
    </div>
  );
}

// ── Topbar ──────────────────────────────────────────────────────────────────

function Topbar() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6 gap-4">
      <SearchBar />
      <div className="flex items-center gap-2">
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}

// ── AppShell ────────────────────────────────────────────────────────────────

export default function AppShell() {
  useDataLoader();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="sidebar flex shrink-0 flex-col">
        <div className="flex h-14 items-center gap-2.5 border-b border-[hsl(var(--sidebar-border))] px-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
            <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">sheetstream</span>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--sidebar-muted))]">
            Workspace
          </p>
          {navItems.map((item) => (
            <SidebarNavItem key={item.to} {...item} />
          ))}
        </nav>

        <div className="border-t border-[hsl(var(--sidebar-border))] p-4">
          <p className="text-[10px] text-[hsl(var(--sidebar-muted))]">v0.1.0 · sheetstream</p>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-background px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
