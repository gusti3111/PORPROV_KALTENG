package repository

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"porprov-backend/internal/database"
)

var (
	ErrEmailExists  = errors.New("email sudah terdaftar")
	ErrUserNotFound = errors.New("akun tidak ditemukan")
)

type AdminUser struct {
	ID           int       `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Role         string    `json:"role"`
	CreatedAt    time.Time `json:"created_at"`
}

type AuthRepository struct {
	db *database.DB
}

func NewAuthRepository(db *database.DB) *AuthRepository {
	return &AuthRepository{db: db}
}

func (r *AuthRepository) EnsureSchema(ctx context.Context) error {
	if r.db == nil || r.db.Pool == nil {
		return nil
	}
	_, err := r.db.Pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS admin_users (
			id SERIAL PRIMARY KEY,
			name TEXT NOT NULL,
			email TEXT NOT NULL UNIQUE,
			password_hash TEXT NOT NULL,
			role TEXT NOT NULL DEFAULT 'Panitia',
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);
	`)
	return err
}

func (r *AuthRepository) CreateAdmin(ctx context.Context, name, email, passwordHash, role string) (*AdminUser, error) {
	if r.db == nil || r.db.Pool == nil {
		return nil, errors.New("database not connected")
	}

	var u AdminUser
	err := r.db.Pool.QueryRow(ctx, `
		INSERT INTO admin_users (name, email, password_hash, role)
		VALUES ($1, $2, $3, $4)
		RETURNING id, name, email, password_hash, role, created_at
	`, strings.TrimSpace(name), strings.ToLower(strings.TrimSpace(email)), passwordHash, strings.TrimSpace(role)).
		Scan(&u.ID, &u.Name, &u.Email, &u.PasswordHash, &u.Role, &u.CreatedAt)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, ErrEmailExists
		}
		return nil, err
	}
	return &u, nil
}

func (r *AuthRepository) FindByEmail(ctx context.Context, email string) (*AdminUser, error) {
	if r.db == nil || r.db.Pool == nil {
		return nil, errors.New("database not connected")
	}

	var u AdminUser
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, name, email, password_hash, role, created_at
		FROM admin_users
		WHERE email = $1
	`, strings.ToLower(strings.TrimSpace(email))).
		Scan(&u.ID, &u.Name, &u.Email, &u.PasswordHash, &u.Role, &u.CreatedAt)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return &u, nil
}

