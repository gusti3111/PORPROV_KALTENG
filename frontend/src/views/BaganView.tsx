import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import SportBracket from "../components/SportBracket";
import { getAPIData, getAPIErrorMessage } from "../api/client";
import type { Sport, SportTournament } from "../api/types";

type BracketEntry = {
  id: number;
  tournament: SportTournament;
};

export default function BaganView() {
  const [entries, setEntries] = useState<BracketEntry[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    void getAPIData<Sport[]>("/sports/")
      .then((sports) =>
        Promise.all(
          sports.slice(0, 10).map(async (sport) => ({
            id: sport.id,
            tournament: await getAPIData<SportTournament>(
              `/sports/${sport.id}/tournament`,
            ),
          })),
        ),
      )
      .then((data) => {
        if (active) setEntries(data);
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
  }, []);

  const visibleEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id");
    if (!normalizedQuery) return entries;

    return entries.filter(({ tournament }) => {
      const searchableText = [
        tournament.sport_name,
        ...tournament.groups.flatMap((group) => [
          group.name,
          ...group.standings.map((standing) => standing.contingent),
        ]),
        ...tournament.semifinals.map((match) => match.label),
      ]
        .join(" ")
        .toLocaleLowerCase("id");
      return searchableText.includes(normalizedQuery);
    });
  }, [entries, query]);

  return (
    <>
      <SiteHeader />
      <main className="bagan-page">
        <section className="bagan-page-hero">
          <div className="bagan-page-hero-inner">
            <p><span /> PORPROV XIII · KALIMANTAN TENGAH 2026</p>
            <h1>Bagan <span>pertandingan.</span></h1>
            <p className="bagan-page-description">
              Cari cabang olahraga dan ikuti alur pertandingan dari semifinal menuju final.
            </p>
          </div>
          <img
            className="bagan-page-hero-illustration"
            src="/burungBagan.png"
            alt="Maskot PORPROV menunjuk papan bagan pertandingan"
          />
        </section>

        <section className="bagan-main" aria-label="Daftar bagan pertandingan">
          <div className="bagan-search">
            <Search aria-hidden="true" />
            <label className="sr-only" htmlFor="bagan-search-input">Cari cabang olahraga atau kontingen</label>
            <Input
              id="bagan-search-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari cabor atau kontingen..."
              type="search"
              className="h-11 border-0 px-0 shadow-none focus-visible:ring-0"
            />
            {query && (
              <button className="bagan-search-clear" type="button" onClick={() => setQuery("")}>
                Hapus
              </button>
            )}
          </div>

          <div className="bagan-count" aria-live="polite">
            <span>
              {loading
                ? "MEMUAT BAGAN DARI DATABASE..."
                : `${visibleEntries.length} CABANG MEMILIKI BAGAN SIMULASI`}
            </span>
            <span>DATA DUMMY · 10 CABANG</span>
          </div>

          {error && <p className="bagan-state" role="alert">Bagan belum dapat dimuat: {error}</p>}
          {loading && <p className="bagan-state" role="status">Memuat daftar bagan pertandingan...</p>}
          {!loading && !error && visibleEntries.length === 0 && (
            <p className="bagan-state" role="status">Tidak ada bagan yang cocok dengan “{query}”.</p>
          )}

          {!loading && !error && visibleEntries.length > 0 && (
            <div className="bagan-event-list">
              {visibleEntries.map(({ id, tournament }, index) => (
                <article className="bagan-event-card" key={id}>
                  <header className="bagan-event-heading">
                    <div className="bagan-event-title">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <p>{tournament.sport_name.toLocaleUpperCase("id")}</p>
                        <h2>Bagan {tournament.sport_name}</h2>
                      </div>
                    </div>
                    <Link to={`/cabor/${id}`}>
                      Klasemen cabor <ArrowUpRight aria-hidden="true" />
                    </Link>
                  </header>
                  <SportBracket tournament={tournament} />
                  <p className="bagan-event-disclaimer">Bagan dan skor contoh untuk gambaran tampilan kompetisi.</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
