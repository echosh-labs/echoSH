package axismundi

import (
	"context"
	"os"
	"testing"
	"time"

	"mercury-dasha/internal/sse"
	bolt "go.etcd.io/bbolt"
)

func TestNotificationEngineLifecycle(t *testing.T) {
	tmpDB := "test_notifier.db"
	defer os.Remove(tmpDB)

	db, err := bolt.Open(tmpDB, 0600, nil)
	if err != nil {
		t.Fatalf("failed to open test boltdb: %v", err)
	}
	defer db.Close()

	store, err := NewStore(db)
	if err != nil {
		t.Fatalf("failed to init store: %v", err)
	}

	hub := sse.NewHub()
	go hub.Run()

	ws := NewWorkspaceService(context.Background())
	engine := NewEngine(store, hub, ws)

	notifier := engine.GetNotifier()
	if notifier == nil {
		t.Fatalf("expected non-nil notifier on engine")
	}

	// 1. Test Dispatching a Test Ping
	ping, err := notifier.SendTestPing(context.Background(), "Integration test ping")
	if err != nil {
		t.Fatalf("SendTestPing failed: %v", err)
	}
	if ping.Recipient != "justin@echosh-labs.com" {
		t.Errorf("expected recipient justin@echosh-labs.com, got %s", ping.Recipient)
	}
	if !ping.Delivered {
		t.Errorf("expected test ping to be marked delivered")
	}

	// 2. Verify BoltDB storage
	list, err := store.ListNotifications(10)
	if err != nil {
		t.Fatalf("ListNotifications failed: %v", err)
	}
	if len(list) != 1 {
		t.Fatalf("expected 1 notification in store, got %d", len(list))
	}
	if list[0].ID != ping.ID {
		t.Errorf("expected ID %s, got %s", ping.ID, list[0].ID)
	}

	// 3. Test Throttling / Deduplication
	d := &AxisDirective{
		ID:                 "dir_test_123",
		Title:              "Refactor Auth",
		TriagedInstruction: "Make sure OAuth scopes are set.",
		Status:             StatusQueuedForAgent,
	}

	err = notifier.NotifyDirectiveQueued(context.Background(), d)
	if err != nil {
		t.Fatalf("first NotifyDirectiveQueued failed: %v", err)
	}

	// Second immediate dispatch of same directive should be throttled
	err = notifier.NotifyDirectiveQueued(context.Background(), d)
	if err != nil {
		t.Fatalf("throttled NotifyDirectiveQueued should not return error: %v", err)
	}

	// Total stored notifications should now be 2 (ping + 1st directive), not 3
	list2, err := store.ListNotifications(10)
	if err != nil {
		t.Fatalf("ListNotifications failed: %v", err)
	}
	if len(list2) != 2 {
		t.Errorf("expected 2 notifications (deduped), got %d", len(list2))
	}

	// 4. Test Completion Notification via Engine UpdateDirectiveStatus
	_, err = engine.IngestNote(KeepNotePayload{
		Title:   "Direct Ingest Test",
		Content: "Execute task now #amra-exec",
	})
	if err != nil {
		t.Fatalf("IngestNote failed: %v", err)
	}

	// Give background goroutine a brief moment to log notification
	time.Sleep(50 * time.Millisecond)

	list3, err := store.ListNotifications(10)
	if err != nil {
		t.Fatalf("ListNotifications failed: %v", err)
	}
	if len(list3) < 3 {
		t.Errorf("expected at least 3 notifications after execute ingest, got %d", len(list3))
	}
}
