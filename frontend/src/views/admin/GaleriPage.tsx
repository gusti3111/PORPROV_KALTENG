import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Camera,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import AdminNav from "@/components/AdminNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createGaleri,
  deleteGaleri,
  fetchGaleri,
  updateGaleri,
  type GaleriItem,
  type GaleriPayload,
} from "@/api/galeri";

type GaleriFormState = {
  title: string;
  category: string;
  caption: string;
  image_url: string;
  photographer: string;
  event_date: string;
  is_featured: boolean;
};

const EMPTY_FORM: GaleriFormState = {
  title: "",
  category: "Galeri",
  caption: "",
  image_url: "",
  photographer: "",
  event_date: "",
  is_featured: false,
};

export default function GaleriPage() {
  const [items, setItems] = useState<GaleriItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<GaleriFormState>(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("Semua");
  const [previewImgError, setPreviewImgError] = useState<boolean>(false);
  const [failedThumbIds, setFailedThumbIds] = useState<Record<number, boolean>>({});

  const loadItems = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const rows = await fetchGaleri();
      setItems(rows);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal memuat data galeri.",
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

  const handleStartEdit = (item: GaleriItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      category: item.category || "Galeri",
      caption: item.caption,
      image_url: item.image_url,
      photographer: item.photographer,
      event_date: item.event_date,
      is_featured: Boolean(item.is_featured),
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

    const title = form.title.trim();
    const imageUrl = form.image_url.trim();
    if (!title) {
      setErrorMsg("Judul foto (title) wajib diisi.");
      return;
    }
    if (!imageUrl) {
      setErrorMsg("URL gambar (image_url) wajib diisi.");
      return;
    }

    const payload: GaleriPayload = {
      title,
      category: form.category.trim() || "Galeri",
      caption: form.caption.trim(),
      image_url: imageUrl,
      photographer: form.photographer.trim(),
      event_date: form.event_date.trim(),
      is_featured: form.is_featured,
    };

    setSaving(true);
    try {
      if (editingId !== null) {
        await updateGaleri(editingId, payload);
        setSuccessMsg(`Foto "${title}" berhasil diperbarui.`);
      } else {
        await createGaleri(payload);
        setSuccessMsg(`Foto "${title}" berhasil ditambahkan.`);
      }
      resetForm();
      await loadItems();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal menyimpan foto galeri.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: GaleriItem) => {
    const confirmed = window.confirm(`Hapus foto "${item.title}" dari galeri?`);
    if (!confirmed) return;

    setDeletingId(item.id);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await deleteGaleri(item.id);
      if (editingId === item.id) {
        resetForm();
      }
      setSuccessMsg(`Foto "${item.title}" berhasil dihapus.`);
      await loadItems();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal menghapus foto galeri.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const categoryOptions = useMemo(() => {
    const unique = Array.from(new Set(items.map((g) => g.category).filter(Boolean)));
    return ["Semua", ...unique];
  }, [items]);

  const visibleItems = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase("id");
    return items.filter((item) => {
      const matchesCat =
        filterCategory === "Semua" || item.category === filterCategory;
      const matchesQuery =
        !q ||
        `${item.title} ${item.category} ${item.caption} ${item.photographer}`
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
              Kelola Galeri Foto
            </h1>
            <p className="text-sm text-muted-foreground">
              Tambah, ubah, dan hapus dokumentasi foto PORPROV XIII yang tampil dinamis di tab Galeri.
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
                  Edit Foto Galeri #{editingId}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 text-primary" />
                  Tambah Foto Galeri Baru
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
                <Label htmlFor="galeri-title">
                  Judul Foto <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="galeri-title"
                  required
                  placeholder="Contoh: GOR Utama Sport Center"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="galeri-category">Kategori</Label>
                <Input
                  id="galeri-category"
                  placeholder="Contoh: Venue / Pertandingan / Seremonial"
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="galeri-date">Tanggal Kegiatan</Label>
                <Input
                  id="galeri-date"
                  type="date"
                  value={form.event_date}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, event_date: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="galeri-image">
                  URL Gambar <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="galeri-image"
                  required
                  placeholder="/galeri/GOR_Utama.webp atau https://..."
                  value={form.image_url}
                  onChange={(e) => {
                    setPreviewImgError(false);
                    setForm((prev) => ({ ...prev, image_url: e.target.value }));
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="galeri-photographer">Fotografer</Label>
                <Input
                  id="galeri-photographer"
                  placeholder="Nama fotografer / Diskominfo Kobar"
                  value={form.photographer}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      photographer: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5 sm:col-span-3">
                <Label htmlFor="galeri-caption">Keterangan (Caption)</Label>
                <Input
                  id="galeri-caption"
                  placeholder="Keterangan singkat foto..."
                  value={form.caption}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, caption: e.target.value }))
                  }
                />
              </div>

              <div className="flex items-center gap-2 sm:col-span-3">
                <input
                  id="galeri-featured"
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      is_featured: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />
                <Label htmlFor="galeri-featured" className="cursor-pointer">
                  Tandai sebagai Foto Unggulan (is_featured)
                </Label>
              </div>

              {form.image_url.trim() && (
                <div className="flex items-center gap-3 sm:col-span-3">
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border bg-slate-100">
                    {!previewImgError ? (
                      <img
                        src={form.image_url.trim()}
                        alt="Preview galeri"
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
                    Preview foto galeri
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
                    : "Tambah Foto"}
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
              Daftar Foto Galeri ({visibleItems.length})
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="pointer-events-none absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari judul atau keterangan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <select
                aria-label="Filter kategori galeri"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
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
              Memuat foto galeri dari database...
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="rounded-lg border border-dashed py-10 text-center">
              <Camera className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-semibold">
                Belum ada foto galeri yang sesuai
              </p>
              <p className="text-xs text-muted-foreground">
                Tambahkan foto baru melalui form di atas atau ubah kata kunci pencarian.
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
                        {item.image_url && !thumbFailed ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
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
                            <Camera className="h-6 w-6" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="outline" className="shrink-0 text-[10px]">
                            {item.category}
                          </Badge>
                          {item.is_featured && (
                            <Badge className="shrink-0 gap-0.5 bg-amber-400 text-[10px] text-slate-950">
                              <Star className="h-2.5 w-2.5 fill-slate-950" />
                              Unggulan
                            </Badge>
                          )}
                        </div>
                        <h3 className="min-w-0 break-words line-clamp-1 text-sm font-bold">
                          {item.title}
                        </h3>
                        {item.caption && (
                          <p className="min-w-0 break-words line-clamp-2 text-xs text-muted-foreground">
                            {item.caption}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2.5">
                      <span className="min-w-0 truncate text-[11px] text-muted-foreground">
                        {item.photographer || item.event_date || "Dokumentasi PORPROV"}
                      </span>

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
