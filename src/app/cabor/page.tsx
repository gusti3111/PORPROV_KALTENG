import Link from "next/link";
import type { Metadata } from "next";
import SiteNavigation from "../site-navigation";
import SportSearch, { type Sport } from "./sport-search";

export const metadata: Metadata = {
  title: "Cabang Olahraga | PORPROV XIII Kalimantan Tengah 2026",
  description:
    "Daftar 32 cabang utama dan 3 cabang eksebisi PORPROV XIII Kalimantan Tengah 2026.",
};

const sports: Sport[] = [
  { name: "Aerosport", group: "Utama", icon: "AE", description: "Cabang olahraga dirgantara" },
  { name: "Atletik", group: "Utama", icon: "AT", description: "Nomor lari, lompat, dan lempar" },
  { name: "Aquatik", group: "Utama", icon: "AB", description: "Kegiatan olahraga di air" },
  /* { name: "Bermotor", group: "Utama", icon: "BM", description: "Grass Track dan Motocross" }, */
  { name: "Balap Sepeda", group: "Utama", icon: "BS", description: "Balapan sepeda" },
  { name: "Biliard", group: "Utama", icon: "BI", description: "Ketepatan dan strategi" },
  { name: "Binaraga Fitness", group: "Utama", icon: "BF", description: "Kebugaran dan pembentukan tubuh" },
  { name: "Basket", group: "Utama", icon: "BK", description: "Permainan bola basket" },
  /* { name: "Bola Voli", group: "Utama", icon: "BV", description: "Nomor indoor dan pantai" }, */
  { name: "Bridge", group: "Utama", icon: "BR", description: "Permainan kartu strategi" },
  { name: "Bulutangkis", group: "Utama", icon: "BU", description: "Kecepatan dan ketepatan" },
  { name: "Catur", group: "Utama", icon: "CA", description: "Olahraga strategi" },
  /* { name: "Dayung", group: "Utama", icon: "DY", description: " Canoeing dan Traditional Boat Race" }, */
  { name: "Drumband", group: "Utama", icon: "DB", description: "Perpaduan musik dan baris-berbaris" },
  { name: "Dancesport", group: "Utama", icon: "DS", description: "Olahraga tari" },
  { name: "E-Sport", group: "Utama", icon: "ES", description: "Kompetisi olahraga elektronik" },
  { name: "Gimnastik", group: "Utama", icon: "GI", description: "Kelenturan, kekuatan, dan keseimbangan" },
  { name: "Judo", group: "Utama", icon: "JU", description: "Olahraga bela diri" },
  { name: "Karate", group: "Utama", icon: "KA", description: "Teknik dan disiplin bela diri" },
  { name: "Korfball", group: "Utama", icon: "KO", description: "Permainan bola beregu" },
  { name: "MMA.", group: "Utama", icon: "MA", description: "Seni bela diri modern" },
  { name: "Panahan", group: "Utama", icon: "PA", description: "Akurasi dan konsentrasi" },
  { name: "Panjat Tebing", group: "Utama", icon: "PT", description: "Ketangkasan di dinding panjat" },
  { name: "Pencak Silat", group: "Utama", icon: "PS", description: "Seni bela diri Indonesia" },
  { name: "Sepak Takraw", group: "Utama", icon: "ST", description: "Permainan bola rotan beregu" },
  /* { name: "Roller Sport", group: "Utama", icon: "SR", description: "Sepatu roda dan skateboard" }, */
  /* { name: "Sepak Bola", group: "Utama", icon: "SB", description: "Sepak bola dan futsal" }, */
  { name: "Taekwondo", group: "Utama", icon: "TK", description: "Olahraga bela diri Korea" },
  { name: "Tenis Lapangan", group: "Utama", icon: "TL", description: "Permainan raket di lapangan" },
  { name: "Tenis Meja", group: "Utama", icon: "TM", description: "Permainan cepat di atas meja" },
  { name: "Tinju", group: "Utama", icon: "TI", description: "Olahraga bela diri di atas ring" },
  { name: "Sepak Bola Mini", group: "Utama", icon: "SM", description: "Sepak bola format mini" },
  { name: "Kick Boxing", group: "Eksebisi", icon: "KBO", description: "Cabang olahraga eksebisi" },
  { name: "Teqball", group: "Eksebisi", icon: "TB", description: "Cabang olahraga eksebisi" },
  { name: "Muaythai", group: "Eksebisi", icon: "MT", description: "Cabang olahraga eksebisi bela diri" },
];

