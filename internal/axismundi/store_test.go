package axismundi

import (
	"testing"
	"time"

	bolt "go.etcd.io/bbolt"
)

func TestStoreFullLifecycleAndControl(t *testing.T) {
	tmpDir := t.TempDir()
	tmpFile := tmpDir + "/test_axis_store.db"

	db, err := bolt.Open(tmpFile, 0600, nil)
	if err != nil {
		t.Fatalf("failed to open bolt db: %v", err)
	}
	defer db.Close()

	store, err := NewStore(db)
	if err != nil {
		t.Fatalf("failed to create store: %v", err)
	}

	// 1. Test Control State
	ctrl := store.GetControlState()
	if ctrl.Mode != ModeAuto {
		t.Errorf("expected default mode AUTO, got %s", ctrl.Mode)
	}

	updatedCtrl := SystemControlState{
		Mode:            ModeManual,
		IngestPolicy:    PolicyPending,
		PollIntervalSec: 15,
		UpdatedAt:       time.Now().UTC(),
	}
	if err := store.SetControlState(updatedCtrl); err != nil {
		t.Fatalf("failed to set control state: %v", err)
	}

	fetchedCtrl := store.GetControlState()
	if fetchedCtrl.Mode != ModeManual || fetchedCtrl.IngestPolicy != PolicyPending || fetchedCtrl.PollIntervalSec != 15 {
		t.Errorf("control state mismatch: %+v", fetchedCtrl)
	}

	// 2. Test Directives Lifecycle & Deletion
	d := AxisDirective{
		ID:                 "dir_test_123",
		Source:             "test",
		Title:              "Test Directive",
		RawNote:            "Raw note content",
		TriagedInstruction: "Instruction",
		Type:               TypeCodeRefactor,
		IsExecute:          true,
		Status:             StatusQueuedForAgent,
		CreatedAt:          time.Now().UTC(),
		UpdatedAt:          time.Now().UTC(),
	}

	if err := store.SaveDirective(d); err != nil {
		t.Fatalf("failed to save directive: %v", err)
	}

	// Transition: QUEUED -> EXECUTING
	up1, err := store.UpdateStatus("dir_test_123", StatusExecuting, "Started execution")
	if err != nil || up1.Status != StatusExecuting {
		t.Fatalf("status update to EXECUTING failed: %v", err)
	}

	// Transition: EXECUTING -> COMPLETED
	up2, err := store.UpdateStatus("dir_test_123", StatusCompleted, "Build succeeded")
	if err != nil || up2.Status != StatusCompleted {
		t.Fatalf("status update to COMPLETED failed: %v", err)
	}

	// Transition: COMPLETED -> ARCHIVED
	up3, err := store.UpdateStatus("dir_test_123", StatusArchived, "Archived from TUI")
	if err != nil || up3.Status != StatusArchived {
		t.Fatalf("status update to ARCHIVED failed: %v", err)
	}

	// Deletion
	if err := store.DeleteDirective("dir_test_123"); err != nil {
		t.Fatalf("failed to delete directive: %v", err)
	}

	_, err = store.GetDirective("dir_test_123")
	if err == nil {
		t.Fatalf("expected error on deleted directive, got nil")
	}
}