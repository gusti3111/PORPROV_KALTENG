package handler

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"porprov-backend/internal/config"
	"porprov-backend/internal/database"
	"porprov-backend/internal/repository"
)

func NewRouter(cfg *config.Config, db *database.DB) http.Handler {
	r := chi.NewRouter()

	// Middlewares
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))

	// CORS configuration
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.AllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Repositories
	sportRepo := repository.NewSportRepository(db)
	venueRepo := repository.NewVenueRepository(db)
	contingentRepo := repository.NewContingentRepository(db)
	medalRepo := repository.NewMedalRepository(db)
	matchRepo := repository.NewMatchRepository(db)
	sportMedalRepo := repository.NewSportMedalRepository(db)
	sportTournamentRepo := repository.NewSportTournamentRepository(db)

	// Handlers
	healthHandler := NewHealthHandler(db)
	sportHandler := NewSportHandler(sportRepo)
	venueHandler := NewVenueHandler(venueRepo)
	contingentHandler := NewContingentHandler(contingentRepo)
	medalHandler := NewMedalHandler(medalRepo)
	matchHandler := NewMatchHandler(matchRepo)
	sportMedalHandler := NewSportMedalHandler(sportMedalRepo)
	sportTournamentHandler := NewSportTournamentHandler(sportTournamentRepo)

	// Base health check
	r.Get("/healthz", healthHandler.Health)

	// API v1 group
	r.Route("/api/v1", func(api chi.Router) {
		api.Get("/healthz", healthHandler.Health)

		api.Route("/sports", func(sr chi.Router) {
			sr.Get("/", sportHandler.GetAll)
			sr.Get("/{id}/tournament", sportTournamentHandler.GetBySportID)
			sr.Get("/{id}", sportHandler.GetByID)
		})

		api.Route("/venues", func(vr chi.Router) {
			vr.Get("/", venueHandler.GetAll)
		})

		api.Route("/contingents", func(cr chi.Router) {
			cr.Get("/", contingentHandler.GetAll)
		})

		api.Route("/medals", func(mr chi.Router) {
			mr.Get("/standings", medalHandler.GetStandings)
			mr.Get("/by-sport", sportMedalHandler.GetStandings)
		})

		api.Get("/matches", matchHandler.List)
	})

	return r
}
