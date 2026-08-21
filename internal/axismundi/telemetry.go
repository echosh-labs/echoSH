package axismundi

import (
	"fmt"
	"log"
	"sync"
	"time"

	"mercury-dasha/internal/sse"
)

type TelemetryRecord struct {
	ID        string `json:"id"`
	Timestamp string `json:"timestamp"`
	Source    string `json:"source"`
	Level     string `json:"level"` // "INFO", "EXECUTE", "SUCCESS", "WARN", "ERROR"
	Message   string `json:"message"`
}

type TelemetryLogger struct {
	mu      sync.RWMutex
	hub     *sse.Hub
	logs    []TelemetryRecord
	maxLogs int
}

func NewTelemetryLogger(hub *sse.Hub) *TelemetryLogger {
	t := &TelemetryLogger{
		hub:     hub,
		logs:    make([]TelemetryRecord, 0, 100),
		maxLogs: 100,
	}

	// Seed baseline system events
	t.Log("SYSTEM", "INFO", "Axis Mundi Zero-Token Engine operational. Telemetry logging online.")
	t.Log("WORKSPACE", "INFO", "Google Workspace Domain-Wide Delegation bridge initialized.")
	return t
}

func (t *TelemetryLogger) Log(source, level, format string, args ...interface{}) {
	msg := fmt.Sprintf(format, args...)
	now := time.Now().UTC()

	record := TelemetryRecord{
		ID:        fmt.Sprintf("tel_%d_%x", now.UnixNano(), now.Unix()%1000),
		Timestamp: now.Format("15:04:05"),
		Source:    source,
		Level:     level,
		Message:   msg,
	}

	t.mu.Lock()
	t.logs = append(t.logs, record)
	if len(t.logs) > t.maxLogs {
		t.logs = t.logs[len(t.logs)-t.maxLogs:]
	}
	t.mu.Unlock()

	// Mirror to standard server logger cleanly
	log.Printf("[%s] [%s] %s", source, level, msg)

	// Broadcast reactive SSE event for the frontend TUI telemetry window
	if t.hub != nil {
		t.hub.Broadcast("axismundi_telemetry", record)
	}
}

func (t *TelemetryLogger) GetRecentLogs(limit int) []TelemetryRecord {
	t.mu.RLock()
	defer t.mu.RUnlock()

	if limit <= 0 || limit > len(t.logs) {
		limit = len(t.logs)
	}

	result := make([]TelemetryRecord, limit)
	start := len(t.logs) - limit
	copy(result, t.logs[start:])
	return result
}

func (t *TelemetryLogger) Clear() {
	t.mu.Lock()
	defer t.mu.Unlock()
	t.logs = make([]TelemetryRecord, 0, t.maxLogs)
}

