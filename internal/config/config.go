package config

import (
	"flag"
	"os"
)

type Config struct {
	Port              string
	BoltDBPath        string
	StatementFilePath string
	PostgresURL       string
}

func Load() *Config {
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
