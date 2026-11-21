import { create } from "zustand";
import {
  API_BASE_URL,
  apiClient,
  getAPIData,
  getAPIErrorMessage,
  getAuthHeaders,
} from "../api/client";
import type {
  Contingent,
  MedalStanding,
  ScheduleMatch,
  Sport,
  SportMedalStanding,
  Venue,
  Event,
} from "../api/types";

type Resource =
  | "sports"
  | "venues"
  | "matches"
  | "medals"
  | "sportMedals"
  | "events"
  | "contingents";

type CompetitionState = {
  sports: Sport[];
  venues: Venue[];
  matches: ScheduleMatch[];
  medalStandings: MedalStanding[];
  sportMedalStandings: SportMedalStanding[];
  events: Event[];
  contingents: Contingent[];
  loading: Record<Resource, boolean>;
  errors: Partial<Record<Resource, string>>;
  fetchSports: () => Promise<void>;
  fetchVenues: () => Promise<void>;
  fetchMatches: () => Promise<void>;
  fetchMedalStandings: () => Promise<void>;
  fetchSportMedalStandings: () => Promise<void>;
  fetchEvents: () => Promise<void>;
  fetchContingents: () => Promise<void>;
  createEvent: (data: { sport_id: number; name: string; gender: string }) => Promise<Event>;
  updateMatch: (
    id: string,
    data: {
      status: string;
      scores: string[];
      winner_contingent_id?: number;
      live_stream_url?: string;
    },
  ) => Promise<void>;
  updateMatchContingents: (
    id: string,
    contingentIds: number[],
    athleteNames?: string[],
  ) => Promise<void>;
  deleteMatches: (ids: string[]) => Promise<{ deleted: number; failed: number }>;
};

const initialLoading: Record<Resource, boolean> = {
  sports: false,
  venues: false,
  matches: false,
  medals: false,
  sportMedals: false,
  events: false,
  contingents: false,
};

function formatJakartaDateTime(startTime?: string, fallbackDate?: string, fallbackTime?: string) {
  if (!startTime) {
    return { date: fallbackDate || "", time: fallbackTime || "" };
  }
  const parsed = new Date(startTime);
  if (Number.isNaN(parsed.getTime())) {
    return { date: fallbackDate || "", time: fallbackTime || "" };
  }
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(parsed);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  };
}

function normalizeSportDisplayName(name: string) {
  return name
    .replace(/\b(ergometer|egrometer)\b/gi, "Agrometer")
    .replace(/\bmotoprix\b/gi, "Motoprixx")
    .replace(/\bmotor\s*prix\b/gi, "Motor Prixx");
}

