package handler

import (
	"net/http"

	"porprov-backend/internal/repository"
)

type EventHandler struct {
	repo *repository.EventRepository
}

func NewEventHandler(repo *repository.EventRepository) *EventHandler {
	return &EventHandler{repo: repo}
}

func (h *EventHandler) List(w http.ResponseWriter, r *http.Request) {
	events, err := h.repo.GetAll(r.Context())
	if err != nil {
		Error(w, http.StatusInternalServerError, "Failed to fetch events")
		return
	}
	JSON(w, http.StatusOK, events)
}
