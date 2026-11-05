package repository

import (
	"context"
	"porprov-backend/internal/database"
	"porprov-backend/internal/model"
)

type SportRepository struct {
	db *database.DB
}

func NewSportRepository(db *database.DB) *SportRepository {
	return &SportRepository{db: db}
}

func (r *SportRepository) GetAll(ctx context.Context) ([]model.Sport, error) {
	if r.db == nil || r.db.Pool == nil {
		return DefaultSports, nil
	}

	rows, err := r.db.Pool.Query(ctx, `
		SELECT id, name, code, category, icon_symbol, description
		FROM sports
		ORDER BY category ASC, name ASC
	`)
	if err != nil {
		// Fallback to defaults if table doesn't exist yet
		return DefaultSports, nil
	}
	defer rows.Close()

	var sports []model.Sport
	for rows.Next() {
		var s model.Sport
		if err := rows.Scan(&s.ID, &s.Name, &s.Code, &s.Category, &s.Icon, &s.Description); err != nil {
			return nil, err
		}
		sports = append(sports, s)
	}

	if len(sports) == 0 {
		return DefaultSports, nil
	}

	return sports, nil
}

func (r *SportRepository) GetByID(ctx context.Context, id int) (*model.Sport, error) {
	if r.db == nil || r.db.Pool == nil {
		for _, s := range DefaultSports {
			if s.ID == id {
				return &s, nil
			}
		}
		return nil, nil
	}

	var s model.Sport
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, name, code, category, icon_symbol, description
		FROM sports
		WHERE id = $1
	`, id).Scan(&s.ID, &s.Name, &s.Code, &s.Category, &s.Icon, &s.Description)
	if err != nil {
		return nil, err
	}

	return &s, nil
}
