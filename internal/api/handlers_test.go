package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"

	"mercury-dasha/internal/boltdb"
	"mercury-dasha/internal/sse"
)

func setupTestRouter(t *testing.T) (*Handler, http.Handler) {
	tempDir := t.TempDir()
	dbPath := filepath.Join(tempDir, "test_api_context.db")

	store, err := boltdb.NewStore(dbPath)
	if err != nil {
		t.Fatalf("failed to create test store: %v", err)
	}
	_ = boltdb.SeedDatabase(store, "Embedded Axiom Test", "")

	hub := sse.NewHub()
	go hub.Run()

	h := NewHandler(store, nil, hub, "Embedded Axiom Test", "")
	r := NewRouter(store, nil, hub, "Embedded Axiom Test", "")

	return h, r
}

func TestAPIHandlers(t *testing.T) {
	_, router := setupTestRouter(t)

	tests := []struct {
		name       string
		path       string
		method     string
		expectCode int
	}{
		{"Health Check", "/api/health", "GET", http.StatusOK},
		{"Statement", "/api/statement", "GET", http.StatusOK},
		{"Manifesto", "/api/manifesto", "GET", http.StatusOK},
		{"Foundations Narrative", "/api/foundations/narrative", "GET", http.StatusOK},
		{"Transition Threshold", "/api/transition/threshold", "GET", http.StatusOK},
		{"Audio Presets", "/api/audio/presets", "GET", http.StatusOK},
		{"Dasha Overview", "/api/dasha", "GET", http.StatusOK},
		{"Nakshatras", "/api/nakshatras", "GET", http.StatusOK},
		{"Alchemical Principles", "/api/alchemical", "GET", http.StatusOK},
		{"Daily Oracle", "/api/oracle/daily", "GET", http.StatusOK},
		{"Context Nodes", "/api/context", "GET", http.StatusOK},
		{"Context Node Detail", "/api/context/node:mercury-core", "GET", http.StatusOK},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(tt.method, tt.path, nil)
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			if w.Code != tt.expectCode {
				t.Errorf("expected status %d for %s, got %d. Body: %s", tt.expectCode, tt.path, w.Code, w.Body.String())
			}

			// Validate JSON output
			var js map[string]interface{}
			var jsList []interface{}
			if err := json.Unmarshal(w.Body.Bytes(), &js); err != nil {
				if errList := json.Unmarshal(w.Body.Bytes(), &jsList); errList != nil {
					t.Errorf("response for %s is not valid JSON: %s", tt.path, w.Body.String())
				}
			}
		})
	}
}