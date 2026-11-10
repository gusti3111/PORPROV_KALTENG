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
