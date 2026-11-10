package repository

import (
	"context"
	"database/sql"
	"fmt"

	"porprov-backend/internal/database"
	"porprov-backend/internal/model"
)

type BracketRepository struct {
	db *database.DB
}

func NewBracketRepository(db *database.DB) *BracketRepository {
	return &BracketRepository{db: db}
}

func (r *BracketRepository) GetBySportID(ctx context.Context, sportID int) ([]model.BracketMatch, error) {
	if r.db == nil || r.db.Pool == nil {
		return nil, ErrDatabaseUnavailable
	}

	rows, err := r.db.Pool.Query(ctx, `
		SELECT
			bm.id,
			bm.sport_id,
			bm.round_name,
			bm.round_order,
			bm.match_order,
			bm.label,
			bm.home_contingent_id,
			bm.away_contingent_id,
			home.name,
			away.name,
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
		return nil, fmt.Errorf("query bracket matches: %w", err)
	}
	defer rows.Close()

	matches := make([]model.BracketMatch, 0)
	for rows.Next() {
		var m model.BracketMatch
		var homeScore, awayScore sql.NullInt32
		if err := rows.Scan(
			&m.ID,
			&m.SportID,
			&m.RoundName,
			&m.RoundOrder,
			&m.MatchOrder,
			&m.Label,
			&m.HomeID,
			&m.AwayID,
			&m.HomeName,
			&m.AwayName,
			&homeScore,
			&awayScore,
			&m.Status,
		); err != nil {
			return nil, fmt.Errorf("scan bracket match: %w", err)
		}
		if homeScore.Valid {
			val := int(homeScore.Int32)
			m.HomeScore = &val
		}
		if awayScore.Valid {
			val := int(awayScore.Int32)
			m.AwayScore = &val
		}
		if m.HomeName == "" {
			m.HomeName = "TBA"
		}
		if m.AwayName == "" {
			m.AwayName = "TBA"
		}
		matches = append(matches, m)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate bracket matches: %w", err)
	}

	return matches, nil
}

func (r *BracketRepository) GetByID(ctx context.Context, id int) (*model.BracketMatch, error) {
	if r.db == nil || r.db.Pool == nil {
		return nil, ErrDatabaseUnavailable
	}

	var m model.BracketMatch
	var homeScore, awayScore sql.NullInt32
	err := r.db.Pool.QueryRow(ctx, `
		SELECT
			bm.id,
			bm.sport_id,
			bm.round_name,
			bm.round_order,
			bm.match_order,
			bm.label,
			bm.home_contingent_id,
			bm.away_contingent_id,
			home.name,
			away.name,
			bm.home_score,
			bm.away_score,
			bm.status
		FROM sport_bracket_matches bm
		LEFT JOIN contingents home ON home.id = bm.home_contingent_id
		LEFT JOIN contingents away ON away.id = bm.away_contingent_id
		WHERE bm.id = $1
	`, id).Scan(
		&m.ID,
		&m.SportID,
		&m.RoundName,
		&m.RoundOrder,
		&m.MatchOrder,
		&m.Label,
		&m.HomeID,
		&m.AwayID,
		&m.HomeName,
		&m.AwayName,
		&homeScore,
		&awayScore,
		&m.Status,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("get bracket match: %w", err)
	}
	if homeScore.Valid {
		val := int(homeScore.Int32)
		m.HomeScore = &val
	}
	if awayScore.Valid {
		val := int(awayScore.Int32)
		m.AwayScore = &val
	}
	if m.HomeName == "" {
		m.HomeName = "TBA"
	}
	if m.AwayName == "" {
		m.AwayName = "TBA"
	}
	return &m, nil
}

func (r *BracketRepository) Create(ctx context.Context, req model.BracketMatch) (int, error) {
	if r.db == nil || r.db.Pool == nil {
		return 0, ErrDatabaseUnavailable
	}
	var id int
	err := r.db.Pool.QueryRow(ctx, `
		INSERT INTO sport_bracket_matches (
			sport_id, round_name, round_order, match_order, label,
			home_contingent_id, away_contingent_id, home_score, away_score, status
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id
	`, req.SportID, req.RoundName, req.RoundOrder, req.MatchOrder, req.Label,
		req.HomeID, req.AwayID, req.HomeScore, req.AwayScore, req.Status).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("create bracket match: %w", err)
	}
	return id, nil
}

func (r *BracketRepository) Update(ctx context.Context, id int, req model.BracketMatch) error {
	if r.db == nil || r.db.Pool == nil {
		return ErrDatabaseUnavailable
	}
	_, err := r.db.Pool.Exec(ctx, `
		UPDATE sport_bracket_matches SET
			home_contingent_id = $2,
			away_contingent_id = $3,
			home_score = $4,
			away_score = $5,
			status = $6
		WHERE id = $1
	`, id, req.HomeID, req.AwayID, req.HomeScore, req.AwayScore, req.Status)
	if err != nil {
		return fmt.Errorf("update bracket match: %w", err)
	}
	return nil
}

func (r *BracketRepository) Delete(ctx context.Context, id int) error {
	if r.db == nil || r.db.Pool == nil {
		return ErrDatabaseUnavailable
	}
	_, err := r.db.Pool.Exec(ctx, `DELETE FROM sport_bracket_matches WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("delete bracket match: %w", err)
	}
	return nil
}
