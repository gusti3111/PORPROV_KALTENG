import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ArrowIcon from "../components/ArrowIcon";
import EventCountdown from "../components/EventCountdown";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { EVENT_START_LABEL } from "../event-config";
import { useCompetitionStore } from "../stores/competitionStore";

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
    image: "/sportcenter.webp",
  },
  {
    category: "STADION SEPAK BOLA",
    venue: "Stadion Sepak Bola Sport Center",
    city: "Madurejo, Kotawaringin Barat",
    cabor: "Cabang Olahraga Sepak Bola",
    image: "/sportcenter.webp",
  },
  {
    category: "GELANGGANG OLAHRAGA",
    venue: "GOR Sport Center Ratu Alamsyah",
    city: "Madurejo, Kotawaringin Barat",
    cabor: "Bola Voli Indoor & Futsal",
    image: "/sportcenter.webp",
  },
  {
    category: "GELANGGANG OLAHRAGA",
    venue: "GOR KONI Kotawaringin Barat",
    city: "Sidorejo, Pangkalan Bun",
    cabor: "Cabang Olahraga Bulutangkis",
    image: "/sportcenter.webp",
  },
  {
    category: "ARENA PERAIRAN",
    venue: "Kampung Sega Sungai Arut",
    city: "Mendawai, Pangkalan Bun",
    cabor: "Dayung (Canoeing, Traditional Boat Race, & Ergometer)",
    image: "/sportcenter.webp",
  },
  {
    category: "ARENA TERBUKA",
    venue: "Pangkalan Bun Park",
    city: "Madurejo, Pangkalan Bun",
    cabor: "MMA & Panjat Tebing",
    image: "/sportcenter.webp",
  },
  {
    category: "AKUATIK & SIRKUIT",
    venue: "Kolam Renang Isen Mulang & Sirkuit Sabaru",
    city: "Kota Palangka Raya",
    cabor: "Akuatik & Bermotor (Motoprix)",
    image: "/sportcenter.webp",
  },
];

