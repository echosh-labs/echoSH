package axismundi

import (
	"context"
	"log"
	"sync"
	"time"

	"mercury-dasha/internal/sse"
)

type Engine struct {
	mu           sync.RWMutex
	store        *Store
	hub          *sse.Hub
	workspace    *WorkspaceService
	syncer       *KeepSyncer
	notifier     *NotificationEngine
	controlState SystemControlState
}

func NewEngine(store *Store, hub *sse.Hub, ws *WorkspaceService) *Engine {
	initialState := SystemControlState{
		Mode:            ModeAuto,
		IngestPolicy:    PolicyExecute,
		PollIntervalSec: 30,
		UpdatedAt:       time.Now().UTC(),
	}

	if store != nil {
		initialState = store.GetControlState()
	}

	e := &Engine{
		store:        store,
		hub:          hub,
		workspace:    ws,
		notifier:     NewNotificationEngine(ws, store, hub),
		controlState: initialState,
	}

	if ws != nil {
		e.syncer = NewKeepSyncer(ws, e, time.Duration(initialState.PollIntervalSec)*time.Second)
		e.syncer.Start()
	}

	return e
}

// IngestNote processes a note without AI token consumption, applying active Ingestion Policy.
func (e *Engine) IngestNote(payload KeepNotePayload) (*AxisDirective, error) {
	policy := e.GetControlState().IngestPolicy
	directive := TriageNoteWithPolicy(payload, policy)

	if err := e.store.SaveDirective(directive); err != nil {
		return nil, err
	}

	log.Printf("[AxisMundi] Ingested note %s (Policy: %s, Execute: %v, Status: %s)", directive.ID, policy, directive.IsExecute, directive.Status)

	// Broadcast reactive SSE event
	if e.hub != nil {
		eventName := "axismundi_ingested"
		if directive.IsExecute {
			eventName = "axismundi_execute_alert"
		}
		e.hub.Broadcast(eventName, directive)
	}

	// Dispatch key notification via return loop if EXECUTE queued
	if directive.IsExecute && e.notifier != nil {
		go func(d AxisDirective) {
			_ = e.notifier.NotifyDirectiveQueued(context.Background(), &d)
		}(directive)
	}

	return &directive, nil
}

func (e *Engine) GetControlState() SystemControlState {
	e.mu.RLock()
	defer e.mu.RUnlock()
	return e.controlState
}

func (e *Engine) SetControlState(mode EngineMode, policy IngestPolicy, intervalSec int) SystemControlState {
	e.mu.Lock()
	if mode != "" {
		e.controlState.Mode = mode
	}
	if policy != "" {
		e.controlState.IngestPolicy = policy
	}
	if intervalSec > 0 {
		e.controlState.PollIntervalSec = intervalSec
	}
	e.controlState.UpdatedAt = time.Now().UTC()
	updated := e.controlState
	e.mu.Unlock()

	if e.store != nil {
		_ = e.store.SetControlState(updated)
	}

	if e.syncer != nil && intervalSec > 0 {
		e.syncer.UpdateInterval(time.Duration(intervalSec) * time.Second)
	}

	log.Printf("[AxisMundi] System Control updated: Mode=%s, IngestPolicy=%s, PollInterval=%ds", updated.Mode, updated.IngestPolicy, updated.PollIntervalSec)

	if e.hub != nil {
		e.hub.Broadcast("axismundi_control_changed", updated)
	}

	return updated
}

func (e *Engine) DeleteDirective(id string) error {
	if err := e.store.DeleteDirective(id); err != nil {
		return err
	}
	if e.hub != nil {
		e.hub.Broadcast("axismundi_directive_deleted", map[string]string{"id": id})
	}
	return nil
}

func (e *Engine) TriggerKeepSync(ctx context.Context) (int, error) {
	if e.syncer != nil {
		return e.syncer.Sync(ctx)
	}
	return 0, nil
}

func (e *Engine) GetWorkspaceStatus() WorkspaceStatus {
	if e.workspace != nil {
		return e.workspace.GetStatus()
	}
	return WorkspaceStatus{
		Connected: false,
		Mode:      "STANDBY_LOCAL",
		LastSync:  time.Now().UTC(),
	}
}

func (e *Engine) UpdateDirectiveStatus(id string, status DirectiveStatus, executionLog string) (*AxisDirective, error) {
	updated, err := e.store.UpdateStatus(id, status, executionLog)
	if err != nil {
		return nil, err
	}

	if e.hub != nil {
		if status == StatusCompleted {
			e.hub.Broadcast("axismundi_execution_completed", updated)
		} else {
			e.hub.Broadcast("axismundi_status_changed", updated)
		}
	}

	// Dispatch key notification upon completion
	if status == StatusCompleted && e.notifier != nil {
		go func(d AxisDirective) {
			_ = e.notifier.NotifyDirectiveCompleted(context.Background(), &d)
		}(*updated)
	}

	return updated, nil
}

func (e *Engine) GetNotifier() *NotificationEngine {
	return e.notifier
}

func (e *Engine) GetStore() *Store {
	return e.store
}

func (e *Engine) GetHub() *sse.Hub {
	return e.hub
}