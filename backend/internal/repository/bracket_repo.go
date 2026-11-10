package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
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
			COALESCE(home.name, 'TBA'),
			COALESCE(away.name, 'TBA'),
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
		var homeID, awayID, homeScore, awayScore sql.NullInt32
		if err := rows.Scan(
			&m.ID,
			&m.SportID,
			&m.RoundName,
			&m.RoundOrder,
			&m.MatchOrder,
			&m.Label,
			&homeID,
			&awayID,
			&m.HomeName,
			&m.AwayName,
			&homeScore,
			&awayScore,
			&m.Status,
		); err != nil {
			return nil, fmt.Errorf("scan bracket match: %w", err)
		}
		if homeID.Valid {
			val := int(homeID.Int32)
			m.HomeID = &val
		}
		if awayID.Valid {
			val := int(awayID.Int32)
			m.AwayID = &val
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
	var homeID, awayID, homeScore, awayScore sql.NullInt32
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
			COALESCE(home.name, 'TBA'),
			COALESCE(away.name, 'TBA'),
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
		&homeID,
		&awayID,
		&m.HomeName,
		&m.AwayName,
		&homeScore,
		&awayScore,
		&m.Status,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) || errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("get bracket match: %w", err)
	}
	if homeID.Valid {
		val := int(homeID.Int32)
		m.HomeID = &val
	}
	if awayID.Valid {
		val := int(awayID.Int32)
		m.AwayID = &val
	}
	if homeScore.Valid {
		val := int(homeScore.Int32)
		m.HomeScore = &val
	}
	if awayScore.Valid {
		val := int(awayScore.Int32)
		m.AwayScore = &val
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
		ON CONFLICT (sport_id, round_name, match_order) DO UPDATE SET
			label = EXCLUDED.label,
			home_contingent_id = EXCLUDED.home_contingent_id,
			away_contingent_id = EXCLUDED.away_contingent_id,
			home_score = EXCLUDED.home_score,
			away_score = EXCLUDED.away_score,
			status = EXCLUDED.status
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

	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	var sportID, matchOrder int
	var roundName string
	var existingHomeID, existingAwayID sql.NullInt32
	err = tx.QueryRow(ctx, `
		SELECT sport_id, round_name, match_order, home_contingent_id, away_contingent_id
		FROM sport_bracket_matches
		WHERE id = $1
		FOR UPDATE
	`, id).Scan(&sportID, &roundName, &matchOrder, &existingHomeID, &existingAwayID)
	if err != nil {
		return fmt.Errorf("load bracket match: %w", err)
	}

	homeID := req.HomeID
	if homeID == nil && existingHomeID.Valid {
		v := int(existingHomeID.Int32)
		homeID = &v
	} else if homeID != nil && *homeID <= 0 {
		homeID = nil
	}

	awayID := req.AwayID
	if awayID == nil && existingAwayID.Valid {
		v := int(existingAwayID.Int32)
		awayID = &v
	} else if awayID != nil && *awayID <= 0 {
		awayID = nil
	}

	status := req.Status
	if status != "SCHEDULED" && status != "ONGOING" && status != "FINISHED" {
		status = "SCHEDULED"
	}

	_, err = tx.Exec(ctx, `
		UPDATE sport_bracket_matches SET
			home_contingent_id = $2,
			away_contingent_id = $3,
			home_score = $4,
			away_score = $5,
			status = $6
		WHERE id = $1
	`, id, homeID, awayID, req.HomeScore, req.AwayScore, status)
	if err != nil {
		return fmt.Errorf("update bracket match: %w", err)
	}

	if status == "FINISHED" && req.HomeScore != nil && req.AwayScore != nil && *req.HomeScore != *req.AwayScore && homeID != nil && awayID != nil {
		winnerID := *homeID
		loserID := *awayID
		if *req.AwayScore > *req.HomeScore {
			winnerID = *awayID
			loserID = *homeID
		}
		if err := cascadeBracketProgressionTx(ctx, tx, sportID, roundName, matchOrder, winnerID, loserID); err != nil {
			return err
		}
		var eventID int
		if err := tx.QueryRow(ctx, `SELECT id FROM sport_events WHERE sport_id = $1 ORDER BY id ASC LIMIT 1`, sportID).Scan(&eventID); err == nil {
			if roundName == "FINAL" || roundName == "THIRD_PLACE" {
				_ = awardBracketMedalsTx(ctx, tx, eventID, roundName, winnerID, loserID)
			}
		}
	} else if (roundName == "FINAL" || roundName == "THIRD_PLACE") && status != "FINISHED" {
		var eventID int
		if err := tx.QueryRow(ctx, `SELECT id FROM sport_events WHERE sport_id = $1 ORDER BY id ASC LIMIT 1`, sportID).Scan(&eventID); err == nil {
			if roundName == "FINAL" {
				_, _ = tx.Exec(ctx, `DELETE FROM medals WHERE event_id = $1 AND medal_type IN ('GOLD', 'SILVER')`, eventID)
			} else if roundName == "THIRD_PLACE" {
				_, _ = tx.Exec(ctx, `DELETE FROM medals WHERE event_id = $1 AND medal_type = 'BRONZE'`, eventID)
			}
		}
	}

	return tx.Commit(ctx)
}

