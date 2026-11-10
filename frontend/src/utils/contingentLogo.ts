const CONTINGENT_LOGOS_BY_ID: Record<number, string> = {
  1: "/logos/kobar.png",
  2: "/logos/kotim.png",
  3: "/logos/plk.png",
  4: "/logos/kps.png",
  5: "/logos/barsel.png",
  6: "/logos/barut.png",
  7: "/logos/bartim.png",
  8: "/logos/mura.png",
  9: "/logos/ktn.png",
  10: "/logos/sry.png",
  11: "/logos/pulpis.png",
  12: "/logos/gmas.png",
  13: "/logos/skm.png",
  14: "/logos/lmd.png",
};

const CONTINGENT_LOGOS_BY_KEY: Record<string, string> = {
  "kotawaringin barat": "/logos/kobar.png",
  kobar: "/logos/kobar.png",
  "kotawaringin timur": "/logos/kotim.png",
  kotim: "/logos/kotim.png",
  "kota palangka raya": "/logos/plk.png",
  "palangka raya": "/logos/plk.png",
  plk: "/logos/plk.png",
  kapuas: "/logos/kps.png",
  kps: "/logos/kps.png",
  "barito selatan": "/logos/barsel.png",
  barsel: "/logos/barsel.png",
  "barito utara": "/logos/barut.png",
  barut: "/logos/barut.png",
  "barito timur": "/logos/bartim.png",
  bartim: "/logos/bartim.png",
  "murung raya": "/logos/mura.png",
  mura: "/logos/mura.png",
  katingan: "/logos/ktn.png",
  ktn: "/logos/ktn.png",
  seruyan: "/logos/sry.png",
  sry: "/logos/sry.png",
  "pulang pisau": "/logos/pulpis.png",
  pulpis: "/logos/pulpis.png",
  "gunung mas": "/logos/gmas.png",
  gmas: "/logos/gmas.png",
  sukamara: "/logos/skm.png",
  skm: "/logos/skm.png",
  lamandau: "/logos/lmd.png",
  lmd: "/logos/lmd.png",
};

export function getContingentLogoUrl(
  nameOrCode?: string | null,
  contingentId?: number | null,
  explicitLogoUrl?: string | null,
): string | null {
  if (explicitLogoUrl && explicitLogoUrl.trim() !== "") {
    return explicitLogoUrl.trim();
  }
  if (contingentId && CONTINGENT_LOGOS_BY_ID[contingentId]) {
    return CONTINGENT_LOGOS_BY_ID[contingentId];
  }
  if (!nameOrCode) return null;
  const normalized = nameOrCode
    .trim()
    .toLowerCase()
    .replace(/^kabupaten\s+/i, "");
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

