import type { SportTournamentStanding } from "../api/types";

export type SportScoringMode =
  | "GROUP_3_1_0"
  | "GROUP_FIBA_2_1"
  | "GROUP_VOLLEY"
  | "GROUP_RACKET_2_0"
  | "SWISS_CHESS"
  | "LEADERBOARD_TIME"
  | "LEADERBOARD_SCORE"
  | "KNOCKOUT_COMBAT";

export type SportTableType =
  | "STANDINGS_WITH_DRAW"
  | "STANDINGS_NO_DRAW"
  | "TIME_LEADERBOARD"
  | "SCORE_LEADERBOARD"
  | "KNOCKOUT_ONLY";

export interface SportScoringRule {
  mode: SportScoringMode;
  tableType: SportTableType;
  badgeLabel: string;
  shortRule: string;
  description: string;
  winPoints: number;
  drawPoints: number;
  lossPoints: number;
  allowDraw: boolean;
  sectionTitle: string;
  groupLabel: string;
  valueColumnLabel: string;
  scoreUnitLabel: string;
  scorePlaceholderHome: string;
  scorePlaceholderAway: string;
}

const RULES: Record<SportScoringMode, SportScoringRule> = {
  GROUP_3_1_0: {
    mode: "GROUP_3_1_0",
    tableType: "STANDINGS_WITH_DRAW",
    badgeLabel: "Klasemen Grup (Menang 3 · Seri 1 · Kalah 0)",
    shortRule: "Menang = 3 Poin · Seri = 1 Poin · Kalah = 0 Poin",
    description:
      "Fase grup menggunakan tabel klasemen penuh (Main, Menang, Seri, Kalah, Poin). Juara & Runner-up grup lolos ke Bagan Gugur.",
    winPoints: 3,
    drawPoints: 1,
    lossPoints: 0,
    allowDraw: true,
    sectionTitle: "Klasemen Fase Grup",
    groupLabel: "Grup",
    valueColumnLabel: "Poin",
    scoreUnitLabel: "Skor / Gol",
    scorePlaceholderHome: "Gol (mis. 2)",
    scorePlaceholderAway: "Gol (mis. 1)",
  },
  GROUP_FIBA_2_1: {
    mode: "GROUP_FIBA_2_1",
    tableType: "STANDINGS_NO_DRAW",
    badgeLabel: "Klasemen Tanpa Seri (Menang 2 · Kalah 1)",
    shortRule: "Menang = 2 Poin · Kalah = 1 Poin (Tanpa Seri)",
    description:
      "Tidak mengenal hasil seri (jika imbang lanjut Overtime/Gim penentu). Tabel klasemen hanya menampilkan Main, Menang, Kalah, dan Poin.",
    winPoints: 2,
    drawPoints: 0,
    lossPoints: 1,
    allowDraw: false,
    sectionTitle: "Klasemen Fase Grup",
    groupLabel: "Grup",
    valueColumnLabel: "Poin",
    scoreUnitLabel: "Skor Poin / Gim",
    scorePlaceholderHome: "Skor (mis. 78)",
    scorePlaceholderAway: "Skor (mis. 72)",
  },
  GROUP_VOLLEY: {
    mode: "GROUP_VOLLEY",
    tableType: "STANDINGS_NO_DRAW",
    badgeLabel: "Sistem Set FIVB (3-0/3-1: 3 · 3-2: 2 · 2-3: 1)",
    shortRule:
      "Menang 3-0/3-1 = 3 Poin · Menang 3-2 = 2 Poin · Kalah 2-3 = 1 Poin · Kalah 0-3/1-3 = 0",
    description:
      "Menggunakan sistem Best of 5 Set (Indoor) / Best of 3 Set (Pasir) tanpa hasil seri. Tabel klasemen hanya menampilkan Main, Menang, Kalah, dan Poin Set.",
    winPoints: 3,
    drawPoints: 0,
    lossPoints: 0,
    allowDraw: false,
    sectionTitle: "Klasemen Pool / Grup",
    groupLabel: "Pool",
    valueColumnLabel: "Poin Set",
    scoreUnitLabel: "Skor Set",
    scorePlaceholderHome: "Set (mis. 3)",
    scorePlaceholderAway: "Set (mis. 1)",
  },
  GROUP_RACKET_2_0: {
    mode: "GROUP_RACKET_2_0",
    tableType: "STANDINGS_NO_DRAW",
    badgeLabel: "Penyisihan Pool Set / Regu (Menang / Kalah)",
    shortRule: " Peringkat berdasarkan Jumlah Kemenangan (Menang vs Kalah, Tanpa Seri)",
    description:
      "Pertandingan menggunakan sistem Best of 3 Set/Gim (atau Best of 3/5 Partai untuk Beregu) tanpa hasil seri.",
    winPoints: 2,
    drawPoints: 0,
    lossPoints: 0,
    allowDraw: false,
    sectionTitle: "Klasemen Pool Penyisihan",
    groupLabel: "Pool",
    valueColumnLabel: "Menang",
    scoreUnitLabel: "Skor Set / Partai",
    scorePlaceholderHome: "Set (mis. 2)",
    scorePlaceholderAway: "Set (mis. 1)",
  },
  SWISS_CHESS: {
    mode: "SWISS_CHESS",
    tableType: "STANDINGS_WITH_DRAW",
    badgeLabel: "Sistem Babak Swiss / VP (Menang · Remis · Kalah)",
    shortRule: "Menang = 2 MP · Remis = 1 MP · Kalah = 0 MP",
    description:
      "Menggunakan tabel klasemen Sistem Swiss / Round-Robin berdasarkan Match Points (MP) atau Victory Points (VP).",
    winPoints: 2,
    drawPoints: 1,
    lossPoints: 0,
    allowDraw: true,
    sectionTitle: "Klasemen Babak Swiss / Penyisihan",
    groupLabel: "Kategori / Pool",
    valueColumnLabel: "MP / VP",
    scoreUnitLabel: "Match Point / VP",
    scorePlaceholderHome: "Contoh: 2",
    scorePlaceholderAway: "Contoh: 0",
  },
  LEADERBOARD_TIME: {
    mode: "LEADERBOARD_TIME",
    tableType: "TIME_LEADERBOARD",
    badgeLabel: "Pemeringkatan Catatan Waktu (Tanpa Poin)",
    shortRule: "Diurutkan dari Catatan Waktu Tercepat (Detik) – Bukan Sistem Poin",
    description:
      "Cabang olahraga terukur waktu tidak menggunakan poin Menang/Seri/Kalah, melainkan langsung memeringkatkan peserta berdasarkan Catatan Waktu Tercepat pada setiap Heat/Babak.",
    winPoints: 0,
    drawPoints: 0,
    lossPoints: 0,
    allowDraw: false,
    sectionTitle: "Hasil Catatan Waktu (Heat / Kualifikasi)",
    groupLabel: "Heat",
    valueColumnLabel: "Catatan Waktu",
    scoreUnitLabel: "Waktu (detik)",
    scorePlaceholderHome: "mis. 10.42 detik",
    scorePlaceholderAway: "mis. 10.58 detik",
  },
  LEADERBOARD_SCORE: {
    mode: "LEADERBOARD_SCORE",
    tableType: "SCORE_LEADERBOARD",
    badgeLabel: "Pemeringkatan Skor Juri / Nilai Lomba (Tanpa M/S/K)",
    shortRule: "Diurutkan dari Skor Juri / Nilai Penampilan Tertinggi",
    description:
      "Cabang olahraga ini tidak menggunakan tabel Menang/Seri/Kalah, melainkan memeringkatkan kontingen berdasarkan Total Skor Juri / Nilai Lomba pada setiap sesi.",
    winPoints: 0,
    drawPoints: 0,
    lossPoints: 0,
    allowDraw: false,
    sectionTitle: "Daftar Peringkat Skor Juri / Kualifikasi",
    groupLabel: "Sesi / Babak",
    valueColumnLabel: "Skor Akhir",
    scoreUnitLabel: "Skor Juri / Nilai",
    scorePlaceholderHome: "Skor (mis. 85.50)",
    scorePlaceholderAway: "Skor (mis. 82.10)",
  },
  KNOCKOUT_COMBAT: {
    mode: "KNOCKOUT_COMBAT",
    tableType: "KNOCKOUT_ONLY",
    badgeLabel: "Sistem Gugur Murni (Tanpa Klasemen Grup)",
    shortRule: "Langsung Bagan Gugur: Perempat Final → Semifinal → Final",
    description:
      "Cabang olahraga bela diri / head-to-head murni tidak menggunakan klasemen grup maupun sistem poin, melainkan langsung dipertandingkan pada Bagan Gugur hingga perebutan medali.",
    winPoints: 0,
    drawPoints: 0,
    lossPoints: 0,
    allowDraw: false,
    sectionTitle: "Bagan Gugur Langsung",
    groupLabel: "Pool",
    valueColumnLabel: "Skor",
    scoreUnitLabel: "Skor / Poin Ronde",
    scorePlaceholderHome: "Skor (mis. 5)",
    scorePlaceholderAway: "Skor (mis. 3)",
  },
};

