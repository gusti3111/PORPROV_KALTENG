import type {
  ScheduleMatch,
  SportTournament,
  SportTournamentDivision,
  SportTournamentGroup,
  SportTournamentMatch,
  SportTournamentStanding,
} from "../api/types";

function isPopulatedTeam(name?: string | null): boolean {
  const trimmed = (name || "").trim();
  return Boolean(trimmed) && trimmed.toUpperCase() !== "TBA";
}

function matchPriorityScore(m: SportTournamentMatch): number {
  let score = 0;
  if (m.status === "FINISHED") score += 100;
  else if (m.status === "ONGOING") score += 60;
  if (m.home_score !== null && m.home_score !== undefined) score += 20;
  if (m.away_score !== null && m.away_score !== undefined) score += 20;
  if (isPopulatedTeam(m.home)) score += 10;
  if (isPopulatedTeam(m.away)) score += 10;
  return score;
}

export function dedupeTournamentMatches(
  matches: SportTournamentMatch[] | undefined,
): SportTournamentMatch[] {
  if (!Array.isArray(matches) || matches.length === 0) return [];
  const byLabel = new Map<string, SportTournamentMatch>();
  const order: string[] = [];

  for (const m of matches) {
    const key = (m.label || "").trim().toLowerCase();
    if (!byLabel.has(key)) {
      byLabel.set(key, m);
      order.push(key);
    } else {
      const existing = byLabel.get(key)!;
      if (matchPriorityScore(m) > matchPriorityScore(existing)) {
        byLabel.set(key, m);
      }
    }
  }

  return order.map((key) => byLabel.get(key)!);
}

function detectDivisionFromMatch(match: ScheduleMatch): "Men" | "Women" | null {
  const text = `${match.event_name || ""} ${match.round_name || ""} ${match.title || ""}`;
  if (/\b(women|putri|pi)\b/i.test(text)) return "Women";
  if (/\b(men|putra|pa)\b/i.test(text)) return "Men";
  return null;
}

function extractGroupCodeFromMatch(match: ScheduleMatch): string | null {
  const sources = [match.round_name || "", match.title || ""];
  for (const src of sources) {
    const m =
      src.match(/\b(?:grup|group|pool)\s*([A-D])\b/i) ||
      src.match(/\b(?:men|women|putra|putri)\s+([A-D])\b/i);
    if (m?.[1]) return m[1].toUpperCase();
  }
  return null;
}

function partitionGroupsByDivision(
  baseGroups: SportTournamentGroup[],
  sportMatches: ScheduleMatch[],
  divisionKey: "Men" | "Women",
): SportTournamentGroup[] {
  const divTeamKeys = new Set<string>();
  const divContingents = new Set<number>();

  for (const m of sportMatches) {
    if (detectDivisionFromMatch(m) !== divisionKey) continue;
    const gCode = extractGroupCodeFromMatch(m);
    for (const p of m.participants ?? []) {
      if (!p.contingent_id) continue;
      divContingents.add(p.contingent_id);
      if (gCode) {
        divTeamKeys.add(`${gCode}:${p.contingent_id}`);
      }
    }
  }

  if (divTeamKeys.size === 0 && divContingents.size === 0) return [];

  const result: SportTournamentGroup[] = [];
  for (const group of baseGroups) {
    const code = (group.code || "").toUpperCase();
    const matchedRows: SportTournamentStanding[] = (group.standings ?? [])
      .filter((row) => {
        if (!row.contingent_id) return false;
        if (divTeamKeys.size > 0) {
          return divTeamKeys.has(`${code}:${row.contingent_id}`);
        }
        return divContingents.has(row.contingent_id);
      })
      .map((row, idx) => ({ ...row, rank: idx + 1 }));

    if (matchedRows.length > 0) {
      result.push({
        ...group,
        standings: matchedRows,
      });
    }
  }

  return result;
}

export function normalizeTournamentData(
  tournament: SportTournament,
  allMatches?: ScheduleMatch[],
): SportTournament {
  const baseGroups = Array.isArray(tournament.groups) ? tournament.groups : [];
  const cleanedBase: SportTournament = {
    ...tournament,
    groups: baseGroups,
    quarterfinals: dedupeTournamentMatches(tournament.quarterfinals),
    semifinals: dedupeTournamentMatches(tournament.semifinals),
  };

  if (Array.isArray(tournament.divisions) && tournament.divisions.length > 0) {
    const cleanedDivisions: SportTournamentDivision[] = tournament.divisions.map(
      (div) => ({
        ...div,
        groups: Array.isArray(div.groups) ? div.groups : [],
        quarterfinals: dedupeTournamentMatches(div.quarterfinals),
        semifinals: dedupeTournamentMatches(div.semifinals),
      }),
    );

    const anyDivisionHasGroups = cleanedDivisions.some((div) =>
      div.groups.some((g) => g.standings && g.standings.length > 0),
    );
    const baseHasGroups = baseGroups.some(
      (g) => g.standings && g.standings.length > 0,
    );

    // If backend returned divisions with empty groups while top-level groups has data,
    // partition top-level groups into Men/Women using sport matches without losing any data.
    if (!anyDivisionHasGroups && baseHasGroups) {
      const sportMatches = (allMatches ?? []).filter(
        (m) =>
          m.sport_id === tournament.sport_id ||
          (m.sport_name || "").trim().toLowerCase() ===
            (tournament.sport_name || "").trim().toLowerCase(),
      );

      const enrichedDivisions = cleanedDivisions.map((div) => ({
        ...div,
        groups: partitionGroupsByDivision(baseGroups, sportMatches, div.division),
      }));

      const enrichedHasAny = enrichedDivisions.some((div) =>
        div.groups.some((g) => g.standings && g.standings.length > 0),
      );

      if (enrichedHasAny) {
        return {
          ...cleanedBase,
          divisions: enrichedDivisions,
        };
      }

      // Neither backend divisions nor match partitioning had groups: fall back to baseGroups
      // so standings are still visible instead of disappearing.
      return {
        ...cleanedBase,
        divisions: undefined,
      };
    }

    return {
      ...cleanedBase,
      divisions: cleanedDivisions,
    };
  }

  return cleanedBase;
}
