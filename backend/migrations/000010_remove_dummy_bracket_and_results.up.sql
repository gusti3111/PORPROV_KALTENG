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

