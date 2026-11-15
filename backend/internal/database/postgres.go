package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type DB struct {
	Pool *pgxpool.Pool
}

func Connect(ctx context.Context, dsn string) (*DB, error) {
	config, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return nil, fmt.Errorf("invalid postgres connection string: %w", err)
	}

	config.MaxConns = 25
	config.MinConns = 2
	config.MaxConnLifetime = 1 * time.Hour
	config.MaxConnIdleTime = 30 * time.Minute

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, fmt.Errorf("unable to create connection pool: %w", err)
	}

	pingCtx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	if err := pool.Ping(pingCtx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("connect to PostgreSQL: %w", err)
	}
	schemaFixes := []string{
		`ALTER TABLE IF EXISTS sport_group_standings DROP CONSTRAINT IF EXISTS sport_group_standings_group_id_rank_key`,
		`ALTER TABLE IF EXISTS sport_group_standings ALTER COLUMN lost TYPE INT, ALTER COLUMN points TYPE INT`,
		`ALTER TABLE IF EXISTS sport_bracket_matches DROP CONSTRAINT IF EXISTS sport_bracket_matches_round_name_check`,
		`ALTER TABLE IF EXISTS sport_bracket_matches ADD CONSTRAINT sport_bracket_matches_round_name_check CHECK (round_name IN ('QUARTERFINAL', 'SEMIFINAL', 'FINAL', 'THIRD_PLACE'))`,
		`ALTER TABLE IF EXISTS sport_bracket_matches DROP CONSTRAINT IF EXISTS sport_bracket_matches_status_check`,
		`ALTER TABLE IF EXISTS sport_bracket_matches ADD CONSTRAINT sport_bracket_matches_status_check CHECK (status IN ('SCHEDULED', 'ONGOING', 'FINISHED'))`,
	}
	for _, stmt := range schemaFixes {
		if _, err := pool.Exec(pingCtx, stmt); err != nil {
			log.Printf("[database] schema compatibility warning (%s): %v", stmt, err)
		}
	}
	log.Printf("[database] PostgreSQL connection established successfully")

	return &DB{Pool: pool}, nil
}

func (db *DB) Close() {
	if db != nil && db.Pool != nil {
		db.Pool.Close()
	}
}

func (db *DB) Ping(ctx context.Context) error {
	if db == nil || db.Pool == nil {
		return fmt.Errorf("database pool is not initialized")
	}
	return db.Pool.Ping(ctx)
}
