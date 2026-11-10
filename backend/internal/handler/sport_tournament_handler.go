package handler

import (
	"encoding/json"
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

func (h *SportTournamentHandler) UpsertStanding(w http.ResponseWriter, r *http.Request) {
	sportID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || sportID < 1 {
		Error(w, http.StatusBadRequest, "Sport ID must be a positive integer")
		return
	}

	var req struct {
		GroupCode    string `json:"group_code"`
		ContingentID int    `json:"contingent_id"`
		Won          int    `json:"won"`
		Drawn        int    `json:"drawn"`
		Lost         int    `json:"lost"`
		Points       int    `json:"points"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.ContingentID < 1 {
		Error(w, http.StatusBadRequest, "contingent_id is required")
		return
	}

	if err := h.repo.UpsertGroupStanding(
		r.Context(),
		sportID,
		req.GroupCode,
		req.ContingentID,
		req.Won,
		req.Drawn,
		req.Lost,
		req.Points,
	); err != nil {
		Error(w, http.StatusInternalServerError, "Failed to update group standing: "+err.Error())
		return
	}

	JSON(w, http.StatusOK, map[string]string{"message": "group standing updated successfully"})
}

func (h *SportTournamentHandler) DeleteStanding(w http.ResponseWriter, r *http.Request) {
	sportID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || sportID < 1 {
		Error(w, http.StatusBadRequest, "Sport ID must be a positive integer")
		return
	}
	groupCode := r.URL.Query().Get("group_code")
	contingentID, err := strconv.Atoi(r.URL.Query().Get("contingent_id"))
	if err != nil || contingentID < 1 {
		Error(w, http.StatusBadRequest, "contingent_id is required")
		return
	}

	if err := h.repo.DeleteGroupStanding(r.Context(), sportID, groupCode, contingentID); err != nil {
		Error(w, http.StatusInternalServerError, "Failed to delete group standing: "+err.Error())
		return
	}
	JSON(w, http.StatusOK, map[string]string{"message": "group standing deleted successfully"})
}

func (h *SportTournamentHandler) PromoteGroups(w http.ResponseWriter, r *http.Request) {
	sportID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || sportID < 1 {
		Error(w, http.StatusBadRequest, "Sport ID must be a positive integer")
		return
	}

	if err := h.repo.PromoteGroupWinners(r.Context(), sportID); err != nil {
		Error(w, http.StatusInternalServerError, "Failed to promote group winners: "+err.Error())
		return
	}
	JSON(w, http.StatusOK, map[string]string{"message": "group winners promoted to bracket successfully"})
}
