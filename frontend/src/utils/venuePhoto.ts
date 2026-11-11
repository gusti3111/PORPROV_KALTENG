/**
 * Mapping foto resmi dokumentasi venue PORPROV XIII Kalimantan Tengah di Kotawaringin Barat
 */

const venuePhotoMap: Record<string, string> = {
  "sport center": "/venues/sport-center.webp",
  "stadion": "/venues/sport-center.webp",
  "atletik": "/venues/sport-center.webp",
  "ratu alamsyah": "/venues/sport-center.webp",
  "basket": "/venues/sport-center.webp",
  "karanganyar": "/venues/karanganyar.jpg",
  "koni": "/venues/gor-koni.jpg",
  "billiard": "/venues/gor-koni.jpg",
  "sungai arut": "/venues/sungai-arut.jpg",
  "pangkalan bun park": "/venues/pangkalan-bun-park.jpg",
  "pasir panjang": "/venues/pasir-panjang.jpg",
  "jalan raya": "/venues/koridor-trans-kalimantan.jpg",
  "kumai": "/venues/pelabuhan-kumai.jpg",
  "kiyai gede": "/venues/kotawaringin-lama.jpg",
  "kotawaringin lama": "/venues/kotawaringin-lama.jpg",
  "antakusuma": "/venues/kotawaringin-lama.jpg",
};

export function getVenuePhotoUrl(venueName?: string): string {
  if (!venueName) return "/venues/sport-center.webp";
  const normalized = venueName.toLowerCase();

  for (const [key, url] of Object.entries(venuePhotoMap)) {
    if (normalized.includes(key)) {
      return url;
    }
  }

  return "/venues/sport-center.webp";
}
