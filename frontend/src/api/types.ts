export type Sport = {
  id: number;
  name: string;
  code: string;
  category: "Utama" | "Eksebisi";
  icon: string;
  description: string;
};

export type Venue = {
  id: number;
  name: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  note: string;
  position: [number, number];
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
  sport_name: string;
  event_name: string;
  venue_name: string;
  title: string;
  round_name: string;
  date: string;
  time: string;
  start_time: string;
  status: MatchStatus;
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
