import { apiClient, getAPIErrorMessage } from "./client";

export type GaleriItem = {
  id: number;
  title: string;
  category: string;
  caption: string;
  image_url: string;
  photographer: string;
  event_date: string;
  is_featured: boolean;
  created_at: string;
};

export type GaleriPayload = {
  title: string;
  category: string;
  caption: string;
  image_url: string;
  photographer: string;
  event_date: string;
  is_featured: boolean;
};

export type GaleriFilterParams = {
  category?: string;
  is_featured?: boolean | string;
  search?: string;
};

type GaleriAPIResponse<T> = {
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

function normalizeGaleriItem(raw: Partial<GaleriItem>, idx = 0): GaleriItem {
  return {
    id: Number(raw.id ?? idx + 1),
    title: (raw.title ?? "").trim(),
    category: (raw.category ?? "Galeri").trim(),
    caption: (raw.caption ?? "").trim(),
    image_url: (raw.image_url ?? "").trim(),
    photographer: (raw.photographer ?? "").trim(),
    event_date: (raw.event_date ?? "").trim(),
    is_featured: Boolean(raw.is_featured),
    created_at: (raw.created_at ?? "").trim(),
  };
}

export async function fetchGaleri(
  filters?: GaleriFilterParams,
): Promise<GaleriItem[]> {
  const params: Record<string, string> = {};
  if (filters?.category && filters.category !== "Semua") {
    params.category = filters.category;
  }
  if (
    filters?.is_featured === true ||
    filters?.is_featured === "true"
  ) {
    params.is_featured = "true";
  }
  if (filters?.search && filters.search.trim()) {
    params.search = filters.search.trim();
  }

  try {
    const response = await apiClient.get<
      GaleriAPIResponse<Partial<GaleriItem>[]>
    >("/galeri", { params });
    if (!response.data?.success) {
      throw new Error(
        extractAPIError(response.data?.error, "Gagal memuat data galeri."),
      );
    }
    const rows = Array.isArray(response.data.data) ? response.data.data : [];
    return rows.map((row, idx) => normalizeGaleriItem(row, idx));
  } catch (err) {
    throw new Error(getAPIErrorMessage(err));
  }
}

export async function fetchGaleriById(id: number): Promise<GaleriItem> {
  try {
    const response = await apiClient.get<GaleriAPIResponse<Partial<GaleriItem>>>(
      `/galeri/${id}`,
    );
    if (!response.data?.success || !response.data.data) {
      throw new Error(
        extractAPIError(response.data?.error, "Foto galeri tidak ditemukan."),
      );
    }
    return normalizeGaleriItem(response.data.data);
  } catch (err) {
    throw new Error(getAPIErrorMessage(err));
  }
}

export async function createGaleri(payload: GaleriPayload): Promise<GaleriItem> {
  try {
    const response = await apiClient.post<GaleriAPIResponse<Partial<GaleriItem>>>(
      "/galeri",
      payload,
    );
    if (!response.data?.success) {
      throw new Error(
        extractAPIError(response.data?.error, "Gagal menambahkan foto galeri."),
      );
    }
    return normalizeGaleriItem(response.data.data ?? payload);
  } catch (err) {
    throw new Error(getAPIErrorMessage(err));
  }
}

export async function updateGaleri(
  id: number,
  payload: GaleriPayload,
): Promise<GaleriItem> {
  try {
    const response = await apiClient.put<GaleriAPIResponse<Partial<GaleriItem>>>(
      `/galeri/${id}`,
      payload,
    );
    if (!response.data?.success) {
      throw new Error(
        extractAPIError(response.data?.error, "Gagal memperbarui foto galeri."),
      );
    }
    return normalizeGaleriItem(response.data.data ?? { ...payload, id });
  } catch (err) {
    throw new Error(getAPIErrorMessage(err));
  }
}

export async function deleteGaleri(id: number): Promise<void> {
  try {
    const response = await apiClient.delete<GaleriAPIResponse<unknown>>(
      `/galeri/${id}`,
    );
    if (!response.data?.success) {
      throw new Error(
        extractAPIError(response.data?.error, "Gagal menghapus foto galeri."),
      );
    }
  } catch (err) {
    throw new Error(getAPIErrorMessage(err));
  }
}
