package api

import (
	"encoding/json"
	"net/http"
	"os"
	"strings"

	"github.com/go-chi/chi/v5"
	"mercury-dasha/internal/boltdb"
	"mercury-dasha/internal/models"
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

func (h *Handler) HealthHandler(w http.ResponseWriter, r *http.Request) {
	pgStatus := "disconnected"
	if h.pgDB != nil && h.pgDB.IsAlive() {
		pgStatus = "connected (primary relational backbone)"
	}

	jsonResponse(w, http.StatusOK, map[string]interface{}{
		"status":      "ok",
		"postgres":    pgStatus,
		"boltdb":      "active (contextual graph & oracle)",
		"sse_stream":  "active (/api/stream/events)",
		"embedded":    "active",
		"project":     "Mercury Dasha",
		"author":      "Justin Andrew Wood",
		"version":     "2.3.0",
		"service":     "Go Unified Engine",
	})
}

// StatementHandler returns foundational axiom from PostgreSQL first
func (h *Handler) StatementHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	if h.pgRepo != nil {
		if stmt, err := h.pgRepo.GetFoundationalStatement(ctx); err == nil && stmt != nil {
			jsonResponse(w, http.StatusOK, stmt)
			return
		}
	}

	if stmt, err := h.store.GetFoundationalStatement(); err == nil && stmt != nil {
		jsonResponse(w, http.StatusOK, stmt)
		return
	}

	statementText := strings.TrimSpace(h.embeddedStmt)
	if h.sourceFile != "" {
		if rawText, fileErr := os.ReadFile(h.sourceFile); fileErr == nil && len(rawText) > 0 {
			statementText = strings.TrimSpace(string(rawText))
		}
	}
	jsonResponse(w, http.StatusOK, map[string]interface{}{
		"id":         "mercury-foundational-root",
		"title":      "The Foundational Axiom of Mercury",
		"author":     "Justin Andrew Wood",
		"statement":  statementText,
		"source":     "embedded memory",
	})
}

func (h *Handler) StatementRawHandler(w http.ResponseWriter, r *http.Request) {
	if h.sourceFile != "" {
		if rawText, err := os.ReadFile(h.sourceFile); err == nil && len(rawText) > 0 {
			w.Header().Set("Content-Type", "text/plain; charset=utf-8")
			_, _ = w.Write(rawText)
			return
		}
	}
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	_, _ = w.Write([]byte(h.embeddedStmt))
}

func (h *Handler) ContextListHandler(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	nodes, err := h.store.ListContextNodes(category)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	jsonResponse(w, http.StatusOK, nodes)
}

func (h *Handler) ContextDetailHandler(w http.ResponseWriter, r *http.Request) {
	key := chi.URLParam(r, "key")
	if key == "" {
		http.Error(w, "Missing key parameter", http.StatusBadRequest)
		return
	}

	node, err := h.store.GetContextNodeWithRelatives(key)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	if h.hub != nil {
		h.hub.Broadcast("graph_resonance", map[string]interface{}{
			"key":   node.Key,
			"title": node.Title,
		})
	}

	jsonResponse(w, http.StatusOK, node)
}

func (h *Handler) DashaHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	if h.pgRepo != nil {
		if dasha, err := h.pgRepo.GetDashaOverview(ctx); err == nil && dasha != nil {
			jsonResponse(w, http.StatusOK, dasha)
			return
		}
	}

	dasha, err := h.store.GetDashaOverview()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	jsonResponse(w, http.StatusOK, dasha)
}

func (h *Handler) NakshatraHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	if h.pgRepo != nil {
		if nakshatras, err := h.pgRepo.GetNakshatras(ctx); err == nil && len(nakshatras) > 0 {
			jsonResponse(w, http.StatusOK, nakshatras)
			return
		}
	}

	nakshatras, err := h.store.GetNakshatras()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	jsonResponse(w, http.StatusOK, nakshatras)
}

