package axismundi

import (
	"context"
	"log"
	"time"

	"mercury-dasha/internal/sse"
)

type Engine struct {
	store     *Store
	hub       *sse.Hub
	workspace *WorkspaceService
	syncer    *KeepSyncer
}

func NewEngine(store *Store, hub *sse.Hub, ws *WorkspaceService) *Engine {
	e := &Engine{
		store:     store,
		hub:       hub,
		workspace: ws,
	}

	if ws != nil {
		e.syncer = NewKeepSyncer(ws, e, 30*time.Second)
		e.syncer.Start()
	}

	return e
}

// IngestNote processes a note without AI token consumption, saves it, and emits real-time events.
func (e *Engine) IngestNote(payload KeepNotePayload) (*AxisDirective, error) {
	directive := TriageNote(payload)

	if err := e.store.SaveDirective(directive); err != nil {
		return nil, err
	}

	log.Printf("[AxisMundi] Ingested note %s (Execute: %v, Status: %s)", directive.ID, directive.IsExecute, directive.Status)

	// Broadcast reactive SSE event
	if e.hub != nil {
		eventName := "axismundi_ingested"
		if directive.IsExecute {
			eventName = "axismundi_execute_alert"
		}
		e.hub.Broadcast(eventName, directive)
	}

	return &directive, nil
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

func (e *Engine) GetStore() *Store {
	return e.store
}

func (e *Engine) GetHub() *sse.Hub {
	return e.hub
}