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

func TestListMatchesRejectsInvalidFilters(t *testing.T) {
	cfg := &config.Config{
		Port:           "8080",
		AllowedOrigins: []string{"*"},
		Environment:    "test",
	}
	router := handler.NewRouter(cfg, nil)

	tests := []struct {
		name string
		path string
	}{
		{name: "invalid date", path: "/api/v1/matches?date=28-11-2026"},
		{name: "invalid sport id", path: "/api/v1/matches?sport_id=zero"},
		{name: "invalid venue id", path: "/api/v1/matches?venue_id=0"},
		{name: "invalid status", path: "/api/v1/matches?status=LIVE"},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, test.path, nil)
			rr := httptest.NewRecorder()
			router.ServeHTTP(rr, req)

			if rr.Code != http.StatusBadRequest {
				t.Fatalf("expected status 400, got %d: %s", rr.Code, rr.Body.String())
			}
		})
	}
}

func TestListMatchesRequiresDatabase(t *testing.T) {
	cfg := &config.Config{
		Port:           "8080",
		AllowedOrigins: []string{"*"},
		Environment:    "test",
	}
	router := handler.NewRouter(cfg, nil)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/matches?date=2026-11-28&status=FINISHED", nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected status 503, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestSportMedalStandingsRequiresDatabase(t *testing.T) {
	cfg := &config.Config{
		Port:           "8080",
		AllowedOrigins: []string{"*"},
		Environment:    "test",
	}
	router := handler.NewRouter(cfg, nil)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/medals/by-sport", nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected status 503, got %d: %s", rr.Code, rr.Body.String())
	}
}
