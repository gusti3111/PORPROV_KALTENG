package handler

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"porprov-backend/internal/model"
	"porprov-backend/internal/repository"
)

type BracketHandler struct {
	repo *repository.BracketRepository
}

func NewBracketHandler(repo *repository.BracketRepository) *BracketHandler {
	return &BracketHandler{repo: repo}
}

func (h *BracketHandler) ListBySport(w http.ResponseWriter, r *http.Request) {
	sportID := chi.URLParam(r, "sportId")
	if sportID == "" {
		Error(w, http.StatusBadRequest, "sport_id is required")
		return
	}
	sportIDInt, err := h.parseInt(sportID)
	if err != nil {
		Error(w, http.StatusBadRequest, "sport_id must be a positive integer")
		return
	}

	matches, err := h.repo.GetBySportID(r.Context(), sportIDInt)
	if err != nil {
		if errors.Is(err, repository.ErrDatabaseUnavailable) {
			Error(w, http.StatusServiceUnavailable, "Database is unavailable")
			return
		}
		Error(w, http.StatusInternalServerError, "Failed to fetch bracket: "+err.Error())
		return
	}
	JSON(w, http.StatusOK, map[string]interface{}{
		"sport_id": sportIDInt,
		"matches":  matches,
	})
}

func (h *BracketHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		Error(w, http.StatusBadRequest, "bracket id is required")
		return
	}
	idInt, err := h.parseInt(id)
	if err != nil {
		Error(w, http.StatusBadRequest, "bracket id must be a positive integer")
		return
	}

	match, err := h.repo.GetByID(r.Context(), idInt)
	if err != nil {
		Error(w, http.StatusInternalServerError, "Failed to fetch bracket: "+err.Error())
		return
	}
	if match == nil {
		Error(w, http.StatusNotFound, "bracket match not found")
		return
	}
	JSON(w, http.StatusOK, match)
}

func (h *BracketHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req model.BracketMatch
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.SportID < 1 || req.RoundOrder < 1 || req.MatchOrder < 1 {
		Error(w, http.StatusBadRequest, "sport_id, round_order and match_order must be positive")
		return
	}
	id, err := h.repo.Create(r.Context(), req)
	if err != nil {
		Error(w, http.StatusInternalServerError, "failed to create bracket: "+err.Error())
		return
	}
		JSON(w, http.StatusCreated, map[string]string{"id": h.stringOfInt(id), "message": "bracket match created"})
}

func (h *BracketHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		Error(w, http.StatusBadRequest, "bracket id is required")
		return
	}
	idInt, err := h.parseInt(id)
	if err != nil {
		Error(w, http.StatusBadRequest, "bracket id must be a positive integer")
		return
	}

	var req model.BracketMatch
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.RoundName == "" {
		req.RoundName = "SEMIFINAL"
	}
	err = h.repo.Update(r.Context(), idInt, req)
	if err != nil {
		Error(w, http.StatusInternalServerError, "failed to update bracket: "+err.Error())
		return
	}
	JSON(w, http.StatusOK, map[string]string{"message": "bracket updated successfully"})
}

func (h *BracketHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		Error(w, http.StatusBadRequest, "bracket id is required")
		return
	}
	idInt, err := h.parseInt(id)
	if err != nil {
		Error(w, http.StatusBadRequest, "bracket id must be a positive integer")
		return
	}
	err = h.repo.Delete(r.Context(), idInt)
	if err != nil {
		Error(w, http.StatusInternalServerError, "failed to delete bracket: "+err.Error())
		return
	}
	JSON(w, http.StatusOK, map[string]string{"message": "bracket deleted successfully"})
}

func (h *BracketHandler) parseInt(s string) (int, error) {
	var n int
	_, err := fmt.Sscanf(s, "%d", &n)
	return n, err
}

func (h *BracketHandler) stringOfInt(i int) string {
	return strconv.Itoa(i)
}
