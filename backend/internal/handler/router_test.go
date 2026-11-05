package handler_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"porprov-backend/internal/config"
	"porprov-backend/internal/handler"
	"porprov-backend/internal/model"
)

func TestHealthCheck(t *testing.T) {
	cfg := &config.Config{
		Port:           "8080",
		AllowedOrigins: []string{"*"},
		Environment:    "test",
	}

	router := handler.NewRouter(cfg, nil)

	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	rr := httptest.NewRecorder()

	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rr.Code)
	}

	var resp handler.APIResponse
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if !resp.Success {
		t.Errorf("expected success to be true, got %v", resp.Success)
	}
}

func TestGetSports(t *testing.T) {
	cfg := &config.Config{
		Port:           "8080",
		AllowedOrigins: []string{"*"},
		Environment:    "test",
	}

	router := handler.NewRouter(cfg, nil)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/sports", nil)
	rr := httptest.NewRecorder()

	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rr.Code)
	}

	var resp struct {
		Success bool          `json:"success"`
		Data    []model.Sport `json:"data"`
	}
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if !resp.Success {
		t.Errorf("expected success to be true")
	}

	if len(resp.Data) == 0 {
		t.Errorf("expected sports list to have items, got 0")
	}
}