export const useCompetitionStore = create<CompetitionState>((set, get) => ({
  sports: [],
  venues: [],
  matches: [],
  medalStandings: [],
  sportMedalStandings: [],
  events: [],
  contingents: [],
  loading: initialLoading,
  errors: {},

  async fetchSports() {
    if (get().loading.sports) return;
    set((state) => ({
      loading: { ...state.loading, sports: true },
      errors: { ...state.errors, sports: undefined },
    }));
    try {
      const rawSports = await getAPIData<Sport[]>("/sports");
      const sports = rawSports.map((sport) => ({
        ...sport,
        name: normalizeSportDisplayName(sport.name),
        description: normalizeSportDisplayName(sport.description),
      }));
      set({ sports });
    } catch (error) {
      set((state) => ({
        errors: { ...state.errors, sports: getAPIErrorMessage(error) },
      }));
    } finally {
      set((state) => ({
        loading: { ...state.loading, sports: false },
      }));
    }
  },

  async fetchVenues() {
    if (get().loading.venues) return;
    set((state) => ({
      loading: { ...state.loading, venues: true },
      errors: { ...state.errors, venues: undefined },
    }));
    try {
      const venues = await getAPIData<Venue[]>("/venues");
      set({ venues });
    } catch (error) {
      set((state) => ({
        errors: { ...state.errors, venues: getAPIErrorMessage(error) },
      }));
    } finally {
      set((state) => ({
        loading: { ...state.loading, venues: false },
      }));
    }
  },

  async fetchMatches() {
    if (get().loading.matches) return;
    set((state) => ({
      loading: { ...state.loading, matches: true },
      errors: { ...state.errors, matches: undefined },
    }));
    try {
      const rawMatches = await getAPIData<ScheduleMatch[]>("/matches");
      const mappedMatches = rawMatches.map((m) => {
        const jakarta = formatJakartaDateTime(m.start_time, m.date, m.time);
        return {
          ...m,
          date: jakarta.date,
          time: jakarta.time,
          sport_name: normalizeSportDisplayName(m.sport_name),
          event_name: normalizeSportDisplayName(m.event_name),
        };
      });
      set({ matches: mappedMatches });
    } catch (error) {
      set((state) => ({
        errors: { ...state.errors, matches: getAPIErrorMessage(error) },
      }));
    } finally {
      set((state) => ({
        loading: { ...state.loading, matches: false },
      }));
    }
  },

  async fetchMedalStandings() {
    if (get().loading.medals) return;
    set((state) => ({
      loading: { ...state.loading, medals: true },
      errors: { ...state.errors, medals: undefined },
    }));
    try {
      const medalStandings = await getAPIData<MedalStanding[]>("/medals/standings");
      set({ medalStandings });
    } catch (error) {
      set((state) => ({
        errors: { ...state.errors, medals: getAPIErrorMessage(error) },
      }));
    } finally {
      set((state) => ({
        loading: { ...state.loading, medals: false },
      }));
    }
  },

  async fetchSportMedalStandings() {
    if (get().loading.sportMedals) return;
    set((state) => ({
      loading: { ...state.loading, sportMedals: true },
      errors: { ...state.errors, sportMedals: undefined },
    }));
    try {
      const sportMedalStandings = await getAPIData<SportMedalStanding[]>("/medals/by-sport");
      set({ sportMedalStandings });
    } catch (error) {
      set((state) => ({
        errors: {
          ...state.errors,
          sportMedals: getAPIErrorMessage(error),
        },
      }));
    } finally {
      set((state) => ({
        loading: { ...state.loading, sportMedals: false },
      }));
    }
  },

  async fetchEvents() {
    if (get().loading.events) return;
    set((state) => ({
      loading: { ...state.loading, events: true },
      errors: { ...state.errors, events: undefined },
    }));
    try {
      const events = await getAPIData<Event[]>("/events");
      set({ events });
    } catch (error) {
      set((state) => ({
        errors: { ...state.errors, events: getAPIErrorMessage(error) },
      }));
    } finally {
      set((state) => ({
        loading: { ...state.loading, events: false },
      }));
    }
  },

  async fetchContingents() {
    if (get().loading.contingents) return;
    set((state) => ({
      loading: { ...state.loading, contingents: true },
      errors: { ...state.errors, contingents: undefined },
    }));
    try {
      const contingents = await getAPIData<Contingent[]>("/contingents");
      set({ contingents });
    } catch (error) {
      set((state) => ({
        errors: { ...state.errors, contingents: getAPIErrorMessage(error) },
      }));
    } finally {
      set((state) => ({
        loading: { ...state.loading, contingents: false },
      }));
    }
  },

  async createEvent(data: { sport_id: number; name: string; gender: string }) {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to create event (${response.status})`);
    }
    const created = (await response.json()) as Event;
    await get().fetchEvents();
    return created;
  },

  async updateMatch(
    id: string,
    data: {
      status: string;
      scores: string[];
      winner_contingent_id?: number;
      live_stream_url?: string;
    },
  ) {
    const response = await fetch(`${API_BASE_URL}/matches/${id}/result`, {
      method: "PUT",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        status: data.status || "FINISHED",
        scores: (data.scores || []).map((s) => String(s ?? "").trim()),
        winner_contingent_id: data.winner_contingent_id ?? 0,
        ...(data.live_stream_url !== undefined
          ? { live_stream_url: data.live_stream_url.trim() }
          : {}),
      }),
    });
    if (response.status === 401) {
      try {
        localStorage.removeItem("porprov_admin_token");
        localStorage.removeItem("porprov_admin_user");
      } catch {
        // Ignore storage errors
      }
      if (
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/admin") &&
        window.location.pathname !== "/admin/login"
      ) {
        window.location.replace("/admin/login");
      }
      throw new Error("Sesi login habis (401). Silakan login ulang.");
    }
    if (!response.ok) {
      let detail = `Failed to update match result (${response.status})`;
      try {
        const body = (await response.json()) as { error?: string; message?: string };
        if (body?.error || body?.message) {
          detail = body.error || body.message || detail;
        }
      } catch {
        // Ignore non-JSON error body
      }
      throw new Error(detail);
    }
    await Promise.all([
      get().fetchMatches(),
      get().fetchMedalStandings(),
      get().fetchSportMedalStandings(),
    ]);
  },

  async updateMatchContingents(
    id: string,
    contingentIds: number[],
    athleteNames?: string[],
  ) {
    await apiClient.put(`/matches/${id}/participants`, {
      contingent_ids: contingentIds,
      ...(athleteNames ? { athlete_names: athleteNames } : {}),
    });
  },

  async deleteMatches(ids: string[]) {
    let deleted = 0;
    let failed = 0;
    const chunkSize = 5;
    for (let i = 0; i < ids.length; i += chunkSize) {
      const batch = ids.slice(i, i + chunkSize);
      const results = await Promise.allSettled(
        batch.map((id) => apiClient.delete(`/matches/${id}`)),
      );
      for (const res of results) {
        if (res.status === "fulfilled") {
          deleted += 1;
        } else {
          failed += 1;
        }
      }
    }
    await Promise.all([
      get().fetchMatches(),
      get().fetchMedalStandings(),
      get().fetchSportMedalStandings(),
    ]);
    return { deleted, failed };
  },
}));