export default function HomeView() {
  const stadiumTrackRef = useRef<HTMLDivElement>(null);
  const sports = useCompetitionStore((state) => state.sports);
  const loadingSports = useCompetitionStore((state) => state.loading.sports);
  const sportsError = useCompetitionStore((state) => state.errors.sports);
  const fetchSports = useCompetitionStore((state) => state.fetchSports);

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

          <div className="relative z-[2] w-[54%] pt-[76px] pb-[105px] pl-[10%] min-[1500px]:pl-[max(10%,calc((100vw-1200px)/2))] max-[900px]:w-[60%] max-[900px]:pl-[7%] max-[620px]:w-full max-[620px]:px-[6%] max-[620px]:pt-[65px] max-[620px]:pb-[170px]">
            <p className="mb-6 flex items-center gap-[10px] text-[10px] font-extrabold uppercase tracking-[0.15em] text-[var(--lime)]">
              <span className="size-[7px] rounded-full bg-[var(--lime)] shadow-[0_0_14px_rgba(220,236,249,0.75)]" />
              Panggung prestasi Kalimantan Tengah
            </p>
            <h1 className="m-0 text-[clamp(72px,9.5vw,142px)] font-black leading-[0.84] tracking-[-0.105em] max-[900px]:text-[clamp(67px,11vw,100px)] max-[620px]:text-[clamp(76px,20vw,114px)]">
              PORPROV 
              <span className="mt-[21px] ml-[6px] flex items-center gap-[18px] text-[clamp(33px,4vw,55px)] tracking-[-0.055em] max-[620px]:mt-[17px] max-[620px]:text-[39px]">
                KALIMANTAN TENGAH
              </span>
              <span className="mt-[21px] ml-[6px] flex items-center gap-[18px] text-[clamp(33px,4vw,55px)] tracking-[-0.055em] max-[620px]:mt-[17px] max-[620px]:text-[39px]">
                XIII{" "}
                <i className="text-[0.62em] font-semibold not-italic tracking-normal text-[var(--lime)]">
                  2026
                </i>
              </span>
            </h1>
            <p className="mt-7 ml-[5px] max-w-[390px] text-[14px] leading-[1.85] text-white/75 max-[620px]:max-w-[340px] max-[620px]:text-[12px]">
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
          className="relative mx-auto mt-10 grid w-[min(85.6%,1120px)] grid-cols-[1fr_auto] items-center gap-x-[30px] gap-y-3 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-6 shadow-[var(--ui-shadow)] max-[900px]:w-[90%] max-[620px]:mt-[25px] max-[620px]:w-[88%] max-[620px]:grid-cols-1 max-[620px]:gap-4 max-[620px]:p-5 max-[620px]:rounded-[10px]"
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

        <section id="tentang" className="mx-auto w-[min(85.6%,1120px)] pt-[108px] pb-[94px] max-[900px]:w-[90%] max-[620px]:w-[88%] max-[620px]:pt-[73px] max-[620px]:pb-[70px]">
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
        </section>

        <section className="home-stadium-section" aria-labelledby="home-stadium-title">
          <div className="home-stadium-heading">
            <div>
              <p className="home-stadium-kicker"><span>02</span> GALERI STADION</p>
              <h2 id="home-stadium-title">Venue yang tersedia</h2>
              <p className="home-stadium-description">Berikut adalah Venue yang digunakan untuk pertandingan nanti.</p>
            </div>
            <div className="home-stadium-controls" aria-label="Kontrol carousel stadion">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Stadion sebelumnya"
                onClick={() => stadiumTrackRef.current?.scrollBy({ left: -360, behavior: "smooth" })}
              >
                <ChevronLeft aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Stadion berikutnya"
                onClick={() => stadiumTrackRef.current?.scrollBy({ left: 360, behavior: "smooth" })}
              >
                <ChevronRight aria-hidden="true" />
              </Button>
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
                  <Link className="home-stadium-license" to="/venue">
                    Lihat di peta venue →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>


        <section id="cabang-olahraga" className="mx-auto w-[min(85.6%,1120px)] pt-[94px] pb-[108px] max-[900px]:w-[90%] max-[620px]:w-[88%] max-[620px]:py-[72px]">
          <div className="flex items-center gap-[13px] text-[9px] font-extrabold tracking-[0.16em] text-[#596156] [&>span:first-child]:text-[var(--orange)]">
            <span>03</span>
            <span>ARENA PARA JUARA</span>
          </div>
          <div className="mt-[33px] grid grid-cols-[0.9fr_1.1fr] gap-[12%] max-[900px]:gap-[7%] max-[620px]:grid-cols-1 max-[620px]:gap-[27px]">
            <div>
              <h2 className="m-0 text-[clamp(34px,4.5vw,60px)] font-extrabold leading-[1.08] tracking-[-0.075em] max-[620px]:text-[clamp(37px,10vw,52px)] [&>span]:text-[var(--green)]">
                Setiap cabang,
                <br />
                <span>satu kebanggaan.</span>
              </h2>
              <p className="mt-[21px] mb-0 max-w-[390px] text-[13px] leading-[1.9] text-[var(--muted)]">
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
          <div className="relative z-[1] mx-auto w-[min(85.6%,1120px)] pt-[62px] pb-[65px] max-[900px]:w-[90%] max-[620px]:w-[88%] max-[620px]:pt-[55px] max-[620px]:pb-[55px]">
            <p className="mb-6 flex items-center gap-[10px] text-[10px] font-extrabold uppercase tracking-[0.15em] text-white [&>span]:bg-[var(--lime)]">
              <span className="size-[7px] rounded-full shadow-[0_0_14px_rgba(211,237,113,0.75)]" />
              Menuju PORPROV XIII KALIMANTAN TENGAH 2026
            </p>
            <h2 className="mt-0 mb-[26px] text-[clamp(42px,6vw,76px)] font-black leading-[0.98] tracking-[-0.08em] [&>span]:text-[var(--lime)]">
              Bersama kita
              <br />
              <span>jadi juara.</span>
            </h2>
            <a className="inline-flex min-h-[49px] items-center justify-center gap-[18px] rounded-md bg-[var(--lime)] px-5 text-[11px] font-extrabold text-[#102b49] transition-[transform,background] duration-[160ms] hover:-translate-y-0.5 hover:bg-[#c6e2f5] max-[620px]:min-h-[45px] max-[620px]:px-[15px]"href="#beranda">
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
