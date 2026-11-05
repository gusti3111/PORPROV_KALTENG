import { Link } from "react-router-dom";
import ArrowIcon from "../components/ArrowIcon";
import EventCountdown from "../components/EventCountdown";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { EVENT_START_LABEL } from "../event-config";

const homeSports = [
  "Atletik",
  "Bola voli",
  "Bulu tangkis",
  "Renang",
  "Pencak Silat",
  "Tenis Meja",
  "Skateboard",
  "Kick Boxing",
  "Teqball",
  "Muaythai",
];

export default function HomeView() {
  return (
    <>
      <SiteHeader />

      <main>
        <section id="beranda" className="hero">
          <div className="hero-grid" aria-hidden="true" />
          <div
            className="hero-orbit hero-orbit-one"
            aria-hidden="true"
          />
          <div
            className="hero-orbit hero-orbit-two"
            aria-hidden="true"
          />

          <div className="hero-content">
            <p className="eyebrow hero-eyebrow">
              <span className="eyebrow-dot" />
              Panggung prestasi Kalimantan Tengah
            </p>
            <h1>
              PORPROV
              <span className="hero-edition">
                XIII <i>2026</i>
              </span>
            </h1>
            <p className="hero-description">
              Pekan Olahraga Provinsi Kalimantan Tengah. Satu semangat untuk
              berkompetisi, berprestasi, dan tumbuh bersama.
            </p>
            <div className="hero-actions">
              <a className="button button-light" href="#tentang">
                Jelajahi PORPROV <ArrowIcon />
              </a>
              <Link className="text-link" to="/cabor">
                Kenali cabang olahraga
              </Link>
            </div>
          </div>

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

          <div className="hero-bottom">
            <span>SPORTIVITAS</span>
            <span className="hero-bottom-star">✳</span>
            <span>PERSAUDARAAN</span>
            <span className="hero-bottom-star">✳</span>
            <span>PRESTASI</span>
            <span className="hero-bottom-location">
              KALIMANTAN TENGAH, INDONESIA
            </span>
          </div>
        </section>

        <section
          className="countdown-wrap section-wrap"
          aria-labelledby="countdown-title"
        >
          <div className="countdown-heading">
            <p className="countdown-kicker">HITUNG MUNDUR</p>
            <h2 id="countdown-title">Menuju pembukaan</h2>
            <p className="countdown-date">{EVENT_START_LABEL}</p>
          </div>
          <EventCountdown />
          <p className="countdown-note">
            Tanggal sementara, sesuaikan dengan jadwal resmi PORPROV XIII.
          </p>
        </section>

        <section id="tentang" className="intro section-wrap">
          <div className="section-kicker">
            <span>01</span>
            <span>TENTANG PORPROV</span>
          </div>
          <div className="intro-copy">
            <h2>
              Lebih dari pertandingan.
              <br />
              <span>Ini tentang kebanggaan.</span>
            </h2>
            <div className="intro-aside">
              <p>
                PORPROV XIII Kalimantan Tengah 2026 menjadi ruang bertemunya
                atlet, daerah, dan masyarakat dalam semangat sportivitas.
                Bersama, kita merayakan kerja keras dan potensi olahraga
                Kalimantan Tengah.
              </p>
              <a className="inline-link" href="#informasi">
                Ikuti informasinya <ArrowIcon diagonal />
              </a>
            </div>
          </div>
          <div className="intro-stats" aria-label="Informasi acara">
            <div>
              <strong>
                13<span>th</span>
              </strong>
              <small>EDISI PORPROV</small>
            </div>
            <div>
              <strong>2026</strong>
              <small>TAHUN PENYELENGGARAAN</small>
            </div>
            <div>
              <strong>KALTENG</strong>
              <small>SEMANGAT SATU PROVINSI</small>
            </div>
          </div>
        </section>


        <section id="cabang-olahraga" className="sports section-wrap">
          <div className="section-kicker">
            <span>03</span>
            <span>ARENA PARA JUARA</span>
          </div>
          <div className="sports-layout">
            <div className="sports-copy">
              <h2>
                Setiap cabang,
                <br />
                <span>satu kebanggaan.</span>
              </h2>
              <p>
                Berbagai cabang olahraga akan mempertemukan atlet-atlet terbaik
                dari seluruh Kalimantan Tengah. Daftar cabang dan detail
                pertandingan akan diumumkan melalui kanal resmi.
              </p>
              <Link className="inline-link" to="/cabor">
                Lihat cabang olahraga <ArrowIcon diagonal />
              </Link>
              <Link className="inline-link" to="/venue">
                Lihat venue pertandingan <ArrowIcon diagonal />
              </Link>
            </div>
            <div className="sports-list" aria-label="Contoh cabang olahraga">
              {homeSports.map((sport, index) => (
                <div key={sport} className="sport-item">
                  <span className="sport-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{sport}</span>
                  <ArrowIcon diagonal />
                </div>
              ))}
              <p className="sports-note">
                Daftar ini merupakan gambaran cabang olahraga. Informasi resmi
                akan diperbarui kemudian.
              </p>
            </div>
          </div>
        </section>

        <section className="closing">
          <div className="closing-pattern" aria-hidden="true" />
          <div className="closing-content">
            <p className="eyebrow">
              <span className="eyebrow-dot" />
              Menuju PORPROV XIII 2026
            </p>
            <h2>
              Bersama kita
              <br />
              <span>jadi juara.</span>
            </h2>
            <a className="button button-light" href="#beranda">
              Kembali ke atas <ArrowIcon diagonal />
            </a>
          </div>
          <span className="closing-mark" aria-hidden="true">
            XIII
          </span>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
