import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ArrowIcon from "../components/ArrowIcon";
import EventCountdown from "../components/EventCountdown";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { EVENT_START_LABEL } from "../event-config";

const featuredStadiums = [
  {
    category: "GOR SPORT CENTER",
    venue: "GOR Sport Center Ratu Alamsyah",
    city: "Madurejo, Kotawaringin Barat",
    cabor: "Bola Voli Indoor & Futsal",
    image: "/venues2/gorSportCenter.jpeg",
  },
  {
    category: "LAPANGAN TREK LARI",
    venue: "Lintasan Atletik Sport Center",
    city: "Madurejo, Kotawaringin Barat",
    cabor: "Cabang Olahraga Atletik",
    image: "/venues2/LintasanAtletik.jpeg",
  },
  {
    category: "STADION",
    venue: "Stadion Sepak Bola Sport Center",
    city: "Madurejo, Kotawaringin Barat",
    cabor: "Cabang Olahraga Sepak Bola",
    image: "/venues2/sportCenter.jpg",
  },
];

type HomeNewsCard = {
  id: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  image: string;
};

const fallbackNewsCards: HomeNewsCard[] = [
  {
    id: "fallback-1",
    title: "Bupati Kobar Dampingi Gubernur Kalteng Tinjau Kesiapan Arena PORPROV XIII 2026",
    date: "November 2026",
    category: "PEMKAB KOBAR",
    excerpt: "Peninjauan langsung sejumlah venue utama di Pangkalan Bun untuk memastikan kesiapan teknis penyelenggaraan PORPROV XIII Kalimantan Tengah.",
    image: "https://kotawaringinbaratkab.go.id/sites/default/files/2026-11/gub.jpeg",
  },
  {
    id: "fallback-2",
    title: "Buka CdM Meeting PORPROV XIII, Wabup Kobar Tekankan Sportivitas dan Keselamatan Atlet",
    date: "November 2026",
    category: "CDM MEETING",
    excerpt: "Pertemuan Chef de Mission membahas kesiapan kontingen, jadwal pertandingan, layanan kesehatan, serta tata tertib arena.",
    image: "https://kotawaringinbaratkab.go.id/sites/default/files/2026-11/dci.jpeg",
  },
  {
    id: "fallback-3",
    title: "Dorong Pemulihan Ekonomi Daerah, Pemkab Kobar Integrasikan PORPROV XIII dan Kobar Expo 2026",
    date: "November 2026",
    category: "EKONOMI & UMKM",
    excerpt: "Ribuan atlet, ofisial, dan pengunjung PORPROV XIII diharapkan menggerakkan sektor kuliner, perhotelan, dan UMKM lokal.",
    image: "https://kotawaringinbaratkab.go.id/sites/default/files/2026-11/expo.jpeg",
  },
];

