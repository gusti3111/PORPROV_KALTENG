package repository

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
	"porprov-backend/internal/database"
	"porprov-backend/internal/model"
)

type SportTournamentRepository struct {
	db *database.DB
}

func NewSportTournamentRepository(db *database.DB) *SportTournamentRepository {
	return &SportTournamentRepository{db: db}
}

func (r *SportTournamentRepository) GetBySportID(ctx context.Context, sportID int) (*model.SportTournament, error) {
	if r.db == nil || r.db.Pool == nil {
		return nil, ErrDatabaseUnavailable
	}

	tournament := &model.SportTournament{
		Groups:        make([]model.SportTournamentGroup, 0, 2),
		Quarterfinals: make([]model.SportTournamentMatch, 0, 4),
		Semifinals:    make([]model.SportTournamentMatch, 0, 2),
	}
	if err := r.db.Pool.QueryRow(ctx, `
		SELECT id, name
		FROM sports
		WHERE id = $1
	`, sportID).Scan(&tournament.SportID, &tournament.SportName); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("query tournament sport: %w", err)
	}

	groupRows, err := r.db.Pool.Query(ctx, `
		SELECT
			g.group_code,
			g.name,
			COALESCE(c.id, 0),
			COALESCE(c.name, ''),
			COALESCE(st.rank, 0),
			COALESCE(st.played, 0),
			COALESCE(st.won, 0),
			COALESCE(st.drawn, 0),
			COALESCE(st.lost, 0),
			COALESCE(st.points, 0)
		FROM sport_groups g
		LEFT JOIN sport_group_standings st ON st.group_id = g.id
		LEFT JOIN contingents c ON c.id = st.contingent_id
		WHERE g.sport_id = $1
		ORDER BY g.sort_order, st.rank, st.points DESC, st.won DESC, c.name ASC
	`, sportID)
	if err != nil {
		return nil, fmt.Errorf("query tournament standings: %w", err)
	}
	defer groupRows.Close()

	groupIndexes := make(map[string]int, 2)
	for groupRows.Next() {
		var code, name string
		var standing model.SportTournamentStanding
		if err := groupRows.Scan(
			&code,
			&name,
			&standing.ContingentID,
			&standing.Contingent,
			&standing.Rank,
			&standing.Played,
			&standing.Won,
			&standing.Drawn,
			&standing.Lost,
			&standing.Points,
		); err != nil {
			return nil, fmt.Errorf("scan tournament standing: %w", err)
		}

		index, exists := groupIndexes[code]
		if !exists {
			index = len(tournament.Groups)
			groupIndexes[code] = index
			tournament.Groups = append(tournament.Groups, model.SportTournamentGroup{
				Code:      code,
				Name:      name,
				Standings: make([]model.SportTournamentStanding, 0, 4),
			})
		}
		if standing.ContingentID > 0 && standing.Contingent != "" {
			tournament.Groups[index].Standings = append(tournament.Groups[index].Standings, standing)
		}
	}
	if err := groupRows.Err(); err != nil {
		return nil, fmt.Errorf("iterate tournament standings: %w", err)
	}

	matchRows, err := r.db.Pool.Query(ctx, `
		SELECT
			bm.round_name,
			bm.label,
			COALESCE(home.name, ''),
			COALESCE(away.name, ''),
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
		return nil, fmt.Errorf("query tournament matches: %w", err)
	}
	defer matchRows.Close()

	for matchRows.Next() {
		var roundName string
		var match model.SportTournamentMatch
		if err := matchRows.Scan(
			&roundName,
			&match.Label,
			&match.Home,
			&match.Away,
			&match.HomeScore,
			&match.AwayScore,
			&match.Status,
		); err != nil {
			return nil, fmt.Errorf("scan tournament match: %w", err)
		}

		switch roundName {
		case "QUARTERFINAL":
			tournament.Quarterfinals = append(tournament.Quarterfinals, match)
		case "SEMIFINAL":
			tournament.Semifinals = append(tournament.Semifinals, match)
		case "FINAL":
			tournament.Final = match
		case "THIRD_PLACE":
			tournament.Bronze = match
		}
	}
	if err := matchRows.Err(); err != nil {
		return nil, fmt.Errorf("iterate tournament matches: %w", err)
	}

	if len(tournament.Groups) == 0 && len(tournament.Semifinals) == 0 {
		return nil, nil
	}
	return tournament, nil
}

func (r *SportTournamentRepository) UpsertGroupStanding(
	ctx context.Context,
	sportID int,
	groupCode string,
	contingentID int,
	won, drawn, lost, points int,
) error {
	if r.db == nil || r.db.Pool == nil {
		return ErrDatabaseUnavailable
	}
	code := strings.ToUpper(strings.TrimSpace(groupCode))
	if code == "" {
		code = "A"
	}
	groupName := "Grup " + code
	sortOrder := 1
	if code == "B" {
		sortOrder = 2
	} else if code == "C" {
		sortOrder = 3
	} else if code == "D" {
		sortOrder = 4
	}

	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	var groupID int
	err = tx.QueryRow(ctx, `
		INSERT INTO sport_groups (sport_id, group_code, name, sort_order)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (sport_id, group_code) DO UPDATE SET name = EXCLUDED.name
		RETURNING id
	`, sportID, code, groupName, sortOrder).Scan(&groupID)
	if err != nil {
		return fmt.Errorf("upsert sport group: %w", err)
	}

	if won < 0 {
		won = 0
	}
	if drawn < 0 {
		drawn = 0
	}
	if lost < 0 {
		lost = 0
	}
	played := won + drawn + lost
	if points < 0 {
		points = won*3 + drawn
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO sport_group_standings (group_id, contingent_id, rank, played, won, drawn, lost, points)
		VALUES ($1, $2, 99, $3, $4, $5, $6, $7)
		ON CONFLICT (group_id, contingent_id) DO UPDATE SET
			played = EXCLUDED.played,
			won = EXCLUDED.won,
			drawn = EXCLUDED.drawn,
			lost = EXCLUDED.lost,
			points = EXCLUDED.points
	`, groupID, contingentID, played, won, drawn, lost, points)
	if err != nil {
		return fmt.Errorf("upsert standing: %w", err)
	}

	if err := recalculateGroupRanksTx(ctx, tx, groupID); err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *SportTournamentRepository) DeleteGroupStanding(
	ctx context.Context,
	sportID int,
	groupCode string,
	contingentID int,
) error {
	if r.db == nil || r.db.Pool == nil {
		return ErrDatabaseUnavailable
	}
	code := strings.ToUpper(strings.TrimSpace(groupCode))

	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	var groupID int
	err = tx.QueryRow(ctx, `
		SELECT id FROM sport_groups WHERE sport_id = $1 AND group_code = $2
	`, sportID, code).Scan(&groupID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil
		}
		return fmt.Errorf("find group: %w", err)
	}

	_, err = tx.Exec(ctx, `
		DELETE FROM sport_group_standings
		WHERE group_id = $1 AND contingent_id = $2
	`, groupID, contingentID)
	if err != nil {
		return fmt.Errorf("delete standing: %w", err)
	}

	if err := recalculateGroupRanksTx(ctx, tx, groupID); err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *SportTournamentRepository) PromoteGroupWinners(ctx context.Context, sportID int) error {
	if r.db == nil || r.db.Pool == nil {
		return ErrDatabaseUnavailable
	}

	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	getTopContingents := func(code string) ([]int, error) {
		rows, err := tx.Query(ctx, `
			SELECT st.contingent_id
			FROM sport_group_standings st
			JOIN sport_groups g ON g.id = st.group_id
			WHERE g.sport_id = $1 AND g.group_code = $2
			ORDER BY st.rank ASC, st.points DESC, st.won DESC
			LIMIT 4
		`, sportID, code)
		if err != nil {
			return nil, err
		}
		defer rows.Close()
		var ids []int
		for rows.Next() {
			var id int
			if err := rows.Scan(&id); err != nil {
				return nil, err
			}
			ids = append(ids, id)
		}
		return ids, rows.Err()
	}

	groupA, err := getTopContingents("A")
	if err != nil {
		return err
	}
	groupB, err := getTopContingents("B")
	if err != nil {
		return err
	}

	// Update Semifinals: A1 vs B2, B1 vs A2
	if len(groupA) >= 1 && len(groupB) >= 2 {
		_, _ = tx.Exec(ctx, `
			UPDATE sport_bracket_matches
			SET home_contingent_id = $1, away_contingent_id = $2
			WHERE sport_id = $3 AND round_name = 'SEMIFINAL' AND match_order = 1
		`, groupA[0], groupB[1], sportID)
	}
	if len(groupB) >= 1 && len(groupA) >= 2 {
		_, _ = tx.Exec(ctx, `
			UPDATE sport_bracket_matches
			SET home_contingent_id = $1, away_contingent_id = $2
			WHERE sport_id = $3 AND round_name = 'SEMIFINAL' AND match_order = 2
		`, groupB[0], groupA[1], sportID)
	}

	// Also populate Quarterfinals if 4 teams per group exist:
	// QF1: A1 vs B4, QF2: B2 vs A3, QF3: B1 vs A4, QF4: A2 vs B3
	if len(groupA) >= 4 && len(groupB) >= 4 {
		_, _ = tx.Exec(ctx, `
			UPDATE sport_bracket_matches
			SET home_contingent_id = $1, away_contingent_id = $2
			WHERE sport_id = $3 AND round_name = 'QUARTERFINAL' AND match_order = 1
		`, groupA[0], groupB[3], sportID)
		_, _ = tx.Exec(ctx, `
			UPDATE sport_bracket_matches
			SET home_contingent_id = $1, away_contingent_id = $2
			WHERE sport_id = $3 AND round_name = 'QUARTERFINAL' AND match_order = 2
		`, groupB[1], groupA[2], sportID)
		_, _ = tx.Exec(ctx, `
			UPDATE sport_bracket_matches
			SET home_contingent_id = $1, away_contingent_id = $2
			WHERE sport_id = $3 AND round_name = 'QUARTERFINAL' AND match_order = 3
		`, groupB[0], groupA[3], sportID)
		_, _ = tx.Exec(ctx, `
			UPDATE sport_bracket_matches
			SET home_contingent_id = $1, away_contingent_id = $2
			WHERE sport_id = $3 AND round_name = 'QUARTERFINAL' AND match_order = 4
		`, groupA[1], groupB[2], sportID)
	}

	return tx.Commit(ctx)
}

func recalculateGroupRanksTx(ctx context.Context, tx pgx.Tx, groupID int) error {
	_, err := tx.Exec(ctx, `
		WITH ranked AS (
			SELECT
				contingent_id,
				ROW_NUMBER() OVER (
					ORDER BY points DESC, won DESC, drawn DESC, lost ASC, contingent_id ASC
				) AS new_rank
			FROM sport_group_standings
			WHERE group_id = $1
		)
		UPDATE sport_group_standings st
		SET rank = ranked.new_rank
		FROM ranked
		WHERE st.group_id = $1 AND st.contingent_id = ranked.contingent_id
	`, groupID)
	if err != nil {
		return fmt.Errorf("recalculate group ranks: %w", err)
	}
	return nil
}
