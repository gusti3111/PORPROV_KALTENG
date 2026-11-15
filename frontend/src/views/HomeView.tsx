import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import ArrowIcon from "../components/ArrowIcon";
import EventCountdown from "../components/EventCountdown";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { EVENT_START_LABEL } from "../event-config";
import { useCompetitionStore } from "../stores/competitionStore";
import { getSportEmblemInfo } from "../utils/sportEmblem";

const featuredStadiums = [
  {
    category: "GOR SPORT CENTER",
    venue: "GOR Sport Center Ratu Alamsyah",
    address: "Jl. Samudra, Madurejo, Kec. Arut Selatan, Kab. Kotawaringin Barat",
    capacity: "1.500",
    caborCount: "2 cabang",
    facilityNote: "Bola Voli Indoor & Futsal",
    image: "/venues2/gorSportCenter.jpeg",
  },
  {
    category: "LAPANGAN TREK LARI",
    venue: "Lintasan Atletik Sport Center",
    address: "Kawasan Sport Center, Madurejo, Kec. Arut Selatan, Kab. Kotawaringin Barat",
    capacity: "2.000",
    caborCount: "1 cabang",
    facilityNote: "Lintasan Lari & Lapangan Atletik",
    image: "/venues2/LintasanAtletik.jpeg",
  },
  {
    category: "STADION",
    venue: "Stadion Sepak Bola Sport Center",
    address: "Kawasan Sport Center, Madurejo, Kec. Arut Selatan, Kab. Kotawaringin Barat",
    capacity: "5.000",
    caborCount: "1 cabang",
    facilityNote: "Stadion Utama Sepak Bola",
    image: "/venues2/sportCenter.jpg",
  },
];

const fallbackFeaturedSports = [
  {
    id: 27,
    name: "Sepak Bola",
    category: "Cabang Utama",
    description: "Pertandingan sepak bola putra antar kabupaten/kota se-Kalimantan Tengah.",
  },
  {
    id: 9,
    name: "Bola Voli",
    category: "Cabang Utama",
    description: "Nomor pertandingan bola voli indoor putra dan putri di GOR Sport Center.",
  },
  {
    id: 2,
    name: "Atletik",
    category: "Cabang Utama",
    description: "Nomor lari, lompat, dan lempar pada lintasan atletik standar provinsi.",
  },
];

