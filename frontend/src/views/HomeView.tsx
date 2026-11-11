import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Hotel,
  MapPin,
  Sparkles,
  Star,
  Trophy,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ArrowIcon from "../components/ArrowIcon";
import EventCountdown from "../components/EventCountdown";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { EVENT_START_LABEL } from "../event-config";
import { useCompetitionStore } from "../stores/competitionStore";
import { kobarUMKMData } from "../data/umkmKobarData";
import { hotelData } from "../data/hotelKobarData";
import { wisataKobarData } from "../data/wisataKobarData";

function getTodaysDate(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  return new Intl.DateTimeFormat("en-CA", options).format(now);
}

const featuredStadiums = [
  {
    category: "KOMPLEKS UTAMA",
    venue: "Sport Center Pangkalan Bun",
    city: "Madurejo, Kotawaringin Barat",
    cabor: "Upacara Pembukaan & Penutupan, Grass Track, Voli Pantai, Drumband, Korfball, Panahan, Sepatu Roda & Skateboard",
    image: "/venues/sport-center.webp",
  },
  {
    category: "STADION SEPAK BOLA",
    venue: "Stadion Sepak Bola Sport Center",
    city: "Madurejo, Kotawaringin Barat",
    cabor: "Cabang Olahraga Sepak Bola",
    image: "/venues/sport-center.webp",
  },
  {
    category: "GELANGGANG OLAHRAGA",
    venue: "GOR Sport Center Ratu Alamsyah",
    city: "Madurejo, Kotawaringin Barat",
    cabor: "Bola Voli Indoor & Futsal",
    image: "/venues/sport-center.webp",
  },
  {
    category: "GELANGGANG OLAHRAGA",
    venue: "GOR KONI Kotawaringin Barat",
    city: "Sidorejo, Pangkalan Bun",
    cabor: "Cabang Olahraga Bulutangkis",
    image: "/venues/gor-koni.jpg",
  },
  {
    category: "ARENA PERAIRAN",
    venue: "Kampung Sega Sungai Arut",
    city: "Mendawai, Pangkalan Bun",
    cabor: "Dayung (Canoeing, Traditional Boat Race, & Ergometer)",
    image: "/venues/sungai-arut.jpg",
  },
  {
    category: "ARENA TERBUKA",
    venue: "Pangkalan Bun Park",
    city: "Madurejo, Pangkalan Bun",
    cabor: "MMA & Panjat Tebing",
    image: "/venues/pangkalan-bun-park.jpg",
  },
  {
    category: "CAGAR BUDAYA & TRADISIONAL",
    venue: "Desa Adat Pasir Panjang",
    city: "Pasir Panjang, Arut Selatan",
    cabor: "Sumpitan, Balogo & Cabor Tradisional",
    image: "/venues/pasir-panjang.jpg",
  },
  {
    category: "ARENA TERBUKA & DIRGANTARA",
    venue: "Karanganyar Pangkalan Bun",
    city: "Karang Anyar, Arut Selatan",
    cabor: "Aerosport (Paramotor & Paralayang)",
    image: "/venues/karanganyar.jpg",
  },
  {
    category: "ARENA JALAN RAYA",
    venue: "Koridor Jalan Utama Pangkalan Bun",
    city: "Pangkalan Bun, Kotawaringin Barat",
    cabor: "Balap Sepeda (Road Bike & Mountain Bike)",
    image: "/venues/koridor-trans-kalimantan.jpg",
  },
  {
    category: "AKUATIK & SIRKUIT",
    venue: "Kolam Renang Isen Mulang & Sirkuit Sabaru",
    city: "Kota Palangka Raya",
    cabor: "Akuatik & Bermotor (Motoprix)",
    image: "/venues/sport-center.webp",
  },
];

