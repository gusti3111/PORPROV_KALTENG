import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { useCompetitionStore } from "../stores/competitionStore";
import { SlidersHorizontal } from "lucide-react";

type ScheduleMode = "harian" | "kalender" | "live";
type ScheduleEvent = {
  date: string;
  time: string;
  sport: string;
  venue: string;
  title: string;
  status: string;
};

const modes: { id: ScheduleMode; label: string }[] = [
  { id: "harian", label: "Harian" },
  { id: "kalender", label: "Kalender" },
  { id: "live", label: "Live" },
];

function getScheduleDates(events: ScheduleEvent[]) {
  if (events.length === 0) return [];
  const sortedDates = events.map((event) => event.date).sort();
  const dates: string[] = [];
  const [startYear, startMonth, startDay] = sortedDates[0]
    .split("-")
    .map(Number);
  const [lastYear, lastMonth, lastDay] = sortedDates[sortedDates.length - 1]
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
  const matches = useCompetitionStore((state) => state.matches);
  const sports = useCompetitionStore((state) => state.sports);
  const venues = useCompetitionStore((state) => state.venues);
  const loading = useCompetitionStore((state) => state.loading.matches);
  const error = useCompetitionStore((state) => state.errors.matches);
  const sportsError = useCompetitionStore((state) => state.errors.sports);
  const venuesError = useCompetitionStore((state) => state.errors.venues);
  const fetchMatches = useCompetitionStore((state) => state.fetchMatches);
  const fetchSports = useCompetitionStore((state) => state.fetchSports);
  const fetchVenues = useCompetitionStore((state) => state.fetchVenues);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void fetchMatches();
    void fetchSports();
    void fetchVenues();
  }, [fetchMatches, fetchSports, fetchVenues]);

  const scheduleEvents = useMemo(
    () =>
      matches.map((match) => ({
        date: match.date,
        time: match.time,
        sport: match.sport_name,
        venue: match.venue_name,
        title: match.title,
        status: match.status,
      })),
    [matches],
  );
  const scheduleDates = useMemo(
    () => getScheduleDates(scheduleEvents),
    [scheduleEvents],
  );
  const firstScheduleDate = scheduleDates[0] ?? "";
  const lastScheduleDate = scheduleDates[scheduleDates.length - 1] ?? "";
  const modeParam = searchParams.get("tampilan");
  const mode: ScheduleMode = isScheduleMode(modeParam) ? modeParam : "harian";
  const requestedDate = searchParams.get("tanggal");
  const selectedDate = scheduleDates.includes(requestedDate ?? "")
    ? requestedDate!
    : firstScheduleDate || new Date().toISOString().slice(0, 10);
  const selectedSport = searchParams.get("cabor") ?? "";
  const selectedVenue = searchParams.get("venue") ?? "";

  const visibleEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id");
    return scheduleEvents.filter((event) => {
      const matchesDate =
        mode !== "harian" || event.date === selectedDate;
      const matchesMode = mode !== "live" || event.status === "ONGOING";
      const matchesSport = !selectedSport || event.sport === selectedSport;
      const matchesVenue = !selectedVenue || event.venue === selectedVenue;
      const matchesQuery =
        !normalizedQuery ||
        `${event.sport} ${event.venue} ${event.title}`
          .toLocaleLowerCase("id")
          .includes(normalizedQuery);
      return (
        matchesDate &&
        matchesMode &&
        matchesSport &&
        matchesVenue &&
        matchesQuery
      );
    });
  }, [mode, query, scheduleEvents, selectedDate, selectedSport, selectedVenue]);

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
    (new Date(`${firstScheduleDate || selectedDate}T00:00:00Z`).getUTCDay() +
      6) %
    7;

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
            <strong>Jadwal dari backend</strong>
            <span>
              Data seed yang digunakan saat ini adalah simulasi dan bukan
              jadwal resmi. Konfirmasi jadwal kepada panitia.
            </span>
          </div>
        </section>

        <section className="schedule-content section-wrap" aria-label="Jadwal">
          <Tabs
            value={mode}
            className="w-full"
            onValueChange={(value) => {
              if (isScheduleMode(value)) updateParams({ tampilan: value });
            }}
          >
            <TabsList aria-label="Tampilan jadwal" className="w-fit max-w-full">
              {modes.map((item) => (
                <TabsTrigger key={item.id} value={item.id} className="px-4">
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="schedule-toolbar">
            <Button
              variant="outline"
              size="lg"
              type="button"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((open) => !open)}
            >
              <SlidersHorizontal aria-hidden="true" />
              {filtersOpen ? "Sembunyikan filter" : "Tampilkan filter"}
            </Button>
            <label className="schedule-date-input">
              <span>Pilih tanggal</span>
              <Input
                type="date"
                min={firstScheduleDate}
                max={lastScheduleDate}
                value={selectedDate}
                onChange={(event) => {
                  if (scheduleDates.includes(event.target.value)) {
                    selectDate(event.target.value);
                  }
                }}
                className="w-auto"
              />
            </label>
          </div>

          <div className="schedule-day-strip" aria-label="Pilih hari pertandingan">
            {scheduleDates.map((date) => (
              <Button
                key={date}
                variant={selectedDate === date ? "default" : "outline"}
                className="h-auto min-h-20 min-w-16 flex-col gap-1 py-2"
                type="button"
                aria-pressed={selectedDate === date}
                onClick={() => selectDate(date)}
              >
                <span>{formatDate(date, { weekday: "short" })}</span>
                <strong>{formatDate(date, { day: "2-digit" })}</strong>
                <small>{formatDate(date, { month: "short" })}</small>
              </Button>
            ))}
          </div>

          {loading && <p role="status">Memuat jadwal pertandingan...</p>}
          {error && (
            <p role="alert">
              Gagal memuat jadwal: {error}{" "}
              <Button type="button" variant="outline" size="sm" onClick={() => void fetchMatches()}>
                Coba lagi
              </Button>
            </p>
          )}
          {(sportsError || venuesError) && (
            <p role="alert">
              Gagal memuat opsi filter: {[sportsError, venuesError]
                .filter(Boolean)
                .join("; ")}
              {sportsError && (
                <Button type="button" variant="outline" size="sm" onClick={() => void fetchSports()}>
                  Muat ulang cabang olahraga
                </Button>
              )}
              {venuesError && (
                <Button type="button" variant="outline" size="sm" onClick={() => void fetchVenues()}>
                  Muat ulang venue
                </Button>
              )}
            </p>
          )}

          {filtersOpen && (
            <div className="schedule-filters">
              <label>
                <span>Cari pertandingan atau lokasi</span>
                <Input
                  type="search"
                  placeholder="Ketik nama cabang atau venue..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <label>
                <span>Cabang olahraga</span>
                <Select
                  value={selectedSport || "all"}
                  onValueChange={(value) =>
                    updateParams({ cabor: value === "all" ? null : value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih cabang olahraga" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua cabang olahraga</SelectItem>
                  {sports.map((sport) => (
                    <SelectItem key={sport.name} value={sport.name}>
                      {sport.name}
                    </SelectItem>
                  ))}
                  </SelectContent>
                </Select>
              </label>
              <label>
                <span>Tempat</span>
                <Select
                  value={selectedVenue || "all"}
                  onValueChange={(value) =>
                    updateParams({ venue: value === "all" ? null : value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih tempat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua tempat</SelectItem>
                  {venues.map((venue) => (
                    <SelectItem key={venue.name} value={venue.name}>
                      {venue.name}
                    </SelectItem>
                  ))}
                  </SelectContent>
                </Select>
              </label>
            </div>
          )}

          {mode === "kalender" ? (
            <Card className="schedule-calendar gap-0 p-0">
              <div className="schedule-calendar-heading">
                <h2>
                  {firstScheduleDate
                    ? `${formatDate(firstScheduleDate, { month: "long" })} – ${formatDate(lastScheduleDate, { month: "long", year: "numeric" })}`
                    : "Belum ada jadwal"}
                </h2>
                <span>
                  {firstScheduleDate
                    ? `${formatDate(firstScheduleDate, { day: "numeric", month: "short" })} – ${formatDate(lastScheduleDate, { day: "numeric", month: "short" })}`
                    : "Jadwal belum tersedia"}
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
                  <Button
                    key={date}
                    type="button"
                    variant={selectedDate === date ? "default" : "outline"}
                    className="h-auto min-h-14 w-full flex-col gap-1"
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
                  </Button>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="schedule-results gap-0 p-0" aria-live="polite">
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
                        <span className="schedule-event-title">{event.title}</span>
                        <small>{event.venue}</small>
                      </div>
                      <Badge variant="secondary" className="schedule-event-badge">
                        {event.status}
                      </Badge>
                    </article>
                  ))}
                </div>
              ) : (
                <ScheduleEmptyState mode={mode} />
              )}
            </Card>
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
