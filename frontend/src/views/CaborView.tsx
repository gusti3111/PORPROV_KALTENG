import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import SportSearch from "../components/SportSearch";
import type { Sport as BackendSport } from "../api/types";
import { useCompetitionStore } from "../stores/competitionStore";
import type { Sport as SportCard } from "../types/sport";

function toSportCards(sports: BackendSport[]): SportCard[] {
  return sports.map((sport) => ({
    id: sport.id,
    name: sport.name,
    group: sport.category,
    icon: sport.icon,
    description: sport.description,
  }));
}

export default function CaborView() {
  const sports = useCompetitionStore((state) => state.sports);
  const loading = useCompetitionStore((state) => state.loading.sports);
  const error = useCompetitionStore((state) => state.errors.sports);
  const fetchSports = useCompetitionStore((state) => state.fetchSports);

  useEffect(() => {
    void fetchSports();
  }, [fetchSports]);

  const sportCards = toSportCards(sports);
  const demoSportCards = sportCards.slice(0, 10);
  const mainSportsCount = demoSportCards.filter(
    (sport) => sport.group === "Utama",
  ).length;
  const exhibitionSportsCount = demoSportCards.filter(
    (sport) => sport.group === "Eksebisi",
  ).length;

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
          <img
            className="cabor-page-hero-illustration"
            src="/burungCabor.png"
            alt="Maskot PORPROV membawa bola basket, sepak bola, tenis, dan voli"
          />
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

          {loading && <p role="status">Memuat daftar cabang olahraga...</p>}
          {error && (
            <p role="alert">
              Gagal memuat cabang olahraga: {error}{" "}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void fetchSports()}
              >
                Coba lagi
              </Button>
            </p>
          )}
          {!loading && !error && sportCards.length > 0 && (
            <SportSearch
              sports={demoSportCards}
              mainSportsCount={mainSportsCount}
              exhibitionSportsCount={exhibitionSportsCount}
            />
          )}

          <p className="cabor-disclaimer">
            Untuk gambaran, halaman ini menampilkan 10 cabang pertama. Klasemen,
            skor, dan bagan penyisihan pada halaman detail masih berupa data dummy.
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
