import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import SportBracket from "../components/SportBracket";
import { getAPIData, getAPIErrorMessage } from "../api/client";
import type { Sport, SportTournament } from "../api/types";
import { useCompetitionStore } from "../stores/competitionStore";
import { getContingentLogoUrl } from "../utils/contingentLogo";
import { formatParticipantName } from "../utils/participantDisplay";
import { normalizeTournamentData } from "../utils/tournamentNormalizer";
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

function hasScopeData(scope: {
  groups: SportTournament["groups"];
  quarterfinals?: SportTournament["quarterfinals"];
  semifinals: SportTournament["semifinals"];
  final: SportTournament["final"];
}): boolean {
  const hasGroupStandings = scope.groups.some(
    (g) => g.standings && g.standings.length > 0,
  );
  const hasQuarterfinals = (scope.quarterfinals ?? []).some(
    (m) =>
      (m.home && m.home !== "TBA") ||
      (m.away && m.away !== "TBA") ||
      m.home_score !== null ||
      m.away_score !== null,
  );
  const hasSemifinals = scope.semifinals.some(
    (m) =>
      (m.home && m.home !== "TBA") ||
      (m.away && m.away !== "TBA") ||
      m.home_score !== null ||
      m.away_score !== null,
  );
  const hasFinal =
    (Boolean(scope.final.home) && scope.final.home !== "TBA") ||
    (Boolean(scope.final.away) && scope.final.away !== "TBA") ||
    scope.final.home_score !== null ||
    scope.final.away_score !== null;

  return hasGroupStandings || hasQuarterfinals || hasSemifinals || hasFinal;
}

function hasActiveTournamentData(tournament: SportTournament): boolean {
  if (tournament.divisions && tournament.divisions.length > 0) {
    return tournament.divisions.some((div) => hasScopeData(div));
  }
  return hasScopeData(tournament);
}

