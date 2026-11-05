package handler

import (
	"context"
	"net/http"
	"time"

	"porprov-backend/internal/database"
)

type HealthHandler struct {
	db *database.DB
}

func NewHealthHandler(db *database.DB) *HealthHandler {
	return &HealthHandler{db: db}
}

func (h *HealthHandler) Health(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()

	dbStatus := "healthy"
	if err := h.db.Ping(ctx); err != nil {
		dbStatus = "unreachable"
	}

	JSON(w, http.StatusOK, map[string]any{
		"status":   "ok",
		"service":  "porprov-kalteng-api",
		"database": dbStatus,
		"time":     time.Now().UTC(),
	})
}
