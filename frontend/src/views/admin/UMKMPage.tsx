import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Coffee,
  ExternalLink,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Star,
  Trash2,
  Utensils,
} from "lucide-react";
import AdminNav from "@/components/AdminNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  kobarCategories,
  kobarCulinaryThemes,
  type KobarUMKMItem,
  type KobarUMKMType,
} from "@/data/umkmKobarData";
import {
  createUMKM,
  deleteUMKM,
  fetchUMKM,
  updateUMKM,
  type UMKMPayload,
} from "@/api/umkm";

type UMKMFormState = {
  nama: string;
  tipe: KobarUMKMType;
  kategori_google: string;
  culinaryThemeKey: string;
  deskripsi: string;
  signatureDish: string;
  kecamatan: string;
  alamat: string;
  rating_google: string;
  jumlah_ulasan: string;
  telepon: string;
  jam_buka: string;
  instagram: string;
  google_maps_url: string;
  image: string;
  priceRange: string;
  recommended: boolean;
};

const EMPTY_FORM: UMKMFormState = {
  nama: "",
  tipe: "cafe",
  kategori_google: "",
  culinaryThemeKey: "coffee_cafe",
  deskripsi: "",
  signatureDish: "",
  kecamatan: "Arut Selatan",
  alamat: "",
  rating_google: "4.5",
  jumlah_ulasan: "0",
  telepon: "",
  jam_buka: "",
  instagram: "",
  google_maps_url: "",
  image: "",
  priceRange: "",
  recommended: false,
};

const TYPE_OPTIONS = kobarCategories.filter((c) => c.value !== "Semua") as {
  label: string;
  value: KobarUMKMType;
}[];

const THEME_OPTIONS = kobarCulinaryThemes.filter((t) => t.key !== "Semua");

