/**
 * Mapping foto resmi dokumentasi venue PORPROV XIII Kalimantan Tengah di Kotawaringin Barat
 * Menggunakan aset real dari /venues2/
 * Catatan: Aula Kiyai Gede & Karanganyar dibiarkan kosong ("") sesuai permintaan.
 */

const venuePhotoMap: Array<[string, string]> = [
  // 1. Dibiarkan kosong dulu
  ["kiyai gede", ""],
  ["binaraga", ""],
  ["dancesport", ""],
  ["gimnastik", ""],
  ["karanganyar", ""],
  ["karang anyar", ""],

  // 2. Venue spesifik dengan foto di /venues2/ (prioritas sebelum keyword umum seperti 'futsal' atau 'sport center')
  ["jalan raya", "/venues2/jalanRaya.jpg"],
  ["balap sepeda", "/venues2/jalanRaya.jpg"],
  ["koridor", "/venues2/jalanRaya.jpg"],
  ["lapangan tenis", "/venues2/LapanganTenisPasirPanjang.jpeg"],
  ["tenis pasir panjang", "/venues2/LapanganTenisPasirPanjang.jpeg"],
  ["tenis lapangan", "/venues2/LapanganTenisPasirPanjang.jpeg"],

  ["lintasan", "/venues2/LintasanAtletik.jpeg"],
  ["atletik", "/venues2/LintasanAtletik.jpeg"],

  ["juvenza", "/venues2/juvenza.png"],
  ["tinju", "/venues2/juvenza.png"],

  ["samari", "/venues2/samari.jpg"],
  ["karate", "/venues2/samari.jpg"],

  ["gor koni", "/venues2/GORKoni.jpg"],
  ["koni", "/venues2/GORKoni.jpg"],
  ["bulutangkis", "/venues2/GORKoni.jpg"],

  ["onix", "/venues2/Onix.jpg"],
  ["billiard", "/venues2/Onix.jpg"],

  ["antakusuma", "/venues2/aulaAntakusuma.jpeg"],
  ["pencak silat", "/venues2/aulaAntakusuma.jpeg"],
  ["taekwondo", "/venues2/aulaAntakusuma.jpeg"],

  ["disdikbud", "/venues2/aulaDISKDIKBUD.jpg"],
  ["disdik", "/venues2/aulaDISKDIKBUD.jpg"],
  ["tenis meja", "/venues2/aulaDISKDIKBUD.jpg"],

  ["dispora", "/venues2/aulaDisipora.jpeg"],
  ["disipora", "/venues2/aulaDisipora.jpeg"],
  ["bridge", "/venues2/aulaDisipora.jpeg"],

  ["bapperida", "/venues2/bapperida.jpg"],
  ["catur", "/venues2/bapperida.jpg"],

  ["mapolres", "/venues2/mapolres.jpg"],
  ["judo", "/venues2/mapolres.jpg"],

  ["kampung sega", "/venues2/kampungSega.jpg"],
  ["sega", "/venues2/kampungSega.jpg"],
  ["sungai arut", "/venues2/kampungSega.jpg"],
  ["dayung", "/venues2/kampungSega.jpg"],

  ["isen mulang", "/venues2/kolamIsenMulang.jpg"],
  ["kolam renang", "/venues2/kolamIsenMulang.jpg"],
  ["akuatik", "/venues2/kolamIsenMulang.jpg"],

  ["pangkalan bun park", "/venues2/pangakalnbunpark.jpg"],
  ["mma", "/venues2/pangakalnbunpark.jpg"],
  ["panjat tebing", "/venues2/pangakalnbunpark.jpg"],

  ["sabaru", "/venues2/sirkuitsabaru.jpg"],
  ["sirkuit", "/venues2/sirkuitsabaru.jpg"],
  ["balap motor", "/venues2/sirkuitsabaru.jpg"],
  ["motoprix", "/venues2/sirkuitsabaru.jpg"],

  ["minisoccer", "/venues2/soccer88.jpeg"],
  ["mini soccer", "/venues2/soccer88.jpeg"],
  ["r88", "/venues2/soccer88.jpeg"],
  ["soccer88", "/venues2/soccer88.jpeg"],
  ["sepak bola mini", "/venues2/soccer88.jpeg"],

  // 3. Stadion -> menggunakan /venues2/stadion.jpeg
  ["stadion", "/venues2/stadion.jpeg"],
  ["sepak bola", "/venues2/stadion.jpeg"],

  // 4. GOR Sport Center -> menggunakan /venues2/gorSportCenter.jpg
  ["gor sport center", "/venues2/gorSportCenter.jpg"],
  ["gor sportcenter", "/venues2/gorSportCenter.jpg"],
  ["ratu alamsyah", "/venues2/gorSportCenter.jpg"],
  ["gor indoor", "/venues2/gorSportCenter.jpg"],

  // 5. Sport Center (Kompleks), Basket, Futsal, Voli, Indoor -> menggunakan /venues2/sportCenter.jpg
  ["basket", "/venues2/sportCenter.jpg"],
  ["futsal", "/venues2/sportCenter.jpg"],
  ["voli", "/venues2/sportCenter.jpg"],
  ["indoor", "/venues2/sportCenter.jpg"],
  ["sport center", "/venues2/sportCenter.jpg"],
  ["sepak takraw", "/venues2/sportCenter.jpg"],
];

export function getVenuePhotoUrl(venueName?: string, additionalText?: string): string {
  if (!venueName) return "/venues2/sportCenter.jpg";
  const normalized = `${venueName} ${additionalText || ""}`.toLowerCase();

  if (
    normalized.includes("gor") &&
    !normalized.includes("koni") &&
    (normalized.includes("sport center") || normalized.includes("sportcenter"))
  ) {
    return "/venues2/gorSportCenter.jpg";
  }

  for (const [key, url] of venuePhotoMap) {
    if (normalized.includes(key)) {
      return url;
    }
  }
  return "/venues2/sportCenter.jpg";
}
