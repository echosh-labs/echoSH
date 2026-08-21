package axismundi

import "time"

type EngineMode string

const (
	ModeAuto   EngineMode = "AUTO"
	ModeManual EngineMode = "MANUAL"
)

type IngestPolicy string

const (
	PolicyPending IngestPolicy = "PENDING"
	PolicyExecute IngestPolicy = "EXECUTE"
)

type SystemControlState struct {
	Mode            EngineMode   `json:"mode"`
	IngestPolicy    IngestPolicy `json:"ingest_policy"`
	PollIntervalSec int          `json:"poll_interval_sec"`
	UpdatedAt       time.Time    `json:"updated_at"`
}

type DirectiveType string

const (
	TypeBuildRequest       DirectiveType = "BUILD_REQUEST"
	TypeStoryboardUpdate   DirectiveType = "STORYBOARD_UPDATE"
	TypeCodeRefactor       DirectiveType = "CODE_REFACTOR"
	TypeManifestoDirective DirectiveType = "MANIFESTO_DIRECTIVE"
	TypePassiveContext     DirectiveType = "PASSIVE_CONTEXT"
)

type DirectiveStatus string

const (
	StatusPending        DirectiveStatus = "PENDING"
	StatusPassiveContext DirectiveStatus = "PASSIVE_CONTEXT"
	StatusQueuedForAgent DirectiveStatus = "QUEUED_FOR_AGENT"
	StatusExecuting      DirectiveStatus = "EXECUTING"
	StatusBuilt          DirectiveStatus = "BUILT"
	StatusCompleted      DirectiveStatus = "COMPLETED"
	StatusArchived       DirectiveStatus = "ARCHIVED"
	StatusDismissed      DirectiveStatus = "DISMISSED"
	StatusFailed         DirectiveStatus = "FAILED"
)

// KeepNotePayload represents an incoming Google Keep note or webhook payload.
type KeepNotePayload struct {
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Tags      []string  `json:"tags,omitempty"`
	Source    string    `json:"source,omitempty"` // "google_keep_api", "voice", "cli", "mcp"
	Timestamp time.Time `json:"timestamp,omitempty"`
}

// AxisDirective represents a fully triaged and tracked unit of intent in Amra Core.
type AxisDirective struct {
	ID                 string          `json:"id"`
	Source             string          `json:"source"`
	Title              string          `json:"title"`
	RawNote            string          `json:"raw_note"`
	TriagedInstruction string          `json:"triaged_instruction"`
	Type               DirectiveType   `json:"type"`
	IsExecute          bool            `json:"is_execute"`
	Status             DirectiveStatus `json:"status"`
	ExecutionLog       string          `json:"execution_log,omitempty"`
	CreatedAt          time.Time       `json:"created_at"`
	UpdatedAt          time.Time       `json:"updated_at"`
}

// MCP JSON-RPC 2.0 Structures
type JSONRPCRequest struct {
	JSONRPC string                 `json:"jsonrpc"`
	ID      interface{}            `json:"id"`
	Method  string                 `json:"method"`
	Params  map[string]interface{} `json:"params,omitempty"`
}

type JSONRPCResponse struct {
	JSONRPC string      `json:"jsonrpc"`
	ID      interface{} `json:"id"`
	Result  interface{} `json:"result,omitempty"`
	Error   *RPCError   `json:"error,omitempty"`
}

type RPCError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}