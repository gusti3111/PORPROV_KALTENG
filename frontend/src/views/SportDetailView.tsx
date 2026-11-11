import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import SportBracket from "../components/SportBracket";
import { getAPIData, getAPIErrorMessage } from "../api/client";
import type { SportTournament, SportTournamentStanding } from "../api/types";
import { getContingentLogoUrl } from "../utils/contingentLogo";
import { getSportEmblemInfo } from "../utils/sportEmblem";
import {
  formatGroupDisplayName,
  formatStandingPrimaryMetric,
  getSportScoringRule,
  type SportScoringRule,
} from "../utils/sportScoringConfig";

function standingsTable(
  groupName: string,
  standings: SportTournamentStanding[],
  rule: SportScoringRule,
) {
  const isTimeOrScore =
    rule.tableType === "TIME_LEADERBOARD" || rule.tableType === "SCORE_LEADERBOARD";
  const isRacketNoPoints = rule.mode === "GROUP_RACKET_2_0";
  const colSpan = isTimeOrScore ? 3 : isRacketNoPoints ? 5 : rule.allowDraw ? 7 : 6;

  return (
    <div className="sport-standings-group" key={groupName}>
      <h3>{formatGroupDisplayName(rule, groupName)}</h3>
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
                      {rule.mode === "SWISS_CHESS" ? "Remis" : "S"}
                    </th>
                  )}
                  <th scope="col">K</th>
                  <th scope="col">{rule.valueColumnLabel}</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {standings.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="text-center text-muted-foreground py-4">
                  {rule.tableType === "TIME_LEADERBOARD"
                    ? "Belum ada catatan waktu peserta yang diinput oleh Admin."
                    : rule.tableType === "SCORE_LEADERBOARD"
                      ? "Belum ada skor penilaian juri yang diinput oleh Admin."
                      : "Belum ada data klasemen grup yang diinput oleh Admin."}
                </td>
              </tr>
            ) : (
              standings.map((row) => {
                const logoUrl = getContingentLogoUrl(row.contingent, row.contingent_id);
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
              })
            )}
          </tbody>
        </table>
      </div>
      <p className="sport-table-legend">
        {rule.tableType === "TIME_LEADERBOARD"
          ? "Urutan peringkat berdasarkan Catatan Waktu Tercepat (detik)"
          : rule.tableType === "SCORE_LEADERBOARD"
            ? "Urutan peringkat berdasarkan Akumulasi Skor Juri / Nilai Tertinggi"
            : isRacketNoPoints
              ? "Urutan peringkat berdasarkan Jumlah Kemenangan (Menang - Kalah)"
              : rule.allowDraw
                ? `M: menang · ${rule.mode === "SWISS_CHESS" ? "Remis: hasil imbang" : "S: seri"} · K: kalah · ${rule.shortRule}`
                : `M: menang · K: kalah (Tanpa Seri) · ${rule.shortRule}`}
      </p>
    </div>
  );
}

