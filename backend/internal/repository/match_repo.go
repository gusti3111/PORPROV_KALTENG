package repository

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"porprov-backend/internal/database"
	"porprov-backend/internal/model"
)

var ErrDatabaseUnavailable = errors.New("database unavailable")
var ErrMatchNotFound = errors.New("match not found")
var ErrInvalidContingents = errors.New("exactly two distinct valid contingents are required")

type MatchFilters struct {
	Date    *time.Time
	SportID *int
	VenueID *int
	Status  *model.MatchStatus
}

type MatchRepository struct {
	db *database.DB
}

func NewMatchRepository(db *database.DB) *MatchRepository {
	return &MatchRepository{db: db}
}

func (r *MatchRepository) List(ctx context.Context, filters MatchFilters) ([]model.ScheduleMatch, error) {
	if r.db == nil || r.db.Pool == nil {
		return nil, ErrDatabaseUnavailable
	}

	var date *string
	if filters.Date != nil {
		value := filters.Date.Format("2006-01-02")
		date = &value
	}

	var status *string
	if filters.Status != nil {
		value := string(*filters.Status)
		status = &value
	}

	rows, err := r.db.Pool.Query(ctx, `
		SELECT
			m.id::text,
			s.name,
			se.name,
			v.name,
			m.title,
			COALESCE(m.round_name, ''),
			m.start_time,
			m.status::text,
			COALESCE(m.live_stream_url, ''),
			COALESCE(
				jsonb_agg(
					jsonb_build_object(
						'id', mp.id,
						'contingent_id', c.id,
						'contingent_name', c.name,
						'athlete_name', COALESCE(a.full_name, ''),
						'score', COALESCE(mp.score, ''),
						'is_winner', COALESCE(mp.is_winner, false)
					)
					ORDER BY mp.id
				) FILTER (WHERE mp.id IS NOT NULL),
				'[]'::jsonb
			)::text
		FROM matches m
		JOIN sport_events se ON se.id = m.event_id
		JOIN sports s ON s.id = se.sport_id
		JOIN venues v ON v.id = m.venue_id
		LEFT JOIN match_participants mp ON mp.match_id = m.id
		LEFT JOIN contingents c ON c.id = mp.contingent_id
		LEFT JOIN athletes a ON a.id = mp.athlete_id
		WHERE
			($1::date IS NULL OR (m.start_time AT TIME ZONE 'Asia/Jakarta')::date = $1::date)
			AND ($2::int IS NULL OR s.id = $2::int)
			AND ($3::int IS NULL OR v.id = $3::int)
			AND ($4::text IS NULL OR m.status::text = $4::text)
		GROUP BY m.id, s.name, se.name, v.name
		ORDER BY m.start_time ASC, m.id ASC
	`, date, filters.SportID, filters.VenueID, status)
	if err != nil {
		return nil, fmt.Errorf("query matches: %w", err)
	}
	defer rows.Close()

	matches := make([]model.ScheduleMatch, 0)
	for rows.Next() {
		var match model.ScheduleMatch
		var participantsJSON string
		if err := rows.Scan(
			&match.ID,
			&match.SportName,
			&match.EventName,
			&match.VenueName,
			&match.Title,
			&match.RoundName,
			&match.StartTime,
			&match.Status,
			&match.LiveStreamURL,
			&participantsJSON,
		); err != nil {
			return nil, fmt.Errorf("scan match: %w", err)
		}

		match.Date = match.StartTime.In(time.FixedZone("WIB", 7*60*60)).Format("2006-01-02")
		match.Time = match.StartTime.In(time.FixedZone("WIB", 7*60*60)).Format("15:04")
		if err := json.Unmarshal([]byte(participantsJSON), &match.Participants); err != nil {
			return nil, fmt.Errorf("decode match participants: %w", err)
		}
		if match.Participants == nil {
			match.Participants = make([]model.MatchParticipant, 0)
		}
		matches = append(matches, match)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate matches: %w", err)
	}

	return matches, nil
}

func (r *MatchRepository) CreateMatch(ctx context.Context, eventID, venueID int, title, roundName string, startTime, endTime time.Time, status model.MatchStatus) (string, error) {
	if r.db == nil || r.db.Pool == nil {
		return "", ErrDatabaseUnavailable
	}
	var id string
	err := r.db.Pool.QueryRow(ctx, `
		INSERT INTO matches (event_id, venue_id, title, round_name, start_time, end_time, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id
	`, eventID, venueID, title, roundName, startTime, endTime, status).Scan(&id)
	if err != nil {
		return "", fmt.Errorf("create match: %w", err)
	}
	return id, nil
}

func (r *MatchRepository) DeleteMatch(ctx context.Context, matchID string) error {
	if r.db == nil || r.db.Pool == nil {
		return ErrDatabaseUnavailable
	}
	_, err := r.db.Pool.Exec(ctx, `DELETE FROM matches WHERE id = $1`, matchID)
	if err != nil {
		return fmt.Errorf("delete match: %w", err)
	}
	return nil
}