const featuredCaborList = [
  {
    name: "Sepak Bola",
    category: "BOLA BESAR & PRESTISE",
    venue: "Stadion Sepak Bola Sport Center",
    city: "Madurejo, Pangkalan Bun",
    desc: "Perebutan medali emas paling bergengsi antarkabupaten/kota se-Kalimantan Tengah.",
    image: "/cabor/sepak-bola.svg",
    color: "from-emerald-700 via-teal-800 to-slate-900",
  },
  {
    name: "Atletik",
    category: "INDUK SEMUA CABOR",
    venue: "Lintasan Atletik Sport Center",
    city: "Madurejo, Pangkalan Bun",
    desc: "Lari cepat (sprint), estafet, lompat jauh, lompat tinggi, dan tolak peluru.",
    image: "/cabor/atletik.svg",
    color: "from-amber-700 via-orange-800 to-slate-900",
  },
  {
    name: "Bulutangkis",
    category: "RAKET & KELINCAHAN",
    venue: "GOR KONI Kotawaringin Barat",
    city: "Sidorejo, Pangkalan Bun",
    desc: "Tunggal putra/putri, ganda, dan beregu dengan atmosfer suporter meriah.",
    image: "/cabor/bulutangkis.svg",
    color: "from-blue-700 via-indigo-800 to-slate-900",
  },
  {
    name: "Akuatik / Renang",
    category: "OLAHRAGA PERAIRAN",
    venue: "Kolam Renang Isen Mulang",
    city: "Palangka Raya (Venue Afiliasi)",
    desc: "Gaya bebas, dada, punggung, dan kupu-kupu standar resmi perlombaan PRSI.",
    image: "/cabor/akuatik.svg",
    color: "from-cyan-700 via-blue-800 to-slate-900",
  },
  {
    name: "Dayung (TBR & Kayak)",
    category: "TRADISI PERAIRAN KALTENG",
    venue: "Kampung Sega Sungai Arut",
    city: "Mendawai, Pangkalan Bun",
    desc: "Adu cepat di atas aliran Sungai Arut: Traditional Boat Race, Kayak & Kano.",
    image: "/cabor/dayung.svg",
    color: "from-sky-700 via-blue-900 to-slate-900",
  },
  {
    name: "Panahan",
    category: "FOKUS & AKURASI",
    venue: "Lapangan Panahan Sport Center",
    city: "Madurejo, Pangkalan Bun",
    desc: "Divisi Recurve, Compound, dan Nasional di arena terbuka standar kompetisi.",
    image: "/cabor/panahan.svg",
    color: "from-green-700 via-emerald-800 to-slate-900",
  },
  {
    name: "Pencak Silat",
    category: "BELADIRI TRADISIONAL",
    venue: "Gedung Serbaguna Antakusuma",
    city: "Pusat Kota Pangkalan Bun",
    desc: "Seni tunggal, ganda, regu, serta tanding penuh teknik warisan leluhur.",
    image: "/cabor/pencak-silat.svg",
    color: "from-rose-700 via-red-900 to-slate-900",
  },
  {
    name: "Bola Voli & Pasir",
    category: "KERJASAMA TIM & SMASH",
    venue: "GOR Ratu Alamsyah & Sport Center",
    city: "Madurejo, Pangkalan Bun",
    desc: "Persaingan sengit bola voli indoor dan voli pantai dengan antusiasme penonton tinggi.",
    image: "/cabor/bola-voli.svg",
    color: "from-violet-700 via-purple-900 to-slate-900",
  },
  {
    name: "Bermotor (Balap Motor)",
    category: "ADRENALIN & KECEPATAN",
    venue: "Sirkuit Balap Motor Sabaru",
    city: "Palangka Raya & Road Race Kobar",
    desc: "Adu kecepatan kelas bebek 150cc dan matic standar kejuaraan provinsi.",
    image: "/cabor/bermotor.svg",
    color: "from-zinc-700 via-stone-800 to-slate-900",
  },
  {
    name: "Taekwondo & Karate",
    category: "BELADIRI PRESTASI",
    venue: "Gedung Olahraga Pangkalan Bun",
    city: "Arut Selatan, Kotawaringin Barat",
    desc: "Kategori Kyorugi (tarung) dan Poomsae (jurus) atlet terbaik se-Kalteng.",
    image: "/cabor/taekwondo.svg",
    color: "from-teal-700 via-cyan-900 to-slate-900",
  },
];

