export type WisataItem = {
  id: number;
  name: string;
  category: string;
  district: string;
  description: string;
  highlights: string;
  image: string;
  mapsUrl: string;
  openInfo: string;
};

export const wisataKobarData: WisataItem[] = [
  {
    id: 1,
    name: "Taman Nasional Tanjung Puting",
    category: "EKOWISATA DUNIA & KONSERVASI",
    district: "Kecamatan Kumai",
    description: "Cagar biosfer dunia dan habitat alami orangutan liar terbesar di bumi, menyuguhkan petualangan susur Sungai Sekonyer dengan kapal klotok tradisional.",
    highlights: "Camp Leakey, Feeding Orangutan, Hutan Hujan Tropis Basah & Kunang-kunang Malam",
    image: "/wisata_real/tanjungputing.jpg",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Taman+Nasional+Tanjung+Puting",
    openInfo: "Akses via Pelabuhan Kumai (Pintu Masuk Utama)",
  },
  {
    id: 2,
    name: "Pantai Kubu & Teluk Bogam",
    category: "WISATA BAHARI & PESISIR",
    district: "Kecamatan Kumai",
    description: "Kawasan pesisir pantai berpasir putih luas menghadap Laut Jawa dengan jembatan dermaga ulin kayu yang estetik dan sajian seafood segar khas nelayan.",
    highlights: "Sunset Spektakuler, Dermaga Ulin Panjang, Spot Foto Estetik & Ikan Bakar Pesisir",
    image: "/venues/pasir-panjang.jpg",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Pantai+Kubu+Pangkalan+Bun",
    openInfo: "± 30 Menit dari Pusat Kota / Buka Setiap Hari",
  },
  {
    id: 3,
    name: "Istana Kuning Pangkalan Bun",
    category: "CAGAR BUDAYA & KESULTANAN",
    district: "Arut Selatan (Pusat Kota)",
    description: "Istana peninggalan Kesultanan Kutaringin yang dibangun pada abad ke-18 sepenuhnya dari kayu ulin, menyimpan benda pusaka kerajaan dan meriam kuno.",
    highlights: "Arsitektur Kayu Ulin Kuno, Balairung Kerajaan, Artefak Pusaka & Sejarah Kutaringin",
    image: "/wisata_real/istanaKuning.jpeg",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Istana+Kuning+Pangkalan+Bun",
    openInfo: "Kelurahan Raja, Arut Selatan / Area Bersejarah",
  },
  {
    id: 4,
    name: "Rumah Betang Pasir Panjang",
    category: "ADAT DAYAK TOMUN & SENI",
    district: "Desa Adat Pasir Panjang",
    description: "Rumah panggung tradisional suku Dayak Tomun yang kokoh dan megah, pusat pelestarian kesenian tari, upacara adat, dan kerajinan anyaman tradisional.",
    highlights: "Rumah Panjang Asli Dayak, Pagelaran Tari Tradisional, Ukiran Etnik & Suasana Rindang",
    image: "/wisata_real/Rumah_Betang.JPG",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rumah+Betang+Pasir+Panjang",
    openInfo: "± 10 Menit dari Pusat Kota Pangkalan Bun",
  },
  {
    id: 5,
    name: "Susur Sungai Arut & Kampung Sega",
    category: "WISATA AIR & RUMAH LANTING",
    district: "Mendawai, Pangkalan Bun",
    description: "Nikmati denyut nadi masyarakat tepi air Pangkalan Bun dengan getek / perahu kelotok tradisional melintasi deretan rumah lanting terapung.",
    highlights: "Rumah Lanting Apung, Kelotok Tradisional, Kuliner Tepi Sungai & Arena Dayung PORPROV",
    image: "/wisata_real/kampungsega.jpg",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Kampung+Sega+Sungai+Arut",
    openInfo: "Venue Resmi Cabang Olahraga Dayung PORPROV XIII",
  },
  {
    id: 6,
    name: "Kotawaringin Lama & Masjid Kyai Gede",
    category: "SEJARAH ISLAM & ZIARAH",
    district: "Kecamatan Kotawaringin Lama",
    description: "Pusat peradaban Islam tertua di Kalimantan Tengah dengan Masjid Kyai Gede berkonstruksi kayu belian berusia ratusan tahun dan Astana Al-Nursari.",
    highlights: "Masjid Tertua Kalteng (>300 Tahun), Tiang Soko Guru Kayu Ulin Asli & Makam Ulama",
    image: "/venues/kotawaringin-lama.jpg",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Masjid+Kyai+Gede+Kotawaringin+Lama",
    openInfo: "Cagar Budaya Nasional / Terhubung Jalur Trans",
  },
  {
    id: 7,
    name: "Pangkalan Bun Park & Taman Kota",
    category: "TAMAN KOTA & RUANG TERBUKA",
    district: "Jl. HM. Rafii, Pangkalan Bun",
    description: "Kawasan ruang terbuka hijau favorit warga dengan pepohonan rindang, sarana olahraga santai, penangkaran rusa, dan deretan kafe kuliner malam.",
    highlights: "Jogging Track Rindang, Penangkaran Rusa, Area Bermain Keluarga & Wisata Kuliner Malam",
    image: "/venues/pangkalan-bun-park.jpg",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Pangkalan+Bun+Park",
    openInfo: "Pusat Kota / Terbuka 24 Jam",
  },
  {
    id: 8,
    name: "Gosong Senggora & Gugusan Karang",
    category: "BAHARI & SNORKELING",
    district: "Perairan Laut Kumai",
    description: "Taman wisata perairan berupa pulau pasir timbul eksotis di tengah laut dengan gugusan terumbu karang alami yang menjadi tempat bertelur penyu hijau.",
    highlights: "Pulau Pasir Putih Timbul, Snorkeling Air Jernih, Terumbu Karang Sehat & Habitat Penyu",
    image: "/wisata_real/gosong.webp",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Gosong+Senggora+Kumai",
    openInfo: "Perjalanan Kapal Wisata dari Pelabuhan Kumai",
  },
];

