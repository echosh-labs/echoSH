package api

import (
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"mercury-dasha/internal/boltdb"
	"mercury-dasha/internal/postgres"
	"mercury-dasha/internal/sse"
)

func NewRouter(store *boltdb.Store, pg *postgres.DB, hub *sse.Hub, embeddedStmt, sourceFile string) *chi.Mux {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8080", "*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	h := NewHandler(store, pg, hub, embeddedStmt, sourceFile)

	// Stream Routes
	r.Get("/api/stream/events", hub.ServeHTTP)

	// REST API Routes
	r.Route("/api", func(api chi.Router) {
		api.Get("/health", h.HealthHandler)
		api.Get("/statement", h.StatementHandler)
		api.Get("/statement/raw", h.StatementRawHandler)
		api.Get("/context", h.ContextListHandler)
		api.Get("/context/{key}", h.ContextDetailHandler)
		api.Get("/dasha", h.DashaHandler)
		api.Get("/nakshatras", h.NakshatraHandler)
		api.Get("/alchemical", h.AlchemicalHandler)
		api.Get("/author", h.AuthorHandler)
		api.Get("/oracle/daily", h.OracleDailyHandler)
		api.Get("/transition/threshold", h.TransitionHandler)
	})

	return r
}
