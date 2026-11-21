import { apiClient, getAPIErrorMessage } from "../api/client";

/**
 * Direktori Destinasi Wisata Kotawaringin Barat - PORPROV XIII Kalteng
 * Data diambil secara dinamis dari backend API `/api/v1/wisata`.
 */

export type WisataItem = {
  id: number;
  name: string;
  category: string;
  district: string;
  description: string;
  highlights: string;
  image: string;
  mapsUrl: string;
  openInfo: string;
};

export type WisataPayload = {
  name: string;
  category: string;
  district: string;
  description: string;
  highlights: string;
  image: string;
  mapsUrl: string;
  openInfo: string;
};

export type WisataFilterParams = {
  category?: string;
  district?: string;
  search?: string;
};

type WisataAPIResponse<T> = {
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

function normalizeWisataItem(raw: Partial<WisataItem>, idx = 0): WisataItem {
  return {
    id: Number(raw.id ?? idx + 1),
    name: (raw.name ?? "").trim(),
    category: (raw.category ?? "").trim(),
    district: (raw.district ?? "").trim(),
    description: (raw.description ?? "").trim(),
    highlights: (raw.highlights ?? "").trim(),
    image: (raw.image ?? "").trim(),
    mapsUrl: (raw.mapsUrl ?? "").trim(),
    openInfo: (raw.openInfo ?? "").trim(),
  };
}

export async function fetchWisata(
  filters?: WisataFilterParams,
): Promise<WisataItem[]> {
  const params: Record<string, string> = {};
  if (filters?.category && filters.category !== "Semua") {
    params.category = filters.category;
  }
  if (filters?.district && filters.district !== "Semua") {
    params.district = filters.district;
  }
  if (filters?.search && filters.search.trim()) {
    params.search = filters.search.trim();
  }

  try {
    const response = await apiClient.get<
      WisataAPIResponse<Partial<WisataItem>[]>
    >("/wisata", { params });
    if (!response.data?.success) {
      throw new Error(
        extractAPIError(
          response.data?.error,
          "Gagal memuat data destinasi wisata.",
        ),
      );
    }
    const rows = Array.isArray(response.data.data) ? response.data.data : [];
    return rows.map((row, idx) => normalizeWisataItem(row, idx));
  } catch (err) {
    throw new Error(getAPIErrorMessage(err));
  }
}

export async function createWisata(payload: WisataPayload): Promise<WisataItem> {
  try {
    const response = await apiClient.post<
      WisataAPIResponse<Partial<WisataItem>>
    >("/wisata", payload);
    if (!response.data?.success) {
      throw new Error(
        extractAPIError(
          response.data?.error,
          "Gagal menambahkan destinasi wisata.",
        ),
      );
    }
    return normalizeWisataItem(response.data.data ?? payload);
  } catch (err) {
    throw new Error(getAPIErrorMessage(err));
  }
}

export async function updateWisata(
  id: number,
  payload: WisataPayload,
): Promise<WisataItem> {
  try {
    const response = await apiClient.put<
      WisataAPIResponse<Partial<WisataItem>>
    >(`/wisata/${id}`, payload);
    if (!response.data?.success) {
      throw new Error(
        extractAPIError(
          response.data?.error,
          "Gagal memperbarui destinasi wisata.",
        ),
      );
    }
    return normalizeWisataItem(response.data.data ?? { ...payload, id });
  } catch (err) {
    throw new Error(getAPIErrorMessage(err));
  }
}

export async function deleteWisata(id: number): Promise<void> {
  try {
    const response = await apiClient.delete<WisataAPIResponse<unknown>>(
      `/wisata/${id}`,
    );
    if (!response.data?.success) {
      throw new Error(
        extractAPIError(
          response.data?.error,
          "Gagal menghapus destinasi wisata.",
        ),
      );
    }
  } catch (err) {
    throw new Error(getAPIErrorMessage(err));
  }
}
