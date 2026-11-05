package handler

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"porprov-backend/internal/repository"
)

type SportHandler struct {
	repo *repository.SportRepository
}

func NewSportHandler(repo *repository.SportRepository) *SportHandler {
	return &SportHandler{repo: repo}
}

func (h *SportHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	sports, err := h.repo.GetAll(r.Context())
	if err != nil {
		Error(w, http.StatusInternalServerError, "Failed to fetch sports")
		return
	}
	JSON(w, http.StatusOK, sports)
}

func (h *SportHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		Error(w, http.StatusBadRequest, "Invalid sport ID")
		return
	}

	sport, err := h.repo.GetByID(r.Context(), id)
	if err != nil {
		Error(w, http.StatusInternalServerError, "Failed to fetch sport")
		return
	}
	if sport == nil {
		Error(w, http.StatusNotFound, "Sport not found")
		return
	}

	JSON(w, http.StatusOK, sport)
}