func (r *BracketRepository) Delete(ctx context.Context, id int) error {
	if r.db == nil || r.db.Pool == nil {
		return ErrDatabaseUnavailable
	}
	var sportID int
	var roundName string
	_ = r.db.Pool.QueryRow(ctx, `SELECT sport_id, round_name FROM sport_bracket_matches WHERE id = $1`, id).Scan(&sportID, &roundName)

	_, err := r.db.Pool.Exec(ctx, `DELETE FROM sport_bracket_matches WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("delete bracket match: %w", err)
	}
	if roundName == "FINAL" || roundName == "THIRD_PLACE" {
		var eventID int
		if err := r.db.Pool.QueryRow(ctx, `SELECT id FROM sport_events WHERE sport_id = $1 ORDER BY id ASC LIMIT 1`, sportID).Scan(&eventID); err == nil {
			if roundName == "FINAL" {
				_, _ = r.db.Pool.Exec(ctx, `DELETE FROM medals WHERE event_id = $1 AND medal_type IN ('GOLD', 'SILVER')`, eventID)
			} else if roundName == "THIRD_PLACE" {
				_, _ = r.db.Pool.Exec(ctx, `DELETE FROM medals WHERE event_id = $1 AND medal_type = 'BRONZE'`, eventID)
			}
		}
	}
	return nil
}

func cascadeBracketProgressionTx(
	ctx context.Context,
	tx pgx.Tx,
	sportID int,
	roundName string,
	matchOrder int,
	winnerID int,
	loserID int,
) error {
	switch roundName {
	case "QUARTERFINAL":
		// QF1 & QF2 -> Semifinal 1; QF3 & QF4 -> Semifinal 2
		sfOrder := 1
		if matchOrder >= 3 {
			sfOrder = 2
		}
		isHomeSlot := matchOrder%2 == 1
		if isHomeSlot {
			_, err := tx.Exec(ctx, `
				UPDATE sport_bracket_matches
				SET home_contingent_id = $1
				WHERE sport_id = $2 AND round_name = 'SEMIFINAL' AND match_order = $3
			`, winnerID, sportID, sfOrder)
			return err
		}
		_, err := tx.Exec(ctx, `
			UPDATE sport_bracket_matches
			SET away_contingent_id = $1
			WHERE sport_id = $2 AND round_name = 'SEMIFINAL' AND match_order = $3
		`, winnerID, sportID, sfOrder)
		return err

	case "SEMIFINAL":
		// SF1 -> Final (Home) & Third Place (Home)
		// SF2 -> Final (Away) & Third Place (Away)
		if matchOrder == 1 {
			if _, err := tx.Exec(ctx, `
				UPDATE sport_bracket_matches
				SET home_contingent_id = $1
				WHERE sport_id = $2 AND round_name = 'FINAL' AND match_order = 1
			`, winnerID, sportID); err != nil {
				return err
			}
			if loserID > 0 {
				_, _ = tx.Exec(ctx, `
					UPDATE sport_bracket_matches
					SET home_contingent_id = $1
					WHERE sport_id = $2 AND round_name = 'THIRD_PLACE'
				`, loserID, sportID)
			}
		} else {
			if _, err := tx.Exec(ctx, `
				UPDATE sport_bracket_matches
				SET away_contingent_id = $1
				WHERE sport_id = $2 AND round_name = 'FINAL' AND match_order = 1
			`, winnerID, sportID); err != nil {
				return err
			}
			if loserID > 0 {
				_, _ = tx.Exec(ctx, `
					UPDATE sport_bracket_matches
					SET away_contingent_id = $1
					WHERE sport_id = $2 AND round_name = 'THIRD_PLACE'
				`, loserID, sportID)
			}
		}
	}
	return nil
}

func awardBracketMedalsTx(
	ctx context.Context,
	tx pgx.Tx,
	eventID int,
	roundName string,
	winnerID int,
	loserID int,
) error {
	if eventID < 1 || winnerID < 1 {
		return nil
	}
	switch roundName {
	case "FINAL":
		_, err := tx.Exec(ctx, `
			INSERT INTO medals (event_id, contingent_id, medal_type, awarded_at)
			VALUES ($1, $2, 'GOLD', NOW())
			ON CONFLICT (event_id, medal_type) DO UPDATE SET
				contingent_id = EXCLUDED.contingent_id,
				awarded_at = NOW()
		`, eventID, winnerID)
		if err != nil {
			return err
		}
		if loserID > 0 {
			_, err = tx.Exec(ctx, `
				INSERT INTO medals (event_id, contingent_id, medal_type, awarded_at)
				VALUES ($1, $2, 'SILVER', NOW())
				ON CONFLICT (event_id, medal_type) DO UPDATE SET
					contingent_id = EXCLUDED.contingent_id,
					awarded_at = NOW()
			`, eventID, loserID)
			if err != nil {
				return err
			}
		}
	case "THIRD_PLACE":
		_, err := tx.Exec(ctx, `
			INSERT INTO medals (event_id, contingent_id, medal_type, awarded_at)
			VALUES ($1, $2, 'BRONZE', NOW())
			ON CONFLICT (event_id, medal_type) DO UPDATE SET
				contingent_id = EXCLUDED.contingent_id,
				awarded_at = NOW()
		`, eventID, winnerID)
		if err != nil {
			return err
		}
	}
	return nil
}
