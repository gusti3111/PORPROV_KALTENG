package config

import (
	"bufio"
	"os"
	"strings"
)

type Config struct {
	Port           string
	DatabaseURL    string
	AllowedOrigins []string
	Environment    string
}

func Load() *Config {
	loadDotEnv(".env", "backend/.env")

	port := getEnv("PORT", "8080")
	dbURL := getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5433/porprov_kalteng?sslmode=disable")
	env := getEnv("APP_ENV", "development")

	rawOrigins := getEnv("ALLOWED_ORIGINS", "https://porprov.apikobar.id,http://localhost:3000,http://localhost:3001,http://localhost:5173,http://127.0.0.1:3000")
	var origins []string
	for _, o := range strings.Split(rawOrigins, ",") {
		trimmed := strings.TrimSpace(o)
		if trimmed != "" {
			origins = append(origins, trimmed)
		}
	}

	return &Config{
		Port:           port,
		DatabaseURL:    dbURL,
		AllowedOrigins: origins,
		Environment:    env,
	}
}

func getEnv(key, defaultVal string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return defaultVal
}

// loadDotEnv reads key=value pairs from the first existing .env file without
// overriding variables already present in the process environment.
func loadDotEnv(paths ...string) {
	for _, path := range paths {
		f, err := os.Open(path)
		if err != nil {
			continue
		}
		scanner := bufio.NewScanner(f)
		for scanner.Scan() {
			line := strings.TrimSpace(scanner.Text())
			if line == "" || strings.HasPrefix(line, "#") {
				continue
			}
			key, val, ok := strings.Cut(line, "=")
			if !ok {
				continue
			}
			key = strings.TrimSpace(key)
			val = strings.Trim(strings.TrimSpace(val), `"'`)
			if key == "" {
				continue
			}
			if _, exists := os.LookupEnv(key); !exists {
				_ = os.Setenv(key, val)
			}
		}
		_ = f.Close()
		return
	}
}
