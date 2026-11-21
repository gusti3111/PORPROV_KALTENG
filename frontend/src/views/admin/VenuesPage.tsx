import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import AdminNav from "@/components/AdminNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createVenue,
  deleteVenue,
  fetchVenuesAPI,
  updateVenue,
  type VenuePayload,
} from "@/api/venues";
import type { Venue } from "@/api/types";
import { useCompetitionStore } from "@/stores/competitionStore";
import { getVenuePhotoUrl } from "@/utils/venuePhoto";

type VenueFormState = {
  name: string;
  category: string;
  address: string;
  latitude: string;
  longitude: string;
  note: string;
  image_url: string;
};

const EMPTY_FORM: VenueFormState = {
  name: "",
  category: "",
  address: "",
  latitude: "",
  longitude: "",
  note: "",
  image_url: "",
};

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<VenueFormState>(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("Semua");
  const [previewImgError, setPreviewImgError] = useState<boolean>(false);
  const [failedThumbIds, setFailedThumbIds] = useState<Record<number, boolean>>({});

  const loadVenues = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const rows = await fetchVenuesAPI();
      setVenues(rows);
      setFailedThumbIds({});
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal memuat data venue.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVenues();
  }, [loadVenues]);

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPreviewImgError(false);
  };

  const handleStartEdit = (venue: Venue) => {
    setEditingId(venue.id);
    setForm({
      name: venue.name,
      category: venue.category,
      address: venue.address ?? "",
      latitude: String(venue.latitude ?? ""),
      longitude: String(venue.longitude ?? ""),
      note: venue.note ?? "",
      image_url:
        venue.image_url?.trim() ||
        getVenuePhotoUrl(venue.name, `${venue.category} ${venue.note || ""}`),
    });
    setPreviewImgError(false);
    setErrorMsg(null);
    setSuccessMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const name = form.name.trim();
    const category = form.category.trim();
    const lat = Number(form.latitude);
    const lng = Number(form.longitude);

    if (!name) {
      setErrorMsg("Nama venue (name) wajib diisi.");
      return;
    }
    if (!category) {
      setErrorMsg("Kategori venue (category) wajib diisi.");
      return;
    }
    if (
      form.latitude.trim() === "" ||
      form.longitude.trim() === "" ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      setErrorMsg("Koordinat latitude dan longitude wajib diisi dengan angka valid.");
      return;
    }

    const payload: VenuePayload = {
      name,
      category,
      address: form.address.trim(),
      latitude: lat,
      longitude: lng,
      position: [lat, lng],
      note: form.note.trim(),
      image_url: form.image_url.trim(),
    };

    setSaving(true);
    try {
      if (editingId !== null) {
        await updateVenue(editingId, payload);
        setSuccessMsg(`Venue "${name}" berhasil diperbarui.`);
      } else {
        await createVenue(payload);
        setSuccessMsg(`Venue "${name}" berhasil ditambahkan.`);
      }
      resetForm();
      await loadVenues();
      void useCompetitionStore.getState().fetchVenues();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal menyimpan data venue.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (venue: Venue) => {
    const confirmed = window.confirm(
      `Hapus venue "${venue.name}" dari database?`,
    );
    if (!confirmed) return;

    setDeletingId(venue.id);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await deleteVenue(venue.id);
      if (editingId === venue.id) {
        resetForm();
      }
      setSuccessMsg(`Venue "${venue.name}" berhasil dihapus.`);
      await loadVenues();
      void useCompetitionStore.getState().fetchVenues();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal menghapus venue.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const categoryOptions = useMemo(() => {
    const unique = Array.from(new Set(venues.map((v) => v.category).filter(Boolean)));
    return ["Semua", ...unique];
  }, [venues]);

  const visibleVenues = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase("id");
    return venues.filter((venue) => {
      const matchesCat =
        filterCategory === "Semua" || venue.category === filterCategory;
      const matchesQuery =
        !q ||
        `${venue.name} ${venue.category} ${venue.address} ${venue.note}`
          .toLocaleLowerCase("id")
          .includes(q);
      return matchesCat && matchesQuery;
    });
  }, [venues, filterCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <AdminNav />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Kelola Venue Pertandingan
            </h1>
            <p className="text-sm text-muted-foreground">
              Tambah, ubah, dan hapus lokasi venue serta titik koordinat peta PORPROV XIII.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void loadVenues()}
            disabled={loading}
            className="gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Muat Ulang
          </Button>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
          >
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
          >
            {successMsg}
          </div>
        )}

        <Card className="p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
            <h2 className="text-base font-bold flex items-center gap-2">
              {editingId !== null ? (
                <>
                  <Pencil className="h-4 w-4 text-primary" />
                  Edit Venue #{editingId}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 text-primary" />
                  Tambah Venue Baru
                </>
              )}
            </h2>
            {editingId !== null && (
              <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                Batal Edit
              </Button>
            )}
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="venue-name">
                  Nama Venue <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="venue-name"
                  required
                  placeholder="Contoh: GOR Sport Center Ratu Alamsyah"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="venue-category">
                  Kategori <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="venue-category"
                  required
                  placeholder="Contoh: Kompleks Sport Center"
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="venue-address">Alamat</Label>
                <Input
                  id="venue-address"
                  placeholder="Jl. Samari II, Madurejo, Pangkalan Bun"
                  value={form.address}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, address: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="venue-lat">
                  Latitude <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="venue-lat"
                  required
                  type="number"
                  step="any"
                  placeholder="-2.71962"
                  value={form.latitude}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, latitude: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="venue-lng">
                  Longitude <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="venue-lng"
                  required
                  type="number"
                  step="any"
                  placeholder="111.63098"
                  value={form.longitude}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, longitude: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="venue-note">Catatan / Cabor</Label>
                <Input
                  id="venue-note"
                  placeholder="Venue pertandingan cabang olahraga..."
                  value={form.note}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                <Label htmlFor="venue-image">URL / Path Gambar (image_url)</Label>
                <Input
                  id="venue-image"
                  placeholder="/venues2/gorSportCenter.webp atau https://..."
                  value={form.image_url}
                  onChange={(e) => {
                    setPreviewImgError(false);
                    setForm((prev) => ({ ...prev, image_url: e.target.value }));
                  }}
                />
              </div>

              {form.image_url.trim() && (
                <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-3">
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border bg-slate-100">
                    {!previewImgError ? (
                      <img
                        src={form.image_url.trim()}
                        alt="Preview gambar venue"
                        className="h-full w-full object-cover"
                        onError={() => setPreviewImgError(true)}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                        Gagal muat
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Preview gambar venue
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button type="submit" disabled={saving} className="gap-1.5">
                {saving
                  ? "Menyimpan..."
                  : editingId !== null
                    ? "Simpan Perubahan"
                    : "Tambah Venue"}
              </Button>
              {editingId !== null && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Batal
                </Button>
              )}
            </div>
          </form>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-bold">
              Daftar Venue ({visibleVenues.length})
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="pointer-events-none absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama atau alamat venue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <select
                aria-label="Filter kategori venue"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="h-9 max-w-[220px] rounded-md border border-input bg-background px-3 text-sm"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "Semua" ? "Semua Kategori" : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Memuat data venue dari database...
            </div>
          ) : visibleVenues.length === 0 ? (
            <div className="rounded-lg border border-dashed py-10 text-center">
              <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-semibold">
                Belum ada data venue yang sesuai
              </p>
              <p className="text-xs text-muted-foreground">
                Tambahkan venue baru melalui form di atas atau ubah kata kunci pencarian.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {visibleVenues.map((venue) => {
                const thumbFailed = Boolean(failedThumbIds[venue.id]);
                const imgSrc =
                  (venue.image_url || "").trim() ||
                  getVenuePhotoUrl(
                    venue.name,
                    `${venue.category} ${venue.note || ""}`,
                  );
                return (
                  <div
                    key={venue.id}
                    className="flex min-w-0 flex-col justify-between gap-3 rounded-xl border bg-card p-3.5 shadow-xs"
                  >
                    <div className="flex min-w-0 gap-3">
                      <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {imgSrc && !thumbFailed ? (
                          <img
                            src={imgSrc}
                            alt={venue.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={() =>
                              setFailedThumbIds((prev) => ({
                                ...prev,
                                [venue.id]: true,
                              }))
                            }
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                            <MapPin className="h-5 w-5" />
                            <span className="mt-0.5 text-[9px]">No photo</span>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="outline" className="max-w-full shrink-0 truncate text-[10px]">
                            {venue.category}
                          </Badge>
                          <span className="shrink-0 text-[11px] font-mono text-muted-foreground">
                            {venue.latitude.toFixed(5)}, {venue.longitude.toFixed(5)}
                          </span>
                        </div>
                        <h3 className="min-w-0 break-words line-clamp-1 text-sm font-bold">
                          {venue.name}
                        </h3>
                        {venue.address && (
                          <p className="min-w-0 break-words line-clamp-2 text-xs text-muted-foreground">
                            <MapPin className="mr-1 inline h-3 w-3 shrink-0" />
                            {venue.address}
                          </p>
                        )}
                        {venue.note && (
                          <p className="min-w-0 break-words line-clamp-2 text-[11px] text-emerald-700">
                            {venue.note}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-end gap-1.5 border-t pt-2.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartEdit(venue)}
                        className="h-7 shrink-0 gap-1 px-2.5 text-xs"
                      >
                        <Pencil className="h-3 w-3 shrink-0" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={deletingId === venue.id}
                        onClick={() => void handleDelete(venue)}
                        className="h-7 shrink-0 gap-1 px-2.5 text-xs"
                      >
                        <Trash2 className="h-3 w-3 shrink-0" />
                        {deletingId === venue.id ? "..." : "Hapus"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
