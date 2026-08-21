package postgres

import (
	"context"
	"database/sql"
	"embed"
	"fmt"
	"io/fs"
	"log"
	"sort"
	"strings"
	"time"
)

// RunMigrations executes all unapplied *.up.sql migrations from the embedded filesystem
func RunMigrations(ctx context.Context, db *sql.DB, migrationsFS embed.FS) error {
	log.Println("[Postgres Migrator] Checking migration status...")

	// 1. Ensure schema_migrations table exists
	createTableSQL := `
	CREATE TABLE IF NOT EXISTS schema_migrations (
		version VARCHAR(150) PRIMARY KEY,
		applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
	);`
	if _, err := db.ExecContext(ctx, createTableSQL); err != nil {
		return fmt.Errorf("failed to create schema_migrations table: %w", err)
	}

	// 2. Read all files in migrations directory
	entries, err := fs.ReadDir(migrationsFS, "migrations")
	if err != nil {
		return fmt.Errorf("failed to read embedded migrations dir: %w", err)
	}

	var upFiles []string
	for _, entry := range entries {
		if !entry.IsDir() && strings.HasSuffix(entry.Name(), ".up.sql") {
			upFiles = append(upFiles, entry.Name())
		}
	}
	sort.Strings(upFiles)

	// 3. Query already applied migrations
	rows, err := db.QueryContext(ctx, "SELECT version FROM schema_migrations")
	if err != nil {
		return fmt.Errorf("failed to query applied migrations: %w", err)
	}
	defer rows.Close()

	applied := make(map[string]bool)
	for rows.Next() {
		var v string
		if err := rows.Scan(&v); err != nil {
			return err
		}
		applied[v] = true
	}

	// 4. Apply pending migrations sequentially inside transactions
	appliedCount := 0
	for _, file := range upFiles {
		if applied[file] {
			continue
		}

		log.Printf("[Postgres Migrator] Applying migration: %s ...", file)
		content, err := fs.ReadFile(migrationsFS, "migrations/"+file)
		if err != nil {
			return fmt.Errorf("failed to read migration file %s: %w", file, err)
		}

		tx, err := db.BeginTx(ctx, nil)
		if err != nil {
			return fmt.Errorf("failed to start transaction for %s: %w", file, err)
		}

		if _, err := tx.ExecContext(ctx, string(content)); err != nil {
			_ = tx.Rollback()
			return fmt.Errorf("failed executing migration %s: %w", file, err)
		}

		if _, err := tx.ExecContext(ctx, "INSERT INTO schema_migrations (version, applied_at) VALUES ($1, $2)", file, time.Now()); err != nil {
			_ = tx.Rollback()
			return fmt.Errorf("failed recording migration %s: %w", file, err)
		}

		if err := tx.Commit(); err != nil {
			return fmt.Errorf("failed committing migration %s: %w", file, err)
		}

		log.Printf("[Postgres Migrator] Successfully applied: %s", file)
		appliedCount++
	}

	if appliedCount == 0 {
		log.Println("[Postgres Migrator] Schema is up to date. No pending migrations.")
	} else {
		log.Printf("[Postgres Migrator] Successfully applied %d new migration(s).", appliedCount)
	}

	return nil
}
