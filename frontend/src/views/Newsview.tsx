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
  History,
  Info,
  MapPin,
  Medal,
  Newspaper,
  Phone,
  RotateCcw,
  ShieldCheck,
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
  kobarUMKMData,
  kobarDistricts,
  kobarCategories,
  kobarCulinaryThemes,
  type KobarUMKMItem,
  type KobarUMKMType,
} from "../data/umkmKobarData";
import { hotelData } from "../data/hotelKobarData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { getContingentLogoUrl } from "../utils/contingentLogo";

type NewsCategory = "Berita" | "Sejarah" | "Galeri" | "UMKM" | "Hotel dan Penginapan";
type CategoryFilter = NewsCategory;

type NewsArticle = {
  id: number;
  category: NewsCategory;
  date: string;
  title: string;
  excerpt: string;
  theme: "green" | "orange" | "lime";
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
  isMmcLive?: boolean;
  theme: "green" | "orange" | "lime";
};

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

type GalleryPhoto = {
  id: number;
  category: string;
  title: string;
  src: string;
};

// Data Hotel & Penginapan diimpor dari ../data/hotelKobarData
// Data UMKM & Venue resmi Kotawaringin Barat diimpor dari ../data/umkmKobarData

const articles: NewsArticle[] = [
  {
    id: 1,
    category: "Berita",
    date: "2026-11-20",
    title: "Berita terbaru seputar PORPROV XIII Kalimantan Tengah",
    excerpt:
      "Ikuti perkembangan berita dan pengumuman resmi menjelang penyelenggaraan PORPROV XIII.",
    theme: "green",
  },
  {
    id: 2,
    category: "Sejarah",
    date: "2026-11-18",
    title: "Sejarah PORPROV XIII Kalimantan Tengah",
    excerpt:
      "Jelajahi sejarah panjang dan prestasi yang telah dicapai dalam penyelenggaraan PORPROV XIII.",
    theme: "orange",
  },
  {
    id: 3,
    category: "UMKM",
    date: "2026-11-15",
    title: "Semangat atlet daerah menyambut pesta olahraga provinsi",
    excerpt:
      "Atlet dari berbagai kabupaten dan kota bersiap untuk bertanding dengan menjunjung sportivitas.",
    theme: "lime",
  },
  {
    id: 4,
    category: "Berita",
    date: "2026-11-12",
    title: "Kenali cabang olahraga yang dipertandingkan",
    excerpt:
      "Cari tahu cabang olahraga dan informasi pertandingan dalam agenda PORPROV XIII.",
    theme: "green",
  },
];

const galleryPhotos: GalleryPhoto[] = [
  {
    id: 1,
    category: "Atlet",
    title: "Semangat para atlet",
    src: "https://picsum.photos/seed/porprov-atlet-1/900/650",
  },
  {
    id: 2,
    category: "Pertandingan",
    title: "Momen di arena pertandingan",
    src: "https://picsum.photos/seed/porprov-arena-2/900/650",
  },
  {
    id: 3,
    category: "Kebersamaan",
    title: "Kebersamaan dalam olahraga",
    src: "https://picsum.photos/seed/porprov-team-3/900/650",
  },
  {
    id: 4,
    category: "Aksi",
    title: "Aksi penuh semangat",
    src: "https://picsum.photos/seed/porprov-action-4/900/650",
  },
  {
    id: 5,
    category: "Suasana",
    title: "Suasana di sekitar venue",
    src: "https://picsum.photos/seed/porprov-venue-5/900/650",
  },
  {
    id: 6,
    category: "Sportivitas",
    title: "Menjunjung tinggi sportivitas",
    src: "https://picsum.photos/seed/porprov-sport-6/900/650",
  },
  {
    id: 7,
    category: "Prestasi",
    title: "Perjuangan menuju prestasi",
    src: "https://picsum.photos/seed/porprov-achievement-7/900/650",
  },
  {
    id: 8,
    category: "Dukungan",
    title: "Dukungan untuk para atlet",
    src: "https://picsum.photos/seed/porprov-support-8/900/650",
  },
  {
    id: 9,
    category: "Momen",
    title: "Kenangan dari PORPROV",
    src: "https://picsum.photos/seed/porprov-moment-9/900/650",
  },
];

