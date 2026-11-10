-- Migration 000008: Update Resmi Cabor (32 Cabang) & Venue (25 Venue)
-- Sesuai Jadwal Pelaksanaan PORPROV XIII/2026 Kalimantan Tengah di Kotawaringin Barat (28 November - 8 Desember 2026)

-- 1. Hindari benturan UNIQUE(name) atau UNIQUE(code) pada tabel sports sebelum upsert berdasarkan id
DELETE FROM sports WHERE id > 32;

UPDATE sports
SET name = 'TEMP_SPORT_' || id,
    code = 'T' || id
WHERE id BETWEEN 1 AND 32;

INSERT INTO sports (id, name, code, category, icon_symbol, description) VALUES
(1, 'Aerosport', 'AE', 'Utama', 'AE', 'Cabang olahraga dirgantara di Karanganyar'),
(2, 'Atletik', 'AT', 'Utama', 'AT', 'Nomor lari, lompat, dan lempar di Lintasan Atletik Sport Center'),
(3, 'Akuatik', 'AK', 'Utama', 'AK', 'Olahraga renang dan akuatik di Kolam Renang Isen Mulang Palangka Raya'),
(4, 'Bermotor (Grass Track & Motoprix)', 'BM', 'Utama', 'BM', 'Nomor Grass Track (Sport Center) dan Motoprix (Sirkuit Sabaru Palangka Raya)'),
(5, 'Balap Sepeda (Road Bike & Mountain)', 'BS', 'Utama', 'BS', 'Nomor Road Bike dan Mountain Bike di Jalan Raya Pangkalan Bun'),
(6, 'Billiard', 'BI', 'Utama', 'BI', 'Olahraga ketepatan dan strategi biliar di Onix Billiard'),
(7, 'Binaraga Fitnes', 'BF', 'Utama', 'BF', 'Kebugaran dan pembentukan tubuh di Aula Kiyai Gede'),
(8, 'Basket', 'BK', 'Utama', 'BK', 'Pertandingan bola basket beregu di GOR Basket Sport Center'),
(9, 'Bola Voli (Indoor & Pasir/Pantai)', 'BV', 'Utama', 'BV', 'Nomor Bola Voli Indoor (GOR Sport Center Ratu Alamsyah) dan Pasir/Pantai (Sport Center)'),
(10, 'Bridge', 'BR', 'Utama', 'BR', 'Permainan kartu strategi beregu dan pasangan di Aula Dispora'),
(11, 'Bulutangkis', 'BU', 'Utama', 'BU', 'Kecepatan dan ketepatan bulu tangkis di GOR KONI'),
(12, 'Catur', 'CA', 'Utama', 'CA', 'Olahraga asah otak dan strategi di Aula Bapperida'),
(13, 'Dayung (Canoeing, TBR & Ergometer)', 'DY', 'Utama', 'DY', 'Nomor Canoeing, Traditional Boat Race, dan Ergometer di Kampung Sega'),
(14, 'Drumband', 'DB', 'Utama', 'DB', 'Perpaduan musik, ketahanan, dan baris-berbaris di Sport Center'),
(15, 'Dancesport', 'DS', 'Utama', 'DS', 'Olahraga tari kompetitif di Aula Kiyai Gede'),
(16, 'E-Sport', 'ES', 'Utama', 'ES', 'Kompetisi olahraga elektronik di Aula Sangga Banua'),
(17, 'Gimnastik', 'GI', 'Utama', 'GI', 'Kelenturan, kekuatan, dan keseimbangan senam di Aula Kiyai Gede'),
(18, 'Judo', 'JU', 'Utama', 'JU', 'Olahraga bela diri bantingan dan kuncian di Aula Mapolres Kobar'),
(19, 'Karate', 'KA', 'Utama', 'KA', 'Teknik kata dan kumite bela diri di Samari Futsal'),
(20, 'Korfball', 'KO', 'Utama', 'KO', 'Permainan bola keranjang campuran di Sport Center'),
(21, 'MMA', 'MM', 'Utama', 'MM', 'Seni bela diri campuran modern di Pangkalan Bun Park'),
(22, 'Panahan', 'PA', 'Utama', 'PA', 'Akurasi dan konsentrasi memanah di Sport Center'),
(23, 'Panjat Tebing', 'PT', 'Utama', 'PT', 'Ketangkasan dan kecepatan panjat dinding di Pangkalan Bun Park'),
(24, 'Pencak Silat', 'PS', 'Utama', 'PS', 'Seni bela diri tradisional Indonesia di Aula Antakusuma'),
(25, 'Sepak Takraw', 'ST', 'Utama', 'ST', 'Permainan bola rotan beregu di GOR Sepak Takraw Sport Center'),
(26, 'Sepatu Roda & Skateboard', 'SR', 'Utama', 'SR', 'Nomor Sepatu Roda dan Skateboard di Sport Center'),
(27, 'Sepak Bola & Futsal', 'SB', 'Utama', 'SB', 'Nomor Sepak Bola (Stadion Sepak Bola Sport Center) dan Futsal (GOR Sport Center Ratu Alamsyah)'),
(28, 'Taekwondo', 'TK', 'Utama', 'TK', 'Olahraga bela diri Korea di Aula Antakusuma'),
(29, 'Tenis Lapangan', 'TL', 'Utama', 'TL', 'Permainan raket lapangan di Lapangan Tenis Pasir Panjang'),
(30, 'Tenis Meja', 'TM', 'Utama', 'TM', 'Permainan cepat bola pingpong di Aula Disdikbud'),
(31, 'Tinju', 'TI', 'Utama', 'TI', 'Olahraga bela diri di atas ring di Juvenza Futsal'),
(32, 'Sepak Bola Mini (KSMI)', 'SM', 'Utama', 'SM', 'Kompetisi Sepak Bola Mini (KSMI) di Minisoccer R88')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    category = EXCLUDED.category,
    icon_symbol = EXCLUDED.icon_symbol,
    description = EXCLUDED.description;