export default function UMKMPage() {
  const [items, setItems] = useState<KobarUMKMItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<UMKMFormState>(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("Semua");
  const [previewImgError, setPreviewImgError] = useState<boolean>(false);
  const [failedThumbIds, setFailedThumbIds] = useState<Record<number, boolean>>({});

  const loadItems = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const rows = await fetchUMKM();
      setItems(rows);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal memuat data kuliner & UMKM.",
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

  const handleStartEdit = (item: KobarUMKMItem) => {
    setEditingId(item.id);
    setForm({
      nama: item.nama,
      tipe: item.tipe,
      kategori_google: item.kategori_google || item.categoryLabel || "",
      culinaryThemeKey: item.culinaryThemeKey || "coffee_cafe",
      deskripsi: item.deskripsi ?? "",
      signatureDish: item.signatureDish ?? "",
      kecamatan: item.kecamatan || "Arut Selatan",
      alamat: item.alamat,
      rating_google: String(item.rating_google ?? 0),
      jumlah_ulasan: String(item.jumlah_ulasan ?? 0),
      telepon: item.telepon ?? "",
      jam_buka: item.jam_buka ?? "",
      instagram: item.instagram ?? "",
      google_maps_url: item.google_maps_url ?? "",
      image: item.image ?? "",
      priceRange: item.priceRange ?? "",
      recommended: Boolean(item.recommended),
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

    const nama = form.nama.trim();
    const alamat = form.alamat.trim();
    if (!nama) {
      setErrorMsg("Nama tempat makan/UMKM wajib diisi.");
      return;
    }
    if (!form.tipe) {
      setErrorMsg("Tipe tempat makan wajib dipilih.");
      return;
    }
    if (!alamat) {
      setErrorMsg("Alamat lengkap wajib diisi.");
      return;
    }

    const rating = Number(form.rating_google);
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      setErrorMsg("Rating Google (rating_google) harus berada di rentang 0–5.");
      return;
    }

    const reviews = Math.max(0, Math.floor(Number(form.jumlah_ulasan) || 0));
    const selectedTypeObj = TYPE_OPTIONS.find((t) => t.value === form.tipe);
    const selectedThemeObj = THEME_OPTIONS.find(
      (t) => t.key === form.culinaryThemeKey,
    );
    const kec = form.kecamatan.trim() || "Arut Selatan";

    const payload: UMKMPayload = {
      nama,
      tipe: form.tipe,
      categoryLabel:
        form.kategori_google.trim() || selectedTypeObj?.label || "Kuliner",
      kategori_google:
        form.kategori_google.trim() || selectedTypeObj?.label || "Kuliner",
      culinaryTheme: selectedThemeObj?.label || "Kuliner Nusantara",
      culinaryThemeKey: form.culinaryThemeKey || "warung_tradisional",
      deskripsi: form.deskripsi.trim(),
      signatureDish: form.signatureDish.trim(),
      kecamatan: kec,
      kecamatanFull: kec.includes("(") ? kec : `${kec} (Pangkalan Bun)`,
      alamat,
      rating_google: Number(rating.toFixed(1)),
      jumlah_ulasan: reviews,
      ada_rating: rating > 0,
      telepon: form.telepon.trim() || null,
      jam_buka: form.jam_buka.trim() || null,
      instagram: form.instagram.trim() || null,
      reservasi: "",
      situs_web: null,
      koordinat: null,
      place_id: "",
      google_maps_url: form.google_maps_url.trim(),
      image: form.image.trim(),
      recommended: form.recommended,
      priceRange: form.priceRange.trim(),
    };

    setSaving(true);
    try {
      if (editingId !== null) {
        await updateUMKM(editingId, payload);
        setSuccessMsg(`Data "${nama}" berhasil diperbarui.`);
      } else {
        await createUMKM(payload);
        setSuccessMsg(`Data "${nama}" berhasil ditambahkan.`);
      }
      resetForm();
      await loadItems();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal menyimpan data UMKM.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: KobarUMKMItem) => {
    const confirmed = window.confirm(
      `Hapus "${item.nama}" dari direktori kuliner & UMKM?`,
    );
    if (!confirmed) return;

    setDeletingId(item.id);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await deleteUMKM(item.id);
      if (editingId === item.id) {
        resetForm();
      }
      setSuccessMsg(`"${item.nama}" berhasil dihapus.`);
      await loadItems();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal menghapus data UMKM.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const visibleItems = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase("id");
    return items.filter((item) => {
      const matchesType = filterType === "Semua" || item.tipe === filterType;
      const matchesQuery =
        !q ||
        `${item.nama} ${item.kategori_google} ${item.culinaryTheme} ${item.signatureDish} ${item.alamat} ${item.kecamatan}`
          .toLocaleLowerCase("id")
          .includes(q);
      return matchesType && matchesQuery;
    });
  }, [items, filterType, searchQuery]);

  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <AdminNav />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Kelola Kuliner &amp; UMKM
            </h1>
            <p className="text-sm text-muted-foreground">
              Tambah, ubah, dan hapus data tempat makan, restoran, kafe, dan UMKM yang tampil dinamis di Direktori Kuliner.
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

        {/* Form Tambah / Edit UMKM */}
        <Card className="p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
            <h2 className="text-base font-bold flex items-center gap-2">
              {editingId !== null ? (
                <>
                  <Pencil className="h-4 w-4 text-primary" />
                  Edit Data UMKM #{editingId}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 text-primary" />
                  Tambah Tempat Makan / UMKM
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
                <Label htmlFor="umkm-nama">
                  Nama Tempat <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="umkm-nama"
                  required
                  placeholder="Contoh: Kahawa Coffee Roastery"
                  value={form.nama}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, nama: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="umkm-tipe">
                  Tipe <span className="text-red-500">*</span>
                </Label>
                <select
                  id="umkm-tipe"
                  required
                  value={form.tipe}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      tipe: e.target.value as KobarUMKMType,
                    }))
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
                >
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label} ({t.value})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="umkm-theme">Tema Sajian</Label>
                <select
                  id="umkm-theme"
                  value={form.culinaryThemeKey}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      culinaryThemeKey: e.target.value,
                    }))
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
                >
                  {THEME_OPTIONS.map((theme) => (
                    <option key={theme.key} value={theme.key}>
                      {theme.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="umkm-alamat">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="umkm-alamat"
                  required
                  placeholder="Jl. Pancasila, Madurejo, Kec. Arut Selatan..."
                  value={form.alamat}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, alamat: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="umkm-kecamatan">Kecamatan</Label>
                <Input
                  id="umkm-kecamatan"
                  placeholder="Arut Selatan"
                  value={form.kecamatan}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, kecamatan: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="umkm-kategori">Label Kategori</Label>
                <Input
                  id="umkm-kategori"
                  placeholder="Contoh: Kafe & Kopi / Restoran Seafood"
                  value={form.kategori_google}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      kategori_google: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="umkm-rating">Rating Google (0–5)</Label>
                <Input
                  id="umkm-rating"
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={form.rating_google}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      rating_google: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="umkm-ulasan">Jumlah Ulasan</Label>
                <Input
                  id="umkm-ulasan"
                  type="number"
                  min={0}
                  value={form.jumlah_ulasan}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      jumlah_ulasan: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="umkm-price">Rentang Harga</Label>
                <Input
                  id="umkm-price"
                  placeholder="Rp 15.000 - Rp 50.000"
                  value={form.priceRange}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, priceRange: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="umkm-jam">Jam Buka</Label>
                <Input
                  id="umkm-jam"
                  placeholder="Setiap hari: 08.00 - 22.00"
                  value={form.jam_buka}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, jam_buka: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="umkm-telepon">Telepon / WhatsApp</Label>
                <Input
                  id="umkm-telepon"
                  placeholder="62812..."
                  value={form.telepon}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, telepon: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="umkm-signature">Menu Unggulan (Signature Dish)</Label>
                <Input
                  id="umkm-signature"
                  placeholder="Coto Manggala, Ikan Jelawat Bakar, Es Kopi Susu..."
                  value={form.signatureDish}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      signatureDish: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="umkm-instagram">Instagram</Label>
                <Input
                  id="umkm-instagram"
                  placeholder="@namatoko"
                  value={form.instagram}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, instagram: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5 sm:col-span-3">
                <Label htmlFor="umkm-deskripsi">Deskripsi Singkat</Label>
                <Input
                  id="umkm-deskripsi"
                  placeholder="Deskripsi suasana atau keunggulan tempat makan..."
                  value={form.deskripsi}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, deskripsi: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="umkm-maps">URL Google Maps</Label>
                <Input
                  id="umkm-maps"
                  placeholder="https://maps.google.com/..."
                  value={form.google_maps_url}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      google_maps_url: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="umkm-image">URL Gambar</Label>
                <Input
                  id="umkm-image"
                  placeholder="/kuliner-real/kahawaCafe.webp atau https://..."
                  value={form.image}
                  onChange={(e) => {
                    setPreviewImgError(false);
                    setForm((prev) => ({ ...prev, image: e.target.value }));
                  }}
                />
              </div>

              <div className="flex items-center gap-2 sm:col-span-3">
                <input
                  id="umkm-recommended"
                  type="checkbox"
                  checked={form.recommended}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      recommended: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />
                <Label htmlFor="umkm-recommended" className="cursor-pointer">
                  Tandai sebagai Rekomendasi / Rating Tinggi
                </Label>
              </div>

              {form.image.trim() && (
                <div className="flex items-center gap-3 sm:col-span-3">
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border bg-slate-100">
                    {!previewImgError ? (
                      <img
                        src={form.image.trim()}
                        alt="Preview UMKM"
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
                    Preview gambar tempat makan
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
                    : "Tambah UMKM"}
              </Button>
              {editingId !== null && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Batal
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Daftar UMKM */}
        <Card className="p-5 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-bold">
              Daftar Kuliner &amp; UMKM ({visibleItems.length})
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="pointer-events-none absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama, menu, atau alamat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <select
                aria-label="Filter tipe UMKM"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="Semua">Semua Tipe</option>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Memuat data kuliner &amp; UMKM dari database...
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="rounded-lg border border-dashed py-10 text-center">
              <Utensils className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-semibold">
                Belum ada data UMKM yang sesuai
              </p>
              <p className="text-xs text-muted-foreground">
                Tambahkan data baru melalui form di atas atau ubah kata kunci pencarian.
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
                            alt={item.nama}
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
                            <Coffee className="h-6 w-6" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="outline" className="shrink-0 text-[10px]">
                            {item.tipe}
                          </Badge>
                          {item.ada_rating && (
                            <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold text-amber-600">
                              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                              {item.rating_google.toFixed(1)}
                            </span>
                          )}
                          {item.recommended && (
                            <Badge className="shrink-0 bg-emerald-600 text-[10px] text-white">
                              Rekomendasi
                            </Badge>
                          )}
                        </div>
                        <h3 className="min-w-0 break-words line-clamp-1 text-sm font-bold">
                          {item.nama}
                        </h3>
                        <p className="min-w-0 break-words line-clamp-2 text-xs text-muted-foreground">
                          <MapPin className="mr-1 inline h-3 w-3" />
                          {item.alamat}
                        </p>
                        {item.priceRange && (
                          <p className="truncate text-xs font-semibold text-primary">
                            {item.priceRange}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2.5">
                      <div className="flex min-w-0 items-center gap-2 text-[11px] text-muted-foreground">
                        {item.telepon && (
                          <span className="inline-flex items-center gap-1 truncate">
                            <Phone className="h-3 w-3 shrink-0" />
                            {item.telepon}
                          </span>
                        )}
                        {item.google_maps_url && (
                          <a
                            href={item.google_maps_url}
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
