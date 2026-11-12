package repository

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"
	"unicode"

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
			s.id,
			se.id,
			v.id,
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
		GROUP BY m.id, s.id, se.id, v.id, s.name, se.name, v.name
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
			&match.SportID,
			&match.EventID,
			&match.VenueID,
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

func (r *MatchRepository) CreateMatch(
	ctx context.Context,
	eventID, venueID int,
	title, roundName string,
	startTime, endTime time.Time,
	status model.MatchStatus,
	contingentIDs []int,
	scores []string,
	winnerContingentID int,
) (string, error) {
	if r.db == nil || r.db.Pool == nil {
		return "", ErrDatabaseUnavailable
	}
	if status == "" {
		status = model.MatchStatusScheduled
	}

	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return "", fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	var id string
	err = tx.QueryRow(ctx, `
		INSERT INTO matches (event_id, venue_id, title, round_name, start_time, end_time, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id::text
	`, eventID, venueID, title, roundName, startTime, endTime, status).Scan(&id)
	if err != nil {
		return "", fmt.Errorf("create match: %w", err)
	}

	var sportID int
	_ = tx.QueryRow(ctx, `SELECT sport_id FROM sport_events WHERE id = $1`, eventID).Scan(&sportID)

	validContingents := make([]int, 0, 2)
	for _, cid := range contingentIDs {
		if cid > 0 {
			validContingents = append(validContingents, cid)
		}
	}

	for _, cid := range validContingents {
		_, err = tx.Exec(ctx, `
			INSERT INTO match_participants (match_id, contingent_id)
			VALUES ($1, $2)
		`, id, cid)
		if err != nil {
			return "", fmt.Errorf("insert match participant: %w", err)
		}
	}

	// Sync newly scheduled match participants with Group Standings or Bracket Slot
	if sportID > 0 && len(validContingents) == 2 {
		syncScheduledMatchToTournamentTx(ctx, tx, sportID, roundName, title, validContingents[0], validContingents[1])
	}

	if err := tx.Commit(ctx); err != nil {
		return "", fmt.Errorf("commit create match: %w", err)
	}

	hasNonEmptyScores := false
	for _, s := range scores {
		if strings.TrimSpace(s) != "" {
			hasNonEmptyScores = true
			break
		}
	}
	if (status == model.MatchStatusFinished || hasNonEmptyScores) && len(validContingents) >= 2 {
		if err := r.UpdateMatchWithWinner(ctx, id, status, scores, winnerContingentID); err != nil {
			return id, fmt.Errorf("sync created match result: %w", err)
		}
	} else if sportID > 0 {
		_ = r.SyncSportTournamentAndMedals(ctx, sportID)
	}

	return id, nil
}

