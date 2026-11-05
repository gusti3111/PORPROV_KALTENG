package repository

import (
	"context"
	"porprov-backend/internal/database"
	"porprov-backend/internal/model"
)

type MedalRepository struct {
	db *database.DB
}

func NewMedalRepository(db *database.DB) *MedalRepository {
	return &MedalRepository{db: db}
}

func (r *MedalRepository) GetStandings(ctx context.Context) ([]model.MedalStanding, error) {
	if r.db == nil || r.db.Pool == nil {
		return r.defaultStandings(), nil
	}

	rows, err := r.db.Pool.Query(ctx, `
		SELECT 
			c.id AS contingent_id,
			c.name AS contingent_name,
			c.short_code,
			COALESCE(c.logo_url, ''),
			COALESCE(COUNT(m.id) FILTER (WHERE m.medal_type = 'GOLD'), 0) AS gold,
			COALESCE(COUNT(m.id) FILTER (WHERE m.medal_type = 'SILVER'), 0) AS silver,
			COALESCE(COUNT(m.id) FILTER (WHERE m.medal_type = 'BRONZE'), 0) AS bronze,
			COALESCE(COUNT(m.id), 0) AS total
		FROM contingents c
		LEFT JOIN medals m ON c.id = m.contingent_id
		GROUP BY c.id, c.name, c.short_code, c.logo_url
		ORDER BY gold DESC, silver DESC, bronze DESC, total DESC, c.name ASC
	`)
	if err != nil {
		return r.defaultStandings(), nil
	}
	defer rows.Close()

	var standings []model.MedalStanding
	rank := 1
	for rows.Next() {
		var s model.MedalStanding
		if err := rows.Scan(&s.ContingentID, &s.ContingentName, &s.ShortCode, &s.LogoURL, &s.Gold, &s.Silver, &s.Bronze, &s.Total); err != nil {
			return nil, err
		}
		s.Rank = rank
		rank++
		standings = append(standings, s)
	}

	if len(standings) == 0 {
		return r.defaultStandings(), nil
	}

	return standings, nil
}

func (r *MedalRepository) defaultStandings() []model.MedalStanding {
	var standings []model.MedalStanding
	for i, c := range DefaultContingents {
		standings = append(standings, model.MedalStanding{
			ContingentID:   c.ID,
			ContingentName: c.Name,
			ShortCode:      c.ShortCode,
			Gold:           0,
			Silver:         0,
			Bronze:         0,
			Total:          0,
			Rank:           i + 1,
		})
	}
	return standings
}
