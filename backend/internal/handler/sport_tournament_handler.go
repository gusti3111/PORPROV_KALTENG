package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"porprov-backend/internal/repository"
)

type SportTournamentHandler struct {
	repo *repository.SportTournamentRepository
}

func NewSportTournamentHandler(repo *repository.SportTournamentRepository) *SportTournamentHandler {
	return &SportTournamentHandler{repo: repo}
}

func (h *SportTournamentHandler) GetBySportID(w http.ResponseWriter, r *http.Request) {
	sportID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || sportID < 1 {
		Error(w, http.StatusBadRequest, "Sport ID must be a positive integer")
		return
	}

	tournament, err := h.repo.GetBySportID(r.Context(), sportID)
	if err != nil {
		if errors.Is(err, repository.ErrDatabaseUnavailable) {
			Error(w, http.StatusServiceUnavailable, "Database is unavailable")
			return
		}
		Error(w, http.StatusInternalServerError, "Failed to fetch sport tournament")
		return
	}
	if tournament == nil {
		Error(w, http.StatusNotFound, "Tournament data not found for this sport")
		return
	}

	JSON(w, http.StatusOK, tournament)
}
