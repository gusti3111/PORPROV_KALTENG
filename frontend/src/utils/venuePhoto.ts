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
  ["kiyai gede", "/venues2/AulaKiyaiGede.webp"],
  ["binaraga", "/venues2/AulaKiyaiGede.webp"],

  // --- Cabor Dancesport & Gimnastik (belum ada foto khusus) ---
  ["dancesport", ""],
  ["gimnastik", ""],

  // --- Venue: Airstrip Karang Anyar / Karanganyar (Aerosport) ---
  ["karanganyar", "/venues2/KarangAnyar.webp"],
  ["karang anyar", "/venues2/KarangAnyar.webp"],
  ["aerosport", "/venues2/KarangAnyar.webp"],

  // --- Venue: Jalan Raya Pangkalan Bun (Balap Sepeda) ---
  ["jalan raya", "/venues2/BalapSepeda.webp"],
  ["balap sepeda", "/venues2/BalapSepeda.webp"],

  // --- Venue: Lapangan Tenis Pasir Panjang (Tenis Lapangan) ---
  ["lapangan tenis", "/venues2/LapanganTenisPasirPanjang.webp"],
  ["tenis pasir panjang", "/venues2/LapanganTenisPasirPanjang.webp"],
  ["tenis lapangan", "/venues2/LapanganTenisPasirPanjang.webp"],

  // --- Venue: Lintasan Atletik Sport Center (Atletik) ---
  ["lintasan", "/venues2/LintasanAtletik.webp"],
  ["atletik", "/venues2/LintasanAtletik.webp"],

  // --- Venue: Juvenza Futsal (Tinju) ---
  ["juvenza", "/venues2/juvenza.webp"],
  ["tinju", "/venues2/juvenza.webp"],

  // --- Venue: Samari Futsal (Karate) ---
  ["samari", "/venues2/samari.webp"],
  ["karate", "/venues2/samari.webp"],

  // --- Venue: GOR KONI (Bulutangkis) ---
  ["koni", "/venues2/GORKoni.webp"],
  ["bulutangkis", "/venues2/GORKoni.webp"],

  // --- Venue: Onix Billiard (Billiard) ---
  ["onix", "/venues2/OnixBilliard.webp"],
  ["billiard", "/venues2/OnixBilliard.webp"],

  // --- Venue: Aula Antakusuma (Pencak Silat & Taekwondo) ---
  ["antakusuma", "/venues2/aulaAntakusuma.webp"],
  ["pencak silat", "/venues2/aulaAntakusuma.webp"],
  ["taekwondo", "/venues2/aulaAntakusuma.webp"],

  // --- Venue: Aula Disdikbud (Tenis Meja) ---
  ["disdik", "/venues2/aulaDISDIKBUD.webp"],
  ["tenis meja", "/venues2/aulaDISDIKBUD.webp"],

  // --- Venue: Aula Dispora (Bridge) ---
  // belum diubah
  ["dispora", "/venues2/aulaDisipora.webp"],
  ["disipora", "/venues2/aulaDisipora.webp"],
  ["bridge", "/venues2/aulaDisipora.webp"],

  // --- Venue: Aula Bapperida (Catur) ---
  //belum diubah
  ["bapperida", "/venues2/bapperida.webp"],
  ["catur", "/venues2/bapperida.webp"],

  // --- Venue: Aula Mapolres Kobar (Judo) ---
  //belum diubah
  ["mapolres", "/venues2/mapolres.webp"],
  ["judo", "/venues2/mapolres.webp"],

  // --- Venue: Aula Sangga Banua (E-Sport) ---
  ["sangga banua", "/venues2/AulaSanggaBanua.webp"],
  ["e-sport", "/venues2/AulaSanggaBanua.webp"],
  ["esport", "/venues2/AulaSanggaBanua.webp"],

  // --- Venue: Kampung Sega / Sungai Arut (Dayung) ---
  ["sega", "/venues2/kampungSega.webp"],
  ["sungai arut", "/venues2/kampungSega.webp"],
  ["dayung", "/venues2/kampungSega.webp"],

  // --- Venue: Kolam Renang Isen Mulang (Akuatik) ---
  ["isen mulang", "/venues2/kolamIsenMulang.webp"],
  ["kolam renang", "/venues2/kolamIsenMulang.webp"],

  // belum diubah
  ["akuatik", "/venues2/kolamIsenMulang.webp"],

  // --- Venue: Pangkalan Bun Park (MMA & Panjat Tebing) ---
  ["pangkalan bun park", "/venues2/pangkalanbunpark.webp"],
  ["mma", "/venues2/pangkalanbunpark.webp"],
  ["panjat tebing", "/venues2/pangkalanbunpark.webp"],

  // --- Venue Motor Grass / Grass Track Sport Center ---
  ["motocross", "/venues2/SportCenterMotorCross.webp"],
  ["motor cross", "/venues2/SportCenterMotorCross.webp"],
  ["grasstrack", "/venues2/SportCenterMotorCross.webp"],
  ["grass track", "/venues2/SportCenterMotorCross.webp"],
  ["motor grass", "/venues2/SportCenterMotorCross.webp"],
  ["sport center grass", "/venues2/SportCenterMotorCross.webp"],
  ["sport center motor", "/venues2/SportCenterMotorCross.webp"],

  // --- Venue: Sirkuit Sabaru (Bermotor Motoprix - belum ada foto) ---
  ["sabaru", "/venues2/sirkuitsabaru.webp"],
  ["sirkuit", "/venues2/sirkuitsabaru.webp"],
  ["balap motor", "/venues2/sirkuitsabaru.webp"],
  ["motoprix", "/venues2/sirkuitsabaru.webp"],
  ["motor prix", "/venues2/sirkuitsabaru.webp"],
  // --- Venue: Kudeta Mini Soccer (Korfball) ---
  // Harus di atas "mini soccer" / "minisoccer" agar "Kudeta Mini Soccer" tidak masuk ke soccer88.webp
  ["kudeta", "/venues2/korfball.webp"],
  ["korfball", "/venues2/korfball.webp"],

  // --- Venue: Minisoccer R88 (Sepak Bola Mini / KSMI) ---
  ["minisoccer", "/venues2/soccer88.webp"],
  ["mini soccer", "/venues2/soccer88.webp"],
  ["r88", "/venues2/soccer88.webp"],
  ["soccer88", "/venues2/soccer88.webp"],
  ["sepak bola mini", "/venues2/soccer88.webp"],

  // --- Venue: Panahan (memiliki gambar tersendiri) ---
  ["lapangan panahan", "/venues2/panahan.webp"],
  ["panahan", "/venues2/panahan.webp"],

  // --- Venue: Sepak Takraw (memiliki gambar tersendiri) ---
  ["gor sepak takraw", "/venues2/sepakTakraw.webp"],
  ["sepak takraw", "/venues2/sepakTakraw.webp"],
  ["takraw", "/venues2/sepakTakraw.webp"],

  // --- Venue: Basket (memiliki gambar tersendiri) ---
  ["gor basket", "/galeri/gor-basket-indoor.webp"],
  ["basket", "/galeri/gor-basket-indoor.webp"],

  // --- Venue: Voli Pantai / Pasir (memiliki gambar tersendiri) ---
  ["voli pantai", "/venues2/voliPantai.webp"],
  ["voli pasir", "/venues2/voliPantai.webp"],

  // --- Venue: Sepatu Roda & Skateboard (memiliki gambar tersendiri) ---
  ["sepatu roda", "/galeri/VenueSepatuRoda.webp"],
  ["skateboard", "/galeri/VenueSepatuRoda.webp"],

  // --- Venue: Stadion Sepak Bola Sport Center (Sepak Bola) ---
  ["stadion", "/venues2/stadion.webp"],
  ["sepak bola", "/venues2/stadion.webp"],

  // --- GOR Indoor lainnya di kawasan Sport Center (Voli Indoor, Futsal, Ratu Alamsyah) ---
  ["gor futsal", "/venues2/gorSportCenter.webp"],
  ["gor voli", "/venues2/gorSportCenter.webp"],
  ["voli indoor", "/venues2/gorSportCenter.webp"],
  ["ratu alamsyah", "/venues2/gorSportCenter.webp"],
  ["gor sport center", "/venues2/gorSportCenter.webp"],
  ["gor sportcenter", "/venues2/gorSportCenter.webp"],
  ["gor indoor", "/venues2/gorSportCenter.webp"],
  ["futsal", "/venues2/gorSportCenter.webp"],

  // --- Fallback Lapangan Voli & Kompleks Sport Center Pangkalan Bun ---
  ["lapangan voli", "/venues2/voliPantai.webp"],
  ["voli", "/venues2/voliPantai.webp"],
  ["sport center pangkalan bun", "/venues2/sportCenter.webp"],
  ["indoor", "/venues2/sportCenter.webp"],
  ["sport center", "/venues2/sportCenter.webp"],
];

export function getVenuePhotoUrl(venueName?: string, additionalText?: string): string {
  if (!venueName) return "";
  const normalizedName = venueName.toLowerCase().trim();

  // 1. Utamakan pencocokan langsung berdasarkan nama venue (venueName) terlebih dahulu
  // agar kata di dalam note/deskripsi (mis. cabor korfball di note Sport Center) tidak menimpa foto venue.
  for (const [key, url] of venuePhotoMap) {
    if (normalizedName.includes(key)) {
      return url;
    }
  }

  // 2. Fallback: cocokkan gabungan nama venue + kategori/note
  const normalizedFull = `${venueName} ${additionalText || ""}`.toLowerCase();
  for (const [key, url] of venuePhotoMap) {
    if (normalizedFull.includes(key)) {
      return url;
    }
  }
  return "";
}
