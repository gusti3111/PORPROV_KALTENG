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

