import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import VenueMap from "../components/VenueMap";
import { useCompetitionStore } from "../stores/competitionStore";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("id");
}

export default function VenueView() {
  const venues = useCompetitionStore((state) => state.venues);
  const loading = useCompetitionStore((state) => state.loading.venues);
  const error = useCompetitionStore((state) => state.errors.venues);
  const fetchVenues = useCompetitionStore((state) => state.fetchVenues);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [selectedName, setSelectedName] = useState<string | null>(null);

  useEffect(() => {
    void fetchVenues();
  }, [fetchVenues]);

  const categories = useMemo(
    () => [...new Set(venues.map((venue) => venue.category))].sort(),
    [venues],
  );

  const filteredVenues = useMemo(() => {
    const normalizedQuery = normalizeText(query.trim());
    return venues.filter((venue) => {
      const matchesQuery =
        !normalizedQuery ||
        normalizeText(
          `${venue.name} ${venue.category} ${venue.address} ${venue.note}`,
        ).includes(normalizedQuery);
      return matchesQuery && (!category || venue.category === category);
    });
  }, [category, query, venues]);

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
                <Input
                  id="venue-search-input"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  autoComplete="off"
                  placeholder="Cari venue atau lokasi..."
                  type="search"
                  className="h-10 border-0 px-0 shadow-none focus-visible:ring-0"
                />
                {query && (
                  <Button
                    className="cabor-search-clear"
                    variant="ghost"
                    size="sm"
                    type="button"
                    aria-label="Hapus pencarian"
                    onClick={() => setQuery("")}
                  >
                    Hapus
                  </Button>
                )}
              </form>

              <label className="venue-filter-label" htmlFor="venue-category">
                Filter kategori venue
              </label>
              <Select
                value={category || "__all"}
                onValueChange={(value) =>
                  setCategory(value && value !== "__all" ? value : "")
                }
              >
                <SelectTrigger
                  id="venue-category"
                  className="mx-4 mb-3 h-10 w-[calc(100%-2rem)]"
                >
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Semua kategori</SelectItem>
                  {categories.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {loading && (
                <p role="status">Memuat daftar venue dari backend...</p>
              )}
              {error && (
                <p role="alert">
                  Gagal memuat venue: {error}{" "}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void fetchVenues()}
                  >
                    Coba lagi
                  </Button>
                </p>
              )}
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
                    <Button
                      key={venue.name}
                      className={`venue-list-item${isSelected ? " is-selected" : ""}`}
                      variant="ghost"
                      size="lg"
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
                    </Button>
                  );
                })}
                {!loading && !error && filteredVenues.length === 0 && (
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
            Data venue dimuat dari backend. Konfirmasi alamat dan koordinat
            resmi kepada panitia sebelum berkunjung.
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