func (r *MatchRepository) GetMatch(ctx context.Context, matchID string) (*model.ScheduleMatch, error) {
	if r.db == nil || r.db.Pool == nil {
		return nil, ErrDatabaseUnavailable
	}
	var match model.ScheduleMatch
	var participantsJSON string
	err := r.db.Pool.QueryRow(ctx, `
		SELECT
			m.id::text,
			s.name,
			se.name,
			v.name,
			m.title,
			COALESCE(m.round_name, ''),
			m.start_time,
			m.status::text,
			COALESCE(m.live_stream_url, ''),
			COALESCE(
				jsonb_agg(
					jsonb_build_object(
						'id', mp.id,
						'contingent_id', c.id,
						'contingent_name', c.name,
						'athlete_name', COALESCE(a.full_name, ''),
						'score', COALESCE(mp.score, ''),
						'is_winner', COALESCE(mp.is_winner, false)
					)
					ORDER BY mp.id
				) FILTER (WHERE mp.id IS NOT NULL),
				'[]'::jsonb
			)::text
		FROM matches m
		JOIN sport_events se ON se.id = m.event_id
		JOIN sports s ON s.id = se.sport_id
		JOIN venues v ON v.id = m.venue_id
		LEFT JOIN match_participants mp ON mp.match_id = m.id
		LEFT JOIN contingents c ON c.id = mp.contingent_id
		LEFT JOIN athletes a ON a.id = mp.athlete_id
		WHERE m.id = $1
		GROUP BY m.id, s.name, se.name, v.name
	`, matchID).Scan(
		&match.ID,
		&match.SportName,
		&match.EventName,
		&match.VenueName,
		&match.Title,
		&match.RoundName,
		&match.StartTime,
		&match.Status,
		&match.LiveStreamURL,
		&participantsJSON,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("get match: %w", err)
	}
	match.Date = match.StartTime.In(time.FixedZone("WIB", 7*60*60)).Format("2006-01-02")
	match.Time = match.StartTime.In(time.FixedZone("WIB", 7*60*60)).Format("15:04")
	if err := json.Unmarshal([]byte(participantsJSON), &match.Participants); err != nil {
		return nil, fmt.Errorf("decode match participants: %w", err)
	}
	if match.Participants == nil {
		match.Participants = make([]model.MatchParticipant, 0)
	}
	return &match, nil
}

func (r *MatchRepository) UpdateMatch(ctx context.Context, matchID string, status model.MatchStatus, scores []string) error {
	if r.db == nil || r.db.Pool == nil {
		return ErrDatabaseUnavailable
	}

	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	// 1. Update Match Status
	_, err = tx.Exec(ctx, `UPDATE matches SET status = $1 WHERE id = $2`, status, matchID)
	if err != nil {
		return fmt.Errorf("update match status: %w", err)
	}

	// 2. Update Participants Scores & Determine Winner
	var winnerContingentID int = -1
	maxScore := -1

	for i, score := range scores {
		var pID, cID int
		err := tx.QueryRow(ctx, `
			SELECT mp.id, mp.contingent_id 
			FROM match_participants mp 
			WHERE mp.match_id = $1 
			ORDER BY mp.id LIMIT 1 OFFSET $2`, matchID, i).Scan(&pID, &cID)
		if err != nil {
			return fmt.Errorf("get participant id: %w", err)
		}

		_, err = tx.Exec(ctx, `UPDATE match_participants SET score = $1, is_winner = false WHERE id = $2`, score, pID)
		if err != nil {
			return fmt.Errorf("update participant score: %w", err)
		}

		var sVal int
		fmt.Sscanf(score, "%d", &sVal)
		if sVal > maxScore {
			maxScore = sVal
			winnerContingentID = cID
		}
	}

	// 3. Automated Bracket & Standing Logic
	if status == model.MatchStatusFinished && winnerContingentID != -1 {
		// Mark Winner
		_, err = tx.Exec(ctx, `UPDATE match_participants SET is_winner = true WHERE match_id = $1 AND contingent_id = $2`, matchID, winnerContingentID)
		if err != nil {
			return fmt.Errorf("mark winner: %w", err)
		}

		// A. Bracket Automation: Move winner to NextMatchID
		var nextMatchID string
		err = tx.QueryRow(ctx, `SELECT next_match_id FROM matches WHERE id = $1`, matchID).Scan(&nextMatchID)
		if err == nil && nextMatchID != "" {
			// Find the correct slot in the next match to fill
			// This is a simplified logic: fill the first available slot or based on participant index
			_, err = tx.Exec(ctx, `
				UPDATE match_participants 
				SET contingent_id = $1 
				WHERE match_id = $2 AND (contingent_id IS NULL OR contingent_id = 0)
				LIMIT 1`, winnerContingentID, nextMatchID)
			if err != nil {
				fmt.Printf("bracket auto-update warning: %v\n", err)
			}
		}

		// B. Standing Automation: Update Points for Round Robin
		// Assuming there's a relation between matches and tournament groups
		_, err = tx.Exec(ctx, `
			UPDATE sport_tournament_standings sts
			SET played = played + 1,
			    won = won + 1,
			    points = points + 3
			WHERE sts.contingent = (SELECT name FROM contingents WHERE id = $1)
			AND EXISTS (SELECT 1 FROM matches m WHERE m.id = $2)
		`, winnerContingentID, matchID)
		if err != nil {
			fmt.Printf("standing update warning: %v\n", err)
		}
	}

	return tx.Commit(ctx)
}

