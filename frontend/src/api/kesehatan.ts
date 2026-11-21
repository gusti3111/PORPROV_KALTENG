import { apiClient, getAPIErrorMessage } from "./client";

export const KESEHATAN_CATEGORIES = [
  "RUMAH SAKIT",
  "PUSKESMAS",
  "KLINIK",
  "APOTEK",
] as const;

export type KesehatanCategory = (typeof KESEHATAN_CATEGORIES)[number];

export type KesehatanItem = {
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

export type KesehatanPayload = {
  name: string;
  category: string;
  district: string;
  description: string;
  highlights: string;
  image: string;
  mapsUrl: string;
  openInfo: string;
};

export type KesehatanFilterParams = {
  category?: string;
  district?: string;
  search?: string;
};

type KesehatanAPIResponse<T> = {
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

function normalizeKesehatanItem(
  raw: Partial<KesehatanItem>,
  idx = 0,
): KesehatanItem {
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

export async function fetchKesehatan(
  filters?: KesehatanFilterParams,
): Promise<KesehatanItem[]> {
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
      KesehatanAPIResponse<Partial<KesehatanItem>[]>
    >("/kesehatan", { params });
    if (!response.data?.success) {
      throw new Error(
        extractAPIError(
          response.data?.error,
          "Gagal memuat data layanan kesehatan.",
        ),
      );
    }
    const rows = Array.isArray(response.data.data) ? response.data.data : [];
    return rows.map((row, idx) => normalizeKesehatanItem(row, idx));
  } catch (err) {
    throw new Error(getAPIErrorMessage(err));
  }
}

export async function createKesehatan(
  payload: KesehatanPayload,
): Promise<KesehatanItem> {
  try {
    const response = await apiClient.post<
      KesehatanAPIResponse<Partial<KesehatanItem>>
    >("/kesehatan", payload);
    if (!response.data?.success) {
      throw new Error(
        extractAPIError(
          response.data?.error,
          "Gagal menambahkan layanan kesehatan.",
        ),
      );
    }
    return normalizeKesehatanItem(response.data.data ?? payload);
  } catch (err) {
    throw new Error(getAPIErrorMessage(err));
  }
}

export async function updateKesehatan(
  id: number,
  payload: KesehatanPayload,
): Promise<KesehatanItem> {
  try {
    const response = await apiClient.put<
      KesehatanAPIResponse<Partial<KesehatanItem>>
    >(`/kesehatan/${id}`, payload);
    if (!response.data?.success) {
      throw new Error(
        extractAPIError(
          response.data?.error,
          "Gagal memperbarui layanan kesehatan.",
        ),
      );
    }
    return normalizeKesehatanItem(response.data.data ?? { ...payload, id });
  } catch (err) {
    throw new Error(getAPIErrorMessage(err));
  }
}

export async function deleteKesehatan(id: number): Promise<void> {
  try {
    const response = await apiClient.delete<KesehatanAPIResponse<unknown>>(
      `/kesehatan/${id}`,
    );
    if (!response.data?.success) {
      throw new Error(
        extractAPIError(
          response.data?.error,
          "Gagal menghapus layanan kesehatan.",
        ),
      );
    }
  } catch (err) {
    throw new Error(getAPIErrorMessage(err));
  }
}
