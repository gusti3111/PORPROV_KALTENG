export type Sport = {
  id: number;
  name: string;
  code: string;
  category: "Utama" | "Eksebisi";
  icon: string;
  description: string;
};

export type SportTournamentStanding = {
  rank: number;
  contingent_id?: number;
  contingent: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
};

export type SportTournamentGroup = {
  code: string;
  name: string;
  standings: SportTournamentStanding[];
};

export type SportTournamentMatch = {
  label: string;
  home: string;
  away: string;
  home_score: number | null;
  away_score: number | null;
  status: "SCHEDULED" | "ONGOING" | "FINISHED";
};

export type SportTournament = {
  sport_id: number;
  sport_name: string;
  groups: SportTournamentGroup[];
  quarterfinals?: SportTournamentMatch[];
  semifinals: SportTournamentMatch[];
  final: SportTournamentMatch;
  bronze: SportTournamentMatch;
};

export type Event = {
  id: number;
  sport_id: number;
  name: string;
  gender: string;
  created_at?: string;
};

export type Venue = {
  id: number;
  name: string;
  category: string;
  address?: string;
  latitude: number;
  longitude: number;
  note: string;
  position: [number, number];
  image_url?: string; // <-- Tambahkan baris ini
};

export type Contingent = {
  id: number;
  name: string;
  short_code: string;
  logo_url?: string;
};

export type MatchStatus =
  | "SCHEDULED"
  | "ONGOING"
  | "FINISHED"
  | "POSTPONED"
  | "CANCELLED";

export type MatchParticipant = {
  id: number;
  contingent_id: number;
  contingent_name: string;
  athlete_name: string;
  score: string;
  is_winner: boolean;
};

export type ScheduleMatch = {
  id: string;
  sport_id?: number;
  event_id?: number;
  venue_id?: number;
  sport_name: string;
  event_name: string;
  venue_name: string;
  title: string;
  round_name: string;
  date: string;
  time: string;
  start_time: string;
  status: MatchStatus;
  live_stream_url?: string;
  participants: MatchParticipant[];
};

export type MedalStanding = {
  contingent_id: number;
  contingent_name: string;
  short_code: string;
  logo_url: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
  rank: number;
};

export type SportMedalStanding = {
  sport_id: number;
  sport: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
  rank: number;
};

export type BracketMatch = {
  id: number;
  sport_id: number;
  round_name: string;
  round_order: number;
  match_order: number;
  label: string;
  home_contingent_id: number | null;
  away_contingent_id: number | null;
  home_name: string;
  away_name: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
};
