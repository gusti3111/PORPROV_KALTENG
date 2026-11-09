import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const links = [
  { label: "BERANDA", to: "/beranda" },
  { label: "CABOR", to: "/cabor", active: "/cabor" },
  { label: "BAGAN", to: "/bagan", active: "/bagan" },
  { label: "VENUE", to: "/venue", active: "/venue" },
  { label: "JADWAL PERTANDINGAN", to: "/jadwal", active: "/jadwal" },
  { label: "HASIL PERTANDINGAN", to: "/hasil", active: "/hasil" },
  { label: "BERITA", to: "/berita", active: "/berita" },
];

export default function SiteNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <Button
        className={`nav-toggle${isOpen ? " is-open" : ""}`}
        variant="outline"
        size="icon"
        type="button"
        aria-label={isOpen ? "Tutup navigasi" : "Buka navigasi"}
        aria-expanded={isOpen}
        aria-controls="primary-navigation"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </Button>
      <nav
        id="primary-navigation"
        className={`main-nav${isOpen ? " is-open" : ""}`}
        aria-label="Navigasi utama"
      >
        {links.map((link) => (
          <Link
            key={link.label}
            to={link.to}
            className={link.active === pathname ? "active" : undefined}
            aria-current={link.active === pathname ? "page" : undefined}
            onClick={() => setIsOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
