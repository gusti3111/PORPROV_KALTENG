-- Seed Data Kontingen Kalteng
INSERT INTO contingents (id, name, short_code) VALUES
(1, 'Kotawaringin Barat', 'KOBAR'),
(2, 'Kotawaringin Timur', 'KOTIM'),
(3, 'Kota Palangka Raya', 'PLK'),
(4, 'Kapuas', 'KPS'),
(5, 'Barito Selatan', 'BARSEL'),
(6, 'Barito Utara', 'BARUT'),
(7, 'Barito Timur', 'BARTIM'),
(8, 'Murung Raya', 'MURA'),
(9, 'Katingan', 'KTN'),
(10, 'Seruyan', 'SRY'),
(11, 'Pulang Pisau', 'PULPIS'),
(12, 'Gunung Mas', 'GMAS'),
(13, 'Sukamara', 'SKM'),
(14, 'Lamandau', 'LMD')
ON CONFLICT (id) DO NOTHING;

-- Seed Data Cabang Olahraga
INSERT INTO sports (id, name, code, category, icon_symbol, description) VALUES
(1, 'Aerosport', 'AE', 'Utama', 'AE', 'Cabang olahraga dirgantara'),
(2, 'Atletik', 'AT', 'Utama', 'AT', 'Nomor lari, lompat, dan lempar'),
(3, 'Aquatik', 'AB', 'Utama', 'AB', 'Kegiatan olahraga di air'),
(4, 'Balap Sepeda', 'BS', 'Utama', 'BS', 'Balapan sepeda'),
(5, 'Biliard', 'BI', 'Utama', 'BI', 'Ketepatan dan strategi'),
(6, 'Binaraga Fitness', 'BF', 'Utama', 'BF', 'Kebugaran dan pembentukan tubuh'),
(7, 'Basket', 'BK', 'Utama', 'BK', 'Permainan bola basket'),
(8, 'Bridge', 'BR', 'Utama', 'BR', 'Permainan kartu strategi'),
(9, 'Bulutangkis', 'BU', 'Utama', 'BU', 'Kecepatan dan ketepatan'),
(10, 'Catur', 'CA', 'Utama', 'CA', 'Olahraga strategi'),
(11, 'Drumband', 'DB', 'Utama', 'DB', 'Perpaduan musik dan baris-berbaris'),
(12, 'Dancesport', 'DS', 'Utama', 'DS', 'Olahraga tari'),
(13, 'E-Sport', 'ES', 'Utama', 'ES', 'Kompetisi olahraga elektronik'),
(14, 'Gimnastik', 'GI', 'Utama', 'GI', 'Kelenturan, kekuatan, dan keseimbangan'),
(15, 'Judo', 'JU', 'Utama', 'JU', 'Olahraga bela diri'),
(16, 'Karate', 'KA', 'Utama', 'KA', 'Teknik dan disiplin bela diri'),
(17, 'Korfball', 'KO', 'Utama', 'KO', 'Permainan bola beregu'),
(18, 'MMA.', 'MA', 'Utama', 'MA', 'Seni bela diri modern'),
(19, 'Panahan', 'PA', 'Utama', 'PA', 'Akurasi dan konsentrasi'),
(20, 'Panjat Tebing', 'PT', 'Utama', 'PT', 'Ketangkasan di dinding panjat'),
(21, 'Pencak Silat', 'PS', 'Utama', 'PS', 'Seni bela diri Indonesia'),
(22, 'Sepak Takraw', 'ST', 'Utama', 'ST', 'Permainan bola rotan beregu'),
(23, 'Taekwondo', 'TK', 'Utama', 'TK', 'Olahraga bela diri Korea'),
(24, 'Tenis Lapangan', 'TL', 'Utama', 'TL', 'Permainan raket di lapangan'),
(25, 'Tenis Meja', 'TM', 'Utama', 'TM', 'Permainan cepat di atas meja'),
(26, 'Tinju', 'TI', 'Utama', 'TI', 'Olahraga bela diri di atas ring'),
(27, 'Sepak Bola Mini', 'SM', 'Utama', 'SM', 'Sepak bola format mini'),
(28, 'Kick Boxing', 'KBO', 'Eksebisi', 'KBO', 'Cabang olahraga eksebisi'),
(29, 'Teqball', 'TB', 'Eksebisi', 'TB', 'Cabang olahraga eksebisi'),
(30, 'Muaythai', 'MT', 'Eksebisi', 'MT', 'Cabang olahraga eksebisi bela diri')
ON CONFLICT (id) DO NOTHING;

-- Seed Data Venue Utama
INSERT INTO venues (id, name, category, latitude, longitude, note) VALUES
(1, 'Stadion Sampuraga', 'Stadion & fasilitas olahraga', -2.6825645, 111.6306259, 'Tercantum untuk upacara pembukaan dan penutupan.'),
(2, 'Stadion Atletik & Sport Center', 'Stadion & fasilitas olahraga', -2.6715645, 111.6286259, NULL),
(3, 'GOR KONI', 'Stadion & fasilitas olahraga', -2.6785645, 111.6376259, NULL),
(4, 'Sport Center', 'Stadion & fasilitas olahraga', -2.6745645, 111.6356259, NULL),
(5, 'Kolam Renang', 'Stadion & fasilitas olahraga', -2.6835645, 111.6276259, NULL)
ON CONFLICT (id) DO NOTHING;
