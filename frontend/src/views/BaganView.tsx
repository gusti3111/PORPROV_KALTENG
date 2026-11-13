import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import SportBracket from "../components/SportBracket";
import { getAPIData, getAPIErrorMessage } from "../api/client";
import type { Sport, SportTournament } from "../api/types";
import { getContingentLogoUrl } from "../utils/contingentLogo";
import {
  formatGroupDisplayName,
  formatStandingPrimaryMetric,
  getSportScoringRule,
} from "../utils/sportScoringConfig";

type BracketEntry = {
  id: number;
  tournament: SportTournament;
  hasActiveData: boolean;
};

function hasActiveTournamentData(tournament: SportTournament): boolean {
  const hasGroupStandings = tournament.groups.some(
    (g) => g.standings && g.standings.length > 0,
  );
  const hasQuarterfinals = (tournament.quarterfinals ?? []).some(
    (m) =>
      (m.home && m.home !== "TBA") ||
      (m.away && m.away !== "TBA") ||
      m.home_score !== null ||
      m.away_score !== null,
  );
  const hasSemifinals = tournament.semifinals.some(
    (m) =>
      (m.home && m.home !== "TBA") ||
      (m.away && m.away !== "TBA") ||
      m.home_score !== null ||
      m.away_score !== null,
  );
  const hasFinal =
    (Boolean(tournament.final.home) && tournament.final.home !== "TBA") ||
    (Boolean(tournament.final.away) && tournament.final.away !== "TBA") ||
    tournament.final.home_score !== null ||
    tournament.final.away_score !== null;

  return hasGroupStandings || hasQuarterfinals || hasSemifinals || hasFinal;
}

