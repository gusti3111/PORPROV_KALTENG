package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"

	"porprov-backend/internal/model"
	"porprov-backend/internal/repository"
)

type MatchHandler struct {
	repo      *repository.MatchRepository
	eventRepo *repository.EventRepository
}

func NewMatchHandler(repo *repository.MatchRepository, eventRepo ...*repository.EventRepository) *MatchHandler {
	var er *repository.EventRepository
	if len(eventRepo) > 0 {
		er = eventRepo[0]
	}
	return &MatchHandler{repo: repo, eventRepo: er}
}

func (h *MatchHandler) List(w http.ResponseWriter, r *http.Request) {
	filters, err := parseMatchFilters(r)
	if err != nil {
		Error(w, http.StatusBadRequest, err.Error())
		return
	}

	matches, err := h.repo.List(r.Context(), filters)
	if err != nil {
		if errors.Is(err, repository.ErrDatabaseUnavailable) {
			Error(w, http.StatusServiceUnavailable, "Database is unavailable")
			return
		}
		Error(w, http.StatusInternalServerError, "Failed to fetch matches")
		return
	}
	JSON(w, http.StatusOK, matches)
}

func (h *MatchHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req struct {
		SportID            int               `json:"sport_id"`
		EventID            int               `json:"event_id"`
		EventName          string            `json:"event_name"`
		EventGender        string            `json:"event_gender"`
		VenueID            int               `json:"venue_id"`
		Title              string            `json:"title"`
		RoundName          string            `json:"round_name"`
		StartTime          time.Time         `json:"start_time"`
		EndTime            time.Time         `json:"end_time"`
		Status             model.MatchStatus `json:"status"`
		ContingentIDs      []int             `json:"contingent_ids"`
		Scores             []string          `json:"scores"`
		WinnerContingentID int               `json:"winner_contingent_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.EventID < 1 && req.SportID > 0 && strings.TrimSpace(req.EventName) != "" && h.eventRepo != nil {
		ev, err := h.eventRepo.FindOrCreate(r.Context(), req.SportID, req.EventName, req.EventGender)
		if err != nil {
			Error(w, http.StatusInternalServerError, "failed to create event: "+err.Error())
			return
		}
		req.EventID = ev.ID
	}
	if req.EventID < 1 || req.VenueID < 1 {
		Error(w, http.StatusBadRequest, "event_id and venue_id must be positive")
		return
	}
	if req.StartTime.IsZero() {
		Error(w, http.StatusBadRequest, "start_time is required")
		return
	}
	if req.EndTime.IsZero() {
		req.EndTime = req.StartTime.Add(90 * time.Minute)
	}
	id, err := h.repo.CreateMatch(
		r.Context(),
		req.EventID,
		req.VenueID,
		req.Title,
		req.RoundName,
		req.StartTime,
		req.EndTime,
		req.Status,
		req.ContingentIDs,
		req.Scores,
		req.WinnerContingentID,
	)
	if err != nil {
		Error(w, http.StatusInternalServerError, "failed to create match: "+err.Error())
		return
	}
	JSON(w, http.StatusCreated, map[string]string{"id": id, "message": "match created successfully"})
}

func (h *MatchHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		Error(w, http.StatusBadRequest, "match id is required")
		return
	}
	match, err := h.repo.GetMatch(r.Context(), id)
	if err != nil {
		Error(w, http.StatusInternalServerError, "failed to fetch match: "+err.Error())
		return
	}
	if match == nil {
		Error(w, http.StatusNotFound, "match not found")
		return
	}
	JSON(w, http.StatusOK, match)
}

func (h *MatchHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		Error(w, http.StatusBadRequest, "match id is required")
		return
	}
	var req struct {
		SportID       int               `json:"sport_id"`
		EventID       int               `json:"event_id"`
		EventName     string            `json:"event_name"`
		EventGender   string            `json:"event_gender"`
		VenueID       int               `json:"venue_id"`
		Title         string            `json:"title"`
		RoundName     string            `json:"round_name"`
		StartTime     time.Time         `json:"start_time"`
		EndTime       time.Time         `json:"end_time"`
		Status        model.MatchStatus `json:"status"`
		ContingentIDs []int             `json:"contingent_ids"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.EventID < 1 && req.SportID > 0 && strings.TrimSpace(req.EventName) != "" && h.eventRepo != nil {
		ev, err := h.eventRepo.FindOrCreate(r.Context(), req.SportID, req.EventName, req.EventGender)
		if err == nil {
			req.EventID = ev.ID
		}
	}
	if req.StartTime.IsZero() {
		Error(w, http.StatusBadRequest, "start_time is required")
		return
	}
	if req.EndTime.IsZero() {
		req.EndTime = req.StartTime.Add(90 * time.Minute)
	}
	err := h.repo.UpdateMatchFields(r.Context(), id, req.EventID, req.VenueID, req.Title, req.RoundName, req.StartTime, req.EndTime, req.Status)
	if err != nil {
		Error(w, http.StatusInternalServerError, "failed to update match: "+err.Error())
		return
	}
	if len(req.ContingentIDs) == 2 && req.ContingentIDs[0] > 0 && req.ContingentIDs[1] > 0 && req.ContingentIDs[0] != req.ContingentIDs[1] {
		_ = h.repo.UpdateMatchParticipants(r.Context(), id, req.ContingentIDs)
	}
	JSON(w, http.StatusOK, map[string]string{"message": "match updated successfully"})
}

func (h *MatchHandler) UpdateResult(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		Error(w, http.StatusBadRequest, "match id is required")
		return
	}
	var req struct {
		Status             model.MatchStatus `json:"status"`
		Scores             []string          `json:"scores"`
		WinnerContingentID int               `json:"winner_contingent_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	err := h.repo.UpdateMatchWithWinner(r.Context(), id, req.Status, req.Scores, req.WinnerContingentID)
	if err != nil {
		Error(w, http.StatusInternalServerError, "failed to update result: "+err.Error())
		return
	}
	JSON(w, http.StatusOK, map[string]string{"message": "match result updated successfully"})
}

func (h *MatchHandler) UpdateParticipants(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		Error(w, http.StatusBadRequest, "match id is required")
		return
	}

	var req struct {
		ContingentIDs []int `json:"contingent_ids"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.repo.UpdateMatchParticipants(r.Context(), id, req.ContingentIDs); err != nil {
		switch {
		case errors.Is(err, repository.ErrInvalidContingents):
			Error(w, http.StatusBadRequest, err.Error())
		case errors.Is(err, repository.ErrMatchNotFound):
			Error(w, http.StatusNotFound, err.Error())
		case errors.Is(err, repository.ErrDatabaseUnavailable):
			Error(w, http.StatusServiceUnavailable, "Database is unavailable")
		default:
			Error(w, http.StatusInternalServerError, "failed to update match participants")
		}
		return
	}

	JSON(w, http.StatusOK, map[string]string{"message": "match participants updated successfully"})
}

func (h *MatchHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		Error(w, http.StatusBadRequest, "match id is required")
		return
	}
	err := h.repo.DeleteMatch(r.Context(), id)
	if err != nil {
		Error(w, http.StatusInternalServerError, "failed to delete match: "+err.Error())
		return
	}
	JSON(w, http.StatusOK, map[string]string{"message": "match deleted successfully"})
}

