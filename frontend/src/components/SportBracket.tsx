import { ArrowRight } from "lucide-react";
import type { SportTournament, SportTournamentMatch } from "../api/types";
import { getContingentLogoUrl } from "../utils/contingentLogo";

function getOutcome(match: SportTournamentMatch) {
  const hasWinner =
    match.status === "FINISHED" &&
    match.home_score !== null &&
    match.away_score !== null &&
    match.home_score !== match.away_score;

  if (!hasWinner) {
    return {
      winner: `Pemenang ${match.label.toLocaleLowerCase("id")}`,
      loser: `Kalah ${match.label.toLocaleLowerCase("id")}`,
      winnerIsHome: true,
    };
  }

  const winnerIsHome = match.home_score! > match.away_score!;
  return {
    winner: winnerIsHome ? match.home : match.away,
    loser: winnerIsHome ? match.away : match.home,
    winnerIsHome,
  };
}

function matchCard(match: SportTournamentMatch) {
  const homeWon =
    match.home_score !== null &&
    match.away_score !== null &&
    match.home_score > match.away_score;
  const awayWon =
    match.home_score !== null &&
    match.away_score !== null &&
    match.away_score > match.home_score;
  const statusLabel =
    match.status === "FINISHED"
      ? "Selesai"
      : match.status === "ONGOING"
        ? "Berlangsung"
        : "Akan bertanding";

  const homeLogo = getContingentLogoUrl(match.home);
  const awayLogo = getContingentLogoUrl(match.away);

  return (
    <article className="sport-bracket-match" key={match.label}>
      <div className="sport-bracket-match-heading">
        <span>{match.label}</span>
        <small className={match.status === "FINISHED" ? "is-finished" : "is-upcoming"}>
          {statusLabel}
        </small>
      </div>
      <div className={`sport-bracket-team${homeWon ? " winner-highlight" : ""}`}>
        <strong className="inline-flex items-center gap-2 min-w-0">
          {homeLogo && (
            <img
              src={homeLogo}
              alt={`Logo ${match.home}`}
              className="h-5 w-5 shrink-0 object-contain"
              loading="lazy"
            />
          )}
          <span className="truncate">
            {match.home || "Menunggu peserta"}
            {homeWon ? " 🏆" : ""}
          </span>
        </strong>
        <span>{match.home_score ?? "–"}</span>
      </div>
      <div className={`sport-bracket-team${awayWon ? " winner-highlight" : ""}`}>
        <strong className="inline-flex items-center gap-2 min-w-0">
          {awayLogo && (
            <img
              src={awayLogo}
              alt={`Logo ${match.away}`}
              className="h-5 w-5 shrink-0 object-contain"
              loading="lazy"
            />
          )}
          <span className="truncate">
            {match.away || "Menunggu peserta"}
            {awayWon ? " 🏆" : ""}
          </span>
        </strong>
        <span>{match.away_score ?? "–"}</span>
      </div>
    </article>
  );
}

export default function SportBracket({ tournament }: { tournament: SportTournament }) {
  const quarterfinals = tournament.quarterfinals ?? [];
  const outcomes = tournament.semifinals.map(getOutcome);
  const bracketHeight = 260;
  const sourceCenters = [
    outcomes[0]?.winnerIsHome ? 98 : 128,
    outcomes[1]?.winnerIsHome ? 199 : 229,
  ];
  const finalTargetCenter = (winner: string, index: number) =>
    winner === tournament.final.home
      ? 105
      : winner === tournament.final.away
        ? 134
        : index === 0
          ? 105
          : 134;
  const markerID = `bracket-arrow-${tournament.sport_id}`;

  return (
    <div className="sport-bracket-tree">
      {quarterfinals.length > 0 && (
        <section
          className="sport-bracket-third mb-5"
          aria-label="Babak Perempat Final"
        >
          <div className="w-full">
            <h3 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Babak Perempat Final (Penyisihan 8 Besar)
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {quarterfinals.map((match) => matchCard(match))}
            </div>
          </div>
        </section>
      )}

      <div className="sport-bracket-knockout">
        <div className="sport-bracket-semifinals">
          <h3>Semifinal</h3>
          <div className="sport-bracket-semifinal-matches">
            {tournament.semifinals.map((match) => matchCard(match))}
          </div>
        </div>

        <svg
          className="sport-bracket-connectors"
          viewBox={`0 0 100 ${bracketHeight}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <marker
              id={markerID}
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L6,3 L0,6 z" fill="currentColor" />
            </marker>
          </defs>
          <path
            d={`M0 ${sourceCenters[0]} H32 V${finalTargetCenter(outcomes[0]?.winner ?? "", 0)} H96`}
            markerEnd={`url(#${markerID})`}
          />
          <path
            d={`M0 ${sourceCenters[1]} H48 V${finalTargetCenter(outcomes[1]?.winner ?? "", 1)} H96`}
            markerEnd={`url(#${markerID})`}
          />
        </svg>

        <div className="sport-bracket-final">
          <h3>Final</h3>
          {matchCard(tournament.final)}
        </div>

        <div className="sport-bracket-mobile-flow" aria-label="Alur tim semifinal">
          {outcomes.map((outcome, index) => (
            <div className="sport-bracket-mobile-flow-match" key={tournament.semifinals[index].label}>
              <strong>{tournament.semifinals[index].label}</strong>
              <span title={outcome.winner}>{outcome.winner}</span>
              <ArrowRight aria-hidden="true" />
              <b>Final</b>
            </div>
          ))}
        </div>
      </div>

      <section className="sport-bracket-third" aria-label="Perebutan peringkat 3">
        <div className="sport-bracket-third-match">
          <h3>Perebutan peringkat 3</h3>
          {matchCard(tournament.bronze)}
        </div>
      </section>
    </div>
  );
}
