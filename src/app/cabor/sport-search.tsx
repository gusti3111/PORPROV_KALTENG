"use client";

import { useMemo, useState } from "react";

export type Sport = {
  name: string;
  group: "Utama" | "Eksebisi";
  icon: string;
  description: string;
};

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

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M5 15 15 5M6 5h9v9" />
    </svg>
  );
}

export default function SportSearch({
  sports,
  mainSportsCount,
  exhibitionSportsCount,
}: SportSearchProps) {
  const [query, setQuery] = useState("");
  const filteredSports = useMemo(() => {
    const normalizedQuery = normalizeText(query.trim());
    if (!normalizedQuery) return sports;

    return sports.filter((sport) =>
      normalizeText(`${sport.name} ${sport.group} ${sport.description}`).includes(
        normalizedQuery,
      ),
    );
  }, [query, sports]);

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
          aria-hidden="true"
          className="cabor-search-icon"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 4.5 4.5" />
        </svg>
        <input
          autoComplete="off"
          id="cabor-search-input"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari nama cabang olahraga..."
          type="search"
          value={query}
        />
        {query && (
          <button
            aria-label="Hapus pencarian"
            className="cabor-search-clear"
            onClick={() => setQuery("")}
            type="button"
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
          {filteredSports.map((sport) => {
            const originalIndex = sports.indexOf(sport);
            const index =
              sport.group === "Utama"
                ? sports
                    .slice(0, originalIndex)
                    .filter((entry) => entry.group === "Utama").length + 1
                : originalIndex -
                  sports.filter((entry) => entry.group === "Utama").length +
                  1;

            return (
              <article className="cabor-card" key={sport.name}>
                <div className="cabor-card-top">
                  <span className="cabor-card-index">
                    {sport.group === "Utama"
                      ? String(index).padStart(2, "0")
                      : `E${index}`}
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
            );
          })}
        </div>
      ) : (
        <p className="cabor-empty" role="status">
          Tidak ada cabang olahraga yang cocok dengan “{query}”. Coba kata
          kunci lain.
        </p>
      )}
    </>
  );
}
