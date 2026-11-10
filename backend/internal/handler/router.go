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
	bracketRepo := repository.NewBracketRepository(db)
	bracketHandler := NewBracketHandler(bracketRepo)

	eventRepo := repository.NewEventRepository(db)
	eventHandler := NewEventHandler(eventRepo)

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

		api.Route("/events", func(er chi.Router) {
			er.Get("/", eventHandler.List)
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
		api.Post("/matches", matchHandler.Create)
		api.Get("/matches/{id}", matchHandler.Get)
		api.Put("/matches/{id}", matchHandler.Update)
		api.Put("/matches/{id}/participants", matchHandler.UpdateParticipants)
		api.Put("/matches/{id}/result", matchHandler.UpdateResult)
		api.Delete("/matches/{id}", matchHandler.Delete)

		api.Route("/brackets", func(br chi.Router) {
			br.Get("/{sportId}", bracketHandler.ListBySport)
			br.Get("/{id}", bracketHandler.Get)
			br.Post("/", bracketHandler.Create)
			br.Put("/{id}", bracketHandler.Update)
			br.Delete("/{id}", bracketHandler.Delete)
		})
	})

	return r
}
