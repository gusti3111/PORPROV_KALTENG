import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Sport } from "../types/sport";
import { getSportEmblemInfo } from "../utils/sportEmblem";
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
        <Input
          id="cabor-search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoComplete="off"
          placeholder="Cari nama cabang olahraga..."
          type="search"
          className="h-10 border-0 px-0 shadow-none focus-visible:ring-0"
        />
        {query && (
          <Button
            className="cabor-search-clear"
            variant="ghost"
            size="sm"
            type="button"
            aria-label="Hapus pencarian"
            onClick={() => setQuery("")}
          >
            Hapus
          </Button>
        )}
      </form>

      <div className="cabor-count" aria-live="polite">
        <span>
          {query
            ? `HASIL PENCARIAN: ${filteredSports.length}`
            : exhibitionSportsCount > 0
            ? `${mainSportsCount} CABANG UTAMA + ${exhibitionSportsCount} EKSEBISI`
            : `${mainSportsCount} CABANG OLAHRAGA RESMI`}
        </span>
        <span>
          {String(filteredSports.length).padStart(2, "0")} DARI{" "}
          {String(sports.length).padStart(2, "0")} CABANG
        </span>
      </div>

      {filteredSports.length > 0 ? (
        <div className="cabor-grid">
          {filteredSports.map((sport) => {
            const emblem = getSportEmblemInfo(sport.id, sport.name);
            return (
              <Link
                key={sport.name}
                className="cabor-card"
                to={sport.id ? `/cabor/${sport.id}` : "/cabor"}
                aria-label={sport.name}
              >
                {emblem && (
                  <img
                    src={emblem.pictogramUrl}
                    alt=""
                    aria-hidden="true"
                    className="cabor-card-watermark"
                    loading="lazy"
                  />
                )}
                <div className="cabor-card-top">
                  <span className="cabor-card-index">
                    {sport.group === "Utama"
                      ? String(sport.index).padStart(2, "0")
                      : `E${sport.index}`}
                  </span>
                  {emblem ? (
                    <div className="cabor-card-badges">
                      <span
                        className="cabor-card-pictogram-badge"
                        title={`Simbol Cabang Olahraga ${sport.name}`}
                      >
                        <img
                          src={emblem.pictogramUrl}
                          alt={`Piktogram ${sport.name}`}
                          className="cabor-card-pictogram-img"
                          loading="lazy"
                        />
                      </span>
                      <span
                        className="cabor-card-icon"
                        title={`Logo Resmi ${emblem.federationCode} (${emblem.federationName})`}
                      >
                        <img
                          src={emblem.emblemUrl}
                          alt={`Logo Resmi ${emblem.federationCode} - ${sport.name}`}
                          className="cabor-card-emblem-img"
                          loading="lazy"
                        />
                      </span>
                    </div>
                  ) : (
                    <span className="cabor-card-icon" aria-hidden="true">
                      {sport.icon}
                    </span>
                  )}
                </div>
                <div className="cabor-card-info">
                  <span className="cabor-category">
                    {sport.group === "Utama" ? "CABANG UTAMA" : "EKSEBISI"}
                    {emblem ? ` • ${emblem.federationCode}` : ""}
                  </span>
                  <h3>{sport.name}</h3>
                  <p>{sport.description}</p>
                </div>
                <div className="cabor-card-bottom">
                  <span>
                    {emblem
                      ? `${emblem.federationName.toUpperCase()}`
                      : sport.group === "Utama"
                        ? "CABANG UTAMA"
                        : "EKSEBISI"}
                  </span>
                  <ArrowIcon />
                </div>
              </Link>
            );
          })}
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
