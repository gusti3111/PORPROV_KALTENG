import { apiClient, getAPIErrorMessage } from "../api/client";

/**
 * Direktori Tempat Makan, Kuliner & Cafe Pangkalan Bun - PORPROV XIII Kalteng
 * Data diambil secara dinamis dari backend API `/api/v1/umkm`.
 */

export type KobarUMKMType =
  | "warung"
  | "cafe"
  | "rumah_makan"
  | "restoran"
  | "lainnya";

export type KobarUMKMItem = {
  id: number;
  nama: string;
  tipe: KobarUMKMType;
  categoryLabel: string;
  kategori_google: string;
  culinaryTheme: string;
  culinaryThemeKey: string;
  deskripsi?: string;
  signatureDish: string;
  kecamatan: string;
  kecamatanFull: string;
  alamat: string;
  rating_google: number;
  jumlah_ulasan: number;
  ada_rating: boolean;
  telepon: string | null;
  jam_buka: string | null;
  instagram?: string | null;
  reservasi?: string;
  situs_web: string | null;
  koordinat: { lat: number; lng: number } | null;
  place_id: string;
  google_maps_url: string;
  image: string;
  recommended: boolean;
  priceRange: string;
};

export type UMKMPayload = {
  nama: string;
  tipe: KobarUMKMType;
  categoryLabel: string;
  kategori_google: string;
  culinaryTheme: string;
  culinaryThemeKey: string;
  deskripsi?: string;
  signatureDish: string;
  kecamatan: string;
  kecamatanFull: string;
  alamat: string;
  rating_google: number;
  jumlah_ulasan: number;
  ada_rating: boolean;
  telepon: string | null;
  jam_buka: string | null;
  instagram?: string | null;
  reservasi?: string;
  situs_web: string | null;
  koordinat: { lat: number; lng: number } | null;
  place_id: string;
  google_maps_url: string;
  image: string;
  recommended: boolean;
  priceRange: string;
};

export type UMKMFilterParams = {
  tipe?: string;
  culinary_theme_key?: string;
  kecamatan?: string;
  recommended?: boolean;
  search?: string;
};

type UMKMAPIResponse<T> = {
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

function normalizeUMKMType(raw?: string): KobarUMKMType {
  if (
    raw === "warung" ||
    raw === "cafe" ||
    raw === "rumah_makan" ||
    raw === "restoran" ||
    raw === "lainnya"
  ) {
    return raw;
  }
  return "lainnya";
}

function normalizeUMKMItem(raw: Partial<KobarUMKMItem>, idx = 0): KobarUMKMItem {
  const rating = Number(raw.rating_google ?? 0);
  const reviews = Number(raw.jumlah_ulasan ?? 0);
  const hasValidRating =
    typeof raw.ada_rating === "boolean"
      ? raw.ada_rating
      : Number.isFinite(rating) && rating > 0;

  return {
    id: Number(raw.id ?? idx + 1),
    nama: (raw.nama ?? "").trim(),
    tipe: normalizeUMKMType(raw.tipe),
    categoryLabel: (raw.categoryLabel ?? "").trim(),
    kategori_google: (raw.kategori_google ?? "").trim(),
    culinaryTheme: (raw.culinaryTheme ?? "").trim(),
    culinaryThemeKey: (raw.culinaryThemeKey ?? "").trim(),
    deskripsi: raw.deskripsi ?? "",
    signatureDish: (raw.signatureDish ?? "").trim(),
    kecamatan: (raw.kecamatan ?? "Arut Selatan").trim(),
    kecamatanFull: (
      raw.kecamatanFull ??
      raw.kecamatan ??
      "Arut Selatan (Pangkalan Bun)"
    ).trim(),
    alamat: (raw.alamat ?? "").trim(),
    rating_google: Number.isFinite(rating) ? rating : 0,
    jumlah_ulasan: Number.isFinite(reviews) ? reviews : 0,
    ada_rating: hasValidRating,
    telepon: raw.telepon ?? null,
    jam_buka: raw.jam_buka ?? null,
    instagram: raw.instagram ?? null,
    reservasi: raw.reservasi ?? "",
    situs_web: raw.situs_web ?? null,
    koordinat:
      raw.koordinat &&
      typeof raw.koordinat.lat === "number" &&
      typeof raw.koordinat.lng === "number"
        ? raw.koordinat
        : null,
    place_id: raw.place_id ?? "",
    google_maps_url: (raw.google_maps_url ?? "").trim(),
    image: (raw.image ?? "").trim(),
    recommended: Boolean(raw.recommended),
    priceRange: (raw.priceRange ?? "").trim(),
  };
}

export async function fetchUMKM(
  filters?: UMKMFilterParams,
): Promise<KobarUMKMItem[]> {
  const params: Record<string, string> = {};
  if (filters?.tipe && filters.tipe !== "Semua") {
    params.tipe = filters.tipe;
  }
  if (filters?.culinary_theme_key && filters.culinary_theme_key !== "Semua") {
    params.culinary_theme_key = filters.culinary_theme_key;
  }
  if (filters?.kecamatan && filters.kecamatan !== "Semua Kecamatan") {
    params.kecamatan = filters.kecamatan.replace(/\s*\([^)]*\)\s*$/, "").trim();
  }
  if (filters?.recommended) {
    params.recommended = "true";
  }
  if (filters?.search && filters.search.trim()) {
    params.search = filters.search.trim();
  }

  try {
    const response = await apiClient.get<UMKMAPIResponse<Partial<KobarUMKMItem>[]>>(
      "/umkm",
      { params },
    );
    if (!response.data?.success) {
      throw new Error(
        extractAPIError(response.data?.error, "Gagal memuat data kuliner & UMKM."),
      );
    }
    const rows = Array.isArray(response.data.data) ? response.data.data : [];
    return rows.map((row, idx) => normalizeUMKMItem(row, idx));
  } catch (err) {
    throw new Error(getAPIErrorMessage(err));
  }
}

