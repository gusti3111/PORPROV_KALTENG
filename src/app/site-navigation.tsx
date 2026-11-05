"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { label: "Tentang", href: "/#tentang", activePath: null },
  { label: "CABOR", href: "/cabor", activePath: "/cabor" },
  { label: "VENUE", href: "/#venue", activePath: null },
  { label: "JADWAL PERTANDINGAN", href: "/#jadwal", activePath: null },
  { label: "HASIL PERTANDINGAN", href: "/#hasil", activePath: null },
  { label: "BERITA", href: "/#informasi", activePath: null },
];

export default function SiteNavigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <>
      <button
        className={`nav-toggle${isOpen ? " is-open" : ""}`}
        type="button"
        aria-label={isOpen ? "Tutup navigasi" : "Buka navigasi"}
        aria-expanded={isOpen}
        aria-controls="primary-navigation"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>
      <nav
        className={`main-nav${isOpen ? " is-open" : ""}`}
        id="primary-navigation"
        aria-label="Navigasi utama"
      >
        {links.map(({ label, href, activePath }) => {
          const isActive = activePath !== null && pathname === activePath;

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={isActive ? "active" : undefined}
              href={href}
              key={label}
              onClick={() => setIsOpen(false)}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
