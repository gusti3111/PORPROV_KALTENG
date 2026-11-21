const CONTINGENT_LOGOS_BY_ID: Record<number, string> = {
  1: "/logos/kobar.webp",
  2: "/logos/kotim.webp",
  3: "/logos/plk.webp",
  4: "/logos/kps.webp",
  5: "/logos/barsel.webp",
  6: "/logos/barut.webp",
  7: "/logos/bartim.webp",
  8: "/logos/mura.webp",
  9: "/logos/ktn.webp",
  10: "/logos/sry.webp",
  11: "/logos/pulpis.webp",
  12: "/logos/gmas.webp",
  13: "/logos/skm.webp",
  14: "/logos/lmd.webp",
};

const CONTINGENT_LOGOS_BY_KEY: Record<string, string> = {
  "kotawaringin barat": "/logos/kobar.webp",
  kobar: "/logos/kobar.webp",
  "kotawaringin timur": "/logos/kotim.webp",
  kotim: "/logos/kotim.webp",
  "kota palangka raya": "/logos/plk.webp",
  "palangka raya": "/logos/plk.webp",
  plk: "/logos/plk.webp",
  kapuas: "/logos/kps.webp",
  kps: "/logos/kps.webp",
  "barito selatan": "/logos/barsel.webp",
  barsel: "/logos/barsel.webp",
  "barito utara": "/logos/barut.webp",
  barut: "/logos/barut.webp",
  "barito timur": "/logos/bartim.webp",
  bartim: "/logos/bartim.webp",
  "murung raya": "/logos/mura.webp",
  mura: "/logos/mura.webp",
  katingan: "/logos/ktn.webp",
  ktn: "/logos/ktn.webp",
  seruyan: "/logos/sry.webp",
  sry: "/logos/sry.webp",
  "pulang pisau": "/logos/pulpis.webp",
  pulpis: "/logos/pulpis.webp",
  "gunung mas": "/logos/gmas.webp",
  gmas: "/logos/gmas.webp",
  sukamara: "/logos/skm.webp",
  skm: "/logos/skm.webp",
  lamandau: "/logos/lmd.webp",
  lmd: "/logos/lmd.webp",
};

export function getContingentLogoUrl(
  nameOrCode?: string | null,
  contingentId?: number | null,
  explicitLogoUrl?: string | null,
): string | null {
  if (explicitLogoUrl && explicitLogoUrl.trim() !== "") {
    const trimmed = explicitLogoUrl.trim();
    // Normalize legacy .png/.jpg/.jpeg paths in /logos/ to .webp
    const normalizedPath = trimmed.replace(
      /(\/logos\/[^?#]+)\.(png|jpe?g)([?#].*)?$/i,
      "$1.webp$3",
    );
    return normalizedPath;
  }
  if (contingentId && CONTINGENT_LOGOS_BY_ID[contingentId]) {
    return CONTINGENT_LOGOS_BY_ID[contingentId];
  }
  if (!nameOrCode) return null;
  const normalized = nameOrCode
    .trim()
    .toLowerCase()
    .replace(/^(kabupaten|kab\.?)\s+/i, "");
  if (CONTINGENT_LOGOS_BY_KEY[normalized]) {
    return CONTINGENT_LOGOS_BY_KEY[normalized];
  }
  for (const [key, url] of Object.entries(CONTINGENT_LOGOS_BY_KEY)) {
    if (key.length > 3 && normalized.includes(key)) {
      return url;
    }
  }
  return null;
}