const SPORT_ID_MODE_MAP: Record<number, SportScoringMode> = {
  1: "LEADERBOARD_SCORE", // Aerosport
  2: "LEADERBOARD_TIME", // Atletik
  3: "LEADERBOARD_TIME", // Akuatik
  4: "LEADERBOARD_SCORE", // Bermotor (Grass Track & Motoprix)
  5: "LEADERBOARD_TIME", // Balap Sepeda (Road Bike & Mountain)
  6: "KNOCKOUT_COMBAT", // Billiard
  7: "LEADERBOARD_SCORE", // Binaraga Fitnes
  8: "GROUP_FIBA_2_1", // Basket
  9: "GROUP_VOLLEY", // Bola Voli (Indoor & Pasir/Pantai)
  10: "SWISS_CHESS", // Bridge
  11: "GROUP_RACKET_2_0", // Bulutangkis
  12: "SWISS_CHESS", // Catur
  13: "LEADERBOARD_TIME", // Dayung (Canoeing, TBR & Ergometer)
  14: "LEADERBOARD_SCORE", // Drumband
  15: "LEADERBOARD_SCORE", // Dancesport
  16: "GROUP_3_1_0", // E-Sport
  17: "LEADERBOARD_SCORE", // Gimnastik
  18: "KNOCKOUT_COMBAT", // Judo
  19: "KNOCKOUT_COMBAT", // Karate
  20: "GROUP_3_1_0", // Korfball
  21: "KNOCKOUT_COMBAT", // MMA
  22: "LEADERBOARD_SCORE", // Panahan
  23: "LEADERBOARD_TIME", // Panjat Tebing
  24: "KNOCKOUT_COMBAT", // Pencak Silat
  25: "GROUP_RACKET_2_0", // Sepak Takraw
  26: "LEADERBOARD_TIME", // Sepatu Roda
  27: "GROUP_3_1_0", // Sepak Bola & Futsal
  28: "GROUP_RACKET_2_0", // Tenis Lapangan
  29: "GROUP_FIBA_2_1", // Tenis Meja
  30: "KNOCKOUT_COMBAT", // Taekwondo
  31: "KNOCKOUT_COMBAT", // Tinju
  32: "GROUP_3_1_0", // Sepak Bola Mini (KSMI)
};

