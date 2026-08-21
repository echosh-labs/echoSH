package axismundi

import (
	"log"
	"mercury-dasha/internal/sse"
)

type Engine struct {
	store *Store
	hub   *sse.Hub
}

func NewEngine(store *Store, hub *sse.Hub) *Engine {
	return &Engine{
		store: store,
		hub:   hub,
	}
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

func (e *Engine) GetStore() *Store {
	return e.store
}

func (e *Engine) GetHub() *sse.Hub {
	return e.hub
}