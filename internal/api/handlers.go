package api

import (
	"encoding/json"
	"net/http"

	"mercury-dasha/internal/boltdb"
	"mercury-dasha/internal/postgres"
	"mercury-dasha/internal/sse"
)

type Handler struct {
	store        *boltdb.Store
	pgRepo       *postgres.Repository
	pgDB         *postgres.DB
	hub          *sse.Hub
	embeddedStmt string
	sourceFile   string
}

func NewHandler(store *boltdb.Store, pg *postgres.DB, hub *sse.Hub, embeddedStmt, sourceFile string) *Handler {
	var repo *postgres.Repository
	if pg != nil {
		repo = postgres.NewRepository(pg)
	}
	return &Handler{
		store:        store,
		pgRepo:       repo,
		pgDB:         pg,
		hub:          hub,
		embeddedStmt: embeddedStmt,
		sourceFile:   sourceFile,
	}
}

func jsonResponse(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}