function stripHtmlTags(raw: string): string {
  return raw
    .replace(/<[^>]*>?/gm, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export default function HomeView() {
  const [latestNews, setLatestNews] = useState<HomeNewsCard[]>(fallbackNewsCards);

  useEffect(() => {
    let cancelled = false;
    const loadLatestNews = async () => {
      try {
        const res = await fetch(
          "https://mmc.apikobar.id/api/berita?search=porprov%20xiii",
        );
        if (!res.ok) return;
        const json = (await res.json()) as {
          data?: Array<{
            id_berita?: number;
            judul?: string;
            sub_judul?: string;
            deskripsi?: string;
            sopd?: string;
            set_tanggal_publish?: string;
            slug_berita?: string;
            filename1?: string;
          }>;
        };
        const items = Array.isArray(json.data) ? json.data.slice(0, 3) : [];
        if (cancelled || items.length === 0) return;

        const slugImageMap: Record<string, string> = {
          "pemkab-kobar-resmi-tetapkan-jadwal-porprov-xiii-kalteng-28-november-hingga-8-desember-2026":
            "https://kotawaringinbaratkab.go.id/sites/default/files/2026-11/jadwal.jpeg",
          "bupati-kobar-dampingi-gubernur-kalteng-tinjau-kesiapan-arena-porprov-xiii-2026":
            "https://kotawaringinbaratkab.go.id/sites/default/files/2026-11/gub.jpeg",
          "buka-cdm-meeting-porprov-xiii-wabup-kobar-tekankan-sportivitas-dan-keselamatan-atlet":
            "https://kotawaringinbaratkab.go.id/sites/default/files/2026-11/dci.jpeg",
          "dorong-pemulihan-ekonomi-daerah-pemkab-kobar-integrasikan-porprov-xiii-dan-kobar-expo-2026":
            "https://kotawaringinbaratkab.go.id/sites/default/files/2026-11/expo.jpeg",
        };

        setLatestNews(
          items.map((item, idx) => ({
            id: String(item.id_berita ?? idx),
            title: item.judul || fallbackNewsCards[idx]?.title || "Berita PORPROV XIII",
            date: item.set_tanggal_publish || "Terbaru",
            category: item.sopd || "BERITA PORPROV",
            excerpt:
              stripHtmlTags(item.sub_judul || item.deskripsi || "") ||
              fallbackNewsCards[idx]?.excerpt ||
              "",
            image:
              (item.filename1
                ? `https://mmc.kotawaringinbaratkab.go.id/upload/berita/${item.filename1}`
                : "") ||
              (item.slug_berita && slugImageMap[item.slug_berita]) ||
              fallbackNewsCards[idx]?.image ||
              "",
          })),
        );
      } catch {
        // Keep fallbackNewsCards on network/CORS error
      }
    };
    void loadLatestNews();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <SiteHeader />

      <main>
        <section
          id="beranda"
          className="relative flex min-h-[610px] items-center overflow-hidden bg-[var(--green)] text-white max-[900px]:min-h-[570px] max-[620px]:min-h-[710px] max-[620px]:items-start"
        >
          <img
            className="home-hero-photo"
            src="/sportcenter.webp"
            alt=""
            aria-hidden="true"
          />
          <div className="home-hero-photo-overlay" aria-hidden="true" />
          <div className="hero-grid" aria-hidden="true" />
          <div
            className="hero-orbit hero-orbit-one"
            aria-hidden="true"
          />
          <div
            className="hero-orbit hero-orbit-two"
            aria-hidden="true"
          />

          <div className="relative z-[2] w-[54%] pt-[76px] pb-[105px] pl-[10%] min-[1500px]:pl-[max(8%,calc((100vw-var(--container-max,1760px))/2))] max-[900px]:w-[60%] max-[900px]:pl-[7%] max-[620px]:w-full max-[620px]:px-[6%] max-[620px]:pt-[65px] max-[620px]:pb-[170px]">
            <p className="mb-6 flex items-center gap-[10px] text-[clamp(10px,0.9vw,14px)] font-extrabold uppercase tracking-[0.15em] text-[var(--lime)]">
              <span className="size-[7px] rounded-full bg-[var(--lime)] shadow-[0_0_14px_rgba(220,236,249,0.75)]" />
              Panggung prestasi Kalimantan Tengah
            </p>
            <h1 className="m-0 text-[clamp(28px,5.6vw,88px)] font-black leading-[0.94] tracking-[-0.06em]">
              PORPROV XIII
              <span className="mt-2.5 ml-1 flex flex-wrap items-center gap-2 sm:gap-3 text-[clamp(14px,2.4vw,38px)] font-extrabold tracking-[-0.03em] text-white max-[620px]:mt-1.5">
                KALIMANTAN TENGAH
                <i className="font-extrabold not-italic tracking-normal text-[var(--lime)]">
                  2026
                </i>
              </span>
            </h1>
            <p className="mt-7 ml-[5px] max-w-[390px] xl:max-w-[480px] 2xl:max-w-[620px] min-[2560px]:max-w-[800px] text-[clamp(12px,1.15vw,21px)] leading-[1.85] text-white/75 max-[620px]:max-w-[340px]">
              Pekan Olahraga Provinsi Kalimantan Tengah. Satu semangat untuk
              berkompetisi, berprestasi, dan tumbuh bersama.
            </p>
            <div className="mt-[29px] ml-[5px] flex items-center gap-[25px] max-[620px]:flex-wrap max-[620px]:gap-x-5 max-[620px]:gap-y-[14px]">
              <a className="inline-flex min-h-[49px] items-center justify-center gap-[18px] rounded-md bg-[var(--lime)] px-5 text-[clamp(11px,0.95vw,15px)] font-extrabold text-[#102b49] transition-[transform,background] duration-[160ms] hover:-translate-y-0.5 hover:bg-[#c6e2f5] max-[620px]:min-h-[45px] max-[620px]:px-[15px]" href="#tentang">
                Jelajahi PORPROV <ArrowIcon />
              </a>
              <Link className="rounded-md text-[clamp(11px,0.95vw,15px)] font-bold text-white/80 hover:text-[var(--lime)]" to="/cabor">
                Kenali cabang olahraga
              </Link>
            </div>
          </div>

          <img
            className="home-hero-mascot"
            src="/maskot.png"
            alt="Maskot PORPROV XIII Kalimantan Tengah membawa obor"
          />

          <div className="hero-art" aria-label="Ilustrasi lintasan olahraga">
            <div className="art-sun" />
            <div className="art-label art-label-top">
              <span>01</span> KALTENG BERPRESTASI
            </div>
            <div className="track">
              <div className="track-inner" />
              <div className="track-center">
                <span className="track-star">✳</span>
                <strong>2026</strong>
                <small>SPORT • UNITY • PRIDE</small>
              </div>
            </div>
            <div className="art-label art-label-bottom">
              <span className="art-label-line" />
              Pekan Olahraga Provinsi
            </div>
            <span className="art-index">
              13<span>/XV</span>
            </span>
          </div>



          <div className="absolute right-[7.2%] bottom-0 left-[7.2%] flex h-14 items-center gap-4 border-t border-white/20 text-[clamp(8px,0.75vw,12px)] font-extrabold tracking-[0.15em] text-white/75 max-[620px]:right-[5%] max-[620px]:left-[5%] max-[620px]:gap-2">
            <span>SPORTIVITAS</span>
            <span className="text-xs text-[var(--lime)]">✳</span>
            <span>PERSAUDARAAN</span>
            <span className="text-xs text-[var(--lime)]">✳</span>
            <span>PRESTASI</span>
            <span className="ml-auto text-[clamp(8px,0.7vw,11px)] text-white/50 max-[620px]:hidden">
              KALIMANTAN TENGAH, INDONESIA
            </span>
          </div>
        </section>

        <section
          className="relative mx-auto mt-10 grid w-[var(--container-width)] grid-cols-[1fr_auto] items-center gap-x-[30px] gap-y-3 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-6 shadow-[var(--ui-shadow)] max-[900px]:w-[90%] max-[620px]:mt-[25px] max-[620px]:w-[88%] max-[620px]:grid-cols-1 max-[620px]:gap-4 max-[620px]:p-5 max-[620px]:rounded-[10px]"
          aria-labelledby="countdown-title"
        >
          <div>
            <p className="mb-[5px] text-[clamp(9px,0.8vw,12px)] font-extrabold tracking-[0.15em] text-[var(--green)]">HITUNG MUNDUR</p>
            <h2 id="countdown-title" className="m-0 text-[clamp(17px,1.8vw,28px)] font-extrabold tracking-[-0.04em]">Menuju pembukaan</h2>
            <p className="mt-[6px] mb-0 text-[clamp(11px,0.95vw,15px)] text-[var(--muted)]">{EVENT_START_LABEL}</p>
          </div>
          <EventCountdown />
          <p className="col-span-full m-0 text-[clamp(9px,0.8vw,12px)] text-[var(--muted)] max-[620px]:col-span-1">
            Tanggal sementara, sesuaikan dengan jadwal resmi PORPROV XIII.
          </p>
        </section>


        {/* ===================================================================
            02. CAROUSEL VENUE PERTANDINGAN
           =================================================================== */}
        <section className="home-stadium-section" aria-labelledby="home-stadium-title">
          <div className="home-stadium-heading">
            <div>
              <p className="home-stadium-kicker"><span>02</span> GALERI VENUE</p>
              <h2 id="home-stadium-title">Venue yang tersedia</h2>
              <p className="home-stadium-description">Berikut adalah Venue yang digunakan untuk pertandingan nanti.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/venue"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
              >
                Semua Venue
                <ArrowIcon diagonal />
              </Link>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-[repeat(3,minmax(0,1fr))_auto] items-stretch">
            {featuredStadiums.slice(0, 3).map((item, index) => {
              const venueTarget = `/venue?venue=${encodeURIComponent(item.venue)}`;
              return (
                <Link
                  to={venueTarget}
                  className="home-stadium-card !w-full !flex-none group block no-underline text-inherit"
                  key={item.venue}
                  aria-label={`Lihat detail ${item.venue} di halaman Venue`}
                >
                  <div className="home-stadium-image-link">
                    {item.image ? (
                      <img
                        className="home-stadium-image"
                        src={item.image}
                        alt={item.venue}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.src.includes("sportCenter.jpg")) {
                            target.src = "/venues2/sportCenter.jpg";
                          }
                        }}
                      />
                    ) : (
                      <div className="home-stadium-image flex items-center justify-center bg-slate-100 text-xs font-medium text-slate-400">
                        Foto belum tersedia
                      </div>
                    )}
                    <span className="home-stadium-index">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="home-stadium-copy">
                    <small>{item.category}</small>
                    <h3>{item.venue}</h3>
                    <p>{item.city}</p>
                    <span className="home-stadium-credit" style={{ textDecoration: "none" }}>
                      {item.cabor}
                    </span>
                    <span className="home-stadium-license text-emerald-800 font-bold group-hover:underline">
                      Lihat di peta venue →
                    </span>
                  </div>
                </Link>
              );
            })}

            {/* End Arrow Link: Venue Page */}
            <Link
              to="/venue"
              aria-label="Lihat semua venue di halaman Venue"
              className="group flex md:flex-col items-center justify-center gap-3 rounded-xl px-5 py-4 bg-[image:var(--hero-gradient)] text-white border-2 border-dashed border-amber-300/50 hover:border-amber-300 transition-all text-center no-underline md:min-w-[130px]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-lg transition-transform duration-200 group-hover:translate-x-1 group-hover:scale-105">
                <ArrowRight className="h-6 w-6" />
              </span>
              <span className="text-xs font-extrabold text-white leading-tight">
                Semua Venue
              </span>
            </Link>
          </div>
        </section>

        {/*  3 Berita Terkini  */}
        <section className="home-stadium-section" aria-labelledby="home-news-title">
          <div className="home-stadium-heading">
            <div>
              <p className="home-stadium-kicker">
                <span>02</span> BERITA TERKINI
              </p>
              <h2 id="home-news-title">Berita terbaru PORPROV XIII</h2>
              <p className="home-stadium-description">
                Ikuti perkembangan informasi dan rilis resmi terbaru seputar PORPROV XIII Kalimantan Tengah.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/informasi?tab=berita"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
              >
                Semua Berita
                <ArrowIcon diagonal />
              </Link>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-[repeat(3,minmax(0,1fr))_auto] items-stretch">
            {latestNews.slice(0, 3).map((news, index) => (
              <Link
                to="/informasi?tab=berita"
                className="home-stadium-card !w-full !flex-none group block no-underline text-inherit"
                key={news.id}
                aria-label={`Baca berita ${news.title}`}
              >
                <div className="home-stadium-image-link">
                  <img
                    className="home-stadium-image"
                    src={news.image}
                    alt={news.title}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src.includes("/upload/berita/")) {
                        target.src = target.src.replace("/upload/berita/", "/foto_berita/");
                      } else {
                        target.style.display = "none";
                      }
                    }}
                  />
                  <span className="home-stadium-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="home-stadium-copy">
                  <small>{news.category} • {news.date}</small>
                  <h3 className="line-clamp-2">{news.title}</h3>
                  <p className="line-clamp-2">{news.excerpt}</p>
                  <span className="home-stadium-license text-emerald-800 font-bold group-hover:underline">
                    Baca selengkapnya →
                  </span>
                </div>
              </Link>
            ))}

            {/* End Arrow Link: News Page */}
            <Link
              to="/informasi?tab=berita"
              aria-label="Lihat semua berita di halaman Informasi"
              className="group flex md:flex-col items-center justify-center gap-3 rounded-xl px-5 py-4 bg-[image:var(--hero-gradient)] text-white border-2 border-dashed border-amber-300/50 hover:border-amber-300 transition-all text-center no-underline md:min-w-[130px]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-lg transition-transform duration-200 group-hover:translate-x-1 group-hover:scale-105">
                <ArrowRight className="h-6 w-6" />
              </span>
              <span className="text-xs font-extrabold text-white leading-tight">
                Semua Berita
              </span>
            </Link>
          </div>
        </section>
        {/* caroussel cabor */}


        <section id="kuliner" className="mx-auto w-[var(--container-width)] pt-[94px] pb-[108px] max-[900px]:w-[90%] max-[620px]:w-[88%] max-[620px]:py-[72px]">
          <div className="flex items-center gap-[10px] text-[clamp(11px,1.3vw,18px)] font-extrabold tracking-[0.16em] text-[#596156] [&>span:first-child]:text-[var(--orange)]">
            <span>07</span>
            <span>Sentra Kuliner dan Restoran </span>
          </div>

          <div className="mt-[33px] grid grid-cols-[1fr_1fr] items-center gap-[8%] max-[900px]:gap-[5%] max-[620px]:grid-cols-1 max-[620px]:gap-[27px]">
            <div className="flex items-center justify-center p-2">
              <img
                src="/maskot-kuliner.png"
                alt="Maskot PORPROV XIII Kalimantan Tengah menikmati kuliner khas Coto Manggala"
                className="w-full max-w-[480px] h-auto object-contain drop-shadow-lg transition-transform duration-300 hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
            <div>
              <h2 className="m-0 text-[clamp(24px,4.2vw,64px)] font-extrabold leading-[1.08] tracking-[-0.06em] [&>span]:text-[var(--green)]">
                Untuk apa memperebutkan semangkuk coto,
                <br />
                <span>kita bisa temukan jauh lebih banyak di sini </span>
              </h2>
              <p className="mt-[21px] mb-0 max-w-[390px] xl:max-w-[480px] 2xl:max-w-[620px] min-[2560px]:max-w-[800px] text-[clamp(12px,1.1vw,20px)] leading-[1.9] text-[var(--muted)]">
                Berikut beberapa rekomendasi tempat makan yang enak dan cocok untuk menikmati kuliner khas Kotawaringin Barat.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <Link className="inline-flex items-center gap-2 rounded-md text-[clamp(11px,1vw,16px)] font-extrabold text-[var(--green)] transition-colors duration-[160ms] hover:text-[var(--orange)]" to="/informasi?tab=makan">
                  Lihat Tempat makan dan Restoran <ArrowIcon diagonal />
                </Link>
                {/* <Link className="inline-flex items-center gap-2 rounded-md text-[11px] font-extrabold text-[var(--green)] transition-colors duration-[160ms] hover:text-[var(--orange)]" to="/venue">
                  Lihat venue pertandingan <ArrowIcon diagonal />
                </Link> */}
              </div>
            </div>

          </div>
        </section>
        <section id="wisata" className="mx-auto w-[var(--container-width)] pt-[94px] pb-[108px] max-[900px]:w-[90%] max-[620px]:w-[88%] max-[620px]:py-[72px]">
          <div className="flex items-center gap-[13px] text-[clamp(11px,1.3vw,18px)] font-extrabold tracking-[0.16em] text-[#596156] [&>span:first-child]:text-[var(--orange)]">
            <span>08</span>
            <span>Tempat Wisata </span>
          </div>

          <div className="mt-[33px] grid grid-cols-[1fr_1fr] items-center gap-[8%] max-[900px]:gap-[5%] max-[620px]:grid-cols-1 max-[620px]:gap-[27px]">
            <div>
              <h2 className="m-0 text-[clamp(24px,4.2vw,64px)] font-extrabold leading-[1.08] tracking-[-0.06em] [&>span]:text-[var(--green)]">
                Setelah kenyang perut
                <br />
                <span>Yuk Jalan-jalan</span>
              </h2>
              <p className="mt-[21px] mb-0 max-w-[390px] xl:max-w-[480px] 2xl:max-w-[620px] min-[2560px]:max-w-[800px] text-[clamp(12px,1.1vw,20px)] leading-[1.9] text-[var(--muted)]">
                Anda bisa mengunjungi beberapa tempat wisata menarik di Kotawaringin Barat yang sayang untuk dilewatkan.
                Berikut beberapa rekomendasi tempat wisata yang cocok untuk dikunjungi setelah menikmati kuliner khas Kotawaringin Barat.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <Link className="inline-flex items-center gap-2 rounded-md text-[clamp(11px,1vw,16px)] font-extrabold text-[var(--green)] transition-colors duration-[160ms] hover:text-[var(--orange)]" to="/informasi?tab=wisata">
                  Lihat Tempat Wisata<ArrowIcon diagonal />
                </Link>

                {/* <Link className="inline-flex items-center gap-2 rounded-md text-[11px] font-extrabold text-[var(--green)] transition-colors duration-[160ms] hover:text-[var(--orange)]" to="/venue">
                  Lihat venue pertandingan <ArrowIcon diagonal />
                </Link> */}
              </div>
            </div>
            <div className="flex items-center justify-center p-2">
              <img
                src="/keraWis-bg.png"
                alt="Maskot PORPROV XIII Kalimantan Tengah menikmati kuliner khas Coto Manggala"
                className="w-full max-w-[480px] h-auto object-contain drop-shadow-lg transition-transform duration-300 hover:scale-[1.02]"
                loading="lazy"
              />
            </div>


          </div>
        </section>

        <section id="penginapan" className="mx-auto w-[var(--container-width)] pt-[94px] pb-[108px] max-[900px]:w-[90%] max-[620px]:w-[88%] max-[620px]:py-[72px]">
          <div className="flex items-center gap-[13px] text-[clamp(11px,1.3vw,18px)] font-extrabold tracking-[0.16em] text-[#596156] [&>span:first-child]:text-[var(--orange)]">
            <span>09</span>
            <span>Hotel dan Penginapan </span>
          </div>

          <div className="mt-[33px] grid grid-cols-[1fr_1fr] items-center gap-[8%] max-[900px]:gap-[5%] max-[620px]:grid-cols-1 max-[620px]:gap-[27px]">
            <div className="flex items-center justify-center p-2">
              <img
                src="/keraHotel.png"
                alt="Maskot PORPROV XIII Kalimantan Tengah menikmati kuliner khas Coto Manggala"
                className="w-full max-w-[480px] h-auto object-contain drop-shadow-lg transition-transform duration-300 hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
            <div>
              <h2 className="m-0 text-[clamp(24px,4.2vw,64px)] font-extrabold leading-[1.08] tracking-[-0.06em] [&>span]:text-[var(--green)]">
                Udah Capek Jalan-jalannya
                <br />
                <span>Jangan Khawatir,kita ada tempat penginapan yang nyaman</span>
              </h2>
              <p className="mt-[21px] mb-0 max-w-[390px] xl:max-w-[480px] 2xl:max-w-[620px] min-[2560px]:max-w-[800px] text-[clamp(12px,1.1vw,20px)] leading-[1.9] text-[var(--muted)]">
                Berikut beberapa  tempat penginapan pilihan di Kotawaringin Barat yang dapat membuat  istirahat anda semakin nyaman
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <Link className="inline-flex items-center gap-2 rounded-md text-[clamp(11px,1vw,16px)] font-extrabold text-[var(--green)] transition-colors duration-[160ms] hover:text-[var(--orange)]" to="/informasi?tab=penginapan">
                  Lihat Hotel dan Penginapan<ArrowIcon diagonal />
                </Link>

                {/* <Link className="inline-flex items-center gap-2 rounded-md text-[11px] font-extrabold text-[var(--green)] transition-colors duration-[160ms] hover:text-[var(--orange)]" to="/venue">
                  Lihat venue pertandingan <ArrowIcon diagonal />
                </Link> */}
              </div>
            </div>



          </div>
        </section>

        <section className="relative min-h-[355px] overflow-hidden bg-[var(--orange)] text-white max-[620px]:min-h-[330px]">
          <div className="closing-pattern" aria-hidden="true" />
          <div className="relative z-[1] mx-auto w-[var(--container-width)] pt-[62px] pb-[65px] max-[900px]:w-[90%] max-[620px]:w-[88%] max-[620px]:pt-[55px] max-[620px]:pb-[55px]">
            <p className="mb-6 flex items-center gap-[10px] text-[clamp(10px,0.9vw,14px)] font-extrabold uppercase tracking-[0.15em] text-white [&>span]:bg-[var(--lime)]">
              <span className="size-[7px] rounded-full shadow-[0_0_14px_rgba(211,237,113,0.75)]" />
              Menuju PORPROV XIII KALIMANTAN TENGAH 2026
            </p>
            <h2 className="mt-0 mb-[26px] text-[clamp(28px,6vw,84px)] font-black leading-[0.98] tracking-[-0.06em] [&>span]:text-[var(--lime)]">
              Bersama kita
              <br />
              <span>jadi juara.</span>
            </h2>
            <a className="inline-flex min-h-[49px] items-center justify-center gap-[18px] rounded-md bg-[var(--lime)] px-5 text-[clamp(11px,0.95vw,15px)] font-extrabold text-[#102b49] transition-[transform,background] duration-[160ms] hover:-translate-y-0.5 hover:bg-[#c6e2f5] max-[620px]:min-h-[45px] max-[620px]:px-[15px]" href="#beranda">
              Kembali ke atas
            </a>
          </div>
          <span className="absolute right-[8%] bottom-[-73px] text-[clamp(140px,35vw,440px)] font-black leading-none tracking-[-0.12em] text-white/10 max-[620px]:right-0 max-[620px]:bottom-[-32px]" aria-hidden="true">
            XIII
          </span>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
