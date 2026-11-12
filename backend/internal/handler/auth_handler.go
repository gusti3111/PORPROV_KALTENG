package handler

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"strings"
	"time"

	"porprov-backend/internal/repository"
)

type AuthHandler struct {
	repo   *repository.AuthRepository
	secret []byte
}

func NewAuthHandler(repo *repository.AuthRepository) *AuthHandler {
	secret := strings.TrimSpace(os.Getenv("JWT_SECRET"))
	if secret == "" {
		secret = "porprov-kalteng-2026-admin-secret"
	}
	return &AuthHandler{
		repo:   repo,
		secret: []byte(secret),
	}
}

type registerRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type authResponse struct {
	Token string                `json:"token"`
	User  *repository.AdminUser `json:"user"`
}

type tokenClaims struct {
	UserID int    `json:"sub"`
	Name   string `json:"name"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	Exp    int64  `json:"exp"`
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		Error(w, http.StatusBadRequest, "Format JSON tidak valid")
		return
	}

	name := strings.TrimSpace(req.Name)
	email := strings.ToLower(strings.TrimSpace(req.Email))
	password := req.Password

	if name == "" || email == "" || password == "" {
		Error(w, http.StatusBadRequest, "Nama, email, dan password wajib diisi")
		return
	}
	if !strings.Contains(email, "@") {
		Error(w, http.StatusBadRequest, "Format email tidak valid")
		return
	}
	if len(password) < 6 {
		Error(w, http.StatusBadRequest, "Password minimal 6 karakter")
		return
	}

	passwordHash, err := hashPassword(password)
	if err != nil {
		Error(w, http.StatusInternalServerError, "Gagal memproses password")
		return
	}

	user, err := h.repo.CreateAdmin(r.Context(), name, email, passwordHash, "admin")
	if err != nil {
		if errors.Is(err, repository.ErrEmailExists) {
			Error(w, http.StatusConflict, "Email sudah terdaftar")
			return
		}
		Error(w, http.StatusInternalServerError, "Gagal mendaftarkan akun admin")
		return
	}

	token, err := signToken(user, h.secret)
	if err != nil {
		Error(w, http.StatusInternalServerError, "Gagal membuat token autentikasi")
		return
	}

	JSON(w, http.StatusCreated, authResponse{
		Token: token,
		User:  user,
	})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		Error(w, http.StatusBadRequest, "Format JSON tidak valid")
		return
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))
	password := req.Password

	if email == "" || password == "" {
		Error(w, http.StatusBadRequest, "Email dan password wajib diisi")
		return
	}

	user, err := h.repo.FindByEmail(r.Context(), email)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			Error(w, http.StatusUnauthorized, "Email atau password salah")
			return
		}
		Error(w, http.StatusInternalServerError, "Gagal memverifikasi akun")
		return
	}

	if !verifyPassword(password, user.PasswordHash) {
		Error(w, http.StatusUnauthorized, "Email atau password salah")
		return
	}

	token, err := signToken(user, h.secret)
	if err != nil {
		Error(w, http.StatusInternalServerError, "Gagal membuat token autentikasi")
		return
	}

	JSON(w, http.StatusOK, authResponse{
		Token: token,
		User:  user,
	})
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	authHeader := strings.TrimSpace(r.Header.Get("Authorization"))
	if !strings.HasPrefix(authHeader, "Bearer ") {
		Error(w, http.StatusUnauthorized, "Token autentikasi tidak ditemukan")
		return
	}

	tokenStr := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))
	claims, err := parseToken(tokenStr, h.secret)
	if err != nil {
		Error(w, http.StatusUnauthorized, "Sesi login tidak valid atau sudah kedaluwarsa")
		return
	}

	user, err := h.repo.FindByEmail(r.Context(), claims.Email)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			Error(w, http.StatusUnauthorized, "Akun admin tidak ditemukan")
			return
		}
		Error(w, http.StatusInternalServerError, "Gagal memuat profil admin")
		return
	}

	JSON(w, http.StatusOK, map[string]any{
		"user": user,
	})
}

func hashPassword(password string) (string, error) {
	salt := make([]byte, 16)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}
	saltHex := hex.EncodeToString(salt)
	sum := sha256.Sum256([]byte(saltHex + ":" + password))
	return saltHex + ":" + hex.EncodeToString(sum[:]), nil
}

func verifyPassword(password, storedHash string) bool {
	parts := strings.SplitN(storedHash, ":", 2)
	if len(parts) != 2 {
		return false
	}
	saltHex, expectedHex := parts[0], parts[1]
	expectedBytes, err := hex.DecodeString(expectedHex)
	if err != nil {
		return false
	}
	sum := sha256.Sum256([]byte(saltHex + ":" + password))
	return hmac.Equal(sum[:], expectedBytes)
}

func signToken(user *repository.AdminUser, secret []byte) (string, error) {
	claims := tokenClaims{
		UserID: user.ID,
		Name:   user.Name,
		Email:  user.Email,
		Role:   user.Role,
		Exp:    time.Now().Add(7 * 24 * time.Hour).Unix(),
	}
	payload, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}
	payloadB64 := base64.RawURLEncoding.EncodeToString(payload)

	mac := hmac.New(sha256.New, secret)
	mac.Write([]byte(payloadB64))
	sigB64 := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))

	return payloadB64 + "." + sigB64, nil
}

func parseToken(token string, secret []byte) (*tokenClaims, error) {
	parts := strings.SplitN(token, ".", 2)
	if len(parts) != 2 {
		return nil, errors.New("invalid token format")
	}
	payloadB64, sigB64 := parts[0], parts[1]

	mac := hmac.New(sha256.New, secret)
	mac.Write([]byte(payloadB64))
	expectedSig := mac.Sum(nil)

	sigBytes, err := base64.RawURLEncoding.DecodeString(sigB64)
	if err != nil || !hmac.Equal(sigBytes, expectedSig) {
		return nil, errors.New("invalid token signature")
	}

	payloadBytes, err := base64.RawURLEncoding.DecodeString(payloadB64)
	if err != nil {
		return nil, errors.New("invalid token payload")
	}

	var claims tokenClaims
	if err := json.Unmarshal(payloadBytes, &claims); err != nil {
		return nil, errors.New("invalid token claims")
	}
	if time.Now().Unix() > claims.Exp {
		return nil, errors.New("token expired")
	}
	return &claims, nil
}
