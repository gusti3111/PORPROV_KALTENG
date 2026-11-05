import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { sports } from "../data/sports";
import { venues } from "../data/venues";

type ScheduleMode = "harian" | "kalender" | "live";
type ScheduleEvent = {
  date: string;
  time: string;
  sport: string;
  venue: string;
  title: string;
};

const scheduleEvents: ScheduleEvent[] = [
  {
    date: "2026-11-28",
    time: "08:00",
    sport: "Atletik",
    venue: "Stadion Atletik & Sport Center",
    title: "Simulasi — Babak penyisihan",
  },
  {
    date: "2026-11-28",
    time: "10:00",
    sport: "Bulutangkis",
    venue: "GOR KONI",
    title: "Simulasi — Babak penyisihan",
  },
  {
    date: "2026-11-28",
    time: "14:00",
    sport: "Aquatik",
    venue: "Kolam Renang",
    title: "Simulasi — Sesi pertandingan",
  },
  {
    date: "2026-11-29",
    time: "08:30",
    sport: "Panahan",
    venue: "Stadion Atletik & Sport Center",
    title: "Simulasi — Babak kualifikasi",
  },
  {
    date: "2026-11-29",
    time: "11:00",
    sport: "Pencak Silat",
    venue: "GOR KONI",
    title: "Simulasi — Babak penyisihan",
  },
  {
    date: "2026-11-29",
    time: "15:00",
    sport: "Basket",
    venue: "Sport Center",
    title: "Simulasi — Pertandingan penyisihan",
  },
  {
    date: "2026-11-30",
    time: "09:00",
    sport: "Bulutangkis",
    venue: "GOR KONI",
    title: "Simulasi — Babak perempat final",
  },
  {
    date: "2026-11-30",
    time: "13:00",
    sport: "Atletik",
    venue: "Stadion Atletik & Sport Center",
    title: "Simulasi — Final nomor lintasan",
  },
  {
    date: "2026-11-30",
    time: "16:00",
    sport: "Aquatik",
    venue: "Kolam Renang",
    title: "Simulasi — Final nomor renang",
  },
];

const firstScheduleDate = "2026-11-28";
const lastScheduleDate = "2026-12-09";
const modes: { id: ScheduleMode; label: string }[] = [
  { id: "harian", label: "Harian" },
  { id: "kalender", label: "Kalender" },
  { id: "live", label: "Live" },
];

