-- Schema Init PORPROV XIII Kalimantan Tengah 2026

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Kontingen (13 Kabupaten + 1 Kota)
CREATE TABLE IF NOT EXISTS contingents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Master Cabang Olahraga
DO $$ BEGIN
    CREATE TYPE sport_category_enum AS ENUM ('Utama', 'Eksebisi');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS sports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) UNIQUE NOT NULL,
    category sport_category_enum NOT NULL DEFAULT 'Utama',
    icon_symbol VARCHAR(10),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nomor Pertandingan
CREATE TABLE IF NOT EXISTS sport_events (
    id SERIAL PRIMARY KEY,
    sport_id INT NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Men', 'Women', 'Mixed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Master Venue
CREATE TABLE IF NOT EXISTS venues (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    address TEXT,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Master Atlet & Official
CREATE TABLE IF NOT EXISTS athletes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contingent_id INT NOT NULL REFERENCES contingents(id),
    sport_id INT NOT NULL REFERENCES sports(id),
    nik VARCHAR(16) UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    birth_date DATE,
    gender VARCHAR(1) CHECK (gender IN ('M', 'F')),
    photo_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Jadwal & Pertandingan
DO $$ BEGIN
    CREATE TYPE match_status_enum AS ENUM ('SCHEDULED', 'ONGOING', 'FINISHED', 'POSTPONED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id INT NOT NULL REFERENCES sport_events(id),
    venue_id INT NOT NULL REFERENCES venues(id),
    title VARCHAR(200) NOT NULL,
    round_name VARCHAR(50),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    status match_status_enum DEFAULT 'SCHEDULED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_participants (
    id SERIAL PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    contingent_id INT NOT NULL REFERENCES contingents(id),
    athlete_id UUID REFERENCES athletes(id),
    score VARCHAR(50),
    is_winner BOOLEAN DEFAULT FALSE
);

-- 6. Medali
DO $$ BEGIN
    CREATE TYPE medal_type_enum AS ENUM ('GOLD', 'SILVER', 'BRONZE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS medals (
    id SERIAL PRIMARY KEY,
    event_id INT NOT NULL REFERENCES sport_events(id),
    contingent_id INT NOT NULL REFERENCES contingents(id),
    athlete_id UUID REFERENCES athletes(id),
    medal_type medal_type_enum NOT NULL,
    awarded_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_event_medal UNIQUE (event_id, medal_type)
);

-- 7. View Klasemen Medali Realtime
CREATE OR REPLACE VIEW v_medal_standings AS
SELECT 
    c.id AS contingent_id,
    c.name AS contingent_name,
    c.short_code,
    c.logo_url,
    COUNT(m.id) FILTER (WHERE m.medal_type = 'GOLD') AS gold,
    COUNT(m.id) FILTER (WHERE m.medal_type = 'SILVER') AS silver,
    COUNT(m.id) FILTER (WHERE m.medal_type = 'BRONZE') AS bronze,
    COUNT(m.id) AS total_medals
FROM contingents c
LEFT JOIN medals m ON c.id = m.contingent_id
GROUP BY c.id, c.name, c.short_code, c.logo_url
ORDER BY gold DESC, silver DESC, bronze DESC, total_medals DESC;
-- Seed Data Kontingen Kalteng
INSERT INTO contingents (id, name, short_code, logo_url) VALUES
(1, 'Kotawaringin Barat', 'KOBAR', '/logos/kobar.png'),
(2, 'Kotawaringin Timur', 'KOTIM', '/logos/kotim.png'),
(3, 'Kota Palangka Raya', 'PLK', '/logos/plk.png'),
(4, 'Kapuas', 'KPS', '/logos/kps.png'),
(5, 'Barito Selatan', 'BARSEL', '/logos/barsel.png'),
(6, 'Barito Utara', 'BARUT', '/logos/barut.png'),
(7, 'Barito Timur', 'BARTIM', '/logos/bartim.png'),
(8, 'Murung Raya', 'MURA', '/logos/mura.png'),
(9, 'Katingan', 'KTN', '/logos/ktn.png'),
(10, 'Seruyan', 'SRY', '/logos/sry.png'),
(11, 'Pulang Pisau', 'PULPIS', '/logos/pulpis.png'),
(12, 'Gunung Mas', 'GMAS', '/logos/gmas.png'),
(13, 'Sukamara', 'SKM', '/logos/skm.png'),
(14, 'Lamandau', 'LMD', '/logos/lmd.png')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    short_code = EXCLUDED.short_code,
    logo_url = EXCLUDED.logo_url;

-- Seed Data Cabang Olahraga (Sesuai Jadwal Pelaksanaan PORPROV XIII/2026)
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

-- Seed Data Venue Resmi (Sesuai Jadwal Pelaksanaan PORPROV XIII/2026)
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
-- Data contoh untuk demonstrasi; nama atlet dan jadwal bukan data resmi.

INSERT INTO sport_events (id, sport_id, name, gender) VALUES
(1, 2, 'Lari 100 Meter Putra Contoh', 'Men'),
(2, 2, 'Lari 200 Meter Putra Contoh', 'Men'),
(3, 3, 'Renang Gaya Bebas Putra Contoh', 'Men'),
(4, 3, 'Renang Gaya Dada Putra Contoh', 'Men'),
(5, 5, 'Balap Sepeda Road Bike Putra Contoh', 'Men'),
(6, 5, 'Balap Sepeda Mountain Bike Putra Contoh', 'Men'),
(7, 8, 'Basket 3x3 Putra Contoh', 'Men'),
(8, 8, 'Basket 5x5 Putra Contoh', 'Men'),
(9, 11, 'Bulutangkis Tunggal Putra Contoh', 'Men'),
(10, 11, 'Bulutangkis Ganda Putra Contoh', 'Men')
ON CONFLICT (id) DO UPDATE SET
    sport_id = EXCLUDED.sport_id,
    name = EXCLUDED.name,
    gender = EXCLUDED.gender;

INSERT INTO athletes (id, contingent_id, sport_id, full_name, birth_date, gender, is_verified) VALUES
('00000000-0000-4000-8000-000000000001', 1, 2, 'Atlet Contoh 01', '2002-01-15', 'M', FALSE),
('00000000-0000-4000-8000-000000000002', 2, 2, 'Atlet Contoh 02', '2001-04-20', 'M', FALSE),
('00000000-0000-4000-8000-000000000003', 3, 3, 'Atlet Contoh 03', '2003-02-11', 'M', FALSE),
('00000000-0000-4000-8000-000000000004', 4, 3, 'Atlet Contoh 04', '2000-09-05', 'M', FALSE),
('00000000-0000-4000-8000-000000000005', 5, 5, 'Atlet Contoh 05', '2002-06-18', 'M', FALSE),
('00000000-0000-4000-8000-000000000006', 6, 5, 'Atlet Contoh 06', '2001-12-03', 'M', FALSE),
('00000000-0000-4000-8000-000000000007', 7, 8, 'Atlet Contoh 07', '2004-03-22', 'M', FALSE),
('00000000-0000-4000-8000-000000000008', 8, 8, 'Atlet Contoh 08', '2003-07-14', 'M', FALSE),
('00000000-0000-4000-8000-000000000009', 9, 11, 'Atlet Contoh 09', '2000-11-30', 'M', FALSE),
('00000000-0000-4000-8000-000000000010', 10, 11, 'Atlet Contoh 10', '2002-08-09', 'M', FALSE)
ON CONFLICT (id) DO UPDATE SET
    sport_id = EXCLUDED.sport_id;

INSERT INTO matches (id, event_id, venue_id, title, round_name, start_time, end_time, status) VALUES
('10000000-0000-4000-8000-000000000001', 1, 3, 'Lari 100 Meter Putra - Final Contoh', 'Final', '2026-11-29 09:00:00+07', '2026-11-29 09:30:00+07', 'FINISHED'),
('10000000-0000-4000-8000-000000000002', 2, 3, 'Lari 200 Meter Putra - Final Contoh', 'Final', '2026-11-29 10:00:00+07', '2026-11-29 10:30:00+07', 'FINISHED'),
('10000000-0000-4000-8000-000000000003', 3, 4, 'Renang Gaya Bebas Putra - Final Contoh', 'Final', '2026-11-30 09:00:00+07', '2026-11-30 09:30:00+07', 'FINISHED'),
('10000000-0000-4000-8000-000000000004', 4, 4, 'Renang Gaya Dada Putra - Final Contoh', 'Final', '2026-11-30 10:00:00+07', '2026-11-30 10:30:00+07', 'FINISHED'),
('10000000-0000-4000-8000-000000000005', 5, 6, 'Balap Sepeda Road Bike Putra - Final Contoh', 'Final', '2026-11-29 09:00:00+07', '2026-11-29 11:00:00+07', 'FINISHED'),
('10000000-0000-4000-8000-000000000006', 6, 6, 'Balap Sepeda Mountain Bike Putra - Final Contoh', 'Final', '2026-11-28 13:00:00+07', '2026-11-28 15:00:00+07', 'FINISHED'),
('10000000-0000-4000-8000-000000000007', 7, 9, 'Basket 3x3 Putra - Final Contoh', 'Final', '2026-11-30 09:00:00+07', '2026-11-30 10:00:00+07', 'FINISHED'),
('10000000-0000-4000-8000-000000000008', 8, 9, 'Basket 5x5 Putra - Final Contoh', 'Final', '2026-11-30 11:00:00+07', '2026-11-30 13:00:00+07', 'FINISHED'),
('10000000-0000-4000-8000-000000000009', 9, 12, 'Bulutangkis Tunggal Putra - Final Contoh', 'Final', '2026-12-01 09:00:00+07', '2026-12-01 10:00:00+07', 'FINISHED'),
('10000000-0000-4000-8000-000000000010', 10, 12, 'Bulutangkis Ganda Putra - Final Contoh', 'Final', '2026-12-01 11:00:00+07', '2026-12-01 12:00:00+07', 'FINISHED')
ON CONFLICT (id) DO UPDATE SET
    venue_id = EXCLUDED.venue_id,
    title = EXCLUDED.title,
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time;

INSERT INTO match_participants (match_id, contingent_id, athlete_id, score, is_winner)
SELECT seed.match_id::UUID, seed.contingent_id, seed.athlete_id::UUID, seed.score, seed.is_winner
FROM (VALUES
('10000000-0000-4000-8000-000000000001', 1, '00000000-0000-4000-8000-000000000001', '10.25 detik', TRUE),
('10000000-0000-4000-8000-000000000001', 2, '00000000-0000-4000-8000-000000000002', '10.48 detik', FALSE),
('10000000-0000-4000-8000-000000000002', 1, '00000000-0000-4000-8000-000000000001', '20.50 detik', TRUE),
('10000000-0000-4000-8000-000000000002', 2, '00000000-0000-4000-8000-000000000002', '20.84 detik', FALSE),
('10000000-0000-4000-8000-000000000003', 3, '00000000-0000-4000-8000-000000000003', '52.10 detik', TRUE),
('10000000-0000-4000-8000-000000000003', 4, '00000000-0000-4000-8000-000000000004', '52.75 detik', FALSE),
('10000000-0000-4000-8000-000000000004', 3, '00000000-0000-4000-8000-000000000003', '1:08.20', TRUE),
('10000000-0000-4000-8000-000000000004', 4, '00000000-0000-4000-8000-000000000004', '1:09.10', FALSE),
('10000000-0000-4000-8000-000000000005', 5, '00000000-0000-4000-8000-000000000005', '2:15:00', TRUE),
('10000000-0000-4000-8000-000000000005', 6, '00000000-0000-4000-8000-000000000006', '2:16:10', FALSE),
('10000000-0000-4000-8000-000000000006', 5, '00000000-0000-4000-8000-000000000005', '00:32:15', TRUE),
('10000000-0000-4000-8000-000000000006', 6, '00000000-0000-4000-8000-000000000006', '00:33:02', FALSE),
('10000000-0000-4000-8000-000000000007', 7, '00000000-0000-4000-8000-000000000007', '21-18', TRUE),
('10000000-0000-4000-8000-000000000007', 8, '00000000-0000-4000-8000-000000000008', '18-21', FALSE),
('10000000-0000-4000-8000-000000000008', 7, '00000000-0000-4000-8000-000000000007', '78-72', TRUE),
('10000000-0000-4000-8000-000000000008', 8, '00000000-0000-4000-8000-000000000008', '72-78', FALSE),
('10000000-0000-4000-8000-000000000009', 9, '00000000-0000-4000-8000-000000000009', '21-17, 21-19', TRUE),
('10000000-0000-4000-8000-000000000009', 10, '00000000-0000-4000-8000-000000000010', '17-21, 19-21', FALSE),
('10000000-0000-4000-8000-000000000010', 9, '00000000-0000-4000-8000-000000000009', '21-16, 21-18', TRUE),
('10000000-0000-4000-8000-000000000010', 10, '00000000-0000-4000-8000-000000000010', '16-21, 18-21', FALSE)
) AS seed(match_id, contingent_id, athlete_id, score, is_winner)
WHERE NOT EXISTS (
    SELECT 1
    FROM match_participants existing
    WHERE existing.match_id = seed.match_id::UUID
      AND existing.contingent_id = seed.contingent_id
      AND existing.athlete_id = seed.athlete_id::UUID
);

INSERT INTO medals (event_id, contingent_id, athlete_id, medal_type) VALUES
(1, 1, '00000000-0000-4000-8000-000000000001', 'GOLD'),
(2, 2, '00000000-0000-4000-8000-000000000002', 'SILVER'),
(3, 3, '00000000-0000-4000-8000-000000000003', 'GOLD'),
(4, 4, '00000000-0000-4000-8000-000000000004', 'BRONZE'),
(5, 5, '00000000-0000-4000-8000-000000000005', 'GOLD'),
(6, 6, '00000000-0000-4000-8000-000000000006', 'SILVER'),
(7, 7, '00000000-0000-4000-8000-000000000007', 'GOLD'),
(8, 8, '00000000-0000-4000-8000-000000000008', 'BRONZE'),
(9, 9, '00000000-0000-4000-8000-000000000009', 'GOLD'),
(10, 10, '00000000-0000-4000-8000-000000000010', 'SILVER')
ON CONFLICT (event_id, medal_type) DO NOTHING;

SELECT setval(pg_get_serial_sequence('contingents', 'id'), (SELECT MAX(id) FROM contingents), TRUE);
SELECT setval(pg_get_serial_sequence('sports', 'id'), (SELECT MAX(id) FROM sports), TRUE);
SELECT setval(pg_get_serial_sequence('venues', 'id'), (SELECT MAX(id) FROM venues), TRUE);
SELECT setval(pg_get_serial_sequence('sport_events', 'id'), (SELECT MAX(id) FROM sport_events), TRUE);
SELECT setval(pg_get_serial_sequence('match_participants', 'id'), (SELECT MAX(id) FROM match_participants), TRUE);
SELECT setval(pg_get_serial_sequence('medals', 'id'), (SELECT MAX(id) FROM medals), TRUE);
ALTER TABLE venues
    ALTER COLUMN latitude TYPE NUMERIC,
    ALTER COLUMN longitude TYPE NUMERIC;

UPDATE venues
SET latitude = -2.687807488510188,
    longitude = 111.63072492325624
WHERE name = 'GOR KONI';

UPDATE venues
SET latitude = -2.7198037755266635,
    longitude = 111.63115888357069
WHERE name IN ('Sport Center', 'Sport Center Pangkalan Bun');
-- Data turnamen simulasi untuk contoh tampilan 10 cabang pertama.
CREATE TABLE IF NOT EXISTS sport_groups (
    id SERIAL PRIMARY KEY,
    sport_id INT NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    group_code VARCHAR(5) NOT NULL,
    name VARCHAR(50) NOT NULL,
    sort_order SMALLINT NOT NULL,
    UNIQUE (sport_id, group_code)
);

CREATE TABLE IF NOT EXISTS sport_group_standings (
    group_id INT NOT NULL REFERENCES sport_groups(id) ON DELETE CASCADE,
    contingent_id INT NOT NULL REFERENCES contingents(id),
    rank SMALLINT NOT NULL CHECK (rank > 0),
    played SMALLINT NOT NULL DEFAULT 0 CHECK (played >= 0),
    won SMALLINT NOT NULL DEFAULT 0 CHECK (won >= 0),
    drawn SMALLINT NOT NULL DEFAULT 0 CHECK (drawn >= 0),
    lost SMALLINT NOT NULL DEFAULT 0 CHECK (lost >= 0),
    points SMALLINT NOT NULL DEFAULT 0 CHECK (points >= 0),
    PRIMARY KEY (group_id, contingent_id),
    UNIQUE (group_id, rank),
    CHECK (played = won + drawn + lost)
);

CREATE TABLE IF NOT EXISTS sport_bracket_matches (
    id SERIAL PRIMARY KEY,
    sport_id INT NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    round_name VARCHAR(20) NOT NULL CHECK (round_name IN ('SEMIFINAL', 'FINAL', 'THIRD_PLACE')),
    round_order SMALLINT NOT NULL,
    match_order SMALLINT NOT NULL,
    label VARCHAR(80) NOT NULL,
    home_contingent_id INT REFERENCES contingents(id),
    away_contingent_id INT REFERENCES contingents(id),
    home_score SMALLINT CHECK (home_score >= 0),
    away_score SMALLINT CHECK (away_score >= 0),
    status VARCHAR(20) NOT NULL CHECK (status IN ('SCHEDULED', 'FINISHED')),
    UNIQUE (sport_id, round_name, match_order)
);

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
-- Contoh alur: Kotawaringin Barat dan Palangka Raya menang semifinal.
UPDATE sport_bracket_matches
SET home_score = 1,
    away_score = 2
WHERE sport_id BETWEEN 1 AND 32
  AND round_name = 'SEMIFINAL'
  AND match_order = 2;

UPDATE sport_bracket_matches
SET home_contingent_id = 1,
    away_contingent_id = 3
WHERE sport_id BETWEEN 1 AND 32
  AND round_name = 'FINAL'
  AND match_order = 1;

UPDATE sport_bracket_matches
SET home_contingent_id = 4,
    away_contingent_id = 2
WHERE sport_id BETWEEN 1 AND 32
  AND round_name = 'THIRD_PLACE'
  AND match_order = 2;
-- Jadwal demo untuk halaman pertandingan; bukan jadwal resmi.
ALTER TABLE matches
    ADD COLUMN IF NOT EXISTS live_stream_url TEXT;

WITH local_day AS (
    SELECT date_trunc('day', NOW() AT TIME ZONE 'Asia/Jakarta') AS day_start
)
INSERT INTO matches (
    id, event_id, venue_id, title, round_name, start_time, end_time, status,
    live_stream_url
)
SELECT
    seed.id::UUID,
    seed.event_id,
    seed.venue_id,
    seed.title,
    'Final',
    (local_day.day_start + seed.start_offset) AT TIME ZONE 'Asia/Jakarta',
    (local_day.day_start + seed.end_offset) AT TIME ZONE 'Asia/Jakarta',
    seed.status::match_status_enum,
    seed.live_stream_url
FROM local_day
CROSS JOIN (VALUES
    (
        '10000000-0000-4000-8000-000000000011', 1, 3,
        'Lari 100 Meter Putra - Final Simulasi',
        INTERVAL '08 hours', INTERVAL '09 hours', 'FINISHED', NULL::TEXT
    ),
    (
        '10000000-0000-4000-8000-000000000012', 3, 4,
        'Renang Gaya Bebas Putra - Final Simulasi',
        INTERVAL '10 hours', INTERVAL '11 hours', 'ONGOING',
        'https://www.youtube.com/results?search_query=PORPROV+XIII+Kalimantan+Tengah+Live'
    )
) AS seed(id, event_id, venue_id, title, start_offset, end_offset, status, live_stream_url)
ON CONFLICT (id) DO NOTHING;

INSERT INTO match_participants (match_id, contingent_id, athlete_id, score, is_winner)
SELECT seed.match_id::UUID, seed.contingent_id, seed.athlete_id::UUID, seed.score, seed.is_winner
FROM (VALUES
    ('10000000-0000-4000-8000-000000000011', 1, '00000000-0000-4000-8000-000000000001', '10.25 detik', TRUE),
    ('10000000-0000-4000-8000-000000000011', 2, '00000000-0000-4000-8000-000000000002', '10.48 detik', FALSE),
    ('10000000-0000-4000-8000-000000000012', 3, '00000000-0000-4000-8000-000000000003', '52.10 detik', FALSE),
    ('10000000-0000-4000-8000-000000000012', 4, '00000000-0000-4000-8000-000000000004', '52.75 detik', FALSE)
) AS seed(match_id, contingent_id, athlete_id, score, is_winner)
WHERE NOT EXISTS (
    SELECT 1
    FROM match_participants existing
    WHERE existing.match_id = seed.match_id::UUID
      AND existing.contingent_id = seed.contingent_id
);
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

-- Migration 000009: Full Admin Workflow Support (Events for all 32 sports, Quarterfinals in Bracket, Flexible Group Ranking)

-- 1. Allow flexible re-ranking in sport_group_standings without unique constraint collision during updates
ALTER TABLE sport_group_standings
    DROP CONSTRAINT IF EXISTS sport_group_standings_group_id_rank_key;

-- 2. Expand sport_bracket_matches constraints to support QUARTERFINAL and ONGOING status
ALTER TABLE sport_bracket_matches
    DROP CONSTRAINT IF EXISTS sport_bracket_matches_round_name_check;

ALTER TABLE sport_bracket_matches
    ADD CONSTRAINT sport_bracket_matches_round_name_check
    CHECK (round_name IN ('QUARTERFINAL', 'SEMIFINAL', 'FINAL', 'THIRD_PLACE'));

ALTER TABLE sport_bracket_matches
    DROP CONSTRAINT IF EXISTS sport_bracket_matches_status_check;

ALTER TABLE sport_bracket_matches
    ADD CONSTRAINT sport_bracket_matches_status_check
    CHECK (status IN ('SCHEDULED', 'ONGOING', 'FINISHED'));

-- 3. Adjust round_order so QUARTERFINAL = 1, SEMIFINAL = 2, FINAL & THIRD_PLACE = 3
UPDATE sport_bracket_matches
SET round_order = 2
WHERE round_name = 'SEMIFINAL';

UPDATE sport_bracket_matches
SET round_order = 3
WHERE round_name IN ('FINAL', 'THIRD_PLACE');

-- Seed 4 Quarterfinal matches per sport for all 32 sports
INSERT INTO sport_bracket_matches (
    sport_id, round_name, round_order, match_order, label,
    home_contingent_id, away_contingent_id, home_score, away_score, status
)
SELECT s.id, seed.round_name, seed.round_order, seed.match_order, seed.label,
       seed.home_contingent_id, seed.away_contingent_id, seed.home_score, seed.away_score, seed.status
FROM sports s
CROSS JOIN (VALUES
    ('QUARTERFINAL', 1, 1, 'Perempat Final 1', 1, 9, 2, 0, 'FINISHED'),
    ('QUARTERFINAL', 1, 2, 'Perempat Final 2', 4, 14, 2, 1, 'FINISHED'),
    ('QUARTERFINAL', 1, 3, 'Perempat Final 3', 2, 10, 2, 0, 'FINISHED'),
    ('QUARTERFINAL', 1, 4, 'Perempat Final 4', 3, 6, 2, 1, 'FINISHED')
) AS seed(round_name, round_order, match_order, label, home_contingent_id, away_contingent_id, home_score, away_score, status)
WHERE s.id BETWEEN 1 AND 32
ON CONFLICT (sport_id, round_name, match_order) DO NOTHING;

-- 4. Ensure every sport (all 32 cabor) has standard Nomor Pertandingan (sport_events)
INSERT INTO sport_events (sport_id, name, gender)
SELECT s.id, ev.name, ev.gender
FROM sports s
CROSS JOIN (VALUES
    ('Nomor Putra', 'Men'),
    ('Nomor Putri', 'Women'),
    ('Beregu / Campuran', 'Mixed')
) AS ev(name, gender)
WHERE NOT EXISTS (
    SELECT 1 FROM sport_events se
    WHERE se.sport_id = s.id AND se.name = ev.name
);

SELECT setval(pg_get_serial_sequence('sport_events', 'id'), COALESCE((SELECT MAX(id) FROM sport_events), 1), TRUE);
SELECT setval(pg_get_serial_sequence('sport_bracket_matches', 'id'), COALESCE((SELECT MAX(id) FROM sport_bracket_matches), 1), TRUE);

-- Migration 000010: Hapus data dummy pada bagan, klasemen grup, medali, dan hasil pertandingan contoh

-- 1. Hapus medali contoh/dummy dari seed awal
DELETE FROM medals
WHERE athlete_id IN (
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-000000000003',
    '00000000-0000-4000-8000-000000000004',
    '00000000-0000-4000-8000-000000000005',
    '00000000-0000-4000-8000-000000000006',
    '00000000-0000-4000-8000-000000000007',
    '00000000-0000-4000-8000-000000000008',
    '00000000-0000-4000-8000-000000000009',
    '00000000-0000-4000-8000-000000000010'
) OR event_id IN (
    SELECT id FROM sport_events WHERE name ILIKE '%Contoh%'
);

-- 2. Hapus jadwal & hasil pertandingan contoh/simulasi dari seed awal
DELETE FROM matches
WHERE id IN (
    '10000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000006',
    '10000000-0000-4000-8000-000000000007',
    '10000000-0000-4000-8000-000000000008',
    '10000000-0000-4000-8000-000000000009',
    '10000000-0000-4000-8000-000000000010',
    '10000000-0000-4000-8000-000000000011',
    '10000000-0000-4000-8000-000000000012'
) OR title ILIKE '%Contoh%' OR title ILIKE '%Simulasi%';

-- 3. Hapus nomor pertandingan dan atlet contoh
DELETE FROM sport_events WHERE name ILIKE '%Contoh%' AND NOT EXISTS (
    SELECT 1 FROM matches m WHERE m.event_id = sport_events.id
);

DELETE FROM athletes WHERE full_name ILIKE 'Atlet Contoh%';

-- 4. Kosongkan poin/peserta dummy pada klasemen grup (struktur Grup A & Grup B tetap tersedia)
DELETE FROM sport_group_standings
WHERE group_id IN (SELECT id FROM sport_groups);

-- 5. Reset kontingen & skor dummy pada bagan penyisihan agar bersih (slot Perempat Final, Semifinal, Juara 3, Final siap diisi Admin)
UPDATE sport_bracket_matches
SET home_contingent_id = NULL,
    away_contingent_id = NULL,
    home_score = NULL,
    away_score = NULL,
    status = 'SCHEDULED';

-- Migration 000011: Update logo_url resmi untuk 14 Kontingen Kabupaten/Kota se-Kalimantan Tengah
UPDATE contingents SET logo_url = '/logos/kobar.png' WHERE id = 1 OR short_code = 'KOBAR';
UPDATE contingents SET logo_url = '/logos/kotim.png' WHERE id = 2 OR short_code = 'KOTIM';
UPDATE contingents SET logo_url = '/logos/plk.png' WHERE id = 3 OR short_code = 'PLK';
UPDATE contingents SET logo_url = '/logos/kps.png' WHERE id = 4 OR short_code = 'KPS';
UPDATE contingents SET logo_url = '/logos/barsel.png' WHERE id = 5 OR short_code = 'BARSEL';
UPDATE contingents SET logo_url = '/logos/barut.png' WHERE id = 6 OR short_code = 'BARUT';
UPDATE contingents SET logo_url = '/logos/bartim.png' WHERE id = 7 OR short_code = 'BARTIM';
UPDATE contingents SET logo_url = '/logos/mura.png' WHERE id = 8 OR short_code = 'MURA';
UPDATE contingents SET logo_url = '/logos/ktn.png' WHERE id = 9 OR short_code = 'KTN';
UPDATE contingents SET logo_url = '/logos/sry.png' WHERE id = 10 OR short_code = 'SRY';
UPDATE contingents SET logo_url = '/logos/pulpis.png' WHERE id = 11 OR short_code = 'PULPIS';
UPDATE contingents SET logo_url = '/logos/gmas.png' WHERE id = 12 OR short_code = 'GMAS';
UPDATE contingents SET logo_url = '/logos/skm.png' WHERE id = 13 OR short_code = 'SKM';
UPDATE contingents SET logo_url = '/logos/lmd.png' WHERE id = 14 OR short_code = 'LMD';

