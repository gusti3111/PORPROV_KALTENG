import { create } from "zustand";
import { getAPIData, getAPIErrorMessage } from "../api/client";
import type {
  MedalStanding,
  ScheduleMatch,
  Sport,
  SportMedalStanding,
  Venue,
} from "../api/types";

type Resource = "sports" | "venues" | "matches" | "medals" | "sportMedals";

type CompetitionState = {
  sports: Sport[];
  venues: Venue[];
  matches: ScheduleMatch[];
  medalStandings: MedalStanding[];
  sportMedalStandings: SportMedalStanding[];
  loading: Record<Resource, boolean>;
  errors: Partial<Record<Resource, string>>;
  fetchSports: () => Promise<void>;
  fetchVenues: () => Promise<void>;
  fetchMatches: () => Promise<void>;
  fetchMedalStandings: () => Promise<void>;
  fetchSportMedalStandings: () => Promise<void>;
};

const initialLoading: Record<Resource, boolean> = {
  sports: false,
  venues: false,
  matches: false,
  medals: false,
  sportMedals: false,
};

export const useCompetitionStore = create<CompetitionState>((set, get) => ({
  sports: [],
  venues: [],
  matches: [],
  medalStandings: [],
  sportMedalStandings: [],
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
      const medalStandings =
        await getAPIData<MedalStanding[]>("/medals/standings");
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
      const sportMedalStandings =
        await getAPIData<SportMedalStanding[]>("/medals/by-sport");
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
}));