export default function HomeView() {
  const stadiumTrackRef = useRef<HTMLDivElement>(null);
  const caborTrackRef = useRef<HTMLDivElement>(null);
  const umkmTrackRef = useRef<HTMLDivElement>(null);
  const hotelTrackRef = useRef<HTMLDivElement>(null);
  const wisataTrackRef = useRef<HTMLDivElement>(null);

  const sports = useCompetitionStore((state) => state.sports);
  const loadingSports = useCompetitionStore((state) => state.loading.sports);
  const sportsError = useCompetitionStore((state) => state.errors.sports);
  const fetchSports = useCompetitionStore((state) => state.fetchSports);

  const featuredUMKMList = useMemo(() => {
    return kobarUMKMData
      .filter((u) => u.recommended && u.rating_google >= 4.5 && u.image)
      .slice(0, 8);
  }, []);

  const featuredHotelList = useMemo(() => hotelData, []);
  const featuredWisataList = useMemo(() => wisataKobarData, []);

  useEffect(() => {
    void fetchSports();
  }, [fetchSports]);

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
            <p className="mb-6 flex items-center gap-[10px] text-[10px] font-extrabold uppercase tracking-[0.15em] text-[var(--lime)]">
              <span className="size-[7px] rounded-full bg-[var(--lime)] shadow-[0_0_14px_rgba(220,236,249,0.75)]" />
              Panggung prestasi Kalimantan Tengah
            </p>
            <h1 className="m-0 text-[clamp(72px,9.5vw,142px)] font-black leading-[0.84] tracking-[-0.105em] max-[900px]:text-[clamp(67px,11vw,100px)] max-[620px]:text-[clamp(76px,20vw,114px)]">
              PORPROV XIII
              <span className="mt-[21px] ml-[6px] flex items-center gap-[18px] text-[clamp(33px,4vw,55px)] tracking-[-0.055em] max-[620px]:mt-[17px] max-[620px]:text-[39px]">
                KALIMANTAN TENGAH
              </span>
              <span className="mt-[21px] ml-[6px] flex items-center gap-[18px] text-[clamp(33px,4vw,55px)] tracking-[-0.055em] max-[620px]:mt-[17px] max-[620px]:text-[39px]">
                {" "}
                <i className="text-[0.62em] font-semibold not-italic tracking-normal text-[var(--lime)]">
                  2026
                </i>
              </span>
            </h1>
            <p className="mt-7 ml-[5px] max-w-[390px] xl:max-w-[480px] 2xl:max-w-[620px] min-[2560px]:max-w-[800px] text-[14px] xl:text-[16px] 2xl:text-[18px] min-[2560px]:text-[22px] leading-[1.85] text-white/75 max-[620px]:max-w-[340px] max-[620px]:text-[12px]">
              Pekan Olahraga Provinsi Kalimantan Tengah. Satu semangat untuk
              berkompetisi, berprestasi, dan tumbuh bersama.
            </p>
            <div className="mt-[29px] ml-[5px] flex items-center gap-[25px] max-[620px]:flex-wrap max-[620px]:gap-x-5 max-[620px]:gap-y-[14px]">
              <a className="inline-flex min-h-[49px] items-center justify-center gap-[18px] rounded-md bg-[var(--lime)] px-5 text-[11px] font-extrabold text-[#102b49] transition-[transform,background] duration-[160ms] hover:-translate-y-0.5 hover:bg-[#c6e2f5] max-[620px]:min-h-[45px] max-[620px]:px-[15px]" href="#tentang">
                Jelajahi PORPROV <ArrowIcon />
              </a>
              <Link className="rounded-md text-[11px] font-bold text-white/80 hover:text-[var(--lime)]" to="/cabor">
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



          <div className="absolute right-[7.2%] bottom-0 left-[7.2%] flex h-14 items-center gap-4 border-t border-white/20 text-[8px] font-extrabold tracking-[0.15em] text-white/75 max-[620px]:right-[5%] max-[620px]:left-[5%] max-[620px]:gap-2 max-[620px]:text-[7px]">
            <span>SPORTIVITAS</span>
            <span className="text-xs text-[var(--lime)]">✳</span>
            <span>PERSAUDARAAN</span>
            <span className="text-xs text-[var(--lime)]">✳</span>
            <span>PRESTASI</span>
            <span className="ml-auto text-[7px] text-white/50 max-[620px]:hidden">
              KALIMANTAN TENGAH, INDONESIA
            </span>
          </div>
        </section>

        <section
          className="relative mx-auto mt-10 grid w-[var(--container-width)] grid-cols-[1fr_auto] items-center gap-x-[30px] gap-y-3 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-6 shadow-[var(--ui-shadow)] max-[900px]:w-[90%] max-[620px]:mt-[25px] max-[620px]:w-[88%] max-[620px]:grid-cols-1 max-[620px]:gap-4 max-[620px]:p-5 max-[620px]:rounded-[10px]"
          aria-labelledby="countdown-title"
        >
          <div>
            <p className="mb-[5px] text-[8px] font-extrabold tracking-[0.15em] text-[var(--green)]">HITUNG MUNDUR</p>
            <h2 id="countdown-title" className="m-0 text-[19px] font-extrabold tracking-[-0.04em]">Menuju pembukaan</h2>
            <p className="mt-[6px] mb-0 text-[10px] text-[var(--muted)]">{EVENT_START_LABEL}</p>
          </div>
          <EventCountdown />
          <p className="col-span-full m-0 text-[8px] text-[var(--muted)] max-[620px]:col-span-1">
            Tanggal sementara, sesuaikan dengan jadwal resmi PORPROV XIII.
          </p>
        </section>

        {/* <section id="tentang" className="mx-auto w-[min(85.6%,1120px)] pt-[108px] pb-[94px] max-[900px]:w-[90%] max-[620px]:w-[88%] max-[620px]:pt-[73px] max-[620px]:pb-[70px]">
          <div className="flex items-center gap-[13px] text-[9px] font-extrabold tracking-[0.16em] text-[#596156] [&>span:first-child]:text-[var(--orange)]">
            <span>01</span>
            <span>TENTANG PORPROV</span>
          </div>
          <div className="mt-[34px] grid grid-cols-[1.15fr_0.85fr] gap-[10%] max-[900px]:gap-[6%] max-[620px]:grid-cols-1 max-[620px]:gap-[27px]">
            <h2 className="m-0 text-[clamp(34px,4.5vw,60px)] font-extrabold leading-[1.08] tracking-[-0.075em] max-[620px]:text-[clamp(37px,10vw,52px)] [&>span]:text-[var(--green)]">
              Lebih dari pertandingan.
              <br />
              <span>Ini tentang kebanggaan.</span>
            </h2>
            <div className="pt-[5px]">
              <p className="m-0 text-[13px] leading-[1.9] text-[var(--muted)]">
                PORPROV XIII Kalimantan Tengah 2026 menjadi ruang bertemunya
                atlet, daerah, dan masyarakat dalam semangat sportivitas.
                Bersama, kita merayakan kerja keras dan potensi olahraga
                Kalimantan Tengah.
              </p>
              <a className="mt-5 inline-flex items-center gap-2 rounded-md text-[11px] font-extrabold text-[var(--green)] transition-colors duration-[160ms] hover:text-[var(--orange)]" href="#informasi">
                Ikuti informasinya <ArrowIcon diagonal />
              </a>
            </div>
          </div>
          <div
            className="mt-[66px] grid grid-cols-3 border-y border-[#dcded4] max-[620px]:mt-10"
            aria-label="Informasi acara"
          >
            <div className="grid gap-2 pt-[23px] pr-5 pb-6 max-[620px]:pt-[18px] max-[620px]:pb-[18px]">
              <strong className="text-[29px] font-black tracking-[-0.06em] text-[var(--green)] max-[620px]:text-[23px]">
                13<span className="ml-[3px] text-xs tracking-normal text-[var(--orange)]">th</span>
              </strong>
              <small className="text-[8px] font-extrabold tracking-[0.12em] text-[var(--muted)] max-[620px]:text-[6px] max-[620px]:leading-[1.5]">EDISI PORPROV</small>
            </div>
            <div className="grid gap-2 border-l border-[#dcded4] pt-[23px] pr-5 pb-6 pl-[30px] max-[620px]:pt-[18px] max-[620px]:pb-[18px] max-[620px]:pl-3">
              <strong className="text-[29px] font-black tracking-[-0.06em] text-[var(--green)] max-[620px]:text-[23px]">2026</strong>
              <small className="text-[8px] font-extrabold tracking-[0.12em] text-[var(--muted)] max-[620px]:text-[6px] max-[620px]:leading-[1.5]">TAHUN PENYELENGGARAAN</small>
            </div>
            <div className="grid gap-2 border-l border-[#dcded4] pt-[23px] pr-5 pb-6 pl-[30px] max-[620px]:pt-[18px] max-[620px]:pb-[18px] max-[620px]:pl-3">
              <strong className="text-[29px] font-black tracking-[-0.06em] text-[var(--green)] max-[620px]:text-[23px]">KALTENG</strong>
              <small className="text-[8px] font-extrabold tracking-[0.12em] text-[var(--muted)] max-[620px]:text-[6px] max-[620px]:leading-[1.5]">SEMANGAT SATU PROVINSI</small>
            </div>
          </div>
        </section> */}

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
                className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
              >
                Semua Venue
                <ArrowIcon diagonal />
              </Link>
              <div className="home-stadium-controls" aria-label="Kontrol carousel venue">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Venue sebelumnya"
                  onClick={() => stadiumTrackRef.current?.scrollBy({ left: -360, behavior: "smooth" })}
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Venue berikutnya"
                  onClick={() => stadiumTrackRef.current?.scrollBy({ left: 360, behavior: "smooth" })}
                >
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
          <div className="home-stadium-track" ref={stadiumTrackRef}>
            {featuredStadiums.map((item, index) => (
              <article className="home-stadium-card" key={item.venue}>
                <Link
                  className="home-stadium-image-link"
                  to="/venue"
                  aria-label={`Lihat detail ${item.venue} di halaman Venue`}
                >
                  <img
                    className="home-stadium-image"
                    src={item.image}
                    alt={item.venue}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes("sport-center.webp") && !target.src.includes("sportcenter.webp")) {
                        target.src = "/venues/sport-center.webp";
                      }
                    }}
                  />
                  <span className="home-stadium-index">{String(index + 1).padStart(2, "0")}</span>
                </Link>
                <div className="home-stadium-copy">
                  <small>{item.category}</small>
                  <h3>{item.venue}</h3>
                  <p>{item.city}</p>
                  <span className="home-stadium-credit" style={{ textDecoration: "none" }}>
                    {item.cabor}
                  </span>
                  <Link className="home-stadium-license text-emerald-800 font-bold" to="/venue">
                    Lihat di peta venue →
                  </Link>
                </div>
              </article>
            ))}

            {/* End Action Card: Venue */}
            <article className="home-stadium-card flex flex-col justify-between p-6 sm:p-7 bg-gradient-to-br from-[#0e2742] via-[#174a72] to-[#216396] text-white border-2 border-dashed border-sky-300/40 hover:border-amber-400 transition-all shrink-0">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/15 text-amber-300 backdrop-blur-xs">
                  <Sparkles className="h-3 w-3" />
                  Arena Tuan Rumah
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Jelajahi 23 Venue Pertandingan
                </h3>
                <p className="text-xs text-sky-100/90 leading-relaxed">
                  Cek peta lokasi interaktif, rute Google Maps, serta fasilitas pendukung seluruh venue resmi di Kabupaten Kotawaringin Barat.
                </p>
              </div>
              <div className="pt-6 mt-auto">
                <Link
                  to="/venue"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm py-3.5 px-4 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Buka Halaman Venue</span>
                  <ArrowIcon diagonal />
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* ===================================================================
            03. CAROUSEL CABANG OLAHRAGA
           =================================================================== */}
        <section className="home-stadium-section" aria-labelledby="home-cabor-title">
          <div className="home-stadium-heading">
            <div>
              <p className="home-stadium-kicker"><span>03</span> CABANG OLAHRAGA</p>
              <h2 id="home-cabor-title">Cabang Olahraga Pilihan</h2>
              <p className="home-stadium-description">35 Cabang olahraga dipertandingkan untuk merebut supremasi tertinggi Kalteng.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/cabor"
                className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
              >
                Semua Cabor
                <ArrowIcon diagonal />
              </Link>
              <div className="home-stadium-controls" aria-label="Kontrol carousel cabor">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Cabor sebelumnya"
                  onClick={() => caborTrackRef.current?.scrollBy({ left: -360, behavior: "smooth" })}
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Cabor berikutnya"
                  onClick={() => caborTrackRef.current?.scrollBy({ left: 360, behavior: "smooth" })}
                >
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>

          <div className="home-stadium-track" ref={caborTrackRef}>
            {featuredCaborList.map((item, index) => (
              <article className="home-stadium-card group" key={item.name}>
                <Link
                  className={`home-stadium-image-link flex items-center justify-center p-6 bg-gradient-to-br ${item.color}`}
                  to="/cabor"
                  aria-label={`Lihat detail cabor ${item.name}`}
                >
                  <img
                    className="h-24 w-24 object-contain brightness-0 invert opacity-95 transition-transform duration-300 group-hover:scale-110 drop-shadow-md"
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="home-stadium-index">{String(index + 1).padStart(2, "0")}</span>
                </Link>
                <div className="home-stadium-copy">
                  <small>{item.category}</small>
                  <h3>{item.name}</h3>
                  <p>{item.venue} • {item.city}</p>
                  <span className="home-stadium-credit" style={{ textDecoration: "none" }}>
                    {item.desc}
                  </span>
                  <Link className="home-stadium-license text-emerald-800 font-bold" to="/cabor">
                    Lihat detail cabor →
                  </Link>
                </div>
              </article>
            ))}

            {/* End Action Card: Cabor */}
            <article className="home-stadium-card flex flex-col justify-between p-6 sm:p-7 bg-gradient-to-br from-[#0e2742] via-[#1b4332] to-[#2d6a4f] text-white border-2 border-dashed border-emerald-300/40 hover:border-amber-400 transition-all shrink-0">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/15 text-amber-300 backdrop-blur-xs">
                  <Trophy className="h-3 w-3" />
                  35 Cabang Olahraga
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Lihat Semua Cabang Olahraga
                </h3>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  Daftar lengkap 35 cabang olahraga, nomor pertandingan, lokasi arena, dan jadwal perebutan medali emas se-Kalimantan Tengah.
                </p>
              </div>
              <div className="pt-6 mt-auto">
                <Link
                  to="/cabor"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm py-3.5 px-4 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Buka Halaman Cabor</span>
                  <ArrowIcon diagonal />
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* ===================================================================
            04. CAROUSEL UMKM & KULINER KHAS KOBAR
           =================================================================== */}
        <section className="home-stadium-section" aria-labelledby="home-umkm-title">
          <div className="home-stadium-heading">
            <div>
              <p className="home-stadium-kicker"><span>04</span> KULINER &amp; UMKM KOBAR</p>
              <h2 id="home-umkm-title">Rekomendasi Kuliner &amp; Oleh-Oleh</h2>
              <p className="home-stadium-description">Jelajahi kelezatan kuliner lokal dan UMKM khas Pangkalan Bun selama perhelatan PORPROV.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/informasi?tab=umkm"
                className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
              >
                Semua UMKM
                <ArrowIcon diagonal />
              </Link>
              <div className="home-stadium-controls" aria-label="Kontrol carousel UMKM">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="UMKM sebelumnya"
                  onClick={() => umkmTrackRef.current?.scrollBy({ left: -360, behavior: "smooth" })}
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="UMKM berikutnya"
                  onClick={() => umkmTrackRef.current?.scrollBy({ left: 360, behavior: "smooth" })}
                >
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>

          <div className="home-stadium-track" ref={umkmTrackRef}>
            {featuredUMKMList.map((item, index) => (
              <article className="home-stadium-card" key={item.id}>
                <Link
                  className="home-stadium-image-link"
                  to="/informasi?tab=umkm"
                  aria-label={`Lihat detail ${item.nama}`}
                >
                  <img
                    className="home-stadium-image"
                    src={item.image}
                    alt={item.nama}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-extrabold text-amber-300 backdrop-blur-xs">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{item.rating_google.toFixed(1)}</span>
                    <span className="text-[9px] text-white/80">({item.jumlah_ulasan})</span>
                  </div>
                  <span className="home-stadium-index">{String(index + 1).padStart(2, "0")}</span>
                </Link>
                <div className="home-stadium-copy">
                  <small>{item.culinaryTheme || item.categoryLabel}</small>
                  <h3>{item.nama}</h3>
                  <p>{item.kecamatanFull}</p>
                  <span className="home-stadium-credit text-slate-700 font-medium" style={{ textDecoration: "none" }}>
                    🍴 {item.signatureDish}
                  </span>
                  <Link className="home-stadium-license text-emerald-800 font-bold" to="/informasi?tab=umkm">
                    Lihat menu &amp; rute maps →
                  </Link>
                </div>
              </article>
            ))}

            {/* End Action Card: UMKM */}
            <article className="home-stadium-card flex flex-col justify-between p-6 sm:p-7 bg-gradient-to-br from-[#3d1a24] via-[#5c2434] to-[#7f2643] text-white border-2 border-dashed border-rose-300/40 hover:border-amber-400 transition-all shrink-0">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/15 text-amber-300 backdrop-blur-xs">
                  <Utensils className="h-3 w-3" />
                  350+ Kuliner Kobar
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Jelajahi Kuliner &amp; UMKM
                </h3>
                <p className="text-xs text-rose-100/90 leading-relaxed">
                  Cicipi Soto Manggala, Ikan Bakar Sungai Arut, Kerupuk Basah Kumai, dan ratusan warung makan khas Kotawaringin Barat.
                </p>
              </div>
              <div className="pt-6 mt-auto">
                <Link
                  to="/informasi?tab=umkm"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm py-3.5 px-4 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Buka Direktori UMKM</span>
                  <ArrowIcon diagonal />
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* ===================================================================
            05. CAROUSEL HOTEL & PENGINAPAN
           =================================================================== */}
        <section className="home-stadium-section" aria-labelledby="home-hotel-title">
          <div className="home-stadium-heading">
            <div>
              <p className="home-stadium-kicker"><span>05</span> HOTEL &amp; PENGINAPAN</p>
              <h2 id="home-hotel-title">Akomodasi Tamu &amp; Atlet</h2>
              <p className="home-stadium-description">Pilihan hotel berbintang, wisma, dan penginapan nyaman strategis di Pangkalan Bun.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/informasi?tab=hotel"
                className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
              >
                Semua Hotel
                <ArrowIcon diagonal />
              </Link>
              <div className="home-stadium-controls" aria-label="Kontrol carousel hotel">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Hotel sebelumnya"
                  onClick={() => hotelTrackRef.current?.scrollBy({ left: -360, behavior: "smooth" })}
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Hotel berikutnya"
                  onClick={() => hotelTrackRef.current?.scrollBy({ left: 360, behavior: "smooth" })}
                >
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>

          <div className="home-stadium-track" ref={hotelTrackRef}>
            {featuredHotelList.map((item, index) => (
              <article className="home-stadium-card" key={item.id}>
                <Link
                  className="home-stadium-image-link"
                  to="/informasi?tab=hotel"
                  aria-label={`Lihat detail ${item.hotelName}`}
                >
                  <img
                    className="home-stadium-image"
                    src={item.image}
                    alt={item.hotelName}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-extrabold text-amber-300 backdrop-blur-xs">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{item.rating}</span>
                    <span className="text-[9px] text-white/80">({item.facilities[0]})</span>
                  </div>
                  <span className="home-stadium-index">{String(index + 1).padStart(2, "0")}</span>
                </Link>
                <div className="home-stadium-copy">
                  <small>{item.type}</small>
                  <h3>{item.hotelName}</h3>
                  <p>{item.nearVenue}</p>
                  <span className="home-stadium-credit text-slate-700 font-semibold" style={{ textDecoration: "none" }}>
                    💰 {item.priceRange}
                  </span>
                  <Link className="home-stadium-license text-emerald-800 font-bold" to="/informasi?tab=hotel">
                    Lihat fasilitas &amp; rute maps →
                  </Link>
                </div>
              </article>
            ))}

            {/* End Action Card: Hotel */}
            <article className="home-stadium-card flex flex-col justify-between p-6 sm:p-7 bg-gradient-to-br from-[#1c2541] via-[#3a506b] to-[#5bc0be] text-white border-2 border-dashed border-cyan-300/40 hover:border-amber-400 transition-all shrink-0">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/15 text-amber-300 backdrop-blur-xs">
                  <Hotel className="h-3 w-3" />
                  Akomodasi Tamu &amp; Atlet
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Cari Hotel &amp; Penginapan
                </h3>
                <p className="text-xs text-sky-100/90 leading-relaxed">
                  Temukan hotel bintang 4, wisma atlet, guest house terdekat dari Sport Center, serta kontak pemesanan langsung.
                </p>
              </div>
              <div className="pt-6 mt-auto">
                <Link
                  to="/informasi?tab=hotel"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm py-3.5 px-4 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Buka Direktori Hotel</span>
                  <ArrowIcon diagonal />
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* ===================================================================
            06. CAROUSEL PESONA WISATA KOBAR (DUMMY WISATA)
           =================================================================== */}
        <section className="home-stadium-section" aria-labelledby="home-wisata-title">
          <div className="home-stadium-heading">
            <div>
              <p className="home-stadium-kicker"><span>06</span> PESONA WISATA KOBAR</p>
              <h2 id="home-wisata-title">Destinasi Wisata Populer</h2>
              <p className="home-stadium-description">Saksikan keindahan alam cagar biosfer dunia, pantai eksotis, dan cagar budaya Kesultanan Kutaringin.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/informasi"
                className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
              >
                Informasi Wisata
                <ArrowIcon diagonal />
              </Link>
              <div className="home-stadium-controls" aria-label="Kontrol carousel wisata">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Wisata sebelumnya"
                  onClick={() => wisataTrackRef.current?.scrollBy({ left: -360, behavior: "smooth" })}
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Wisata berikutnya"
                  onClick={() => wisataTrackRef.current?.scrollBy({ left: 360, behavior: "smooth" })}
                >
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>

          <div className="home-stadium-track" ref={wisataTrackRef}>
            {featuredWisataList.map((item, index) => (
              <article className="home-stadium-card" key={item.id}>
                <a
                  className="home-stadium-image-link"
                  href={item.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Buka peta wisata ${item.name}`}
                >
                  <img
                    className="home-stadium-image"
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-extrabold text-sky-200 backdrop-blur-xs">
                    <MapPin className="h-3 w-3 text-amber-300" />
                    <span>{item.district}</span>
                  </div>
                  <span className="home-stadium-index">{String(index + 1).padStart(2, "0")}</span>
                </a>
                <div className="home-stadium-copy">
                  <small>{item.category}</small>
                  <h3>{item.name}</h3>
                  <p>{item.openInfo}</p>
                  <span className="home-stadium-credit text-slate-700 font-medium" style={{ textDecoration: "none" }}>
                    ✨ {item.highlights}
                  </span>
                  <a
                    className="home-stadium-license text-emerald-800 font-bold inline-flex items-center gap-1"
                    href={item.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Buka rute Google Maps <ArrowIcon diagonal />
                  </a>
                </div>
              </article>
            ))}

            {/* End Action Card: Wisata */}
            <article className="home-stadium-card flex flex-col justify-between p-6 sm:p-7 bg-gradient-to-br from-[#241e38] via-[#473b68] to-[#69589a] text-white border-2 border-dashed border-purple-300/40 hover:border-amber-400 transition-all shrink-0">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/15 text-amber-300 backdrop-blur-xs">
                  <Compass className="h-3 w-3" />
                  Bumi Marunting Batu Aji
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Pesona Wisata Kotawaringin Barat
                </h3>
                <p className="text-xs text-purple-100/90 leading-relaxed">
                  Jelajahi keajaiban Taman Nasional Tanjung Puting, Pantai Kubu, Istana Kuning, dan kekayaan budaya Dayak Tomun.
                </p>
              </div>
              <div className="pt-6 mt-auto">
                <Link
                  to="/informasi"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm py-3.5 px-4 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Buka Informasi Wisata</span>
                  <ArrowIcon diagonal />
                </Link>
              </div>
            </article>
          </div>
        </section>

        <section id="cabang-olahraga" className="mx-auto w-[var(--container-width)] pt-[94px] pb-[108px] max-[900px]:w-[90%] max-[620px]:w-[88%] max-[620px]:py-[72px]">
          <div className="flex items-center gap-[13px] text-[9px] font-extrabold tracking-[0.16em] text-[#596156] [&>span:first-child]:text-[var(--orange)]">
            <span>07</span>
            <span>ARENA PARA JUARA</span>
          </div>
          <div className="mt-[33px] grid grid-cols-[0.9fr_1.1fr] gap-[12%] max-[900px]:gap-[7%] max-[620px]:grid-cols-1 max-[620px]:gap-[27px]">
            <div>
              <h2 className="m-0 text-[clamp(34px,4.5vw,60px)] font-extrabold leading-[1.08] tracking-[-0.075em] max-[620px]:text-[clamp(37px,10vw,52px)] [&>span]:text-[var(--green)]">
                Setiap cabang,
                <br />
                <span>satu kebanggaan.</span>
              </h2>
              <p className="mt-[21px] mb-0 max-w-[390px] xl:max-w-[480px] 2xl:max-w-[620px] min-[2560px]:max-w-[800px] text-[13px] xl:text-[15px] 2xl:text-[17px] min-[2560px]:text-[20px] leading-[1.9] text-[var(--muted)]">
                Berbagai cabang olahraga akan mempertemukan atlet-atlet terbaik
                dari seluruh Kalimantan Tengah. Daftar cabang dan detail
                pertandingan akan diumumkan melalui kanal resmi.
              </p>
              <Link className="mt-5 inline-flex items-center gap-2 rounded-md text-[11px] font-extrabold text-[var(--green)] transition-colors duration-[160ms] hover:text-[var(--orange)]" to="/cabor">
                Lihat cabang olahraga <ArrowIcon diagonal />
              </Link>
              <Link className="mt-5 inline-flex items-center gap-2 rounded-md text-[11px] font-extrabold text-[var(--green)] transition-colors duration-[160ms] hover:text-[var(--orange)]" to="/venue">
                Lihat venue pertandingan <ArrowIcon diagonal />
              </Link>
            </div>
            <div className="border-t border-[#dcded4] max-[620px]:mt-[10px]" aria-label="Contoh cabang olahraga">
              {sports.slice(0, 10).map((sport, index) => (
                <Link
                  key={sport.id}
                  to={`/jadwal?tanggal=${getTodaysDate()}&cabang=${encodeURIComponent(sport.name)}`}
                  className="grid min-h-[54px] grid-cols-[40px_1fr_20px] items-center border-b border-[#dcded4] text-xs font-bold text-[var(--green)] transition-colors duration-[160ms] hover:bg-[var(--green)] hover:text-white [&>.arrow-icon]:w-[14px] [&>.arrow-icon]:text-white"
                >
                  <span className="text-[9px] font-extrabold tracking-[0.08em] text-[var(--orange)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{sport.name}</span>
                  <ArrowIcon diagonal />
                </Link>
              ))}
              {loadingSports && (
                <p className="mt-[13px] mb-0 text-[9px] leading-[1.7] text-[var(--muted)]" role="status">
                  Memuat cabang olahraga...
                </p>
              )}
              {sportsError && (
                <p className="mt-[13px] mb-0 text-[9px] leading-[1.7] text-[var(--muted)]" role="alert">
                  Gagal memuat cabang olahraga: {sportsError}{" "}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void fetchSports()}
                  >
                    Coba lagi
                  </Button>
                </p>
              )}
              {!loadingSports && !sportsError && (
                <p className="mt-[13px] mb-0 text-[9px] leading-[1.7] text-[var(--muted)]">
                  Daftar cabang dimuat dari backend dan dapat berubah setelah
                  data resmi diperbarui.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="relative min-h-[355px] overflow-hidden bg-[var(--orange)] text-white max-[620px]:min-h-[330px]">
          <div className="closing-pattern" aria-hidden="true" />
          <div className="relative z-[1] mx-auto w-[var(--container-width)] pt-[62px] pb-[65px] max-[900px]:w-[90%] max-[620px]:w-[88%] max-[620px]:pt-[55px] max-[620px]:pb-[55px]">
            <p className="mb-6 flex items-center gap-[10px] text-[10px] font-extrabold uppercase tracking-[0.15em] text-white [&>span]:bg-[var(--lime)]">
              <span className="size-[7px] rounded-full shadow-[0_0_14px_rgba(211,237,113,0.75)]" />
              Menuju PORPROV XIII KALIMANTAN TENGAH 2026
            </p>
            <h2 className="mt-0 mb-[26px] text-[clamp(42px,6vw,76px)] font-black leading-[0.98] tracking-[-0.08em] [&>span]:text-[var(--lime)]">
              Bersama kita
              <br />
              <span>jadi juara.</span>
            </h2>
            <a className="inline-flex min-h-[49px] items-center justify-center gap-[18px] rounded-md bg-[var(--lime)] px-5 text-[11px] font-extrabold text-[#102b49] transition-[transform,background] duration-[160ms] hover:-translate-y-0.5 hover:bg-[#c6e2f5] max-[620px]:min-h-[45px] max-[620px]:px-[15px]" href="#beranda">
              Kembali ke atas
            </a>
          </div>
          <span className="absolute right-[8%] bottom-[-73px] text-[clamp(200px,35vw,420px)] font-black leading-none tracking-[-0.12em] text-white/10 max-[620px]:right-0 max-[620px]:bottom-[-32px] max-[620px]:text-[230px]" aria-hidden="true">
            XIII
          </span>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
