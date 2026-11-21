import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Award,
  BookOpen,
  Building2,
  Calendar,
  Camera,
  CheckCircle2,
  Coffee,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  ExternalLink,
  Flame,
  Globe,
  HeartHandshake,
  HeartPulse,
  History,
  MapPin,
  Medal,
  Newspaper,
  Phone,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  Tag,
  Target,
  Trophy,
  Users,
  Utensils,
  X,
} from "lucide-react";
import {
  kobarDistricts,
  kobarCategories,
  kobarCulinaryThemes,
  type KobarUMKMItem,
  type KobarUMKMType,
} from "../data/umkmKobarData";
import { fetchUMKM } from "../api/umkm";
import {
  HOTEL_TYPES,
  fetchHotels,
  type HotelItem,
} from "../data/hotelKobarData";
import { fetchWisata, type WisataItem } from "../api/wisata";
import {
  KESEHATAN_CATEGORIES,
  fetchKesehatan,
  type KesehatanItem,
} from "../api/kesehatan";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { fetchGaleri, type GaleriItem } from "../api/galeri";
import { getContingentLogoUrl } from "../utils/contingentLogo";

type NewsCategory = "Berita" | "Galeri" | "Tempat Makan dan Nongkrong" | "Hotel dan Penginapan" | "Pariwisata" | "Layanan Kesehatan" | "About Us";
type CategoryFilter = NewsCategory;

type NewsArticle = {
  id: number;
  category: NewsCategory;
  date: string;
  title: string;
  excerpt: string;
  theme: "green" | "orange" | "lime";
  image?: string;
};

export interface MmcNewsItem {
  id_berita: number;
  sopd: string;
  judul: string;
  sub_judul?: string;
  deskripsi: string;
  slug_berita: string;
  set_tanggal_publish: string;
  filename1?: string;
}

export type DisplayArticle = {
  id: string | number;
  category: string;
  sopd?: string;
  date: string;
  title: string;
  excerpt: string;
  fullHtml?: string;
  slug?: string;
  image?: string;
  isMmcLive?: boolean;
  theme: "green" | "orange" | "lime";
};

const officialArticleImages: Record<string, string> = {
  "jadwal-porprov-xiii-kalteng-2026-resmi-disiapkan-kobar-matangkan-kesiapan-jadi-tuan-rumah":
    "https://kotawaringinbaratkab.go.id/sites/default/files/2026-11/jadwal.jpeg",
  "bupati-kobar-dampingi-gubernur-kalteng-tinjau-kesiapan-arena-porprov-xiii-2026":
    "https://kotawaringinbaratkab.go.id/sites/default/files/2026-11/gub.jpeg",
  "buka-cdm-meeting-porprov-xiii-wabup-kobar-tekankan-sportivitas-dan-keselamatan-atlet":
    "https://kotawaringinbaratkab.go.id/sites/default/files/2026-11/dci.jpeg",
  "dorong-pemulihan-ekonomi-daerah-pemkab-kobar-integrasikan-porprov-xiii-dan-kobar-expo-2026":
    "https://kotawaringinbaratkab.go.id/sites/default/files/2026-11/expo.jpeg",
};

const venueImageFallbacks: string[] = [
  "/venues2/sportCenter.webp",
  "/venues2/GORKoni.webp",
  "/venues2/pangakalnbunpark.webp",
  "/venues2/kampungSega.webp",
  "/venues2/LapanganTenisPasirPanjang.webp",
  "/venues2/jalanRaya.jpg",
  "/venues2/stadion.webp",
  "/venues2/gorSportCenter.webp",
  "/sportcenter.webp",
];

function getArticleImage(slug?: string, _filename?: string, index: number = 0): string {
  if (slug && officialArticleImages[slug]) {
    return officialArticleImages[slug];
  }
  return venueImageFallbacks[index % venueImageFallbacks.length];
}

function decodeHtmlContent(rawStr: string): string {
  if (!rawStr) return "";
  try {
    const parser = new DOMParser();
    const doc1 = parser.parseFromString(rawStr, "text/html");
    return doc1.body.textContent || rawStr;
  } catch {
    return rawStr
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&ndash;/g, "–")
      .replace(/&nbsp;/g, " ");
  }
}

function getCleanExcerpt(rawStr: string): string {
  try {
    const html = decodeHtmlContent(rawStr);
    const parser = new DOMParser();
    const doc2 = parser.parseFromString(html, "text/html");
    return (doc2.body.textContent || "").replace(/\s+/g, " ").trim();
  } catch {
    return rawStr.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();
  }
}

// Data Hotel, UMKM & Galeri diambil dari backend API

const articles: NewsArticle[] = [
  {
    id: 1,
    category: "Berita",
    date: "2026-11-20",
    title: "Berita terbaru seputar PORPROV XIII Kalimantan Tengah",
    excerpt:
      "Ikuti perkembangan berita dan pengumuman resmi menjelang penyelenggaraan PORPROV XIII.",
    theme: "green",
    image: "/venues2/sportCenter.webp",
  },
  {
    id: 2,
    category: "About Us",
    date: "2026-11-18",
    title: "Sejarah PORPROV XIII Kalimantan Tengah",
    excerpt:
      "Jelajahi sejarah panjang dan prestasi yang telah dicapai dalam penyelenggaraan PORPROV XIII.",
    theme: "orange",
    image: "/venues2/GORKoni.webp",
  },
  {
    id: 3,
    category: "Tempat Makan dan Nongkrong",
    date: "2026-11-15",
    title: "Semangat atlet daerah menyambut pesta olahraga provinsi",
    excerpt:
      "Atlet dari berbagai kabupaten dan kota bersiap untuk bertanding dengan menjunjung sportivitas.",
    theme: "lime",
    image: "/venues2/pangakalnbunpark.webp",
  },
  {
    id: 4,
    category: "Berita",
    date: "2026-11-12",
    title: "Kenali cabang olahraga yang dipertandingkan",
    excerpt:
      "Cari tahu cabang olahraga dan informasi pertandingan dalam agenda PORPROV XIII.",
    theme: "green",
    image: "/venues2/kampungSega.webp",
  },
];

const categories: CategoryFilter[] = [
  "Tempat Makan dan Nongkrong",
  "Pariwisata",
  "Hotel dan Penginapan",
  "Layanan Kesehatan",
  "Galeri",
  "Berita",
  "About Us",
];

type HistoryMilestone = {
  era: string;
  edition: string;
  host: string;
  title: string;
  description: string;
  highlight: string;
};

type ContingentProfile = {
  id: number;
  name: string;
  capital: string;
  motto: string;
  roleNote?: string;
};

const porprovMilestones: HistoryMilestone[] = [
  {
    era: "Era Perintisan (1970-an – 1990-an)",
    edition: "PORDA Kalteng Edisi Awal",
    host: "Kota Palangka Raya",
    title: "Lahirnya Pesta Olahraga Daerah Bumi Tambun Bungai",
    description:
      "Berawal dari Pekan Olahraga Daerah (PORDA) Kalimantan Tengah yang digagas oleh Pemerintah Provinsi bersama KONI Kalimantan Tengah sebagai wadah seleksi dan pembinaan atlet daerah pasca berdirinya Provinsi Kalimantan Tengah. Pada masa ini, kompetisi berpusat di Kota Palangka Raya dengan semangat 'Isen Mulang' (Pantang Mundur).",
    highlight: "Fondasi pembinaan atlet daerah menuju Pekan Olahraga Nasional (PON).",
  },
  {
    era: "Era Pemekaran Wilayah (2002 – 2010)",
    edition: "Transformasi Menuju PORPROV (VIII – IX)",
    host: "Palangka Raya & Kabupaten Penyangga",
    title: "Bergabungnya 14 Kabupaten/Kota Se-Kalimantan Tengah",
    description:
      "Seiring pemekaran wilayah di Kalimantan Tengah menjadi 13 Kabupaten dan 1 Kota (termasuk terbentuknya Katingan, Seruyan, Sukamara, Lamandau, Gunung Mas, Pulang Pisau, Murung Raya, dan Barito Timur), pesta olahraga ini bertransformasi menjadi Pekan Olahraga Provinsi (PORPROV) yang diikuti secara lengkap oleh 14 kontingen kabupaten/kota.",
    highlight: "Partisipasi penuh 13 Kabupaten & 1 Kota dalam satu panggung olahraga provinsi.",
  },
  {
    era: " Oktober 2018",
    edition: "PORPROV XI Kalimantan Tengah",
    host: "Kabupaten Barito Utara (Muara Teweh)",
    title: "Desentralisasi Tuan Rumah & Kebangkitan Infrastruktur Daerah",
    description:
      "Penyelenggaraan PORPROV XI di Muara Teweh, Kabupaten Barito Utara menjadi tonggak sejarah pemerataan pembangunan fasilitas olahraga di luar ibu kota provinsi. Ribuan atlet berlaga dengan antusiasme masyarakat DAS Barito yang luar biasa.",
    highlight: "Mendorong pemerataan stadion dan gelanggang olahraga berstandar nasional di kabupaten.",
  },
  {
    era: "26 Juli – 5 Agustus 2023",
    edition: "PORPROV XII Kalimantan Tengah",
    host: "Kabupaten Kotawaringin Timur (Sampit)",
    title: "Semangat Habaring Hurung di Kota Mentaya",
    description:
      "Digelar dengan megah di Stadion 29 November Sampit, PORPROV XII mempertandingkan puluhan cabang olahraga dengan ribuan atlet dan ofisial. Ajang ini sukses melahirkan rekor-rekor baru provinsi sekaligus menggerakkan roda ekonomi kerakyatan, tempat makan dan nongkrong serta pariwisata lokal pasca pandemi.",
    highlight: "Integrasi sport tourism dan pemberdayaan tempat makan dan nongkrong serta pelaku usaha daerah secara masif.",
  },
  {
    era: "Tahun 2026 (Edisi Saat Ini)",
    edition: "PORPROV XIII Kalimantan Tengah 2026",
    host: "Kabupaten Kotawaringin Barat (Pangkalan Bun)",
    title: "Transformasi Digital & Prestasi Emas di Bumi Marunting Batu Aji",
    description:
      "Kabupaten Kotawaringin Barat resmi dipercaya menjadi tuan rumah utama PORPROV XIII Tahun 2026. Mengusung perpaduan filosofi 'Isen Mulang' dan semboyan 'Marunting Batu Aji' (Menuju Kejayaan), edisi ke-13 ini menghadirkan 32 Cabang Olahraga di 25 Venue terstandarisasi serta didukung sistem informasi pertandingan, bagan, dan perolehan medali berbasis digital secara real-time.",
    highlight: "32 Cabang Olahraga, 25 Venue, 14 Kontingen, dan Sistem Informasi Terpadu Real-Time.",
  },
];

const contingentProfiles: ContingentProfile[] = [
  {
    id: 1,
    name: "Kabupaten Kotawaringin Barat",
    capital: "Pangkalan Bun",
    motto: "Marunting Batu Aji",
    roleNote: "Tuan Rumah Utama PORPROV XIII 2026",
  },
  {
    id: 2,
    name: "Kabupaten Kotawaringin Timur",
    capital: "Sampit",
    motto: "Habaring Hurung",
    roleNote: "Tuan Rumah PORPROV XII 2023",
  },
  {
    id: 3,
    name: "Kota Palangka Raya",
    capital: "Palangka Raya",
    motto: "Isen Mulang / Cantik",
    roleNote: "Ibu Kota Provinsi & Venue Pendukung",
  },
  {
    id: 4,
    name: "Kabupaten Kapuas",
    capital: "Kuala Kapuas",
    motto: "Tingang Menteng Panunjung Tarung",
  },
  {
    id: 5,
    name: "Kabupaten Barito Selatan",
    capital: "Buntok",
    motto: "Dahani Dahanai Tuntung Tulus",
  },
  {
    id: 6,
    name: "Kabupaten Barito Utara",
    capital: "Muara Teweh",
    motto: "Iya Mulik Bengkang Turan",
    roleNote: "Tuan Rumah PORPROV XI 2018",
  },
  {
    id: 7,
    name: "Kabupaten Barito Timur",
    capital: "Tamiang Layang",
    motto: "Jari Janang Kalalawah",
  },
  {
    id: 8,
    name: "Kabupaten Murung Raya",
    capital: "Puruk Cahu",
    motto: "Tira Tangka Balang",
  },
  {
    id: 9,
    name: "Kabupaten Katingan",
    capital: "Kasongan",
    motto: "Penyang Hinje Simpei",
  },
  {
    id: 10,
    name: "Kabupaten Seruyan",
    capital: "Kuala Pembuang",
    motto: "Gawi Hatantiring",
  },
  {
    id: 11,
    name: "Kabupaten Pulang Pisau",
    capital: "Pulang Pisau",
    motto: "Handep Hapakat",
  },
  {
    id: 12,
    name: "Kabupaten Gunung Mas",
    capital: "Kuala Kurun",
    motto: "Habangkalan Penyang Karuhei Tatau",
  },
  {
    id: 13,
    name: "Kabupaten Sukamara",
    capital: "Sukamara",
    motto: "Gawi Barinjam",
  },
  {
    id: 14,
    name: "Kabupaten Lamandau",
    capital: "Nanga Bulik",
    motto: "Bahaum Bakuba",
  },
];

function formatDate(date: string) {
  try {
    const d = new Date(date.includes("T") ? date : `${date}T12:00:00+07:00`);
    if (isNaN(d.getTime())) return date;
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(d);
  } catch {
    return date;
  }
}

