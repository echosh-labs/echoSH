package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"mercury-dasha/internal/api"
	"mercury-dasha/internal/axismundi"
	"mercury-dasha/internal/boltdb"
	"mercury-dasha/internal/config"
	"mercury-dasha/internal/postgres"
	"mercury-dasha/internal/sse"
)

func main() {
	cfg := config.Load()

	log.Println("==========================================================")
	log.Println("             M E R C U R Y   D A S H A                    ")
	log.Println("       Author: Justin Andrew Wood | Engine: Go + BoltDB   ")
	log.Println("      PostgreSQL Primary Store + BoltDB Context Graph     ")
	log.Println("       Real-Time Server-Sent Events (SSE) Hub Active      ")
	log.Println("       Axis Mundi Zero-Token Ingestion & MCP Server Active")
	log.Println("==========================================================")

	// 1. Initialize PostgreSQL Primary Relational Layer (with Embedded SQL Migrations)
	pgDB, err := postgres.Connect(cfg.PostgresURL, EmbeddedMigrations)
	if err != nil {
		log.Printf("[Postgres] Note: %v", err)
	}
	if pgDB != nil {
		defer pgDB.Close()
	}

	// 2. Initialize BoltDB Contextual Engine ("The Fun Stuff": Context Graph & Oracle)
	store, err := boltdb.NewStore(cfg.BoltDBPath)
	if err != nil {
		log.Fatalf("[FATAL] Could not initialize BoltDB: %v", err)
	}
	defer store.Close()
	log.Printf("[BoltDB] Contextual & Oracle storage active at %s", cfg.BoltDBPath)

	// 3. Seed BoltDB from Embedded Statement baseline
	if err := boltdb.SeedDatabase(store, EmbeddedFoundationalStatement, cfg.StatementFilePath); err != nil {
		log.Printf("[WARN] BoltDB seeding returned notice: %v", err)
	}

	// 4. Initialize and Run SSE Broadcast Hub
	sseHub := sse.NewHub()
	go sseHub.Run()
	log.Println("[SSE Hub] Real-time event streaming engine active on /api/stream/events")

	// 5. Initialize Axis Mundi Zero-Token Amra Core Engine, Google Workspace Bridge & MCP Server
	axisStore, err := axismundi.NewStore(store.DB())
	if err != nil {
		log.Fatalf("[FATAL] Could not initialize Axis Mundi store: %v", err)
	}
	ws := axismundi.NewWorkspaceService(context.Background())
	axisEngine := axismundi.NewEngine(axisStore, sseHub, ws)
	log.Println("[Axis Mundi] Zero-token Amra Core Google Workspace engine and MCP endpoint (/api/mcp) active.")

	// 6. Setup Router and Routes
	router := api.NewRouter(store, pgDB, sseHub, axisEngine, EmbeddedFoundationalStatement, cfg.StatementFilePath)

	// 7. Register Embedded Frontend Routes (ui.go)
	RegisterUIRoutes(router)

	// 8. Start HTTP Server
	serverAddr := fmt.Sprintf("0.0.0.0:%s", cfg.Port)
	srv := &http.Server{
		Addr:         serverAddr,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("[Server] Mercury Dasha unified server listening on http://%s", serverAddr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[FATAL] Server error: %v", err)
		}
	}()

	// Graceful Shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("[Server] Gracefully shutting down...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_ = srv.Shutdown(ctx)
	log.Println("[Server] Stopped.")
}