package handler

import (
	"errors"
	"net/http"

	"porprov-backend/internal/repository"
)

type SportMedalHandler struct {
	repo *repository.SportMedalRepository
}

func NewSportMedalHandler(repo *repository.SportMedalRepository) *SportMedalHandler {
	return &SportMedalHandler{repo: repo}
}

func (h *SportMedalHandler) GetStandings(w http.ResponseWriter, r *http.Request) {
	standings, err := h.repo.GetStandings(r.Context())
	if err != nil {
		if errors.Is(err, repository.ErrDatabaseUnavailable) {
			Error(w, http.StatusServiceUnavailable, "Database is unavailable")
			return
		}
		Error(w, http.StatusInternalServerError, "Failed to fetch medal standings by sport")
		return
	}
	JSON(w, http.StatusOK, standings)
}
