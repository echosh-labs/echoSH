package postgres

import (
	"context"
	"database/sql"
	"embed"
	"log"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
)

type DB struct {
	pool *sql.DB
}

func Connect(connStr string, migrationsFS embed.FS) (*DB, error) {
	if connStr == "" {
		connStr = "postgres://mercury_user:mercury_password@localhost:5432/mercury_dasha?sslmode=disable"
	}

	db, err := sql.Open("pgx", connStr)
	if err != nil {
		return nil, err
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		log.Printf("[Postgres] Warning: Database ping failed (%v). Operating with BoltDB fallback.", err)
		return &DB{pool: db}, nil
	}

	log.Println("[Postgres] Connected to PostgreSQL primary relational database.")

	// Execute embedded migrations on startup
	if err := RunMigrations(context.Background(), db, migrationsFS); err != nil {
		log.Printf("[Postgres] Migration notice: %v", err)
	}

	return &DB{pool: db}, nil
}

func (d *DB) Close() error {
	if d.pool != nil {
		return d.pool.Close()
	}
	return nil
}

func (d *DB) IsAlive() bool {
	if d.pool == nil {
		return false
	}
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()
	return d.pool.PingContext(ctx) == nil
}

func (d *DB) Pool() *sql.DB {
	return d.pool
}
