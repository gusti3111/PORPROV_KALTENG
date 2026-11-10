import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Calendar, Trophy, Hash } from "lucide-react";

const navItems = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Jadwal", to: "/admin/jadwal", icon: Calendar },
  { label: "Hasil", to: "/admin/hasil", icon: Trophy },
  { label: "Bagan", to: "/admin/bagan", icon: Hash },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidecar Nav */}
      <aside className="w-64 shrink-0 bg-sidebar border-r border-border">
        <div className="flex h-14 items-center gap-3 px-4 border-b border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l3 8 4-16 3 8h4" />
            </svg>
          </div>
          <span className="font-bold text-sm text-foreground">Admin Panel</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
              BP
            </div>
            <div className="text-sm text-foreground">
              <p className="font-medium">Panitia</p>
              <p className="text-xs text-muted-foreground">admin@porprov.kalteng</p>
            </div>
            <button className="ml-auto text-muted-foreground hover:text-foreground">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V6.75a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 3.75 6.75v5.25m13.5-4.5a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm10.5 7.5a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
