package repository

import (
	"context"
	"errors"
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
		SELECT id, sport_id, name, gender, created_at
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

var DefaultEvents = []model.Event{
	{ID: 1, SportID: 1, Name: "Putra Putri", Gender: "Mixed", CreatedAt: time.Now().Add(-24 * time.Hour)},
	{ID: 2, SportID: 1, Name: "Putra", Gender: "Men", CreatedAt: time.Now().Add(-24 * time.Hour)},
	{ID: 3, SportID: 1, Name: "Putri", Gender: "Women", CreatedAt: time.Now().Add(-24 * time.Hour)},
	{ID: 4, SportID: 2, Name: "Putra Putri", Gender: "Mixed", CreatedAt: time.Now().Add(-24 * time.Hour)},
}