func (r *MatchRepository) DeleteMatch(ctx context.Context, matchID string) error {
	if r.db == nil || r.db.Pool == nil {
		return ErrDatabaseUnavailable
	}
	var sportID int
	_ = r.db.Pool.QueryRow(ctx, `
		SELECT se.sport_id
		FROM matches m
		JOIN sport_events se ON se.id = m.event_id
		WHERE m.id = $1
	`, matchID).Scan(&sportID)

	_, err := r.db.Pool.Exec(ctx, `DELETE FROM matches WHERE id = $1`, matchID)
	if err != nil {
		return fmt.Errorf("delete match: %w", err)
	}
	if sportID > 0 {
		_ = r.SyncSportTournamentAndMedals(ctx, sportID)
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
			s.id,
			se.id,
			v.id,
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
		GROUP BY m.id, s.id, se.id, v.id, s.name, se.name, v.name
	`, matchID).Scan(
		&match.ID,
		&match.SportID,
		&match.EventID,
		&match.VenueID,
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
	return r.UpdateMatchWithWinner(ctx, matchID, status, scores, 0)
}

func (r *MatchRepository) UpdateMatchWithWinner(
	ctx context.Context,
	matchID string,
	status model.MatchStatus,
	scores []string,
	explicitWinnerID int,
) error {
	if r.db == nil || r.db.Pool == nil {
		return ErrDatabaseUnavailable
	}

	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	var eventID, sportID int
	var title, roundName string
	err = tx.QueryRow(ctx, `
		SELECT m.event_id, se.sport_id, m.title, COALESCE(m.round_name, '')
		FROM matches m
		JOIN sport_events se ON se.id = m.event_id
		WHERE m.id = $1
		FOR UPDATE OF m
	`, matchID).Scan(&eventID, &sportID, &title, &roundName)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrMatchNotFound
		}
		return fmt.Errorf("load match metadata: %w", err)
	}

	_, err = tx.Exec(ctx, `UPDATE matches SET status = $1 WHERE id = $2`, status, matchID)
	if err != nil {
		return fmt.Errorf("update match status: %w", err)
	}

	type partRow struct {
		id           int
		contingentID int
		score        string
		numVal       float64
		hasNum       bool
	}
	pRows, err := tx.Query(ctx, `
		SELECT id, contingent_id
		FROM match_participants
		WHERE match_id = $1
		ORDER BY id ASC
		FOR UPDATE
	`, matchID)
	if err != nil {
		return fmt.Errorf("load match participants: %w", err)
	}
	participants := make([]partRow, 0, 2)
	for pRows.Next() {
		var p partRow
		if err := pRows.Scan(&p.id, &p.contingentID); err != nil {
			pRows.Close()
			return fmt.Errorf("scan participant: %w", err)
		}
		participants = append(participants, p)
	}
	pRows.Close()

	lowerIsBetter := false
	for i := range participants {
		scoreStr := ""
		if i < len(scores) {
			scoreStr = strings.TrimSpace(scores[i])
		}
		participants[i].score = scoreStr
		if strings.Contains(strings.ToLower(scoreStr), "detik") {
			lowerIsBetter = true
		}
		num, ok := parsePrimaryScoreNumber(scoreStr)
		participants[i].numVal = num
		participants[i].hasNum = ok

		_, err = tx.Exec(ctx, `
			UPDATE match_participants
			SET score = $1, is_winner = false
			WHERE id = $2
		`, scoreStr, participants[i].id)
		if err != nil {
			return fmt.Errorf("update participant score: %w", err)
		}
	}

	winnerContingentID := -1
	loserContingentID := -1
	isDraw := false

	if explicitWinnerID > 0 {
		winnerContingentID = explicitWinnerID
		for _, p := range participants {
			if p.contingentID != explicitWinnerID {
				loserContingentID = p.contingentID
				break
			}
		}
	} else if len(participants) >= 2 {
		numericCount := 0
		bestIdx := -1
		tieAtTop := false
		for i, p := range participants {
			if !p.hasNum {
				continue
			}
			numericCount++
			if bestIdx == -1 {
				bestIdx = i
				continue
			}
			bestVal := participants[bestIdx].numVal
			if p.numVal == bestVal {
				tieAtTop = true
			} else if (lowerIsBetter && p.numVal < bestVal) || (!lowerIsBetter && p.numVal > bestVal) {
				bestIdx = i
				tieAtTop = false
			}
		}
		if numericCount >= 2 {
			if tieAtTop {
				isDraw = true
			} else if bestIdx >= 0 {
				winnerContingentID = participants[bestIdx].contingentID
				for i, p := range participants {
					if i != bestIdx {
						loserContingentID = p.contingentID
						break
					}
				}
			}
		} else if numericCount == 1 && bestIdx >= 0 {
			winnerContingentID = participants[bestIdx].contingentID
		}
	} else if len(participants) == 1 && participants[0].hasNum {
		winnerContingentID = participants[0].contingentID
	}

	if status == model.MatchStatusFinished {
		if winnerContingentID > 0 {
			_, err = tx.Exec(ctx, `
				UPDATE match_participants
				SET is_winner = true
				WHERE match_id = $1 AND contingent_id = $2
			`, matchID, winnerContingentID)
			if err != nil {
				return fmt.Errorf("mark winner: %w", err)
			}
		}

		// Sync with Group Standings or Knockout Bracket + Medals
		bracketRound, defaultMatchOrder := classifyRound(roundName, title)
		if bracketRound == "GROUP" && len(participants) >= 2 {
			groupCode := detectGroupCode(roundName, title)
			var hScore, aScore *int
			if participants[0].hasNum {
				v := int(participants[0].numVal)
				hScore = &v
			}
			if participants[1].hasNum {
				v := int(participants[1].numVal)
				aScore = &v
			}
			if err := updateGroupStandingsFromMatchTx(
				ctx,
				tx,
				sportID,
				groupCode,
				participants[0].contingentID,
				participants[1].contingentID,
				winnerContingentID,
				isDraw,
				hScore,
				aScore,
				participants[0].numVal,
				participants[1].numVal,
				participants[0].hasNum,
				participants[1].hasNum,
			); err != nil {
				return fmt.Errorf("sync group standings: %w", err)
			}
		} else if bracketRound != "" && len(participants) >= 2 {
			homeScore := int(participants[0].numVal)
			awayScore := int(participants[1].numVal)
			matchOrder := resolveBracketMatchOrderTx(
				ctx,
				tx,
				sportID,
				bracketRound,
				defaultMatchOrder,
				participants[0].contingentID,
				participants[1].contingentID,
			)
			_, _ = tx.Exec(ctx, `
				UPDATE sport_bracket_matches
				SET home_contingent_id = $1,
				    away_contingent_id = $2,
				    home_score = $3,
				    away_score = $4,
				    status = 'FINISHED'
				WHERE sport_id = $5 AND round_name = $6 AND match_order = $7
			`, participants[0].contingentID, participants[1].contingentID, homeScore, awayScore, sportID, bracketRound, matchOrder)

			if winnerContingentID > 0 {
				_ = cascadeBracketProgressionTx(ctx, tx, sportID, bracketRound, matchOrder, winnerContingentID, loserContingentID)
				if bracketRound == "FINAL" || bracketRound == "THIRD_PLACE" {
					_ = awardBracketMedalsTx(ctx, tx, eventID, bracketRound, winnerContingentID, loserContingentID)
				}
			}
		}
	} else if status == model.MatchStatusOngoing && len(participants) >= 2 {
		bracketRound, defaultMatchOrder := classifyRound(roundName, title)
		if bracketRound != "" && bracketRound != "GROUP" {
			homeScore := int(participants[0].numVal)
			awayScore := int(participants[1].numVal)
			matchOrder := resolveBracketMatchOrderTx(
				ctx,
				tx,
				sportID,
				bracketRound,
				defaultMatchOrder,
				participants[0].contingentID,
				participants[1].contingentID,
			)
			_, _ = tx.Exec(ctx, `
				UPDATE sport_bracket_matches
				SET home_contingent_id = $1,
				    away_contingent_id = $2,
				    home_score = $3,
				    away_score = $4,
				    status = 'ONGOING'
				WHERE sport_id = $5 AND round_name = $6 AND match_order = $7
			`, participants[0].contingentID, participants[1].contingentID, homeScore, awayScore, sportID, bracketRound, matchOrder)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return err
	}
	if sportID > 0 {
		_ = r.SyncSportTournamentAndMedals(ctx, sportID)
	}
	return nil
}

func (r *MatchRepository) UpdateMatchParticipants(ctx context.Context, matchID string, contingentIDs []int) error {
	if r.db == nil || r.db.Pool == nil {
		return ErrDatabaseUnavailable
	}
	if len(contingentIDs) < 2 {
		return ErrInvalidContingents
	}
	seen := make(map[int]bool, len(contingentIDs))
	contingentIDs32 := make([]int32, 0, len(contingentIDs))
	for _, cid := range contingentIDs {
		if cid < 1 || cid > 2147483647 || seen[cid] {
			return ErrInvalidContingents
		}
		seen[cid] = true
		contingentIDs32 = append(contingentIDs32, int32(cid))
	}

	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	var lockedMatchID, title, roundName string
	var sportID int
	if err := tx.QueryRow(ctx, `
		SELECT m.id::text, se.sport_id, m.title, COALESCE(m.round_name, '')
		FROM matches m
		JOIN sport_events se ON se.id = m.event_id
		WHERE m.id = $1
		FOR UPDATE OF m
	`, matchID).Scan(&lockedMatchID, &sportID, &title, &roundName); err != nil {
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

	if sportID > 0 && len(contingentIDs) == 2 {
		syncScheduledMatchToTournamentTx(ctx, tx, sportID, roundName, title, contingentIDs[0], contingentIDs[1])
	}

	if err := tx.Commit(ctx); err != nil {
		return err
	}
	if sportID > 0 {
		_ = r.SyncSportTournamentAndMedals(ctx, sportID)
	}
	return nil
}

func (r *MatchRepository) UpdateMatchFields(
	ctx context.Context,
	matchID string,
	eventID, venueID int,
	title, roundName string,
	startTime, endTime time.Time,
	status model.MatchStatus,
) error {
	if r.db == nil || r.db.Pool == nil {
		return ErrDatabaseUnavailable
	}
	var oldSportID int
	_ = r.db.Pool.QueryRow(ctx, `
		SELECT se.sport_id
		FROM matches m
		JOIN sport_events se ON se.id = m.event_id
		WHERE m.id = $1
	`, matchID).Scan(&oldSportID)

	_, err := r.db.Pool.Exec(ctx, `
		UPDATE matches SET
			event_id = CASE WHEN $7 > 0 THEN $7 ELSE event_id END,
			venue_id = CASE WHEN $8 > 0 THEN $8 ELSE venue_id END,
			title = $2,
			round_name = $3,
			start_time = $4,
			end_time = $5,
			status = $6
		WHERE id = $1
	`, matchID, title, roundName, startTime, endTime, status, eventID, venueID)
	if err != nil {
		return fmt.Errorf("update match fields: %w", err)
	}

	var newSportID int
	_ = r.db.Pool.QueryRow(ctx, `
		SELECT se.sport_id
		FROM matches m
		JOIN sport_events se ON se.id = m.event_id
		WHERE m.id = $1
	`, matchID).Scan(&newSportID)

	if oldSportID > 0 {
		_ = r.SyncSportTournamentAndMedals(ctx, oldSportID)
	}
	if newSportID > 0 && newSportID != oldSportID {
		_ = r.SyncSportTournamentAndMedals(ctx, newSportID)
	}
	return nil
}

func parsePrimaryScoreNumber(score string) (float64, bool) {
	trimmed := strings.TrimSpace(score)
	if trimmed == "" {
		return 0, false
	}
	var builder strings.Builder
	seenDot := false
	for _, r := range trimmed {
		if unicode.IsDigit(r) {
			builder.WriteRune(r)
		} else if r == '.' && !seenDot && builder.Len() > 0 {
			seenDot = true
			builder.WriteRune(r)
		} else if builder.Len() > 0 {
			break
		}
	}
	if builder.Len() == 0 {
		return 0, false
	}
	val, err := strconv.ParseFloat(builder.String(), 64)
	if err != nil {
		return 0, false
	}
	return val, true
}

func classifyRound(roundName, title string) (string, int) {
	combined := strings.ToLower(roundName + " " + title)
	switch {
	case strings.Contains(combined, "perempat") || strings.Contains(combined, "quarter"):
		order := 1
		if strings.Contains(combined, "2") {
			order = 2
		} else if strings.Contains(combined, "3") {
			order = 3
		} else if strings.Contains(combined, "4") {
			order = 4
		}
		return "QUARTERFINAL", order
	case strings.Contains(combined, "semifinal") || strings.Contains(combined, "semi final"):
		order := 1
		if strings.Contains(combined, "2") {
			order = 2
		}
		return "SEMIFINAL", order
	case strings.Contains(combined, "peringkat") ||
		strings.Contains(combined, "juara 3") ||
		strings.Contains(combined, "juara tiga") ||
		strings.Contains(combined, "tempat ketiga") ||
		strings.Contains(combined, "tempat ke-3") ||
		strings.Contains(combined, "tempat ke 3") ||
		strings.Contains(combined, "perunggu") ||
		strings.Contains(combined, "bronze") ||
		strings.Contains(combined, "third") ||
		strings.Contains(combined, "3rd"):
		return "THIRD_PLACE", 2
	case strings.Contains(combined, "final"):
		return "FINAL", 1
	case strings.Contains(combined, "grup") || strings.Contains(combined, "kelompok") || strings.Contains(combined, "penyisihan"):
		return "GROUP", 0
	default:
		return "GROUP", 0
	}
}

func detectGroupCode(roundName, title string) string {
	combined := strings.ToUpper(roundName + " " + title)
	if strings.Contains(combined, "GRUP B") || strings.Contains(combined, "GROUP B") {
		return "B"
	}
	return "A"
}

func resolveBracketMatchOrderTx(
	ctx context.Context,
	tx pgx.Tx,
	sportID int,
	bracketRound string,
	defaultOrder int,
	homeID, awayID int,
) int {
	if bracketRound == "FINAL" {
		return 1
	}
	if bracketRound == "THIRD_PLACE" {
		return 2
	}
	var order int
	err := tx.QueryRow(ctx, `
		SELECT match_order
		FROM sport_bracket_matches
		WHERE sport_id = $1 AND round_name = $2
		  AND (
			(home_contingent_id = $3 AND away_contingent_id = $4)
			OR (home_contingent_id = $4 AND away_contingent_id = $3)
		  )
		ORDER BY match_order ASC
		LIMIT 1
	`, sportID, bracketRound, homeID, awayID).Scan(&order)
	if err == nil && order > 0 {
		return order
	}
	if defaultOrder > 0 {
		return defaultOrder
	}
	return 1
}

func syncScheduledMatchToTournamentTx(
	ctx context.Context,
	tx pgx.Tx,
	sportID int,
	roundName, title string,
	homeID, awayID int,
) {
	bracketRound, defaultOrder := classifyRound(roundName, title)
	if bracketRound == "GROUP" {
		groupCode := detectGroupCode(roundName, title)
		groupName := "Grup " + groupCode
		sortOrder := 1
		if groupCode == "B" {
			sortOrder = 2
		}
		var groupID int
		err := tx.QueryRow(ctx, `
			INSERT INTO sport_groups (sport_id, group_code, name, sort_order)
			VALUES ($1, $2, $3, $4)
			ON CONFLICT (sport_id, group_code) DO UPDATE SET name = EXCLUDED.name
			RETURNING id
		`, sportID, groupCode, groupName, sortOrder).Scan(&groupID)
		if err == nil && groupID > 0 {
			for _, cid := range []int{homeID, awayID} {
				_, _ = tx.Exec(ctx, `
					INSERT INTO sport_group_standings (group_id, contingent_id, rank, played, won, drawn, lost, points)
					VALUES ($1, $2, 99, 0, 0, 0, 0, 0)
					ON CONFLICT (group_id, contingent_id) DO NOTHING
				`, groupID, cid)
			}
			_ = recalculateGroupRanksTx(ctx, tx, groupID)
		}
		return
	}
	if bracketRound != "" {
		order := resolveBracketMatchOrderTx(ctx, tx, sportID, bracketRound, defaultOrder, homeID, awayID)
		_, _ = tx.Exec(ctx, `
			UPDATE sport_bracket_matches
			SET home_contingent_id = $1,
			    away_contingent_id = $2
			WHERE sport_id = $3 AND round_name = $4 AND match_order = $5
		`, homeID, awayID, sportID, bracketRound, order)
	}
}

func computeSportGroupPoints(sportID int, homeScore, awayScore *int) (winPts, drawPts, lossPts int) {
	switch sportID {
	case 8, 29: // Basket (FIBA), Tenis Meja (ITTF): Menang = 2, Kalah = 1
		return 2, 0, 1
	case 9: // Bola Voli (FIVB): 3-0/3-1 = 3 pts, 3-2 = 2 pts, 2-3 = 1 pt, 0-3/1-3 = 0 pts
		if homeScore != nil && awayScore != nil &&
			((*homeScore == 3 && *awayScore == 2) || (*homeScore == 2 && *awayScore == 3)) {
			return 2, 0, 1
		}
		return 3, 0, 0
	case 6, 11, 18, 19, 21, 24, 25, 28, 30, 31: // Raket & Bela Diri: Menang = 2, Kalah = 0
		return 2, 0, 0
	case 10, 12: // Bridge & Catur: Menang = 2 MP, Remis/Seri = 1 MP, Kalah = 0
		return 2, 1, 0
	default: // Sepak Bola & Futsal, Sepak Bola Mini, Korfball, E-Sport, dll.: 3 - 1 - 0
		return 3, 1, 0
	}
}

func isTimeLeaderboardSport(sportID int) bool {
	switch sportID {
	case 2, 3, 5, 13, 23, 26: // Atletik, Akuatik, Balap Sepeda, Dayung, Panjat Tebing, Sepatu Roda
		return true
	default:
		return false
	}
}

func isScoreLeaderboardSport(sportID int) bool {
	switch sportID {
	case 1, 4, 7, 14, 15, 17, 22: // Aerosport, Bermotor, Binaraga Fitnes, Drumband, Dancesport, Gimnastik, Panahan
		return true
	default:
		return false
	}
}

func updateGroupStandingsFromMatchTx(
	ctx context.Context,
	tx pgx.Tx,
	sportID int,
	groupCode string,
	contingentA, contingentB int,
	winnerContingentID int,
	isDraw bool,
	homeScore, awayScore *int,
	homeRawScore, awayRawScore float64,
	hasHomeRaw, hasAwayRaw bool,
) error {
	groupName := "Grup " + groupCode
	sortOrder := 1
	if groupCode == "B" {
		sortOrder = 2
	}

	var groupID int
	err := tx.QueryRow(ctx, `
		INSERT INTO sport_groups (sport_id, group_code, name, sort_order)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (sport_id, group_code) DO UPDATE SET name = EXCLUDED.name
		RETURNING id
	`, sportID, groupCode, groupName, sortOrder).Scan(&groupID)
	if err != nil {
		return err
	}

	for _, cid := range []int{contingentA, contingentB} {
		_, err = tx.Exec(ctx, `
			INSERT INTO sport_group_standings (group_id, contingent_id, rank, played, won, drawn, lost, points)
			VALUES ($1, $2, 99, 0, 0, 0, 0, 0)
			ON CONFLICT (group_id, contingent_id) DO NOTHING
		`, groupID, cid)
		if err != nil {
			return err
		}
	}

	if isTimeLeaderboardSport(sportID) && (hasHomeRaw || hasAwayRaw) {
		entries := []struct {
			cid    int
			val    float64
			hasVal bool
		}{
			{contingentA, homeRawScore, hasHomeRaw},
			{contingentB, awayRawScore, hasAwayRaw},
		}
		for _, e := range entries {
			if !e.hasVal || e.val <= 0 {
				continue
			}
			centiseconds := int(e.val*100 + 0.5)
			encodedPts := 1000000 - centiseconds
			if encodedPts < 1 {
				encodedPts = 1
			}
			_, err = tx.Exec(ctx, `
				UPDATE sport_group_standings
				SET played = 1,
				    won = 0,
				    drawn = 0,
				    lost = $3,
				    points = $4
				WHERE group_id = $1 AND contingent_id = $2
			`, groupID, e.cid, centiseconds, encodedPts)
			if err != nil {
				return err
			}
		}
		return recalculateGroupRanksTx(ctx, tx, groupID)
	}

	if isScoreLeaderboardSport(sportID) && (hasHomeRaw || hasAwayRaw) {
		entries := []struct {
			cid    int
			val    float64
			hasVal bool
		}{
			{contingentA, homeRawScore, hasHomeRaw},
			{contingentB, awayRawScore, hasAwayRaw},
		}
		for _, e := range entries {
			if !e.hasVal {
				continue
			}
			scaledScore := int(e.val*100 + 0.5)
			drawnMarker := 100
			if scaledScore%100 == 0 {
				scaledScore = scaledScore / 100
				drawnMarker = 0
			}
			_, err = tx.Exec(ctx, `
				UPDATE sport_group_standings
				SET played = 1,
				    won = 0,
				    drawn = $3,
				    lost = 0,
				    points = $4
				WHERE group_id = $1 AND contingent_id = $2
			`, groupID, e.cid, drawnMarker, scaledScore)
			if err != nil {
				return err
			}
		}
		return recalculateGroupRanksTx(ctx, tx, groupID)
	}

	winPts, drawPts, lossPts := computeSportGroupPoints(sportID, homeScore, awayScore)

	if isDraw {
		for _, cid := range []int{contingentA, contingentB} {
			_, err = tx.Exec(ctx, `
				UPDATE sport_group_standings
				SET played = played + 1,
				    drawn = drawn + 1,
				    points = points + $3
				WHERE group_id = $1 AND contingent_id = $2
			`, groupID, cid, drawPts)
			if err != nil {
				return err
			}
		}
	} else if winnerContingentID > 0 {
		loserID := contingentB
		if winnerContingentID == contingentB {
			loserID = contingentA
		}
		_, err = tx.Exec(ctx, `
			UPDATE sport_group_standings
			SET played = played + 1,
			    won = won + 1,
			    points = points + $3
			WHERE group_id = $1 AND contingent_id = $2
		`, groupID, winnerContingentID, winPts)
		if err != nil {
			return err
		}
		_, err = tx.Exec(ctx, `
			UPDATE sport_group_standings
			SET played = played + 1,
			    lost = lost + 1,
			    points = points + $3
			WHERE group_id = $1 AND contingent_id = $2
		`, groupID, loserID, lossPts)
		if err != nil {
			return err
		}
	}

	return recalculateGroupRanksTx(ctx, tx, groupID)
}

func (r *MatchRepository) PurgeDummySeedDataAndSyncAll(ctx context.Context) error {
	if r.db == nil || r.db.Pool == nil {
		return ErrDatabaseUnavailable
	}

	var hasDummySeed bool
	_ = r.db.Pool.QueryRow(ctx, `
		SELECT
			EXISTS (SELECT 1 FROM medals WHERE athlete_id IS NOT NULL)
			OR EXISTS (SELECT 1 FROM sport_events WHERE name ILIKE '% Contoh')
			OR EXISTS (SELECT 1 FROM matches WHERE id::text LIKE '10000000-0000-4000-8000-%')
			OR EXISTS (SELECT 1 FROM sport_group_standings WHERE played = 3 AND points = 9)
	`).Scan(&hasDummySeed)

	if hasDummySeed {
		_, _ = r.db.Pool.Exec(ctx, `DELETE FROM matches WHERE id::text LIKE '10000000-0000-4000-8000-%'`)
		_, _ = r.db.Pool.Exec(ctx, `DELETE FROM medals WHERE athlete_id IS NOT NULL`)
		_, _ = r.db.Pool.Exec(ctx, `DELETE FROM athletes WHERE id::text LIKE '00000000-0000-4000-8000-%'`)
		_, _ = r.db.Pool.Exec(ctx, `UPDATE sport_events SET name = regexp_replace(name, '\s+Contoh$', '', 'i') WHERE name ILIKE '% Contoh'`)
		_, _ = r.db.Pool.Exec(ctx, `DELETE FROM sport_group_standings`)
		_, _ = r.db.Pool.Exec(ctx, `
			UPDATE sport_bracket_matches
			SET home_contingent_id = NULL,
			    away_contingent_id = NULL,
			    home_score = NULL,
			    away_score = NULL,
			    status = 'SCHEDULED'
		`)
		_, _ = r.db.Pool.Exec(ctx, `DELETE FROM medals`)

		rows, err := r.db.Pool.Query(ctx, `SELECT id FROM sports ORDER BY id ASC`)
		if err != nil {
			return err
		}
		sportIDs := make([]int, 0, 32)
		for rows.Next() {
			var sid int
			if err := rows.Scan(&sid); err == nil {
				sportIDs = append(sportIDs, sid)
			}
		}
		rows.Close()

		for _, sid := range sportIDs {
			_ = r.SyncSportTournamentAndMedals(ctx, sid)
		}
	}
	return nil
}

func (r *MatchRepository) SyncSportTournamentAndMedals(ctx context.Context, sportID int) error {
	if r.db == nil || r.db.Pool == nil || sportID < 1 {
		return nil
	}

	matches, err := r.List(ctx, MatchFilters{SportID: &sportID})
	if err != nil {
		return err
	}

	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// 1. Ensure default group rows exist and reset group standings for sportID
	_, _ = tx.Exec(ctx, `
		DELETE FROM sport_group_standings
		WHERE group_id IN (SELECT id FROM sport_groups WHERE sport_id = $1)
	`, sportID)

	for _, g := range []struct {
		code  string
		name  string
		order int
	}{
		{"A", "Grup A", 1},
		{"B", "Grup B", 2},
	} {
		_, _ = tx.Exec(ctx, `
			INSERT INTO sport_groups (sport_id, group_code, name, sort_order)
			VALUES ($1, $2, $3, $4)
			ON CONFLICT (sport_id, group_code) DO UPDATE SET name = EXCLUDED.name
		`, sportID, g.code, g.name, g.order)
	}

	// 2. Ensure default bracket template exists and reset bracket matches for sportID
	defaultBracketSlots := []struct {
		roundName  string
		roundOrder int
		matchOrder int
		label      string
	}{
		{"QUARTERFINAL", 0, 1, "Perempat Final 1"},
		{"QUARTERFINAL", 0, 2, "Perempat Final 2"},
		{"QUARTERFINAL", 0, 3, "Perempat Final 3"},
		{"QUARTERFINAL", 0, 4, "Perempat Final 4"},
		{"SEMIFINAL", 1, 1, "Semifinal 1"},
		{"SEMIFINAL", 1, 2, "Semifinal 2"},
		{"FINAL", 2, 1, "Final Perebutan Emas"},
		{"THIRD_PLACE", 2, 2, "Perebutan Perunggu"},
	}
	for _, slot := range defaultBracketSlots {
		_, _ = tx.Exec(ctx, `
			INSERT INTO sport_bracket_matches (
				sport_id, round_name, round_order, match_order, label,
				home_contingent_id, away_contingent_id, home_score, away_score, status
			) VALUES ($1, $2, $3, $4, $5, NULL, NULL, NULL, NULL, 'SCHEDULED')
			ON CONFLICT (sport_id, round_name, match_order) DO UPDATE SET
				home_contingent_id = NULL,
				away_contingent_id = NULL,
				home_score = NULL,
				away_score = NULL,
				status = 'SCHEDULED'
		`, sportID, slot.roundName, slot.roundOrder, slot.matchOrder, slot.label)
	}

	// 3. Clear medals for this sport's events before recomputing from finished matches
	_, _ = tx.Exec(ctx, `
		DELETE FROM medals
		WHERE event_id IN (SELECT id FROM sport_events WHERE sport_id = $1)
	`, sportID)

	type resolvedMatch struct {
		match        model.ScheduleMatch
		roundType    string
		matchOrder   int
		homeID       int
		awayID       int
		homeScore    *int
		awayScore    *int
		homeRawScore float64
		awayRawScore float64
		hasHomeRaw   bool
		hasAwayRaw   bool
		winnerID     int
		loserID      int
		isDraw       bool
	}

	resolvedList := make([]resolvedMatch, 0, len(matches))
	hasExplicitKnockout := false
	usedOrders := map[string]map[int]bool{
		"QUARTERFINAL": {},
		"SEMIFINAL":    {},
	}

	for _, m := range matches {
		if len(m.Participants) < 2 {
			continue
		}
		p0 := m.Participants[0]
		p1 := m.Participants[1]
		if p0.ContingentID < 1 || p1.ContingentID < 1 {
			continue
		}

		rType, defOrder := classifyRound(m.RoundName, m.Title)
		if rType != "GROUP" && rType != "" {
			hasExplicitKnockout = true
			if rType == "QUARTERFINAL" {
				if usedOrders["QUARTERFINAL"][defOrder] {
					for cand := 1; cand <= 4; cand++ {
						if !usedOrders["QUARTERFINAL"][cand] {
							defOrder = cand
							break
						}
					}
				}
				usedOrders["QUARTERFINAL"][defOrder] = true
			} else if rType == "SEMIFINAL" {
				if usedOrders["SEMIFINAL"][defOrder] {
					for cand := 1; cand <= 2; cand++ {
						if !usedOrders["SEMIFINAL"][cand] {
							defOrder = cand
							break
						}
					}
				}
				usedOrders["SEMIFINAL"][defOrder] = true
			}
		}

		var hScore, aScore *int
		n0, ok0 := parsePrimaryScoreNumber(p0.Score)
		n1, ok1 := parsePrimaryScoreNumber(p1.Score)
		if ok0 {
			v := int(n0)
			hScore = &v
		}
		if ok1 {
			v := int(n1)
			aScore = &v
		}

		lowerIsBetter := isTimeLeaderboardSport(sportID) || strings.Contains(strings.ToLower(p0.Score+" "+p1.Score), "detik")
		winnerID := -1
		loserID := -1
		isDraw := false

		if p0.IsWinner && !p1.IsWinner {
			winnerID = p0.ContingentID
			loserID = p1.ContingentID
		} else if p1.IsWinner && !p0.IsWinner {
			winnerID = p1.ContingentID
			loserID = p0.ContingentID
		} else if ok0 && ok1 {
			if n0 == n1 {
				isDraw = true
			} else if lowerIsBetter {
				if n0 < n1 {
					winnerID = p0.ContingentID
					loserID = p1.ContingentID
				} else {
					winnerID = p1.ContingentID
					loserID = p0.ContingentID
				}
			} else {
				if n0 > n1 {
					winnerID = p0.ContingentID
					loserID = p1.ContingentID
				} else {
					winnerID = p1.ContingentID
					loserID = p0.ContingentID
				}
			}
		}

		resolvedList = append(resolvedList, resolvedMatch{
			match:        m,
			roundType:    rType,
			matchOrder:   defOrder,
			homeID:       p0.ContingentID,
			awayID:       p1.ContingentID,
			homeScore:    hScore,
			awayScore:    aScore,
			homeRawScore: n0,
			awayRawScore: n1,
			hasHomeRaw:   ok0,
			hasAwayRaw:   ok1,
			winnerID:     winnerID,
			loserID:      loserID,
			isDraw:       isDraw,
		})
	}

	// 4. Populate Group Standings & Knockout Bracket
	groupMatchSlot := 0

	for _, rm := range resolvedList {
		statusStr := string(rm.match.Status)
		if statusStr != "SCHEDULED" && statusStr != "ONGOING" && statusStr != "FINISHED" {
			statusStr = "SCHEDULED"
		}

		if rm.roundType == "GROUP" {
			groupCode := detectGroupCode(rm.match.RoundName, rm.match.Title)
			if statusStr == "FINISHED" {
				_ = updateGroupStandingsFromMatchTx(
					ctx,
					tx,
					sportID,
					groupCode,
					rm.homeID,
					rm.awayID,
					rm.winnerID,
					rm.isDraw,
					rm.homeScore,
					rm.awayScore,
					rm.homeRawScore,
					rm.awayRawScore,
					rm.hasHomeRaw,
					rm.hasAwayRaw,
				)
			} else {
				syncScheduledMatchToTournamentTx(
					ctx,
					tx,
					sportID,
					rm.match.RoundName,
					rm.match.Title,
					rm.homeID,
					rm.awayID,
				)
			}

			// If no separate knockout match has been entered yet, mirror group matches into the bracket so Bagan immediately reflects the Admin input
			if !hasExplicitKnockout {
				groupMatchSlot++
				if groupMatchSlot <= 2 {
					_, _ = tx.Exec(ctx, `
						UPDATE sport_bracket_matches
						SET home_contingent_id = $1,
						    away_contingent_id = $2,
						    home_score = $3,
						    away_score = $4,
						    status = $5
						WHERE sport_id = $6 AND round_name = 'SEMIFINAL' AND match_order = $7
					`, rm.homeID, rm.awayID, rm.homeScore, rm.awayScore, statusStr, sportID, groupMatchSlot)
					if statusStr == "FINISHED" && rm.winnerID > 0 {
						_ = cascadeBracketProgressionTx(ctx, tx, sportID, "SEMIFINAL", groupMatchSlot, rm.winnerID, rm.loserID)
					}
				}
			}
			continue
		}

		// Explicit knockout round (QUARTERFINAL, SEMIFINAL, FINAL, THIRD_PLACE)
		order := rm.matchOrder
		if order < 1 {
			order = 1
		}
		_, _ = tx.Exec(ctx, `
			UPDATE sport_bracket_matches
			SET home_contingent_id = $1,
			    away_contingent_id = $2,
			    home_score = $3,
			    away_score = $4,
			    status = $5
			WHERE sport_id = $6 AND round_name = $7 AND match_order = $8
		`, rm.homeID, rm.awayID, rm.homeScore, rm.awayScore, statusStr, sportID, rm.roundType, order)

		if statusStr == "FINISHED" && rm.winnerID > 0 {
			_ = cascadeBracketProgressionTx(ctx, tx, sportID, rm.roundType, order, rm.winnerID, rm.loserID)
			if rm.roundType == "FINAL" || rm.roundType == "THIRD_PLACE" {
				_ = awardBracketMedalsTx(ctx, tx, rm.match.EventID, rm.roundType, rm.winnerID, rm.loserID)
			}
		}
	}

	return tx.Commit(ctx)
}
