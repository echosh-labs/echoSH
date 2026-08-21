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

	updated, err := h.engine.UpdateDirectiveStatus(id, body.Status, body.ExecutionLog)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(updated)
}

func (h *Handlers) DeleteDirective(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "Missing directive id", http.StatusBadRequest)
		return
	}

	if err := h.engine.DeleteDirective(id); err != nil {
		http.Error(w, "Failed to delete directive: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "deleted",
		"id":      id,
		"deleted": true,
	})
}

func (h *Handlers) ListNotifications(w http.ResponseWriter, r *http.Request) {
	limit := 50
	notifications, err := h.engine.store.ListNotifications(limit)
	if err != nil {
		http.Error(w, "Failed to fetch notifications: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"notifications": notifications,
		"total":         len(notifications),
		"recipient":     "justin@echosh-labs.com",
	})
}

func (h *Handlers) SendTestNotification(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Message string `json:"message"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)

	if h.engine.notifier == nil {
		http.Error(w, "Notification engine not initialized", http.StatusServiceUnavailable)
		return
	}

	record, err := h.engine.notifier.SendTestPing(r.Context(), body.Message)
	if err != nil {
		http.Error(w, "Failed to dispatch test notification: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(record)
}

func (h *Handlers) CompleteAllDirectives(w http.ResponseWriter, r *http.Request) {
	count, err := h.engine.MarkAllDirectivesCompleted()
	if err != nil {
		http.Error(w, "Failed to mark directives completed: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"status":    "success",
		"completed": count,
		"timestamp": time.Now().UTC(),
	})
}

func (h *Handlers) GetTelemetryLogs(w http.ResponseWriter, r *http.Request) {
	limit := 100
	var logs []TelemetryRecord
	if h.engine.telemetry != nil {
		logs = h.engine.telemetry.GetRecentLogs(limit)
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"logs":  logs,
		"count": len(logs),
	})
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
	statusMsg := "synced"
	if err != nil {
		statusMsg = "standby"
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"status":         statusMsg,
		"notes_ingested": count,
		"timestamp":      time.Now().UTC(),
	})
}

func (h *Handlers) GetMode(w http.ResponseWriter, r *http.Request) {
	state := h.engine.GetControlState()
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(state)
}

func (h *Handlers) SetMode(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Mode            EngineMode   `json:"mode"`
		IngestPolicy    IngestPolicy `json:"ingest_policy"`
		PollIntervalSec int          `json:"poll_interval_sec"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "Invalid JSON body: "+err.Error(), http.StatusBadRequest)
		return
	}

	updated := h.engine.SetControlState(body.Mode, body.IngestPolicy, body.PollIntervalSec)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(updated)
}