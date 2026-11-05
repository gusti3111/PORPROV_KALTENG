package handler

import (
	"net/http"

	"porprov-backend/internal/repository"
)

type VenueHandler struct {
	repo *repository.VenueRepository
}

func NewVenueHandler(repo *repository.VenueRepository) *VenueHandler {
	return &VenueHandler{repo: repo}
}

func (h *VenueHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	venues, err := h.repo.GetAll(r.Context())
	if err != nil {
		Error(w, http.StatusInternalServerError, "Failed to fetch venues")
		return
	}
	JSON(w, http.StatusOK, venues)
}
