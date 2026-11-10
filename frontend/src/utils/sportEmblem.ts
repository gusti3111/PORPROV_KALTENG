export interface SportEmblemInfo {
  emblemUrl: string;
  pictogramUrl: string;
  federationCode: string;
  federationName: string;
}

const SPORT_EMBLEMS_BY_ID: Record<number, SportEmblemInfo> = {
  1: {
    emblemUrl: "/cabor/official/aerosport.png",
    pictogramUrl: "/cabor/aerosport.svg",
    federationCode: "FASI",
    federationName: "Federasi Aero Sport Indonesia",
  },
  2: {
    emblemUrl: "/cabor/official/atletik.png",
    pictogramUrl: "/cabor/atletik.svg",
    federationCode: "PASI",
    federationName: "Persatuan Atletik Seluruh Indonesia",
  },
  3: {
    emblemUrl: "/cabor/official/akuatik.png",
    pictogramUrl: "/cabor/akuatik.svg",
    federationCode: "AI",
    federationName: "Akuatik Indonesia",
  },
  4: {
    emblemUrl: "/cabor/official/bermotor.png",
    pictogramUrl: "/cabor/bermotor.svg",
    federationCode: "IMI",
    federationName: "Ikatan Motor Indonesia",
  },
  5: {
    emblemUrl: "/cabor/official/balap-sepeda.png",
    pictogramUrl: "/cabor/balap-sepeda.svg",
    federationCode: "ISSI",
    federationName: "Ikatan Sport Sepeda Indonesia",
  },
  6: {
    emblemUrl: "/cabor/official/billiard.png",
    pictogramUrl: "/cabor/billiard.svg",
    federationCode: "POBSI",
    federationName: "Persatuan Olahraga Biliar Seluruh Indonesia",
  },
  7: {
    emblemUrl: "/cabor/official/binaraga.png",
    pictogramUrl: "/cabor/binaraga.svg",
    federationCode: "PBFI",
    federationName: "Perkumpulan Binaraga Fitnes Indonesia",
  },
  8: {
    emblemUrl: "/cabor/official/basket.png",
    pictogramUrl: "/cabor/basket.svg",
    federationCode: "PERBASI",
    federationName: "Persatuan Bola Basket Seluruh Indonesia",
  },
  9: {
    emblemUrl: "/cabor/official/bola-voli.png",
    pictogramUrl: "/cabor/bola-voli.svg",
    federationCode: "PBVSI",
    federationName: "Persatuan Bola Voli Seluruh Indonesia",
  },
  10: {
    emblemUrl: "/cabor/official/bridge.png",
    pictogramUrl: "/cabor/bridge.svg",
    federationCode: "GABSI",
    federationName: "Gabungan Bridge Seluruh Indonesia",
  },
  11: {
    emblemUrl: "/cabor/official/bulutangkis.png",
    pictogramUrl: "/cabor/bulutangkis.svg",
    federationCode: "PBSI",
    federationName: "Persatuan Bulutangkis Seluruh Indonesia",
  },
  12: {
    emblemUrl: "/cabor/official/catur.png",
    pictogramUrl: "/cabor/catur.svg",
    federationCode: "PERCASI",
    federationName: "Persatuan Catur Seluruh Indonesia",
  },
  13: {
    emblemUrl: "/cabor/official/dayung.png",
    pictogramUrl: "/cabor/dayung.svg",
    federationCode: "PODSI",
    federationName: "Persatuan Olahraga Dayung Seluruh Indonesia",
  },
  14: {
    emblemUrl: "/cabor/official/drumband.png",
    pictogramUrl: "/cabor/drumband.svg",
    federationCode: "PDBI",
    federationName: "Persatuan Drum Band Indonesia",
  },
  15: {
    emblemUrl: "/cabor/official/dancesport.png",
    pictogramUrl: "/cabor/dancesport.svg",
    federationCode: "IODI",
    federationName: "Ikatan Olahraga Dancesport Indonesia",
  },
  16: {
    emblemUrl: "/cabor/official/esport.png",
    pictogramUrl: "/cabor/esport.svg",
    federationCode: "ESI",
    federationName: "Pengurus Besar Esports Indonesia",
  },
  17: {
    emblemUrl: "/cabor/official/gimnastik.png",
    pictogramUrl: "/cabor/gimnastik.svg",
    federationCode: "PERSANI",
    federationName: "Persatuan Senam Indonesia",
  },
  18: {
    emblemUrl: "/cabor/official/judo.png",
    pictogramUrl: "/cabor/judo.svg",
    federationCode: "PJSI",
    federationName: "Persatuan Judo Seluruh Indonesia",
  },
  19: {
    emblemUrl: "/cabor/official/karate.png",
    pictogramUrl: "/cabor/karate.svg",
    federationCode: "FORKI",
    federationName: "Federasi Olahraga Karatedo Indonesia",
  },
  20: {
    emblemUrl: "/cabor/official/korfball.png",
    pictogramUrl: "/cabor/korfball.svg",
    federationCode: "PKSI",
    federationName: "Persatuan Korfball Seluruh Indonesia",
  },
  21: {
    emblemUrl: "/cabor/official/mma.png",
    pictogramUrl: "/cabor/mma.svg",
    federationCode: "IBCA-MMA",
    federationName: "Indonesia Bela Diri Campuran Amatir MMA",
  },
  22: {
    emblemUrl: "/cabor/official/panahan.png",
    pictogramUrl: "/cabor/panahan.svg",
    federationCode: "PERPANI",
    federationName: "Persatuan Panahan Indonesia",
  },
  23: {
    emblemUrl: "/cabor/official/panjat-tebing.png",
    pictogramUrl: "/cabor/panjat-tebing.svg",
    federationCode: "FPTI",
    federationName: "Federasi Panjat Tebing Indonesia",
  },
  24: {
    emblemUrl: "/cabor/official/pencak-silat.png",
    pictogramUrl: "/cabor/pencak-silat.svg",
    federationCode: "IPSI",
    federationName: "Ikatan Pencak Silat Indonesia",
  },
  25: {
    emblemUrl: "/cabor/official/sepak-takraw.png",
    pictogramUrl: "/cabor/sepak-takraw.svg",
    federationCode: "PSTI",
    federationName: "Persatuan Sepak Takraw Indonesia",
  },
  26: {
    emblemUrl: "/cabor/official/sepatu-roda.png",
    pictogramUrl: "/cabor/sepatu-roda.svg",
    federationCode: "PORSEROSI",
    federationName: "Persatuan Olahraga Sepatu Roda Seluruh Indonesia",
  },
  27: {
    emblemUrl: "/cabor/official/sepak-bola.png",
    pictogramUrl: "/cabor/sepak-bola.svg",
    federationCode: "PSSI",
    federationName: "Persatuan Sepak Bola Seluruh Indonesia",
  },
  28: {
    emblemUrl: "/cabor/official/taekwondo.png",
    pictogramUrl: "/cabor/taekwondo.svg",
    federationCode: "TI",
    federationName: "Taekwondo Indonesia",
  },
  29: {
    emblemUrl: "/cabor/official/tenis-lapangan.png",
    pictogramUrl: "/cabor/tenis-lapangan.svg",
    federationCode: "PELTI",
    federationName: "Persatuan Tenis Seluruh Indonesia",
  },
  30: {
    emblemUrl: "/cabor/official/tenis-meja.png",
    pictogramUrl: "/cabor/tenis-meja.svg",
    federationCode: "PTMSI",
    federationName: "Persatuan Tenis Meja Seluruh Indonesia",
  },
  31: {
    emblemUrl: "/cabor/official/tinju.png",
    pictogramUrl: "/cabor/tinju.svg",
    federationCode: "PERTINA",
    federationName: "Persatuan Tinju Amatir Indonesia",
  },
  32: {
    emblemUrl: "/cabor/official/sepak-bola-mini.png",
    pictogramUrl: "/cabor/sepak-bola-mini.svg",
    federationCode: "KSMI",
    federationName: "Komite Sepak Bola Mini Indonesia",
  },
};

