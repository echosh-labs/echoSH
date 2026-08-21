package axismundi

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"

	bolt "go.etcd.io/bbolt"
)

func TestMCPServerToolsAndExecution(t *testing.T) {
	tempDir := t.TempDir()
	dbPath := filepath.Join(tempDir, "test_mcp.db")
	db, err := bolt.Open(dbPath, 0600, nil)
	if err != nil {
		t.Fatalf("failed to open test boltdb: %v", err)
	}
	defer db.Close()

	store, err := NewStore(db)
	if err != nil {
		t.Fatalf("failed to create store: %v", err)
	}

	engine := NewEngine(store, nil, nil)
	handler := NewMCPHandler(engine)

	// 1. Test tools/list
	reqBody, _ := json.Marshal(JSONRPCRequest{
		JSONRPC: "2.0",
		ID:      1,
		Method:  "tools/list",
	})
	req := httptest.NewRequest(http.MethodPost, "/api/mcp", bytes.NewReader(reqBody))
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected HTTP 200, got %d", rec.Code)
	}

	var listRes JSONRPCResponse
	if err := json.NewDecoder(rec.Body).Decode(&listRes); err != nil {
		t.Fatalf("failed to decode tools/list response: %v", err)
	}
	resultMap, ok := listRes.Result.(map[string]interface{})
	if !ok || resultMap["tools"] == nil {
		t.Fatalf("expected tools in response, got %v", listRes.Result)
	}

	// 2. Ingest an [EXECUTE] note via MCP
	ingestReq, _ := json.Marshal(JSONRPCRequest{
		JSONRPC: "2.0",
		ID:      2,
		Method:  "tools/call",
		Params: map[string]interface{}{
			"name": "axismundi_ingest_note",
			"arguments": map[string]interface{}{
				"title":   "[EXECUTE] Test audio engine build",
				"content": "Execute make test and compile single binary #amra-exec",
				"source":  "mcp_test",
			},
		},
	})
	req = httptest.NewRequest(http.MethodPost, "/api/mcp", bytes.NewReader(ingestReq))
	rec = httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected HTTP 200 on ingest, got %d", rec.Code)
	}

	// 3. Retrieve Pending Directives via MCP
	pendingReq, _ := json.Marshal(JSONRPCRequest{
		JSONRPC: "2.0",
		ID:      3,
		Method:  "tools/call",
		Params: map[string]interface{}{
			"name":      "axismundi_get_pending",
			"arguments": map[string]interface{}{},
		},
	})
	req = httptest.NewRequest(http.MethodPost, "/api/mcp", bytes.NewReader(pendingReq))
	rec = httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	var pendingRes JSONRPCResponse
	_ = json.NewDecoder(rec.Body).Decode(&pendingRes)
	pendingMap, _ := pendingRes.Result.(map[string]interface{})
	count, _ := pendingMap["count"].(float64)
	if count < 1 {
		t.Fatalf("expected at least 1 pending directive, got %v", count)
	}
}