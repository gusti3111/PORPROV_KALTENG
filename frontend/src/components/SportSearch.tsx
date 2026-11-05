import { useMemo, useState } from "react";
import type { Sport } from "../types/sport";
import ArrowIcon from "./ArrowIcon";

type SportSearchProps = {
  sports: Sport[];
  mainSportsCount: number;
  exhibitionSportsCount: number;
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("id");
}

export default function SportSearch({
  sports,
  mainSportsCount,
  exhibitionSportsCount,
}: SportSearchProps) {
  const [query, setQuery] = useState("");

  const indexedSports = useMemo(() => {
    let mainIndex = 0;
    let exhibitionIndex = 0;

    return sports.map((sport) => ({
      ...sport,
      index: sport.group === "Utama" ? ++mainIndex : ++exhibitionIndex,
    }));
  }, [sports]);

  const filteredSports = useMemo(() => {
    const normalizedQuery = normalizeText(query.trim());
    if (!normalizedQuery) return indexedSports;

    return indexedSports.filter((sport) =>
      normalizeText(`${sport.name} ${sport.group} ${sport.description}`).includes(
        normalizedQuery,
      ),
    );
  }, [indexedSports, query]);

  return (
    <>
      <form
        className="cabor-search"
        role="search"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="sr-only" htmlFor="cabor-search-input">
          Cari cabang olahraga
        </label>
        <svg
          className="cabor-search-icon"
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 4.5 4.5" />
        </svg>
        <input
          id="cabor-search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoComplete="off"
          placeholder="Cari nama cabang olahraga..."
          type="search"
        />
        {query && (
          <button
            className="cabor-search-clear"
            type="button"
            aria-label="Hapus pencarian"
            onClick={() => setQuery("")}
          >
            Hapus
          </button>
        )}
      </form>

      <div className="cabor-count" aria-live="polite">
        <span>
          {query
            ? `HASIL PENCARIAN: ${filteredSports.length}`
            : `${mainSportsCount} CABANG UTAMA + ${exhibitionSportsCount} EKSEBISI`}
        </span>
        <span>
          {String(filteredSports.length).padStart(2, "0")} DARI{" "}
          {String(sports.length).padStart(2, "0")} CABANG
        </span>
      </div>

      {filteredSports.length > 0 ? (
        <div className="cabor-grid">
          {filteredSports.map((sport) => (
            <article key={sport.name} className="cabor-card">
              <div className="cabor-card-top">
                <span className="cabor-card-index">
                  {sport.group === "Utama"
                    ? String(sport.index).padStart(2, "0")
                    : `E${sport.index}`}
                </span>
                <span className="cabor-card-icon" aria-hidden="true">
                  {sport.icon}
                </span>
              </div>
              <div className="cabor-card-info">
                <span className="cabor-category">
                  {sport.group === "Utama" ? "CABANG UTAMA" : "EKSEBISI"}
                </span>
                <h3>{sport.name}</h3>
                <p>{sport.description}</p>
              </div>
              <div className="cabor-card-bottom">
                <span>
                  {sport.group === "Utama" ? "CABANG UTAMA" : "EKSEBISI"}
                </span>
                <ArrowIcon />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="cabor-empty" role="status">
          Tidak ada cabang olahraga yang cocok dengan “{query}”. Coba kata kunci
          lain.
        </p>
      )}
    </>
  );
}