const featuredGallery = [
  {
    title: "GOR Basket Indoor Pangkalan Bun",
    category: "Venue",
    image: "/galeri/gor-basket-indoor.jpg",
  },
  {
    title: "Arena Panjat Tebing PORPROV XIII",
    category: "Venue",
    image: "/galeri/arena-panjat-tebing.jpg",
  },
  {
    title: "Lapangan Tenis Kota Manis",
    category: "Venue",
    image: "/galeri/lapangan-tenis-kota-manis.jpg",
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
  {
    id: "fallback-4",
    title: "Pemkab Kobar Resmi Tetapkan Jadwal PORPROV XIII Kalteng 28 November Hingga 8 Desember 2026",
    date: "November 2026",
    category: "JADWAL RESMI",
    excerpt: "Penetapan jadwal resmi pelaksanaan pekan olahraga provinsi di Kotawaringin Barat untuk seluruh cabang olahraga.",
    image: "https://kotawaringinbaratkab.go.id/sites/default/files/2026-11/jadwal.jpeg",
  },
  {
    id: "fallback-5",
    title: "Kesiapan Venue dan Infrastruktur Pendukung PORPROV XIII Terus Dimatangkan",
    date: "November 2026",
    category: "PERSIAPAN",
    excerpt: "Pemerintah daerah bersama panitia pelaksana memastikan seluruh arena pertandingan siap menyambut kontingen se-Kalimantan Tengah.",
    image: "https://mmc.kotawaringinbaratkab.go.id/assets/foto_berita/6d322bc14b14ff1d2b16850108b94062.jpg",
  },
];

function stripHtmlTags(raw: string): string {
  if (!raw) return "";
  const decoded = raw
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&ndash;/g, "–")
    .replace(/&nbsp;/g, " ");
  return decoded
    .replace(/<[^>]*>?/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function HomeView() {
  const [latestNews, setLatestNews] = useState<HomeNewsCard[]>(fallbackNewsCards);
  const sports = useCompetitionStore((state) => state.sports);

  useEffect(() => {
    void useCompetitionStore.getState().fetchSports();
  }, []);

  const featuredSports = (sports.length > 0 ? sports.slice(0, 3) : fallbackFeaturedSports);

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
        const items = Array.isArray(json.data) ? json.data.slice(0, 5) : [];
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
                ? `https://mmc.kotawaringinbaratkab.go.id/assets/foto_berita/${item.filename1}`
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
                DI KOTAWARINGIN BARAT
              </span>
            </h1>
            <p className="mt-7 ml-[5px] max-w-[390px] xl:max-w-[480px] 2xl:max-w-[620px] min-[2560px]:max-w-[800px] text-[clamp(12px,1.15vw,21px)] leading-[1.85] text-white/75 max-[620px]:max-w-[340px]">
              Satu dukungan, sejuta semangat untuk prestasi Kalimantan Tengah
            </p>
            <div className="mt-[29px] ml-[5px] flex items-center gap-[25px] max-[620px]:flex-wrap max-[620px]:gap-x-5 max-[620px]:gap-y-[14px]">
              {/* <a className="inline-flex min-h-[49px] items-center justify-center gap-[18px] rounded-md bg-[var(--lime)] px-5 text-[clamp(11px,0.95vw,15px)] font-extrabold text-[#102b49] transition-[transform,background] duration-[160ms] hover:-translate-y-0.5 hover:bg-[#c6e2f5] max-[620px]:min-h-[45px] max-[620px]:px-[15px]" href="#tentang">
                Jelajahi PORPROV <ArrowIcon />
              </a> */}
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
              <span>1</span> KALTENG BERPRESTASI
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
          className="relative mx-auto mt-10 mb-14 grid w-[var(--container-width)] grid-cols-[1fr_auto] items-center gap-x-[30px] gap-y-3 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-6 shadow-[var(--ui-shadow)] max-[900px]:w-[90%] max-[620px]:mt-[25px] max-[620px]:mb-10 max-[620px]:w-[88%] max-[620px]:grid-cols-1 max-[620px]:gap-4 max-[620px]:p-5 max-[620px]:rounded-[10px]"
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
        <section className="home-stadium-section mt-12" aria-labelledby="home-stadium-title">
          <div className="home-stadium-heading">
            <div>
              <p className="home-stadium-kicker"><span>1</span> GALERI VENUE</p>
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
            {featuredStadiums.slice(0, 3).map((item) => {
              const venueTarget = `/venue?venue=${encodeURIComponent(item.venue)}`;
              return (
                <Link
                  to={venueTarget}
                  className="group flex flex-col overflow-hidden rounded-2xl border-2 border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-[var(--ui-shadow)] transition-all duration-200 hover:-translate-y-1 hover:border-[var(--green)] no-underline text-inherit"
                  key={item.venue}
                  aria-label={`Lihat detail ${item.venue} di halaman Venue`}
                >
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900/10">
                    {item.image ? (
                      <img
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
                      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs font-medium text-slate-400">
                        Foto belum tersedia
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="m-0 text-lg font-extrabold leading-snug tracking-[-0.02em] text-[var(--ink)] transition-colors group-hover:text-[var(--green)]">
                      {item.venue}
                    </h3>
                    <div className="mt-2.5 flex items-start gap-2 text-xs leading-relaxed text-[var(--muted)]">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--green)]" aria-hidden="true" />
                      <span>{item.address}</span>
                    </div>

                    <div className="mt-auto pt-4">
                      <div className="grid grid-cols-2 gap-4 border-t-2 border-[var(--ui-border)] pt-4">

                        <div>
                          <div className="text-[10px] font-bold tracking-wider text-[var(--muted)] uppercase">
                            CABOR
                          </div>
                          <div className="mt-0.5 text-sm font-extrabold text-[var(--ink)]">
                            {item.caborCount}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 border-t-2 border-[var(--ui-border)] pt-3 text-xs text-[var(--muted)]">
                        {item.facilityNote}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* End Arrow Link: Venue Page */}
            <Link
              to="/venue"
              aria-label="Lihat semua venue di halaman Venue"
              className="group flex md:flex-col items-center justify-center gap-3 rounded-2xl px-5 py-4 bg-[image:var(--hero-gradient)] text-white border-2 border-dashed border-amber-300/50 hover:border-amber-300 transition-all text-center no-underline md:min-w-[130px]"
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

        {/*  Cabang Olahraga Unggulan  */}
        <section className="home-stadium-section border-t-2 border-[var(--ui-border)] pt-12 max-[620px]:pt-9" aria-labelledby="home-cabor-title">
          <div className="home-stadium-heading">
            <div>
              <p className="home-stadium-kicker"><span>2</span> CABANG OLAHRAGA</p>
              <h2 id="home-cabor-title">Cabang Olahraga yang dipertandingkan </h2>
              <p className="home-stadium-description">
                Jelajahi cabang olahraga yang dipertandingkan pada PORPROV XIII Kalimantan Tengah.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/cabor"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
              >
                Semua Cabor
                <ArrowIcon diagonal />
              </Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-[repeat(3,minmax(0,1fr))_auto] items-stretch">
            {featuredSports.map((sport) => {
              const emblem = getSportEmblemInfo(sport.id, sport.name);
              return (
                <Link
                  to={sport.id ? `/cabor/${sport.id}` : "/cabor"}
                  className="group flex flex-col overflow-hidden rounded-2xl border-2 border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-[var(--ui-shadow)] transition-all duration-200 hover:-translate-y-1 hover:border-[var(--green)] no-underline text-inherit"
                  key={`${sport.id}-${sport.name}`}
                  aria-label={`Lihat detail cabang olahraga ${sport.name}`}
                >
                  <div className="relative flex h-48 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#0e3a2b] via-[#14533c] to-[#0c2d48] p-6">
                    {emblem?.pictogramUrl && (
                      <img
                        src={emblem.pictogramUrl}
                        alt=""
                        aria-hidden="true"
                        className="pointer-events-none absolute h-40 w-40 object-contain opacity-15 brightness-0 invert"
                        loading="lazy"
                      />
                    )}
                    {emblem?.emblemUrl ? (
                      <img
                        src={emblem.emblemUrl}
                        alt={`Logo ${sport.name}`}
                        className="relative z-10 h-28 w-28 object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="relative z-10 text-3xl font-black text-white">
                        {sport.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="m-0 text-lg font-extrabold leading-snug tracking-[-0.02em] text-[var(--ink)] transition-colors group-hover:text-[var(--green)]">
                      {sport.name}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                      {emblem?.federationName || "Cabang Olahraga Resmi PORPROV XIII"}
                    </p>

                    <div className="mt-auto pt-4">
                      <div className="grid grid-cols-2 gap-4 border-t-2 border-[var(--ui-border)] pt-4">
                        <div>
                          <div className="text-[10px] font-bold tracking-wider text-[var(--muted)] uppercase">
                            KATEGORI
                          </div>
                          <div className="mt-0.5 text-sm font-extrabold text-[var(--ink)]">
                            {sport.category}
                          </div>
                        </div>
                        <div>
                          {/* <div className="text-[10px] font-bold tracking-wider text-[var(--muted)] uppercase">
                            FEDERASI
                          </div>
                          <div className="mt-0.5 text-sm font-extrabold text-[var(--ink)]">
                            {emblem?.federationCode || "KONI"}
                          </div> */}
                        </div>
                      </div>

                      <div className="mt-3 border-t-2 border-[var(--ui-border)] pt-3 text-xs text-[var(--muted)] line-clamp-2">
                        {sport.description}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* End Arrow Link: Cabor Page */}
            <Link
              to="/cabor"
              aria-label="Lihat semua cabang olahraga di halaman Cabor"
              className="group flex md:flex-col items-center justify-center gap-3 rounded-2xl px-5 py-4 bg-[image:var(--hero-gradient)] text-white border-2 border-dashed border-amber-300/50 hover:border-amber-300 transition-all text-center no-underline md:min-w-[130px]"
            >
              {/* <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-lg transition-transform duration-200 group-hover:translate-x-1 group-hover:scale-105">
                <ArrowRight className="h-6 w-6" />
              </span> */}
              <span className="text-xs font-extrabold text-white leading-tight">
                Semua Cabor
              </span>
            </Link>
          </div>
        </section>



        {/* Narasi & Maskot Sepak Bola di bawah Galeri */}
        <section className="mx-auto w-[var(--container-width)] border-t-2 border-[var(--ui-border)] py-12 max-[900px]:w-[90%] max-[620px]:w-[88%] max-[620px]:py-9">
          <div className="grid grid-cols-[1fr_1fr] items-center gap-[8%] rounded-2xl border-2 border-[var(--ui-border)] bg-[var(--ui-surface)] p-6 sm:p-8 lg:p-10 max-[900px]:gap-[5%] max-[620px]:grid-cols-1 max-[620px]:gap-[20px]">
            <div>
              <h2 className="m-0 text-[clamp(18px,2vw,28px)] font-bold leading-[1.25] tracking-[-0.02em] [&>span]:text-[var(--green)]">
                Semangat Juara di Setiap Laga,
                <br />
                <span>Bersatu Menuju Prestasi Terbaik</span>
              </h2>
              <p className="mt-3 mb-0 max-w-[520px] xl:max-w-[560px] 2xl:max-w-[640px] min-[2560px]:max-w-[800px] text-[clamp(11px,0.95vw,16px)] leading-[1.75] text-[var(--muted)]">
                PORPROV XIII Kalimantan Tengah 2026 menjadi panggung bagi para atlet terbaik daerah untuk menunjukkan sportivitas dan daya juang di setiap cabang olahraga. Mari dukung langsung tim kebanggaan Anda dan ikuti setiap momen pertandingan yang berlangsung di Kotawaringin Barat.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <Link
                  className="inline-flex items-center gap-2 rounded-md text-[clamp(11px,1vw,16px)] font-extrabold text-[var(--green)] transition-colors duration-[160ms] hover:text-[var(--orange)]"
                  to="/jadwal"
                >
                  Lihat Jadwal Pertandingan <ArrowIcon diagonal />
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center p-2">
              <img
                src="/kera-bola.png"
                alt="Maskot PORPROV XIII Kalimantan Tengah memakai jersey bola sedang menendang bola"
                className="w-full max-w-[340px] h-auto object-contain drop-shadow-lg transition-transform duration-300 hover:scale-[1.02]"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </section>





        {/*  Galeri Foto PORPROV XIII  */}
        <section className="home-stadium-section border-t-2 border-[var(--ui-border)] pt-12 max-[620px]:pt-9" aria-labelledby="home-gallery-title">
          <div className="home-stadium-heading">
            <div>
              <p className="home-stadium-kicker"><span>3</span> GALERI FOTO</p>
              <h2 id="home-gallery-title">Galeri PORPROV XIII</h2>
              <p className="home-stadium-description">
                Dokumentasi foto arena dan momen kegiatan PORPROV XIII Kalimantan Tengah.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/informasi?tab=galeri"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
              >
                Semua Galeri
                <ArrowIcon diagonal />
              </Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-[repeat(3,minmax(0,1fr))_auto] items-stretch">
            {featuredGallery.map((item) => (
              <Link
                to="/informasi?tab=galeri"
                className="news-gallery-card group block rounded-2xl no-underline"
                key={item.title}
                aria-label={`${item.category}: ${item.title}`}
              >
                <img
                  className="news-gallery-image"
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                />
                <div className="news-gallery-copy">
                  <span>{item.category}</span>
                  <h3 className="mt-1.5 text-lg font-bold leading-snug text-white">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}

            {/* End Arrow Link: Galeri Page */}
            <Link
              to="/informasi?tab=galeri"
              aria-label="Lihat semua foto di halaman Galeri"
              className="group flex md:flex-col items-center justify-center gap-3 rounded-2xl px-5 py-4 bg-[image:var(--hero-gradient)] text-white border-2 border-dashed border-amber-300/50 hover:border-amber-300 transition-all text-center no-underline md:min-w-[130px]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-lg transition-transform duration-200 group-hover:translate-x-1 group-hover:scale-105">
                <ArrowRight className="h-6 w-6" />
              </span>
              <span className="text-xs font-extrabold text-white leading-tight">
                Semua Galeri
              </span>
            </Link>
          </div>
        </section>
        {/*  Berita Terkini  */}
        <section
          className="home-stadium-section border-t-2 border-[var(--ui-border)] pt-12 max-[620px]:pt-9"
          aria-labelledby="home-news-title"
        >
          <div className="flex items-start justify-between gap-4 mb-10 max-md:flex-col">
            <div>
              <p className="home-stadium-kicker">
                <span>4</span> BERITA TERKINI
              </p>
              <h2
                id="home-news-title"
                className="mt-2.5 text-[clamp(22px,3.2vw,42px)] font-extrabold tracking-[-0.04em] leading-[1.15]"
              >
                Berita PORPROV XIII
              </h2>
              <p className="home-stadium-description">
                Informasi berita terkait jalannya acara PORPROV XIII Kalimantan Tengah.
              </p>
            </div>
            <Link
              to="/informasi?tab=berita"
              className="inline-flex items-center gap-2 text-base font-bold text-[var(--green)] px-3 py-2 rounded-[15px] whitespace-nowrap hover:opacity-80 transition-opacity no-underline"
            >
              Lihat Lainnya
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>

          {latestNews.length > 0 && (
            <div className="grid grid-cols-[856fr_416fr] gap-8 mb-8 max-lg:grid-cols-1">
              {/* Featured Card 1 */}
              {(() => {
                const featured = latestNews[0];
                return (
                  <Link
                    to="/informasi?tab=berita"
                    key={featured.id}
                    aria-label={`Baca berita ${featured.title}`}
                    className="block relative rounded-[15px] overflow-hidden h-[460px] max-md:h-[300px] no-underline group bg-gradient-to-br from-[#3a5a6e] to-[#2a4050]"
                  >
                    <img
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      src={featured.image}
                      alt={featured.title}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fallback = fallbackNewsCards[0]?.image;
                        if (fallback && target.src !== fallback) {
                          target.src = fallback;
                        } else {
                          target.style.display = "none";
                        }
                      }}
                    />
                    <div className="absolute inset-0 berita-gradient rounded-[15px] flex flex-col justify-end p-8 max-md:p-5">
                      <div className="flex flex-wrap gap-4 items-center">
                        <span className="font-bold text-sm text-white uppercase tracking-wide">
                          {featured.category}
                        </span>
                        <span className="font-bold text-sm text-white flex items-center gap-2">
                          <Calendar className="h-4 w-4" aria-hidden="true" />
                          {featured.date}
                        </span>
                      </div>
                      <h3 className="font-bold text-2xl max-md:text-xl text-white leading-[1.2] mt-3 line-clamp-3 drop-shadow-[0_3px_10px_rgba(0,0,0,0.2)]">
                        {featured.title}
                      </h3>
                      {featured.excerpt && (
                        <p className="font-normal text-sm text-white/85 leading-6 line-clamp-2 mt-2">
                          {featured.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })()}

              {/* Secondary Top Card 2 */}
              {latestNews[1] && (() => {
                const second = latestNews[1];
                return (
                  <Link
                    to="/informasi?tab=berita"
                    key={second.id}
                    aria-label={`Baca berita ${second.title}`}
                    className="flex flex-col gap-5 no-underline group hover:-translate-y-1 transition-transform text-inherit"
                  >
                    <div className="relative rounded-[15px] overflow-hidden h-[265px] max-md:h-[200px] bg-gradient-to-br from-[#3a5a6e] to-[#2a4050]">
                      <img
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        src={second.image}
                        alt={second.title}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const fallback = fallbackNewsCards[1]?.image;
                          if (fallback && target.src !== fallback) {
                            target.src = fallback;
                          } else {
                            target.style.display = "none";
                          }
                        }}
                      />
                      <div className="absolute inset-0 berita-gradient rounded-[15px] flex flex-col justify-end p-4">
                        <div className="flex flex-wrap gap-3 items-center">
                          <span className="font-bold text-xs text-white uppercase tracking-wide">
                            {second.category}
                          </span>
                          <span className="font-bold text-xs text-white flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                            {second.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl leading-[1.25] line-clamp-3 group-hover:text-[var(--green)] transition-colors">
                        {second.title}
                      </h3>
                      {second.excerpt && (
                        <p className="font-normal text-sm text-[var(--muted)] leading-6 line-clamp-2 mt-2">
                          {second.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })()}
            </div>
          )}

          {/* Bottom 3-Column News Grid */}
          {latestNews.length > 2 && (
            <div className="grid grid-cols-3 gap-8 max-lg:grid-cols-2 max-md:grid-cols-1">
              {latestNews.slice(2, 5).map((news, idx) => (
                <Link
                  to="/informasi?tab=berita"
                  key={news.id}
                  aria-label={`Baca berita ${news.title}`}
                  className="flex flex-col gap-5 no-underline group hover:-translate-y-1 transition-transform text-inherit"
                >
                  <div className="relative rounded-[15px] overflow-hidden h-[300px] max-md:h-[220px] bg-gradient-to-br from-[#3a5a6e] to-[#2a4050]">
                    <img
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      src={news.image}
                      alt={news.title}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fallback = fallbackNewsCards[idx + 2]?.image;
                        if (fallback && target.src !== fallback) {
                          target.src = fallback;
                        } else {
                          target.style.display = "none";
                        }
                      }}
                    />
                    <div className="absolute inset-0 berita-gradient rounded-[15px] flex flex-col justify-end p-4">
                      <div className="flex flex-wrap gap-3 items-center">
                        <span className="font-bold text-xs text-white uppercase tracking-wide">
                          {news.category}
                        </span>
                        <span className="font-bold text-xs text-white flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                          {news.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl leading-[1.25] line-clamp-3 group-hover:text-[var(--green)] transition-colors">
                      {news.title}
                    </h3>
                    {news.excerpt && (
                      <p className="font-normal text-sm text-[var(--muted)] leading-6 line-clamp-2 mt-2">
                        {news.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section id="kuliner" className="mx-auto w-[var(--container-width)] border-t-2 border-[var(--ui-border)] py-14 max-[900px]:w-[90%] max-[620px]:w-[88%] max-[620px]:py-9">
          <div className="rounded-2xl border-2 border-[var(--ui-border)] bg-[var(--ui-surface)] p-6 sm:p-8 lg:p-10">
            <div className="flex items-center gap-[12px] text-[clamp(22px,2.8vw,15px)] font-extrabold tracking-[-0.02em] text-[#596156] [&>span:first-child]:text-[var(--orange)]">
              <span>5</span>
              <span>Sentra Kuliner dan Restoran </span>
            </div>

            <div className="mt-4 grid grid-cols-[1fr_1fr] items-center gap-[8%] max-[900px]:gap-[5%] max-[620px]:grid-cols-1 max-[620px]:gap-[20px]">
              <div className="flex items-center justify-center p-2">
                <img
                  src="/maskot-kuliner.png"
                  alt="Maskot PORPROV XIII Kalimantan Tengah menikmati kuliner khas Coto Manggala"
                  className="w-full max-w-[380px] h-auto object-contain drop-shadow-lg transition-transform duration-300 hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
              <div>
                <h2 className="m-0 text-[clamp(18px,2vw,28px)] font-bold leading-[1.25] tracking-[-0.02em] [&>span]:text-[var(--green)]">
                  Untuk apa memperebutkan semangkuk coto,
                  <br />
                  <span>kita bisa temukan jauh lebih banyak di sini </span>
                </h2>
                <p className="mt-3 mb-0 max-w-[520px] xl:max-w-[560px] 2xl:max-w-[640px] min-[2560px]:max-w-[800px] text-[clamp(11px,0.95vw,16px)] leading-[1.75] text-[var(--muted)]">
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
          </div>
        </section>
        <section id="wisata" className="mx-auto w-[var(--container-width)] border-t-2 border-[var(--ui-border)] py-14 max-[900px]:w-[90%] max-[620px]:w-[88%] max-[620px]:py-9">
          <div className="rounded-2xl border-2 border-[var(--ui-border)] bg-[var(--ui-surface)] p-6 sm:p-8 lg:p-10">
            <div className="flex items-center gap-[13px] text-[clamp(22px,2.8vw,15px)] font-extrabold tracking-[-0.02em] text-[#596156] [&>span:first-child]:text-[var(--orange)]">
              <span>6</span>
              <span>Tempat Wisata </span>
            </div>

            <div className="mt-4 grid grid-cols-[1fr_1fr] items-center gap-[8%] max-[900px]:gap-[5%] max-[620px]:grid-cols-1 max-[620px]:gap-[20px]">
              <div>
                <h2 className="m-0 text-[clamp(18px,2vw,28px)] font-bold leading-[1.25] tracking-[-0.02em] [&>span]:text-[var(--green)]">
                  Setelah kenyang perut
                  <br />
                  <span>Yuk Jalan-jalan</span>
                </h2>
                <p className="mt-3 mb-0 max-w-[520px] xl:max-w-[560px] 2xl:max-w-[640px] min-[2560px]:max-w-[800px] text-[clamp(11px,0.95vw,16px)] leading-[1.75] text-[var(--muted)]">
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
                  className="w-full max-w-[380px] h-auto object-contain drop-shadow-lg transition-transform duration-300 hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>


            </div>
          </div>
        </section>

        <section id="penginapan" className="mx-auto w-[var(--container-width)] border-t-2 border-[var(--ui-border)] py-14 max-[900px]:w-[90%] max-[620px]:w-[88%] max-[620px]:py-9">
          <div className="rounded-2xl border-2 border-[var(--ui-border)] bg-[var(--ui-surface)] p-6 sm:p-8 lg:p-10">
            <div className="flex items-center gap-[13px] text-[clamp(22px,2.8vw,15px)] font-extrabold tracking-[-0.02em] text-[#596156] [&>span:first-child]:text-[var(--orange)]">
              <span>7</span>
              <span>Hotel dan Penginapan </span>
            </div>

            <div className="mt-4 grid grid-cols-[1fr_1fr] items-center gap-[8%] max-[900px]:gap-[5%] max-[620px]:grid-cols-1 max-[620px]:gap-[20px]">
              <div className="flex items-center justify-center p-2">
                <img
                  src="/keraHotel.png"
                  alt="Maskot PORPROV XIII Kalimantan Tengah menikmati kuliner khas Coto Manggala"
                  className="w-full max-w-[380px] h-auto object-contain drop-shadow-lg transition-transform duration-300 hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
              <div>
                <h2 className="m-0 text-[clamp(18px,2vw,28px)] font-bold leading-[1.25] tracking-[-0.02em] [&>span]:text-[var(--green)]">
                  Udah Capek Jalan-jalannya
                  <br />
                  <span>Jangan Khawatir,kita ada tempat penginapan yang nyaman</span>
                </h2>
                <p className="mt-3 mb-0 max-w-[520px] xl:max-w-[560px] 2xl:max-w-[640px] min-[2560px]:max-w-[800px] text-[clamp(11px,0.95vw,16px)] leading-[1.75] text-[var(--muted)]">
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
          </div>
        </section>
        {/* caroussel cabor */}

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