export default function SportDetailView() {
  const { sportId } = useParams();
  const [tournament, setTournament] = useState<SportTournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const id = Number(sportId);
    setTournament(null);
    setError("");

    if (!Number.isInteger(id) || id < 1) {
      setLoading(false);
      setError("ID cabang olahraga tidak valid.");
      return () => {
        active = false;
      };
    }

    setLoading(true);
    void getAPIData<SportTournament>(`/sports/${id}/tournament`)
      .then((data) => {
        if (active) setTournament(data);
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
  }, [sportId]);

  return (
    <>
      <SiteHeader />
      <main className="sport-detail-page">
        {loading ? (
          <section className="sport-detail-not-found" role="status">
            <span>PORPROV XIII</span>
            <h1>Memuat data turnamen...</h1>
          </section>
        ) : !tournament ? (
          <section className="sport-detail-not-found" role={error ? "alert" : undefined}>
            <span>{error ? "DATA BELUM TERSEDIA" : "404"}</span>
            <h1>{error ? "Klasemen belum dapat dimuat" : "Cabang belum tersedia"}</h1>
            <p>{error || "Belum ada data turnamen untuk cabang olahraga ini."}</p>
            <Link to="/cabor">Kembali ke daftar cabang</Link>
          </section>
        ) : (
          <div className="sport-detail-wrap">
            {(() => {
              const rule = getSportScoringRule(
                tournament.sport_id,
                tournament.sport_name,
              );
              const emblem = getSportEmblemInfo(
                tournament.sport_id,
                tournament.sport_name,
              );
              return (
                <>
                  <Link className="sport-detail-back" to="/cabor">
                    <span aria-hidden="true">←</span> Semua cabang olahraga
                  </Link>

                  <header className="sport-detail-hero">
                    <p>
                      <span>PORPROV XIII</span> · KALIMANTAN TENGAH 2026
                      {emblem ? (
                        <>
                          {" "}
                          ·{" "}
                          <span>
                            {emblem.federationCode} ({emblem.federationName.toUpperCase()})
                          </span>
                        </>
                      ) : null}{" "}
                      · <span>{rule.badgeLabel.toUpperCase()}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-3.5">
                      {emblem && (
                        <div className="inline-flex items-center gap-2.5">
                          <span
                            className="inline-grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-emerald-900/15 bg-white p-1.5 shadow-sm"
                            title={`Logo Resmi ${emblem.federationCode} (${emblem.federationName})`}
                          >
                            <img
                              src={emblem.emblemUrl}
                              alt={`Logo Resmi ${emblem.federationCode} - ${tournament.sport_name}`}
                              className="h-12 w-12 object-contain"
                            />
                          </span>
                          <span
                            className="inline-grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-emerald-900/15 bg-gradient-to-br from-emerald-50 to-emerald-100/80 p-2.5 shadow-sm"
                            title={`Simbol Cabang Olahraga ${tournament.sport_name}`}
                          >
                            <img
                              src={emblem.pictogramUrl}
                              alt={`Piktogram ${tournament.sport_name}`}
                              className="h-8 w-8 object-contain"
                            />
                          </span>
                        </div>
                      )}
                      <h1>{tournament.sport_name}</h1>
                    </div>
                    <p className="sport-detail-description">
                      {rule.description}
                    </p>
                  </header>

                  {rule.tableType !== "KNOCKOUT_ONLY" && (
                    <section
                      className="sport-detail-section"
                      aria-labelledby="sport-standings-title"
                    >
                      <div className="sport-detail-section-heading">
                        <div>
                          <p>
                            {rule.tableType === "TIME_LEADERBOARD"
                              ? "BABAK KUALIFIKASI / HEAT WAKTU"
                              : rule.tableType === "SCORE_LEADERBOARD"
                                ? "BABAK KUALIFIKASI / PENILAIAN JURI"
                                : "FASE GRUP"}
                          </p>
                          <h2 id="sport-standings-title">
                            {rule.tableType === "TIME_LEADERBOARD" ? (
                              <>
                                Klasemen <span>waktu tercepat.</span>
                              </>
                            ) : rule.tableType === "SCORE_LEADERBOARD" ? (
                              <>
                                Klasemen <span>skor lomba.</span>
                              </>
                            ) : (
                              <>
                                Klasemen <span>sementara.</span>
                              </>
                            )}
                          </h2>
                        </div>
                        <span className="sport-detail-meta">
                          {tournament.groups.length} {rule.groupLabel.toUpperCase()} ·{" "}
                          {tournament.groups.reduce(
                            (total, group) => total + group.standings.length,
                            0,
                          )}{" "}
                          KONTINGEN
                        </span>
                      </div>
                      <div className="sport-standings-grid">
                        {tournament.groups.map((group) =>
                          standingsTable(group.name, group.standings, rule),
                        )}
                      </div>
                    </section>
                  )}

                  <section
                    className="sport-detail-section sport-bracket-section"
                    aria-labelledby="sport-bracket-title"
                  >
                    <div className="sport-detail-section-heading">
                      <div>
                        <p>FASE GUGUR</p>
                        <h2 id="sport-bracket-title">
                          Bagan <span>penyisihan.</span>
                        </h2>
                      </div>
                      <span className="sport-detail-meta">
                        PEREMPAT FINAL · SEMIFINAL · FINAL · PERINGKAT 3
                      </span>
                    </div>
                    <SportBracket tournament={tournament} />
                  </section>
                </>
              );
            })()}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