-- 2. Upsert 25 Venue Resmi sesuai dokumen jadwal dan koordinat geografis riil
INSERT INTO venues (id, name, category, address, latitude, longitude, note) VALUES
(1, 'Sport Center Pangkalan Bun', 'Kompleks Sport Center', 'Jl. Samari II, Madurejo, Kec. Arut Selatan, Kotawaringin Barat', -2.7198038, 111.6311589, 'Venue Upacara Pembukaan & Penutupan, Bermotor (Grass Track), Bola Voli Pasir/Pantai, Drumband, Korfball, Panahan, Sepatu Roda, dan Skateboard.'),
(2, 'Karanganyar', 'Arena Terbuka & Dirgantara', 'Karang Anyar, Kec. Arut Selatan, Kotawaringin Barat', -2.6524000, 111.6782000, 'Venue pertandingan cabang olahraga Aerosport.'),
(3, 'Lintasan Atletik Sport Center', 'Kompleks Sport Center', 'Jl. Samari II, Kompleks Sport Center Pangkalan Bun, Madurejo, Kotawaringin Barat', -2.7194500, 111.6314500, 'Venue pertandingan cabang olahraga Atletik.'),
(4, 'Kolam Renang Isen Mulang Palangka Raya', 'Stadion & Fasilitas Olahraga', 'Kompleks Olahraga Isen Mulang, Jl. Tjilik Riwut KM 5, Bukit Tunggal, Kec. Jekan Raya, Kota Palangka Raya', -2.1788890, 113.8825000, 'Venue pertandingan cabang olahraga Akuatik.'),
(5, 'Sirkuit Sabaru Palangka Raya', 'Sirkuit & Arena Balap', 'Jl. Matal Ujung / Jl. Surung, Sabaru, Kec. Sebangau, Kota Palangka Raya', -2.2647220, 113.9277780, 'Venue pertandingan cabang olahraga Bermotor (Motoprix).'),
(6, 'Jalan Raya Pangkalan Bun', 'Arena Jalan Raya', 'Koridor Jalan Utama Pangkalan Bun (Jl. Sutan Syahrir – Jl. HM Rafi''i), Kec. Arut Selatan, Kotawaringin Barat', -2.6952000, 111.6365000, 'Venue pertandingan Balap Sepeda (Road Bike & Mountain Bike).'),
(7, 'Onix Billiard', 'Arena Indoor & Komersial', 'Jl. Pramuka, Desa Pasir Panjang, Kec. Arut Selatan, Kotawaringin Barat', -2.7206800, 111.6459300, 'Venue pertandingan cabang olahraga Billiard.'),
(8, 'Aula Kiyai Gede', 'Aula & Gedung Pertemuan', 'Kompleks Kantor Bupati Kobar, Jl. Sutan Syahrir No. 2, Sidorejo, Pangkalan Bun', -2.6813890, 111.6258330, 'Venue pertandingan Binaraga Fitnes, Dancesport, dan Gimnastik.'),
(9, 'GOR Basket Sport Center', 'Kompleks Sport Center', 'Jl. Samari II, Kompleks Sport Center Pangkalan Bun, Madurejo, Kotawaringin Barat', -2.7201500, 111.6308500, 'Venue pertandingan cabang olahraga Basket.'),
(10, 'GOR Sport Center Ratu Alamsyah', 'Kompleks Sport Center', 'Jl. Samari II, Kompleks Sport Center Pangkalan Bun, Madurejo, Kotawaringin Barat', -2.7196200, 111.6309800, 'Venue pertandingan Bola Voli Indoor dan Futsal.'),
(11, 'Aula Dispora', 'Aula & Gedung Pertemuan', 'Kantor Dispora Kobar, Jl. Sutan Syahrir No. 60, Sidorejo, Pangkalan Bun', -2.6854000, 111.6282000, 'Venue pertandingan cabang olahraga Bridge.'),
(12, 'GOR KONI', 'Stadion & Fasilitas Olahraga', 'Jl. Sutan Syahrir, Sidorejo, Kec. Arut Selatan, Kotawaringin Barat', -2.6878075, 111.6307249, 'Venue pertandingan cabang olahraga Bulutangkis.'),
(13, 'Aula Bapperida', 'Aula & Gedung Pertemuan', 'Kantor Bapperida Kobar, Jl. HM Rafi''i, Madurejo, Kec. Arut Selatan, Pangkalan Bun', -2.7105560, 111.6475000, 'Venue pertandingan cabang olahraga Catur.'),
(14, 'Kampung Sega', 'Arena Perairan & Sungai', 'Tepian Sungai Arut, Kel. Mendawai, Kec. Arut Selatan, Pangkalan Bun', -2.6765830, 111.6264480, 'Venue pertandingan Dayung (Canoeing, Traditional Boat Race, dan Ergometer).'),
(15, 'Aula Sangga Banua', 'Aula & Gedung Pertemuan', 'Kompleks Kantor Bupati Kobar, Jl. Sutan Syahrir No. 2, Sidorejo, Pangkalan Bun', -2.6811500, 111.6255200, 'Venue pertandingan cabang olahraga E-Sport.'),
(16, 'Aula Mapolres Kobar', 'Aula & Gedung Pertemuan', 'Mako Polres Kotawaringin Barat, Jl. Pangeran Diponegoro No. 34, Madurejo, Pangkalan Bun', -2.6891670, 111.6336110, 'Venue pertandingan cabang olahraga Judo.'),
(17, 'Samari Futsal', 'Arena Indoor & Komersial', 'Jl. Samari, Madurejo, Kec. Arut Selatan, Pangkalan Bun', -2.7112000, 111.6319000, 'Venue pertandingan cabang olahraga Karate.'),
(18, 'Pangkalan Bun Park', 'Arena Terbuka & Taman Kota', 'Kawasan Pangkalan Bun Park, Jl. HM Rafi''i, Madurejo, Kec. Arut Selatan, Pangkalan Bun', -2.7133330, 111.6475000, 'Venue pertandingan cabang olahraga MMA dan Panjat Tebing.'),
(19, 'Aula Antakusuma', 'Aula & Gedung Pertemuan', 'Gedung Serbaguna Antakusuma, Kawasan Pangkalan Bun Park, Jl. HM Rafi''i, Pangkalan Bun', -2.7129500, 111.6471500, 'Venue pertandingan cabang olahraga Pencak Silat dan Taekwondo.'),
(20, 'GOR Sepak Takraw Sport Center', 'Kompleks Sport Center', 'Jl. Samari II, Kompleks Sport Center Pangkalan Bun, Madurejo, Kotawaringin Barat', -2.7204200, 111.6313800, 'Venue pertandingan cabang olahraga Sepak Takraw.'),
(21, 'Stadion Sepak Bola Sport Center', 'Kompleks Sport Center', 'Jl. Samari II, Kompleks Sport Center Pangkalan Bun, Madurejo, Kotawaringin Barat', -2.7191200, 111.6311900, 'Venue pertandingan cabang olahraga Sepak Bola.'),
(22, 'Lapangan Tenis Pasir Panjang', 'Stadion & Fasilitas Olahraga', 'Jl. Pasir Panjang / Jl. Pramuka, Desa Pasir Panjang, Kec. Arut Selatan, Kotawaringin Barat', -2.7185000, 111.6442000, 'Venue pertandingan cabang olahraga Tenis Lapangan.'),
(23, 'Aula Disdikbud', 'Aula & Gedung Pertemuan', 'Kantor Disdikbud Kobar, Jl. Pramuka No. 07, Pasir Panjang, Kec. Arut Selatan, Pangkalan Bun', -2.7194000, 111.6451000, 'Venue pertandingan cabang olahraga Tenis Meja.'),
(24, 'Juvenza Futsal', 'Arena Indoor & Komersial', 'Jl. Delima RT.008/RW.003, Madurejo, Kec. Arut Selatan, Pangkalan Bun', -2.6968000, 111.6374000, 'Venue pertandingan cabang olahraga Tinju.'),
(25, 'Minisoccer R88', 'Arena Indoor & Komersial', 'Jl. Pramuka / Jl. Pemuda, Desa Pasir Panjang, Kec. Arut Selatan, Pangkalan Bun', -2.7214000, 111.6468000, 'Venue pertandingan cabang olahraga Sepak Bola Mini (KSMI).')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    address = EXCLUDED.address,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    note = EXCLUDED.note;

