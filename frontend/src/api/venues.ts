import { apiClient, getAPIErrorMessage } from "./client";
import type { Venue } from "./types";

export type VenuePayload = {
  name: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  position: [number, number];
  note: string;
  image_url: string;
};

export type VenueFilterParams = {
  category?: string;
  search?: string;
};

type VenueAPIResponse<T> = {
  success: boolean;
  data?: T;
  error?: string | { message?: string };
};

function extractAPIError(err: unknown, fallback: string): string {
  if (typeof err === "string" && err.trim()) return err.trim();
  if (err && typeof err === "object") {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === "string" && msg.trim()) return msg.trim();
  }
  return fallback;
}

function normalizeVenueItem(raw: Partial<Venue>, idx = 0): Venue {
  const lat = Number(
    raw.latitude ?? (Array.isArray(raw.position) ? raw.position[0] : 0),
  );
  const lng = Number(
    raw.longitude ?? (Array.isArray(raw.position) ? raw.position[1] : 0),
  );
  const safeLat = Number.isFinite(lat) ? lat : 0;
  const safeLng = Number.isFinite(lng) ? lng : 0;

  return {
    id: Number(raw.id ?? idx + 1),
    name: (raw.name ?? "").trim(),
    category: (raw.category ?? "").trim(),
    address: (raw.address ?? "").trim(),
    latitude: safeLat,
    longitude: safeLng,
    position: [safeLat, safeLng],
    note: (raw.note ?? "").trim(),
    image_url: (raw.image_url ?? "").trim(),
  };
}

export async function fetchVenuesAPI(
  filters?: VenueFilterParams,
): Promise<Venue[]> {
  const params: Record<string, string> = {};
  if (filters?.category && filters.category !== "Semua" && filters.category !== "__all") {
    params.category = filters.category;
  }
  if (filters?.search && filters.search.trim()) {
    params.search = filters.search.trim();
  }

  try {
    const response = await apiClient.get<VenueAPIResponse<Partial<Venue>[]>>(
      "/venues",
      { params },
    );
    if (!response.data?.success) {
      throw new Error(
        extractAPIError(response.data?.error, "Gagal memuat data venue."),
      );
    }
    const rows = Array.isArray(response.data.data) ? response.data.data : [];
    return rows.map((row, idx) => normalizeVenueItem(row, idx));
  } catch (err) {
    throw new Error(getAPIErrorMessage(err));
  }
}

export async function fetchVenueById(id: number): Promise<Venue> {
  try {
    const response = await apiClient.get<VenueAPIResponse<Partial<Venue>>>(
      `/venues/${id}`,
    );
    if (!response.data?.success || !response.data.data) {
      throw new Error(
        extractAPIError(response.data?.error, "Venue tidak ditemukan."),
      );
    }
    return normalizeVenueItem(response.data.data);
  } catch (err) {
    throw new Error(getAPIErrorMessage(err));
  }
}

export async function createVenue(payload: VenuePayload): Promise<Venue> {
  try {
    const response = await apiClient.post<VenueAPIResponse<Partial<Venue>>>(
      "/venues",
      payload,
    );
    if (!response.data?.success) {
      throw new Error(
        extractAPIError(response.data?.error, "Gagal menambahkan venue."),
      );
    }
    return normalizeVenueItem(response.data.data ?? payload);
  } catch (err) {
    throw new Error(getAPIErrorMessage(err));
  }
}

export async function updateVenue(
  id: number,
  payload: VenuePayload,
): Promise<Venue> {
  try {
    const response = await apiClient.put<VenueAPIResponse<Partial<Venue>>>(
      `/venues/${id}`,
      payload,
    );
    if (!response.data?.success) {
      throw new Error(
        extractAPIError(response.data?.error, "Gagal memperbarui venue."),
      );
    }
    return normalizeVenueItem(response.data.data ?? { ...payload, id });
  } catch (err) {
    throw new Error(getAPIErrorMessage(err));
  }
}

export async function deleteVenue(id: number): Promise<void> {
  try {
    const response = await apiClient.delete<VenueAPIResponse<unknown>>(
      `/venues/${id}`,
    );
    if (!response.data?.success) {
      throw new Error(
        extractAPIError(response.data?.error, "Gagal menghapus venue."),
      );
    }
  } catch (err) {
    throw new Error(getAPIErrorMessage(err));
  }
}
