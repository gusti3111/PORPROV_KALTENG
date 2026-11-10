package handler

import (
	"encoding/json"
	"net/http"
	"strings"

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

func (h *EventHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req struct {
		SportID int    `json:"sport_id"`
		Name    string `json:"name"`
		Gender  string `json:"gender"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.SportID < 1 || strings.TrimSpace(req.Name) == "" {
		Error(w, http.StatusBadRequest, "sport_id and name are required")
		return
	}
	ev, err := h.repo.FindOrCreate(r.Context(), req.SportID, req.Name, req.Gender)
	if err != nil {
		Error(w, http.StatusInternalServerError, "Failed to create event: "+err.Error())
		return
	}
	JSON(w, http.StatusCreated, ev)
}
