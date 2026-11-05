package repository

import (
	"context"
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
		return DefaultVenues, nil
	}

	rows, err := r.db.Pool.Query(ctx, `
		SELECT id, name, category, COALESCE(address, ''), latitude, longitude, COALESCE(note, '')
		FROM venues
		ORDER BY id ASC
	`)
	if err != nil {
		return DefaultVenues, nil
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

	if len(venues) == 0 {
		return DefaultVenues, nil
	}

	return venues, nil
}
