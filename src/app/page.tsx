import Countdown from "./countdown";
import { EVENT_START_LABEL } from "./event-config";
import SiteNavigation from "./site-navigation";

const sports = [
  "Atletik",
  "Bola voli",
  "Bulu tangkis",
  /*"Sepak bola",*/
  "Renang",
  "Pencak Silat",
  "Tenis Meja",
  "Skateboard",
  /* "Roller Sport", */
  "Kick Boxing",
  "Teqball",
  "Muaythai",
];

function ArrowIcon({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="arrow-icon"
      viewBox="0 0 20 20"
      fill="none"
    >
      {diagonal ? (
        <path d="M5 15 15 5M6 5h9v9" />
      ) : (
        <path d="M3.5 10h13m-5-5 5 5-5 5" />
      )}
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <header className="site-header">
        <a className="brand" href="#beranda" aria-label="PORPROV XIII Kalteng">
          <span className="brand-mark" aria-hidden="true">
            P<span>13</span>
          </span>
          <span className="brand-copy">
            <strong>PORPROV</strong>
            <small>KALIMANTAN TENGAH</small>
          </span>
        </a>

        <SiteNavigation />

        <a className="header-link" href="#informasi">
          Pusat informasi <ArrowIcon diagonal />
        </a>
      </header>

      <main>
        <section className="hero" id="beranda">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
          <div className="hero-orbit hero-orbit-two" aria-hidden="true" />

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
              <a className="text-link" href="/cabor">
                Kenali cabang olahraga
              </a>
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
            <span className="art-index">13<span>/XV</span></span>
          </div>

          <div className="hero-bottom">
            <span>SPORTIVITAS</span>
            <span className="hero-bottom-star">✳</span>
            <span>PERSAUDARAAN</span>
            <span className="hero-bottom-star">✳</span>
            <span>PRESTASI</span>
            <span className="hero-bottom-location">KALIMANTAN TENGAH, INDONESIA</span>
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
          <Countdown />
          <p className="countdown-note">
            Tanggal sementara, sesuaikan dengan jadwal resmi PORPROV XIII.
          </p>
        </section>

        <section className="intro section-wrap" id="tentang">
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
              <strong>13<span>th</span></strong>
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

        {/* <section className="information" id="informasi">
          <div className="section-wrap information-inner">
            <div className="section-kicker section-kicker-light">
              <span>02</span>
              <span>JELAJAHI PORPROV</span>
            </div>
            <div className="information-heading">
              <h2>
                Semua yang perlu
                <br />
                <span>kamu ketahui.</span>
              </h2>
              <p>
                Satu tempat untuk mengikuti pertandingan dan kabar terbaru
                PORPROV XIII Kalimantan Tengah 2026.
              </p>
            </div>

            <div className="highlight-grid">
              {highlights.map((item) => (
                <a className="highlight-card" href={item.href} key={item.number}>
                  <div className="card-topline">
                    <span>{item.number} / 03</span>
                    <ArrowIcon diagonal />
                  </div>
                  <div>
                    <span className="card-label">{item.label}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section> */}

        <section className="sports section-wrap" id="cabang-olahraga">
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
              <a className="inline-link" href="#informasi">
                Lihat pembaruan <ArrowIcon diagonal />
              </a>
            </div>
            <div className="sports-list" aria-label="Contoh cabang olahraga">
              {sports.map((sport, index) => (
                <div className="sport-item" key={sport}>
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

      <footer className="site-footer">
        <a className="brand footer-brand" href="#beranda">
          <span className="brand-mark" aria-hidden="true">
            P<span>13</span>
          </span>
          <span className="brand-copy">
            <strong>PORPROV</strong>
            <small>KALIMANTAN TENGAH</small>
          </span>
        </a>
        <p>PORPROV XIII Kalimantan Tengah 2026</p>
        <a className="footer-top" href="#beranda">
          KEMBALI KE ATAS <ArrowIcon diagonal />
        </a>
        <span className="footer-note">
          Informasi resmi akan diperbarui oleh penyelenggara.
        </span>
      </footer>
    </>
  );
}
