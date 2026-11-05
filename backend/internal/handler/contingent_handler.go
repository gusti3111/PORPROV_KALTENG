package handler

import (
	"net/http"

	"porprov-backend/internal/repository"
)

type ContingentHandler struct {
	repo *repository.ContingentRepository
}

func NewContingentHandler(repo *repository.ContingentRepository) *ContingentHandler {
	return &ContingentHandler{repo: repo}
}

func (h *ContingentHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	contingents, err := h.repo.GetAll(r.Context())
	if err != nil {
		Error(w, http.StatusInternalServerError, "Failed to fetch contingents")
		return
	}
	JSON(w, http.StatusOK, contingents)
}
