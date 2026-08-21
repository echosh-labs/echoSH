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
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type WorkspaceStatus struct {
	Connected      bool      `json:"connected"`
	Mode           string    `json:"mode"` // "LIVE_GCP" or "STANDBY_LOCAL"
	AuthMethod     string    `json:"auth_method,omitempty"` // "SERVICE_ACCOUNT_KEY_DWD" or "IAM_IMPERSONATION"
	ServiceAccount string    `json:"service_account,omitempty"`
	UserEmail      string    `json:"user_email,omitempty"`
	Scopes         []string  `json:"scopes"`
	LastSync       time.Time `json:"last_sync"`
	ItemsIndexed   int       `json:"items_indexed"`
	LastError      string    `json:"last_error,omitempty"`
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

// NewWorkspaceService initializes Google Workspace APIs using Service Account Key with DWD or IAM Impersonation.
func NewWorkspaceService(ctx context.Context) *WorkspaceService {
	scopes := []string{
		keep.KeepScope,
		docs.DocumentsScope,
		sheets.SpreadsheetsScope,
		drive.DriveReadonlyScope,
		admin.AdminDirectoryUserReadonlyScope,
	}

	ws := &WorkspaceService{
		status: WorkspaceStatus{
			Connected: false,
			Mode:      "STANDBY_LOCAL",
			Scopes:    scopes,
			LastSync:  time.Now().UTC(),
		},
	}

	saEmail := os.Getenv("SERVICE_ACCOUNT_EMAIL")
	adminEmail := os.Getenv("ADMIN_EMAIL")
	userEmail := os.Getenv("USER_EMAIL")
	if userEmail == "" {
		userEmail = adminEmail
	}
	credsPath := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS")
	if credsPath == "" {
		if _, err := os.Stat(".service-account.json"); err == nil {
			credsPath = ".service-account.json"
		}
	}

	var ts oauth2.TokenSource
	var authMethod string
	var err error

	// Strategy A: Service Account JSON Key File with Domain-Wide Delegation (DWD)
	if credsPath != "" {
		if saData, readErr := os.ReadFile(credsPath); readErr == nil {
			jwtConfig, jwtErr := google.JWTConfigFromJSON(saData, scopes...)
			if jwtErr == nil {
				if userEmail != "" {
					jwtConfig.Subject = userEmail
				}
				ts = jwtConfig.TokenSource(ctx)
				authMethod = "SERVICE_ACCOUNT_KEY_DWD"
				log.Printf("[Workspace] Authenticated via Service Account Key file %s with Subject: %s", credsPath, userEmail)
			}
		}
	}

	// Strategy B: IAM Service Account Impersonation (fallback)
	if ts == nil && saEmail != "" && userEmail != "" {
		ts, err = impersonate.CredentialsTokenSource(ctx, impersonate.CredentialsConfig{
			TargetPrincipal: saEmail,
			Subject:         userEmail,
			Scopes:          scopes,
		})
		if err == nil {
			authMethod = "IAM_IMPERSONATION"
			log.Printf("[Workspace] Authenticated via IAM Impersonation (%s -> %s)", saEmail, userEmail)
		}
	}

	if ts != nil {
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
		ws.status.AuthMethod = authMethod
		ws.status.ServiceAccount = saEmail
		ws.status.UserEmail = userEmail
		log.Printf("[Workspace] Successfully connected to live Google Workspace APIs for %s", userEmail)
	} else {
		log.Printf("[Workspace] Google Workspace credentials not active. Running in STANDBY_LOCAL mode.")
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
		w.mu.Lock()
		w.status.LastError = err.Error()
		w.mu.Unlock()
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
	w.status.LastError = ""
	w.mu.Unlock()

	return payloads, nil
}