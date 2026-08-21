package axismundi

import (
	"context"
	"testing"
)

func TestWorkspaceStandbyMode(t *testing.T) {
	ws := NewWorkspaceService(context.Background())
	status := ws.GetStatus()

	if status.Mode != "STANDBY_LOCAL" {
		t.Errorf("expected mode STANDBY_LOCAL, got %s", status.Mode)
	}
	if len(status.Scopes) < 3 {
		t.Errorf("expected at least 3 scopes, got %d", len(status.Scopes))
	}
}

func TestKeepSyncerLifecycle(t *testing.T) {
	ws := NewWorkspaceService(context.Background())
	engine := NewEngine(nil, nil, ws)

	syncer := NewKeepSyncer(ws, engine, 0)
	syncer.Start()
	// Starting again should be safe (idempotent)
	syncer.Start()

	count, err := syncer.Sync(context.Background())
	if err != nil {
		t.Errorf("expected no error on standby sync, got %v", err)
	}
	if count != 0 {
		t.Errorf("expected 0 notes on standby sync, got %d", count)
	}

	syncer.Stop()
}