package axismundi

import (
	"context"
	"log"
	"sync"
	"time"
)

type KeepSyncer struct {
	ws           *WorkspaceService
	engine       *Engine
	interval     time.Duration
	stopCh       chan struct{}
	resetCh      chan time.Duration
	mu           sync.Mutex
	running      bool
	nextSyncTime time.Time
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
		resetCh:  make(chan time.Duration, 4),
	}
}

// Start launches the background synchronization and countdown loop.
func (s *KeepSyncer) Start() {
	s.mu.Lock()
	if s.running {
		s.mu.Unlock()
		return
	}
	s.running = true
	s.nextSyncTime = time.Now().Add(s.interval)
	s.mu.Unlock()

	go func() {
		tickOneSec := time.NewTicker(1 * time.Second)
		defer tickOneSec.Stop()

		for {
			select {
			case newInterval := <-s.resetCh:
				s.mu.Lock()
				s.interval = newInterval
				s.nextSyncTime = time.Now().Add(newInterval)
				s.mu.Unlock()

			case <-tickOneSec.C:
				s.mu.Lock()
				now := time.Now()
				remaining := int(s.nextSyncTime.Sub(now).Seconds())
				if remaining < 0 {
					remaining = 0
				}
				mode := ModeAuto
				if s.engine != nil {
					mode = s.engine.GetControlState().Mode
				}
				s.mu.Unlock()

				// Broadcast tick telemetry over SSE
				if s.engine != nil && s.engine.hub != nil {
					s.engine.hub.Broadcast("axismundi_tick", map[string]interface{}{
						"mode":                 mode,
						"remaining_seconds":    remaining,
						"current_interval_sec": int(s.interval.Seconds()),
						"timestamp":            now.UTC(),
					})
				}

				// If countdown reached zero and in AUTO mode, trigger Keep Sync
				if remaining <= 0 {
					s.mu.Lock()
					s.nextSyncTime = time.Now().Add(s.interval)
					s.mu.Unlock()

					if mode == ModeAuto {
						ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
						_, _ = s.Sync(ctx)
						cancel()
					}
				}

			case <-s.stopCh:
				return
			}
		}
	}()
}

// UpdateInterval dynamically changes the polling interval and resets the next sync target time.
func (s *KeepSyncer) UpdateInterval(newInterval time.Duration) {
	if newInterval <= 0 {
		newInterval = 30 * time.Second
	}
	s.mu.Lock()
	s.interval = newInterval
	s.nextSyncTime = time.Now().Add(newInterval)
	s.mu.Unlock()

	select {
	case s.resetCh <- newInterval:
	default:
	}
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