const categories: CategoryFilter[] = [
  "Berita",
  "Sejarah",
  "Galeri",
  "UMKM",
  "Hotel dan Penginapan",
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
      "Digelar dengan megah di Stadion 29 November Sampit, PORPROV XII mempertandingkan puluhan cabang olahraga dengan ribuan atlet dan ofisial. Ajang ini sukses melahirkan rekor-rekor baru provinsi sekaligus menggerakkan roda UMKM serta pariwisata lokal pasca pandemi.",
    highlight: "Integrasi sport tourism dan pemberdayaan UMKM daerah secara masif.",
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
  const getTabFromUrl = (): CategoryFilter => {
    const tabParam = searchParams.get("tab")?.toLowerCase();
    if (tabParam === "umkm") return "UMKM";
    if (tabParam === "hotel" || tabParam === "penginapan") return "Hotel dan Penginapan";
    if (tabParam === "galeri" || tabParam === "gallery") return "Galeri";
    if (tabParam === "sejarah" || tabParam === "history") return "Sejarah";
    return "Berita";
  };

  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>(getTabFromUrl());

  useEffect(() => {
    const currentTab = getTabFromUrl();
    setSelectedCategory(currentTab);
  }, [searchParams]);
  const [selectedUMKMType, setSelectedUMKMType] =
    useState<"Semua" | KobarUMKMType>("Semua");
  const [selectedDistrict, setSelectedDistrict] =
    useState<string>("Semua Kecamatan");
  const [selectedCulinaryTheme, setSelectedCulinaryTheme] =
    useState<string>("Semua");
  const [onlyRecommended, setOnlyRecommended] = useState<boolean>(false);
  const [umkmPage, setUmkmPage] = useState<number>(1);
  const [selectedUMKMDetail, setSelectedUMKMDetail] =
    useState<KobarUMKMItem | null>(null);
  const [query, setQuery] = useState("");
  const [showAllGallery, setShowAllGallery] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  // Live MMC Kobar API State
  const [mmcArticles, setMmcArticles] = useState<MmcNewsItem[]>([]);
  const [isLoadingMmc, setIsLoadingMmc] = useState<boolean>(true);
  const [mmcError, setMmcError] = useState<string | null>(null);
  const [selectedDetailArticle, setSelectedDetailArticle] = useState<DisplayArticle | null>(null);

  const fetchMmcNews = async () => {
    setIsLoadingMmc(true);
    setMmcError(null);
    try {
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

  const normalizedQuery = query.trim().toLocaleLowerCase("id");
  const isSejarahTab = selectedCategory === "Sejarah";
  const isGalleryTab = selectedCategory === "Galeri";
  const isUMKMTab = selectedCategory === "UMKM";
  const isHotelTab = selectedCategory === "Hotel dan Penginapan";

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
        isMmcLive: true,
        theme: idx % 3 === 0 ? "green" : idx % 3 === 1 ? "lime" : "orange",
      }));
    }
    // Fallback editorial articles
    return articles.map((art) => ({
      id: art.id,
      category: art.category,
      sopd: "Panitia PORPROV",
      date: art.date,
      title: art.title,
      excerpt: art.excerpt,
      fullHtml: `<p>${art.excerpt}</p>`,
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

  const visibleGalleryPhotos = useMemo(
    () =>
      galleryPhotos.filter((photo) =>
        `${photo.title} ${photo.category}`
          .toLocaleLowerCase("id")
          .includes(normalizedQuery),
      ),
    [normalizedQuery],
  );
  const displayedGalleryPhotos = showAllGallery
    ? visibleGalleryPhotos
    : visibleGalleryPhotos.slice(0, 6);

  const visibleUMKM = useMemo(() => {
    return kobarUMKMData.filter((item) => {
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
      const matchesQuery =
        !normalizedQuery ||
        `${item.nama} ${item.kategori_google} ${item.culinaryTheme} ${item.signatureDish} ${item.alamat} ${item.kecamatanFull}`
          .toLocaleLowerCase("id")
          .includes(normalizedQuery);

      return (
        matchesType &&
        matchesDistrict &&
        matchesTheme &&
        matchesRecommended &&
        matchesQuery
      );
    });
  }, [
    normalizedQuery,
    selectedUMKMType,
    selectedDistrict,
    selectedCulinaryTheme,
    onlyRecommended,
  ]);

  const umkmItemsPerPage = 12;
  const totalUMKMPages = Math.ceil(visibleUMKM.length / umkmItemsPerPage) || 1;
  const paginatedUMKM = useMemo(() => {
    const start = (umkmPage - 1) * umkmItemsPerPage;
    return visibleUMKM.slice(start, start + umkmItemsPerPage);
  }, [visibleUMKM, umkmPage]);

  const visibleHotels = useMemo(
    () =>
      hotelData.filter(
        (hotel) =>
          !normalizedQuery ||
          `${hotel.hotelName} ${hotel.type} ${hotel.address} ${hotel.district} ${hotel.nearVenue} ${hotel.facilities.join(" ")}`
            .toLocaleLowerCase("id")
            .includes(normalizedQuery),
      ),
    [normalizedQuery],
  );

  const searchPlaceholder = isGalleryTab
    ? "Cari foto galeri..."
    : isSejarahTab
      ? "Cari sejarah edisi PORPROV, tuan rumah, atau kontingen daerah..."
      : isUMKMTab
        ? "Cari nama tempat makan, kedai kopi, menu masakan, atau alamat di Kobar..."
        : isHotelTab
          ? "Cari nama hotel, wisma, atau lokasi..."
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
                : isSejarahTab
                  ? "Profil & Sejarah"
                  : isUMKMTab
                    ? "UMKM"
                    : isHotelTab
                      ? "Hotel & Penginapan"
                      : "Informasi"}
            </span>
          </div>
          <p className="schedule-eyebrow">
            <span aria-hidden="true" />
            {isGalleryTab
              ? "GALERI PORPROV XIII KALIMANTAN TENGAH 2026"
              : isSejarahTab
                ? "TENTANG KAMI • PROFIL & SEJARAH PORPROV KALIMANTAN TENGAH"
                : isUMKMTab
                  ? "DIREKTORI RESMI KULINER & UMKM KOTAWARINGIN BARAT • PORPROV XIII"
                  : isHotelTab
                    ? "AKOMODASI PORPROV XIII KALIMANTAN TENGAH"
                    : "About PORPROV XIII Kalimantan Tengah 2026"}
          </p>
          <h1>
            {isGalleryTab ? (
              <>
                Galeri <span>PORPROV XIII.</span>
              </>
            ) : isSejarahTab ? (
              <>
                Profil & <span>Sejarah</span>
              </>
            ) : isUMKMTab ? (
              <>
                Katalog Kuliner & UMKM <span>Kotawaringin Barat</span>
              </>
            ) : isHotelTab ? (
              <>
                Hotel & <span>Penginapan</span>
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
              : isSejarahTab
                ? "Mengenal lebih dekat perjalanan sejarah, visi penyelenggaraan, filosofi Isen Mulang, serta profil 14 Kontingen Kabupaten/Kota dalam perhelatan Pekan Olahraga Provinsi XIII Kalimantan Tengah Tahun 2026."
                : isUMKMTab
                  ? "Panduan 352 tempat makan, warung makan, kedai kopi, restoran, dan bakery di Kabupaten Kotawaringin Barat hasil crawl Google Maps untuk kontingen & penonton PORPROV XIII."
                  : isHotelTab
                    ? "Temukan rekomendasi hotel dan penginapan nyaman di sekitar lokasi pertandingan PORPROV XIII."
                    : "Informasi terkini seputar PORPROV XIII Kalimantan Tengah"}
          </p>
          <img
            className="news-hero-illustration"
            src="/keraBerita.png"
            alt="Maskot PORPROV memegang kamera"
          />
          {!isSejarahTab && (
            <p className="news-demo-note" role="note">
              Konten ini masih contoh. Foto galeri menggunakan gambar acak dan
              belum merupakan dokumentasi resmi PORPROV.
            </p>
          )}
        </section>

        <section
          className="news-content section-wrap"
          aria-label={
            isGalleryTab
              ? "Galeri foto"
              : isSejarahTab
                ? "Profil dan sejarah PORPROV Kalimantan Tengah"
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

          {isSejarahTab ? (
            <div className="space-y-10" aria-live="polite">
              {/* 1. Hero About Us / Profil Singkat */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-[#0e2742] via-[#174a72] to-[#216396] p-6 text-white shadow-lg sm:p-10">
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
                      src="/Logo.png"
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

              {/* 3. Tentang Kami (About Us) & Filosofi Huma Betang */}
              <div className="grid gap-6 lg:grid-cols-12">
                <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8 lg:col-span-7">
                  <div className="flex items-center gap-2 text-xs font-extrabold tracking-wider text-[#174a72] uppercase">
                    <BookOpen className="h-4 w-4" />
                    <span>Tentang Kami • Mengapa PORPROV Diselenggarakan?</span>
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
                            Sukses Ekonomi Kerakyatan & UMKM
                          </h4>
                          <p className="mt-1 text-xs leading-relaxed text-slate-600">
                            Menggerakkan sektor UMKM, kuliner lokal, perhotelan, transportasi, dan pariwisata (sport tourism) di Kotawaringin Barat dan sekitarnya.
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
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            visibleGalleryPhotos.length > 0 ? (
              <>
                <div className="news-gallery-grid" aria-live="polite">
                  {displayedGalleryPhotos.map((photo) => (
                    <Card
                      className="news-gallery-card p-0"
                      key={photo.id}
                      role="article"
                      aria-label={`${photo.category}: ${photo.title}`}
                      onClick={() => setSelectedPhoto(photo)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img
                        className="news-gallery-image"
                        src={photo.src}
                        alt={`${photo.title} (foto ilustrasi)`}
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="news-gallery-copy">
                        <span>{photo.category}</span>
                        <h2>{photo.title}</h2>
                      </div>
                    </Card>
                  ))}
                </div>
                {visibleGalleryPhotos.length > 6 && (
                  <Button
                    className="news-gallery-more"
                    type="button"
                    variant="outline"
                    onClick={() => setShowAllGallery((showAll) => !showAll)}
                  >
                    {showAllGallery ? "Tampilkan lebih sedikit" : "Lebih banyak"}
                  </Button>
                )}
              </>
            ) : (
              <p className="news-empty" role="status">
                Foto galeri tidak ditemukan. Coba kata kunci lain.
              </p>
            )
          ) : isHotelTab ? (
            <div className="space-y-6" aria-live="polite">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-xs text-slate-600 shadow-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#174a72]" />
                  <span>
                    Menampilkan <strong>{visibleHotels.length}</strong> rekomendasi akomodasi & penginapan di sekitar venue PORPROV XIII.
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  *Tarif dan ketersediaan kamar dapat berubah selama penyelenggaraan PORPROV.
                </span>
              </div>

              {visibleHotels.length > 0 ? (
                <div className="news-grid">
                  {visibleHotels.map((hotel) => (
                    <Card
                      className="news-card flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-xs transition-all hover:-translate-y-1 hover:shadow-md"
                      key={hotel.id}
                      role="article"
                    >
                      <div>
                        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                          <img
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                            src={hotel.image}
                            alt={hotel.hotelName}
                            loading="lazy"
                          />
                          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                            <span className="rounded-full bg-[#102b49]/90 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white uppercase backdrop-blur-xs">
                              {hotel.type}
                            </span>
                            <a
                              href={hotel.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Buka foto asli & ulasan di Google Maps"
                              className="inline-flex items-center gap-1 rounded-full bg-slate-950/80 hover:bg-slate-950 px-2.5 py-1 text-[10px] font-bold text-amber-300 backdrop-blur-xs transition-colors shadow-xs"
                            >
                              <Camera className="h-3 w-3 text-amber-300" />
                              <span>Foto Asli ↗</span>
                            </a>
                          </div>
                          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-amber-400/95 px-2.5 py-1 text-xs font-extrabold text-slate-950 shadow-xs">
                            <Star className="h-3.5 w-3.5 fill-slate-950" />
                            <span>{hotel.rating}</span>
                          </div>
                          <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between">
                            <span className="rounded-md bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-xs">
                              Kec. {hotel.district}
                            </span>
                          </div>
                        </div>

                        <div className="p-5">
                          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                            {hotel.hotelName}
                          </h2>
                          <p className="mt-1 text-xs font-semibold text-[#174a72]">
                            {hotel.priceRange}
                          </p>

                          <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                            <div className="flex items-start gap-2">
                              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#397eae]" />
                              <span>{hotel.address}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-medium text-emerald-700">
                              <Clock className="h-3.5 w-3.5 shrink-0" />
                              <span>{hotel.nearVenue}</span>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {hotel.facilities.map((facility) => (
                              <span
                                key={facility}
                                className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                              >
                                {facility}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50/70 p-4">
                        <a
                          href={hotel.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#174a72] bg-[#174a72]/5 px-3 py-2 text-xs font-bold text-[#174a72] transition-colors hover:bg-[#174a72] hover:text-white"
                          title="Buka foto asli hotel, fasilitas, dan rute di Google Maps"
                        >
                          <Camera className="h-3.5 w-3.5" />
                          Foto &amp; Peta
                          <ExternalLink className="h-3 w-3 opacity-70" />
                        </a>
                        <a
                          href={`https://wa.me/${hotel.contact.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          Reservasi
                        </a>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="news-empty" role="status">
                  Data hotel dan penginapan tidak ditemukan. Coba kata kunci lain.
                </p>
              )}
            </div>
          ) : isUMKMTab ? (
            <div className="space-y-8" aria-live="polite">
              {/* Hero Banner: Eksplorasi Kuliner Kotawaringin Barat */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-[#102b49] to-[#174a72] text-white shadow-lg">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 p-6 sm:p-8">
                  <div className="max-w-2xl space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 border border-amber-400/30 px-3.5 py-1 text-xs font-bold text-amber-300">
                      <Utensils className="h-3.5 w-3.5" />
                      <span>DIREKTORI RESMI KULINER & UMKM KOTAWARINGIN BARAT</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                      Jelajahi Cita Rasa & Tempat Makan Kotawaringin Barat
                    </h2>

                    <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed">
                      Menampilkan <strong>352 tempat makan</strong> hasil penelusuran publik Google Maps di seluruh kecamatan Kotawaringin Barat — mulai dari kopi liberika & kafe modern, restoran seafood pesisir Kumai, warung makan tradisional, masakan Padang, hingga bakery & es krim.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <Coffee className="h-4 w-4 text-amber-300" />
                        <span>171 Kafe & Kedai Kopi</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Store className="h-4 w-4 text-emerald-300" />
                        <span>122 Restoran & Rumah Makan</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Tag className="h-4 w-4 text-sky-300" />
                        <span>31 Warung & Dessert</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-72 shrink-0">
                    <div className="relative h-44 sm:h-52 w-full overflow-hidden rounded-xl border border-white/20 shadow-md">
                      <img
                        src="/kobar-kuliner-banner.jpg"
                        alt="Sajian Kuliner Kotawaringin Barat"
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <span className="absolute bottom-2.5 left-3 right-3 text-[11px] font-bold text-amber-200">
                        Kuliner Khas & Tempat Makan Kobar 2026
                      </span>
                    </div>
                  </div>
                </div>
              </div>

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
                        ? kobarUMKMData.length
                        : kobarUMKMData.filter(
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
                    {kobarUMKMData.length} tempat terdaftar
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

                    {/* Reset All Filters */}
                    {(selectedUMKMType !== "Semua" ||
                      selectedDistrict !== "Semua Kecamatan" ||
                      selectedCulinaryTheme !== "Semua" ||
                      onlyRecommended) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUMKMType("Semua");
                            setSelectedDistrict("Semua Kecamatan");
                            setSelectedCulinaryTheme("Semua");
                            setOnlyRecommended(false);
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
                  <p className="flex items-center gap-1 font-semibold text-[#174a72]">
                    <Camera className="h-3.5 w-3.5 text-amber-500" />
                    Klik <strong>"Foto Asli"</strong> pada kartu untuk melihat foto nyata tempat &amp; menu dari pengunjung Google Maps.
                  </p>
                </div>
              </div>

              {/* Culinary Cards Grid */}
              {visibleUMKM.length > 0 ? (
                <div className="space-y-6">
                  <div className="news-grid">
                    {paginatedUMKM.map((item) => (
                      <Card
                        className="news-card flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-xs transition-all hover:-translate-y-1 hover:shadow-md"
                        key={item.id}
                        role="article"
                      >
                        <div>
                          {/* Card Food Image Header */}
                          <div className="relative h-48 w-full overflow-hidden bg-slate-100 group">
                            <img
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              src={item.image}
                              alt={item.nama}
                              loading="lazy"
                            />

                            {/* Theme Pill Overlay & Foto Asli Pill */}
                            <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                              <span className="rounded-full bg-[#102b49]/90 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-white uppercase backdrop-blur-xs">
                                {item.culinaryTheme}
                              </span>
                              <a
                                href={item.google_maps_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Lihat foto asli tempat & menu di Google Maps"
                                className="inline-flex items-center gap-1 rounded-full bg-slate-950/80 hover:bg-slate-950 px-2 py-1 text-[10px] font-bold text-amber-300 backdrop-blur-xs transition-colors shadow-xs"
                              >
                                <Camera className="h-3 w-3 text-amber-300" />
                                <span>Foto Asli ↗</span>
                              </a>
                            </div>

                            {/* Rating Badge */}
                            {item.ada_rating && (
                              <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-extrabold text-slate-950 shadow-xs">
                                <Star className="h-3 w-3 fill-slate-950" />
                                <span>
                                  {item.rating_google.toFixed(1)} ({item.jumlah_ulasan})
                                </span>
                              </div>
                            )}

                            {/* District & Price Range */}
                            <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between gap-2">
                              <span className="rounded-md bg-black/75 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-xs line-clamp-1">
                                Kec. {item.kecamatan}
                              </span>
                              <span className="rounded-md bg-emerald-700/90 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-xs">
                                {item.priceRange}
                              </span>
                            </div>
                          </div>

                          {/* Card Content Body */}
                          <div className="p-5">
                            <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-snug">
                              {item.nama}
                            </h3>

                            <p className="mt-1 text-xs font-bold text-[#174a72]">
                              Kategori: {item.kategori_google}
                            </p>

                            {/* Signature Dish Pill */}
                            <div className="mt-2.5 rounded-lg border border-amber-200/80 bg-amber-50/70 p-2 text-xs">
                              <span className="font-extrabold text-amber-900 text-[11px] block">
                                🍽️ Menu & Sajian:
                              </span>
                              <p className="text-[11px] font-medium text-amber-950/80 mt-0.5 leading-snug">
                                {item.signatureDish}
                              </p>
                            </div>

                            <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                              <div className="flex items-start gap-2">
                                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#397eae]" />
                                <span className="line-clamp-2">{item.alamat}</span>
                              </div>

                              {item.jam_buka && (
                                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-700">
                                  <Clock className="h-3.5 w-3.5 shrink-0 text-[#397eae]" />
                                  <span>Jam Buka: {item.jam_buka}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50/70 p-4">
                          <a
                            href={item.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#174a72] bg-[#174a72]/5 px-2.5 py-2 text-xs font-bold text-[#174a72] transition-colors hover:bg-[#174a72] hover:text-white"
                            title="Buka foto asli tempat, menu, dan rute di Google Maps"
                          >
                            <Camera className="h-3.5 w-3.5 shrink-0" />
                            <span>Foto &amp; Peta</span>
                            <ExternalLink className="h-3 w-3 opacity-70 shrink-0" />
                          </a>

                          {item.telepon ? (
                            <a
                              href={`https://wa.me/${item.telepon.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
                            >
                              <Phone className="h-3.5 w-3.5 shrink-0" />
                              Hubungi
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedUMKMDetail(item)}
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-900"
                            >
                              <Info className="h-3.5 w-3.5 shrink-0" />
                              Detail Menu
                            </button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination Navigation */}
                  {totalUMKMPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 pt-5">
                      <p className="text-xs font-semibold text-slate-600">
                        Menampilkan halaman <strong>{umkmPage}</strong> dari{" "}
                        <strong>{totalUMKMPages}</strong> ({visibleUMKM.length} tempat)
                      </p>

                      <div className="flex items-center gap-1">
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
                      <img
                        src={selectedUMKMDetail.image}
                        alt={selectedUMKMDetail.nama}
                        className="h-full w-full object-cover"
                      />
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
                    <p className="text-xs font-bold text-[#174a72]">
                      {selectedUMKMDetail.kategori_google} • Kec.{" "}
                      {selectedUMKMDetail.kecamatanFull}
                    </p>

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
                          📸 Galeri Foto Asli Tempat &amp; Menu
                        </span>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Lihat foto asli fisik warung/kafe, suasana meja makan, foto buku menu &amp; harga terkini, serta ulasan terbaru dari pengunjung Google Maps.
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
                      className="news-card p-0 flex flex-col justify-between hover:shadow-lg transition-all"
                      key={article.id}
                      role="article"
                      aria-labelledby={`news-title-${article.id}`}
                    >
                      <div
                        className={`news-card-cover news-cover-${article.theme} cursor-pointer group`}
                        onClick={() => setSelectedDetailArticle(article)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Badge className="bg-white/25 text-white backdrop-blur-xs border-white/30 text-[10px] uppercase font-bold tracking-wider">
                            {article.sopd || article.category}
                          </Badge>
                          <span className="text-[11px] font-bold text-white/90 bg-black/25 px-2 py-0.5 rounded-full">
                            PORPROV XIII
                          </span>
                        </div>
                        <strong className="mt-auto text-xl sm:text-2xl font-black text-white leading-snug line-clamp-2">
                          {article.title}
                        </strong>
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
                            className="inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline gap-1"
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

          <div className="max-w-5xl w-full flex flex-col items-center">
            <img
              src={selectedPhoto.src}
              alt={selectedPhoto.title}
              className="max-h-[80vh] max-w-full rounded-lg shadow-2xl object-contain"
            />
            <div className="mt-4 text-center text-white">
              <Badge variant="secondary" className="mb-2">{selectedPhoto.category}</Badge>
              <h3 className="text-xl font-bold">{selectedPhoto.title}</h3>
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
