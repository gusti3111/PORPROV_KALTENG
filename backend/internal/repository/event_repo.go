package repository

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"porprov-backend/internal/database"
	"porprov-backend/internal/model"
)

type EventRepository struct {
	db *database.DB
}

func NewEventRepository(db *database.DB) *EventRepository {
	return &EventRepository{db: db}
}

func (r *EventRepository) GetAll(ctx context.Context) ([]model.Event, error) {
	if r.db == nil || r.db.Pool == nil {
		return DefaultEvents, nil
	}

	rows, err := r.db.Pool.Query(ctx, `
		SELECT id, sport_id, name, COALESCE(gender, 'Mixed'), created_at
		FROM sport_events
		ORDER BY sport_id, name ASC
	`)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return DefaultEvents, nil
		}
		return nil, err
	}
	defer rows.Close()

	var events []model.Event
	for rows.Next() {
		var e model.Event
		if err := rows.Scan(&e.ID, &e.SportID, &e.Name, &e.Gender, &e.CreatedAt); err != nil {
			return nil, err
		}
		events = append(events, e)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	if len(events) == 0 {
		return DefaultEvents, nil
	}
	return events, nil
}

func (r *EventRepository) FindOrCreate(ctx context.Context, sportID int, name, gender string) (*model.Event, error) {
	if r.db == nil || r.db.Pool == nil {
		return nil, ErrDatabaseUnavailable
	}
	cleanName := strings.TrimSpace(name)
	if cleanName == "" {
		cleanName = "Nomor Pertandingan"
	}
	switch gender {
	case "Men", "Women", "Mixed":
	default:
		gender = "Mixed"
	}

	var ev model.Event
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, sport_id, name, COALESCE(gender, 'Mixed'), created_at
		FROM sport_events
		WHERE sport_id = $1 AND LOWER(name) = LOWER($2)
		LIMIT 1
	`, sportID, cleanName).Scan(&ev.ID, &ev.SportID, &ev.Name, &ev.Gender, &ev.CreatedAt)
	if err == nil {
		return &ev, nil
	}

	err = r.db.Pool.QueryRow(ctx, `
		INSERT INTO sport_events (sport_id, name, gender)
		VALUES ($1, $2, $3)
		RETURNING id, sport_id, name, COALESCE(gender, 'Mixed'), created_at
	`, sportID, cleanName, gender).Scan(&ev.ID, &ev.SportID, &ev.Name, &ev.Gender, &ev.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("create event: %w", err)
	}
	return &ev, nil
}

var DefaultEvents = []model.Event{
	{ID: 1, SportID: 1, Name: "Putra Putri", Gender: "Mixed", CreatedAt: time.Now().Add(-24 * time.Hour)},
	{ID: 2, SportID: 1, Name: "Putra", Gender: "Men", CreatedAt: time.Now().Add(-24 * time.Hour)},
	{ID: 3, SportID: 1, Name: "Putri", Gender: "Women", CreatedAt: time.Now().Add(-24 * time.Hour)},
	{ID: 4, SportID: 2, Name: "Putra Putri", Gender: "Mixed", CreatedAt: time.Now().Add(-24 * time.Hour)},
}