func parseMatchFilters(r *http.Request) (repository.MatchFilters, error) {
	query := r.URL.Query()
	var filters repository.MatchFilters

	if value := query.Get("date"); value != "" {
		date, err := time.Parse("2006-01-02", value)
		if err != nil {
			return filters, errors.New("date must use YYYY-MM-DD format")
		}
		filters.Date = &date
	}

	for _, filter := range []struct {
		name string
		dest **int
	}{
		{name: "sport_id", dest: &filters.SportID},
		{name: "venue_id", dest: &filters.VenueID},
	} {
		value := query.Get(filter.name)
		if value == "" {
			continue
		}
		id, err := strconv.Atoi(value)
		if err != nil || id < 1 {
			return filters, errors.New(filter.name + " must be a positive integer")
		}
		*filter.dest = &id
	}

	if value := query.Get("status"); value != "" {
		status := model.MatchStatus(value)
		switch status {
		case model.MatchStatusScheduled,
			model.MatchStatusOngoing,
			model.MatchStatusFinished,
			model.MatchStatusPostponed,
			model.MatchStatusCancelled:
			filters.Status = &status
		default:
			return filters, errors.New("status must be one of SCHEDULED, ONGOING, FINISHED, POSTPONED, or CANCELLED")
		}
	}

	return filters, nil
}