export default function Newsview() {
  const [searchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>(() => {
    const tabParam = searchParams.get("tab")?.toLowerCase();
    if (tabParam === "umkm" || tabParam === "makan" || tabParam === "nongkrong" || tabParam === "kuliner") return "Tempat Makan dan Nongkrong";
    if (tabParam === "hotel" || tabParam === "penginapan") return "Hotel dan Penginapan";
    if (tabParam === "wisata" || tabParam === "pariwisata" || tabParam === "tourism") return "Pariwisata";
    if (tabParam === "kesehatan" || tabParam === "health" || tabParam === "medis") return "Layanan Kesehatan";
    if (tabParam === "galeri" || tabParam === "gallery") return "Galeri";
    if (tabParam === "about" || tabParam === "about-us" || tabParam === "about_us" || tabParam === "sejarah" || tabParam === "history") return "About Us";
    if (tabParam === "berita") return "Berita";
    return "Tempat Makan dan Nongkrong";
  });

  useEffect(() => {
    const tabParam = searchParams.get("tab")?.toLowerCase();
    if (tabParam === "umkm" || tabParam === "makan" || tabParam === "nongkrong" || tabParam === "kuliner") setSelectedCategory("Tempat Makan dan Nongkrong");
    else if (tabParam === "hotel" || tabParam === "penginapan") setSelectedCategory("Hotel dan Penginapan");
    else if (tabParam === "wisata" || tabParam === "pariwisata" || tabParam === "tourism") setSelectedCategory("Pariwisata");
    else if (tabParam === "kesehatan" || tabParam === "health" || tabParam === "medis") setSelectedCategory("Layanan Kesehatan");
    else if (tabParam === "galeri" || tabParam === "gallery") setSelectedCategory("Galeri");
    else if (tabParam === "about" || tabParam === "about-us" || tabParam === "about_us" || tabParam === "sejarah" || tabParam === "history") setSelectedCategory("About Us");
    else if (tabParam === "berita") setSelectedCategory("Berita");
    else if (!tabParam) setSelectedCategory("Tempat Makan dan Nongkrong");
  }, [searchParams]);
  const [selectedUMKMType, setSelectedUMKMType] =
    useState<"Semua" | KobarUMKMType>("Semua");
  const [selectedDistrict, setSelectedDistrict] =
    useState<string>("Semua Kecamatan");
  const [selectedCulinaryTheme, setSelectedCulinaryTheme] =
    useState<string>("Semua");
  const [onlyRecommended, setOnlyRecommended] = useState<boolean>(false);
  const [onlyRealPhoto, setOnlyRealPhoto] = useState<boolean>(false);
  const [umkmPage, setUmkmPage] = useState<number>(1);
  const [selectedUMKMDetail, setSelectedUMKMDetail] =
    useState<KobarUMKMItem | null>(null);
  const [query, setQuery] = useState("");
  const [showAllGallery, setShowAllGallery] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<GaleriItem | null>(null);
  const [galeriItems, setGaleriItems] = useState<GaleriItem[]>([]);
  const [galeriLoading, setGaleriLoading] = useState<boolean>(false);
  const [galeriError, setGaleriError] = useState<string | null>(null);
  const [galeriCategoryFilter, setGaleriCategoryFilter] = useState<string>("Semua");
  const [galeriFeaturedOnly, setGaleriFeaturedOnly] = useState<boolean>(false);
  const [failedGaleriImages, setFailedGaleriImages] = useState<Record<number, boolean>>({});
  const [galeriRefreshTick, setGaleriRefreshTick] = useState<number>(0);

  // Live MMC Kobar API State
  const [mmcArticles, setMmcArticles] = useState<MmcNewsItem[]>([]);
  const [isLoadingMmc, setIsLoadingMmc] = useState<boolean>(true);
  const [mmcError, setMmcError] = useState<string | null>(null);
  const [selectedDetailArticle, setSelectedDetailArticle] = useState<DisplayArticle | null>(null);
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [hotelsLoading, setHotelsLoading] = useState<boolean>(false);
  const [hotelsError, setHotelsError] = useState<string | null>(null);
  const [hotelTypeFilter, setHotelTypeFilter] = useState<string>("Semua");
  const [hotelDistrictFilter, setHotelDistrictFilter] = useState<string>("Semua Kecamatan");
  const [failedHotelImages, setFailedHotelImages] = useState<Record<number, boolean>>({});
  const [hotelRefreshTick, setHotelRefreshTick] = useState<number>(0);

  const [umkmItems, setUmkmItems] = useState<KobarUMKMItem[]>([]);
  const [umkmLoading, setUmkmLoading] = useState<boolean>(false);
  const [umkmError, setUmkmError] = useState<string | null>(null);
  const [failedUmkmImages, setFailedUmkmImages] = useState<Record<number, boolean>>({});
  const [umkmRefreshTick, setUmkmRefreshTick] = useState<number>(0);

  const [wisataItems, setWisataItems] = useState<WisataItem[]>([]);
  const [wisataLoading, setWisataLoading] = useState<boolean>(false);
  const [wisataError, setWisataError] = useState<string | null>(null);
  const [wisataCategoryFilter, setWisataCategoryFilter] = useState<string>("Semua");
  const [wisataDistrictFilter, setWisataDistrictFilter] = useState<string>("Semua");
  const [failedWisataImages, setFailedWisataImages] = useState<Record<number, boolean>>({});
  const [wisataRefreshTick, setWisataRefreshTick] = useState<number>(0);

  const [kesehatanItems, setKesehatanItems] = useState<KesehatanItem[]>([]);
  const [kesehatanLoading, setKesehatanLoading] = useState<boolean>(false);
  const [kesehatanError, setKesehatanError] = useState<string | null>(null);
  const [kesehatanCategoryFilter, setKesehatanCategoryFilter] = useState<string>("Semua");
  const [kesehatanDistrictFilter, setKesehatanDistrictFilter] = useState<string>("Semua");
  const [failedKesehatanImages, setFailedKesehatanImages] = useState<Record<number, boolean>>({});
  const [kesehatanRefreshTick, setKesehatanRefreshTick] = useState<number>(0);

  const fetchMmcNews = async () => {
    setIsLoadingMmc(true);
    setMmcError(null);
    try {
      // const res = await fetch("https://mmc.apikobar.id/api/berita?search=porprov%20xiii");
      const res = await fetch("https://mmc.apikobar.id/api/berita?search=porprov%20xiii");
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
        setMmcArticles(json.data);
      } else {
        setMmcArticles([]);
      }
    } catch (err) {
      console.warn("Gagal memuat berita MMC Kobar:", err);
      setMmcError("Gagal memuat feed berita MMC Kobar");
    } finally {
      setIsLoadingMmc(false);
    }
  };

  useEffect(() => {
    fetchMmcNews();
  }, []);

  const [umkmFiltersOpen, setUmkmFiltersOpen] = useState(false);

  const normalizedQuery = query.trim().toLocaleLowerCase("id");
  const isAboutUsTab = selectedCategory === "About Us";
  const isGalleryTab = selectedCategory === "Galeri";
  const isUMKMTab = selectedCategory === "Tempat Makan dan Nongkrong";
  const isHotelTab = selectedCategory === "Hotel dan Penginapan";
  const isWisataTab = selectedCategory === "Pariwisata";
  const isKesehatanTab = selectedCategory === "Layanan Kesehatan";

  useEffect(() => {
    if (!isKesehatanTab) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setKesehatanLoading(true);
      setKesehatanError(null);
      void fetchKesehatan({
        category: kesehatanCategoryFilter,
        district: kesehatanDistrictFilter,
        search: normalizedQuery,
      })
        .then((rows) => {
          if (!cancelled) {
            setKesehatanItems(rows);
          }
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            setKesehatanError(
              err instanceof Error
                ? err.message
                : "Gagal memuat data layanan kesehatan.",
            );
          }
        })
        .finally(() => {
          if (!cancelled) {
            setKesehatanLoading(false);
          }
        });
    }, normalizedQuery ? 250 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    isKesehatanTab,
    kesehatanCategoryFilter,
    kesehatanDistrictFilter,
    normalizedQuery,
    kesehatanRefreshTick,
  ]);

  useEffect(() => {
    if (!isGalleryTab) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setGaleriLoading(true);
      setGaleriError(null);
      void fetchGaleri({
        category: galeriCategoryFilter,
        is_featured: galeriFeaturedOnly ? true : undefined,
        search: normalizedQuery,
      })
        .then((rows) => {
          if (!cancelled) {
            setGaleriItems(rows);
          }
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            setGaleriError(
              err instanceof Error ? err.message : "Gagal memuat foto galeri.",
            );
          }
        })
        .finally(() => {
          if (!cancelled) {
            setGaleriLoading(false);
          }
        });
    }, normalizedQuery ? 250 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    isGalleryTab,
    galeriCategoryFilter,
    galeriFeaturedOnly,
    normalizedQuery,
    galeriRefreshTick,
  ]);

  useEffect(() => {
    if (!isUMKMTab) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setUmkmLoading(true);
      setUmkmError(null);
      void fetchUMKM({
        tipe: selectedUMKMType,
        culinary_theme_key: selectedCulinaryTheme,
        kecamatan: selectedDistrict,
        recommended: onlyRecommended,
        search: normalizedQuery,
      })
        .then((rows) => {
          if (!cancelled) {
            setUmkmItems(rows);
          }
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            setUmkmError(
              err instanceof Error ? err.message : "Gagal memuat data kuliner & UMKM.",
            );
          }
        })
        .finally(() => {
          if (!cancelled) {
            setUmkmLoading(false);
          }
        });
    }, normalizedQuery ? 250 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    isUMKMTab,
    selectedUMKMType,
    selectedCulinaryTheme,
    selectedDistrict,
    onlyRecommended,
    normalizedQuery,
    umkmRefreshTick,
  ]);

  useEffect(() => {
    if (!isWisataTab) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setWisataLoading(true);
      setWisataError(null);
      void fetchWisata({
        category: wisataCategoryFilter,
        district: wisataDistrictFilter,
        search: normalizedQuery,
      })
        .then((rows) => {
          if (!cancelled) {
            setWisataItems(rows);
          }
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            setWisataError(
              err instanceof Error ? err.message : "Gagal memuat data destinasi wisata.",
            );
          }
        })
        .finally(() => {
          if (!cancelled) {
            setWisataLoading(false);
          }
        });
    }, normalizedQuery ? 250 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    isWisataTab,
    wisataCategoryFilter,
    wisataDistrictFilter,
    normalizedQuery,
    wisataRefreshTick,
  ]);

  useEffect(() => {
    if (!isHotelTab) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setHotelsLoading(true);
      setHotelsError(null);
      void fetchHotels({
        type: hotelTypeFilter,
        district: hotelDistrictFilter,
        search: normalizedQuery,
      })
        .then((rows) => {
          if (!cancelled) {
            setHotels(rows);
          }
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            setHotelsError(
              err instanceof Error ? err.message : "Gagal memuat data hotel.",
            );
          }
        })
        .finally(() => {
          if (!cancelled) {
            setHotelsLoading(false);
          }
        });
    }, normalizedQuery ? 250 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isHotelTab, hotelTypeFilter, hotelDistrictFilter, normalizedQuery, hotelRefreshTick]);

  const liveMappedArticles: DisplayArticle[] = useMemo(() => {
    if (mmcArticles.length > 0) {
      return mmcArticles.map((item, idx) => ({
        id: `mmc-${item.id_berita}`,
        category: item.sopd || "MMC Kobar",
        sopd: item.sopd || "Dispora Kobar",
        date: item.set_tanggal_publish,
        title: decodeHtmlContent(item.judul),
        excerpt: getCleanExcerpt(item.deskripsi).slice(0, 160) + "...",
        fullHtml: decodeHtmlContent(item.deskripsi),
        slug: item.slug_berita,
        image: getArticleImage(item.slug_berita, item.filename1, idx),
        isMmcLive: true,
        theme: idx % 3 === 0 ? "green" : idx % 3 === 1 ? "lime" : "orange",
      }));
    }
    // Fallback editorial articles
    return articles.map((art, idx) => ({
      id: art.id,
      category: art.category,
      sopd: "Panitia PORPROV",
      date: art.date,
      title: art.title,
      excerpt: art.excerpt,
      fullHtml: `<p>${art.excerpt}</p>`,
      image: art.image || venueImageFallbacks[idx % venueImageFallbacks.length],
      isMmcLive: false,
      theme: art.theme,
    }));
  }, [mmcArticles]);

  const visibleMilestones = useMemo(
    () =>
      porprovMilestones.filter(
        (m) =>
          !normalizedQuery ||
          `${m.era} ${m.edition} ${m.host} ${m.title} ${m.description} ${m.highlight}`
            .toLocaleLowerCase("id")
            .includes(normalizedQuery),
      ),
    [normalizedQuery],
  );

  const visibleContingents = useMemo(
    () =>
      contingentProfiles.filter(
        (c) =>
          !normalizedQuery ||
          `${c.name} ${c.capital} ${c.motto} ${c.roleNote ?? ""}`
            .toLocaleLowerCase("id")
            .includes(normalizedQuery),
      ),
    [normalizedQuery],
  );

  const visibleArticles = useMemo(
    () =>
      liveMappedArticles.filter((article) => {
        const matchesCategory =
          selectedCategory === "Berita" ||
          article.category.toLowerCase().includes(selectedCategory.toLowerCase());
        const matchesQuery =
          !normalizedQuery ||
          `${article.title} ${article.excerpt} ${article.category} ${article.sopd ?? ""}`
            .toLocaleLowerCase("id")
            .includes(normalizedQuery);

        return matchesCategory && matchesQuery;
      }),
    [liveMappedArticles, normalizedQuery, selectedCategory],
  );

  const galeriCategoryOptions = useMemo(() => {
    const unique = Array.from(
      new Set(galeriItems.map((g) => g.category).filter(Boolean)),
    );
    return ["Semua", ...unique];
  }, [galeriItems]);

  const visibleGalleryPhotos = useMemo(
    () =>
      galeriItems.filter((photo) => {
        const matchesCategory =
          galeriCategoryFilter === "Semua" ||
          photo.category === galeriCategoryFilter;
        const matchesFeatured = !galeriFeaturedOnly || photo.is_featured;
        const matchesQuery =
          !normalizedQuery ||
          `${photo.title} ${photo.category} ${photo.caption} ${photo.photographer}`
            .toLocaleLowerCase("id")
            .includes(normalizedQuery);
        return matchesCategory && matchesFeatured && matchesQuery;
      }),
    [galeriItems, galeriCategoryFilter, galeriFeaturedOnly, normalizedQuery],
  );
  const displayedGalleryPhotos = showAllGallery
    ? visibleGalleryPhotos
    : visibleGalleryPhotos.slice(0, 6);

  const visibleUMKM = useMemo(() => {
    const filtered = umkmItems.filter((item) => {
      const matchesType =
        selectedUMKMType === "Semua" || item.tipe === selectedUMKMType;
      const matchesDistrict =
        selectedDistrict === "Semua Kecamatan" ||
        item.kecamatanFull.includes(selectedDistrict) ||
        selectedDistrict.includes(item.kecamatan);
      const matchesTheme =
        selectedCulinaryTheme === "Semua" ||
        item.culinaryThemeKey === selectedCulinaryTheme;
      const matchesRecommended = !onlyRecommended || item.recommended;
      const matchesRealPhoto =
        !onlyRealPhoto || item.image.startsWith("/kuliner-real/");
      const matchesQuery =
        !normalizedQuery ||
        `${item.nama} ${item.kategori_google} ${item.culinaryTheme} ${item.signatureDish} ${item.deskripsi ?? ""} ${item.alamat} ${item.kecamatanFull}`
          .toLocaleLowerCase("id")
          .includes(normalizedQuery);

      return (
        matchesType &&
        matchesDistrict &&
        matchesTheme &&
        matchesRecommended &&
        matchesRealPhoto &&
        matchesQuery
      );
    });

    // Tempat dengan foto nyata (/kuliner-real/) selalu diletakkan paling atas (halaman 1),
    // kemudian diikuti oleh tempat dengan jumlah ulasan & rating tertinggi
    return [...filtered].sort((a, b) => {
      const aIsReal = a.image.startsWith("/kuliner-real/") ? 1 : 0;
      const bIsReal = b.image.startsWith("/kuliner-real/") ? 1 : 0;
      if (aIsReal !== bIsReal) {
        return bIsReal - aIsReal;
      }
      return (b.jumlah_ulasan || 0) - (a.jumlah_ulasan || 0);
    });
  }, [
    umkmItems,
    normalizedQuery,
    selectedUMKMType,
    selectedDistrict,
    selectedCulinaryTheme,
    onlyRecommended,
    onlyRealPhoto,
  ]);

  const umkmItemsPerPage = 12;
  const totalUMKMPages = Math.ceil(visibleUMKM.length / umkmItemsPerPage) || 1;
  const paginatedUMKM = useMemo(() => {
    const start = (umkmPage - 1) * umkmItemsPerPage;
    return visibleUMKM.slice(start, start + umkmItemsPerPage);
  }, [visibleUMKM, umkmPage]);

  const visibleHotels = useMemo(
    () =>
      hotels.filter((hotel) => {
        const matchesType =
          hotelTypeFilter === "Semua" || hotel.type === hotelTypeFilter;
        const matchesDistrict =
          hotelDistrictFilter === "Semua Kecamatan" ||
          hotel.district
            .toLocaleLowerCase("id")
            .includes(hotelDistrictFilter.toLocaleLowerCase("id"));
        const matchesQuery =
          !normalizedQuery ||
          `${hotel.hotelName} ${hotel.type} ${hotel.address} ${hotel.district} ${hotel.nearVenue} ${hotel.facilities.join(" ")}`
            .toLocaleLowerCase("id")
            .includes(normalizedQuery);
        return matchesType && matchesDistrict && matchesQuery;
      }),
    [hotels, hotelTypeFilter, hotelDistrictFilter, normalizedQuery],
  );

  const wisataCategoryOptions = useMemo(() => {
    const unique = Array.from(
      new Set(wisataItems.map((w) => w.category).filter(Boolean)),
    );
    return ["Semua", ...unique];
  }, [wisataItems]);

  const wisataDistrictOptions = useMemo(() => {
    const unique = Array.from(
      new Set(wisataItems.map((w) => w.district).filter(Boolean)),
    );
    return ["Semua", ...unique];
  }, [wisataItems]);

  const visibleWisata = useMemo(
    () =>
      wisataItems.filter((wisata) => {
        const matchesCategory =
          wisataCategoryFilter === "Semua" ||
          wisata.category === wisataCategoryFilter;
        const matchesDistrict =
          wisataDistrictFilter === "Semua" ||
          wisata.district === wisataDistrictFilter;
        const matchesQuery =
          !normalizedQuery ||
          `${wisata.name} ${wisata.category} ${wisata.district} ${wisata.description} ${wisata.highlights} ${wisata.openInfo}`
            .toLocaleLowerCase("id")
            .includes(normalizedQuery);
        return matchesCategory && matchesDistrict && matchesQuery;
      }),
    [wisataItems, wisataCategoryFilter, wisataDistrictFilter, normalizedQuery],
  );

  const kesehatanDistrictOptions = useMemo(() => {
    const unique = Array.from(
      new Set(kesehatanItems.map((k) => k.district).filter(Boolean)),
    );
    return ["Semua", ...unique];
  }, [kesehatanItems]);

  const visibleKesehatan = useMemo(
    () =>
      kesehatanItems.filter((item) => {
        const matchesCategory =
          kesehatanCategoryFilter === "Semua" ||
          item.category
            .toLocaleLowerCase("id")
            .includes(kesehatanCategoryFilter.toLocaleLowerCase("id"));
        const matchesDistrict =
          kesehatanDistrictFilter === "Semua" ||
          item.district
            .toLocaleLowerCase("id")
            .includes(kesehatanDistrictFilter.toLocaleLowerCase("id"));
        const matchesQuery =
          !normalizedQuery ||
          `${item.name} ${item.category} ${item.district} ${item.description} ${item.highlights} ${item.openInfo}`
            .toLocaleLowerCase("id")
            .includes(normalizedQuery);
        return matchesCategory && matchesDistrict && matchesQuery;
      }),
    [kesehatanItems, kesehatanCategoryFilter, kesehatanDistrictFilter, normalizedQuery],
  );

  const searchPlaceholder = isGalleryTab
    ? "Cari foto galeri..."
    : isAboutUsTab
      ? "Cari profil PORPROV, sejarah tuan rumah, atau kontingen daerah..."
      : isUMKMTab
        ? "Cari nama tempat makan, kedai kopi, menu masakan, atau alamat di Kobar..."
        : isHotelTab
          ? "Cari nama hotel, wisma, atau lokasi..."
          : isWisataTab
            ? "Cari destinasi wisata, pantai, cagar budaya, atau lokasi..."
            : isKesehatanTab
              ? "Cari rumah sakit, puskesmas, klinik, apotek, atau lokasi..."
              : "Cari berita...";

  return (
    <>
      <SiteHeader />

      <main className="news-page">
        <section className="news-intro section-wrap">
          <div className="schedule-breadcrumb">
            <Link to="/">Beranda</Link>
            <span aria-hidden="true">/</span>
            <span>
              {isGalleryTab
                ? "Galeri"
                : isAboutUsTab
                  ? "About Us"
                  : isUMKMTab
                    ? "Tempat Makan & Nongkrong"
                    : isHotelTab
                      ? "Hotel & Penginapan"
                      : isWisataTab
                        ? "Pariwisata"
                        : isKesehatanTab
                          ? "Layanan Kesehatan"
                          : "Informasi"}
            </span>
          </div>
          <p className="schedule-eyebrow">
            <span aria-hidden="true" />
            {isGalleryTab
              ? "GALERI PORPROV XIII KALIMANTAN TENGAH 2026"
              : isAboutUsTab
                ? "ABOUT US • PROFIL & SEJARAH PORPROV KALIMANTAN TENGAH"
                : isUMKMTab
                  ? "DIREKTORI RESMI TEMPAT MAKAN & NONGKRONG KOTAWARINGIN BARAT • PORPROV XIII"
                  : isHotelTab
                    ? "AKOMODASI PORPROV XIII KALIMANTAN TENGAH"
                    : isWisataTab
                      ? "DESTINASI WISATA RESMI KOTAWARINGIN BARAT • PORPROV XIII"
                      : isKesehatanTab
                        ? "LAYANAN KESEHATAN & MEDIS KOTAWARINGIN BARAT • PORPROV XIII"
                        : "INFORMASI PORPROV XIII KALIMANTAN TENGAH 2026"}
          </p>
          <h1>
            {isGalleryTab ? (
              <>
                Galeri <span>PORPROV XIII.</span>
              </>
            ) : isAboutUsTab ? (
              <>
                About <span>PORPROV XIII</span>
              </>
            ) : isUMKMTab ? (
              <>
                Sentra Kuliner dan Restoran di <span>Kotawaringin Barat</span>
              </>
            ) : isHotelTab ? (
              <>
                Hotel & <span>Penginapan</span>
              </>
            ) : isWisataTab ? (
              <>
                Pesona <span>Pariwisata Kobar</span>
              </>
            ) : isKesehatanTab ? (
              <>
                Layanan <span>Kesehatan</span>
              </>
            ) : (
              <>
                Pusat <span>Informasi</span>
              </>
            )}
          </h1>
          <p className="schedule-description">
            {isGalleryTab
              ? "Lihat momen dan semangat olahraga PORPROV XIII Kalimantan Tengah."
              : isAboutUsTab
                ? "Mengenal lebih dekat visi penyelenggaraan, profil organisasi, perjalanan sejarah, filosofi Isen Mulang & Huma Betang, serta profil 14 Kontingen Kabupaten/Kota dalam perhelatan PORPROV XIII Kalimantan Tengah 2026."
                : isUMKMTab
                  ? `Panduan ${umkmItems.length || 63} tempat makan, kedai kopi, restoran, warung makan, dan street food di Kabupaten Kotawaringin Barat untuk kontingen & penonton PORPROV XIII.`
                  : isHotelTab
                    ? "Temukan rekomendasi hotel dan penginapan nyaman di sekitar lokasi pertandingan PORPROV XIII."
                    : isWisataTab
                      ? "Panduan destinasi wisata unggulan di Kabupaten Kotawaringin Barat — mulai dari habitat orangutan Taman Nasional Tanjung Puting, Pantai Kubu, cagar budaya Istana Kuning, hingga susur Sungai Arut."
                      : isKesehatanTab
                        ? "Direktori rumah sakit, puskesmas, klinik, dan apotek di Kabupaten Kotawaringin Barat untuk mendukung kesehatan atlet, ofisial, dan penonton PORPROV XIII."
                        : "Informasi terkini seputar PORPROV XIII Kalimantan Tengah"}
          </p>
          <img
            className="news-hero-illustration"
            src="/keraBerita.webp"
            alt="Maskot PORPROV memegang kamera"
          />
          {!isAboutUsTab && (
            <p className="news-demo-note" role="note">
              Jelajahi informasi resmi seputar PORPROV XIII Kalimantan Tengah 2026
            </p>
          )}
        </section>

        <section
          className="news-content section-wrap"
          aria-label={
            isHotelTab
              ? "Akomodasi hotel dan penginapan"
              : isWisataTab
                ? "Destinasi pariwisata Kotawaringin Barat"
                : isUMKMTab
                  ? "Direktori Tempat Makan dan Nongkrong Kotawaringin Barat"
                  : isGalleryTab
                    ? "Galeri foto"
                    : isAboutUsTab
                      ? "Tentang kami dan sejarah PORPROV Kalimantan Tengah"
                      : "Daftar berita"
          }
        >
          <div className="news-toolbar">
            <label className="news-search">
              <span className="sr-only">{searchPlaceholder}</span>
              <Input
                type="search"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-10"
              />
            </label>

            <div className="news-categories" aria-label="Filter kategori berita">
              {categories.map((category) => (
                <Button
                  key={category}
                  type="button"
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="lg"
                  aria-pressed={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {isAboutUsTab ? (
            <div className="space-y-10" aria-live="polite">
              {/* 1. Hero Sejarah / Profil Singkat */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-[image:var(--hero-gradient)] p-6 text-white shadow-lg sm:p-10">
                <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
                  <div className="space-y-4 lg:col-span-8">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-extrabold tracking-wider text-amber-300 uppercase backdrop-blur-xs">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Profil Resmi & Sejarah Penyelenggaraan</span>
                    </div>
                    <h2 className="text-2xl leading-tight font-extrabold tracking-tight sm:text-4xl">
                      Pekan Olahraga Provinsi (PORPROV) XIII Kalimantan Tengah 2026
                    </h2>
                    <p className="text-sm leading-relaxed text-sky-100 sm:text-base">
                      <strong>PORPROV XIII Kalimantan Tengah 2026</strong> adalah puncak perhelatan olahraga multieven tingkat provinsi empat tahunan terbesar di <em>Bumi Tambun Bungai</em>. Diselenggarakan di bawah naungan Pemerintah Provinsi Kalimantan Tengah dan KONI Provinsi Kalimantan Tengah, edisi ke-13 ini menunjuk <strong>Kabupaten Kotawaringin Barat (Pangkalan Bun)</strong> sebagai tuan rumah utama dengan dukungan beberapa venue standar nasional di Kota Palangka Raya.
                    </p>
                    <p className="text-sm leading-relaxed text-sky-100/90">
                      Mengusung semangat <strong>&ldquo;Isen Mulang&rdquo;</strong> (Pantang Mundur) yang berpadu harmonis dengan semboyan tuan rumah <strong>&ldquo;Marunting Batu Aji&rdquo;</strong> (Menuju Kejayaan), PORPROV XIII menjadi panggung pembuktian ribuan atlet terbaik dari <strong>13 Kabupaten dan 1 Kota</strong> untuk mengukir prestasi tertinggi menuju Pekan Olahraga Nasional (PON).
                    </p>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <Link
                        to="/jadwal"
                        className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-amber-300"
                      >
                        <Calendar className="h-4 w-4" />
                        Lihat Jadwal Pertandingan
                      </Link>
                      <Link
                        to="/venue"
                        className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-xs transition-colors hover:bg-white/20"
                      >
                        <MapPin className="h-4 w-4" />
                        Jelajahi 25 Venue
                      </Link>
                      <Link
                        to="/bagan"
                        className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-xs transition-colors hover:bg-white/20"
                      >
                        <Trophy className="h-4 w-4" />
                        Bagan & Klasemen
                      </Link>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-2xl border border-white/15 bg-white/10 p-6 text-center backdrop-blur-xs lg:col-span-4">
                    <img
                      src="/iconporKalteng-removebg-preview.webp"
                      alt="Logo PORPROV XIII Kalimantan Tengah"
                      className="h-28 w-auto object-contain drop-shadow-md"
                    />
                    <span className="mt-4 rounded-full bg-amber-400/20 px-3 py-1 text-[11px] font-bold text-amber-300">
                      TUAN RUMAH UTAMA 2026
                    </span>
                    <h3 className="mt-2 text-lg font-extrabold text-white">
                      Kabupaten Kotawaringin Barat
                    </h3>
                    <p className="mt-1 text-xs text-sky-100">
                      Kota Manis Pangkalan Bun • Kalimantan Tengah
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Angka Utama / Key Facts */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Card className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                      Kontingen Peserta
                    </span>
                    <div className="rounded-lg bg-sky-50 p-2 text-[#174a72]">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-3xl font-extrabold text-[#102b49]">14</p>
                    <p className="mt-1 text-xs font-medium text-slate-600">
                      13 Kabupaten & 1 Kota se-Kalteng
                    </p>
                  </div>
                </Card>

                <Card className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                      Cabang Olahraga
                    </span>
                    <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                      <Trophy className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-3xl font-extrabold text-[#102b49]">32</p>
                    <p className="mt-1 text-xs font-medium text-slate-600">
                      Cabor Resmi Dipertandingkan
                    </p>
                  </div>
                </Card>

                <Card className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                      Arena Pertandingan
                    </span>
                    <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                      <Building2 className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-3xl font-extrabold text-[#102b49]">25</p>
                    <p className="mt-1 text-xs font-medium text-slate-600">
                      Venue di Kobar & Palangka Raya
                    </p>
                  </div>
                </Card>

                <Card className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                      Edisi Penyelenggaraan
                    </span>
                    <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
                      <Medal className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-3xl font-extrabold text-[#102b49]">Ke-13</p>
                    <p className="mt-1 text-xs font-medium text-slate-600">
                      Tonggak Sejarah PORPROV 2026
                    </p>
                  </div>
                </Card>
              </div>

              {/* 3. Sejarah & Filosofi Huma Betang */}
              <div className="grid gap-6 lg:grid-cols-12">
                <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8 lg:col-span-7">
                  <div className="flex items-center gap-2 text-xs font-extrabold tracking-wider text-[#174a72] uppercase">
                    <BookOpen className="h-4 w-4" />
                    <span>Sejarah • Mengapa PORPROV Diselenggarakan?</span>
                  </div>
                  <h3 className="mt-2 text-xl font-extrabold text-slate-900 sm:text-2xl">
                    Kawah Candradimuka Atlet Kalimantan Tengah Menuju Pentas Nasional
                  </h3>
                  <div className="mt-4 space-y-3.5 text-sm leading-relaxed text-slate-600">
                    <p>
                      Sejak pertama kali dirintis sebagai Pekan Olahraga Daerah (PORDA), <strong>Pekan Olahraga Provinsi (PORPROV) Kalimantan Tengah</strong> hadir bukan sekadar sebagai ajang perebutan medali antar-kabupaten, melainkan sebagai barometer utama pembinaan olahraga prestasi di seluruh penjuru Kalimantan Tengah.
                    </p>
                    <p>
                      Melalui kompetisi yang terukur, transparan, dan menjunjung tinggi sportivitas, PORPROV menjadi tahapan seleksi paling krusial bagi Komite Olahraga Nasional Indonesia (KONI) Provinsi Kalimantan Tengah bersama Pengurus Provinsi (Pengprov) Cabang Olahraga dalam menjaring talenta-talenta muda potensial yang akan mewakili Kalimantan Tengah pada ajang <strong>Pra-PON</strong> dan <strong>Pekan Olahraga Nasional (PON)</strong>.
                    </p>
                    <p>
                      Pada penyelenggaraan <strong>PORPROV XIII Tahun 2026 di Kabupaten Kotawaringin Barat</strong>, panitia besar mengintegrasikan tata kelola pertandingan modern berbasis teknologi digital. Seluruh jadwal harian, pembaruan skor penyisihan grup, bagan gugur (perempat final, semifinal, hingga final), dan klasemen perolehan medali disajikan secara terbuka agar masyarakat di 14 kabupaten/kota dapat memberikan dukungan penuh secara langsung.
                    </p>
                  </div>
                </Card>

                <Card className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/80 p-6 shadow-xs sm:p-8 lg:col-span-5">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-extrabold tracking-wider text-[#174a72] uppercase">
                      <Flame className="h-4 w-4 text-amber-600" />
                      <span>Nilai Luhur & Filosofi</span>
                    </div>
                    <h3 className="mt-2 text-xl font-extrabold text-slate-900">
                      Tiga Pilar Semangat PORPROV XIII
                    </h3>

                    <div className="mt-5 space-y-4">
                      <div className="rounded-xl border border-slate-200/80 bg-white p-4">
                        <h4 className="text-sm font-extrabold text-[#102b49]">
                          1. Semangat &ldquo;Isen Mulang&rdquo; (Pantang Mundur)
                        </h4>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600">
                          Mencerminkan daya juang atlet Kalimantan Tengah yang gigih, disiplin, dan pantang menyerah sebelum peluit akhir dibunyikan demi mengharumkan nama daerah.
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200/80 bg-white p-4">
                        <h4 className="text-sm font-extrabold text-[#102b49]">
                          2. Falsafah &ldquo;Huma Betang&rdquo; (Persaudaraan & Kesetaraan)
                        </h4>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600">
                          Menjadikan arena olahraga sebagai rumah besar bersama yang merajut harmoni, kerukunan, dan persatuan 14 kabupaten/kota di atas segala perbedaan.
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200/80 bg-white p-4">
                        <h4 className="text-sm font-extrabold text-[#102b49]">
                          3. &ldquo;Marunting Batu Aji&rdquo; (Menuju Kejayaan)
                        </h4>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600">
                          Semboyan kebanggaan masyarakat Kotawaringin Barat yang menjadi inspirasi sukses penyelenggaraan, sukses prestasi, dan sukses pemberdayaan ekonomi rakyat.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* 4. Visi & Misi Penyelenggaraan */}
              <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
                <div className="grid gap-8 lg:grid-cols-12">
                  <div className="rounded-xl bg-[#102b49] p-6 text-white lg:col-span-5">
                    <div className="inline-flex items-center gap-2 rounded-md bg-white/10 px-2.5 py-1 text-xs font-bold text-amber-300 uppercase">
                      <Target className="h-4 w-4" />
                      <span>Visi Utama</span>
                    </div>
                    <h3 className="mt-3 text-xl leading-snug font-extrabold sm:text-2xl">
                      &ldquo;Mewujudkan PORPROV XIII Kalimantan Tengah 2026 yang Berprestasi, Sportif, Modern, dan Menggerakkan Ekonomi Daerah.&rdquo;
                    </h3>
                    <p className="mt-3 text-xs leading-relaxed text-sky-100/90">
                      Kami berkomitmen menghadirkan standar baru penyelenggaraan pekan olahraga provinsi yang profesional, akuntabel, dan memberikan dampak nyata bagi atlet maupun masyarakat luas.
                    </p>
                  </div>

                  <div className="space-y-4 lg:col-span-7">
                    <div className="flex items-center gap-2 text-xs font-extrabold tracking-wider text-[#174a72] uppercase">
                      <Compass className="h-4 w-4" />
                      <span>Misi & Catur Sukses PORPROV XIII</span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">
                            Sukses Penyelenggaraan
                          </h4>
                          <p className="mt-1 text-xs leading-relaxed text-slate-600">
                            Menyelenggarakan pertandingan di 32 cabang olahraga dan 25 venue dengan standar teknis, keamanan, dan perwasitan yang objektif serta terintegrasi digital.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                        <Award className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">
                            Sukses Prestasi Daerah
                          </h4>
                          <p className="mt-1 text-xs leading-relaxed text-slate-600">
                            Melahirkan rekor-rekor baru provinsi dan menjaring atlet-atlet unggulan Kalimantan Tengah untuk berlaga di tingkat nasional maupun internasional.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                        <Store className="mt-0.5 h-5 w-5 shrink-0 text-[#174a72]" />
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">
                            Sukses Ekonomi Kerakyatan, Tempat Makan &amp; Nongkrong
                          </h4>
                          <p className="mt-1 text-xs leading-relaxed text-slate-600">
                            Menggerakkan sektor tempat makan dan nongkrong, kuliner lokal, perhotelan, transportasi, dan pariwisata (sport tourism) di Kotawaringin Barat dan sekitarnya.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">
                            Sukses Administrasi & Transparansi
                          </h4>
                          <p className="mt-1 text-xs leading-relaxed text-slate-600">
                            Menjamin keabsahan data atlet, keterbukaan hasil pertandingan secara real-time, serta tata kelola penyelenggaraan yang tertib dan akuntabel.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 5. Timeline Jejak Sejarah PORPROV Kalimantan Tengah */}
              <div className="space-y-4">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-extrabold tracking-wider text-[#174a72] uppercase">
                      <History className="h-4 w-4" />
                      <span>Jejak Perjalanan Sejarah</span>
                    </div>
                    <h3 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">
                      Lintas Sejarah PORDA hingga PORPROV XIII Kalimantan Tengah
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">
                    Menampilkan <strong>{visibleMilestones.length}</strong> tonggak sejarah utama
                  </span>
                </div>

                {visibleMilestones.length > 0 ? (
                  <div className="relative space-y-4 before:absolute before:top-4 before:bottom-4 before:left-4 before:w-0.5 before:bg-slate-200 sm:before:left-6">
                    {visibleMilestones.map((item, idx) => {
                      const isCurrent = item.edition.includes("XIII");
                      return (
                        <div
                          key={item.edition}
                          className="relative pl-11 sm:pl-16"
                        >
                          <div
                            className={`absolute top-5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-extrabold sm:left-3.5 ${isCurrent
                              ? "border-amber-400 bg-[#102b49] text-amber-300 shadow-sm"
                              : "border-[#174a72] bg-white text-[#174a72]"
                              }`}
                          >
                            {idx + 1}
                          </div>

                          <Card
                            className={`rounded-xl border p-5 shadow-xs transition-all ${isCurrent
                              ? "border-[#174a72] bg-gradient-to-r from-sky-50/90 to-white ring-1 ring-[#174a72]/20"
                              : "border-slate-200 bg-white"
                              }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-extrabold ${isCurrent
                                    ? "bg-[#102b49] text-amber-300"
                                    : "bg-slate-100 text-slate-800"
                                    }`}
                                >
                                  {item.edition}
                                </span>
                                <span className="text-xs font-bold text-[#174a72]">
                                  {item.era}
                                </span>
                              </div>
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                                <MapPin className="h-3.5 w-3.5" />
                                Tuan Rumah: {item.host}
                              </span>
                            </div>

                            <h4 className="mt-3 text-base font-extrabold text-slate-900 sm:text-lg">
                              {item.title}
                            </h4>
                            <p className="mt-1.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
                              {item.description}
                            </p>
                            <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-100/90 px-3 py-1.5 text-xs font-semibold text-slate-700">
                              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                              <span>Sorotan Utama: {item.highlight}</span>
                            </div>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="news-empty" role="status">
                    Catatan sejarah tidak ditemukan untuk kata kunci tersebut.
                  </p>
                )}
              </div>

              {/* 6. Daftar 14 Kontingen Kabupaten/Kota Peserta PORPROV XIII */}
              <div className="space-y-4">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-extrabold tracking-wider text-[#174a72] uppercase">
                      <HeartHandshake className="h-4 w-4" />
                      <span>Persaudaraan 14 Kabupaten & Kota</span>
                    </div>
                    <h3 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">
                      Profil 14 Kontingen Kebanggaan Kalimantan Tengah
                    </h3>
                    <p className="mt-1 text-xs text-slate-600">
                      Seluruh kontingen berkompetisi dengan semangat sportivitas tinggi membawa lambang dan semboyan kehormatan daerah masing-masing.
                    </p>
                  </div>
                  <span className="text-xs text-slate-500">
                    Menampilkan <strong>{visibleContingents.length}</strong> dari 14 kontingen
                  </span>
                </div>

                {visibleContingents.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {visibleContingents.map((contingent) => {
                      const logoUrl = getContingentLogoUrl(
                        contingent.name,
                        contingent.id,
                      );
                      return (
                        <Card
                          key={contingent.id}
                          className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-[#397eae] hover:shadow-sm"
                        >
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-2">
                            {logoUrl ? (
                              <img
                                src={logoUrl}
                                alt={`Lambang ${contingent.name}`}
                                className="h-full w-full object-contain"
                                loading="lazy"
                              />
                            ) : (
                              <Globe className="h-7 w-7 text-[#174a72]" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            {contingent.roleNote && (
                              <span className="mb-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-900">
                                {contingent.roleNote}
                              </span>
                            )}
                            <h4 className="truncate text-sm font-extrabold text-slate-900">
                              {contingent.name}
                            </h4>
                            <p className="text-xs text-slate-500">
                              Ibu Kota: <strong>{contingent.capital}</strong>
                            </p>
                            <p className="mt-1 truncate text-[11px] font-semibold text-[#174a72] italic">
                              &ldquo;{contingent.motto}&rdquo;
                            </p>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <p className="news-empty" role="status">
                    Kontingen tidak ditemukan untuk kata kunci tersebut.
                  </p>
                )}
              </div>
            </div>
          ) : isGalleryTab ? (
            <div className="space-y-6" aria-live="polite">
              {/* Filter Kategori & Unggulan Galeri */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/90 p-4 text-xs text-slate-600 shadow-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <label htmlFor="galeri-category-filter" className="font-semibold text-slate-600 shrink-0">
                    Kategori:
                  </label>
                  <select
                    id="galeri-category-filter"
                    value={galeriCategoryFilter}
                    onChange={(e) => setGaleriCategoryFilter(e.target.value)}
                    className="max-w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-[#174a72] focus:outline-hidden"
                  >
                    {galeriCategoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => setGaleriFeaturedOnly((prev) => !prev)}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${galeriFeaturedOnly
                      ? "bg-amber-400 text-slate-950 shadow-xs"
                      : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                  >
                    <Star className={`h-3.5 w-3.5 shrink-0 ${galeriFeaturedOnly ? "fill-slate-950" : "text-amber-500"}`} />
                    Foto Unggulan
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span>
                    Menampilkan <strong>{visibleGalleryPhotos.length}</strong> foto
                  </span>
                  {(galeriCategoryFilter !== "Semua" ||
                    galeriFeaturedOnly ||
                    normalizedQuery !== "") && (
                      <button
                        type="button"
                        onClick={() => {
                          setGaleriCategoryFilter("Semua");
                          setGaleriFeaturedOnly(false);
                          setQuery("");
                        }}
                        className="inline-flex shrink-0 items-center gap-1 font-bold text-rose-600 hover:underline"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Reset
                      </button>
                    )}
                </div>
              </div>

              {galeriLoading ? (
                <div
                  className="rounded-xl border border-slate-200 bg-white p-10 text-center text-xs font-semibold text-slate-600"
                  role="status"
                >
                  Memuat foto galeri dari server...
                </div>
              ) : galeriError ? (
                <div
                  className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center"
                  role="alert"
                >
                  <p className="text-sm font-bold text-rose-800">
                    Gagal memuat foto galeri
                  </p>
                  <p className="mt-1 text-xs text-rose-700">{galeriError}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setGaleriRefreshTick((t) => t + 1)}
                    className="mt-4 gap-1.5 border-rose-300 bg-white text-rose-700 hover:bg-rose-100"
                  >
                    <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                    Coba Lagi
                  </Button>
                </div>
              ) : visibleGalleryPhotos.length > 0 ? (
                <>
                  <div className="news-gallery-grid">
                    {displayedGalleryPhotos.map((photo) => {
                      const imgFailed = Boolean(failedGaleriImages[photo.id]);
                      const hasValidImage = Boolean(photo.image_url) && !imgFailed;
                      return (
                        <Card
                          className="news-gallery-card min-w-0 cursor-pointer p-0"
                          key={photo.id}
                          role="article"
                          aria-label={`${photo.category}: ${photo.title}`}
                          onClick={() => setSelectedPhoto(photo)}
                        >
                          {hasValidImage ? (
                            <img
                              className="news-gallery-image"
                              src={photo.image_url}
                              alt={photo.title}
                              decoding="async"
                              loading="lazy"
                              onError={() =>
                                setFailedGaleriImages((prev) => ({
                                  ...prev,
                                  [photo.id]: true,
                                }))
                              }
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center bg-[image:var(--hero-gradient)] p-4 text-center text-white/85">
                              <Camera className="mb-1.5 h-8 w-8 shrink-0 text-amber-300" />
                              <span className="max-w-full break-words line-clamp-2 text-xs font-bold">
                                {photo.title}
                              </span>
                              <span className="mt-0.5 text-[10px] text-sky-200/80">
                                Foto belum tersedia
                              </span>
                            </div>
                          )}
                          {photo.is_featured && (
                            <span className="absolute top-3 right-3 z-10 inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-950 shadow-xs">
                              <Star className="h-3 w-3 shrink-0 fill-slate-950" />
                              Unggulan
                            </span>
                          )}
                          <div className="news-gallery-copy min-w-0">
                            <span className="block max-w-full truncate">
                              {photo.category}
                            </span>
                            <h2 className="min-w-0 break-words line-clamp-2">
                              {photo.title}
                            </h2>
                            {photo.caption && (
                              <p className="mt-1 min-w-0 break-words line-clamp-2 text-xs text-white/80">
                                {photo.caption}
                              </p>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                  {visibleGalleryPhotos.length > 6 && (
                    <div className="flex justify-center">
                      <Button
                        className="news-gallery-more shrink-0"
                        type="button"
                        variant="outline"
                        onClick={() => setShowAllGallery((showAll) => !showAll)}
                      >
                        {showAllGallery ? "Tampilkan lebih sedikit" : "Lebih banyak"}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div
                  className="rounded-xl border border-dashed border-slate-300 p-10 text-center"
                  role="status"
                >
                  <Camera className="mx-auto h-9 w-9 text-slate-400" />
                  <p className="mt-2 text-sm font-bold text-slate-800">
                    Foto galeri tidak ditemukan
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Coba ubah filter kategori atau kata kunci pencarian.
                  </p>
                </div>
              )}
            </div>
          ) : isHotelTab ? (
            <div className="space-y-6" aria-live="polite">
              {/* Hero Banner: Akomodasi & Penginapan Kotawaringin Barat */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-[image:var(--hero-gradient)] text-white shadow-lg">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 p-4 sm:p-8">
                  <div className="w-full min-w-0 max-w-2xl space-y-3">
                    <div className="inline-flex max-w-full items-center gap-2 rounded-xl sm:rounded-full bg-amber-400/20 border border-amber-400/30 px-3 py-1 text-[10px] sm:text-xs font-bold leading-snug text-amber-300">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="[overflow-wrap:anywhere]">AKOMODASI &amp; PENGINAPAN RESMI • PORPROV XIII</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                      Istirahat Nyaman di Jantung Pangkalan Bun
                    </h2>

                    <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed">
                      Temukan <strong>{visibleHotels.length} rekomendasi hotel, resort, dan penginapan strategis</strong> di sekitar arena pertandingan PORPROV XIII Kalimantan Tengah 2026 — lengkap dengan estimasi tarif, fasilitas, dan akses reservasi langsung.
                    </p>
                  </div>

                  <div className="w-full md:w-auto shrink-0 flex items-center justify-center">
                    <div className="relative flex flex-col items-center justify-center border-none shadow-none">
                      <img
                        src="/monyet_tidur.webp"
                        alt="Maskot Monyet Tidur Hotel dan Penginapan"
                        className="w-auto h-auto max-h-36 sm:max-h-48 md:max-h-56 max-w-[240px] sm:max-w-[300px] md:max-w-xs object-contain drop-shadow-lg transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Tipe & Kecamatan Hotel */}
              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/90 p-4 text-xs text-slate-600 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(["Semua", ...HOTEL_TYPES] as const).map((typeOption) => {
                      const active = hotelTypeFilter === typeOption;
                      return (
                        <button
                          key={typeOption}
                          type="button"
                          onClick={() => setHotelTypeFilter(typeOption)}
                          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${active
                            ? "bg-[#174a72] text-white shadow-xs"
                            : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                            }`}
                        >
                          {typeOption}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label htmlFor="hotel-district-filter" className="font-semibold text-slate-600 shrink-0">
                      Kecamatan:
                    </label>
                    <select
                      id="hotel-district-filter"
                      value={hotelDistrictFilter}
                      onChange={(e) => setHotelDistrictFilter(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-[#174a72] focus:outline-hidden"
                    >
                      {kobarDistricts.map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="h-4 w-4 shrink-0 text-[#174a72]" />
                    <span className="min-w-0 break-words">
                      Menampilkan <strong>{visibleHotels.length}</strong> rekomendasi akomodasi &amp; penginapan di sekitar venue PORPROV XIII.
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    *Tarif dan ketersediaan kamar dapat berubah selama penyelenggaraan PORPROV.
                  </span>
                </div>
              </div>

              {hotelsLoading ? (
                <div
                  className="rounded-xl border border-slate-200 bg-white p-10 text-center text-xs font-semibold text-slate-600"
                  role="status"
                >
                  Memuat data hotel &amp; penginapan dari server...
                </div>
              ) : hotelsError ? (
                <div
                  className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center"
                  role="alert"
                >
                  <p className="text-sm font-bold text-rose-800">
                    Gagal memuat data hotel &amp; penginapan
                  </p>
                  <p className="mt-1 text-xs text-rose-700">{hotelsError}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setHotelRefreshTick((t) => t + 1)}
                    className="mt-4 gap-1.5 border-rose-300 bg-white text-rose-700 hover:bg-rose-100"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Coba Lagi
                  </Button>
                </div>
              ) : visibleHotels.length > 0 ? (
                <div className="news-grid">
                  {visibleHotels.map((hotel) => {
                    const imgFailed = Boolean(failedHotelImages[hotel.id]);
                    const hasValidImage = Boolean(hotel.image) && !imgFailed;
                    const waDigits = hotel.contact.replace(/\D/g, "");
                    const mapsHref =
                      hotel.mapsUrl ||
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.hotelName} ${hotel.address}`)}`;

                    return (
                      <Card
                        className="news-card flex min-w-0 flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-xs transition-all hover:-translate-y-1 hover:shadow-md"
                        key={hotel.id}
                        role="article"
                      >
                        <div className="min-w-0">
                          <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                            {hasValidImage ? (
                              <img
                                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                src={hotel.image}
                                alt={hotel.hotelName}
                                loading="lazy"
                                onError={() => {
                                  setFailedHotelImages((prev) => ({
                                    ...prev,
                                    [hotel.id]: true,
                                  }));
                                }}
                              />
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center bg-[image:var(--hero-gradient)] p-4 text-center text-white/85">
                                <Building2 className="mb-2 h-8 w-8 text-amber-300 shrink-0" />
                                <span className="max-w-full break-words line-clamp-2 text-xs font-bold">
                                  {hotel.hotelName}
                                </span>
                                <span className="mt-0.5 text-[10px] text-sky-200/80">
                                  Foto belum tersedia
                                </span>
                              </div>
                            )}
                            <div className="absolute top-3 left-3 flex max-w-[65%] flex-wrap items-center gap-1.5">
                              <span className="shrink-0 max-w-full truncate rounded-full bg-[#102b49]/90 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white uppercase backdrop-blur-xs">
                                {hotel.type}
                              </span>
                            </div>
                            <div className="absolute top-3 right-3 flex shrink-0 items-center gap-1 rounded-full bg-amber-400/95 px-2.5 py-1 text-xs font-extrabold text-slate-950 shadow-xs">
                              <Star className="h-3.5 w-3.5 shrink-0 fill-slate-950" />
                              <span>{hotel.rating.toFixed(1)}</span>
                            </div>
                            <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between gap-2">
                              <span className="shrink-0 max-w-full truncate rounded-md bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-xs">
                                Kec. {hotel.district}
                              </span>
                            </div>
                          </div>

                          <div className="min-w-0 p-5">
                            <h2 className="min-w-0 break-words line-clamp-2 text-lg font-extrabold tracking-tight text-slate-900">
                              {hotel.hotelName}
                            </h2>
                            {hotel.priceRange && (
                              <p className="mt-1 min-w-0 break-words line-clamp-1 text-xs font-semibold text-[#174a72]">
                                {hotel.priceRange}
                              </p>
                            )}

                            <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                              <div className="flex min-w-0 items-start gap-2">
                                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#397eae]" />
                                <span className="min-w-0 flex-1 break-words line-clamp-2">
                                  {hotel.address}
                                </span>
                              </div>
                              {hotel.nearVenue && (
                                <div className="flex min-w-0 items-start gap-2 text-[11px] font-medium text-emerald-700">
                                  <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                  <span className="min-w-0 flex-1 break-words line-clamp-2">
                                    {hotel.nearVenue}
                                  </span>
                                </div>
                              )}
                            </div>

                            {hotel.facilities.length > 0 && (
                              <div className="mt-3 flex min-w-0 flex-wrap gap-1.5">
                                {hotel.facilities.map((facility, idx) => (
                                  <span
                                    key={`${hotel.id}-fac-${idx}`}
                                    className="max-w-full truncate rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                                    title={facility}
                                  >
                                    {facility}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50/70 p-4">
                          <a
                            href={mapsHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-lg border border-[#174a72] bg-[#174a72]/5 px-2.5 py-2 text-xs font-bold text-[#174a72] transition-colors hover:bg-[#174a72] hover:text-white"
                            title="Buka lokasi hotel, fasilitas, dan rute di Google Maps"
                          >
                            <Camera className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">Foto &amp; Peta</span>
                            <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                          </a>
                          {waDigits ? (
                            <a
                              href={`https://wa.me/${waDigits}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
                            >
                              <Phone className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">Reservasi</span>
                            </a>
                          ) : (
                            <a
                              href={mapsHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-lg bg-slate-700 px-2.5 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-800"
                            >
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">Cek Lokasi</span>
                            </a>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div
                  className="rounded-xl border border-dashed border-slate-300 p-10 text-center"
                  role="status"
                >
                  <Building2 className="mx-auto h-9 w-9 text-slate-400" />
                  <p className="mt-2 text-sm font-bold text-slate-800">
                    Data hotel dan penginapan tidak ditemukan
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Coba ubah filter tipe akomodasi, kecamatan, atau kata kunci pencarian.
                  </p>
                  {(hotelTypeFilter !== "Semua" ||
                    hotelDistrictFilter !== "Semua Kecamatan" ||
                    normalizedQuery !== "") && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setHotelTypeFilter("Semua");
                          setHotelDistrictFilter("Semua Kecamatan");
                          setQuery("");
                        }}
                        className="mt-3 gap-1.5 text-xs font-bold"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reset Filter
                      </Button>
                    )}
                </div>
              )}
            </div>
          ) : isWisataTab ? (
            <div className="space-y-8" aria-live="polite">
              {/* Hero Banner: Pariwisata Kotawaringin Barat */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-emerald-950 via-[#0e3a2f] to-[#124d3e] text-white shadow-lg">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 p-4 sm:p-8">
                  <div className="w-full min-w-0 max-w-2xl space-y-3">
                    <div className="inline-flex max-w-full items-center gap-2 rounded-xl sm:rounded-full bg-emerald-400/20 border border-emerald-400/30 px-3 py-1 text-[10px] sm:text-xs font-bold leading-snug text-emerald-300">
                      <Compass className="h-3.5 w-3.5 shrink-0" />
                      <span className="[overflow-wrap:anywhere]">DESTINASI WISATA RESMI KOTAWARINGIN BARAT • PORPROV XIII</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                      Pesona Alam, Budaya &amp; Cagar Biosfer Dunia
                    </h2>
                    <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                      Jelajahi keindahan bumi Marunting Batu Aji — mulai dari habitat orangutan liar di Taman Nasional Tanjung Puting, pesisir pantai Laut Jawa, cagar budaya Istana Kuning Kesultanan Kutaringin, hingga kearifan rumah adat Betang Dayak Tomun.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-emerald-200">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-emerald-300" />
                        <span>{wisataItems.length} Destinasi Populer Terkurasi</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-amber-300" />
                        <span>Ekowisata &amp; Budaya Lokal</span>
                      </div>
                    </div>
                  </div>

                  {/* Maskot Pariwisata di sisi kanan */}
                  <div className="w-full md:w-auto shrink-0 flex items-center justify-center">
                    <div className="relative flex flex-col items-center justify-center border-none shadow-none">
                      <img
                        src="/KeraWis2.webp"
                        alt="Maskot Wisata Kotawaringin Barat"
                        className="w-auto h-auto max-h-36 sm:max-h-48 md:max-h-56 max-w-[240px] sm:max-w-[300px] md:max-w-xs object-contain drop-shadow-lg transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Kategori & Kecamatan Wisata */}
              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/90 p-4 text-xs text-slate-600 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <label htmlFor="wisata-category-filter" className="font-semibold text-slate-600 shrink-0">
                      Kategori:
                    </label>
                    <select
                      id="wisata-category-filter"
                      value={wisataCategoryFilter}
                      onChange={(e) => setWisataCategoryFilter(e.target.value)}
                      className="max-w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-emerald-700 focus:outline-hidden"
                    >
                      {wisataCategoryOptions.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label htmlFor="wisata-district-filter" className="font-semibold text-slate-600 shrink-0">
                      Kecamatan / Lokasi:
                    </label>
                    <select
                      id="wisata-district-filter"
                      value={wisataDistrictFilter}
                      onChange={(e) => setWisataDistrictFilter(e.target.value)}
                      className="max-w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-emerald-700 focus:outline-hidden"
                    >
                      {wisataDistrictOptions.map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
                  <span className="min-w-0 break-words">
                    Menampilkan <strong>{visibleWisata.length}</strong> destinasi wisata Kotawaringin Barat.
                  </span>
                  {(wisataCategoryFilter !== "Semua" ||
                    wisataDistrictFilter !== "Semua" ||
                    normalizedQuery !== "") && (
                      <button
                        type="button"
                        onClick={() => {
                          setWisataCategoryFilter("Semua");
                          setWisataDistrictFilter("Semua");
                          setQuery("");
                        }}
                        className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-rose-600 hover:underline"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Reset Filter
                      </button>
                    )}
                </div>
              </div>

              {/* Grid Destinasi Wisata */}
              {wisataLoading ? (
                <div
                  className="rounded-xl border border-slate-200 bg-white p-10 text-center text-xs font-semibold text-slate-600"
                  role="status"
                >
                  Memuat data destinasi wisata dari server...
                </div>
              ) : wisataError ? (
                <div
                  className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center"
                  role="alert"
                >
                  <p className="text-sm font-bold text-rose-800">
                    Gagal memuat data destinasi wisata
                  </p>
                  <p className="mt-1 text-xs text-rose-700">{wisataError}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setWisataRefreshTick((t) => t + 1)}
                    className="mt-4 gap-1.5 border-rose-300 bg-white text-rose-700 hover:bg-rose-100"
                  >
                    <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                    Coba Lagi
                  </Button>
                </div>
              ) : visibleWisata.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {visibleWisata.map((item) => {
                    const imgFailed = Boolean(failedWisataImages[item.id]);
                    const hasValidImage = Boolean(item.image) && !imgFailed;
                    const mapsHref =
                      item.mapsUrl ||
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.name} ${item.district}`)}`;

                    return (
                      <Card
                        key={item.id}
                        className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-emerald-400"
                      >
                        <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                          {hasValidImage ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              onError={() =>
                                setFailedWisataImages((prev) => ({
                                  ...prev,
                                  [item.id]: true,
                                }))
                              }
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-emerald-950 via-[#0e3a2f] to-[#124d3e] p-4 text-center text-white/85">
                              <Compass className="mb-1.5 h-8 w-8 shrink-0 text-emerald-300" />
                              <span className="max-w-full break-words line-clamp-2 text-xs font-bold">
                                {item.name}
                              </span>
                              <span className="mt-0.5 text-[10px] text-emerald-200/80">
                                Foto belum tersedia
                              </span>
                            </div>
                          )}
                          <div className="absolute top-3 left-3 inline-flex max-w-[calc(100%-1.5rem)] shrink-0 items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 backdrop-blur-xs">
                            <Compass className="h-3 w-3 shrink-0" />
                            <span className="truncate">{item.category}</span>
                          </div>
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col justify-between p-5 space-y-4">
                          <div className="min-w-0 space-y-2">
                            {item.district && (
                              <div className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-emerald-800">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                <span className="min-w-0 truncate">{item.district}</span>
                              </div>
                            )}
                            <h3 className="min-w-0 break-words line-clamp-2 text-lg font-extrabold text-slate-900 group-hover:text-emerald-900 transition-colors">
                              {item.name}
                            </h3>
                            {item.description && (
                              <p className="min-w-0 break-words line-clamp-3 text-xs text-slate-600 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>

                          <div className="min-w-0 space-y-3 pt-2 border-t border-slate-100">
                            {item.highlights && (
                              <div className="min-w-0 break-words line-clamp-2 rounded-lg bg-emerald-50/70 p-2.5 text-[11px] text-emerald-950 font-medium leading-snug">
                                ✨ <strong>Highlight:</strong> {item.highlights}
                              </div>
                            )}
                            <div className="flex min-w-0 items-center justify-between gap-2 text-xs pt-1">
                              <span className="min-w-0 flex-1 break-words line-clamp-2 text-[11px] text-slate-500 font-medium">
                                {item.openInfo || "Terbuka untuk umum"}
                              </span>
                              <a
                                href={mapsHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3 py-1.5 transition-colors shadow-xs"
                              >
                                <span>Rute Maps</span>
                                <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div
                  className="rounded-xl border border-dashed border-slate-300 p-10 text-center"
                  role="status"
                >
                  <Compass className="mx-auto h-9 w-9 text-slate-400" />
                  <p className="mt-2 text-sm font-bold text-slate-800">
                    Destinasi wisata tidak ditemukan
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Coba ubah filter kategori, lokasi, atau kata kunci pencarian.
                  </p>
                  {(wisataCategoryFilter !== "Semua" ||
                    wisataDistrictFilter !== "Semua" ||
                    normalizedQuery !== "") && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setWisataCategoryFilter("Semua");
                          setWisataDistrictFilter("Semua");
                          setQuery("");
                        }}
                        className="mt-3 gap-1.5 text-xs font-bold"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reset Filter
                      </Button>
                    )}
                </div>
              )}
            </div>
          ) : isKesehatanTab ? (
            <div className="space-y-8" aria-live="polite">
              {/* Hero Banner: Layanan Kesehatan Kotawaringin Barat */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-rose-950 via-[#7f1d1d] to-[#9f1239] text-white shadow-lg">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 p-4 sm:p-8">
                  <div className="w-full min-w-0 max-w-2xl space-y-3">
                    <div className="inline-flex max-w-full items-center gap-2 rounded-xl sm:rounded-full bg-rose-400/20 border border-rose-300/30 px-3 py-1 text-[10px] sm:text-xs font-bold leading-snug text-rose-200">
                      <HeartPulse className="h-3.5 w-3.5 shrink-0" />
                      <span className="[overflow-wrap:anywhere]">LAYANAN KESEHATAN &amp; MEDIS RESMI KOTAWARINGIN BARAT • PORPROV XIII</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                      Direktori Rumah Sakit, Puskesmas, Klinik &amp; Apotek
                    </h2>
                    <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed">
                      Akses cepat informasi fasilitas kesehatan terdekat untuk atlet, ofisial, dan masyarakat selama penyelenggaraan PORPROV XIII Kalimantan Tengah 2026 di Kabupaten Kotawaringin Barat.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-rose-100">
                      <div className="flex items-center gap-1.5">
                        <HeartPulse className="h-4 w-4 text-rose-300 shrink-0" />
                        <span>{kesehatanItems.length} Fasilitas Kesehatan Terdaftar</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-amber-300 shrink-0" />
                        <span>RS, Puskesmas, Klinik &amp; Apotek</span>
                      </div>
                    </div>
                  </div>



                  <img
                    src="./kerasakit.png"
                    alt="Maskot Wisata Kotawaringin Barat"
                    className="w-auto h-auto max-h-36 sm:max-h-48 md:max-h-56 max-w-[240px] sm:max-w-[300px] md:max-w-xs object-contain drop-shadow-lg transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />

                </div>
              </div>

              {/* Hotline Darurat 24 Jam */}
              <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 sm:p-5 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 text-xs font-extrabold tracking-wider text-rose-800 uppercase">
                    <Phone className="h-4 w-4 text-rose-600" aria-hidden="true" />
                    <span>Nomor Hotline &amp; Layanan Darurat (24 Jam)</span>
                  </div>
                  <span className="text-[11px] font-medium text-rose-700">
                    Ketuk nomor untuk langsung menghubungi
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    {
                      label: "Pemadam Kebakaran Kobar (Hotline)",
                      number: "0532-22008",
                      href: "tel:053222008",
                      desc: "Quick Respon Damkar & Penyelamatan Kobar",
                      external: false,
                    },
                    {
                      label: "WhatsApp Damkar Kobar",
                      number: "0812-9046-1661",
                      href: "https://wa.me/6281290461661",
                      desc: "Laporan cepat via WhatsApp Damkar Kobar",
                      external: true,
                    },
                    {
                      label: "Darurat Terpadu",
                      number: "112",
                      href: "tel:112",
                      desc: "Layanan panggilan darurat nasional",
                      external: false,
                    },
                    {
                      label: "Polisi / Polres",
                      number: "110",
                      href: "tel:110",
                      desc: "Keamanan & ketertiban masyarakat",
                      external: false,
                    },
                    {
                      label: "Ambulans / IGD",
                      number: "119",
                      href: "tel:119",
                      desc: "Evakuasi & gawat darurat medis",
                      external: false,
                    },
                    {
                      label: "Basarnas / SAR",
                      number: "115",
                      href: "tel:115",
                      desc: "Pencarian & pertolongan",
                      external: false,
                    },
                  ].map((hotline) => (
                    <a
                      key={hotline.number}
                      href={hotline.href}
                      target={hotline.external ? "_blank" : undefined}
                      rel={hotline.external ? "noopener noreferrer" : undefined}
                      className="group flex flex-col justify-between rounded-xl border border-rose-200/80 bg-white p-3.5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-rose-400 hover:shadow-sm no-underline"
                    >
                      <span className="text-[11px] font-bold text-slate-700 group-hover:text-rose-700">
                        {hotline.label}
                      </span>
                      <strong className="mt-1 text-lg sm:text-xl font-black tracking-tight text-rose-700 tabular-nums">
                        {hotline.number}
                      </strong>
                      <span className="mt-0.5 text-[10px] text-slate-500">
                        {hotline.desc}
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Filter Kategori & Kecamatan Layanan Kesehatan */}
              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/90 p-4 text-xs text-slate-600 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(["Semua", ...KESEHATAN_CATEGORIES] as const).map((cat) => {
                      const active = kesehatanCategoryFilter === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setKesehatanCategoryFilter(cat)}
                          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${active
                            ? "bg-rose-700 text-white shadow-xs"
                            : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                            }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label htmlFor="kesehatan-district-filter" className="font-semibold text-slate-600 shrink-0">
                      Kecamatan / Lokasi:
                    </label>
                    <select
                      id="kesehatan-district-filter"
                      value={kesehatanDistrictFilter}
                      onChange={(e) => setKesehatanDistrictFilter(e.target.value)}
                      className="max-w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-rose-700 focus:outline-hidden"
                    >
                      {kesehatanDistrictOptions.map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
                  <span className="min-w-0 break-words">
                    Menampilkan <strong>{visibleKesehatan.length}</strong> fasilitas layanan kesehatan.
                  </span>
                  {(kesehatanCategoryFilter !== "Semua" ||
                    kesehatanDistrictFilter !== "Semua" ||
                    normalizedQuery !== "") && (
                      <button
                        type="button"
                        onClick={() => {
                          setKesehatanCategoryFilter("Semua");
                          setKesehatanDistrictFilter("Semua");
                          setQuery("");
                        }}
                        className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-rose-600 hover:underline"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Reset Filter
                      </button>
                    )}
                </div>
              </div>

              {/* Grid Layanan Kesehatan */}
              {kesehatanLoading ? (
                <div
                  className="rounded-xl border border-slate-200 bg-white p-10 text-center text-xs font-semibold text-slate-600"
                  role="status"
                >
                  Memuat data layanan kesehatan dari server...
                </div>
              ) : kesehatanError ? (
                <div
                  className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center"
                  role="alert"
                >
                  <p className="text-sm font-bold text-rose-800">
                    Gagal memuat data layanan kesehatan
                  </p>
                  <p className="mt-1 text-xs text-rose-700">{kesehatanError}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setKesehatanRefreshTick((t) => t + 1)}
                    className="mt-4 gap-1.5 border-rose-300 bg-white text-rose-700 hover:bg-rose-100"
                  >
                    <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                    Coba Lagi
                  </Button>
                </div>
              ) : visibleKesehatan.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {visibleKesehatan.map((item) => {
                    const imgFailed = Boolean(failedKesehatanImages[item.id]);
                    const hasValidImage = Boolean(item.image) && !imgFailed;
                    const mapsHref =
                      item.mapsUrl ||
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.name} ${item.district}`)}`;

                    return (
                      <Card
                        key={item.id}
                        className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-rose-400"
                      >
                        <div className="relative aspect-video w-full overflow-hidden bg-rose-50">
                          {hasValidImage ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              onError={() =>
                                setFailedKesehatanImages((prev) => ({
                                  ...prev,
                                  [item.id]: true,
                                }))
                              }
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-rose-950 via-[#7f1d1d] to-[#9f1239] p-4 text-center text-white/90">
                              <HeartPulse className="mb-1.5 h-9 w-9 shrink-0 text-rose-300" />
                              <span className="max-w-full break-words line-clamp-2 text-xs font-bold">
                                {item.name}
                              </span>
                              <span className="mt-0.5 text-[10px] text-rose-200/80">
                                {item.category || "Layanan Kesehatan"}
                              </span>
                            </div>
                          )}
                          <div className="absolute top-3 left-3 inline-flex max-w-[calc(100%-1.5rem)] shrink-0 items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-rose-200 backdrop-blur-xs">
                            <HeartPulse className="h-3 w-3 shrink-0" />
                            <span className="truncate">{item.category}</span>
                          </div>
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col justify-between p-5 space-y-4">
                          <div className="min-w-0 space-y-2">
                            {item.district && (
                              <div className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-rose-800">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                <span className="min-w-0 truncate">{item.district}</span>
                              </div>
                            )}
                            <h3 className="min-w-0 break-words line-clamp-2 text-lg font-extrabold text-slate-900 group-hover:text-rose-900 transition-colors">
                              {item.name}
                            </h3>
                            {item.description && (
                              <p className="min-w-0 break-words line-clamp-3 text-xs text-slate-600 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>

                          <div className="min-w-0 space-y-3 pt-2 border-t border-slate-100">
                            {item.highlights && (
                              <div className="min-w-0 break-words line-clamp-2 rounded-lg bg-rose-50/80 p-2.5 text-[11px] text-rose-950 font-medium leading-snug">
                                🏥 <strong>Layanan:</strong> {item.highlights}
                              </div>
                            )}
                            <div className="flex min-w-0 items-center justify-between gap-2 text-xs pt-1">
                              <span className="min-w-0 flex-1 break-words line-clamp-2 text-[11px] text-slate-500 font-medium">
                                {item.openInfo || "Hubungi fasilitas terkait"}
                              </span>
                              <a
                                href={mapsHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs px-3 py-1.5 transition-colors shadow-xs"
                              >
                                <span>Rute Maps</span>
                                <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div
                  className="rounded-xl border border-dashed border-slate-300 p-10 text-center"
                  role="status"
                >
                  <HeartPulse className="mx-auto h-9 w-9 text-slate-400" />
                  <p className="mt-2 text-sm font-bold text-slate-800">
                    Layanan kesehatan tidak ditemukan
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Coba ubah filter kategori, lokasi, atau kata kunci pencarian.
                  </p>
                  {(kesehatanCategoryFilter !== "Semua" ||
                    kesehatanDistrictFilter !== "Semua" ||
                    normalizedQuery !== "") && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setKesehatanCategoryFilter("Semua");
                          setKesehatanDistrictFilter("Semua");
                          setQuery("");
                        }}
                        className="mt-3 gap-1.5 text-xs font-bold"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reset Filter
                      </Button>
                    )}
                </div>
              )}
            </div>
          ) : isUMKMTab ? (
            <div className="space-y-8" aria-live="polite">
              {/* Hero Banner: Eksplorasi Kuliner Kotawaringin Barat */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-[image:var(--hero-gradient)] text-white shadow-lg">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 p-4 sm:p-8">
                  <div className="w-full min-w-0 max-w-2xl space-y-3">
                    <div className="inline-flex max-w-full items-center gap-2 rounded-xl sm:rounded-full bg-amber-400/20 border border-amber-400/30 px-3 py-1 text-[10px] sm:text-xs font-bold leading-snug text-amber-300">
                      <Utensils className="h-3.5 w-3.5 shrink-0" />
                      <span className="[overflow-wrap:anywhere]">DIREKTORI RESMI TEMPAT MAKAN &amp; NONGKRONG KOTAWARINGIN BARAT</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                      Direktori Kuliner, Restoran &amp; Kafe Pangkalan Bun
                    </h2>

                    <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed">
                      Menampilkan <strong>{umkmItems.length} tempat makan, restoran khas sungai, warung tradisional, food court, dan kafe pilihan</strong> di Pangkalan Bun (Kotawaringin Barat) lengkap dengan foto tempat, keunggulan menu, jam operasional, dan info reservasi.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <Utensils className="h-4 w-4 text-amber-300" />
                        <span>{umkmItems.length} Destinasi Kuliner</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Camera className="h-4 w-4 text-emerald-300" />
                        <span>{umkmItems.filter((x) => x.image.startsWith("/kuliner-real/")).length} Foto Lokasi</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Tag className="h-4 w-4 text-sky-300" />
                        <span>Jam Buka &amp; Reservasi Lengkap</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-auto shrink-0 flex items-center justify-center">
                    <div className="relative flex flex-col items-center justify-center border-none shadow-none">
                      <img
                        src="/keraMakan.webp"
                        alt="Maskot Kuliner Kotawaringin Barat"
                        className="w-auto h-auto max-h-36 sm:max-h-48 md:max-h-56 max-w-[240px] sm:max-w-[300px] md:max-w-xs object-contain drop-shadow-lg transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Category Icon Row (ala GoFood) */}
              <div className="flex items-stretch gap-2.5 overflow-x-auto pb-1 pt-1 sm:grid sm:grid-cols-3 md:grid-cols-6 sm:overflow-visible">
                {[
                  {
                    key: "all",
                    topLabel: "Semua",
                    bottomLabel: "Kuliner",
                    icon: Utensils,
                    iconBg: "bg-emerald-50 text-emerald-600",
                    active:
                      selectedUMKMType === "Semua" &&
                      !onlyRecommended &&
                      selectedCulinaryTheme === "Semua",
                    onClick: () => {
                      setSelectedUMKMType("Semua");
                      setOnlyRecommended(false);
                      setSelectedCulinaryTheme("Semua");
                      setUmkmPage(1);
                    },
                  },
                  {
                    key: "recommended",
                    topLabel: "Rating",
                    bottomLabel: "Terbaik",
                    badge: "4.8+",
                    icon: Star,
                    iconBg: "bg-amber-50 text-amber-500",
                    active: onlyRecommended,
                    onClick: () => {
                      setOnlyRecommended((prev) => !prev);
                      setUmkmPage(1);
                    },
                  },
                  {
                    key: "restoran",
                    topLabel: "Restoran",
                    bottomLabel: "Keluarga",
                    icon: Store,
                    iconBg: "bg-rose-50 text-rose-600",
                    active: selectedUMKMType === "restoran",
                    onClick: () => {
                      setSelectedUMKMType(
                        selectedUMKMType === "restoran" ? "Semua" : "restoran",
                      );
                      setUmkmPage(1);
                    },
                  },
                  {
                    key: "cafe",
                    topLabel: "Kafe &",
                    bottomLabel: "Kopi",
                    icon: Coffee,
                    iconBg: "bg-sky-50 text-sky-600",
                    active: selectedUMKMType === "cafe",
                    onClick: () => {
                      setSelectedUMKMType(
                        selectedUMKMType === "cafe" ? "Semua" : "cafe",
                      );
                      setUmkmPage(1);
                    },
                  },
                  {
                    key: "rumah_makan",
                    topLabel: "Rumah",
                    bottomLabel: "Makan",
                    icon: Flame,
                    iconBg: "bg-orange-50 text-orange-600",
                    active: selectedUMKMType === "rumah_makan",
                    onClick: () => {
                      setSelectedUMKMType(
                        selectedUMKMType === "rumah_makan"
                          ? "Semua"
                          : "rumah_makan",
                      );
                      setUmkmPage(1);
                    },
                  },
                  {
                    key: "warung",
                    topLabel: "Warung",
                    bottomLabel: "Lokal",
                    icon: Tag,
                    iconBg: "bg-violet-50 text-violet-600",
                    active: selectedUMKMType === "warung",
                    onClick: () => {
                      setSelectedUMKMType(
                        selectedUMKMType === "warung" ? "Semua" : "warung",
                      );
                      setUmkmPage(1);
                    },
                  },
                ].map((cat) => {
                  const IconComp = cat.icon;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={cat.onClick}
                      className={`relative flex min-w-[96px] shrink-0 flex-col items-center justify-center rounded-2xl border px-3 py-3 text-center transition-all sm:min-w-0 ${cat.active
                        ? "border-[#174a72] bg-sky-50/70 shadow-sm ring-1 ring-[#174a72]/20"
                        : "border-slate-200/90 bg-white shadow-xs hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
                        }`}
                    >
                      {cat.badge && (
                        <span className="absolute -top-1.5 left-2 rounded-md bg-slate-900 px-1.5 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
                          {cat.badge}
                        </span>
                      )}
                      <div
                        className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${cat.iconBg}`}
                      >
                        <IconComp className="h-5 w-5" />
                      </div>
                      <span className="text-[11px] font-medium leading-tight text-slate-500">
                        {cat.topLabel}
                      </span>
                      <span className="text-xs font-extrabold leading-tight text-slate-900">
                        {cat.bottomLabel}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Filter Toggle Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xs">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-expanded={umkmFiltersOpen}
                  onClick={() => setUmkmFiltersOpen((open) => !open)}
                  className="gap-2 text-xs font-bold"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                  {umkmFiltersOpen ? "Sembunyikan filter" : "Tampilkan filter"}
                </Button>
                <span className="text-xs text-slate-600 font-medium">
                  Menampilkan <strong>{visibleUMKM.length}</strong> dari{" "}
                  {umkmItems.length} tempat terdaftar
                </span>
              </div>

              {umkmFiltersOpen && (
                <>
                  {/* Tema Kuliner Quick Filter */}
                  <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#174a72] uppercase">
                        <Utensils className="h-4 w-4" />
                        <span>Pilihan Sajian & Jenis Tempat Makan</span>
                      </div>
                      {selectedCulinaryTheme !== "Semua" && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCulinaryTheme("Semua");
                            setUmkmPage(1);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:underline"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Tampilkan Semua Sajian
                        </button>
                      )}
                    </div>

                    {/* Horizontal Scroll Theme Chips */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {kobarCulinaryThemes.map((theme) => {
                        const isActive = selectedCulinaryTheme === theme.key;
                        const count =
                          theme.key === "Semua"
                            ? umkmItems.length
                            : umkmItems.filter(
                              (item) => item.culinaryThemeKey === theme.key,
                            ).length;

                        return (
                          <button
                            key={theme.key}
                            type="button"
                            onClick={() => {
                              setSelectedCulinaryTheme(
                                isActive ? "Semua" : theme.key,
                              );
                              setUmkmPage(1);
                            }}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${isActive
                              ? "bg-[#174a72] text-white shadow-xs"
                              : "border border-slate-200 bg-slate-50 text-slate-700 hover:border-[#397eae] hover:bg-slate-100"
                              }`}
                          >
                            <span>{theme.label}</span>
                            <span
                              className={`rounded-full px-1.5 py-0.2 text-[10px] ${isActive
                                ? "bg-white/20 text-white"
                                : "bg-slate-200 text-slate-600"
                                }`}
                            >
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sub-kategori, Kecamatan & Search Bar Controls */}
                  <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#174a72] uppercase">
                        <Store className="h-4 w-4" />
                        <span>Filter Direktori Kuliner</span>
                      </div>
                      <span className="text-xs text-slate-600 font-medium">
                        Menampilkan <strong>{visibleUMKM.length}</strong> dari{" "}
                        {umkmItems.length} tempat terdaftar
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      {/* Category Pills */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500 mr-1">
                          Kategori:
                        </span>
                        {kobarCategories.map((cat) => {
                          const isActive = selectedUMKMType === cat.value;
                          return (
                            <button
                              key={cat.label}
                              type="button"
                              onClick={() => {
                                setSelectedUMKMType(cat.value);
                                setUmkmPage(1);
                              }}
                              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${isActive
                                ? "bg-slate-900 text-white shadow-xs"
                                : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                                }`}
                            >
                              {cat.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Kecamatan & Quick Toggles */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> Kecamatan:
                        </span>
                        <select
                          aria-label="Pilih Kecamatan"
                          value={selectedDistrict}
                          onChange={(e) => {
                            setSelectedDistrict(e.target.value);
                            setUmkmPage(1);
                          }}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-[#174a72] focus:outline-hidden"
                        >
                          {kobarDistricts.map((dist) => (
                            <option key={dist} value={dist}>
                              {dist}
                            </option>
                          ))}
                        </select>

                        {/* Rekomendasi Teratas Toggle */}
                        <button
                          type="button"
                          onClick={() => {
                            setOnlyRecommended(!onlyRecommended);
                            setUmkmPage(1);
                          }}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${onlyRecommended
                            ? "bg-amber-400 text-slate-950 font-black shadow-xs ring-1 ring-amber-500"
                            : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                            }`}
                        >
                          <Star
                            className={`h-3.5 w-3.5 ${onlyRecommended
                              ? "fill-slate-950"
                              : "text-amber-500"
                              }`}
                          />
                          Rating Tinggi (4.8+)
                        </button>

                        {/* Foto Nyata Toggle */}
                        <button
                          type="button"
                          onClick={() => {
                            setOnlyRealPhoto(!onlyRealPhoto);
                            setUmkmPage(1);
                          }}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${onlyRealPhoto
                            ? "bg-emerald-600 text-white font-black shadow-xs ring-1 ring-emerald-700"
                            : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                            }`}
                        >
                          <Camera
                            className={`h-3.5 w-3.5 ${onlyRealPhoto
                              ? "text-white"
                              : "text-emerald-600"
                              }`}
                          />
                          Foto Nyata Tempat ({umkmItems.filter((x) => x.image.startsWith("/kuliner-real/")).length})
                        </button>

                        {/* Reset All Filters */}
                        {(selectedUMKMType !== "Semua" ||
                          selectedDistrict !== "Semua Kecamatan" ||
                          selectedCulinaryTheme !== "Semua" ||
                          onlyRecommended ||
                          onlyRealPhoto) && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUMKMType("Semua");
                                setSelectedDistrict("Semua Kecamatan");
                                setSelectedCulinaryTheme("Semua");
                                setOnlyRecommended(false);
                                setOnlyRealPhoto(false);
                                setUmkmPage(1);
                              }}
                              className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 underline underline-offset-2 ml-1"
                            >
                              <RotateCcw className="h-3 w-3" />
                              Reset Filter
                            </button>
                          )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
                      <p>
                        *Catatan: Jam buka, ketersediaan menu, dan nomor telepon bersumber dari data publik Google Maps Kotawaringin Barat.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Culinary Cards Section */}
              {umkmLoading ? (
                <div
                  className="rounded-xl border border-slate-200 bg-white p-10 text-center text-xs font-semibold text-slate-600"
                  role="status"
                >
                  Memuat data tempat makan &amp; kuliner dari server...
                </div>
              ) : umkmError ? (
                <div
                  className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center"
                  role="alert"
                >
                  <p className="text-sm font-bold text-rose-800">
                    Gagal memuat data tempat makan &amp; kuliner
                  </p>
                  <p className="mt-1 text-xs text-rose-700">{umkmError}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setUmkmRefreshTick((t) => t + 1)}
                    className="mt-4 gap-1.5 border-rose-300 bg-white text-rose-700 hover:bg-rose-100"
                  >
                    <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                    Coba Lagi
                  </Button>
                </div>
              ) : visibleUMKM.length > 0 ? (
                <div className="space-y-6">
                  <div className="rounded-3xl border border-rose-100/90 bg-gradient-to-br from-rose-50/90 via-amber-50/50 to-orange-50/80 p-4 sm:p-6 shadow-xs">
                    {/* Section Header */}
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
                          <Utensils className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="min-w-0 break-words text-base sm:text-lg font-black tracking-tight text-slate-900">
                            Pilihan Tempat Makan &amp; Restoran
                          </h3>
                          <p className="min-w-0 break-words text-xs text-slate-600">
                            Klik kartu untuk melihat deskripsi, menu unggulan, alamat lengkap, dan rute.
                          </p>
                        </div>
                      </div>
                      {totalUMKMPages > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setUmkmPage((prev) =>
                              prev >= totalUMKMPages ? 1 : prev + 1,
                            );
                          }}
                          title="Halaman berikutnya"
                          aria-label="Halaman berikutnya"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-emerald-700 shadow-xs transition-transform hover:scale-105 hover:bg-emerald-50"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 md:grid-cols-3 lg:grid-cols-4 max-[380px]:grid-cols-1">
                      {paginatedUMKM.map((item) => {
                        const imgFailed = Boolean(failedUmkmImages[item.id]);
                        const hasValidImage = Boolean(item.image) && !imgFailed;
                        return (
                          <Card
                            key={item.id}
                            role="article"
                            tabIndex={0}
                            onClick={() => setSelectedUMKMDetail(item)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedUMKMDetail(item);
                              }
                            }}
                            className="group flex h-full min-w-0 cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-xs transition-all hover:-translate-y-1 hover:border-rose-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#174a72]"
                          >
                            <div className="min-w-0">
                              {/* Card Food Image Header */}
                              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
                                {hasValidImage ? (
                                  <img
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    src={item.image}
                                    alt={item.nama}
                                    loading="lazy"
                                    onError={() =>
                                      setFailedUmkmImages((prev) => ({
                                        ...prev,
                                        [item.id]: true,
                                      }))
                                    }
                                  />
                                ) : (
                                  <div className="flex h-full w-full flex-col items-center justify-center bg-[image:var(--hero-gradient)] p-3 text-center text-white/85">
                                    <Coffee className="mb-1.5 h-7 w-7 shrink-0 text-amber-300" />
                                    <span className="max-w-full break-words line-clamp-2 text-xs font-bold leading-snug">
                                      {item.nama}
                                    </span>
                                    <span className="mt-0.5 text-[10px] text-sky-200/80">
                                      Foto belum tersedia
                                    </span>
                                  </div>
                                )}

                                {/* Rating Pill Badge */}
                                {item.ada_rating && (
                                  <div className="absolute top-2 left-2 inline-flex shrink-0 items-center gap-1 rounded-lg bg-rose-600 px-2 py-0.5 text-[11px] font-extrabold text-white shadow-xs">
                                    <Star className="h-3 w-3 shrink-0 fill-white" />
                                    <span>{item.rating_google.toFixed(1)}</span>
                                  </div>
                                )}
                              </div>

                              {/* Compact Card Body */}
                              <div className="mt-2.5 min-w-0 space-y-1 px-0.5">
                                <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] font-medium text-slate-600">
                                  <MapPin className="h-3 w-3 shrink-0 text-emerald-600" />
                                  <span className="min-w-0 truncate">Kec. {item.kecamatan}</span>
                                  {item.ada_rating && (
                                    <span className="shrink-0 text-slate-400">
                                      • {item.jumlah_ulasan} ulasan
                                    </span>
                                  )}
                                </div>

                                <p className="min-w-0 break-words line-clamp-1 text-[11px] font-semibold text-slate-500 leading-snug">
                                  {item.kategori_google}
                                </p>

                                <h3 className="min-w-0 break-words line-clamp-2 text-sm sm:text-[15px] font-extrabold tracking-tight text-slate-900 leading-snug">
                                  {item.nama}
                                </h3>

                                {item.jam_buka && (
                                  <p className="flex min-w-0 items-start gap-1 pt-0.5 text-[11px] text-slate-500 leading-snug">
                                    <Clock className="mt-0.5 h-3 w-3 shrink-0 text-[#397eae]" />
                                    <span className="min-w-0 flex-1 break-words line-clamp-1">
                                      {item.jam_buka}
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Card Bottom Price & Quick Action */}
                            <div className="mt-3 flex min-w-0 flex-wrap items-center justify-between gap-1.5 border-t border-slate-100 px-0.5 pt-2">
                              <span className="min-w-0 truncate text-xs sm:text-sm font-black text-rose-600">
                                {item.priceRange || "Lihat Detail"}
                              </span>
                              <span className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-bold text-[#174a72] group-hover:text-rose-600 transition-colors">
                                Detail <ChevronRight className="h-3 w-3 shrink-0" />
                              </span>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pagination Navigation */}
                  {totalUMKMPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 pt-5">
                      <p className="text-xs font-semibold text-slate-600">
                        Menampilkan halaman <strong>{umkmPage}</strong> dari{" "}
                        <strong>{totalUMKMPages}</strong> ({visibleUMKM.length} tempat)
                      </p>

                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={umkmPage <= 1}
                          onClick={() => {
                            setUmkmPage((prev) => Math.max(1, prev - 1));
                            window.scrollTo({ top: 400, behavior: "smooth" });
                          }}
                          className="h-8 px-3 text-xs font-bold"
                        >
                          <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                          Sebelumnya
                        </Button>

                        <div className="flex items-center gap-1 px-2 text-xs font-bold text-slate-700">
                          Halaman {umkmPage} / {totalUMKMPages}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={umkmPage >= totalUMKMPages}
                          onClick={() => {
                            setUmkmPage((prev) =>
                              Math.min(totalUMKMPages, prev + 1),
                            );
                            window.scrollTo({ top: 400, behavior: "smooth" });
                          }}
                          className="h-8 px-3 text-xs font-bold"
                        >
                          Selanjutnya
                          <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="rounded-xl border border-dashed border-slate-300 p-12 text-center"
                  role="status"
                >
                  <Utensils className="mx-auto h-10 w-10 text-slate-400" />
                  <h3 className="mt-3 text-base font-bold text-slate-900">
                    Tidak Ditemukan Tempat Makan
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                    Tidak ada tempat makan yang cocok dengan kombinasi filter atau kata kunci penelusuran. Coba atur ulang filter pencarian Anda.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUMKMType("Semua");
                      setSelectedDistrict("Semua Kecamatan");
                      setSelectedCulinaryTheme("Semua");
                      setOnlyRecommended(false);
                      setQuery("");
                      setUmkmPage(1);
                    }}
                    className="mt-4 text-xs font-bold"
                  >
                    Reset Semua Filter
                  </Button>
                </div>
              )}

              {/* Quick Info Modal */}
              {selectedUMKMDetail && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
                  onClick={() => setSelectedUMKMDetail(null)}
                  role="dialog"
                  aria-modal="true"
                >
                  <div
                    className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedUMKMDetail(null)}
                      className="absolute top-4 right-4 rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                      aria-label="Tutup detail"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <div className="relative h-48 w-full overflow-hidden rounded-xl bg-slate-100">
                      {selectedUMKMDetail.image &&
                        !failedUmkmImages[selectedUMKMDetail.id] ? (
                        <img
                          src={selectedUMKMDetail.image}
                          alt={selectedUMKMDetail.nama}
                          className="h-full w-full object-cover"
                          onError={() =>
                            setFailedUmkmImages((prev) => ({
                              ...prev,
                              [selectedUMKMDetail.id]: true,
                            }))
                          }
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-[image:var(--hero-gradient)] p-4 text-center text-white/85">
                          <Coffee className="mb-1.5 h-8 w-8 shrink-0 text-amber-300" />
                          <span className="max-w-full break-words text-xs font-bold">
                            {selectedUMKMDetail.nama}
                          </span>
                          <span className="mt-0.5 text-[10px] text-sky-200/80">
                            Foto belum tersedia
                          </span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="rounded-full bg-[#102b49]/90 px-3 py-1 text-xs font-extrabold text-white">
                          {selectedUMKMDetail.culinaryTheme}
                        </span>
                      </div>
                      {selectedUMKMDetail.ada_rating && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-extrabold text-slate-950">
                          <Star className="h-3.5 w-3.5 fill-slate-950" />
                          <span>
                            {selectedUMKMDetail.rating_google.toFixed(1)} (
                            {selectedUMKMDetail.jumlah_ulasan} ulasan)
                          </span>
                        </div>
                      )}
                    </div>

                    <h3 className="mt-4 text-xl font-black text-slate-900">
                      {selectedUMKMDetail.nama}
                    </h3>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs font-bold text-[#174a72]">
                      <span>
                        {selectedUMKMDetail.kategori_google} • Kec.{" "}
                        {selectedUMKMDetail.kecamatanFull}
                      </span>
                      {selectedUMKMDetail.instagram && (
                        <span className="text-[11px] font-semibold text-pink-600">
                          • {selectedUMKMDetail.instagram}
                        </span>
                      )}
                    </div>

                    {selectedUMKMDetail.deskripsi && (
                      <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                        {selectedUMKMDetail.deskripsi}
                      </p>
                    )}

                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs">
                      <span className="font-extrabold text-amber-900 block">
                        🍽️ Menu Unggulan & Sajian:
                      </span>
                      <p className="text-amber-950 mt-1 font-medium">
                        {selectedUMKMDetail.signatureDish}
                      </p>
                      <span className="text-[11px] text-amber-800 font-semibold block mt-1.5">
                        Estimasi Harga: {selectedUMKMDetail.priceRange}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2.5 text-xs text-slate-700">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 shrink-0 text-[#397eae] mt-0.5" />
                        <span>{selectedUMKMDetail.alamat}</span>
                      </div>

                      {selectedUMKMDetail.jam_buka && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 shrink-0 text-[#397eae]" />
                          <span>Jam Buka: {selectedUMKMDetail.jam_buka}</span>
                        </div>
                      )}

                      {selectedUMKMDetail.telepon && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 shrink-0 text-emerald-600" />
                          <span className="font-semibold">
                            Telepon: {selectedUMKMDetail.telepon}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Google Maps Real Photos Callout */}
                    <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50/80 p-3.5 text-xs text-sky-950 flex items-start gap-3">
                      <Camera className="h-5 w-5 shrink-0 text-[#174a72] mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-bold block text-slate-900">
                          📸 Galeri Foto Tempat &amp; Menu
                        </span>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Lihat foto fisik warung/kafe, suasana meja makan, foto buku menu &amp; harga terkini, serta ulasan terbaru dari pengunjung Google Maps.
                        </p>
                        <a
                          href={selectedUMKMDetail.google_maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-bold text-[#174a72] hover:underline pt-1 text-[11px]"
                        >
                          Buka Foto di Google Maps <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-2">
                      <a
                        href={selectedUMKMDetail.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#174a72] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#102b49]"
                      >
                        <Camera className="h-4 w-4 text-amber-300" />
                        Lihat Foto &amp; Rute di Google Maps
                        <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setSelectedUMKMDetail(null)}
                        className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6" aria-live="polite">
              {/* Header Feed Berita Resmi MMC Kobar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                  </span>
                  <div>
                    <p className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                      <Newspaper className="h-4 w-4 text-emerald-700" />
                      Live Feed Berita Resmi MMC Kobar
                    </p>
                    <p className="text-xs text-emerald-800">
                      Terhubung langsung dengan API Media Center Pemerintah Kabupaten Kotawaringin Barat
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                    {visibleArticles.length} Berita
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={fetchMmcNews}
                    disabled={isLoadingMmc}
                    className="h-8 gap-1.5 text-xs font-semibold bg-white border-emerald-300 text-emerald-900 hover:bg-emerald-100"
                  >
                    <RotateCcw className={`h-3.5 w-3.5 ${isLoadingMmc ? "animate-spin" : ""}`} />
                    Segarkan
                  </Button>
                </div>
              </div>

              {mmcError && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-center justify-between">
                  <span>{mmcError}</span>
                  <button
                    type="button"
                    onClick={() => setMmcError(null)}
                    className="text-amber-900 font-bold hover:underline ml-2"
                  >
                    Tutup
                  </button>
                </div>
              )}

              {isLoadingMmc && mmcArticles.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-slate-200 bg-white">
                  <RotateCcw className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
                  <p className="text-sm font-semibold text-slate-700">Mengambil rilis berita terkini dari MMC Kobar...</p>
                  <p className="text-xs text-slate-500 mt-1">Mohon tunggu sebentar</p>
                </div>
              ) : visibleArticles.length > 0 ? (
                <div className="news-grid">
                  {visibleArticles.map((article) => (
                    <Card
                      className="news-card flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-xs transition-all hover:-translate-y-1 hover:shadow-lg"
                      key={article.id}
                      role="article"
                      aria-labelledby={`news-title-${article.id}`}
                    >
                      {/* Banner Gambar Berita */}
                      <div
                        className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900 cursor-pointer group"
                        onClick={() => setSelectedDetailArticle(article)}
                      >
                        <img
                          src={article.image || "/venues2/sportCenter.webp"}
                          alt={article.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.src.includes("sportCenter.webp")) {
                              target.src = "/venues2/sportCenter.webp";
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20 pointer-events-none" />

                        <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
                          <div className="flex items-center justify-between w-full gap-2">
                            <Badge className="bg-white/95 text-emerald-900 border-none font-bold text-[10px] uppercase tracking-wider backdrop-blur-sm shadow-sm">
                              {article.sopd || article.category}
                            </Badge>
                            <span className="text-[10px] font-bold text-white bg-black/50 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/20">
                              PORPROV XIII
                            </span>
                          </div>
                          <strong className="text-base sm:text-lg font-black text-white leading-snug line-clamp-2 drop-shadow-md group-hover:text-emerald-300 transition-colors">
                            {article.title}
                          </strong>
                        </div>
                      </div>

                      <div className="news-card-copy flex flex-col flex-1 justify-between p-5">
                        <div>
                          <p className="news-meta flex items-center justify-between text-xs text-slate-500 mb-2">
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(article.date)}
                            </span>
                            {article.isMmcLive && (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                                MMC Official
                              </span>
                            )}
                          </p>
                          <h2
                            id={`news-title-${article.id}`}
                            className="text-base font-bold text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer line-clamp-2 mb-2"
                            onClick={() => setSelectedDetailArticle(article)}
                          >
                            {article.title}
                          </h2>
                          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                            {article.excerpt}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                          <button
                            type="button"
                            onClick={() => setSelectedDetailArticle(article)}
                            className="inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline gap-1 cursor-pointer"
                          >
                            Baca Rilis Lengkap &rarr;
                          </button>
                          {article.slug && (
                            <a
                              href={`https://kotawaringinbaratkab.go.id/id/blog/${article.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Buka rilis resmi di Portal Pemkab Kobar"
                              className="text-slate-400 hover:text-emerald-700 p-1 rounded hover:bg-slate-100 transition-colors inline-flex items-center gap-1 text-[11px]"
                            >
                              Portal Kobar
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                  <Newspaper className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-700">Berita tidak ditemukan</p>
                  <p className="text-xs text-slate-500 mt-1">Coba gunakan kata kunci pencarian lain atau klik tombol Segarkan.</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors"
            onClick={() => setSelectedPhoto(null)}
          >
            <span className="text-4xl">&times;</span>
          </button>

          <div
            className="max-w-5xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedPhoto.image_url && !failedGaleriImages[selectedPhoto.id] ? (
              <img
                src={selectedPhoto.image_url}
                alt={selectedPhoto.title}
                className="max-h-[75vh] max-w-full rounded-lg shadow-2xl object-contain"
                onError={() =>
                  setFailedGaleriImages((prev) => ({
                    ...prev,
                    [selectedPhoto.id]: true,
                  }))
                }
              />
            ) : (
              <div className="flex h-64 w-full max-w-lg flex-col items-center justify-center rounded-xl bg-slate-800 text-white/80">
                <Camera className="mb-2 h-10 w-10 text-amber-300" />
                <span className="text-sm font-semibold">Foto belum tersedia</span>
              </div>
            )}
            <div className="mt-4 max-w-2xl text-center text-white">
              <div className="mb-2 flex flex-wrap items-center justify-center gap-2">
                <Badge variant="secondary">{selectedPhoto.category}</Badge>
                {selectedPhoto.is_featured && (
                  <Badge className="bg-amber-400 text-slate-950">Unggulan</Badge>
                )}
              </div>
              <h3 className="text-xl font-bold break-words">{selectedPhoto.title}</h3>
              {selectedPhoto.caption && (
                <p className="mt-1.5 text-sm text-slate-200 break-words">
                  {selectedPhoto.caption}
                </p>
              )}
              {(selectedPhoto.photographer || selectedPhoto.event_date) && (
                <p className="mt-2 text-xs text-slate-400">
                  {selectedPhoto.photographer && `Fotografer: ${selectedPhoto.photographer}`}
                  {selectedPhoto.photographer && selectedPhoto.event_date && " • "}
                  {selectedPhoto.event_date}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Rilis Berita MMC Kobar */}
      {selectedDetailArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => setSelectedDetailArticle(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-slate-100 bg-slate-50/70">
              <div className="space-y-1.5 pr-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                    {selectedDetailArticle.sopd || selectedDetailArticle.category}
                  </Badge>
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(selectedDetailArticle.date)}
                  </span>
                  <span className="text-xs font-medium text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Rilis Resmi MMC Kobar
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                  {selectedDetailArticle.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailArticle(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-slate-700 leading-relaxed text-sm sm:text-base">
              {selectedDetailArticle.image && (
                <div className="relative w-full h-60 sm:h-80 rounded-xl overflow-hidden shadow-md bg-slate-900 mb-6 group">
                  <img
                    src={selectedDetailArticle.image}
                    alt={selectedDetailArticle.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes("sportCenter.webp")) {
                        target.src = "/venues2/sportCenter.webp";
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs px-2 pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-medium border border-white/20">
                      <Camera className="h-3.5 w-3.5 text-emerald-400" />
                      Dokumentasi Resmi Media Center Pemkab Kobar
                    </span>
                    <span className="text-[11px] text-white/80 hidden sm:inline-block">
                      PORPROV XIII Kalteng 2026
                    </span>
                  </div>
                </div>
              )}

              <div
                className="article-content space-y-3.5 [&_p]:mb-3.5 [&_p]:leading-relaxed [&_p]:text-slate-700 [&_strong]:font-bold [&_strong]:text-slate-900"
                dangerouslySetInnerHTML={{
                  __html: selectedDetailArticle.fullHtml || `<p>${selectedDetailArticle.excerpt}</p>`,
                }}
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 px-6 border-t border-slate-100 bg-slate-50">
              {selectedDetailArticle.slug ? (
                <a
                  href={`https://kotawaringinbaratkab.go.id/id/blog/${selectedDetailArticle.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  Buka Berita di Portal Pemkab Kobar
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <span className="text-xs text-slate-400">Media Center Porprov XIII Kalteng</span>
              )}
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => setSelectedDetailArticle(null)}
                className="rounded-xl px-4 py-2 font-semibold"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </>
  );
}
