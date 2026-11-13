import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ArrowIcon from "../components/ArrowIcon";
import EventCountdown from "../components/EventCountdown";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { EVENT_START_LABEL } from "../event-config";

const featuredStadiums = [
  {
    category: "KOMPLEKS UTAMA",
    venue: "Sport Center Pangkalan Bun",
    city: "Madurejo, Kotawaringin Barat",
    cabor: "Upacara Pembukaan & Penutupan, Grass Track, Voli Pantai, Drumband, Korfball, Panahan, Sepatu Roda & Skateboard",
    image: "/venues2/sportCenter.jpg",
  },
  {
    category: "STADION & LINTASAN",
    venue: "Lintasan Atletik Sport Center",
    city: "Madurejo, Kotawaringin Barat",
    cabor: "Cabang Olahraga Atletik",
    image: "/venues2/LintasanAtletik.jpeg",
  },
  {
    category: "GELANGGANG OLAHRAGA",
    venue: "GOR Sport Center Ratu Alamsyah",
    city: "Madurejo, Kotawaringin Barat",
    cabor: "Bola Voli Indoor, Futsal & Basket",
    image: "/venues2/gorSportCenter.jpg",
  },
  {
    category: "GELANGGANG OLAHRAGA",
    venue: "GOR KONI Kotawaringin Barat",
    city: "Sidorejo, Pangkalan Bun",
    cabor: "Cabang Olahraga Bulutangkis",
    image: "/venues2/GORKoni.jpg",
  },
  {
    category: "ARENA PERAIRAN",
    venue: "Kampung Sega Sungai Arut",
    city: "Mendawai, Pangkalan Bun",
    cabor: "Dayung (Canoeing, Traditional Boat Race, & Argometer)",
    image: "/venues2/kampungSega.jpg",
  },
  {
    category: "ARENA TERBUKA",
    venue: "Pangkalan Bun Park",
    city: "Madurejo, Pangkalan Bun",
    cabor: "MMA & Panjat Tebing",
    image: "/venues2/pangakalnbunpark.jpg",
  },
  {
    category: "STADION & FASILITAS OLAHRAGA",
    venue: "Lapangan Tenis Pasir Panjang",
    city: "Pasir Panjang, Arut Selatan",
    cabor: "Cabang Olahraga Tenis Lapangan",
    image: "/venues2/LapanganTenisPasirPanjang.jpeg",
  },
  {
    category: "AULA & GEDUNG PERTEMUAN",
    venue: "Aula Disdikbud",
    city: "Pasir Panjang, Arut Selatan",
    cabor: "Cabang Olahraga Tenis Meja",
    image: "/venues2/aulaDISKDIKBUD.jpg",
  },
  {
    category: "AULA & GEDUNG PERTEMUAN",
    venue: "Aula Antakusuma",
    city: "Pangkalan Bun, Kotawaringin Barat",
    cabor: "Pencak Silat & Taekwondo",
    image: "/venues2/aulaAntakusuma.jpeg",
  },
  {
    category: "AULA & GEDUNG PERTEMUAN",
    venue: "Aula Dispora",
    city: "Pangkalan Bun, Kotawaringin Barat",
    cabor: "Cabang Olahraga Bridge",
    image: "/venues2/aulaDisipora.jpeg",
  },
  {
    category: "AULA & GEDUNG PERTEMUAN",
    venue: "Aula Bapperida",
    city: "Pangkalan Bun, Kotawaringin Barat",
    cabor: "Cabang Olahraga Catur",
    image: "/venues2/bapperida.jpg",
  },
  {
    category: "AULA & GEDUNG PERTEMUAN",
    venue: "Aula Mapolres Kobar",
    city: "Pangkalan Bun, Kotawaringin Barat",
    cabor: "Cabang Olahraga Judo",
    image: "/venues2/mapolres.jpg",
  },
  {
    category: "ARENA INDOOR",
    venue: "Samari Futsal",
    city: "Pangkalan Bun, Kotawaringin Barat",
    cabor: "Cabang Olahraga Karate",
    image: "/venues2/samari.jpg",
  },
  {
    category: "ARENA INDOOR & KOMERSIAL",
    venue: "Juvenza Futsal",
    city: "Madurejo, Pangkalan Bun",
    cabor: "Cabang Olahraga Tinju",
    image: "/venues2/juvenza.png",
  },
  {
    category: "ARENA BILLIARD",
    venue: "Onix Billiard",
    city: "Pangkalan Bun, Kotawaringin Barat",
    cabor: "Cabang Olahraga Billiard",
    image: "/venues2/Onix.jpg",
  },
  {
    category: "ARENA SEPAK BOLA MINI",
    venue: "Minisoccer R88",
    city: "Pasir Panjang, Arut Selatan",
    cabor: "Sepak Bola Mini (KSMI)",
    image: "/venues2/soccer88.jpeg",
  },
  {
    category: "ARENA BALAP MOTOR",
    venue: "Sirkuit Sabaru Palangka Raya",
    city: "Sabaru, Sebangau, Palangka Raya",
    cabor: "Bermotor / Balap Motor (Motoprix)",
    image: "/venues2/sirkuitsabaru.jpg",
  },
  {
    category: "AKUATIK & PERAIRAN",
    venue: "Kolam Renang Isen Mulang",
    city: "Jekan Raya, Palangka Raya",
    cabor: "Cabang Olahraga Akuatik / Renang",
    image: "/venues2/kolamIsenMulang.jpg",
  },
  {
    category: "AULA & GEDUNG PERTEMUAN",
    venue: "Aula Kiyai Gede",
    city: "Kotawaringin Lama, Kotawaringin Barat",
    cabor: "Binaraga Fitnes, Dancesport & Gimnastik",
    image: "",
  },
  {
    category: "ARENA JALAN RAYA",
    venue: "Jalan Raya Pangkalan Bun",
    city: "Pangkalan Bun, Kotawaringin Barat",
    cabor: "Balap Sepeda (Road Bike & Mountain Bike)",
    image: "",
  },
];

