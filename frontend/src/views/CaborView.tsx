import { Link } from "react-router-dom";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import SportSearch from "../components/SportSearch";
import { sports } from "../data/sports";

const mainSportsCount = sports.filter((sport) => sport.group === "Utama").length;
const exhibitionSportsCount = sports.filter(
  (sport) => sport.group === "Eksebisi",
).length;

export default function CaborView() {
  return (
    <>
      <SiteHeader />

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
              Kenali cabang olahraga yang akan mempertemukan atlet-atlet terbaik
              Kalimantan Tengah dalam semangat sportivitas.
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

        <section id="daftar-cabor" className="cabor-content section-wrap">
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
              Setiap cabang punya cerita dan tantangannya sendiri. Pilih cabang
              untuk mengenal lebih dekat arena kompetisi PORPROV XIII.
            </p>
          </div>

          <SportSearch
            sports={sports}
            mainSportsCount={mainSportsCount}
            exhibitionSportsCount={exhibitionSportsCount}
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
            <Link className="cabor-back-link" to="/">
              Kembali ke beranda <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <span className="cabor-cta-mark" aria-hidden="true">
            XIII
          </span>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
