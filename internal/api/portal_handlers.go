package api

import (
	"net/http"
	"os"
	"strings"

	"mercury-dasha/internal/models"
)

func (h *Handler) HealthHandler(w http.ResponseWriter, r *http.Request) {
	pgStatus := "disconnected"
	if h.pgDB != nil && h.pgDB.IsAlive() {
		pgStatus = "connected (primary relational backbone)"
	}

	jsonResponse(w, http.StatusOK, map[string]interface{}{
		"status":     "ok",
		"postgres":   pgStatus,
		"boltdb":     "active (contextual graph & oracle)",
		"sse_stream": "active (/api/stream/events)",
		"embedded":   "active",
		"project":    "Mercury Dasha",
		"author":     "Justin Andrew Wood",
		"version":    "2.3.0",
		"service":    "Go Unified Engine",
	})
}

// StatementHandler returns foundational axiom from PostgreSQL first, then BoltDB, then embedded memory
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
		"id":        "mercury-foundational-root",
		"title":     "The Foundational Axiom of Mercury",
		"author":    "Justin Andrew Wood",
		"statement": statementText,
		"source":    "embedded memory",
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

func (h *Handler) TransitionHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	if h.pgRepo != nil {
		if t, err := h.pgRepo.GetTransitionPortal(ctx); err == nil && t != nil {
			jsonResponse(w, http.StatusOK, t)
			return
		}
	}

	fallback := &models.DashaTransition{
		ID:                "shani-guru-to-budha",
		NativeName:        "Justin Andrew Wood",
		CurrentMahadasha:  "Saturn (Shani)",
		CurrentAntardasha: "Jupiter (Guru)",
		CycleName:         "The Great Dasha Chidra: Transition into Mercury",
		TargetIngressDate: "April 2028",
		DaysRemaining:     600,
		MonthsRemaining:   19.7,
		Theme:             "Distilling two decades of structural discipline and karmic endurance into high-order philosophical wisdom, preparing the vessel for the rapid synaptic flow and linguistic alchemy of Mercury in April 2028.",
	}
	jsonResponse(w, http.StatusOK, fallback)
}