export default function BaganView() {
  const matches = useCompetitionStore((state) => state.matches);
  const fetchMatches = useCompetitionStore((state) => state.fetchMatches);
  const [entries, setEntries] = useState<BracketEntry[]>([]);
  const [query, setQuery] = useState("");
  const [onlyUpdated, setOnlyUpdated] = useState(false);
  const [selectedDivisionBySport, setSelectedDivisionBySport] = useState<
    Record<number, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetchMatches();
  }, [fetchMatches]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    void getAPIData<Sport[]>("/sports")
      .then(async (sports) => {
        const results = await Promise.allSettled(
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
        );

        const loaded: BracketEntry[] = [];
        let firstNonNotFoundError: unknown = null;

        results.forEach((res, idx) => {
          const sport = sports[idx];
          if (res.status === "fulfilled") {
            loaded.push(res.value);
            return;
          }
          const msg = getAPIErrorMessage(res.reason).toLowerCase();
          if (!msg.includes("not found") && !firstNonNotFoundError) {
            firstNonNotFoundError = res.reason;
          }
          loaded.push({
            id: sport.id,
            tournament: {
              sport_id: sport.id,
              sport_name: sport.name,
              groups: [],
              quarterfinals: [],
              semifinals: [],
              final: {
                label: "Final Perebutan Emas",
                home: "TBA",
                away: "TBA",
                home_score: null,
                away_score: null,
                status: "SCHEDULED",
              },
              bronze: {
                label: "Perebutan Perunggu",
                home: "TBA",
                away: "TBA",
                home_score: null,
                away_score: null,
                status: "SCHEDULED",
              },
            },
            hasActiveData: false,
          });
        });

        if (loaded.every((e) => !e.hasActiveData) && firstNonNotFoundError) {
          throw firstNonNotFoundError;
        }
        return loaded;
      })
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

  const normalizedEntries = useMemo(
    () =>
      entries.map((entry) => {
        const normalized = normalizeTournamentData(entry.tournament, matches);
        return {
          ...entry,
          tournament: normalized,
          hasActiveData: hasActiveTournamentData(normalized),
        };
      }),
    [entries, matches],
  );

  const updatedCount = useMemo(
    () => normalizedEntries.filter((e) => e.hasActiveData).length,
    [normalizedEntries],
  );

  const visibleEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id");
    return normalizedEntries.filter(({ tournament, hasActiveData }) => {
      if (onlyUpdated && !hasActiveData) return false;
      if (!normalizedQuery) return true;

      const allGroups =
        tournament.divisions && tournament.divisions.length > 0
          ? tournament.divisions.flatMap((d) => d.groups)
          : tournament.groups;

      const allBracketMatches =
        tournament.divisions && tournament.divisions.length > 0
          ? tournament.divisions.flatMap((d) => [
              ...(d.quarterfinals ?? []),
              ...d.semifinals,
              d.final,
              d.bronze,
            ])
          : [
              ...(tournament.quarterfinals ?? []),
              ...tournament.semifinals,
              tournament.final,
              tournament.bronze,
            ];

      const searchableText = [
        tournament.sport_name,
        ...allGroups.flatMap((group) => [
          group.name,
          ...group.standings.map((standing) =>
            formatParticipantName({
              athlete_name: standing.athlete_name,
              contingent_name: standing.contingent,
            }),
          ),
        ]),
        ...allBracketMatches.flatMap((match) => [
          match.label,
          match.home,
          match.away,
        ]),
      ]
        .join(" ")
        .toLocaleLowerCase("id");
      return searchableText.includes(normalizedQuery);
    });
  }, [normalizedEntries, query, onlyUpdated]);

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
            src="/keraBagan.webp"
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
                const divisions = tournament.divisions ?? [];
                const activeDivision =
                  divisions.length > 0
                    ? divisions.find(
                        (d) => d.division === selectedDivisionBySport[id],
                      ) ?? divisions[0]
                    : null;
                const scopedGroups = activeDivision
                  ? activeDivision.groups
                  : tournament.groups;
                const activeGroups = scopedGroups.filter(
                  (g) => g.standings && g.standings.length > 0,
                );
                const bracketTournament: SportTournament = activeDivision
                  ? {
                      ...tournament,
                      groups: activeDivision.groups,
                      quarterfinals: activeDivision.quarterfinals,
                      semifinals: activeDivision.semifinals,
                      final: activeDivision.final,
                      bronze: activeDivision.bronze,
                      third_place: activeDivision.third_place,
                    }
                  : tournament;
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

                    {divisions.length > 0 && (
                      <div
                        className="mb-4 flex flex-wrap items-center gap-2"
                        role="tablist"
                        aria-label={`Pilih divisi ${tournament.sport_name}`}
                      >
                        {divisions.map((div) => {
                          const isActive = activeDivision?.division === div.division;
                          const label =
                            div.label || (div.division === "Men" ? "Putra" : "Putri");
                          return (
                            <button
                              key={div.division}
                              type="button"
                              role="tab"
                              aria-selected={isActive}
                              onClick={() =>
                                setSelectedDivisionBySport((prev) => ({
                                  ...prev,
                                  [id]: div.division,
                                }))
                              }
                              className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold tracking-wide transition-colors ${
                                isActive
                                  ? "bg-[var(--green)] text-white shadow-xs"
                                  : "border border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-foreground)] hover:border-[var(--green)]"
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {activeGroups.length > 0 && (
                      <div className="sport-standings-grid mb-6">
                        {activeGroups.map((group) => (
                          <div className="sport-standings-group" key={group.name}>
                            <h3>
                              Klasemen {formatGroupDisplayName(rule, group.name, activeGroups.length)}
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
                                  {group.standings.map((row, rowIndex) => {
                                    const logoUrl = getContingentLogoUrl(
                                      row.contingent,
                                      row.contingent_id,
                                    );
                                    return (
                                      <tr
                                        key={`${row.contingent_id ?? row.contingent}-${row.athlete_name ?? ""}-${rowIndex}`}
                                      >
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
                                            <span>
                                              {formatParticipantName({
                                                athlete_name: row.athlete_name,
                                                contingent_name: row.contingent,
                                              })}
                                            </span>
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

                    <SportBracket tournament={bracketTournament} />
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
