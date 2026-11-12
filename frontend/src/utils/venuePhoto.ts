/**
 * Mapping foto resmi dokumentasi venue PORPROV XIII Kalimantan Tengah di Kotawaringin Barat
 */

const venuePhotoMap: Record<string, string> = {
  // 1. Tenis Lapangan (Diprioritaskan sebelum 'pasir panjang' agar tidak tertimpa)
  "lapangan tenis": "/venues/LapanganTennisPasirPanjang.webp",
  "tenis pasir panjang": "/venues/LapanganTennisPasirPanjang.webp",
  "tenis lapangan": "/venues/LapanganTennisPasirPanjang.webp",

  // 2. Stadion Sepak Bola (Diprioritaskan sebelum 'sport center')
  "stadion sepak bola": "/venues/StadionSportCenter.jpeg",
  "stadion sport center": "/venues/StadionSportCenter.jpeg",
  "stadion": "/venues/StadionSportCenter.jpeg",

  // 3. Tinju / Juvenza Futsal
  "juvenza": "/venues/juvenza.webp",
  "tinju": "/venues/juvenza.webp",

  // 4. Tenis Meja / Aula Disdikbud
  "disdikbud": "/venues/aulaDISDIKBUD.webp",
  "disdik": "/venues/aulaDISDIKBUD.webp",
  "tenis meja": "/venues/aulaDISDIKBUD.webp",

  // 5. Sirkuit Sabaru / Balap Motor
  "sabaru": "/venues/sirkuitsabarupalangka.jpeg",
  "sirkuit": "/venues/sirkuitsabarupalangka.jpeg",
  "balap motor": "/venues/sirkuitsabarupalangka.jpeg",
  "motoprix": "/venues/sirkuitsabarupalangka.jpeg",

  // 6. Kolam Renang / Akuatik
  "isen mulang": "/venues/kolamRenang.webp",
  "kolam renang": "/venues/kolamRenang.webp",
  "akuatik": "/venues/kolamRenang.webp",

  // 7. Sport Center & GOR
  "ratu alamsyah": "/venues/GORSportCenter.jpeg",
  "sport center": "/venues/GORSportCenter.jpeg",
  "basket": "/venues/sport-center.webp",
  "atletik": "/venues/lintasanAtletik.jpeg",
  "lintasan": "/venues/lintasanAtletik.jpeg",
  "track": "/venues/trackLari.webp",

  // 8. GOR KONI
  "gor koni": "/venues/GORKoni.jpg",
  "koni": "/venues/GORKoni.jpg",

  // 9. Billiard
  "billiard": "/venues/OnixBilliard.webp",
  "onix": "/venues/OnixBilliard.webp",

  // 10. Minisoccer R88
  "minisoccer": "/venues/minisoccer88.jpeg",
  "r88": "/venues/minisoccer88.jpeg",
  "mini soccer": "/venues/minisoccer88.jpeg",
  "mini88": "/venues/minisoccer88.jpeg",
  "sepak bola mini": "/venues/minisoccer88.jpeg",

  // 11. Dayung / Kampung Sega / Sungai Arut
  "sega": "/venues/kampung-sega.jpeg",
  "sungai arut": "/venues/sungai-arut.jpg",
  "dayung": "/venues/sungai-arut.jpg",

  // 12. Pangkalan Bun Park
  "pangkalan bun park": "/venues/pangkalan-bun-park.jpg",

  // 13. Desa Adat Pasir Panjang
  "pasir panjang": "/venues/pasir-panjang.jpg",

  // 14. Balap Sepeda / Jalan Raya
  "jalan raya": "/venues/jalanraya.jpg",
  "balap sepeda": "/venues/jalanraya.jpg",
  "koridor": "/venues/koridor-trans-kalimantan.jpg",

  // 15. Aerosport / Karanganyar
  "karanganyar": "/venues/karanganyar.jpg",
  "aerosport": "/venues/karanganyar.jpg",

  // 16. Pelabuhan Kumai
  "kumai": "/venues/pelabuhan-kumai.jpg",

  // 17. Aula Kiyai Gede & Antakusuma
  "kiyai gede": "/venues/kotawaringin-lama.jpg",
  "kotawaringin lama": "/venues/kotawaringin-lama.jpg",
  "antakusuma": "/venues/kotawaringin-lama.jpg",
};

export function getVenuePhotoUrl(venueName?: string, additionalText?: string): string {
  if (!venueName) return "/venues/GORSportCenter.jpeg";
  const normalized = `${venueName} ${additionalText || ""}`.toLowerCase();

  for (const [key, url] of Object.entries(venuePhotoMap)) {
    if (normalized.includes(key)) {
      return url;
    }
  }
  return "/venues/GORSportCenter.jpeg";
}