export default function HomeView() {
  const stadiumTrackRef = useRef<HTMLDivElement>(null);

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
            <h1 className="m-0 text-[clamp(44px,5.6vw,78px)] font-black leading-[0.92] tracking-[-0.08em] max-[900px]:text-[clamp(36px,6vw,58px)] max-[620px]:text-[clamp(30px,8vw,44px)]">
              PORPROV XIII
              <span className="mt-2.5 ml-1 flex flex-wrap items-center gap-2 sm:gap-3 text-[clamp(20px,2.4vw,34px)] font-extrabold tracking-[-0.04em] text-white max-[900px]:text-[clamp(17px,2.5vw,26px)] max-[620px]:mt-1.5 max-[620px]:text-[clamp(15px,4.5vw,22px)]">
                KALIMANTAN TENGAH
                <i className="font-extrabold not-italic tracking-normal text-[var(--lime)]">
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

        <section id="cabang-olahraga" className="mx-auto w-[var(--container-width)] pt-[94px] pb-[108px] max-[900px]:w-[90%] max-[620px]:w-[88%] max-[620px]:py-[72px]">
          <div className="flex items-center gap-[13px] text-[9px] font-extrabold tracking-[0.16em] text-[#596156] [&>span:first-child]:text-[var(--orange)]">
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
              <h2 className="m-0 text-[clamp(34px,4.5vw,60px)] font-extrabold leading-[1.08] tracking-[-0.075em] max-[620px]:text-[clamp(37px,10vw,52px)] [&>span]:text-[var(--green)]">
                Untuk apa memperebutkan semangkuk coto,
                <br />
                <span>kita bisa temukan jauh lebih banyak di sini </span>
              </h2>
              <p className="mt-[21px] mb-0 max-w-[390px] xl:max-w-[480px] 2xl:max-w-[620px] min-[2560px]:max-w-[800px] text-[13px] xl:text-[15px] 2xl:text-[17px] min-[2560px]:text-[20px] leading-[1.9] text-[var(--muted)]">
                Berikut beberapa rekomendasi tempat makan yang enak dan cocok untuk menikmati kuliner khas Kotawaringin Barat.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <Link className="inline-flex items-center gap-2 rounded-md text-[11px] font-extrabold text-[var(--green)] transition-colors duration-[160ms] hover:text-[var(--orange)]" to="/informasi?tab=makan">
                  Lihat Tempat makan dan Restoran <ArrowIcon diagonal />
                </Link>
                {/* <Link className="inline-flex items-center gap-2 rounded-md text-[11px] font-extrabold text-[var(--green)] transition-colors duration-[160ms] hover:text-[var(--orange)]" to="/venue">
                  Lihat venue pertandingan <ArrowIcon diagonal />
                </Link> */}
              </div>
            </div>

          </div>
        </section>
        <section id="cabang-olahraga" className="mx-auto w-[var(--container-width)] pt-[94px] pb-[108px] max-[900px]:w-[90%] max-[620px]:w-[88%] max-[620px]:py-[72px]">
          <div className="flex items-center gap-[13px] text-[9px] font-extrabold tracking-[0.16em] text-[#596156] [&>span:first-child]:text-[var(--orange)]">
            <span>08</span>
            <span>Tempat Wisata </span>
          </div>

          <div className="mt-[33px] grid grid-cols-[1fr_1fr] items-center gap-[8%] max-[900px]:gap-[5%] max-[620px]:grid-cols-1 max-[620px]:gap-[27px]">
            <div>
              <h2 className="m-0 text-[clamp(34px,4.5vw,60px)] font-extrabold leading-[1.08] tracking-[-0.075em] max-[620px]:text-[clamp(37px,10vw,52px)] [&>span]:text-[var(--green)]">
                Setelah kenyang perut
                <br />
                <span>Yuk Jalan-jalan</span>
              </h2>
              <p className="mt-[21px] mb-0 max-w-[390px] xl:max-w-[480px] 2xl:max-w-[620px] min-[2560px]:max-w-[800px] text-[13px] xl:text-[15px] 2xl:text-[17px] min-[2560px]:text-[20px] leading-[1.9] text-[var(--muted)]">
                Anda bisa mengunjungi beberapa tempat wisata menarik di Kotawaringin Barat yang sayang untuk dilewatkan.
                Berikut beberapa rekomendasi tempat wisata yang cocok untuk dikunjungi setelah menikmati kuliner khas Kotawaringin Barat.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <Link className="inline-flex items-center gap-2 rounded-md text-[11px] font-extrabold text-[var(--green)] transition-colors duration-[160ms] hover:text-[var(--orange)]" to="/informasi?tab=wisata">
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

        <section id="cabang-olahraga" className="mx-auto w-[var(--container-width)] pt-[94px] pb-[108px] max-[900px]:w-[90%] max-[620px]:w-[88%] max-[620px]:py-[72px]">
          <div className="flex items-center gap-[13px] text-[9px] font-extrabold tracking-[0.16em] text-[#596156] [&>span:first-child]:text-[var(--orange)]">
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
              <h2 className="m-0 text-[clamp(34px,4.5vw,60px)] font-extrabold leading-[1.08] tracking-[-0.075em] max-[620px]:text-[clamp(37px,10vw,52px)] [&>span]:text-[var(--green)]">
                Udah Capek Jalan-jalannya
                <br />
                <span>Jangan Khawatir,kita ada tempat penginapan yang nyaman</span>
              </h2>
              <p className="mt-[21px] mb-0 max-w-[390px] xl:max-w-[480px] 2xl:max-w-[620px] min-[2560px]:max-w-[800px] text-[13px] xl:text-[15px] 2xl:text-[17px] min-[2560px]:text-[20px] leading-[1.9] text-[var(--muted)]">
                Berikut beberapa  tempat penginapan pilihan di Kotawaringin Barat yang dapat membuat  istirahat anda semakin nyaman
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <Link className="inline-flex items-center gap-2 rounded-md text-[11px] font-extrabold text-[var(--green)] transition-colors duration-[160ms] hover:text-[var(--orange)]" to="/informasi?tab=penginapan">
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
