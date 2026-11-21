import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ExternalLink,
  HeartPulse,
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
  KESEHATAN_CATEGORIES,
  createKesehatan,
  deleteKesehatan,
  fetchKesehatan,
  updateKesehatan,
  type KesehatanItem,
  type KesehatanPayload,
} from "@/api/kesehatan";

type KesehatanFormState = {
  name: string;
  category: string;
  district: string;
  description: string;
  highlights: string;
  image: string;
  mapsUrl: string;
  openInfo: string;
};

const EMPTY_FORM: KesehatanFormState = {
  name: "",
  category: "RUMAH SAKIT",
  district: "Arut Selatan",
  description: "",
  highlights: "",
  image: "",
  mapsUrl: "",
  openInfo: "",
};

export default function KesehatanPage() {
  const [items, setItems] = useState<KesehatanItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<KesehatanFormState>(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("Semua");
  const [previewImgError, setPreviewImgError] = useState<boolean>(false);
  const [failedThumbIds, setFailedThumbIds] = useState<Record<number, boolean>>({});

  const loadItems = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const rows = await fetchKesehatan();
      setItems(rows);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal memuat data layanan kesehatan.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPreviewImgError(false);
  };

  const handleStartEdit = (item: KesehatanItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      category: item.category || "RUMAH SAKIT",
      district: item.district || "Arut Selatan",
      description: item.description,
      highlights: item.highlights,
      image: item.image,
      mapsUrl: item.mapsUrl,
      openInfo: item.openInfo,
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
    if (!name) {
      setErrorMsg("Nama fasilitas kesehatan (name) wajib diisi.");
      return;
    }
    if (!category) {
      setErrorMsg("Kategori layanan kesehatan (category) wajib diisi.");
      return;
    }

    const payload: KesehatanPayload = {
      name,
      category,
      district: form.district.trim() || "Arut Selatan",
      description: form.description.trim(),
      highlights: form.highlights.trim(),
      image: form.image.trim(),
      mapsUrl: form.mapsUrl.trim(),
      openInfo: form.openInfo.trim(),
    };

    setSaving(true);
    try {
      if (editingId !== null) {
        await updateKesehatan(editingId, payload);
        setSuccessMsg(`Layanan kesehatan "${name}" berhasil diperbarui.`);
      } else {
        await createKesehatan(payload);
        setSuccessMsg(`Layanan kesehatan "${name}" berhasil ditambahkan.`);
      }
      resetForm();
      await loadItems();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal menyimpan data kesehatan.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: KesehatanItem) => {
    const confirmed = window.confirm(
      `Hapus fasilitas kesehatan "${item.name}" dari database?`,
    );
    if (!confirmed) return;

    setDeletingId(item.id);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await deleteKesehatan(item.id);
      if (editingId === item.id) {
        resetForm();
      }
      setSuccessMsg(`Layanan kesehatan "${item.name}" berhasil dihapus.`);
      await loadItems();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal menghapus layanan kesehatan.",
      );
    } finally {
      setDeletingId(null);
    }
  };
  // filtering data layanan Kesehatan
  const visibleItems = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase("id");
    return items.filter((item) => {
      const matchesCat =
        filterCategory === "Semua" ||
        item.category
          .toLocaleLowerCase("id")
          .includes(filterCategory.toLocaleLowerCase("id"));
      const matchesQuery =
        !q ||
        `${item.name} ${item.category} ${item.district} ${item.description} ${item.highlights} ${item.openInfo}`
          .toLocaleLowerCase("id")
          .includes(q);
      return matchesCat && matchesQuery;
    });
  }, [items, filterCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <AdminNav />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Kelola Layanan Kesehatan
            </h1>
            <p className="text-sm text-muted-foreground">
              Tambah, ubah, dan hapus data rumah sakit, puskesmas, klinik, dan apotek pendukung PORPROV XIII.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void loadItems()}
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
                  Edit Layanan Kesehatan #{editingId}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 text-primary" />
                  Tambah Layanan Kesehatan Baru
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
                <Label htmlFor="kesehatan-name">
                  Nama Fasilitas <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="kesehatan-name"
                  required
                  placeholder="Contoh: RSUD Sultan Imanuddin Pangkalan Bun"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="kesehatan-category">
                  Kategori <span className="text-red-500">*</span>
                </Label>
                <select
                  id="kesehatan-category"
                  required
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
                >
                  {KESEHATAN_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="kesehatan-district">Kecamatan / Lokasi</Label>
                <Input
                  id="kesehatan-district"
                  placeholder="Contoh: Kecamatan Arut Selatan"
                  value={form.district}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, district: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                <Label htmlFor="kesehatan-description">Deskripsi</Label>
                <Input
                  id="kesehatan-description"
                  placeholder="Layanan IGD 24 jam, rawat inap, poli umum & spesialis..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="kesehatan-highlights">Layanan Unggulan / Fasilitas</Label>
                <Input
                  id="kesehatan-highlights"
                  placeholder="IGD 24 Jam, Ambulans, Farmasi, Laboratorium"
                  value={form.highlights}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, highlights: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="kesehatan-open-info">Jam Operasional</Label>
                <Input
                  id="kesehatan-open-info"
                  placeholder="Buka 24 Jam / Setiap Hari"
                  value={form.openInfo}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, openInfo: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="kesehatan-maps">URL Google Maps</Label>
                <Input
                  id="kesehatan-maps"
                  placeholder="https://www.google.com/maps/search/?api=1&query=..."
                  value={form.mapsUrl}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, mapsUrl: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="kesehatan-image">URL Gambar (opsional)</Label>
                <Input
                  id="kesehatan-image"
                  placeholder="Kosongkan jika belum ada foto, atau isi URL gambar"
                  value={form.image}
                  onChange={(e) => {
                    setPreviewImgError(false);
                    setForm((prev) => ({ ...prev, image: e.target.value }));
                  }}
                />
              </div>

              {form.image.trim() && (
                <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-3">
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border bg-slate-100">
                    {!previewImgError ? (
                      <img
                        src={form.image.trim()}
                        alt="Preview layanan kesehatan"
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
                    Preview foto fasilitas kesehatan
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
                    : "Tambah Fasilitas"}
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
              Daftar Layanan Kesehatan ({visibleItems.length})
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="pointer-events-none absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama, kategori, atau lokasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <select
                aria-label="Filter kategori kesehatan"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="Semua">Semua Kategori</option>
                {KESEHATAN_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Memuat data layanan kesehatan dari database...
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="rounded-lg border border-dashed py-10 text-center">
              <HeartPulse className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-semibold">
                Belum ada data layanan kesehatan yang sesuai
              </p>
              <p className="text-xs text-muted-foreground">
                Tambahkan fasilitas baru melalui form di atas atau ubah kata kunci pencarian.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {visibleItems.map((item) => {
                const thumbFailed = Boolean(failedThumbIds[item.id]);
                return (
                  <div
                    key={item.id}
                    className="flex min-w-0 flex-col justify-between gap-3 rounded-xl border bg-card p-3.5 shadow-xs"
                  >
                    <div className="flex min-w-0 gap-3">
                      <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-rose-50">
                        {item.image && !thumbFailed ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={() =>
                              setFailedThumbIds((prev) => ({
                                ...prev,
                                [item.id]: true,
                              }))
                            }
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-rose-500">
                            <HeartPulse className="h-6 w-6" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <Badge
                          variant="outline"
                          className="max-w-full truncate text-[10px]"
                        >
                          {item.category}
                        </Badge>
                        <h3 className="min-w-0 break-words line-clamp-1 text-sm font-bold">
                          {item.name}
                        </h3>
                        {item.district && (
                          <p className="min-w-0 break-words line-clamp-1 text-xs text-muted-foreground">
                            <MapPin className="mr-1 inline h-3 w-3" />
                            {item.district}
                          </p>
                        )}
                        {item.openInfo && (
                          <p className="truncate text-[11px] font-medium text-rose-700">
                            {item.openInfo}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2.5">
                      <div className="flex min-w-0 items-center gap-2 text-[11px] text-muted-foreground">
                        {item.mapsUrl && (
                          <a
                            href={item.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex shrink-0 items-center gap-1 font-medium text-primary hover:underline"
                          >
                            Maps <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartEdit(item)}
                          className="h-7 gap-1 px-2.5 text-xs"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={deletingId === item.id}
                          onClick={() => void handleDelete(item)}
                          className="h-7 gap-1 px-2.5 text-xs"
                        >
                          <Trash2 className="h-3 w-3" />
                          {deletingId === item.id ? "..." : "Hapus"}
                        </Button>
                      </div>
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
