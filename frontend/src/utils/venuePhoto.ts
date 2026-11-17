/**
 * Mapping foto dokumentasi resmi venue PORPROV XIII Kalimantan Tengah (Kotawaringin Barat).
 *
 * CARA EDIT / UPDATE FOTO VENUE:
 * 1. Simpan file foto baru ke folder: `frontend/public/venues2/`
 *    (pastikan nama file & ekstensi sama persis / case-sensitive, mis. `.jpg` vs `.JPG`).
 * 2. Cari blok komentar nama venue yang ingin diubah di `venuePhotoMap` di bawah,
 *    lalu ganti path-nya menjadi `"/venues2/NamaFileBaru.ext"` (atau `""` jika belum ada foto).
 * 3. Aturan penting:
 *    - Semua kata kunci (kolom kiri) WAJIB huruf kecil.
 *    - Pencocokan berjalan dari ATAS ke BAWAH (yang paling spesifik harus di atas
 *      kata kunci umum seperti `"sport center"` atau `"futsal"`).
 */

const venuePhotoMap: Array<[string, string]> = [
  // --- Venue: Aula Kiyai Gede (Binaraga Fitnes) ---
  ["kiyai gede", "/venues2/AulaKiyaiGede.JPG"],
  ["binaraga", "/venues2/AulaKiyaiGede.JPG"],

  // --- Cabor Dancesport & Gimnastik (belum ada foto khusus) ---
  ["dancesport", ""],
  ["gimnastik", ""],

  // --- Venue: Airstrip Karang Anyar / Karanganyar (Aerosport) ---
  ["karanganyar", "/venues2/KarangAnyar.JPG"],
  ["karang anyar", "/venues2/KarangAnyar.JPG"],
  ["aerosport", "/venues2/KarangAnyar.JPG"],

  // --- Venue: Jalan Raya Pangkalan Bun (Balap Sepeda) ---
  ["jalan raya", "/venues2/BalapSepeda.jpeg"],
  ["balap sepeda", "/venues2/BalapSepeda.jpeg"],

  // --- Venue: Lapangan Tenis Pasir Panjang (Tenis Lapangan) ---
  ["lapangan tenis", "/venues2/LapanganTenisPasirPanjang.jpeg"],
  ["tenis pasir panjang", "/venues2/LapanganTenisPasirPanjang.jpeg"],
  ["tenis lapangan", "/venues2/LapanganTenisPasirPanjang.jpeg"],

  // --- Venue: Lintasan Atletik Sport Center (Atletik) ---
  ["lintasan", "/venues2/LintasanAtletik.jpeg"],
  ["atletik", "/venues2/LintasanAtletik.jpeg"],

  // --- Venue: Juvenza Futsal (Tinju) ---
  ["juvenza", "/venues2/juvenza.png"],
  ["tinju", "/venues2/juvenza.png"],

  // --- Venue: Samari Futsal (Karate) ---
  ["samari", "/venues2/samari.jpg"],
  ["karate", "/venues2/samari.jpg"],

  // --- Venue: GOR KONI (Bulutangkis) ---
  ["koni", "/venues2/GORKoni.JPG"],
  ["bulutangkis", "/venues2/GORKoni.JPG"],

  // --- Venue: Onix Billiard (Billiard) ---
  ["onix", "/venues2/OnixBilliard.jpeg"],
  ["billiard", "/venues2/OnixBilliard.jpeg"],

  // --- Venue: Aula Antakusuma (Pencak Silat & Taekwondo) ---
  ["antakusuma", "/venues2/aulaAntakusuma.jpeg"],
  ["pencak silat", "/venues2/aulaAntakusuma.jpeg"],
  ["taekwondo", "/venues2/aulaAntakusuma.jpeg"],

  // --- Venue: Aula Disdikbud (Tenis Meja) ---
  ["disdik", "/venues2/aulaDISDIKBUD.jpg"],
  ["tenis meja", "/venues2/aulaDISDIKBUD.jpg"],

  // --- Venue: Aula Dispora (Bridge) ---
  // belum diubah
  ["dispora", "/venues2/aulaDisipora.jpeg"],
  ["disipora", "/venues2/aulaDisipora.jpeg"],
  ["bridge", "/venues2/aulaDisipora.jpeg"],

  // --- Venue: Aula Bapperida (Catur) ---
  //belum diubah
  ["bapperida", "/venues2/bapperida.jpg"],
  ["catur", "/venues2/bapperida.jpg"],

  // --- Venue: Aula Mapolres Kobar (Judo) ---
  //belum diubah
  ["mapolres", "/venues2/mapolres.jpg"],
  ["judo", "/venues2/mapolres.jpg"],

  // --- Venue: Aula Sangga Banua (E-Sport) ---
  ["sangga banua", "/venues2/AulaSanggaBanua.jpeg"],
  ["e-sport", "/venues2/AulaSanggaBanua.jpeg"],
  ["esport", "/venues2/AulaSanggaBanua.jpeg"],

  // --- Venue: Kampung Sega / Sungai Arut (Dayung) ---
  ["sega", "/venues2/kampungSega.jpg"],
  ["sungai arut", "/venues2/kampungSega.jpg"],
  ["dayung", "/venues2/kampungSega.jpg"],

  // --- Venue: Kolam Renang Isen Mulang (Akuatik) ---
  ["isen mulang", "/venues2/kolamIsenMulang.jpg"],
  ["kolam renang", "/venues2/kolamIsenMulang.jpg"],

  // belum diubah
  ["akuatik", "/venues2/kolamIsenMulang.jpg"],

  // --- Venue: Pangkalan Bun Park (MMA & Panjat Tebing) ---
  ["pangkalan bun park", "/venues2/pangkalanbunpark.JPG"],
  ["mma", "/venues2/pangkalanbunpark.JPG"],
  ["panjat tebing", "/venues2/pangkalanbunpark.JPG"],

  // --- Venue Motor Grass Sport Center ---
  ["motocross", "/venues2/SportCenterMotorCross.jpeg"],
  ["sport center motor", "/venues2/SportCenterMotorCross.jpeg"],

  // --- Venue: Sirkuit Sabaru (Bermotor Motoprix - belum ada foto) ---
  ["sabaru", "/venues2/sirkuitsabaru.jpeg"],
  ["sirkuit", "/venues2/sirkuitsabaru.jpeg"],
  ["balap motor", "/venues2/sirkuitsabaru.jpeg"],
  ["motoprix", "/venues2/sirkuitsabaru.jpeg"],
  ["motor prix", "/venues2/sirkuitsabaru.jpeg"],
  // --- Venue: Minisoccer R88 (Sepak Bola Mini / KSMI) ---
  ["minisoccer", "/venues2/soccer88.jpeg"],
  ["mini soccer", "/venues2/soccer88.jpeg"],
  ["r88", "/venues2/soccer88.jpeg"],
  ["soccer88", "/venues2/soccer88.jpeg"],
  ["sepak bola mini", "/venues2/soccer88.jpeg"],

  // --- Venue: Stadion Sepak Bola Sport Center (Sepak Bola) ---
  ["stadion", "/venues2/stadion.jpeg"],
  ["sepak bola", "/venues2/stadion.jpeg"],

  // --- Semua GOR di kawasan Sport Center (Basket, Voli Indoor, Futsal, Sepak Takraw, Ratu Alamsyah) ---
  ["gor basket", "/venues2/gorSportCenter.jpeg"],
  ["basket", "/venues2/gorSportCenter.jpeg"],
  ["gor futsal", "/venues2/gorSportCenter.jpeg"],
  ["gor voli", "/venues2/gorSportCenter.jpeg"],
  ["voli indoor", "/venues2/gorSportCenter.jpeg"],
  ["ratu alamsyah", "/venues2/gorSportCenter.jpeg"],
  ["gor sepak takraw", "/venues2/gorSportCenter.jpeg"],
  ["sepak takraw", "/venues2/gorSportCenter.jpeg"],
  ["gor sport center", "/venues2/gorSportCenter.jpeg"],
  ["gor sportcenter", "/venues2/gorSportCenter.jpeg"],
  ["gor indoor", "/venues2/gorSportCenter.jpeg"],
  ["futsal", "/venues2/gorSportCenter.jpeg"],

  // --- Fallback Lapangan Voli & Kompleks Sport Center Pangkalan Bun ---
  ["lapangan voli", "/venues2/LapanganVoli.jpeg"],
  ["voli", "x/venues2/LapanganVoli.jpeg"],
  ["indoor", "/venues2/sportCenter.jpg"],
  ["sport center", "/venues2/SportCenterMotorCross.jpeg"],
];

export function getVenuePhotoUrl(venueName?: string, additionalText?: string): string {
  if (!venueName) return "";
  const normalized = `${venueName} ${additionalText || ""}`.toLowerCase();

  for (const [key, url] of venuePhotoMap) {
    if (normalized.includes(key)) {
      return url;
    }
  }
  return "";
}
