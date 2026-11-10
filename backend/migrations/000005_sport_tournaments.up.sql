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
