package axismundi

import (
	"context"
	"fmt"
	"log"
	"os"
	"sync"
	"time"

	admin "google.golang.org/api/admin/directory/v1"
	docs "google.golang.org/api/docs/v1"
	drive "google.golang.org/api/drive/v3"
	"google.golang.org/api/impersonate"
	keep "google.golang.org/api/keep/v1"
	"google.golang.org/api/option"
	sheets "google.golang.org/api/sheets/v4"
)

type WorkspaceStatus struct {
	Connected      bool      `json:"connected"`
	Mode           string    `json:"mode"` // "LIVE_GCP" or "STANDBY_LOCAL"
	ServiceAccount string    `json:"service_account,omitempty"`
	UserEmail      string    `json:"user_email,omitempty"`
	Scopes         []string  `json:"scopes"`
	LastSync       time.Time `json:"last_sync"`
	ItemsIndexed   int       `json:"items_indexed"`
}

type WorkspaceService struct {
	mu           sync.RWMutex
	keepService  *keep.Service
	docsService  *docs.Service
	sheetsSvc    *sheets.Service
	driveService *drive.Service
	adminService *admin.Service

	status WorkspaceStatus
}

// NewWorkspaceService initializes Google Workspace APIs using Service Account Impersonation or local fallback.
func NewWorkspaceService(ctx context.Context) *WorkspaceService {
	ws := &WorkspaceService{
		status: WorkspaceStatus{
			Connected: false,
			Mode:      "STANDBY_LOCAL",
			Scopes: []string{
				keep.KeepScope,
				docs.DocumentsScope,
				sheets.SpreadsheetsScope,
				drive.DriveReadonlyScope,
				admin.AdminDirectoryUserReadonlyScope,
			},
			LastSync: time.Now().UTC(),
		},
	}

	saEmail := os.Getenv("SERVICE_ACCOUNT_EMAIL")
	adminEmail := os.Getenv("ADMIN_EMAIL")
	userEmail := os.Getenv("USER_EMAIL")
	if userEmail == "" {
		userEmail = adminEmail
	}

	if saEmail != "" && userEmail != "" {
		log.Printf("[Workspace] Initializing GCP Service Account Impersonation (%s -> %s)...", saEmail, userEmail)

		ts, err := impersonate.CredentialsTokenSource(ctx, impersonate.CredentialsConfig{
			TargetPrincipal: saEmail,
			Subject:         userEmail,
			Scopes:          ws.status.Scopes,
		})

		if err != nil {
			log.Printf("[Workspace] Impersonation notice (falling back to standby): %v", err)
			return ws
		}

		keepSvc, err := keep.NewService(ctx, option.WithTokenSource(ts))
		if err == nil {
			ws.keepService = keepSvc
		}

		docsSvc, err := docs.NewService(ctx, option.WithTokenSource(ts))
		if err == nil {
			ws.docsService = docsSvc
		}

		sheetsSvc, err := sheets.NewService(ctx, option.WithTokenSource(ts))
		if err == nil {
			ws.sheetsSvc = sheetsSvc
		}

		driveSvc, err := drive.NewService(ctx, option.WithTokenSource(ts))
		if err == nil {
			ws.driveService = driveSvc
		}

		ws.status.Connected = true
		ws.status.Mode = "LIVE_GCP"
		ws.status.ServiceAccount = saEmail
		ws.status.UserEmail = userEmail
		log.Printf("[Workspace] Successfully connected to live Google Workspace APIs for %s", userEmail)
	} else {
		log.Printf("[Workspace] Google Workspace credentials not supplied in env. Running in STANDBY_LOCAL mode.")
	}

	return ws
}

// GetStatus returns the current Google Workspace authentication and telemetry status.
func (w *WorkspaceService) GetStatus() WorkspaceStatus {
	w.mu.RLock()
	defer w.mu.RUnlock()
	return w.status
}

// ListGoogleKeepNotes fetches live notes from Google Keep API if authenticated.
func (w *WorkspaceService) ListGoogleKeepNotes(ctx context.Context) ([]KeepNotePayload, error) {
	w.mu.RLock()
	svc := w.keepService
	w.mu.RUnlock()

	if svc == nil {
		return nil, fmt.Errorf("google keep API service is in standby/local mode")
	}

	resp, err := svc.Notes.List().PageSize(50).Context(ctx).Do()
	if err != nil {
		return nil, fmt.Errorf("failed to query google keep API: %w", err)
	}

	var payloads []KeepNotePayload
	for _, n := range resp.Notes {
		bodyText := ""
		if n.Body != nil && n.Body.Text != nil {
			bodyText = n.Body.Text.Text
		}

		// Handle list items if note is a checklist
		if n.Body != nil && n.Body.List != nil {
			var listItems []string
			for _, item := range n.Body.List.ListItems {
				if item.Text != nil {
					listItems = append(listItems, item.Text.Text)
				}
			}
			if len(listItems) > 0 {
				bodyText += "\n" + fmt.Sprintf("[List: %s]", listItems)
			}
		}

		payloads = append(payloads, KeepNotePayload{
			Title:     n.Title,
			Content:   bodyText,
			Source:    "google_keep_api",
			Timestamp: time.Now().UTC(),
		})
	}

	w.mu.Lock()
	w.status.LastSync = time.Now().UTC()
	w.status.ItemsIndexed = len(payloads)
	w.mu.Unlock()

	return payloads, nil
}