const mainSportsCount = sports.filter((sport) => sport.group === "Utama").length;
const exhibitionSportsCount = sports.filter(
  (sport) => sport.group === "Eksebisi",
).length;
function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M5 15 15 5M6 5h9v9" />
    </svg>
  );
}

export default function CaborPage() {
  return (
    <>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="PORPROV XIII Kalteng">
          <span className="brand-mark" aria-hidden="true">
            P<span>13</span>
          </span>
          <span className="brand-copy">
            <strong>PORPROV</strong>
            <small>KALIMANTAN TENGAH</small>
          </span>
        </Link>

        <SiteNavigation />

        <Link className="header-link" href="/#informasi">
          Pusat informasi <ArrowIcon />
        </Link>
      </header>

      <main>
        <section className="cabor-hero">
          <div className="cabor-hero-grid" aria-hidden="true" />
          <div className="cabor-hero-content">
            <p className="cabor-eyebrow">
              <span /> PORPROV XIII • KALIMANTAN TENGAH 2026
            </p>
            <h1>
              Cabang
              <br />
              <span>Olahraga.</span>
            </h1>
            <p className="cabor-hero-description">
              Kenali cabang olahraga yang akan mempertemukan atlet-atlet
              terbaik Kalimantan Tengah dalam semangat sportivitas.
            </p>
            <a className="cabor-scroll-link" href="#daftar-cabor">
              Jelajahi cabang olahraga <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="cabor-hero-number" aria-hidden="true">
            13
          </div>
          <div className="cabor-hero-footer">
            <span>SEMANGAT • SPORTIVITAS • PRESTASI</span>
            <span>DAFTAR CABANG OLAHRAGA</span>
          </div>
        </section>

        <section className="cabor-content section-wrap" id="daftar-cabor">
          <div className="cabor-section-heading">
            <div>
              <p className="cabor-section-kicker">
                <span>01</span> ARENA PARA JUARA
              </p>
              <h2>
                Temukan
                <br />
                <span>pertandingannya.</span>
              </h2>
            </div>
            <p className="cabor-intro">
              Setiap cabang punya cerita dan tantangannya sendiri. Pilih
              cabang untuk mengenal lebih dekat arena kompetisi PORPROV XIII.
            </p>
          </div>

          <SportSearch
            exhibitionSportsCount={exhibitionSportsCount}
            mainSportsCount={mainSportsCount}
            sports={sports}
          />

          <p className="cabor-disclaimer">
            Berdasarkan revisi jadwal sementara penyelenggaraan PORPROV XIII
            Kalimantan Tengah 2026. Tabel mencantumkan {mainSportsCount} cabang
            utama dan {exhibitionSportsCount} cabang eksebisi. Ejaan nama cabang
            mengikuti dokumen yang diberikan.
          </p>
        </section>

        <section className="cabor-cta">
          <div className="cabor-cta-inner">
            <p className="cabor-eyebrow">
              <span /> BERSAMA MENUJU PRESTASI
            </p>
            <h2>
              Satu provinsi.
              <br />
              <span>Ribuan cerita juara.</span>
            </h2>
            <Link className="cabor-back-link" href="/">
              Kembali ke beranda <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <span className="cabor-cta-mark" aria-hidden="true">
            XIII
          </span>
        </section>
      </main>

      <footer className="site-footer">
        <Link className="brand footer-brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            P<span>13</span>
          </span>
          <span className="brand-copy">
            <strong>PORPROV</strong>
            <small>KALIMANTAN TENGAH</small>
          </span>
        </Link>
        <p>PORPROV XIII Kalimantan Tengah 2026</p>
        <Link className="footer-top" href="/">
          BERANDA <ArrowIcon />
        </Link>
        <span className="footer-note">
          Informasi resmi akan diperbarui oleh penyelenggara.
        </span>
      </footer>
    </>
  );
}
