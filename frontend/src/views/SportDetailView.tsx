import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import SportBracket from "../components/SportBracket";
import { getAPIData, getAPIErrorMessage } from "../api/client";
import type { SportTournament, SportTournamentStanding } from "../api/types";

function standingsTable(groupName: string, standings: SportTournamentStanding[]) {
  return (
    <div className="sport-standings-group">
      <h3>{groupName}</h3>
      <div className="sport-standings-scroll">
        <table className="sport-standings-table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Kontingen</th>
              <th scope="col">Main</th>
              <th scope="col">M</th>
              <th scope="col">S</th>
              <th scope="col">K</th>
              <th scope="col">Poin</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => (
              <tr key={row.contingent}>
                <td>{String(row.rank).padStart(2, "0")}</td>
                <th scope="row">{row.contingent}</th>
                <td>{row.played}</td>
                <td>{row.won}</td>
                <td>{row.drawn}</td>
                <td>{row.lost}</td>
                <td className="sport-points">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="sport-table-legend">M: main · S: seri · K: kalah</p>
    </div>
  );
}

export default function SportDetailView() {
  const { sportId } = useParams();
  const [tournament, setTournament] = useState<SportTournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const id = Number(sportId);
    setTournament(null);
    setError("");

    if (!Number.isInteger(id) || id < 1) {
      setLoading(false);
      setError("ID cabang olahraga tidak valid.");
      return () => {
        active = false;
      };
    }

    setLoading(true);
    void getAPIData<SportTournament>(`/sports/${id}/tournament`)
      .then((data) => {
        if (active) setTournament(data);
      })
      .catch((requestError: unknown) => {
        if (active) setError(getAPIErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [sportId]);

  return (
    <>
      <SiteHeader />
      <main className="sport-detail-page">
        {loading ? (
          <section className="sport-detail-not-found" role="status">
            <span>PORPROV XIII</span>
            <h1>Memuat data turnamen...</h1>
          </section>
        ) : !tournament ? (
          <section className="sport-detail-not-found" role={error ? "alert" : undefined}>
            <span>{error ? "DATA BELUM TERSEDIA" : "404"}</span>
            <h1>{error ? "Klasemen belum dapat dimuat" : "Cabang belum tersedia"}</h1>
            <p>{error || "Belum ada data turnamen untuk cabang olahraga ini."}</p>
            <Link to="/cabor">Kembali ke daftar cabang</Link>
          </section>
        ) : (
          <div className="sport-detail-wrap">
            <Link className="sport-detail-back" to="/cabor">
              <span aria-hidden="true">←</span> Semua cabang olahraga
            </Link>

            <header className="sport-detail-hero">
              <p><span>PORPROV XIII</span> · KALIMANTAN TENGAH 2026</p>
              <h1>{tournament.sport_name}</h1>
              <span className="sport-demo-badge">DATA SIMULASI</span>
              <p className="sport-detail-description">
                Klasemen grup dan bagan penyisihan dimuat dari database melalui API.
              </p>
            </header>

            <div className="sport-detail-notice" role="note">
              Peserta, skor, dan peringkat ini merupakan data dummy di database, bukan hasil pertandingan resmi.
            </div>

            <section className="sport-detail-section" aria-labelledby="sport-standings-title">
              <div className="sport-detail-section-heading">
                <div>
                  <p>FASE GRUP</p>
                  <h2 id="sport-standings-title">Klasemen <span>sementara.</span></h2>
                </div>
                <span className="sport-detail-meta">
                  {tournament.groups.length} GRUP · {tournament.groups.reduce((total, group) => total + group.standings.length, 0)} KONTINGEN
                </span>
              </div>
              <div className="sport-standings-grid">
                {tournament.groups.map((group) =>
                  standingsTable(group.name, group.standings),
                )}
              </div>
            </section>

            <section className="sport-detail-section sport-bracket-section" aria-labelledby="sport-bracket-title">
              <div className="sport-detail-section-heading">
                <div>
                  <p>FASE GUGUR</p>
                  <h2 id="sport-bracket-title">Bagan <span>penyisihan.</span></h2>
                </div>
                <span className="sport-detail-meta">SEMIFINAL · FINAL · PERINGKAT 3</span>
              </div>
              <SportBracket tournament={tournament} />
            </section>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
