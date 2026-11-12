/**
 * Mapping foto resmi dokumentasi venue PORPROV XIII Kalimantan Tengah di Kotawaringin Barat
 */

const venuePhotoMap: Record<string, string> = {
  "sabaru": "/venues/sirkuitsabarupalangka.jpeg",
  "sirkuit": "/venues/sirkuitsabarupalangka.jpeg",
  "balap motor": "/venues/sirkuitsabarupalangka.jpeg",
  "motoprix": "/venues/sirkuitsabarupalangka.jpeg",
  "isen mulang": "/venues/kolamRenang.webp",
  "kolam renang": "/venues/kolamRenang.webp",
  "akuatik": "/venues/kolamRenang.webp",
  "sport center": "/venues/GORSportCenter.jpeg",
  "stadion": "/venues/sport-center.webp",
  "atletik": "/venues/trackLari.webp",
  "ratu alamsyah": "/venues/GORSportCenter.jpeg",
  "basket": "/venues/sport-center.webp",
  "karanganyar": "/venues/karanganyar.jpg",
  "koni": "/venues/gor-koni.jpg",
  "billiard": "/venues/OnixBilliard.webp",
  "sungai arut": "/venues/sungai-arut.jpg",
  "pangkalan bun park": "/venues/pangkalan-bun-park.jpg",
  "pasir panjang": "/venues/pasir-panjang.jpg",
  "jalan raya": "/venues/jalanraya.jpg",
  "kumai": "/venues/pelabuhan-kumai.jpg",
  "kiyai gede": "/venues/kotawaringin-lama.jpg",
  "kotawaringin lama": "/venues/kotawaringin-lama.jpg",
  "antakusuma": "/venues/kotawaringin-lama.jpg",
  "sega": "/venues/kampung-sega.jpeg",
  "lintasan": "/venues/lintasanAtletik.jpeg",

};

export function getVenuePhotoUrl(venueName?: string, additionalText?: string): string {
  if (!venueName) return "/venues/sport-center.webp";
  const normalized = `${venueName} ${additionalText || ""}`.toLowerCase();

  for (const [key, url] of Object.entries(venuePhotoMap)) {
    if (normalized.includes(key)) {
      return url;
    }
  }
  return "/venues/sport-center.webp";
}

