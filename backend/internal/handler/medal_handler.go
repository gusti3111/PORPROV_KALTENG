package handler

import (
	"net/http"

	"porprov-backend/internal/repository"
)

type MedalHandler struct {
	repo *repository.MedalRepository
}

func NewMedalHandler(repo *repository.MedalRepository) *MedalHandler {
	return &MedalHandler{repo: repo}
}

func (h *MedalHandler) GetStandings(w http.ResponseWriter, r *http.Request) {
	standings, err := h.repo.GetStandings(r.Context())
	if err != nil {
		Error(w, http.StatusInternalServerError, "Failed to fetch medal standings")
		return
	}
	JSON(w, http.StatusOK, standings)
}
