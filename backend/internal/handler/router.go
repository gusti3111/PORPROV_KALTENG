package handler

import (
	"context"
	"net/http"
	"time"

	"porprov-backend/internal/config"
	"porprov-backend/internal/database"
	"porprov-backend/internal/repository"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func NewRouter(cfg *config.Config, db *database.DB) http.Handler {
	r := chi.NewRouter()

	// Middlewares
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))
	r.Use(securityHeadersMiddleware)

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
	eventRepo := repository.NewEventRepository(db)
	bracketRepo := repository.NewBracketRepository(db)
	authRepo := repository.NewAuthRepository(db)

	if db != nil && db.Pool != nil {
		cleanupCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		_ = matchRepo.PurgeDummySeedDataAndSyncAll(cleanupCtx)
		_ = authRepo.EnsureSchema(cleanupCtx)
		cancel()
	}

	// Handlers
	healthHandler := NewHealthHandler(db)
	sportHandler := NewSportHandler(sportRepo)
	venueHandler := NewVenueHandler(venueRepo)
	contingentHandler := NewContingentHandler(contingentRepo)
	medalHandler := NewMedalHandler(medalRepo)
	matchHandler := NewMatchHandler(matchRepo, eventRepo)
	sportMedalHandler := NewSportMedalHandler(sportMedalRepo)
	sportTournamentHandler := NewSportTournamentHandler(sportTournamentRepo)
	bracketHandler := NewBracketHandler(bracketRepo)
	eventHandler := NewEventHandler(eventRepo)
	authHandler := NewAuthHandler(authRepo)

	// Base health check
	r.Get("/healthz", healthHandler.Health)

	// API v1 group
	r.Route("/api/v1", func(api chi.Router) {
		api.Get("/healthz", healthHandler.Health)

		api.Route("/sports", func(sr chi.Router) {
			sr.Get("/", sportHandler.GetAll)
			sr.Get("/{id}/tournament", sportTournamentHandler.GetBySportID)
			sr.With(authHandler.RequireAdmin).Put("/{id}/standings", sportTournamentHandler.UpsertStanding)
			sr.With(authHandler.RequireAdmin).Delete("/{id}/standings", sportTournamentHandler.DeleteStanding)
			sr.With(authHandler.RequireAdmin).Post("/{id}/promote-groups", sportTournamentHandler.PromoteGroups)
			sr.Get("/{id}", sportHandler.GetByID)
		})

		api.Route("/events", func(er chi.Router) {
			er.Get("/", eventHandler.List)
			er.With(authHandler.RequireAdmin).Post("/", eventHandler.Create)
		})
		api.Get("/events", eventHandler.List)
		api.With(authHandler.RequireAdmin).Post("/events", eventHandler.Create)

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
		api.With(authHandler.RequireAdmin).Post("/matches", matchHandler.Create)
		api.Get("/matches/{id}", matchHandler.Get)
		api.With(authHandler.RequireAdmin).Put("/matches/{id}", matchHandler.Update)
		api.With(authHandler.RequireAdmin).Put("/matches/{id}/participants", matchHandler.UpdateParticipants)
		api.With(authHandler.RequireAdmin).Put("/matches/{id}/result", matchHandler.UpdateResult)
		api.With(authHandler.RequireAdmin).Delete("/matches/{id}", matchHandler.Delete)

		api.Route("/brackets", func(br chi.Router) {
			br.Get("/{sportId}", bracketHandler.ListBySport)
			br.Get("/match/{id}", bracketHandler.Get)
			br.With(authHandler.RequireAdmin).Post("/", bracketHandler.Create)
			br.With(authHandler.RequireAdmin).Put("/{id}", bracketHandler.Update)
			br.With(authHandler.RequireAdmin).Delete("/{id}", bracketHandler.Delete)
		})

		api.Route("/auth", func(ar chi.Router) {
			ar.Post("/register", authHandler.Register)
			ar.Post("/login", authHandler.Login)
			ar.Get("/me", authHandler.Me)
		})
	})

	return r
}

func securityHeadersMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		next.ServeHTTP(w, r)
	})
}
