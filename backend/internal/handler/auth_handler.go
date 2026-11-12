package handler

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"net"
	"net/http"
	"net/mail"
	"os"
	"regexp"
	"strings"
	"sync"
	"time"
	"unicode"

	"porprov-backend/internal/repository"
)

var (
	namePattern  = regexp.MustCompile(`^[a-zA-Z\s.'-]+$`)
	emailPattern = regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$`)
)

type loginAttempt struct {
	count       int
	windowStart time.Time
}

type AuthHandler struct {
	repo       *repository.AuthRepository
	secret     []byte
	inviteCode string
	mu         sync.Mutex
	attempts   map[string]loginAttempt
}

func NewAuthHandler(repo *repository.AuthRepository) *AuthHandler {
	secret := strings.TrimSpace(os.Getenv("JWT_SECRET"))
	if secret == "" {
		secret = "porprov-kalteng-2026-admin-secret"
	}
	inviteCode := strings.TrimSpace(os.Getenv("ADMIN_REGISTER_CODE"))
	if inviteCode == "" {
		inviteCode = "PORPROV-KALTENG-2026"
	}
	return &AuthHandler{
		repo:       repo,
		secret:     []byte(secret),
		inviteCode: inviteCode,
		attempts:   make(map[string]loginAttempt),
	}
}

type registerRequest struct {
	Name       string `json:"name"`
	Email      string `json:"email"`
	Password   string `json:"password"`
	InviteCode string `json:"invite_code"`
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
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	var req registerRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		Error(w, http.StatusBadRequest, "Format JSON tidak valid")
		return
	}

	name := strings.TrimSpace(req.Name)
	email := strings.ToLower(strings.TrimSpace(req.Email))
	password := req.Password
	inviteCode := strings.TrimSpace(req.InviteCode)

	if !hmac.Equal([]byte(inviteCode), []byte(h.inviteCode)) {
		Error(w, http.StatusForbidden, "Kode undangan panitia tidak valid")
		return
	}
	if errMsg := validateName(name); errMsg != "" {
		Error(w, http.StatusBadRequest, errMsg)
		return
	}
	if errMsg := validateEmail(email); errMsg != "" {
		Error(w, http.StatusBadRequest, errMsg)
		return
	}
	if errMsg := validateStrongPassword(password); errMsg != "" {
		Error(w, http.StatusBadRequest, errMsg)
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
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	var req loginRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		Error(w, http.StatusBadRequest, "Format JSON tidak valid")
		return
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))
	password := req.Password

	if errMsg := validateEmail(email); errMsg != "" {
		Error(w, http.StatusBadRequest, errMsg)
		return
	}
	if password == "" || len(password) > 72 || containsControlChars(password) {
		Error(w, http.StatusBadRequest, "Format password tidak valid")
		return
	}

	rateKey := clientIP(r) + ":" + email
	if h.isRateLimited(rateKey) {
		Error(w, http.StatusTooManyRequests, "Terlalu banyak percobaan login gagal. Coba lagi dalam 5 menit.")
		return
	}

	user, err := h.repo.FindByEmail(r.Context(), email)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			h.recordFailedAttempt(rateKey)
			Error(w, http.StatusUnauthorized, "Email atau password salah")
			return
		}
		Error(w, http.StatusInternalServerError, "Gagal memverifikasi akun")
		return
	}

	if !verifyPassword(password, user.PasswordHash) {
		h.recordFailedAttempt(rateKey)
		Error(w, http.StatusUnauthorized, "Email atau password salah")
		return
	}

	h.clearFailedAttempts(rateKey)

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

func (h *AuthHandler) RequireAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := strings.TrimSpace(r.Header.Get("Authorization"))
		if !strings.HasPrefix(authHeader, "Bearer ") {
			Error(w, http.StatusUnauthorized, "Autentikasi admin diperlukan")
			return
		}

		tokenStr := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))
		claims, err := parseToken(tokenStr, h.secret)
		if err != nil || claims.Role != "admin" {
			Error(w, http.StatusUnauthorized, "Sesi admin tidak valid atau sudah kedaluwarsa")
			return
		}

		next.ServeHTTP(w, r)
	})
}

func validateName(name string) string {
	if len(name) < 3 || len(name) > 80 {
		return "Nama lengkap harus 3 hingga 80 karakter"
	}
	if !namePattern.MatchString(name) {
		return "Nama hanya boleh mengandung huruf, spasi, titik, tanda hubung, dan apostrof"
	}
	return ""
}

func validateEmail(email string) string {
	if email == "" || len(email) > 120 {
		return "Email wajib diisi (maksimal 120 karakter)"
	}
	if containsSQLMetaChars(email) || containsControlChars(email) {
		return "Email mengandung karakter yang tidak diizinkan"
	}
	if _, err := mail.ParseAddress(email); err != nil || !emailPattern.MatchString(email) {
		return "Format email tidak valid"
	}
	return ""
}

func validateStrongPassword(password string) string {
	if len(password) < 8 || len(password) > 72 {
		return "Password harus 8 hingga 72 karakter"
	}
	if containsControlChars(password) {
		return "Password mengandung karakter kontrol yang tidak valid"
	}
	var hasUpper, hasLower, hasDigit, hasSpecial bool
	for _, r := range password {
		switch {
		case unicode.IsUpper(r):
			hasUpper = true
		case unicode.IsLower(r):
			hasLower = true
		case unicode.IsDigit(r):
			hasDigit = true
		case unicode.IsPunct(r) || unicode.IsSymbol(r):
			hasSpecial = true
		case unicode.IsSpace(r):
			return "Password tidak boleh mengandung spasi"
		}
	}
	if !hasUpper || !hasLower || !hasDigit || !hasSpecial {
		return "Password harus mengandung huruf besar, huruf kecil, angka, dan karakter spesial"
	}
	return ""
}

func containsSQLMetaChars(s string) bool {
	return strings.ContainsAny(s, `'";<>`) ||
		strings.Contains(s, "--") ||
		strings.Contains(s, "/*") ||
		strings.Contains(s, "*/")
}

func containsControlChars(s string) bool {
	for _, r := range s {
		if r < 32 || r == 127 {
			return true
		}
	}
	return false
}

func clientIP(r *http.Request) string {
	if fwd := strings.TrimSpace(r.Header.Get("X-Forwarded-For")); fwd != "" {
		parts := strings.Split(fwd, ",")
		if len(parts) > 0 {
			return strings.TrimSpace(parts[0])
		}
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil && host != "" {
		return host
	}
	return r.RemoteAddr
}

func (h *AuthHandler) isRateLimited(key string) bool {
	h.mu.Lock()
	defer h.mu.Unlock()

	entry, ok := h.attempts[key]
	if !ok {
		return false
	}
	if time.Since(entry.windowStart) > 5*time.Minute {
		delete(h.attempts, key)
		return false
	}
	return entry.count >= 5
}

func (h *AuthHandler) recordFailedAttempt(key string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	entry, ok := h.attempts[key]
	if !ok || time.Since(entry.windowStart) > 5*time.Minute {
		h.attempts[key] = loginAttempt{count: 1, windowStart: time.Now()}
		return
	}
	entry.count++
	h.attempts[key] = entry
}

func (h *AuthHandler) clearFailedAttempts(key string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.attempts, key)
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
