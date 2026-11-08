import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteNavigation from "./SiteNavigation";

export default function SiteHeader() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const theme = isDark ? "dark" : "light";
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("porprov-theme", theme);
  }, [isDark]);

  return (
    <header className="site-header">
      <Link
        className="brand"
        to="/"
        aria-label="PORPROV XIII Kalteng"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <img
          className="brand-logo"
          src="/iconporKalteng.jpeg"
          alt="Logo PORPROV XIII Kalimantan Tengah"
        />
        <span className="brand-copy">
          <strong>PORPROV</strong>
          <small>KALIMANTAN TENGAH</small>
        </span>
      </Link>

      <SiteNavigation />
      <Button
        className="theme-toggle"
        type="button"
        variant="outline"
        size="icon"
        aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
        aria-pressed={isDark}
        title={isDark ? "Mode terang" : "Mode gelap"}
        onClick={() => setIsDark((dark) => !dark)}
      >
        {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
      </Button>
    </header>
  );
}
