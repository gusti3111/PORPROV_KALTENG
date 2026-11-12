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
    data: { status: string; scores: string[]; winner_contingent_id?: number },
  ) => Promise<void>;
  updateMatchContingents: (id: string, contingentIds: number[]) => Promise<void>;
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
      const sports = await getAPIData<Sport[]>("/sports/");
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
      const venues = await getAPIData<Venue[]>("/venues/");
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
      const matches = await getAPIData<ScheduleMatch[]>("/matches");
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
      const events = await getAPIData<Event[]>("/events/");
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
      const contingents = await getAPIData<Contingent[]>("/contingents/");
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
    data: { status: string; scores: string[]; winner_contingent_id?: number },
  ) {
    const response = await fetch(`${API_BASE_URL}/matches/${id}/result`, {
      method: "PUT",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to update match result (${response.status})`);
    }
    await Promise.all([
      get().fetchMatches(),
      get().fetchMedalStandings(),
      get().fetchSportMedalStandings(),
    ]);
  },

  async updateMatchContingents(id: string, contingentIds: number[]) {
    await apiClient.put(`/matches/${id}/participants`, {
      contingent_ids: contingentIds,
    });
  },
}));
