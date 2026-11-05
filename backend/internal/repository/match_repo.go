package repository

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"porprov-backend/internal/database"
	"porprov-backend/internal/model"
)

var ErrDatabaseUnavailable = errors.New("database unavailable")

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
