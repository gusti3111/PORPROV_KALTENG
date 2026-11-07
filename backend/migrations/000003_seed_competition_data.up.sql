-- Data contoh untuk demonstrasi; nama atlet dan jadwal bukan data resmi.

INSERT INTO venues (id, name, category, latitude, longitude, note) VALUES
(6, 'Lapangan Sepak Bola Contoh', 'Stadion & fasilitas olahraga', -2.6805645, 111.6326259, 'Venue contoh untuk data seed.'),
(7, 'GOR Bulu Tangkis Contoh', 'Stadion & fasilitas olahraga', -2.6775645, 111.6346259, 'Venue contoh untuk data seed.'),
(8, 'Lapangan Tenis Contoh', 'Stadion & fasilitas olahraga', -2.6755645, 111.6316259, 'Venue contoh untuk data seed.'),
(9, 'Arena Panahan Contoh', 'Stadion & fasilitas olahraga', -2.6725645, 111.6336259, 'Venue contoh untuk data seed.'),
(10, 'Pusat Latihan Contoh', 'Stadion & fasilitas olahraga', -2.6695645, 111.6366259, 'Venue contoh untuk data seed.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO sport_events (id, sport_id, name, gender) VALUES
(1, 2, 'Lari 100 Meter Putra Contoh', 'Men'),
(2, 2, 'Lari 200 Meter Putra Contoh', 'Men'),
(3, 3, 'Renang Gaya Bebas Putra Contoh', 'Men'),
(4, 3, 'Renang Gaya Dada Putra Contoh', 'Men'),
(5, 4, 'Balap Sepeda Road Race Putra Contoh', 'Men'),
(6, 4, 'Balap Sepeda Time Trial Putra Contoh', 'Men'),
(7, 7, 'Basket 3x3 Putra Contoh', 'Men'),
(8, 7, 'Basket 5x5 Putra Contoh', 'Men'),
(9, 9, 'Bulutangkis Tunggal Putra Contoh', 'Men'),
(10, 9, 'Bulutangkis Ganda Putra Contoh', 'Men')
ON CONFLICT (id) DO NOTHING;

INSERT INTO athletes (id, contingent_id, sport_id, full_name, birth_date, gender, is_verified) VALUES
('00000000-0000-4000-8000-000000000001', 1, 2, 'Atlet Contoh 01', '2002-01-15', 'M', FALSE),
('00000000-0000-4000-8000-000000000002', 2, 2, 'Atlet Contoh 02', '2001-04-20', 'M', FALSE),
('00000000-0000-4000-8000-000000000003', 3, 3, 'Atlet Contoh 03', '2003-02-11', 'M', FALSE),
('00000000-0000-4000-8000-000000000004', 4, 3, 'Atlet Contoh 04', '2000-09-05', 'M', FALSE),
('00000000-0000-4000-8000-000000000005', 5, 4, 'Atlet Contoh 05', '2002-06-18', 'M', FALSE),
('00000000-0000-4000-8000-000000000006', 6, 4, 'Atlet Contoh 06', '2001-12-03', 'M', FALSE),
('00000000-0000-4000-8000-000000000007', 7, 7, 'Atlet Contoh 07', '2004-03-22', 'M', FALSE),
('00000000-0000-4000-8000-000000000008', 8, 7, 'Atlet Contoh 08', '2003-07-14', 'M', FALSE),
('00000000-0000-4000-8000-000000000009', 9, 9, 'Atlet Contoh 09', '2000-11-30', 'M', FALSE),
('00000000-0000-4000-8000-000000000010', 10, 9, 'Atlet Contoh 10', '2002-08-09', 'M', FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO matches (id, event_id, venue_id, title, round_name, start_time, end_time, status) VALUES
('10000000-0000-4000-8000-000000000001', 1, 1, 'Lari 100 Meter Putra - Final Contoh', 'Final', '2026-10-20 09:00:00+07', '2026-10-20 09:30:00+07', 'FINISHED'),
('10000000-0000-4000-8000-000000000002', 2, 2, 'Lari 200 Meter Putra - Final Contoh', 'Final', '2026-10-20 10:00:00+07', '2026-10-20 10:30:00+07', 'FINISHED'),
('10000000-0000-4000-8000-000000000003', 3, 3, 'Renang Gaya Bebas Putra - Final Contoh', 'Final', '2026-10-21 09:00:00+07', '2026-10-21 09:30:00+07', 'FINISHED'),
('10000000-0000-4000-8000-000000000004', 4, 4, 'Renang Gaya Dada Putra - Final Contoh', 'Final', '2026-10-21 10:00:00+07', '2026-10-21 10:30:00+07', 'FINISHED'),
('10000000-0000-4000-8000-000000000005', 5, 5, 'Balap Sepeda Road Race Putra - Final Contoh', 'Final', '2026-10-22 09:00:00+07', '2026-10-22 11:00:00+07', 'FINISHED'),
('10000000-0000-4000-8000-000000000006', 6, 6, 'Balap Sepeda Time Trial Putra - Final Contoh', 'Final', '2026-10-22 13:00:00+07', '2026-10-22 15:00:00+07', 'FINISHED'),
('10000000-0000-4000-8000-000000000007', 7, 7, 'Basket 3x3 Putra - Final Contoh', 'Final', '2026-10-23 09:00:00+07', '2026-10-23 10:00:00+07', 'FINISHED'),
('10000000-0000-4000-8000-000000000008', 8, 8, 'Basket 5x5 Putra - Final Contoh', 'Final', '2026-10-23 11:00:00+07', '2026-10-23 13:00:00+07', 'FINISHED'),
('10000000-0000-4000-8000-000000000009', 9, 9, 'Bulutangkis Tunggal Putra - Final Contoh', 'Final', '2026-10-24 09:00:00+07', '2026-10-24 10:00:00+07', 'FINISHED'),
('10000000-0000-4000-8000-000000000010', 10, 10, 'Bulutangkis Ganda Putra - Final Contoh', 'Final', '2026-10-24 11:00:00+07', '2026-10-24 12:00:00+07', 'FINISHED')
ON CONFLICT (id) DO NOTHING;

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
