import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import VenueMap from "../components/VenueMap";
import { venues } from "../data/venues";
import type { VenueCategory } from "../data/venues";

const categories: VenueCategory[] = [
  "Stadion & fasilitas olahraga",
  "Gedung & aula",
  "Lapangan & rekreasi",
  "Area umum",
];

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("id");
}

export default function VenueView() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const filteredVenues = useMemo(() => {
    const normalizedQuery = normalizeText(query.trim());
    return venues.filter((venue) => {
      const matchesQuery =
        !normalizedQuery ||
        normalizeText(`${venue.name} ${venue.category} ${venue.note ?? ""}`).includes(
          normalizedQuery,
        );
      return matchesQuery && (!category || venue.category === category);
    });
  }, [category, query]);

  const selectedVenue =
    filteredVenues.find((venue) => venue.name === selectedName) ?? null;

  return (
    <>
      <SiteHeader />

      <main>
        <section className="cabor-hero venue-hero">
          <div className="cabor-hero-grid" aria-hidden="true" />
          <div className="cabor-hero-content">
            <p className="cabor-eyebrow">
              <span /> ARENA PERTANDINGAN • PORPROV XIII 2026
            </p>
            <h1>
              Venue
              <br />
              <span>dan Peta.</span>
            </h1>
            <p className="cabor-hero-description">
              Temukan tempat yang tercantum pada jadwal sementara dan jelajahi
              perkiraan areanya melalui peta interaktif.
            </p>
            <a className="cabor-scroll-link" href="#daftar-venue">
              Jelajahi venue <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="cabor-hero-number" aria-hidden="true">
            XIII
          </div>
          <div className="cabor-hero-footer">
            <span>KOTAWARINGIN BARAT • KALIMANTAN TENGAH</span>
            <span>LOKASI PENYELENGGARAAN</span>
          </div>
        </section>

        <section id="daftar-venue" className="cabor-content section-wrap">
          <div className="cabor-section-heading">
            <div>
              <p className="cabor-section-kicker">
                <span>01</span> LOKASI PERTANDINGAN
              </p>
              <h2>
                Cari venue
                <br />
                <span>dan jelajahi peta.</span>
              </h2>
            </div>
            <p className="cabor-intro">
              Pilih salah satu tempat untuk memusatkan peta. Pencarian dan filter
              membantu menemukan venue dalam daftar.
            </p>
          </div>

          <div className="venue-explorer">
            <div className="venue-sidebar">
              <form
                className="cabor-search"
                role="search"
                onSubmit={(event) => event.preventDefault()}
              >
                <label className="sr-only" htmlFor="venue-search-input">
                  Cari venue atau lokasi
                </label>
                <svg
                  className="cabor-search-icon"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle cx="10.8" cy="10.8" r="6.8" />
                  <path d="m16 16 4.5 4.5" />
                </svg>
                <input
                  id="venue-search-input"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  autoComplete="off"
                  placeholder="Cari venue atau lokasi..."
                  type="search"
                />
                {query && (
                  <button
                    className="cabor-search-clear"
                    type="button"
                    aria-label="Hapus pencarian"
                    onClick={() => setQuery("")}
                  >
                    Hapus
                  </button>
                )}
              </form>

              <label className="venue-filter-label" htmlFor="venue-category">
                Filter kategori venue
              </label>
              <select
                id="venue-category"
                className="venue-filter"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="">Semua kategori</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <div className="venue-list-heading" aria-live="polite">
                <span>DAFTAR VENUE</span>
                <span>
                  {String(filteredVenues.length).padStart(2, "0")} TEMPAT
                </span>
              </div>

              <div className="venue-list">
                {filteredVenues.map((venue, index) => {
                  const isSelected = selectedName === venue.name;
                  return (
                    <button
                      key={venue.name}
                      className={`venue-list-item${isSelected ? " is-selected" : ""}`}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedName(venue.name)}
                    >
                      <span className="venue-list-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="venue-list-copy">
                        <strong>{venue.name}</strong>
                        <small>{venue.category}</small>
                      </span>
                      <span className="venue-list-arrow" aria-hidden="true">
                        ↗
                      </span>
                    </button>
                  );
                })}
                {filteredVenues.length === 0 && (
                  <p className="cabor-empty" role="status">
                    Venue tidak ditemukan. Coba kata kunci lain.
                  </p>
                )}
              </div>
            </div>

            <VenueMap
              venues={filteredVenues}
              selectedVenue={selectedVenue}
              onSelectVenue={(venue) => setSelectedName(venue.name)}
            />
          </div>

          <p className="cabor-disclaimer">
            Sumber nama venue: revisi jadwal sementara penyelenggaraan PORPROV
            XIII Kalimantan Tengah di Kotawaringin Barat, 2–12 Oktober 2026.
            Koordinat pada peta adalah perkiraan di sekitar Pangkalan Bun karena
            tabel tidak mencantumkan alamat atau titik koordinat. Konfirmasi
            lokasi resmi kepada panitia sebelum berkunjung.
          </p>
          <p className="venue-map-attribution">
            Peta ©{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noreferrer"
            >
              OpenStreetMap contributors
            </a>
          </p>
        </section>

        <section className="cabor-cta">
          <div className="cabor-cta-inner">
            <p className="cabor-eyebrow">
              <span /> BERSAMA MENUJU PRESTASI
            </p>
            <h2>
              Sampai jumpa
              <br />
              <span>di arena.</span>
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
