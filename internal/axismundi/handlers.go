package axismundi

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
)

type Handlers struct {
	engine *Engine
}

func NewHandlers(engine *Engine) *Handlers {
	return &Handlers{engine: engine}
}

func (h *Handlers) ListDirectives(w http.ResponseWriter, r *http.Request) {
	directives, err := h.engine.store.ListDirectives()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"directives": directives,
		"total":      len(directives),
	})
}

func (h *Handlers) GetPendingDirectives(w http.ResponseWriter, r *http.Request) {
	pending, err := h.engine.store.GetPendingExecuteDirectives()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"pending": pending,
		"count":   len(pending),
	})
}

func (h *Handlers) IngestNote(w http.ResponseWriter, r *http.Request) {
	var payload KeepNotePayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid JSON payload: "+err.Error(), http.StatusBadRequest)
		return
	}

	directive, err := h.engine.IngestNote(payload)
	if err != nil {
		http.Error(w, "Failed to ingest note: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(directive)
}

func (h *Handlers) KeepWebhook(w http.ResponseWriter, r *http.Request) {
	var payload KeepNotePayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid webhook body: "+err.Error(), http.StatusBadRequest)
		return
	}

	if payload.Source == "" {
		payload.Source = "google_keep_webhook"
	}

	directive, err := h.engine.IngestNote(payload)
	if err != nil {
		http.Error(w, "Failed to process keep webhook: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"status":    "success",
		"directive": directive,
	})
}

func (h *Handlers) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "Missing directive id", http.StatusBadRequest)
		return
	}

	var body struct {
		Status       DirectiveStatus `json:"status"`
		ExecutionLog string          `json:"execution_log"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "Invalid JSON body: "+err.Error(), http.StatusBadRequest)
		return
	}

	updated, err := h.engine.store.UpdateStatus(id, body.Status, body.ExecutionLog)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if h.engine.hub != nil {
		h.engine.hub.Broadcast("axismundi_status_changed", updated)
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(updated)
}

func (h *Handlers) GetWorkspaceStatus(w http.ResponseWriter, r *http.Request) {
	status := h.engine.GetWorkspaceStatus()
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(status)
}

func (h *Handlers) TriggerKeepSync(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()

	count, err := h.engine.TriggerKeepSync(ctx)
	if err != nil {
		http.Error(w, "Keep sync error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"status":         "synced",
		"notes_ingested": count,
		"timestamp":      time.Now().UTC(),
	})
}