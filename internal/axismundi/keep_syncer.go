package axismundi

import (
	"context"
	"log"
	"sync"
	"time"
)

type KeepSyncer struct {
	ws       *WorkspaceService
	engine   *Engine
	interval time.Duration
	stopCh   chan struct{}
	mu       sync.Mutex
	running  bool
}

func NewKeepSyncer(ws *WorkspaceService, engine *Engine, interval time.Duration) *KeepSyncer {
	if interval <= 0 {
		interval = 30 * time.Second
	}
	return &KeepSyncer{
		ws:       ws,
		engine:   engine,
		interval: interval,
		stopCh:   make(chan struct{}),
	}
}

// Start launches the background synchronization loop.
func (s *KeepSyncer) Start() {
	s.mu.Lock()
	if s.running {
		s.mu.Unlock()
		return
	}
	s.running = true
	s.mu.Unlock()

	go func() {
		ticker := time.NewTicker(s.interval)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				// In MANUAL mode, skip automatic background polling
				if s.engine != nil && s.engine.GetControlState().Mode == ModeManual {
					continue
				}

				ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
				_, _ = s.Sync(ctx)
				cancel()
			case <-s.stopCh:
				return
			}
		}
	}()
}

// Stop terminates the background synchronization loop.
func (s *KeepSyncer) Stop() {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.running {
		close(s.stopCh)
		s.running = false
	}
}

// Sync queries the Google Keep API, triages any new notes, and broadcasts them to connected TUI clients.
func (s *KeepSyncer) Sync(ctx context.Context) (int, error) {
	if s.ws == nil || !s.ws.GetStatus().Connected {
		return 0, nil
	}

	notes, err := s.ws.ListGoogleKeepNotes(ctx)
	if err != nil {
		log.Printf("[KeepSyncer] Sync notice: %v", err)
		return 0, err
	}

	ingestedCount := 0
	for _, payload := range notes {
		if _, err := s.engine.IngestNote(payload); err == nil {
			ingestedCount++
		}
	}

	if ingestedCount > 0 {
		log.Printf("[KeepSyncer] Successfully ingested %d notes from Google Keep API", ingestedCount)
	}

	return ingestedCount, nil
}