package repository

import (
	"context"
	"fmt"
	"porprov-backend/internal/database"
	"porprov-backend/internal/model"
)

type VenueRepository struct {
	db *database.DB
}

func NewVenueRepository(db *database.DB) *VenueRepository {
	return &VenueRepository{db: db}
}

func (r *VenueRepository) GetAll(ctx context.Context) ([]model.Venue, error) {
	if r.db == nil || r.db.Pool == nil {
		return nil, ErrDatabaseUnavailable
	}

	rows, err := r.db.Pool.Query(ctx, `
		SELECT id, name, category, COALESCE(address, ''),
			latitude::double precision, longitude::double precision,
			COALESCE(note, '')
		FROM venues
		ORDER BY id ASC
	`)
	if err != nil {
		return nil, fmt.Errorf("query venues: %w", err)
	}
	defer rows.Close()

	var venues []model.Venue
	for rows.Next() {
		var v model.Venue
		if err := rows.Scan(&v.ID, &v.Name, &v.Category, &v.Address, &v.Latitude, &v.Longitude, &v.Note); err != nil {
			return nil, err
		}
		v.Position = [2]float64{v.Latitude, v.Longitude}
		venues = append(venues, v)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate venues: %w", err)
	}

	if venues == nil {
		venues = make([]model.Venue, 0)
	}

	return venues, nil
}
