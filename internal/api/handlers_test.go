package api

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"

	"github.com/go-chi/chi/v5"

	"mercury-dasha/internal/axismundi"
	"mercury-dasha/internal/boltdb"
	"mercury-dasha/internal/sse"
)

func setupTestRouter(t *testing.T) (*Handler, *chi.Mux) {
	tempDir := t.TempDir()
	dbPath := filepath.Join(tempDir, "test.db")
	store, err := boltdb.NewStore(dbPath)
	if err != nil {
		t.Fatalf("failed to create test store: %v", err)
	}
	_ = boltdb.SeedDatabase(store, "Embedded Axiom Test", "")

	hub := sse.NewHub()
	go hub.Run()

	axisStore, err := axismundi.NewStore(store.DB())
	if err != nil {
		t.Fatalf("failed to create axis store: %v", err)
	}
	axisEngine := axismundi.NewEngine(axisStore, hub)

	h := NewHandler(store, nil, hub, "Embedded Axiom Test", "")
	r := NewRouter(store, nil, hub, axisEngine, "Embedded Axiom Test", "")

	return h, r
}

func TestAPIHandlers(t *testing.T) {
	_, router := setupTestRouter(t)

	tests := []struct {
		name       string
		path       string
		method     string
		body       string
		expectCode int
	}{
		{"Health Check", "/api/health", "GET", "", http.StatusOK},
		{"Statement", "/api/statement", "GET", "", http.StatusOK},
		{"Manifesto", "/api/manifesto", "GET", "", http.StatusOK},
		{"Foundations Narrative", "/api/foundations/narrative", "GET", "", http.StatusOK},
		{"Transition Threshold", "/api/transition/threshold", "GET", "", http.StatusOK},
		{"Audio Presets", "/api/audio/presets", "GET", "", http.StatusOK},
		{"Dasha Overview", "/api/dasha", "GET", "", http.StatusOK},
		{"Nakshatras", "/api/nakshatras", "GET", "", http.StatusOK},
		{"Alchemical Principles", "/api/alchemical", "GET", "", http.StatusOK},
		{"Daily Oracle", "/api/oracle/daily", "GET", "", http.StatusOK},
		{"Context Nodes", "/api/context", "GET", "", http.StatusOK},
		{"Context Node Detail", "/api/context/node:mercury-core", "GET", "", http.StatusOK},
		{"Axis Mundi Directives", "/api/axismundi/directives", "GET", "", http.StatusOK},
		{"Axis Mundi Pending", "/api/axismundi/directives/pending", "GET", "", http.StatusOK},
		{"Axis Mundi Ingest", "/api/axismundi/ingest", "POST", `{"title":"[EXECUTE] Test Directive","content":"Rebuild pipeline"}`, http.StatusCreated},
		{"MCP Protocol Tools List", "/api/mcp", "POST", `{"jsonrpc":"2.0","id":1,"method":"tools/list"}`, http.StatusOK},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var req *http.Request
			if tt.body != "" {
				req = httptest.NewRequest(tt.method, tt.path, bytes.NewBufferString(tt.body))
				req.Header.Set("Content-Type", "application/json")
			} else {
				req = httptest.NewRequest(tt.method, tt.path, nil)
			}
			rec := httptest.NewRecorder()

			router.ServeHTTP(rec, req)

			if rec.Code != tt.expectCode {
				t.Errorf("expected status %d, got %d for %s", tt.expectCode, rec.Code, tt.path)
			}
		})
	}
}