const SPORT_ID_BY_KEYWORD: Array<[string, number]> = [
  ["aerosport", 1],
  ["atletik", 2],
  ["akuatik", 3],
  ["bermotor", 4],
  ["balap sepeda", 5],
  ["billiard", 6],
  ["binaraga", 7],
  ["basket", 8],
  ["bola voli", 9],
  ["bridge", 10],
  ["bulutangkis", 11],
  ["catur", 12],
  ["dayung", 13],
  ["drumband", 14],
  ["dancesport", 15],
  ["e-sport", 16],
  ["esport", 16],
  ["gimnastik", 17],
  ["judo", 18],
  ["karate", 19],
  ["korfball", 20],
  ["mma", 21],
  ["panahan", 22],
  ["panjat tebing", 23],
  ["pencak silat", 24],
  ["sepak takraw", 25],
  ["sepatu roda", 26],
  ["sepak bola mini", 32],
  ["sepak bola", 27],
  ["taekwondo", 28],
  ["tenis lapangan", 29],
  ["tenis meja", 30],
  ["tinju", 31],
];

export function getSportEmblemInfo(
  sportId?: number | null,
  sportName?: string | null,
): SportEmblemInfo | null {
  if (sportId && SPORT_EMBLEMS_BY_ID[sportId]) {
    return SPORT_EMBLEMS_BY_ID[sportId];
  }
  if (!sportName) return null;
  const normalized = sportName.trim().toLowerCase();
  for (const [keyword, id] of SPORT_ID_BY_KEYWORD) {
    if (normalized.includes(keyword)) {
      return SPORT_EMBLEMS_BY_ID[id];
    }
  }
  return null;
}