export async function createUMKM(payload: UMKMPayload): Promise<KobarUMKMItem> {
  try {
    const response = await apiClient.post<UMKMAPIResponse<Partial<KobarUMKMItem>>>(
      "/umkm",
      payload,
    );
    if (!response.data?.success) {
      throw new Error(
        extractAPIError(response.data?.error, "Gagal menambahkan data UMKM."),
      );
    }
    return normalizeUMKMItem(response.data.data ?? payload);
  } catch (err) {
    throw new Error(getAPIErrorMessage(err));
  }
}

export async function updateUMKM(
  id: number,
  payload: UMKMPayload,
): Promise<KobarUMKMItem> {
  try {
    const response = await apiClient.put<UMKMAPIResponse<Partial<KobarUMKMItem>>>(
      `/umkm/${id}`,
      payload,
    );
    if (!response.data?.success) {
      throw new Error(
        extractAPIError(response.data?.error, "Gagal memperbarui data UMKM."),
      );
    }
    return normalizeUMKMItem(response.data.data ?? { ...payload, id });
  } catch (err) {
    throw new Error(getAPIErrorMessage(err));
  }
}

export async function deleteUMKM(id: number): Promise<void> {
  try {
    const response = await apiClient.delete<UMKMAPIResponse<unknown>>(
      `/umkm/${id}`,
    );
    if (!response.data?.success) {
      throw new Error(
        extractAPIError(response.data?.error, "Gagal menghapus data UMKM."),
      );
    }
  } catch (err) {
    throw new Error(getAPIErrorMessage(err));
  }
}

export const kobarDistricts: string[] = [
  "Semua Kecamatan",
  "Arut Selatan (Pangkalan Bun)",
];

export const kobarCategories: {
  label: string;
  value: "Semua" | KobarUMKMType;
}[] = [
  { label: "Semua Kategori", value: "Semua" },
  { label: "Kafe & Kopi", value: "cafe" },
  { label: "Restoran", value: "restoran" },
  { label: "Rumah Makan", value: "rumah_makan" },
  { label: "Warung Makan", value: "warung" },
  { label: "Food Court & UMKM", value: "lainnya" },
];

export const kobarCulinaryThemes: { label: string; key: string; icon: string }[] = [
  { label: "Semua Sajian", key: "Semua", icon: "Utensils" },
  { label: "Kedai Kopi & Kafe", key: "coffee_cafe", icon: "Coffee" },
  { label: "Kafe, Kopi & Bakery", key: "bakery", icon: "Cake" },
  { label: "Restoran Nusantara", key: "restoran_nusantara", icon: "Store" },
  { label: "Seafood & Ikan Bakar", key: "seafood", icon: "Fish" },
  { label: "Rumah Makan", key: "rumah_makan", icon: "Utensils" },
  { label: "Bakso, Soto & Mie", key: "bakso_soto", icon: "Soup" },
  { label: "Cepat Saji & Ayam", key: "ayam_bebek", icon: "Drumstick" },
  { label: "Warung & Food Court", key: "warung_tradisional", icon: "Flame" },
  { label: "Masakan Jepang & BBQ", key: "japanese", icon: "Sparkles" },
  { label: "Aneka Sate", key: "sate", icon: "Flame" },
];
