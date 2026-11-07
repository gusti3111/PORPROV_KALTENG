import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { useCompetitionStore } from "../stores/competitionStore";

type ResultsTab = "matches" | "medals" | "sports";

type MatchResult = {
  date: string;
  sport: string;
  event: string;
  venue: string;
  home: string;
  homeScore: string;
  homeWinner: boolean;
  away: string;
  awayScore: string;
  awayWinner: boolean;
};

type MedalType = "gold" | "silver" | "bronze";

const medalLabels: Record<MedalType, string> = {
  gold: "emas",
  silver: "perak",
  bronze: "perunggu",
};

function MedalCircle({
  count,
  type,
}: {
  count: number;
  type: MedalType;
}) {
  return (
    <span
      className={`medal-circle medal-circle-${type}`}
      aria-label={`${count} medali ${medalLabels[type]}`}
    >
      {count}
    </span>
  );
}

function formatDate(date: string, options: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
    ...options,
  }).format(new Date(`${date}T12:00:00+07:00`));
}

export default function ResultsView() {
  const matches = useCompetitionStore((state) => state.matches);
  const sports = useCompetitionStore((state) => state.sports);
  const medalStandings = useCompetitionStore((state) => state.medalStandings);
  const sportMedalStandings = useCompetitionStore(
    (state) => state.sportMedalStandings,
  );
  const loadingMatches = useCompetitionStore(
    (state) => state.loading.matches,
  );
  const loadingMedals = useCompetitionStore((state) => state.loading.medals);
  const loadingSportMedals = useCompetitionStore(
    (state) => state.loading.sportMedals,
  );
  const matchesError = useCompetitionStore((state) => state.errors.matches);
  const sportsError = useCompetitionStore((state) => state.errors.sports);
  const medalsError = useCompetitionStore((state) => state.errors.medals);
  const sportMedalsError = useCompetitionStore(
    (state) => state.errors.sportMedals,
  );
  const fetchMatches = useCompetitionStore((state) => state.fetchMatches);
  const fetchSports = useCompetitionStore((state) => state.fetchSports);
  const fetchMedalStandings = useCompetitionStore(
    (state) => state.fetchMedalStandings,
  );
  const fetchSportMedalStandings = useCompetitionStore(
    (state) => state.fetchSportMedalStandings,
  );
  const [activeTab, setActiveTab] = useState<ResultsTab>("matches");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    void fetchMatches();
    void fetchSports();
    void fetchMedalStandings();
    void fetchSportMedalStandings();
  }, [
    fetchMatches,
    fetchMedalStandings,
    fetchSportMedalStandings,
    fetchSports,
  ]);

  const results = useMemo<MatchResult[]>(
    () =>
      matches
        .filter(
          (match) =>
            match.status === "FINISHED" && match.participants.length > 0,
        )
        .map((match) => {
          const home = match.participants[0];
          const away = match.participants[1];
          return {
            date: match.date,
            sport: match.sport_name,
            event: match.event_name,
            venue: match.venue_name,
            home: home.contingent_name,
            homeScore: home.score,
            homeWinner: home.is_winner,
            away: away?.contingent_name ?? "Belum ditentukan",
            awayScore: away?.score ?? "—",
            awayWinner: away?.is_winner ?? false,
          };
        }),
    [matches],
  );
  const resultDates = useMemo(
    () => [...new Set(results.map((result) => result.date))].sort(),
    [results],
  );
  const medalTotals = useMemo(
    () =>
      medalStandings.reduce(
        (totals, standing) => ({
          gold: totals.gold + standing.gold,
          silver: totals.silver + standing.silver,
          bronze: totals.bronze + standing.bronze,
        }),
        { gold: 0, silver: 0, bronze: 0 },
      ),
    [medalStandings],
  );
  const totalMedals =
    medalTotals.gold + medalTotals.silver + medalTotals.bronze;

  const visibleResults = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id");
    return results.filter((result) => {
      const matchesDate = !selectedDate || result.date === selectedDate;
      const matchesSport = !selectedSport || result.sport === selectedSport;
      const matchesQuery =
        !normalizedQuery ||
        `${result.sport} ${result.event} ${result.venue} ${result.home} ${result.away}`
          .toLocaleLowerCase("id")
          .includes(normalizedQuery);
      return matchesDate && matchesSport && matchesQuery;
    });
  }, [query, results, selectedDate, selectedSport]);

  return (
    <>
      <SiteHeader />

      <main className="results-page">
        <section className="results-hero section-wrap">
          <div className="schedule-breadcrumb">
            <Link to="/">Beranda</Link>
            <span aria-hidden="true">/</span>
            <span>Hasil pertandingan</span>
          </div>
          <p className="schedule-eyebrow">
            <span aria-hidden="true" /> REKAP PERTANDINGAN
          </p>
          <h1>
            Hasil <span>pertandingan.</span>
          </h1>
          <p className="schedule-description">
            Rekap hasil pertandingan dan perolehan medali PORPROV XIII
            Kalimantan Tengah.
          </p>
          <Card className="results-total flex-row" aria-label={`${totalMedals} medali`}>
            <div className="results-total-icon" aria-hidden="true">
              XIII
            </div>
            <div>
              <strong>{totalMedals}</strong>
              <span>medali tercatat</span>
            </div>
            <Badge variant="secondary" className="results-simulation-badge">
              DARI BACKEND
            </Badge>
          </Card>
        </section>

        <section className="results-content section-wrap" aria-label="Rekap hasil">
          <Tabs
            value={activeTab}
            className="w-full"
            onValueChange={(value) => {
              if (value === "matches" || value === "medals" || value === "sports") {
                setActiveTab(value);
              }
            }}
          >
          <TabsList
            variant="line"
            className="results-tabs"
            aria-label="Kategori hasil"
          >
            <TabsTrigger
              id="results-tab-matches"
              aria-controls="results-panel-matches"
              value="matches"
            >
              Hasil pertandingan
              <Badge variant="secondary">{results.length}</Badge>
            </TabsTrigger>
            <TabsTrigger
              id="results-tab-medals"
              aria-controls="results-panel-medals"
              value="medals"
            >
              Perolehan medali per kontingen
            </TabsTrigger>
            <TabsTrigger
              id="results-tab-sports"
              aria-controls="results-panel-sports"
              value="sports"
            >
              Perolehan medali per cabor
            </TabsTrigger>
          </TabsList>

          <div className="results-demo-note" role="note">
            Data diambil dari backend. Seed yang tersedia saat ini adalah data
            simulasi dan bukan hasil resmi penyelenggara.
          </div>

          {(matchesError || sportsError || medalsError || sportMedalsError) && (
            <div className="results-demo-note" role="alert">
              Gagal memuat sebagian data:{" "}
              {[matchesError, sportsError, medalsError, sportMedalsError]
                .filter(Boolean)
                .join("; ")}
              {matchesError && (
                <Button type="button" variant="outline" size="sm" onClick={() => void fetchMatches()}>
                  Muat ulang pertandingan
                </Button>
              )}
              {medalsError && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void fetchMedalStandings()}
                >
                  Muat ulang medali kontingen
                </Button>
              )}
              {sportsError && (
                <Button type="button" variant="outline" size="sm" onClick={() => void fetchSports()}>
                  Muat ulang cabang olahraga
                </Button>
              )}
              {sportMedalsError && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void fetchSportMedalStandings()}
                >
                  Muat ulang medali cabor
                </Button>
              )}
            </div>
          )}

          {activeTab === "matches" ? (
            <TabsContent value="matches" id="results-panel-matches">
              <div className="results-filters">
                <label>
                  <span>Tanggal pertandingan</span>
                  <Select
                    value={selectedDate || "all"}
                    onValueChange={(value) =>
                      setSelectedDate(value && value !== "all" ? value : "")
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih tanggal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua tanggal</SelectItem>
                    {resultDates.map((date) => (
                      <SelectItem key={date} value={date}>
                        {formatDate(date, { weekday: "long" })}
                      </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
                </label>
                <label>
                  <span>Cabang olahraga</span>
                  <Select
                    value={selectedSport || "all"}
                    onValueChange={(value) =>
                      setSelectedSport(value && value !== "all" ? value : "")
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
                  <span>Cari pertandingan atau kontingen</span>
                  <Input
                    type="search"
                    placeholder="Ketik nama pertandingan..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </label>
              </div>

              <Card className="results-list gap-0 p-0" aria-live="polite">
                {loadingMatches ? (
                  <p role="status">Memuat hasil pertandingan...</p>
                ) : visibleResults.length > 0 ? (
                  visibleResults.map((result) => {
                    const homeWon = result.homeWinner;
                    const awayWon = result.awayWinner;
                    return (
                      <Card
                        className="result-card"
                        key={`${result.date}-${result.sport}-${result.event}`}
                        role="article"
                      >
                        <div className="result-card-heading">
                          <div>
                            <span className="result-sport-tag">
                              {result.sport}
                            </span>
                            <h2>{result.event}</h2>
                          </div>
                          <time dateTime={result.date}>
                            {formatDate(result.date, {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                          </time>
                        </div>
                        <div className="result-scoreboard">
                          <strong className={homeWon ? "is-winner" : ""}>
                            {result.home}
                          </strong>
                          <span className={homeWon ? "is-winner" : ""}>
                            {result.homeScore}
                          </span>
                          <small>VS</small>
                          <span className={awayWon ? "is-winner" : ""}>
                            {result.awayScore}
                          </span>
                          <strong className={awayWon ? "is-winner" : ""}>
                            {result.away}
                          </strong>
                        </div>
                        <div className="result-card-footer">
                          <span>{result.venue}</span>
                          <Badge variant="secondary" className="result-simulation-badge">
                            DATA SIMULASI
                          </Badge>
                        </div>
                      </Card>
                    );
                  })
                ) : (
                  <div className="results-no-data">
                    Belum ada hasil yang sesuai dengan filter.
                  </div>
                )}
              </Card>
            </TabsContent>
          ) : activeTab === "medals" ? (
            <TabsContent
              value="medals"
              id="results-panel-medals"
              className="medals-panel"
            >
              {loadingMedals ? (
                <p role="status">Memuat klasemen medali...</p>
              ) : (
                <>
                  <div className="medal-totals" aria-label="Jumlah medali">
                    <div className="medal-total-item">
                      <MedalCircle count={medalTotals.gold} type="gold" />
                      <span>Emas</span>
                    </div>
                    <div className="medal-total-item">
                      <MedalCircle count={medalTotals.silver} type="silver" />
                      <span>Perak</span>
                    </div>
                    <div className="medal-total-item">
                      <MedalCircle count={medalTotals.bronze} type="bronze" />
                      <span>Perunggu</span>
                    </div>
                  </div>
                  <div className="medal-table-wrap">
                    <table className="medal-table">
                      <thead>
                        <tr>
                          <th scope="col">Peringkat</th>
                          <th scope="col">Kontingen</th>
                          <th scope="col">Emas</th>
                          <th scope="col">Perak</th>
                          <th scope="col">Perunggu</th>
                          <th scope="col">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medalStandings.map((standing) => (
                          <tr key={standing.contingent_id}>
                            <td>{String(standing.rank).padStart(2, "0")}</td>
                            <th scope="row">{standing.contingent_name}</th>
                            <td>
                              <MedalCircle
                                count={standing.gold}
                                type="gold"
                              />
                            </td>
                            <td>
                              <MedalCircle
                                count={standing.silver}
                                type="silver"
                              />
                            </td>
                            <td>
                              <MedalCircle
                                count={standing.bronze}
                                type="bronze"
                              />
                            </td>
                            <td>{standing.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </TabsContent>
          ) : (
            <TabsContent
              value="sports"
              id="results-panel-sports"
              className="medals-panel"
            >
              <div className="medal-sport-summary">
                <strong>{sportMedalStandings.length} cabang olahraga</strong>
                <span>Perolehan medali dari backend per cabang</span>
              </div>
              {loadingSportMedals ? (
                <p role="status">Memuat medali per cabang olahraga...</p>
              ) : (
                <div className="medal-table-wrap">
                  <table className="medal-table">
                    <thead>
                      <tr>
                        <th scope="col">Cabang olahraga</th>
                        <th scope="col">Emas</th>
                        <th scope="col">Perak</th>
                        <th scope="col">Perunggu</th>
                        <th scope="col">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sportMedalStandings.map((standing) => (
                        <tr key={standing.sport_id}>
                          <th scope="row">{standing.sport}</th>
                          <td>
                            <MedalCircle count={standing.gold} type="gold" />
                          </td>
                          <td>
                            <MedalCircle
                              count={standing.silver}
                              type="silver"
                            />
                          </td>
                          <td>
                            <MedalCircle
                              count={standing.bronze}
                              type="bronze"
                            />
                          </td>
                          <td>{standing.total}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th scope="row">Total</th>
                        <td>
                          <MedalCircle
                            count={sportMedalStandings.reduce(
                              (total, standing) => total + standing.gold,
                              0,
                            )}
                            type="gold"
                          />
                        </td>
                        <td>
                          <MedalCircle
                            count={sportMedalStandings.reduce(
                              (total, standing) => total + standing.silver,
                              0,
                            )}
                            type="silver"
                          />
                        </td>
                        <td>
                          <MedalCircle
                            count={sportMedalStandings.reduce(
                              (total, standing) => total + standing.bronze,
                              0,
                            )}
                            type="bronze"
                          />
                        </td>
                        <td>
                          {sportMedalStandings.reduce(
                            (total, standing) => total + standing.total,
                            0,
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </TabsContent>
          )}
          </Tabs>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
