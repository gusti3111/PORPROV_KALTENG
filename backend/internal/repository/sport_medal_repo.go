package repository

import (
	"context"
	"fmt"

	"porprov-backend/internal/database"
	"porprov-backend/internal/model"
)

type SportMedalRepository struct {
	db *database.DB
}

func NewSportMedalRepository(db *database.DB) *SportMedalRepository {
	return &SportMedalRepository{db: db}
}

func (r *SportMedalRepository) GetStandings(ctx context.Context) ([]model.SportMedalStanding, error) {
	if r.db == nil || r.db.Pool == nil {
		return nil, ErrDatabaseUnavailable
	}

	rows, err := r.db.Pool.Query(ctx, `
		SELECT
			s.id,
			s.name,
			COUNT(m.id) FILTER (WHERE m.medal_type = 'GOLD')::int AS gold,
			COUNT(m.id) FILTER (WHERE m.medal_type = 'SILVER')::int AS silver,
			COUNT(m.id) FILTER (WHERE m.medal_type = 'BRONZE')::int AS bronze,
			COUNT(m.id)::int AS total
		FROM sports s
		LEFT JOIN sport_events se ON se.sport_id = s.id
		LEFT JOIN medals m ON m.event_id = se.id
		GROUP BY s.id, s.name
		ORDER BY gold DESC, silver DESC, bronze DESC, total DESC, s.name ASC
	`)
	if err != nil {
		return nil, fmt.Errorf("query sport medal standings: %w", err)
	}
	defer rows.Close()

	standings := make([]model.SportMedalStanding, 0)
	for rows.Next() {
		var standing model.SportMedalStanding
		if err := rows.Scan(
			&standing.SportID,
			&standing.Sport,
			&standing.Gold,
			&standing.Silver,
			&standing.Bronze,
			&standing.Total,
		); err != nil {
			return nil, fmt.Errorf("scan sport medal standing: %w", err)
		}
		standing.Rank = len(standings) + 1
		standings = append(standings, standing)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate sport medal standings: %w", err)
	}

	return standings, nil
}
