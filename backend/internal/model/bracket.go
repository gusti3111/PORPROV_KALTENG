package model

// BracketMatch represents a single row in the sport_bracket_matches table.
type BracketMatch struct {
	ID          int    `json:"id"`
	SportID     int    `json:"sport_id"`
	RoundName   string `json:"round_name"`
	RoundOrder  int    `json:"round_order"`
	MatchOrder  int    `json:"match_order"`
	Label       string `json:"label"`
	HomeID      int    `json:"home_id"`
	AwayID      int    `json:"away_id"`
	HomeName    string `json:"home_name"`
	AwayName    string `json:"away_name"`
	HomeScore   *int   `json:"home_score"`
	AwayScore   *int   `json:"away_score"`
	Status      string `json:"status"`
}

// BracketList is returned when listing bracket matches for a sport.
type BracketList struct {
	Matches []BracketMatch `json:"matches"`
}
