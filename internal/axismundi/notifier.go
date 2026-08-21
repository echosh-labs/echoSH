package axismundi

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log"
	"sync"
	"time"

	"mercury-dasha/internal/sse"
)

type NotificationEngine struct {
	mu             sync.Mutex
	ws             *WorkspaceService
	store          *Store
	hub            *sse.Hub
	recentAlerts   map[string]time.Time
	throttleWindow time.Duration
}

func NewNotificationEngine(ws *WorkspaceService, store *Store, hub *sse.Hub) *NotificationEngine {
	return &NotificationEngine{
		ws:             ws,
		store:          store,
		hub:            hub,
		recentAlerts:   make(map[string]time.Time),
		throttleWindow: 60 * time.Second,
	}
}

// isThrottled generates a hash of event + key to prevent alert storms
func (n *NotificationEngine) isThrottled(event NotificationEvent, key string) bool {
	n.mu.Lock()
	defer n.mu.Unlock()

	h := sha256.Sum256([]byte(string(event) + ":" + key))
	hashKey := hex.EncodeToString(h[:8])

	now := time.Now()
	if lastSent, exists := n.recentAlerts[hashKey]; exists {
		if now.Sub(lastSent) < n.throttleWindow {
			return true
		}
	}

	n.recentAlerts[hashKey] = now

	// Cleanup stale entries
	for k, v := range n.recentAlerts {
		if now.Sub(v) > 5*time.Minute {
			delete(n.recentAlerts, k)
		}
	}

	return false
}

// Dispatch creates, persists, and delivers a notification
func (n *NotificationEngine) Dispatch(ctx context.Context, event NotificationEvent, title string, summary string, metadata map[string]string) (*NotificationRecord, error) {
	record := &NotificationRecord{
		ID:        fmt.Sprintf("notif_%d_%x", time.Now().Unix(), time.Now().UnixNano()%10000),
		Event:     event,
		Recipient: "justin@echosh-labs.com",
		Title:     title,
		Summary:   summary,
		Metadata:  metadata,
		CreatedAt: time.Now().UTC(),
	}

	if n.ws != nil {
		if err := n.ws.SendChatNotification(ctx, record); err != nil {
			record.Delivered = false
			record.Error = err.Error()
			log.Printf("[Notifier] Failed to dispatch chat notification: %v", err)
		}
	} else {
		record.Channel = "LOCAL_STANDBY"
		record.Delivered = true
	}

	if n.store != nil {
		if err := n.store.SaveNotification(*record); err != nil {
			log.Printf("[Notifier] Failed to persist notification record: %v", err)
		}
	}

	// Broadcast reactive SSE event for the frontend TUI
	if n.hub != nil {
		n.hub.Broadcast("axismundi_notification", record)
	}

	return record, nil
}

// NotifyDirectiveQueued triggers a key notification when an EXECUTE directive is ingested
func (n *NotificationEngine) NotifyDirectiveQueued(ctx context.Context, d *AxisDirective) error {
	if n.isThrottled(EventExecuteQueued, d.ID) {
		log.Printf("[Notifier] Throttling duplicate queued notification for %s", d.ID)
		return nil
	}

	title := fmt.Sprintf("Execute Directive Queued: %s", d.Title)
	instrSnippet := d.TriagedInstruction
	if len(instrSnippet) > 120 {
		instrSnippet = instrSnippet[:117] + "..."
	}
	summary := fmt.Sprintf("Directive %s triaged for autonomous agent execution.\nInstruction: %s", d.ID, instrSnippet)
	metadata := map[string]string{
		"directive_id": d.ID,
		"source":       d.Source,
		"status":       string(d.Status),
	}

	_, err := n.Dispatch(ctx, EventExecuteQueued, title, summary, metadata)
	return err
}

// NotifyDirectiveCompleted triggers a notification when an agent marks execution complete
func (n *NotificationEngine) NotifyDirectiveCompleted(ctx context.Context, d *AxisDirective) error {
	if n.isThrottled(EventExecutionCompleted, d.ID) {
		log.Printf("[Notifier] Throttling duplicate completion notification for %s", d.ID)
		return nil
	}

	title := fmt.Sprintf("Directive Execution Completed: %s", d.Title)
	logSnippet := d.ExecutionLog
	if len(logSnippet) > 120 {
		logSnippet = logSnippet[:117] + "..."
	}
	summary := fmt.Sprintf("Directive %s successfully executed and verified.\nLog: %s", d.ID, logSnippet)
	metadata := map[string]string{
		"directive_id": d.ID,
		"status":       string(d.Status),
	}

	_, err := n.Dispatch(ctx, EventExecutionCompleted, title, summary, metadata)
	return err
}

// NotifySyncMilestone alerts when a batch sync yields new actionable directives
func (n *NotificationEngine) NotifySyncMilestone(ctx context.Context, notesIngested int, executeCount int) error {
	if executeCount == 0 {
		return nil
	}

	key := fmt.Sprintf("sync_%d_%d", notesIngested, executeCount)
	if n.isThrottled(EventSyncMilestone, key) {
		return nil
	}

	title := fmt.Sprintf("Workspace Keep Sync Milestone: %d New Executable Directives", executeCount)
	summary := fmt.Sprintf("Processed %d Google Keep items; %d new directive(s) queued for agent work.", notesIngested, executeCount)
	metadata := map[string]string{
		"notes_ingested": fmt.Sprintf("%d", notesIngested),
		"execute_count":  fmt.Sprintf("%d", executeCount),
	}

	_, err := n.Dispatch(ctx, EventSyncMilestone, title, summary, metadata)
	return err
}

// SendTestPing sends an on-demand validation ping to verify the return loop
func (n *NotificationEngine) SendTestPing(ctx context.Context, customMsg string) (*NotificationRecord, error) {
	if customMsg == "" {
		customMsg = "Axis Mundi Google Workspace return loop operational check."
	}
	title := "Echo SH Labs // Axis Mundi Return Loop Verification"
	summary := customMsg
	metadata := map[string]string{
		"test_mode": "true",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	}

	return n.Dispatch(ctx, EventTestPing, title, summary, metadata)
}
