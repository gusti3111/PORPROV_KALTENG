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

const RATU_ALAMSYAH_NOTE =
  "Venue di dalam GOR Sport Center Ratu Alamsyah untuk pertandingan Basket, Bola Voli Indoor, Futsal, dan Sepak Takraw.";

function normalizeVenueText(value?: string) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function isGorSportCenterVenue(name?: string) {
  const n = normalizeVenueText(name);
  return n.includes("gor") && n.includes("sport center");
}

function consolidateGorSportCenterVenues(rawVenues: Venue[]) {
  const group = rawVenues.filter((v) => isGorSportCenterVenue(v.name));
  if (group.length <= 1) {
    return { venues: rawVenues };
  }

  const primary =
    group.find((v) => normalizeVenueText(v.name).includes("ratu alamsyah")) ??
    group[0];
  const mergedVenue: Venue = {
    ...primary,
    note: RATU_ALAMSYAH_NOTE,
  };
  const skipIds = new Set(
    group.filter((v) => v.id !== primary.id).map((v) => v.id),
  );

  const venues = rawVenues
    .filter((v) => !skipIds.has(v.id))
    .map((v) => (v.id === primary.id ? mergedVenue : v));

  return { venues };
}

function normalizeMatchVenue(
  match: ScheduleMatch,
  venues: Venue[],
): ScheduleMatch {
  if (!isGorSportCenterVenue(match.venue_name)) return match;
  const ratu = venues.find((v) =>
    normalizeVenueText(v.name).includes("ratu alamsyah"),
  );
  if (!ratu) return match;
  return {
    ...match,
    venue_id: ratu.id,
    venue_name: ratu.name,
  };
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
      const sports = await getAPIData<Sport[]>("/sports");
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
      const rawVenues = await getAPIData<Venue[]>("/venues");
      const { venues } = consolidateGorSportCenterVenues(rawVenues);
      set((state) => ({
        venues,
        matches: state.matches.map((m) => normalizeMatchVenue(m, venues)),
      }));
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
      const currentVenues = get().venues;
      const matches =
        currentVenues.length > 0
          ? rawMatches.map((m) => normalizeMatchVenue(m, currentVenues))
          : rawMatches;
      set({ matches });
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
