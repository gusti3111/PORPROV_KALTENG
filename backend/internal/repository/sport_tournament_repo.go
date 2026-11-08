package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"porprov-backend/internal/database"
	"porprov-backend/internal/model"
)

type SportTournamentRepository struct {
	db *database.DB
}

func NewSportTournamentRepository(db *database.DB) *SportTournamentRepository {
	return &SportTournamentRepository{db: db}
}

func (r *SportTournamentRepository) GetBySportID(ctx context.Context, sportID int) (*model.SportTournament, error) {
	if r.db == nil || r.db.Pool == nil {
		return nil, ErrDatabaseUnavailable
	}

	tournament := &model.SportTournament{
		Groups:     make([]model.SportTournamentGroup, 0, 2),
		Semifinals: make([]model.SportTournamentMatch, 0, 2),
	}
	if err := r.db.Pool.QueryRow(ctx, `
		SELECT id, name
		FROM sports
		WHERE id = $1
	`, sportID).Scan(&tournament.SportID, &tournament.SportName); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("query tournament sport: %w", err)
	}

	groupRows, err := r.db.Pool.Query(ctx, `
		SELECT
			g.group_code,
			g.name,
			c.name,
			st.rank,
			st.played,
			st.won,
			st.drawn,
			st.lost,
			st.points
		FROM sport_groups g
	JOIN sport_group_standings st ON st.group_id = g.id
		JOIN contingents c ON c.id = st.contingent_id
		WHERE g.sport_id = $1
		ORDER BY g.sort_order, st.rank
	`, sportID)
	if err != nil {
		return nil, fmt.Errorf("query tournament standings: %w", err)
	}
	defer groupRows.Close()

	groupIndexes := make(map[string]int, 2)
	for groupRows.Next() {
		var code, name string
		var standing model.SportTournamentStanding
		if err := groupRows.Scan(
			&code,
			&name,
			&standing.Contingent,
			&standing.Rank,
			&standing.Played,
			&standing.Won,
			&standing.Drawn,
			&standing.Lost,
			&standing.Points,
		); err != nil {
			return nil, fmt.Errorf("scan tournament standing: %w", err)
		}

		index, exists := groupIndexes[code]
		if !exists {
			index = len(tournament.Groups)
			groupIndexes[code] = index
			tournament.Groups = append(tournament.Groups, model.SportTournamentGroup{
				Code:      code,
				Name:      name,
				Standings: make([]model.SportTournamentStanding, 0, 4),
			})
		}
		tournament.Groups[index].Standings = append(tournament.Groups[index].Standings, standing)
	}
	if err := groupRows.Err(); err != nil {
		return nil, fmt.Errorf("iterate tournament standings: %w", err)
	}

	matchRows, err := r.db.Pool.Query(ctx, `
		SELECT
			bm.round_name,
			bm.label,
			COALESCE(home.name, ''),
			COALESCE(away.name, ''),
			bm.home_score,
			bm.away_score,
			bm.status
		FROM sport_bracket_matches bm
		LEFT JOIN contingents home ON home.id = bm.home_contingent_id
		LEFT JOIN contingents away ON away.id = bm.away_contingent_id
		WHERE bm.sport_id = $1
		ORDER BY bm.round_order, bm.match_order
	`, sportID)
	if err != nil {
		return nil, fmt.Errorf("query tournament matches: %w", err)
	}
	defer matchRows.Close()

	for matchRows.Next() {
		var roundName string
		var match model.SportTournamentMatch
		if err := matchRows.Scan(
			&roundName,
			&match.Label,
			&match.Home,
			&match.Away,
			&match.HomeScore,
			&match.AwayScore,
			&match.Status,
		); err != nil {
			return nil, fmt.Errorf("scan tournament match: %w", err)
		}

		switch roundName {
		case "SEMIFINAL":
			tournament.Semifinals = append(tournament.Semifinals, match)
		case "FINAL":
			tournament.Final = match
		case "THIRD_PLACE":
			tournament.Bronze = match
		}
	}
	if err := matchRows.Err(); err != nil {
		return nil, fmt.Errorf("iterate tournament matches: %w", err)
	}

	if len(tournament.Groups) == 0 {
		return nil, nil
	}
	return tournament, nil
}