function getScheduleDates() {
  const dates: string[] = [];
  const [startYear, startMonth, startDay] = firstScheduleDate
    .split("-")
    .map(Number);
  const [lastYear, lastMonth, lastDay] = lastScheduleDate
    .split("-")
    .map(Number);
  const current = new Date(Date.UTC(startYear, startMonth - 1, startDay));
  const last = new Date(Date.UTC(lastYear, lastMonth - 1, lastDay));

  while (current <= last) {
    dates.push(
      `${current.getUTCFullYear()}-${String(current.getUTCMonth() + 1).padStart(2, "0")}-${String(current.getUTCDate()).padStart(2, "0")}`,
    );
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}

const scheduleDates = getScheduleDates();

function formatDate(date: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("id-ID", {
    ...options,
    timeZone: "Asia/Jakarta",
  }).format(new Date(`${date}T12:00:00+07:00`));
}

function isScheduleMode(value: string | null): value is ScheduleMode {
  return modes.some((mode) => mode.id === value);
}

export default function ScheduleView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");
  const modeParam = searchParams.get("tampilan");
  const mode: ScheduleMode = isScheduleMode(modeParam) ? modeParam : "harian";
  const requestedDate = searchParams.get("tanggal");
  const selectedDate = scheduleDates.includes(requestedDate ?? "")
    ? requestedDate!
    : firstScheduleDate;
  const selectedSport = searchParams.get("cabor") ?? "";
  const selectedVenue = searchParams.get("venue") ?? "";

  const visibleEvents = useMemo(() => {
    if (mode === "live") return [];

    const normalizedQuery = query.trim().toLocaleLowerCase("id");
    return scheduleEvents.filter((event) => {
      const matchesDate = mode === "kalender" || event.date === selectedDate;
      const matchesSport = !selectedSport || event.sport === selectedSport;
      const matchesVenue = !selectedVenue || event.venue === selectedVenue;
      const matchesQuery =
        !normalizedQuery ||
        `${event.sport} ${event.venue} ${event.title}`
          .toLocaleLowerCase("id")
          .includes(normalizedQuery);
      return matchesDate && matchesSport && matchesVenue && matchesQuery;
    });
  }, [mode, query, selectedDate, selectedSport, selectedVenue]);

  function updateParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setSearchParams(next);
  }

  function selectDate(date: string) {
    updateParams({
      tanggal: date,
      tampilan: mode === "kalender" ? "harian" : mode,
    });
  }

  const firstWeekday =
    (new Date(`${firstScheduleDate}T12:00:00Z`).getUTCDay() + 6) % 7;

  return (
    <>
      <SiteHeader />

      <main className="schedule-page">
        <section className="schedule-intro section-wrap">
          <div className="schedule-breadcrumb">
            <Link to="/">Beranda</Link>
            <span aria-hidden="true">/</span>
            <span>Jadwal pertandingan</span>
          </div>
          <p className="schedule-eyebrow">
            <span aria-hidden="true" /> PANDUAN PERTANDINGAN
          </p>
          <h1>
            Jadwal <span>pertandingan.</span>
          </h1>
          <p className="schedule-description">
            Telusuri jadwal PORPROV XIII berdasarkan hari, cabang olahraga, dan
            tempat pertandingan.
          </p>
          <div className="schedule-source-note" role="note">
            <strong>Data simulasi — bukan jadwal resmi</strong>
            <span>
              Jam, cabang, dan venue berikut hanya contoh untuk pratinjau
              tampilan. Konfirmasi jadwal resmi kepada panitia.
            </span>
          </div>
        </section>

        <section className="schedule-content section-wrap" aria-label="Jadwal">
          <nav className="schedule-mode-tabs" aria-label="Tampilan jadwal">
            {modes.map((item) => (
              <button
                key={item.id}
                type="button"
                className={mode === item.id ? "is-active" : ""}
                aria-pressed={mode === item.id}
                onClick={() => updateParams({ tampilan: item.id })}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="schedule-toolbar">
            <button
              className="schedule-filter-toggle"
              type="button"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((open) => !open)}
            >
              <span aria-hidden="true">☷</span>
              {filtersOpen ? "Sembunyikan filter" : "Tampilkan filter"}
            </button>
            <label className="schedule-date-input">
              <span>Pilih tanggal</span>
              <input
                type="date"
                min={firstScheduleDate}
                max={lastScheduleDate}
                value={selectedDate}
                onChange={(event) => {
                  if (scheduleDates.includes(event.target.value)) {
                    selectDate(event.target.value);
                  }
                }}
              />
            </label>
          </div>

          <div className="schedule-day-strip" aria-label="Pilih hari pertandingan">
            {scheduleDates.map((date) => (
              <button
                key={date}
                className={selectedDate === date ? "is-active" : ""}
                type="button"
                aria-pressed={selectedDate === date}
                onClick={() => selectDate(date)}
              >
                <span>{formatDate(date, { weekday: "short" })}</span>
                <strong>{formatDate(date, { day: "2-digit" })}</strong>
                <small>{formatDate(date, { month: "short" })}</small>
              </button>
            ))}
          </div>

          {filtersOpen && (
            <div className="schedule-filters">
              <label>
                <span>Cari pertandingan atau lokasi</span>
                <input
                  type="search"
                  placeholder="Ketik nama cabang atau venue..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <label>
                <span>Cabang olahraga</span>
                <select
                  value={selectedSport}
                  onChange={(event) =>
                    updateParams({ cabor: event.target.value || null })
                  }
                >
                  <option value="">Semua cabang olahraga</option>
                  {sports.map((sport) => (
                    <option key={sport.name} value={sport.name}>
                      {sport.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Tempat</span>
                <select
                  value={selectedVenue}
                  onChange={(event) =>
                    updateParams({ venue: event.target.value || null })
                  }
                >
                  <option value="">Semua tempat</option>
                  {venues.map((venue) => (
                    <option key={venue.name} value={venue.name}>
                      {venue.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {mode === "kalender" ? (
            <div className="schedule-calendar">
              <div className="schedule-calendar-heading">
                <h2>
                  {formatDate(firstScheduleDate, { month: "long" })} –{" "}
                  {formatDate(lastScheduleDate, { month: "long", year: "numeric" })}
                </h2>
                <span>
                  {formatDate(firstScheduleDate, { day: "numeric", month: "short" })}{" "}
                  – {formatDate(lastScheduleDate, { day: "numeric", month: "short" })}
                </span>
              </div>
              <div className="schedule-calendar-grid">
                {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(
                  (day) => (
                    <span key={day} className="schedule-calendar-weekday">
                      {day}
                    </span>
                  ),
                )}
                {Array.from({ length: firstWeekday }, (_, index) => (
                  <span
                    key={`blank-${index}`}
                    className="schedule-calendar-blank"
                    aria-hidden="true"
                  />
                ))}
                {scheduleDates.map((date) => (
                  <button
                    key={date}
                    type="button"
                    className={selectedDate === date ? "is-active" : ""}
                    aria-label={formatDate(date, {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                    aria-pressed={selectedDate === date}
                    onClick={() => selectDate(date)}
                  >
                    <strong>{formatDate(date, { day: "numeric" })}</strong>
                    <small>{formatDate(date, { month: "short" })}</small>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <section className="schedule-results" aria-live="polite">
              <div className="schedule-results-heading">
                <div>
                  <p>{mode === "live" ? "PERTANDINGAN LANGSUNG" : "JADWAL HARIAN"}</p>
                  <h2>
                    {mode === "live"
                      ? "Belum ada pertandingan live"
                      : formatDate(selectedDate, {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                  </h2>
                </div>
                <span>
                  {mode === "live"
                    ? `${visibleEvents.length} pertandingan`
                    : `${visibleEvents.length} sesi`}
                </span>
              </div>
              {mode !== "live" && visibleEvents.length > 0 ? (
                <div className="schedule-event-list">
                  {visibleEvents.map((event) => (
                    <article
                      className="schedule-event-card"
                      key={`${event.date}-${event.time}-${event.sport}`}
                    >
                      <time>{event.time}</time>
                      <div>
                        <strong>{event.sport}</strong>
                        <span>{event.title}</span>
                        <small>{event.venue}</small>
                      </div>
                      <span className="schedule-event-badge">SIMULASI</span>
                    </article>
                  ))}
                </div>
              ) : (
                <ScheduleEmptyState mode={mode} />
              )}
            </section>
          )}
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

function ScheduleEmptyState({ mode }: { mode: ScheduleMode }) {
  return (
    <div className="schedule-empty">
      <span className="schedule-empty-icon" aria-hidden="true">
        {mode === "live" ? "◷" : "▤"}
      </span>
      <h3>
        {mode === "live"
          ? "Belum ada pertandingan berlangsung"
          : "Rincian jadwal belum tersedia"}
      </h3>
      <p>
        {mode === "live"
          ? "Data simulasi tidak menampilkan pertandingan live. Informasi live akan tersedia setelah data resmi terhubung."
          : "Tidak ada sesi simulasi yang cocok. Coba pilih tanggal atau filter yang lain."}
      </p>
    </div>
  );
}