-- 3. Sesuaikan relasi sport_events & matches contoh agar mengarah ke ID cabor & venue yang tepat
UPDATE sport_events SET sport_id = 5, name = 'Balap Sepeda Road Bike Putra Contoh' WHERE id = 5;
UPDATE sport_events SET sport_id = 5, name = 'Balap Sepeda Mountain Bike Putra Contoh' WHERE id = 6;
UPDATE sport_events SET sport_id = 8 WHERE id IN (7, 8);
UPDATE sport_events SET sport_id = 11 WHERE id IN (9, 10);

UPDATE matches SET venue_id = 3 WHERE event_id IN (1, 2);
UPDATE matches SET venue_id = 4 WHERE event_id IN (3, 4);
UPDATE matches SET venue_id = 6 WHERE event_id IN (5, 6);
UPDATE matches SET venue_id = 9 WHERE event_id IN (7, 8);
UPDATE matches SET venue_id = 12 WHERE event_id IN (9, 10);

-- 4. Pastikan seluruh 32 cabor memiliki data grup & bagan turnamen simulasi
INSERT INTO sport_groups (sport_id, group_code, name, sort_order)
SELECT s.id, g.group_code, g.name, g.sort_order
FROM sports s
CROSS JOIN (VALUES ('A', 'Grup A', 1), ('B', 'Grup B', 2)) AS g(group_code, name, sort_order)
WHERE s.id BETWEEN 1 AND 32
ON CONFLICT (sport_id, group_code) DO NOTHING;

