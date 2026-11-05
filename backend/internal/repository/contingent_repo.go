package repository

import (
	"context"
	"porprov-backend/internal/database"
	"porprov-backend/internal/model"
)

type ContingentRepository struct {
	db *database.DB
}

func NewContingentRepository(db *database.DB) *ContingentRepository {
	return &ContingentRepository{db: db}
}

func (r *ContingentRepository) GetAll(ctx context.Context) ([]model.Contingent, error) {
	if r.db == nil || r.db.Pool == nil {
		return DefaultContingents, nil
	}

	rows, err := r.db.Pool.Query(ctx, `
		SELECT id, name, short_code, COALESCE(logo_url, '')
		FROM contingents
		ORDER BY id ASC
	`)
	if err != nil {
		return DefaultContingents, nil
	}
	defer rows.Close()

	var contingents []model.Contingent
	for rows.Next() {
		var c model.Contingent
		if err := rows.Scan(&c.ID, &c.Name, &c.ShortCode, &c.LogoURL); err != nil {
			return nil, err
		}
		contingents = append(contingents, c)
	}

	if len(contingents) == 0 {
		return DefaultContingents, nil
	}

	return contingents, nil
}
