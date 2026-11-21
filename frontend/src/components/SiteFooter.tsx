import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, PhoneCall } from "lucide-react";
// import ArrowIcon from "./ArrowIcon";

export default function SiteFooter() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 360);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Kembali ke atas"
          title="Kembali ke atas"
          className="fixed right-4 bottom-5 z-40 inline-flex items-center gap-1.5 rounded-full bg-[var(--green)] px-3.5 py-2.5 text-xs font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Ke Atas</span>
        </button>
      )}
      <footer className="site-footer">
        <Link className="brand footer-brand" to="/">
          <img
            className="brand-logo"
            src="/iconporKalteng.webp"
            alt="Logo PORPROV XIII Kalimantan Tengah"
          />
          <span className="brand-copy">
            <strong>PORPROV</strong>
            <small>KALIMANTAN TENGAH</small>
          </span>
        </Link>


        <p>PORPROV XIII Kalimantan Tengah 2026</p>

        <div className="footer-top sm:col-start-3 justify-self-end flex items-center gap-3">
          {/* <Link className="inline-flex items-center gap-[7px]" to="/">
            BERANDA <ArrowIcon diagonal />
          </Link> */}
          <span className="brand-copy">
            <strong>KABUPATEN</strong>
            <small>KOTAWARINGIN BARAT</small>
          </span>

          <img
            className="h-12 w-auto object-contain shrink-0"
            src="/logos/kobar.webp"
            alt="Logo Kotawaringin Barat"
          />
        </div>

        <div className="col-span-full flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-3.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-extrabold tracking-wider text-amber-300 uppercase text-[10px]">
              <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
              Hotline Darurat:
            </span>
            <a
              href="tel:112"
              className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/20 transition-colors"
            >
              Darurat 112
            </a>
            <a
              href="tel:053222008"
              className="rounded-full bg-rose-500/25 border border-rose-400/30 px-2.5 py-1 text-[11px] font-bold text-rose-100 hover:bg-rose-500/40 transition-colors"
            >
              Damkar Kobar 0532-22008
            </a>
            <a
              href="https://wa.me/6281290461661"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-emerald-500/25 border border-emerald-400/30 px-2.5 py-1 text-[11px] font-bold text-emerald-100 hover:bg-emerald-500/40 transition-colors"
            >
              WA Damkar 0812-9046-1661
            </a>
            <a
              href="tel:110"
              className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/20 transition-colors"
            >
              Polisi 110
            </a>
            <a
              href="tel:119"
              className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/20 transition-colors"
            >
              Ambulans 119
            </a>
            <a
              href="tel:115"
              className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/20 transition-colors"
            >
              SAR 115
            </a>
          </div>
          <Link
            to="/informasi?tab=kesehatan"
            className="text-[11px] font-bold text-amber-300 hover:underline"
          >
            Lihat Layanan Kesehatan &amp; Darurat →
          </Link>
        </div>

        <span className="footer-note">
          Informasi resmi akan diperbarui oleh penyelenggara.
        </span>

      </footer >
    </>
  );
}
