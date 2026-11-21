import { apiClient, getAPIErrorMessage } from "../api/client";

export const HOTEL_TYPES = [
  "Hotel Bintang",
  "Hotel Melati",
  "Wisma & Guest House",
  "Resort",
] as const;

export type HotelType = (typeof HOTEL_TYPES)[number];

export type HotelItem = {
  id: number;
  hotelName: string;
  type: HotelType;
  address: string;
  district: string;
  nearVenue: string;
  priceRange: string;
  contact: string;
  rating: number;
  facilities: string[];
  mapsUrl: string;
  image: string;
};

export type HotelPayload = {
  hotel_name: string;
  type: HotelType;
  address: string;
  district: string;
  near_venue: string;
  price_range: string;
  contact: string;
  rating: number;
  facilities: string[];
  maps_url: string;
  image_url: string;
};

export type HotelFilterParams = {
  type?: string;
  district?: string;
  search?: string;
};

type RawHotelRecord = {
  id?: number;
  hotel_name?: string;
  hotelName?: string;
  type?: string;
  address?: string;
  district?: string;
  near_venue?: string;
  nearVenue?: string;
  price_range?: string;
  priceRange?: string;
  contact?: string;
  rating?: number | string;
  facilities?: string[] | string | null;
  maps_url?: string;
  mapsUrl?: string;
  image_url?: string;
  image?: string;
};

type HotelAPIResponse<T> = {
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

function normalizeHotelType(raw?: string): HotelType {
  if (
    raw === "Hotel Bintang" ||
    raw === "Hotel Melati" ||
    raw === "Wisma & Guest House" ||
    raw === "Resort"
  ) {
    return raw;
  }
  return "Hotel Melati";
}

function normalizeFacilities(raw: RawHotelRecord["facilities"]): string[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export function mapHotelRecord(row: RawHotelRecord, index = 0): HotelItem {
  const parsedRating = Number(row.rating ?? 0);
  return {
    id: Number(row.id ?? index + 1),
    hotelName: (row.hotel_name || row.hotelName || "").trim(),
    type: normalizeHotelType(row.type),
    address: (row.address || "").trim(),
    district: (row.district || "Arut Selatan").trim(),
    nearVenue: (row.near_venue || row.nearVenue || "").trim(),
    priceRange: (row.price_range || row.priceRange || "").trim(),
    contact: (row.contact || "").trim(),
    rating: Number.isFinite(parsedRating) ? parsedRating : 0,
    facilities: normalizeFacilities(row.facilities),
    mapsUrl: (row.maps_url || row.mapsUrl || "").trim(),
    image: (row.image_url || row.image || "").trim(),
  };
}

export async function fetchHotels(
  filters?: HotelFilterParams,
): Promise<HotelItem[]> {
  const params: Record<string, string> = {};
  if (filters?.type && filters.type !== "Semua") {
    params.type = filters.type;
  }
  if (filters?.district && filters.district !== "Semua Kecamatan") {
    params.district = filters.district;
  }
  if (filters?.search && filters.search.trim()) {
    params.search = filters.search.trim();
  }

  try {
    const response = await apiClient.get<HotelAPIResponse<RawHotelRecord[]>>(
      "/hotels",
      { params },
    );
    if (!response.data?.success) {
      throw new Error(
        extractAPIError(response.data?.error, "Gagal memuat data hotel."),
      );
    }
    const rows = Array.isArray(response.data.data) ? response.data.data : [];
    return rows.map((row, idx) => mapHotelRecord(row, idx));
  } catch (err) {
    throw new Error(getAPIErrorMessage(err));
  }
}

export async function createHotel(payload: HotelPayload): Promise<HotelItem> {
  try {
    const response = await apiClient.post<HotelAPIResponse<RawHotelRecord>>(
      "/hotels",
      payload,
    );
    if (!response.data?.success) {
      throw new Error(
        extractAPIError(response.data?.error, "Gagal menambahkan hotel."),
      );
    }
    return mapHotelRecord(response.data.data ?? payload);
  } catch (err) {
    throw new Error(getAPIErrorMessage(err));
  }
}

export async function updateHotel(
  id: number,
  payload: HotelPayload,
): Promise<HotelItem> {
  try {
    const response = await apiClient.put<HotelAPIResponse<RawHotelRecord>>(
      `/hotels/${id}`,
      payload,
    );
    if (!response.data?.success) {
      throw new Error(
        extractAPIError(response.data?.error, "Gagal memperbarui hotel."),
      );
    }
    return mapHotelRecord(response.data.data ?? { ...payload, id });
  } catch (err) {
    throw new Error(getAPIErrorMessage(err));
  }
}

export async function deleteHotel(id: number): Promise<void> {
  try {
    const response = await apiClient.delete<HotelAPIResponse<unknown>>(
      `/hotels/${id}`,
    );
    if (!response.data?.success) {
      throw new Error(
        extractAPIError(response.data?.error, "Gagal menghapus hotel."),
      );
    }
  } catch (err) {
    throw new Error(getAPIErrorMessage(err));
  }
}
