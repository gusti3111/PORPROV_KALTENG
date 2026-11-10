import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";

type NewsCategory = "Berita" | "Sejarah" | "Galeri" | "UMKM" | "Hotel dan Penginapan" ;
type CategoryFilter = "semua" | NewsCategory;

type NewsArticle = {
  id: number;
  category: NewsCategory;
  date: string;
  title: string;
  excerpt: string;
  theme: "green" | "orange" | "lime";
};

type GalleryPhoto = {
  id: number;
  category: string;
  title: string;
  src: string;
};

type UMKMItem = {
  id: number;
  storeName: string;
  product: string;
  location: string;
  contact: string;
  category: "Kuliner" | "Kerajinan" | "Fashion" | "Lainnya";
  image: string;
};

const umkmData: UMKMItem[] = [
  {
    id: 1,
    storeName: "Kripik Singkong Palangkaraya",
    product: "Kripik Singkong Pedas Manis",
    location: "Venue Stadion Utama",
    contact: "0812-3456-7890",
    category: "Kuliner",
    image: "https://picsum.photos/seed/umkm-1/400/300",
  },
  {
    id: 2,
    storeName: "Anyaman Rotan Dayak",
    product: "Tas dan Topi Anyaman",
    location: "Venue GOR Basket",
    contact: "0821-9876-5432",
    category: "Kerajinan",
    image: "https://picsum.photos/seed/umkm-2/400/300",
  },
  {
    id: 3,
    storeName: "Batik Kalteng Eksklusif",
    product: "Kain Batik Motif Benang Bintik",
    location: "Venue Stadion Utama",
    contact: "0852-1122-3344",
    category: "Fashion",
    image: "https://picsum.photos/seed/umkm-3/400/300",
  },
  {
    id: 4,
    storeName: "Kopi Robusta Lokal",
    product: "Kopi Bubuk Asli Kalteng",
    location: "Venue GOR Voli",
    contact: "0813-4455-6677",
    category: "Kuliner",
    image: "https://picsum.photos/seed/umkm-4/400/300",
  },
];

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
  "semua",
  "Berita",
  "Sejarah",
  "Galeri",
  "UMKM",
  "Hotel dan Penginapan",
];

function formatDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(`${date}T12:00:00+07:00`));
}

export default function Newsview() {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("semua");
  const [query, setQuery] = useState("");
  const [showAllGallery, setShowAllGallery] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const normalizedQuery = query.trim().toLocaleLowerCase("id");
  const isGalleryTab = selectedCategory === "Galeri";
  const isUMKMTab = selectedCategory === "UMKM";

  const visibleArticles = useMemo(
    () =>
      articles.filter((article) => {
        const matchesCategory =
          selectedCategory === "semua" ||
          article.category === selectedCategory;
        const matchesQuery =
          !normalizedQuery ||
          `${article.title} ${article.excerpt} ${article.category}`
            .toLocaleLowerCase("id")
            .includes(normalizedQuery);

        return matchesCategory && matchesQuery;
      }),
    [normalizedQuery, selectedCategory],
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

  return (
    <>
      <SiteHeader />

      <main className="news-page">
        <section className="news-intro section-wrap">
          <div className="schedule-breadcrumb">
            <Link to="/">Beranda</Link>
            <span aria-hidden="true">/</span>
            <span>{isGalleryTab ? "Galeri" : isUMKMTab ? "UMKM" : "Informasi"}</span>
          </div>
          <p className="schedule-eyebrow">
            <span aria-hidden="true" />
            {isGalleryTab
              ? "GALERI PORPROV XIII KALIMANTAN TENGAH 2026"
              : isUMKMTab
              ? "PASAR UMKM PORPROV XIII KALIMANTAN TENGAH"
              : "About PORPROV XIII Kalimantan Tengah 2026"}
          </p>
          <h1>
            {isGalleryTab ? (
              <>
                Galeri <span>PORPROV XIII.</span>
              </>
            ) : isUMKMTab ? (
              <>
                Katalog <span>UMKM</span>
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
              : isUMKMTab
              ? "Dukung produk lokal dan temukan kerajinan khas Kalimantan Tengah di area venue."
              : "Informasi terkini seputar PORPROV XIII Kalimantan Tengah"}
          </p>
          <img
            className="news-hero-illustration"
            src="/burungBerita.png"
            alt="Maskot PORPROV memegang kamera"
          />
          <p className="news-demo-note" role="note">
            Konten ini masih contoh. Foto galeri menggunakan gambar acak dan
            belum merupakan dokumentasi resmi PORPROV.
          </p>
        </section>

        <section
          className="news-content section-wrap"
          aria-label={isGalleryTab ? "Galeri foto" : "Daftar berita"}
        >
          <div className="news-toolbar">
            <label className="news-search">
              <span className="sr-only">
                {isGalleryTab ? "Cari foto galeri" : "Cari berita"}
              </span>
              <Input
                type="search"
                placeholder={isGalleryTab ? "Cari foto galeri..." : "Cari berita..."}
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
                  {category === "semua" ? "Semua" : category}
                </Button>
              ))}
            </div>
          </div>

          {isGalleryTab ? (
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
          ) : isUMKMTab ? (
            umkmData.length > 0 ? (
              <div className="news-grid" aria-live="polite">
                {umkmData.map((item) => (
                  <Card
                    className="news-card p-0"
                    key={item.id}
                    role="article"
                  >
                    <img 
                      className="news-card-cover" 
                      src={item.image} 
                      alt={item.storeName} 
                      style={{ objectFit: 'cover', height: '200px' }}
                    />
                    <div className="news-card-copy">
                      <p className="news-meta">
                        <Badge variant="secondary">{item.category}</Badge>
                      </p>
                      <h2>{item.storeName}</h2>
                      <p><strong>Produk:</strong> {item.product}</p>
                      <p><strong>Lokasi:</strong> {item.location}</p>
                      <div className="mt-4">
                        <a 
                          href={`https://wa.me/${item.contact.replace(/\s+/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-md bg-green-600 px-3 py-1 text-xs font-bold text-white hover:bg-green-700 transition-colors"
                        >
                          Hubungi Penjual
                        </a>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="news-empty" role="status">
                Data UMKM tidak ditemukan.
              </p>
            )
          ) : visibleArticles.length > 0 ? (
            <div className="news-grid" aria-live="polite">
              {visibleArticles.map((article) => (
                <Card
                  className="news-card p-0"
                  key={article.id}
                  role="article"
                  aria-labelledby={`news-title-${article.id}`}
                >
                  <div
                    className={`news-card-cover news-cover-${article.theme}`}
                    aria-hidden="true"
                  >
                    <span>PORPROV XIII</span>
                    <strong>2026</strong>
                  </div>
                  <div className="news-card-copy">
                    <p className="news-meta">
                      <Badge variant="secondary">{article.category}</Badge>
                      <time dateTime={article.date}>
                        {formatDate(article.date)}
                      </time>
                    </p>
                    <h2 id={`news-title-${article.id}`}>{article.title}</h2>
                    <p>{article.excerpt}</p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="news-empty" role="status">
              Berita tidak ditemukan. Coba kata kunci atau kategori lain.
            </p>
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

      <SiteFooter />
    </>
  );
}
