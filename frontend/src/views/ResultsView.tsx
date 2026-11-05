import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { sports } from "../data/sports";

type ResultsTab = "matches" | "medals" | "sports";

type MatchResult = {
  date: string;
  sport: string;
  event: string;
  venue: string;
  home: string;
  homeScore: number;
  away: string;
  awayScore: number;
};

type MedalStanding = {
  contingent: string;
  gold: number;
  silver: number;
  bronze: number;
};

type SportMedalStanding = {
  sport: string;
  gold: number;
  silver: number;
  bronze: number;
};

const results: MatchResult[] = [
  {
    date: "2026-11-28",
    sport: "Bulutangkis",
    event: "Tunggal putra · Babak penyisihan",
    venue: "GOR KONI",
    home: "Kotawaringin Barat",
    homeScore: 2,
    away: "Kapuas",
    awayScore: 0,
  },
  {
    date: "2026-11-28",
    sport: "Basket",
    event: "Putra · Babak penyisihan",
    venue: "Sport Center",
    home: "Kota Palangka Raya",
    homeScore: 68,
    away: "Kotawaringin Timur",
    awayScore: 61,
  },
  {
    date: "2026-11-29",
    sport: "Pencak Silat",
    event: "Kelas tanding · Babak penyisihan",
    venue: "GOR KONI",
    home: "Kapuas",
    homeScore: 3,
    away: "Barito Selatan",
    awayScore: 1,
  },
  {
    date: "2026-11-29",
    sport: "Sepak Bola Mini",
    event: "Putra · Babak penyisihan",
    venue: "Stadion Sampuraga",
    home: "Lamandau",
    homeScore: 2,
    away: "Sukamara",
    awayScore: 2,
  },
  {
    date: "2026-11-30",
    sport: "Atletik",
    event: "Final · 100 meter putra",
    venue: "Stadion Atletik & Sport Center",
    home: "Kotawaringin Timur",
    homeScore: 1,
    away: "Kota Palangka Raya",
    awayScore: 2,
  },
  {
    date: "2026-11-30",
    sport: "Tenis Meja",
    event: "Beregu putri · Semifinal",
    venue: "Aula Dispora Kobar",
    home: "Barito Utara",
    homeScore: 3,
    away: "Seruyan",
    awayScore: 1,
  },
];

const medalStandings: MedalStanding[] = [
  { contingent: "Kota Palangka Raya", gold: 5, silver: 3, bronze: 4 },
  { contingent: "Kotawaringin Barat", gold: 4, silver: 5, bronze: 2 },
  { contingent: "Kotawaringin Timur", gold: 3, silver: 2, bronze: 5 },
  { contingent: "Kapuas", gold: 2, silver: 3, bronze: 3 },
  { contingent: "Barito Utara", gold: 2, silver: 1, bronze: 2 },
  { contingent: "Lamandau", gold: 1, silver: 2, bronze: 1 },
  { contingent: "Seruyan", gold: 1, silver: 1, bronze: 2 },
  { contingent: "Sukamara", gold: 0, silver: 2, bronze: 1 },
];

const sportMedalStandings: SportMedalStanding[] = [
  { sport: "Atletik", gold: 4, silver: 3, bronze: 2 },
  { sport: "Bulutangkis", gold: 3, silver: 4, bronze: 2 },
  { sport: "Aquatik", gold: 3, silver: 3, bronze: 5 },
  { sport: "Basket", gold: 2, silver: 2, bronze: 3 },
  { sport: "Pencak Silat", gold: 2, silver: 3, bronze: 3 },
  { sport: "Sepak Bola Mini", gold: 2, silver: 2, bronze: 2 },
  { sport: "Tenis Meja", gold: 2, silver: 2, bronze: 3 },
];

