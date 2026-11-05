export type VenueCategory =
  | "Stadion & fasilitas olahraga"
  | "Gedung & aula"
  | "Lapangan & rekreasi"
  | "Area umum";

export type Venue = {
  name: string;
  category: VenueCategory;
  note?: string;
  position: [latitude: number, longitude: number];
};

const pangkalanBunCenter: [latitude: number, longitude: number] = [
  -2.6765645, 111.6316259,
];

function estimatePosition(
  latitudeOffset: number,
  longitudeOffset: number,
): Venue["position"] {
  return [
    pangkalanBunCenter[0] + latitudeOffset,
    pangkalanBunCenter[1] + longitudeOffset,
  ];
}

export const venues: Venue[] = [
  {
    name: "Stadion Sampuraga",
    category: "Stadion & fasilitas olahraga",
    note: "Tercantum untuk upacara pembukaan dan penutupan.",
    position: estimatePosition(-0.006, -0.001),
  },
  {
    name: "Stadion Atletik & Sport Center",
    category: "Stadion & fasilitas olahraga",
    position: estimatePosition(0.005, -0.003),
  },
  {
    name: "GOR KONI",
    category: "Stadion & fasilitas olahraga",
    position: estimatePosition(-0.002, 0.006),
  },
  {
    name: "Sport Center",
    category: "Stadion & fasilitas olahraga",
    position: estimatePosition(0.002, 0.004),
  },
  {
    name: "Kolam Renang",
    category: "Stadion & fasilitas olahraga",
    position: estimatePosition(-0.007, -0.004),
  },
  {
    name: "Pangkalan Bun",
    category: "Area umum",
    note: "Tabel menyebut area kota, bukan nama venue tertentu.",
    position: estimatePosition(0, 0),
  },
  {
    name: "Aula Dispora Kobar",
    category: "Gedung & aula",
    position: estimatePosition(-0.004, 0.003),
  },
  {
    name: "Kampung Sega",
    category: "Lapangan & rekreasi",
    position: estimatePosition(0.008, 0.005),
  },
  {
    name: "Aula BKSDA",
    category: "Gedung & aula",
    position: estimatePosition(0.004, 0.009),
  },
  {
    name: "Aula Baperindo",
    category: "Gedung & aula",
    position: estimatePosition(-0.008, 0.008),
  },
  {
    name: "Aula Akpolres Kobar",
    category: "Gedung & aula",
    position: estimatePosition(0.007, -0.008),
  },
  {
    name: "Gedung Transmigrasi",
    category: "Gedung & aula",
    position: estimatePosition(-0.011, -0.007),
  },
  {
    name: "Taman Kota",
    category: "Lapangan & rekreasi",
    position: estimatePosition(0.001, -0.009),
  },
  {
    name: "Pangkalan Bun Park",
    category: "Lapangan & rekreasi",
    position: estimatePosition(-0.003, -0.011),
  },
  {
    name: "Aula Anta Kusuma",
    category: "Gedung & aula",
    position: estimatePosition(0.011, 0.002),
  },
  {
    name: "Aula Kyai Gede",
    category: "Gedung & aula",
    position: estimatePosition(-0.009, 0.001),
  },
  {
    name: "Lapangan Tenis Pasir Panjang",
    category: "Lapangan & rekreasi",
    position: estimatePosition(0.009, -0.004),
  },
  {
    name: "Aula Dikbud",
    category: "Gedung & aula",
    position: estimatePosition(-0.001, 0.011),
  },
  {
    name: "Planet Futsal",
    category: "Stadion & fasilitas olahraga",
    position: estimatePosition(0.012, 0.008),
  },
  {
    name: "Mini Soccer",
    category: "Stadion & fasilitas olahraga",
    note: "Nama tempat pada salinan tabel kurang jelas; perlu konfirmasi panitia.",
    position: estimatePosition(-0.013, 0.004),
  },
];
