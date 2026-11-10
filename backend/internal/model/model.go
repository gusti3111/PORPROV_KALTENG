package model

import "time"

type SportCategory string

const (
	SportCategoryUtama    SportCategory = "Utama"
	SportCategoryEksebisi SportCategory = "Eksebisi"
)

type Sport struct {
	ID          int           `json:"id"`
	Name        string        `json:"name"`
	Code        string        `json:"code"`
	Category    SportCategory `json:"category"`
	Icon        string        `json:"icon"`
	Description string        `json:"description"`
}

type Venue struct {
	ID        int        `json:"id"`
	Name      string     `json:"name"`
	Category  string     `json:"category"`
	Address   string     `json:"address,omitempty"`
	Latitude  float64    `json:"latitude"`
	Longitude float64    `json:"longitude"`
	Note      string     `json:"note,omitempty"`
	Position  [2]float64 `json:"position"`
}

type Contingent struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	ShortCode string `json:"short_code"`
	LogoURL   string `json:"logo_url,omitempty"`
}

type MatchStatus string

const (
	MatchStatusScheduled MatchStatus = "SCHEDULED"
	MatchStatusOngoing   MatchStatus = "ONGOING"
	MatchStatusFinished  MatchStatus = "FINISHED"
	MatchStatusPostponed MatchStatus = "POSTPONED"
	MatchStatusCancelled MatchStatus = "CANCELLED"
)

type MatchParticipant struct {
	ID             int    `json:"id"`
	ContingentID   int    `json:"contingent_id"`
	ContingentName string `json:"contingent_name"`
	AthleteName    string `json:"athlete_name,omitempty"`
	Score          string `json:"score,omitempty"`
	IsWinner       bool   `json:"is_winner"`
}

type ScheduleMatch struct {
	ID            string             `json:"id"`
	SportID       int                `json:"sport_id"`
	EventID       int                `json:"event_id"`
	VenueID       int                `json:"venue_id"`
	SportName     string             `json:"sport_name"`
	EventName     string             `json:"event_name"`
	VenueName     string             `json:"venue_name"`
	Title         string             `json:"title"`
	RoundName     string             `json:"round_name"`
	Date          string             `json:"date"`
	Time          string             `json:"time"`
	StartTime     time.Time          `json:"start_time"`
	Status        MatchStatus        `json:"status"`
	LiveStreamURL string             `json:"live_stream_url,omitempty"`
	Participants  []MatchParticipant `json:"participants"`
	NextMatchID   string             `json:"next_match_id,omitempty"` // Relasi ke pertandingan selanjutnya di bagan
}

type Event struct {
	ID        int    `json:"id"`
	SportID   int    `json:"sport_id"`
	Name      string `json:"name"`
	Gender    string `json:"gender"`
	CreatedAt time.Time `json:"created_at,omitempty"`
}

type MedalStanding struct {
	ContingentID   int    `json:"contingent_id"`
	ContingentName string `json:"contingent_name"`
	ShortCode      string `json:"short_code"`
	LogoURL        string `json:"logo_url,omitempty"`
	Gold           int    `json:"gold"`
	Silver         int    `json:"silver"`
	Bronze         int    `json:"bronze"`
	Total          int    `json:"total"`
	Rank           int    `json:"rank"`
}

type SportMedalStanding struct {
	SportID int    `json:"sport_id"`
	Sport   string `json:"sport"`
	Gold    int    `json:"gold"`
	Silver  int    `json:"silver"`
	Bronze  int    `json:"bronze"`
	Total   int    `json:"total"`
	Rank    int    `json:"rank"`
}

type SportTournament struct {
	SportID       int                    `json:"sport_id"`
	SportName     string                 `json:"sport_name"`
	Groups        []SportTournamentGroup `json:"groups"`
	Quarterfinals []SportTournamentMatch `json:"quarterfinals"`
	Semifinals    []SportTournamentMatch `json:"semifinals"`
	Final         SportTournamentMatch   `json:"final"`
	Bronze        SportTournamentMatch   `json:"bronze"`
}

type SportTournamentGroup struct {
	Code      string                    `json:"code"`
	Name      string                    `json:"name"`
	Standings []SportTournamentStanding `json:"standings"`
}

type SportTournamentStanding struct {
	Rank         int    `json:"rank"`
	ContingentID int    `json:"contingent_id"`
	Contingent   string `json:"contingent"`
	Played       int    `json:"played"`
	Won          int    `json:"won"`
	Drawn        int    `json:"drawn"`
	Lost         int    `json:"lost"`
	Points       int    `json:"points"`
}

type SportTournamentMatch struct {
	Label     string `json:"label"`
	Home      string `json:"home"`
	Away      string `json:"away"`
	HomeScore *int   `json:"home_score"`
	AwayScore *int   `json:"away_score"`
	Status    string `json:"status"`
}
