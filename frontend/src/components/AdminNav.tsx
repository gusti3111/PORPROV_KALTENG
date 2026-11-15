import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CalendarRange,
  ExternalLink,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Trophy,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/jadwal", label: "Input Jadwal & Kontingen", icon: CalendarRange },
  { to: "/admin/hasil", label: "Input Hasil & Pemenang", icon: Trophy },
  { to: "/admin/bagan", label: "Klasemen Grup & Bagan", icon: GitBranch },
];

export default function AdminNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    navigate("/admin/login", { replace: true, state: null });
    logout();
  };

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
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 font-semibold text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}

