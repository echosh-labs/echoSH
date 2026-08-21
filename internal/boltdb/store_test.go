package boltdb

import (
	"path/filepath"
	"testing"
)

func TestBoltDBLifecycleAndSeeding(t *testing.T) {
	tempDir := t.TempDir()
	dbPath := filepath.Join(tempDir, "test_mercury_context.db")

	store, err := NewStore(dbPath)
	if err != nil {
		t.Fatalf("failed to create boltdb store: %v", err)
	}
	defer store.Close()

	if err := SeedDatabase(store, "Test Foundational Axiom", ""); err != nil {
		t.Fatalf("failed to seed boltdb: %v", err)
	}

	// 1. Test Foundational Statement Retrieval
	stmt, err := store.GetFoundationalStatement()
	if err != nil {
		t.Fatalf("failed to get foundational statement: %v", err)
	}
	if stmt == nil || stmt.Title == "" {
		t.Fatalf("expected valid statement, got %+v", stmt)
	}

	// 2. Test Context Node Listing
	nodes, err := store.ListContextNodes("")
	if err != nil {
		t.Fatalf("failed to list context nodes: %v", err)
	}
	if len(nodes) == 0 {
		t.Fatalf("expected non-empty context nodes list")
	}

	// 3. Test Context Node Detail with Relatives
	node, err := store.GetContextNodeWithRelatives("node:mercury-core")
	if err != nil {
		t.Fatalf("failed to get node node:mercury-core: %v", err)
	}
	if node == nil || node.Key != "node:mercury-core" {
		t.Fatalf("expected node node:mercury-core, got %+v", node)
	}
	if len(node.RelativeContext) == 0 {
		t.Errorf("expected resolved relative context for mercury-budha")
	}

	// 4. Test Daily Oracle Retrieval
	oracle, err := store.GetDailyOracle()
	if err != nil {
		t.Fatalf("failed to get daily oracle: %v", err)
	}
	if oracle == nil || oracle.Theme == "" {
		t.Fatalf("expected valid oracle contemplation, got %+v", oracle)
	}

	// 5. Test Category Filtering
	alchemyNodes, err := store.ListContextNodes("alchemy")
	if err != nil {
		t.Fatalf("failed to filter by category alchemy: %v", err)
	}
	for _, n := range alchemyNodes {
		if n.Category != "alchemy" {
			t.Errorf("expected category alchemy, got %s", n.Category)
		}
	}
}