func (h *Handler) AlchemicalHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	if h.pgRepo != nil {
		if principles, err := h.pgRepo.GetAlchemicalPrinciples(ctx); err == nil && len(principles) > 0 {
			jsonResponse(w, http.StatusOK, principles)
			return
		}
	}

	principles, err := h.store.GetAlchemicalPrinciples()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	jsonResponse(w, http.StatusOK, principles)
}

func (h *Handler) AuthorHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	if h.pgRepo != nil {
		if opus, err := h.pgRepo.GetAuthorOpus(ctx); err == nil && opus != nil {
			jsonResponse(w, http.StatusOK, opus)
			return
		}
	}

	opus, err := h.store.GetAuthorOpus()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	jsonResponse(w, http.StatusOK, opus)
}

func (h *Handler) OracleDailyHandler(w http.ResponseWriter, r *http.Request) {
	oracle, err := h.store.GetDailyOracle()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if h.hub != nil {
		h.hub.Broadcast("oracle_pulse", oracle)
	}

	jsonResponse(w, http.StatusOK, oracle)
}

func (h *Handler) TransitionHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	if h.pgRepo != nil {
		if t, err := h.pgRepo.GetTransitionPortal(ctx); err == nil && t != nil {
			jsonResponse(w, http.StatusOK, t)
			return
		}
	}

	fallback := &models.DashaTransition{
		ID:                  "shani-guru-to-budha",
		NativeName:          "Justin Andrew Wood",
		CurrentMahadasha:    "Saturn (Shani)",
		CurrentAntardasha:   "Jupiter (Guru)",
		CycleName:           "The Great Dasha Chidra: Transition into Mercury",
		TargetIngressDate:   "April 2028",
		DaysRemaining:       600,
		MonthsRemaining:     19.7,
		Theme:               "Distilling two decades of structural discipline and karmic endurance into high-order philosophical wisdom, preparing the vessel for the rapid synaptic flow and linguistic alchemy of Mercury in April 2028.",
	}
	jsonResponse(w, http.StatusOK, fallback)
}

func (h *Handler) AudioPresetsHandler(w http.ResponseWriter, r *http.Request) {
	presets := []map[string]interface{}{
		{
			"name":        "Mercury Orbital Bell (141.27 Hz)",
			"category":    "Planetary & Esoteric",
			"description": "Tuned to the cosmic frequency of Mercury's planetary rotation and Buddhi discernment.",
			"fundamental": 141.27,
			"harmonics":   []float64{141.27, 282.54, 423.81, 565.08},
		},
		{
			"name":        "Tria Prima Quicksilver Drone",
			"category":    "Planetary & Esoteric",
			"description": "Deep alchemical drone reconciling Spiritus, Sulfur, and Salt with resonant filter sweeps.",
			"fundamental": 108.0,
			"harmonics":   []float64{108.0, 216.0, 324.0},
		},
		{
			"name":        "Rainbow Flutter",
			"category":    "Planetary & Esoteric",
			"description": "Tri-oscillator shimmering chord with vibrato and spatial dispersion.",
			"harmonics":   []float64{700.0, 900.0, 1200.0},
		},
		{
			"name":        "808 Kick",
			"category":    "Percussion",
			"description": "Punchy sub-bass kick with rapid pitch descent and warm lowpass filtering.",
			"rawCommand":  "raw osc:sine:150 env:0.01:0.3:0:0.05 dur:0.35 lfo:sine:30:-100:frequency filter:lowpass:500",
		},
		{
			"name":        "Snare Drum",
			"category":    "Percussion",
			"description": "White noise snap blended with a resonant sine body.",
			"rawCommand":  "raw noise:white env:0.01:0.1:0:0.05 dur:0.16 filter:bandpass:1500:5 osc:sine:200",
		},
	}
	jsonResponse(w, http.StatusOK, map[string]interface{}{
		"engine":  "Native Web Audio 2.0 Procedural DSP",
		"presets": presets,
	})
}