WITH standings_seed(group_code, contingent_id, rank, won, drawn, points) AS (
    VALUES
        ('A', 1, 1, 3, 0, 9),
        ('A', 3, 2, 2, 0, 6),
        ('A', 9, 3, 1, 0, 3),
        ('A', 10, 4, 0, 0, 0),
        ('B', 2, 1, 3, 0, 9),
        ('B', 4, 2, 2, 0, 6),
        ('B', 14, 3, 1, 0, 3),
        ('B', 6, 4, 0, 0, 0)
)
INSERT INTO sport_group_standings (group_id, contingent_id, rank, played, won, drawn, lost, points)
SELECT g.id, seed.contingent_id, seed.rank, 3, seed.won, seed.drawn, 3 - seed.won - seed.drawn, seed.points
FROM sports s
JOIN sport_groups g ON g.sport_id = s.id
JOIN standings_seed seed ON seed.group_code = g.group_code
WHERE s.id BETWEEN 1 AND 32
ON CONFLICT (group_id, contingent_id) DO NOTHING;

INSERT INTO sport_bracket_matches (
    sport_id, round_name, round_order, match_order, label,
    home_contingent_id, away_contingent_id, home_score, away_score, status
)
SELECT s.id, seed.round_name, seed.round_order, seed.match_order, seed.label,
       seed.home_contingent_id, seed.away_contingent_id, seed.home_score, seed.away_score, seed.status
FROM sports s
CROSS JOIN (VALUES
    ('SEMIFINAL', 1, 1, 'Semifinal 1', 1, 4, 2, 1, 'FINISHED'),
    ('SEMIFINAL', 1, 2, 'Semifinal 2', 2, 3, 1, 2, 'FINISHED'),
    ('FINAL', 2, 1, 'Perebutan juara 1', 1, 3, NULL, NULL, 'SCHEDULED'),
    ('THIRD_PLACE', 2, 2, 'Perebutan juara 3', 4, 2, NULL, NULL, 'SCHEDULED')
) AS seed(round_name, round_order, match_order, label, home_contingent_id, away_contingent_id, home_score, away_score, status)
WHERE s.id BETWEEN 1 AND 32
ON CONFLICT (sport_id, round_name, match_order) DO NOTHING;

SELECT setval(pg_get_serial_sequence('sports', 'id'), (SELECT MAX(id) FROM sports), TRUE);
SELECT setval(pg_get_serial_sequence('venues', 'id'), (SELECT MAX(id) FROM venues), TRUE);