export function getSportScoringRule(
  sportId?: number,
  sportName?: string,
): SportScoringRule {
  if (sportId && SPORT_ID_MODE_MAP[sportId]) {
    return RULES[SPORT_ID_MODE_MAP[sportId]];
  }
  const lower = (sportName || "").toLowerCase();
  if (lower.includes("basket") || lower.includes("tenis meja")) {
    return RULES.GROUP_FIBA_2_1;
  }
  if (lower.includes("voli")) {
    return RULES.GROUP_VOLLEY;
  }
  if (
    lower.includes("bulutangkis") ||
    lower.includes("takraw") ||
    lower.includes("tenis lapangan")
  ) {
    return RULES.GROUP_RACKET_2_0;
  }
  if (lower.includes("catur") || lower.includes("bridge")) {
    return RULES.SWISS_CHESS;
  }
  if (
    lower.includes("atletik") ||
    lower.includes("akuatik") ||
    lower.includes("renang") ||
    lower.includes("dayung") ||
    lower.includes("sepeda") ||
    lower.includes("sepatu roda") ||
    lower.includes("panjat")
  ) {
    return RULES.LEADERBOARD_TIME;
  }
  if (
    lower.includes("silat") ||
    lower.includes("karate") ||
    lower.includes("taekwondo") ||
    lower.includes("judo") ||
    lower.includes("tinju") ||
    lower.includes("mma") ||
    lower.includes("billiard")
  ) {
    return RULES.KNOCKOUT_COMBAT;
  }
  if (
    lower.includes("senam") ||
    lower.includes("gimnastik") ||
    lower.includes("drumband") ||
    lower.includes("dance") ||
    lower.includes("binaraga") ||
    lower.includes("bermotor") ||
    lower.includes("aerosport") ||
    lower.includes("panahan")
  ) {
    return RULES.LEADERBOARD_SCORE;
  }
  return RULES.GROUP_3_1_0;
}

