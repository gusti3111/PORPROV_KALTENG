package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"porprov-backend/internal/config"
	"porprov-backend/internal/database"
	"porprov-backend/internal/handler"
)

func main() {
	cfg := config.Load()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	log.Printf("[server] Starting PORPROV XIII Kalteng Backend API (env: %s)", cfg.Environment)

	// Connect to Database
	db, err := database.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Printf("[server] Warning: Database connection failed: %v", err)
	}
	defer db.Close()

	router := handler.NewRouter(cfg, db)

	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Server run context for graceful shutdown
	serverErrors := make(chan error, 1)

	go func() {
		log.Printf("[server] HTTP listening on port %s", cfg.Port)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			serverErrors <- err
		}
	}()

	// Listen for shutdown signals
	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, os.Interrupt, syscall.SIGTERM)

	select {
	case err := <-serverErrors:
		log.Fatalf("[server] Fatal error starting server: %v", err)

	case sig := <-shutdown:
		log.Printf("[server] Shutdown signal received: %v. Initiating graceful shutdown...", sig)

		shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer shutdownCancel()

		if err := server.Shutdown(shutdownCtx); err != nil {
			log.Printf("[server] Forced shutdown due to error: %v", err)
			_ = server.Close()
		}

		log.Printf("[server] Graceful shutdown complete")
	}
}
