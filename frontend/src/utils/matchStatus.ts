import { useEffect, useState } from "react";
import type { MatchStatus, ScheduleMatch } from "../api/types";

const AGENDA_DURATION_PATTERN =
  /upacara|pembukaan|penutupan|kepulangan|technical\s*meeting|manager\s*meeting|penyegaran\s*wasit|uji\s*coba|ujicoba|\bopening\b|\bclosing\b/i;

export function getDefaultMatchDurationMinutes(
  sportName?: string,
  roundName?: string,
  title?: string,
): number {
  const combined = `${sportName || ""} ${roundName || ""} ${title || ""}`.toLowerCase();

  if (AGENDA_DURATION_PATTERN.test(combined)) {
    return 120;
  }
  if (/\bfutsal\b|sepak\s*bola\s*mini|ksmi/i.test(combined)) {
    return 60;
  }
  if (/sepak\s*bola/i.test(combined)) {
    return 110;
  }
  if (/basket|voli|takraw|korfball/i.test(combined)) {
    return 90;
  }
  if (
    /bulutangkis|badminton|tenis|pencak\s*silat|karate|taekwondo|judo|tinju|\bmma\b|muaythai|kickboxing/i.test(
      combined,
    )
  ) {
    return 45;
  }
  return 90;
}

function getJakartaHHMM(isoString?: string): string {
  if (!isoString) return "";
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(parsed);
  const hour = parts.find((p) => p.type === "hour")?.value ?? "";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "";
  return hour && minute ? `${hour}:${minute}` : "";
}

function hasExplicitScheduleTime(isoString?: string, fallbackTime?: string): boolean {
  const hhmm = getJakartaHHMM(isoString) || (fallbackTime || "").replace(/\s*WIB\s*$/i, "").trim();
  return Boolean(hhmm) && hhmm !== "00:00";
}

export function resolveAutoMatchStatus(
  match: Pick<
    ScheduleMatch,
    "status" | "start_time" | "end_time" | "time" | "sport_name" | "round_name" | "title"
  >,
  nowMs: number = Date.now(),
): MatchStatus {
  // Hormati status manual final / tunda / batal dari Admin
  if (
    match.status === "FINISHED" ||
    match.status === "POSTPONED" ||
    match.status === "CANCELLED"
  ) {
    return match.status;
  }

  // Jangan ubah otomatis jika jam masih "Menyusul" (00:00 / kosong)
  if (!match.start_time || !hasExplicitScheduleTime(match.start_time, match.time)) {
    return match.status;
  }

  const startMs = Date.parse(match.start_time);
  if (Number.isNaN(startMs)) {
    return match.status;
  }

  let endMs = Number.NaN;
  if (match.end_time && hasExplicitScheduleTime(match.end_time)) {
    const parsedEnd = Date.parse(match.end_time);
    if (!Number.isNaN(parsedEnd) && parsedEnd > startMs) {
      endMs = parsedEnd;
    }
  }
  if (Number.isNaN(endMs)) {
    const durationMin = getDefaultMatchDurationMinutes(
      match.sport_name,
      match.round_name,
      match.title,
    );
    endMs = startMs + durationMin * 60_000;
  }

  if (nowMs >= endMs) {
    return "FINISHED";
  }
  if (nowMs >= startMs) {
    return "ONGOING";
  }
  return match.status;
}

export function useCurrentTimeMs(intervalMs = 30_000): number {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return nowMs;
}
