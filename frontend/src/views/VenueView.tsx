import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ArrowIcon from "../components/ArrowIcon";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import VenueMap from "../components/VenueMap";
import { useCompetitionStore } from "../stores/competitionStore";
import { getVenuePhotoUrl } from "../utils/venuePhoto";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("id");
}

export default function VenueView() {
  const [searchParams] = useSearchParams();
  const venueParam = searchParams.get("venue");
  const venues = useCompetitionStore((state) => state.venues);
  const loading = useCompetitionStore((state) => state.loading.venues);
  const error = useCompetitionStore((state) => state.errors.venues);
  const fetchVenues = useCompetitionStore((state) => state.fetchVenues);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Record<number, boolean>>({});
  const mapFrameRef = useRef<HTMLDivElement>(null);

  const scrollToMap = () => {
    requestAnimationFrame(() => {
      mapFrameRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  };

  useEffect(() => {
    void fetchVenues();
  }, [fetchVenues]);

  const displayVenues = venues;

  const categories = useMemo(
    () => [...new Set(displayVenues.map((venue) => venue.category))].sort(),
    [displayVenues],
  );

  const filteredVenues = useMemo(() => {
    const normalizedQuery = normalizeText(query.trim());
    return displayVenues.filter((venue) => {
      const matchesQuery =
        !normalizedQuery ||
        normalizeText(
          `${venue.name} ${venue.category} ${venue.address} ${venue.note}`,
        ).includes(normalizedQuery);
      return matchesQuery && (!category || venue.category === category);
    });
  }, [category, displayVenues, query]);

  const selectedVenue =
    filteredVenues.find((venue) => venue.name === selectedName) ?? null;

  useEffect(() => {
    if (!venueParam || displayVenues.length === 0) return;
    const target = normalizeText(venueParam);
    const matched =
      displayVenues.find((venue) => normalizeText(venue.name) === target) ??
      (target.includes("gor") && target.includes("sport center")
        ? displayVenues.find((venue) => {
          const n = normalizeText(venue.name);
          return n.includes("gor") && n.includes("sport center");
        })
        : undefined);
    if (matched) {
      setQuery("");
      setCategory("");
      setSelectedName(matched.name);
      scrollToMap();
    }
  }, [displayVenues, venueParam]);

  useEffect(() => {
    if (selectedName && !displayVenues.some((venue) => venue.name === selectedName)) {
      setSelectedName(null);
    }
  }, [displayVenues, selectedName]);

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
          <img
            className="venue-hero-illustration"
            src="/stadionKera.webp"
            alt="Maskot PORPROV berdiri di atas ilustrasi stadion"
          />
          <div className="cabor-hero-number" aria-hidden="true">
            XIII
          </div>
          <div className="cabor-hero-footer">
            <span>KOTAWARINGIN BARAT • KALIMANTAN TENGAH</span>
            <span>LOKASI PENYELENGGARAAN</span>
          </div>
        </section>

        <section className="cabor-content section-wrap" aria-label="Venue pertandingan">
          <div className="cabor-section-heading">
            <div>
              <p className="cabor-section-kicker">
                <span>01</span> JELAJAHI LOKASI
              </p>
              <h2>
                Venue
                <br />
                <span>pertandingan.</span>
              </h2>
            </div>
            <p className="cabor-intro">
              Daftar seluruh arena dan venue resmi PORPROV XIII Kalimantan Tengah.
              Klik salah satu kartu untuk langsung melihat titik lokasinya di peta.
            </p>
          </div>

          <div className="cabor-count" aria-live="polite">
            <span>DAFTAR VENUE RESMI PORPROV XIII</span>
            <span>
              {String(displayVenues.length).padStart(2, "0")} VENUE TERDAFTAR
            </span>
          </div>

          {loading && <p className="venue-carousel-status" role="status">Memuat venue...</p>}
          {error && (
            <p className="venue-carousel-status" role="alert">
              Venue belum dapat dimuat dari backend: {error}{" "}
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
          {!loading && !error && displayVenues.length > 0 && (
            <div className="cabor-grid">
              {displayVenues.map((venue, index) => {
                const fallbackLocalPhoto = getVenuePhotoUrl(
                  venue.name,
                  `${venue.category} ${venue.note || ""}`,
                );
                const photoUrl = venue.image_url?.trim() || fallbackLocalPhoto;
                const isFailed = Boolean(failedImageIds[venue.id]);
                const isSelected = selectedName === venue.name;

                return (
                  <button
                    key={venue.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setQuery("");
                      setCategory("");
                      setSelectedName(venue.name);
                      scrollToMap();
                    }}
                    className={`cabor-card text-left cursor-pointer min-w-0${isSelected ? " ring-2 ring-[var(--green)]" : ""}`}
                  >
                    <div className="relative h-40 w-full overflow-hidden rounded-lg mb-3 bg-slate-100 shrink-0">
                      {!photoUrl || isFailed ? (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 p-3 text-center text-xs font-medium text-slate-400">
                          <MapPin className="mb-1 h-5 w-5 shrink-0 text-slate-300" aria-hidden="true" />
                          <span>Foto belum tersedia</span>
                        </div>
                      ) : (
                        <img
                          src={photoUrl}
                          alt={venue.name}
                          className="block h-full w-full object-cover object-center transition-transform duration-300 hover:scale-105"
                          loading="lazy"
                          onError={() => {
                            setFailedImageIds((prev) => ({
                              ...prev,
                              [venue.id]: true,
                            }));
                          }}
                        />
                      )}
                      <span className="shrink-0 absolute top-2 left-2 text-[10px] font-bold text-white bg-black/65 backdrop-blur-xs px-2 py-0.5 rounded">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="shrink-0 absolute top-2 right-2 text-white bg-black/65 backdrop-blur-xs p-1 rounded-full">
                        <MapPin className="h-3 w-3" aria-hidden="true" />
                      </span>
                    </div>

                    <div className="cabor-card-info min-w-0">
                      <span className="cabor-category min-w-0 truncate">
                        {venue.category}
                      </span>
                      <h3 className="min-w-0 break-words line-clamp-2">
                        {venue.name}
                      </h3>
                      <p className="min-w-0 break-words line-clamp-2">
                        {venue.note || venue.address || "Lokasi pertandingan PORPROV XIII"}
                      </p>
                    </div>

                    <div className="cabor-card-bottom">
                      <span>LIHAT DI PETA</span>
                      <ArrowIcon diagonal />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section id="daftar-venue" className="cabor-content section-wrap">
          <div className="cabor-section-heading">
            <div>
              <p className="cabor-section-kicker">
                <span>02</span> LOKASI PERTANDINGAN
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
                      onClick={() => {
                        setSelectedName(venue.name);
                        scrollToMap();
                      }}
                    >
                      <span className="venue-list-number shrink-0">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="venue-list-copy min-w-0 flex-1">
                        <strong className="min-w-0 break-words line-clamp-1">{venue.name}</strong>
                        <small className="min-w-0 break-words line-clamp-2">{venue.note || venue.address || venue.category}</small>
                      </span>
                      <span className="venue-list-arrow shrink-0" aria-hidden="true">
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
              containerRef={mapFrameRef}
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
