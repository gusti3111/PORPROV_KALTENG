-- Rollback Migration 000009

DELETE FROM sport_bracket_matches WHERE round_name = 'QUARTERFINAL';

UPDATE sport_bracket_matches
SET round_order = 1
WHERE round_name = 'SEMIFINAL';

UPDATE sport_bracket_matches
SET round_order = 2
WHERE round_name IN ('FINAL', 'THIRD_PLACE');

ALTER TABLE sport_bracket_matches
    DROP CONSTRAINT IF EXISTS sport_bracket_matches_round_name_check;

ALTER TABLE sport_bracket_matches
    ADD CONSTRAINT sport_bracket_matches_round_name_check
    CHECK (round_name IN ('SEMIFINAL', 'FINAL', 'THIRD_PLACE'));

