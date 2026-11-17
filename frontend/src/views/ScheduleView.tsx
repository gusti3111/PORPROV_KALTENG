import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { useCompetitionStore } from "../stores/competitionStore";
import { isGroupPhaseNonHeadToHeadMatch } from "../utils/sportScoringConfig";
import { formatParticipantName } from "../utils/participantDisplay";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

const AGENDA_EVENT_PATTERN =
  /upacara|pembukaan|penutupan|kepulangan|technical\s*meeting|manager\s*meeting|penyegaran\s*wasit|\bopening\b|\bclosing\b/i;

const CEREMONY_EVENT_PATTERN =
  /upacara|pembukaan|penutupan|kepulangan|\bopening\b|\bclosing\b/i;

function isAgendaOnlyEvent(event: {
  eventName?: string;
  title?: string;
  roundName?: string;
  participantsSummary?: string;
}): boolean {
  if (event.participantsSummary) return false;
  const text = `${event.eventName || ""} ${event.title || ""} ${event.roundName || ""}`;
  return AGENDA_EVENT_PATTERN.test(text);
}

type ScheduleEvent = {
  id: string;
  date: string;
  time: string;
  sport: string;
  eventName: string;
  roundName: string;
  venue: string;
  title: string;
  status: string;
  liveStreamUrl?: string;
  participantsSummary?: string;
};


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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dayStripRef = useRef<HTMLDivElement>(null);

  const scrollDayStrip = (direction: -1 | 1) => {
    const strip = dayStripRef.current;
    if (!strip) return;
    strip.scrollBy({
      left: direction * Math.max(220, strip.clientWidth * 0.65),
      behavior: "smooth",
    });
  };

  useEffect(() => {
    void fetchMatches();
    void fetchSports();
    void fetchVenues();
  }, [fetchMatches, fetchSports, fetchVenues]);

  const scheduleEvents = useMemo(
    () =>
      matches.map((match) => {
        const parts = match.participants ?? [];
        const p0 = parts[0];
        const p1 = parts[1];
        const nonHeadToHead = isGroupPhaseNonHeadToHeadMatch(
          match.sport_id,
          match.sport_name,
          match.round_name,
          match.title,
        );
        const participantsSummary =
          parts.length === 0
            ? undefined
            : nonHeadToHead || parts.length > 2
              ? parts
                .map((p) => `${formatParticipantName(p)}${p.score ? ` (${p.score})` : ""}`)
                .join(" • ")
              : parts.length === 2 && p0 && p1
                ? `${formatParticipantName(p0)}${p0.score ? ` (${p0.score})` : ""} vs ${formatParticipantName(p1)}${p1.score ? ` (${p1.score})` : ""}`
                : `${formatParticipantName(p0)}${p0.score ? ` (${p0.score})` : ""}`;
        return {
          id: match.id,
          date: match.date,
          time: match.time,
          sport: match.sport_name,
          eventName: match.event_name,
          roundName: match.round_name,
          venue: match.venue_name,
          title: match.title,
          status: match.status,
          liveStreamUrl: match.live_stream_url,
          participantsSummary,
        };
      }),
    [matches],
  );
  const scheduleDates = useMemo(
    () => getScheduleDates(scheduleEvents),
    [scheduleEvents],
  );
  const firstScheduleDate = scheduleDates[0] ?? "";
  const requestedDate = searchParams.get("tanggal");
  const selectedSport = searchParams.get("cabor") ?? "";
  const selectedVenue = searchParams.get("venue") ?? "";
  const todayJakarta = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  }).format(new Date());
  const filteredFirstDate = useMemo(() => {
    if (!selectedSport && !selectedVenue) return firstScheduleDate;
    const dates = getScheduleDates(
      scheduleEvents.filter(
        (ev) =>
          (!selectedSport || ev.sport === selectedSport) &&
          (!selectedVenue || ev.venue === selectedVenue),
      ),
    );
    return dates[0] ?? firstScheduleDate;
  }, [firstScheduleDate, scheduleEvents, selectedSport, selectedVenue]);
  const selectedDate = requestedDate || filteredFirstDate || todayJakarta;

  useEffect(() => {
    const strip = dayStripRef.current;
    if (!strip || !selectedDate) return;
    const activeBtn = strip.querySelector<HTMLButtonElement>(
      `button[data-date="${selectedDate}"]`,
    );
    activeBtn?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [selectedDate, scheduleDates.length]);

  const visibleEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id");
    return scheduleEvents.filter((event) => {
      const matchesDate = event.date === selectedDate;
      const matchesSport = !selectedSport || event.sport === selectedSport;
      const matchesVenue = !selectedVenue || event.venue === selectedVenue;
      const matchesQuery =
        !normalizedQuery ||
        `${event.sport} ${event.venue} ${event.title}`
          .toLocaleLowerCase("id")
          .includes(normalizedQuery);
      return (
        matchesDate &&
        matchesSport &&
        matchesVenue &&
        matchesQuery
      );
    });
  }, [query, scheduleEvents, selectedDate, selectedSport, selectedVenue]);

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
    });
  }

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
            Lihat semua pertandingan pada tanggal pilihan, termasuk status live dan hasil yang sudah selesai.
          </p>
          <img
            className="schedule-hero-illustration"
            src="/keraWak.png"
            alt="Maskot PORPROV memegang stopwatch"
          />

        </section>

        <section className="schedule-content section-wrap" aria-label="Jadwal">
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
                value={selectedDate}
                onChange={(event) => {
                  if (event.target.value) {
                    selectDate(event.target.value);
                  }
                }}
                className="w-auto"
              />
            </label>
          </div>

          <div className="flex items-center gap-2">
            {scheduleDates.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full"
                aria-label="Geser tanggal ke kiri"
                onClick={() => scrollDayStrip(-1)}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
            <div
              ref={dayStripRef}
              className="schedule-day-strip flex-1 min-w-0 scroll-smooth"
              aria-label="Pilih hari pertandingan"
            >
              {scheduleDates.map((date) => (
                <Button
                  key={date}
                  data-date={date}
                  variant={selectedDate === date ? "default" : "outline"}
                  className="h-auto min-h-20 min-w-16 shrink-0 flex-col gap-1 py-2"
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
            {scheduleDates.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full"
                aria-label="Geser tanggal ke kanan"
                onClick={() => scrollDayStrip(1)}
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
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
                  onValueChange={(value) => {
                    if (!value || value === "all") {
                      updateParams({ cabor: null });
                      return;
                    }
                    const sportDates = getScheduleDates(
                      scheduleEvents.filter(
                        (ev) =>
                          ev.sport === value &&
                          (!selectedVenue || ev.venue === selectedVenue),
                      ),
                    );
                    const nextDate = sportDates.includes(selectedDate)
                      ? selectedDate
                      : sportDates[0] ?? null;
                    updateParams({
                      cabor: value,
                      ...(nextDate ? { tanggal: nextDate } : {}),
                    });
                  }}
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
                  onValueChange={(value) => {
                    if (!value || value === "all") {
                      updateParams({ venue: null });
                      return;
                    }
                    const venueDates = getScheduleDates(
                      scheduleEvents.filter(
                        (ev) =>
                          ev.venue === value &&
                          (!selectedSport || ev.sport === selectedSport),
                      ),
                    );
                    const nextDate = venueDates.includes(selectedDate)
                      ? selectedDate
                      : venueDates[0] ?? null;
                    updateParams({
                      venue: value,
                      ...(nextDate ? { tanggal: nextDate } : {}),
                    });
                  }}
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

          <Card className="schedule-results gap-0 p-0" aria-live="polite">
            <div className="schedule-results-heading">
              <div>
                <p>SEMUA PERTANDINGAN</p>
                <h2>
                  {formatDate(selectedDate, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
              </div>
              <span>
                {visibleEvents.length} pertandingan
              </span>
            </div>
            {visibleEvents.length > 0 ? (
              <div className="schedule-event-list">
                {visibleEvents.map((event) => {
                  const isOngoing = event.status === "ONGOING";
                  const isAgenda = isAgendaOnlyEvent(event);
                  const isCeremony =
                    isAgenda &&
                    CEREMONY_EVENT_PATTERN.test(
                      `${event.eventName || ""} ${event.title || ""} ${event.roundName || ""}`,
                    );
                  const liveStreamHref =
                    event.liveStreamUrl?.trim() ||
                    `https://www.youtube.com/results?search_query=${encodeURIComponent(
                      `PORPROV XIII Kalimantan Tengah ${isCeremony ? event.title : event.sport} Live`,
                    )}`;
                  const handleCardActivate = () => {
                    if (isOngoing) {
                      window.open(liveStreamHref, "_blank", "noopener,noreferrer");
                    } else if (isAgenda) {
                      navigate(`/venue?venue=${encodeURIComponent(event.venue)}`);
                    } else {
                      navigate(`/hasil?cabor=${encodeURIComponent(event.sport)}`);
                    }
                  };
                  return (
                    <article
                      className="schedule-event-card cursor-pointer"
                      key={event.id}
                      role="link"
                      tabIndex={0}
                      aria-label={
                        isOngoing
                          ? `Tonton live YouTube: ${event.title}`
                          : isAgenda
                            ? `Lihat lokasi ${event.venue}: ${event.title}`
                            : `Lihat hasil pertandingan ${event.sport}: ${event.title}`
                      }
                      onClick={handleCardActivate}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleCardActivate();
                        }
                      }}
                    >
                      <time>
                        {!event.time ||
                          event.time === "00:00" ||
                          event.time === "00:00 WIB"
                          ? "Menyusul"
                          : event.time}
                      </time>
                      <div>
                        <strong>
                          {isCeremony ? "Agenda Resmi PORPROV XIII" : event.sport}
                          {event.roundName ? ` · ${event.roundName}` : ""}
                        </strong>
                        <span className="schedule-event-title">
                          {event.eventName && event.eventName !== event.title
                            ? `${event.eventName} — `
                            : ""}
                          {event.title || "-"}
                        </span>
                        {event.participantsSummary && (
                          <small className="font-semibold text-foreground">
                            {event.participantsSummary}
                          </small>
                        )}
                        <small>{event.venue}</small>
                        {isOngoing ? (
                          <span className="schedule-live-link" aria-hidden="true">
                            Tonton live di YouTube
                          </span>
                        ) : isAgenda ? (
                          <span className="text-xs text-primary font-medium mt-0.5 inline-block" aria-hidden="true">
                            Agenda acara · Lihat lokasi venue →
                          </span>
                        ) : (
                          <span className="text-xs text-primary font-medium mt-0.5 inline-block" aria-hidden="true">
                            Lihat hasil pertandingan {event.sport} →
                          </span>
                        )}
                      </div>
                      <Badge variant="secondary" className={`schedule-event-badge schedule-status-${event.status.toLowerCase()}`}>
                        {statusLabel(event.status)}
                      </Badge>
                    </article>
                  );
                })}
              </div>
            ) : (
              <ScheduleEmptyState />
            )}
          </Card>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

function statusLabel(status: string) {
  if (status === "ONGOING") return "ONGOING";
  if (status === "FINISHED") return "Finished";
  if (status === "SCHEDULED") return "Terjadwal";
  if (status === "POSTPONED") return "Ditunda";
  if (status === "CANCELLED") return "Dibatalkan";
  return status;
}

function ScheduleEmptyState() {
  return (
    <div className="schedule-empty">
      <span className="schedule-empty-icon" aria-hidden="true">–</span>
      <h3>Belum ada pertandingan pada tanggal ini</h3>
      <p>Pilih tanggal lain atau ubah filter cabang olahraga dan venue.</p>
    </div>
  );
}
