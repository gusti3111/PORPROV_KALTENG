import { Link, useLocation } from "react-router-dom";
import {
  CalendarRange,
  ExternalLink,
  GitBranch,
  LayoutDashboard,
  Trophy,
} from "lucide-react";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/jadwal", label: "Input Jadwal & Kontingen", icon: CalendarRange },
  { to: "/admin/hasil", label: "Input Hasil & Pemenang", icon: Trophy },
  { to: "/admin/bagan", label: "Klasemen Grup & Bagan", icon: GitBranch },
];

export default function AdminNav() {
  const { pathname } = useLocation();

  return (
    <div className="rounded-xl border bg-card p-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap items-center gap-1.5" aria-label="Navigasi Admin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.to
              : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground font-medium">Lihat Web Utama:</span>
          <Link
            to="/jadwal"
            className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 font-medium hover:bg-muted"
          >
            Jadwal <ExternalLink className="h-3 w-3" />
          </Link>
          <Link
            to="/bagan"
            className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 font-medium hover:bg-muted"
          >
            Bagan <ExternalLink className="h-3 w-3" />
          </Link>
          <Link
            to="/hasil"
            className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 font-medium hover:bg-muted"
          >
            Hasil & Medali <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

