package config

import (
	"flag"
	"os"
	"strings"
)

type Config struct {
	Port              string
	BoltDBPath        string
	StatementFilePath string
	PostgresURL       string
}

func Load() *Config {
	loadDotEnv(".env")

	port := flag.String("port", "3000", "HTTP server port (default 3000 for singular binary)")
	dbPath := flag.String("db", "data/mercury_context.db", "BoltDB database file path")
	stmtFile := flag.String("statement-file", "mercury_foundational_statement.txt", "Raw text file of foundational statement")
	pgURL := flag.String("pg-url", os.Getenv("DATABASE_URL"), "PostgreSQL connection string")
	flag.Parse()

	if envPort := os.Getenv("PORT"); envPort != "" && *port == "3000" {
		*port = envPort
	}

	return &Config{
		Port:              *port,
		BoltDBPath:        *dbPath,
		StatementFilePath: *stmtFile,
		PostgresURL:       *pgURL,
	}
}

// loadDotEnv parses key-value pairs from a .env file and sets them if not already set.
func loadDotEnv(filename string) {
	data, err := os.ReadFile(filename)
	if err != nil {
		return
	}
	lines := strings.Split(string(data), "\n")
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" || strings.HasPrefix(trimmed, "#") {
			continue
		}
		parts := strings.SplitN(trimmed, "=", 2)
		if len(parts) == 2 {
			k := strings.TrimSpace(parts[0])
			v := strings.Trim(strings.TrimSpace(parts[1]), `"'`)
			if os.Getenv(k) == "" {
				_ = os.Setenv(k, v)
			}
		}
	}
}
