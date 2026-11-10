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