export default function BaganView() {
  const [entries, setEntries] = useState<BracketEntry[]>([]);
  const [query, setQuery] = useState("");
  const [onlyUpdated, setOnlyUpdated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    void getAPIData<Sport[]>("/sports")
      .then((sports) =>
        Promise.all(
          sports.map(async (sport) => {
            const tournament = await getAPIData<SportTournament>(
              `/sports/${sport.id}/tournament`,
            );
            return {
              id: sport.id,
              tournament,
              hasActiveData: hasActiveTournamentData(tournament),
            };
          }),
        ),
      )
      .then((data) => {
        if (!active) return;
        const sorted = [...data].sort((a, b) => {
          if (a.hasActiveData !== b.hasActiveData) {
            return a.hasActiveData ? -1 : 1;
          }
          return a.id - b.id;
        });
        setEntries(sorted);
      })
      .catch((requestError: unknown) => {
        if (active) setError(getAPIErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const updatedCount = useMemo(
    () => entries.filter((e) => e.hasActiveData).length,
    [entries],
  );

  const visibleEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id");
    return entries.filter(({ tournament, hasActiveData }) => {
      if (onlyUpdated && !hasActiveData) return false;
      if (!normalizedQuery) return true;

      const searchableText = [
        tournament.sport_name,
        ...tournament.groups.flatMap((group) => [
          group.name,
          ...group.standings.map((standing) => standing.contingent),
        ]),
        ...(tournament.quarterfinals ?? []).flatMap((m) => [m.label, m.home, m.away]),
        ...tournament.semifinals.flatMap((match) => [match.label, match.home, match.away]),
        tournament.final.home,
        tournament.final.away,
      ]
        .join(" ")
        .toLocaleLowerCase("id");
      return searchableText.includes(normalizedQuery);
    });
  }, [entries, query, onlyUpdated]);

  return (
    <>
      <SiteHeader />
      <main className="bagan-page">
        <section className="bagan-page-hero">
          <div className="bagan-page-hero-inner">
            <p><span /> PORPROV XIII · KALIMANTAN TENGAH 2026</p>
            <h1>Bagan <span>pertandingan.</span></h1>
            <p className="bagan-page-description">
              Cari cabang olahraga dan ikuti alur pertandingan dari semifinal menuju final.
            </p>
          </div>
          <img
            className="bagan-page-hero-illustration"
            src="/keraBagan.png"
            alt="Maskot PORPROV menunjuk papan bagan pertandingan"
          />
        </section>

        <section className="bagan-main" aria-label="Daftar bagan pertandingan">
          <div className="bagan-search">
            <Search aria-hidden="true" />
            <label className="sr-only" htmlFor="bagan-search-input">Cari cabang olahraga atau kontingen</label>
            <Input
              id="bagan-search-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari cabor atau kontingen..."
              type="search"
              className="h-11 border-0 px-0 shadow-none focus-visible:ring-0"
            />
            {query && (
              <button className="bagan-search-clear" type="button" onClick={() => setQuery("")}>
                Hapus
              </button>
            )}
          </div>

          <div className="bagan-count" aria-live="polite">
            <span>
              {loading
                ? "MEMUAT BAGAN DARI DATABASE..."
                : `${visibleEntries.length} CABANG OLAHRAGA DITAMPILKAN · ${updatedCount} TERUPDATE DARI ADMIN`}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setOnlyUpdated(false)}
                className={`rounded-full px-3 py-1 2xl:px-4 2xl:py-1.5 min-[2560px]:px-5 min-[2560px]:py-2 text-xs 2xl:text-sm min-[2560px]:text-base font-bold transition ${!onlyUpdated
                    ? "bg-emerald-700 text-white"
                    : "bg-slate-200/70 text-slate-700 hover:bg-slate-300/70"
                  }`}
              >
                Semua ({entries.length})
              </button>
              <button
                type="button"
                onClick={() => setOnlyUpdated(true)}
                className={`rounded-full px-3 py-1 2xl:px-4 2xl:py-1.5 min-[2560px]:px-5 min-[2560px]:py-2 text-xs 2xl:text-sm min-[2560px]:text-base font-bold transition ${onlyUpdated
                    ? "bg-emerald-700 text-white"
                    : "bg-slate-200/70 text-slate-700 hover:bg-slate-300/70"
                  }`}
              >
                Terupdate Admin ({updatedCount})
              </button>
            </div>
          </div>

          {error && <p className="bagan-state" role="alert">Bagan belum dapat dimuat: {error}</p>}
          {loading && <p className="bagan-state" role="status">Memuat daftar bagan pertandingan...</p>}
          {!loading && !error && visibleEntries.length === 0 && (
            <p className="bagan-state" role="status">
              {onlyUpdated
                ? "Belum ada bagan yang diupdate oleh Admin untuk filter ini."
                : `Tidak ada bagan yang cocok dengan “${query}”.`}
            </p>
          )}

          {!loading && !error && visibleEntries.length > 0 && (
            <div className="bagan-event-list">
              {visibleEntries.map(({ id, tournament, hasActiveData }, index) => {
                const rule = getSportScoringRule(id, tournament.sport_name);
                const isTimeOrScore =
                  rule.tableType === "TIME_LEADERBOARD" ||
                  rule.tableType === "SCORE_LEADERBOARD";
                const isRacketNoPoints = rule.mode === "GROUP_RACKET_2_0";
                const activeGroups =
                  rule.tableType === "KNOCKOUT_ONLY"
                    ? []
                    : tournament.groups.filter(
                      (g) => g.standings && g.standings.length > 0,
                    );
                return (
                  <article className="bagan-event-card" key={id}>
                    <header className="bagan-event-heading">
                      <div className="bagan-event-title">
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <div>
                          <p className="flex flex-wrap items-center gap-2">
                            <span>{tournament.sport_name.toLocaleUpperCase("id")}</span>
                            <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-slate-700">
                              {rule.badgeLabel.toUpperCase()}
                            </span>
                            {hasActiveData && (
                              <span className="rounded-full bg-emerald-600/15 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-emerald-700">
                                TERUPDATE ADMIN
                              </span>
                            )}
                          </p>
                          <h2>
                            {rule.tableType === "KNOCKOUT_ONLY"
                              ? `Bagan Gugur ${tournament.sport_name}`
                              : rule.tableType === "TIME_LEADERBOARD"
                                ? `Catatan Waktu & Bagan ${tournament.sport_name}`
                                : rule.tableType === "SCORE_LEADERBOARD"
                                  ? `Papan Skor & Bagan ${tournament.sport_name}`
                                  : `Bagan & Klasemen ${tournament.sport_name}`}
                          </h2>
                        </div>
                      </div>
                      <Link to={`/cabor/${id}`}>
                        Detail klasemen cabor <ArrowUpRight aria-hidden="true" />
                      </Link>
                    </header>

                    {activeGroups.length > 0 && (
                      <div className="sport-standings-grid mb-6">
                        {activeGroups.map((group) => (
                          <div className="sport-standings-group" key={group.name}>
                            <h3>
                              Klasemen {formatGroupDisplayName(rule, group.name)}
                            </h3>
                            <div className="sport-standings-scroll">
                              <table className="sport-standings-table">
                                <thead>
                                  <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Kontingen</th>
                                    {isTimeOrScore ? (
                                      <th scope="col">{rule.valueColumnLabel}</th>
                                    ) : isRacketNoPoints ? (
                                      <>
                                        <th scope="col">Main</th>
                                        <th scope="col">Menang</th>
                                        <th scope="col">Kalah</th>
                                      </>
                                    ) : (
                                      <>
                                        <th scope="col">Main</th>
                                        <th scope="col">M</th>
                                        {rule.allowDraw && (
                                          <th scope="col">
                                            {rule.mode === "SWISS_CHESS"
                                              ? "Remis"
                                              : "S"}
                                          </th>
                                        )}
                                        <th scope="col">K</th>
                                        <th scope="col">{rule.valueColumnLabel}</th>
                                      </>
                                    )}
                                  </tr>
                                </thead>
                                <tbody>
                                  {group.standings.map((row) => {
                                    const logoUrl = getContingentLogoUrl(
                                      row.contingent,
                                      row.contingent_id,
                                    );
                                    return (
                                      <tr key={row.contingent}>
                                        <td>{String(row.rank).padStart(2, "0")}</td>
                                        <th scope="row">
                                          <span className="inline-flex items-center gap-2">
                                            {logoUrl && (
                                              <img
                                                src={logoUrl}
                                                alt={`Logo ${row.contingent}`}
                                                className="h-5 w-5 xl:h-6 xl:w-6 2xl:h-8 2xl:w-8 min-[2560px]:h-10 min-[2560px]:w-10 min-[3400px]:h-12 min-[3400px]:w-12 shrink-0 object-contain"
                                                loading="lazy"
                                              />
                                            )}
                                            <span>{row.contingent}</span>
                                          </span>
                                        </th>
                                        {isTimeOrScore ? (
                                          <td className="sport-points">
                                            {formatStandingPrimaryMetric(rule, row)}
                                          </td>
                                        ) : isRacketNoPoints ? (
                                          <>
                                            <td>{row.played}</td>
                                            <td className="sport-points">{row.won}</td>
                                            <td>{row.lost}</td>
                                          </>
                                        ) : (
                                          <>
                                            <td>{row.played}</td>
                                            <td>{row.won}</td>
                                            {rule.allowDraw && <td>{row.drawn}</td>}
                                            <td>{row.lost}</td>
                                            <td className="sport-points">{row.points}</td>
                                          </>
                                        )}
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <SportBracket tournament={tournament} />
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