export function calculateStandingPoints(
  rule: SportScoringRule,
  won: number,
  drawn: number,
  lost: number,
  won32 = 0,
  lost23 = 0,
): number {
  const safeWon = Math.max(0, won);
  const safeDrawn = rule.allowDraw ? Math.max(0, drawn) : 0;
  const safeLost = Math.max(0, lost);

  if (rule.mode === "GROUP_VOLLEY") {
    const regularWins = Math.max(0, safeWon - Math.max(0, won32));
    return regularWins * 3 + Math.max(0, won32) * 2 + Math.max(0, lost23) * 1;
  }

  return (
    safeWon * rule.winPoints +
    safeDrawn * rule.drawPoints +
    safeLost * rule.lossPoints
  );
}

const TIME_OFFSET_BASE = 1_000_000;

export function encodeTimeSecondsToStanding(seconds: number): {
  won: number;
  drawn: number;
  lost: number;
  points: number;
} {
  const centiseconds = Math.max(1, Math.round(seconds * 100));
  return {
    won: 1,
    drawn: 0,
    lost: centiseconds,
    points: Math.max(1, TIME_OFFSET_BASE - centiseconds),
  };
}

export function decodeTimeSecondsFromStanding(
  row: SportTournamentStanding,
): number {
  if (row.lost > 0 && row.points > 100_000) {
    return row.lost / 100;
  }
  if (row.points > 100_000) {
    return (TIME_OFFSET_BASE - row.points) / 100;
  }
  if (row.lost > 0) {
    return row.lost / 100;
  }
  return row.points;
}

export function formatStandingPrimaryMetric(
  rule: SportScoringRule,
  row: SportTournamentStanding,
): string {
  if (rule.tableType === "TIME_LEADERBOARD") {
    const secs = decodeTimeSecondsFromStanding(row);
    if (secs <= 0) return "–";
    return `${secs.toFixed(2)} detik`;
  }
  if (rule.tableType === "SCORE_LEADERBOARD") {
    if (row.drawn === 100) {
      return (row.points / 100).toFixed(2);
    }
    return String(row.points);
  }
  if (rule.mode === "GROUP_RACKET_2_0") {
    return `${row.won} M`;
  }
  return String(row.points);
}

export function encodeScoreToStanding(scoreValue: number): {
  won: number;
  drawn: number;
  lost: number;
  points: number;
} {
  const hasDecimals = Math.round(scoreValue * 100) % 100 !== 0;
  if (hasDecimals) {
    return {
      won: 1,
      drawn: 100,
      lost: 0,
      points: Math.max(0, Math.round(scoreValue * 100)),
    };
  }
  return {
    won: 1,
    drawn: 0,
    lost: 0,
    points: Math.max(0, Math.round(scoreValue)),
  };
}

export function decodeScoreFromStanding(row: SportTournamentStanding): number {
  if (row.drawn === 100) {
    return row.points / 100;
  }
  return row.points;
}

export function formatGroupDisplayName(
  rule: SportScoringRule,
  groupName: string,
): string {
  if (rule.tableType === "TIME_LEADERBOARD") {
    return groupName.replace(/^Grup\s+/i, "Heat ");
  }
  if (rule.tableType === "SCORE_LEADERBOARD") {
    return groupName.replace(/^Grup\s+/i, "Sesi ");
  }
  if (rule.mode === "GROUP_VOLLEY" || rule.mode === "GROUP_RACKET_2_0") {
    return groupName.replace(/^Grup\s+/i, "Pool ");
  }
  return groupName;
}
