export function formatParticipantName(
  participant?: { athlete_name?: string | null; contingent_name?: string | null } | null,
  fallback = "TBA",
): string {
  if (!participant) return fallback;
  const athlete = (participant.athlete_name ?? "").trim();
  const contingent = (participant.contingent_name ?? "").trim();
  if (athlete && contingent) return `${athlete} (${contingent})`;
  if (athlete) return athlete;
  if (contingent) return contingent;
  return fallback;
}

export function hasDuplicateParticipantEntry(
  participants: Array<{ contingent_id: number; athlete_name?: string | null }>,
): boolean {
  const seen = new Set<string>();
  for (const p of participants) {
    if (!p.contingent_id || p.contingent_id <= 0) continue;
    const key = `${p.contingent_id}::${(p.athlete_name ?? "").trim().toLowerCase()}`;
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}
