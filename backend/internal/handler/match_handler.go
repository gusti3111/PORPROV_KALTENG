package handler

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"porprov-backend/internal/model"
	"porprov-backend/internal/repository"
)

type MatchHandler struct {
	repo *repository.MatchRepository
}

func NewMatchHandler(repo *repository.MatchRepository) *MatchHandler {
	return &MatchHandler{repo: repo}
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