func (r *MatchRepository) UpdateMatchParticipants(ctx context.Context, matchID string, contingentIDs []int) error {
	if r.db == nil || r.db.Pool == nil {
		return ErrDatabaseUnavailable
	}
	if len(contingentIDs) != 2 ||
		contingentIDs[0] < 1 || contingentIDs[0] > 2147483647 ||
		contingentIDs[1] < 1 || contingentIDs[1] > 2147483647 ||
		contingentIDs[0] == contingentIDs[1] {
		return ErrInvalidContingents
	}
	contingentIDs32 := []int32{int32(contingentIDs[0]), int32(contingentIDs[1])}

	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	var lockedMatchID string
	if err := tx.QueryRow(ctx, `SELECT id::text FROM matches WHERE id = $1 FOR UPDATE`, matchID).Scan(&lockedMatchID); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrMatchNotFound
		}
		return fmt.Errorf("lock match: %w", err)
	}

	var validCount int
	if err := tx.QueryRow(ctx, `
		SELECT COUNT(*) FROM contingents WHERE id = ANY($1::int[])
	`, contingentIDs32).Scan(&validCount); err != nil {
		return fmt.Errorf("validate contingents: %w", err)
	}
	if validCount != len(contingentIDs) {
		return ErrInvalidContingents
	}

	rows, err := tx.Query(ctx, `
		SELECT id, contingent_id
		FROM match_participants
		WHERE match_id = $1
		ORDER BY id
		FOR UPDATE
	`, matchID)
	if err != nil {
		return fmt.Errorf("get match participants: %w", err)
	}
	type participant struct {
		id           int
		contingentID int
	}
	participants := make([]participant, 0, 2)
	for rows.Next() {
		var current participant
		if err := rows.Scan(&current.id, &current.contingentID); err != nil {
			rows.Close()
			return fmt.Errorf("scan match participant: %w", err)
		}
		participants = append(participants, current)
	}
	if err := rows.Err(); err != nil {
		rows.Close()
		return fmt.Errorf("read match participants: %w", err)
	}
	rows.Close()

	for slot, contingentID := range contingentIDs {
		if slot < len(participants) {
			if participants[slot].contingentID != contingentID {
				_, err = tx.Exec(ctx, `
					UPDATE match_participants
					SET contingent_id = $1, athlete_id = NULL, score = NULL, is_winner = false
					WHERE id = $2
				`, contingentID, participants[slot].id)
				if err != nil {
					return fmt.Errorf("update match participant: %w", err)
				}
			}
			continue
		}

		_, err = tx.Exec(ctx, `
			INSERT INTO match_participants (match_id, contingent_id)
			VALUES ($1, $2)
		`, matchID, contingentID)
		if err != nil {
			return fmt.Errorf("add match participant: %w", err)
		}
	}

	if len(participants) > len(contingentIDs) {
		extraIDs := make([]int32, 0, len(participants)-len(contingentIDs))
		for _, current := range participants[len(contingentIDs):] {
			extraIDs = append(extraIDs, int32(current.id))
		}
		_, err = tx.Exec(ctx, `
			DELETE FROM match_participants
			WHERE id = ANY($1::int[])
		`, extraIDs)
		if err != nil {
			return fmt.Errorf("remove extra match participants: %w", err)
		}
	}

	return tx.Commit(ctx)
}

func (r *MatchRepository) UpdateMatchFields(ctx context.Context, matchID string, title, roundName string, startTime, endTime time.Time, status model.MatchStatus) error {
	if r.db == nil || r.db.Pool == nil {
		return ErrDatabaseUnavailable
	}
	_, err := r.db.Pool.Exec(ctx, `
		UPDATE matches SET 
			title = $2, 
			round_name = $3, 
			start_time = $4, 
			end_time = $5, 
			status = $6 
		WHERE id = $1
	`, matchID, title, roundName, startTime, endTime, status)
	if err != nil {
		return fmt.Errorf("update match fields: %w", err)
	}
	return nil
}