const resultDates = ["2026-11-28", "2026-11-29", "2026-11-30"];
const medalTotals = medalStandings.reduce(
  (totals, standing) => ({
    gold: totals.gold + standing.gold,
    silver: totals.silver + standing.silver,
    bronze: totals.bronze + standing.bronze,
  }),
  { gold: 0, silver: 0, bronze: 0 },
);
const totalMedals = medalTotals.gold + medalTotals.silver + medalTotals.bronze;

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
  const [activeTab, setActiveTab] = useState<ResultsTab>("matches");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [query, setQuery] = useState("");

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
  }, [query, selectedDate, selectedSport]);

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
          <div className="results-total" aria-label={`${totalMedals} medali simulasi`}>
            <div className="results-total-icon" aria-hidden="true">
              XIII
            </div>
            <div>
              <strong>{totalMedals}</strong>
              <span>medali tercatat</span>
            </div>
            <span className="results-simulation-badge">DATA SIMULASI</span>
          </div>
        </section>

        <section className="results-content section-wrap" aria-label="Rekap hasil">
          <div className="results-tabs" role="tablist" aria-label="Kategori hasil">
            <button
              id="results-tab-matches"
              type="button"
              role="tab"
              aria-selected={activeTab === "matches"}
              aria-controls="results-panel-matches"
              className={activeTab === "matches" ? "is-active" : ""}
              onClick={() => setActiveTab("matches")}
            >
              Hasil pertandingan
              <span>{results.length}</span>
            </button>
            <button
              id="results-tab-medals"
              type="button"
              role="tab"
              aria-selected={activeTab === "medals"}
              aria-controls="results-panel-medals"
              className={activeTab === "medals" ? "is-active" : ""}
              onClick={() => setActiveTab("medals")}
            >
              Perolehan medali per kontingen
            </button>
            <button
              id="results-tab-sports"
              type="button"
              role="tab"
              aria-selected={activeTab === "sports"}
              aria-controls="results-panel-sports"
              className={activeTab === "sports" ? "is-active" : ""}
              onClick={() => setActiveTab("sports")}
            >
              Perolehan medali per cabor
            </button>
          </div>

          <div className="results-demo-note" role="note">
            Contoh tampilan dengan data simulasi. Skor dan medali bukan hasil
            resmi penyelenggara.
          </div>

          {activeTab === "matches" ? (
            <div
              id="results-panel-matches"
              role="tabpanel"
              aria-labelledby="results-tab-matches"
            >
              <div className="results-filters">
                <label>
                  <span>Tanggal pertandingan</span>
                  <select
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                  >
                    <option value="">Semua tanggal</option>
                    {resultDates.map((date) => (
                      <option key={date} value={date}>
                        {formatDate(date, { weekday: "long" })}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Cabang olahraga</span>
                  <select
                    value={selectedSport}
                    onChange={(event) => setSelectedSport(event.target.value)}
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
                  <span>Cari pertandingan atau kontingen</span>
                  <input
                    type="search"
                    placeholder="Ketik nama pertandingan..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </label>
              </div>

              <div className="results-list" aria-live="polite">
                {visibleResults.length > 0 ? (
                  visibleResults.map((result) => {
                    const homeWon = result.homeScore > result.awayScore;
                    const awayWon = result.awayScore > result.homeScore;
                    return (
                      <article
                        className="result-card"
                        key={`${result.date}-${result.sport}-${result.event}`}
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
                          <span className="result-simulation-badge">
                            SIMULASI
                          </span>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="results-no-data">
                    Belum ada hasil yang sesuai dengan filter.
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === "medals" ? (
            <div
              id="results-panel-medals"
              role="tabpanel"
              aria-labelledby="results-tab-medals"
              className="medals-panel"
            >
              <div className="medal-totals" aria-label="Jumlah medali simulasi">
                <span>
                  <strong>{medalTotals.gold}</strong> Emas
                </span>
                <span>
                  <strong>{medalTotals.silver}</strong> Perak
                </span>
                <span>
                  <strong>{medalTotals.bronze}</strong> Perunggu
                </span>
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
                    {medalStandings.map((standing, index) => (
                      <tr key={standing.contingent}>
                        <td>{String(index + 1).padStart(2, "0")}</td>
                        <th scope="row">{standing.contingent}</th>
                        <td>{standing.gold}</td>
                        <td>{standing.silver}</td>
                        <td>{standing.bronze}</td>
                        <td>
                          {standing.gold + standing.silver + standing.bronze}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div
              id="results-panel-sports"
              role="tabpanel"
              aria-labelledby="results-tab-sports"
              className="medals-panel"
            >
              <div className="medal-sport-summary">
                <strong>{sportMedalStandings.length} cabang olahraga</strong>
                <span>Perolehan medali simulasi per cabang</span>
              </div>
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
                      <tr key={standing.sport}>
                        <th scope="row">{standing.sport}</th>
                        <td>{standing.gold}</td>
                        <td>{standing.silver}</td>
                        <td>{standing.bronze}</td>
                        <td>
                          {standing.gold + standing.silver + standing.bronze}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th scope="row">Total</th>
                      <td>
                        {sportMedalStandings.reduce(
                          (total, standing) => total + standing.gold,
                          0,
                        )}
                      </td>
                      <td>
                        {sportMedalStandings.reduce(
                          (total, standing) => total + standing.silver,
                          0,
                        )}
                      </td>
                      <td>
                        {sportMedalStandings.reduce(
                          (total, standing) => total + standing.bronze,
                          0,
                        )}
                      </td>
                      <td>
                        {sportMedalStandings.reduce(
                          (total, standing) =>
                            total +
                            standing.gold +
                            standing.silver +
                            standing.bronze,
                          0,
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
