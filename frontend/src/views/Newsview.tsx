import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";

type NewsCategory = "Informasi" | "Persiapan" | "Prestasi";
type CategoryFilter = "semua" | NewsCategory;

type NewsArticle = {
  id: number;
  category: NewsCategory;
  date: string;
  title: string;
  excerpt: string;
  theme: "green" | "orange" | "lime";
};

const articles: NewsArticle[] = [
  {
    id: 1,
    category: "Informasi",
    date: "2026-11-20",
    title: "Informasi terbaru seputar PORPROV XIII Kalimantan Tengah",
    excerpt:
      "Ikuti perkembangan informasi dan pengumuman resmi menjelang penyelenggaraan PORPROV XIII.",
    theme: "green",
  },
  {
    id: 2,
    category: "Persiapan",
    date: "2026-11-18",
    title: "Persiapan venue terus dilakukan menjelang pertandingan",
    excerpt:
      "Panitia terus mempersiapkan sarana dan prasarana untuk mendukung kelancaran pertandingan.",
    theme: "orange",
  },
  {
    id: 3,
    category: "Prestasi",
    date: "2026-11-15",
    title: "Semangat atlet daerah menyambut pesta olahraga provinsi",
    excerpt:
      "Atlet dari berbagai kabupaten dan kota bersiap untuk bertanding dengan menjunjung sportivitas.",
    theme: "lime",
  },
  {
    id: 4,
    category: "Informasi",
    date: "2026-11-12",
    title: "Kenali cabang olahraga yang dipertandingkan",
    excerpt:
      "Cari tahu cabang olahraga dan informasi pertandingan dalam agenda PORPROV XIII.",
    theme: "green",
  },
];

const categories: CategoryFilter[] = [
  "semua",
  "Informasi",
  "Persiapan",
  "Prestasi",
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
  const normalizedQuery = query.trim().toLocaleLowerCase("id");

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

  return (
    <>
      <SiteHeader />

      <main className="news-page">
        <section className="news-intro section-wrap">
          <div className="schedule-breadcrumb">
            <Link to="/">Beranda</Link>
            <span aria-hidden="true">/</span>
            <span>Berita</span>
          </div>
          <p className="schedule-eyebrow">
            <span aria-hidden="true" /> KABAR PORPROV
          </p>
          <h1>
            Berita <span>terkini.</span>
          </h1>
          <p className="schedule-description">
            Ikuti kabar, informasi, dan cerita dari PORPROV XIII Kalimantan
            Tengah.
          </p>
          <p className="news-demo-note" role="note">
            Contoh tampilan berita. Perbarui data dengan informasi resmi dari
            panitia.
          </p>
        </section>

        <section className="news-content section-wrap" aria-label="Daftar berita">
          <div className="news-toolbar">
            <label className="news-search">
              <span className="sr-only">Cari berita</span>
              <Input
                type="search"
                placeholder="Cari berita..."
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

          {visibleArticles.length > 0 ? (
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

      <SiteFooter />
    </>
  );
}
