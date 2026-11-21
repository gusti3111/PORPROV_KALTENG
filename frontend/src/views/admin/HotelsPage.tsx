import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  ExternalLink,
  MapPin,
  Pencil,
  Phone,
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
  HOTEL_TYPES,
  createHotel,
  deleteHotel,
  fetchHotels,
  updateHotel,
  type HotelItem,
  type HotelPayload,
  type HotelType,
} from "@/data/hotelKobarData";

type HotelFormState = {
  hotel_name: string;
  type: HotelType;
  address: string;
  district: string;
  near_venue: string;
  price_range: string;
  contact: string;
  rating: string;
  facilities: string;
  maps_url: string;
  image_url: string;
};

const EMPTY_FORM: HotelFormState = {
  hotel_name: "",
  type: "Hotel Bintang",
  address: "",
  district: "Arut Selatan",
  near_venue: "",
  price_range: "",
  contact: "",
  rating: "4.5",
  facilities: "",
  maps_url: "",
  image_url: "",
};

function parseFacilitiesInput(raw: string): string[] {
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function HotelsPage() {
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<HotelFormState>(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("Semua");
  const [previewImgError, setPreviewImgError] = useState<boolean>(false);
  const [failedThumbIds, setFailedThumbIds] = useState<Record<number, boolean>>({});

  const loadHotels = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const rows = await fetchHotels();
      setHotels(rows);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal memuat data hotel.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHotels();
  }, [loadHotels]);

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPreviewImgError(false);
  };

  const handleStartEdit = (hotel: HotelItem) => {
    setEditingId(hotel.id);
    setForm({
      hotel_name: hotel.hotelName,
      type: hotel.type,
      address: hotel.address,
      district: hotel.district || "Arut Selatan",
      near_venue: hotel.nearVenue,
      price_range: hotel.priceRange,
      contact: hotel.contact,
      rating: String(hotel.rating ?? 4.5),
      facilities: hotel.facilities.join(", "),
      maps_url: hotel.mapsUrl,
      image_url: hotel.image,
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

    const hotelName = form.hotel_name.trim();
    const address = form.address.trim();
    if (!hotelName) {
      setErrorMsg("Nama hotel (hotel_name) wajib diisi.");
      return;
    }
    if (!address) {
      setErrorMsg("Alamat hotel (address) wajib diisi.");
      return;
    }

    const numericRating = Number(form.rating);
    if (!Number.isFinite(numericRating) || numericRating < 0 || numericRating > 5) {
      setErrorMsg("Rating harus bernilai antara 0.0 hingga 5.0.");
      return;
    }

    const payload: HotelPayload = {
      hotel_name: hotelName,
      type: form.type,
      address,
      district: form.district.trim() || "Arut Selatan",
      near_venue: form.near_venue.trim(),
      price_range: form.price_range.trim(),
      contact: form.contact.trim(),
      rating: Number(numericRating.toFixed(1)),
      facilities: parseFacilitiesInput(form.facilities),
      maps_url: form.maps_url.trim(),
      image_url: form.image_url.trim(),
    };

    setSaving(true);
    try {
      if (editingId !== null) {
        await updateHotel(editingId, payload);
        setSuccessMsg(`Data hotel "${hotelName}" berhasil diperbarui.`);
      } else {
        await createHotel(payload);
        setSuccessMsg(`Hotel "${hotelName}" berhasil ditambahkan.`);
      }
      resetForm();
      await loadHotels();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal menyimpan data hotel.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (hotel: HotelItem) => {
    const confirmed = window.confirm(
      `Hapus hotel "${hotel.hotelName}" dari database?`,
    );
    if (!confirmed) return;

    setDeletingId(hotel.id);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await deleteHotel(hotel.id);
      if (editingId === hotel.id) {
        resetForm();
      }
      setSuccessMsg(`Hotel "${hotel.hotelName}" berhasil dihapus.`);
      await loadHotels();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal menghapus hotel.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const parsedFacilityTags = useMemo(
    () => parseFacilitiesInput(form.facilities),
    [form.facilities],
  );

  const visibleHotels = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase("id");
    return hotels.filter((h) => {
      const matchesType = filterType === "Semua" || h.type === filterType;
      const matchesQuery =
        !q ||
        `${h.hotelName} ${h.type} ${h.address} ${h.district} ${h.nearVenue} ${h.facilities.join(" ")}`
          .toLocaleLowerCase("id")
          .includes(q);
      return matchesType && matchesQuery;
    });
  }, [hotels, filterType, searchQuery]);

  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <AdminNav />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Kelola Hotel &amp; Penginapan
            </h1>
            <p className="text-sm text-muted-foreground">
              Tambah, ubah, dan hapus data akomodasi resmi PORPROV XIII yang tampil dinamis di halaman Informasi publik.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void loadHotels()}
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

        {/* Form Tambah / Edit Hotel */}
        <Card className="p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
            <h2 className="text-base font-bold flex items-center gap-2">
              {editingId !== null ? (
                <>
                  <Pencil className="h-4 w-4 text-primary" />
                  Edit Data Hotel #{editingId}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 text-primary" />
                  Tambah Hotel Baru
                </>
              )}
            </h2>
            {editingId !== null && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetForm}
              >
                Batal Edit
              </Button>
            )}
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="hotel-name">
                  Nama Hotel <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="hotel-name"
                  required
                  placeholder="Contoh: Mercure Pangkalan Bun"
                  value={form.hotel_name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, hotel_name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hotel-type">Tipe Akomodasi</Label>
                <select
                  id="hotel-type"
                  value={form.type}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      type: e.target.value as HotelType,
                    }))
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {HOTEL_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hotel-district">Kecamatan</Label>
                <Input
                  id="hotel-district"
                  placeholder="Arut Selatan"
                  value={form.district}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, district: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="hotel-address">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="hotel-address"
                  required
                  placeholder="Jl. H. Udan Said, Kel. Baru, Kec. Arut Selatan..."
                  value={form.address}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, address: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hotel-rating">Rating (0.0 – 5.0)</Label>
                <Input
                  id="hotel-rating"
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={form.rating}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, rating: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hotel-near-venue">Jarak ke Venue</Label>
                <Input
                  id="hotel-near-venue"
                  placeholder="± 5 menit ke Sport Center Pangkalan Bun"
                  value={form.near_venue}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, near_venue: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hotel-price">Kisaran Tarif</Label>
                <Input
                  id="hotel-price"
                  placeholder="Rp 350.000 - Rp 650.000 / malam"
                  value={form.price_range}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, price_range: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hotel-contact">Kontak / WhatsApp</Label>
                <Input
                  id="hotel-contact"
                  placeholder="628115251800"
                  value={form.contact}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, contact: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="hotel-facilities">
                  Fasilitas (pisahkan dengan koma)
                </Label>
                <Input
                  id="hotel-facilities"
                  placeholder="AC, WiFi, Kolam Renang, Parkir Luas"
                  value={form.facilities}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, facilities: e.target.value }))
                  }
                />
                {parsedFacilityTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {parsedFacilityTags.map((tag, idx) => (
                      <Badge
                        key={`${tag}-${idx}`}
                        variant="secondary"
                        className="text-[11px]"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hotel-maps">URL Google Maps</Label>
                <Input
                  id="hotel-maps"
                  placeholder="https://www.google.com/maps/search/?api=1&query=..."
                  value={form.maps_url}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, maps_url: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="hotel-image">URL Gambar</Label>
                <Input
                  id="hotel-image"
                  placeholder="/HoteldanPenginapan/alibaba.webp atau https://..."
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
                        alt="Preview hotel"
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
                    Preview gambar hotel
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
                    : "Tambah Hotel"}
              </Button>
              {editingId !== null && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Batal
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Daftar Hotel */}
        <Card className="p-5 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-bold">
              Daftar Hotel Terdaftar ({visibleHotels.length})
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="pointer-events-none absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama atau alamat hotel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <select
                aria-label="Filter tipe hotel"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="Semua">Semua Tipe</option>
                {HOTEL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Memuat data hotel dari database...
            </div>
          ) : visibleHotels.length === 0 ? (
            <div className="rounded-lg border border-dashed py-10 text-center">
              <Building2 className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-semibold">
                Belum ada data hotel yang sesuai
              </p>
              <p className="text-xs text-muted-foreground">
                Tambahkan hotel baru melalui form di atas atau ubah kata kunci pencarian.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {visibleHotels.map((hotel) => {
                const thumbFailed = Boolean(failedThumbIds[hotel.id]);
                return (
                  <div
                    key={hotel.id}
                    className="flex min-w-0 flex-col justify-between gap-3 rounded-xl border bg-card p-3.5 shadow-xs"
                  >
                    <div className="flex min-w-0 gap-3">
                      <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {hotel.image && !thumbFailed ? (
                          <img
                            src={hotel.image}
                            alt={hotel.hotelName}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={() =>
                              setFailedThumbIds((prev) => ({
                                ...prev,
                                [hotel.id]: true,
                              }))
                            }
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-400">
                            <Building2 className="h-6 w-6" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="outline" className="shrink-0 text-[10px]">
                            {hotel.type}
                          </Badge>
                          <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold text-amber-600">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                            {hotel.rating.toFixed(1)}
                          </span>
                        </div>
                        <h3 className="min-w-0 break-words line-clamp-1 text-sm font-bold">
                          {hotel.hotelName}
                        </h3>
                        <p className="min-w-0 break-words line-clamp-2 text-xs text-muted-foreground">
                          <MapPin className="mr-1 inline h-3 w-3" />
                          {hotel.address}
                        </p>
                        {hotel.priceRange && (
                          <p className="truncate text-xs font-semibold text-primary">
                            {hotel.priceRange}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2.5">
                      <div className="flex min-w-0 items-center gap-2 text-[11px] text-muted-foreground">
                        {hotel.contact && (
                          <span className="inline-flex items-center gap-1 truncate">
                            <Phone className="h-3 w-3 shrink-0" />
                            {hotel.contact}
                          </span>
                        )}
                        {hotel.mapsUrl && (
                          <a
                            href={hotel.mapsUrl}
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
                          onClick={() => handleStartEdit(hotel)}
                          className="h-7 gap-1 px-2.5 text-xs"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={deletingId === hotel.id}
                          onClick={() => void handleDelete(hotel)}
                          className="h-7 gap-1 px-2.5 text-xs"
                        >
                          <Trash2 className="h-3 w-3" />
                          {deletingId === hotel.id ? "..." : "Hapus"}
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
