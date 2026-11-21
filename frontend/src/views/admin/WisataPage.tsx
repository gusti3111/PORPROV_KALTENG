import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Compass,
  ExternalLink,
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
  createWisata,
  deleteWisata,
  fetchWisata,
  updateWisata,
  type WisataItem,
  type WisataPayload,
} from "@/api/wisata";

type WisataFormState = {
  name: string;
  category: string;
  district: string;
  description: string;
  highlights: string;
  image: string;
  mapsUrl: string;
  openInfo: string;
};

const EMPTY_FORM: WisataFormState = {
  name: "",
  category: "",
  district: "Arut Selatan",
  description: "",
  highlights: "",
  image: "",
  mapsUrl: "",
  openInfo: "",
};

export default function WisataPage() {
  const [items, setItems] = useState<WisataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<WisataFormState>(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("Semua");
  const [previewImgError, setPreviewImgError] = useState<boolean>(false);
  const [failedThumbIds, setFailedThumbIds] = useState<Record<number, boolean>>({});

  const loadItems = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const rows = await fetchWisata();
      setItems(rows);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal memuat data destinasi wisata.",
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

  const handleStartEdit = (item: WisataItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      category: item.category,
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
      setErrorMsg("Nama destinasi wisata (name) wajib diisi.");
      return;
    }
    if (!category) {
      setErrorMsg("Kategori wisata (category) wajib diisi.");
      return;
    }

    const payload: WisataPayload = {
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
        await updateWisata(editingId, payload);
        setSuccessMsg(`Destinasi "${name}" berhasil diperbarui.`);
      } else {
        await createWisata(payload);
        setSuccessMsg(`Destinasi "${name}" berhasil ditambahkan.`);
      }
      resetForm();
      await loadItems();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal menyimpan data wisata.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: WisataItem) => {
    const confirmed = window.confirm(
      `Hapus destinasi wisata "${item.name}" dari database?`,
    );
    if (!confirmed) return;

    setDeletingId(item.id);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await deleteWisata(item.id);
      if (editingId === item.id) {
        resetForm();
      }
      setSuccessMsg(`Destinasi "${item.name}" berhasil dihapus.`);
      await loadItems();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal menghapus data wisata.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const categoryOptions = useMemo(() => {
    const unique = Array.from(new Set(items.map((w) => w.category).filter(Boolean)));
    return ["Semua", ...unique];
  }, [items]);

  const visibleItems = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase("id");
    return items.filter((item) => {
      const matchesCat =
        filterCategory === "Semua" || item.category === filterCategory;
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
              Kelola Destinasi Wisata
            </h1>
            <p className="text-sm text-muted-foreground">
              Tambah, ubah, dan hapus data destinasi wisata Kotawaringin Barat yang tampil dinamis di halaman Informasi publik.
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

        {/* Form Tambah / Edit Wisata */}
        <Card className="p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
            <h2 className="text-base font-bold flex items-center gap-2">
              {editingId !== null ? (
                <>
                  <Pencil className="h-4 w-4 text-primary" />
                  Edit Destinasi Wisata #{editingId}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 text-primary" />
                  Tambah Destinasi Wisata Baru
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
                <Label htmlFor="wisata-name">
                  Nama Destinasi <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="wisata-name"
                  required
                  placeholder="Contoh: Taman Nasional Tanjung Puting"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="wisata-category">
                  Kategori <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="wisata-category"
                  required
                  placeholder="Contoh: WISATA BAHARI & PESISIR"
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="wisata-district">Kecamatan / Lokasi</Label>
                <Input
                  id="wisata-district"
                  placeholder="Contoh: Kecamatan Kumai"
                  value={form.district}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, district: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                <Label htmlFor="wisata-description">Deskripsi</Label>
                <Input
                  id="wisata-description"
                  placeholder="Deskripsi singkat daya tarik destinasi wisata..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="wisata-highlights">Highlight / Daya Tarik</Label>
                <Input
                  id="wisata-highlights"
                  placeholder="Dermaga Ulin Panjang, Sunset Spektakuler, Spot Foto..."
                  value={form.highlights}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, highlights: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="wisata-open-info">Info Buka / Akses</Label>
                <Input
                  id="wisata-open-info"
                  placeholder="± 30 Menit dari Pusat Kota / Buka Setiap Hari"
                  value={form.openInfo}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, openInfo: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="wisata-maps">URL Google Maps</Label>
                <Input
                  id="wisata-maps"
                  placeholder="https://www.google.com/maps/search/?api=1&query=..."
                  value={form.mapsUrl}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, mapsUrl: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="wisata-image">URL Gambar</Label>
                <Input
                  id="wisata-image"
                  placeholder="/wisata_real/tanjungputing.webp atau https://..."
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
                        alt="Preview wisata"
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
                    Preview gambar destinasi wisata
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
                    : "Tambah Destinasi"}
              </Button>
              {editingId !== null && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Batal
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Daftar Wisata */}
        <Card className="p-5 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-bold">
              Daftar Destinasi Wisata ({visibleItems.length})
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="pointer-events-none absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama, lokasi, atau daya tarik..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <select
                aria-label="Filter kategori wisata"
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
              Memuat data destinasi wisata dari database...
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="rounded-lg border border-dashed py-10 text-center">
              <Compass className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-semibold">
                Belum ada destinasi wisata yang sesuai
              </p>
              <p className="text-xs text-muted-foreground">
                Tambahkan destinasi baru melalui form di atas atau ubah kata kunci pencarian.
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
                      <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
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
                          <div className="flex h-full w-full items-center justify-center text-slate-400">
                            <Compass className="h-6 w-6" />
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
                          <p className="truncate text-[11px] font-medium text-emerald-700">
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
