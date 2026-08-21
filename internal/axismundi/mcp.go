package axismundi

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
)

type MCPHandler struct {
	engine *Engine
}

func NewMCPHandler(engine *Engine) *MCPHandler {
	return &MCPHandler{engine: engine}
}

func (h *MCPHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	var req JSONRPCRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(JSONRPCResponse{
			JSONRPC: "2.0",
			Error:   &RPCError{Code: -32700, Message: "Parse error"},
		})
		return
	}

	res := h.handleRequest(req)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(res)
}

func (h *MCPHandler) handleRequest(req JSONRPCRequest) JSONRPCResponse {
	switch req.Method {
	case "tools/list":
		return JSONRPCResponse{
			JSONRPC: "2.0",
			ID:      req.ID,
			Result: map[string]interface{}{
				"tools": []map[string]interface{}{
					{
						"name":        "axismundi_get_pending",
						"description": "Retrieve all pending [EXECUTE] directives queued for autonomous agent implementation.",
						"inputSchema": map[string]interface{}{
							"type":       "object",
							"properties": map[string]interface{}{},
						},
					},
					{
						"name":        "axismundi_acknowledge_directive",
						"description": "Acknowledge that the agent has started executing a directive (updates status to EXECUTING).",
						"inputSchema": map[string]interface{}{
							"type": "object",
							"properties": map[string]interface{}{
								"id": map[string]string{"type": "string", "description": "The directive ID"},
							},
							"required": []string{"id"},
						},
					},
					{
						"name":        "axismundi_complete_directive",
						"description": "Mark an Axis Mundi directive as COMPLETED with build/test execution logs.",
						"inputSchema": map[string]interface{}{
							"type": "object",
							"properties": map[string]interface{}{
								"id":            map[string]string{"type": "string", "description": "The directive ID"},
								"execution_log": map[string]string{"type": "string", "description": "Summary of build and verification actions"},
							},
							"required": []string{"id"},
						},
					},
					{
						"name":        "axismundi_ingest_note",
						"description": "Ingest a new note or voice transcript into the Axis Mundi Amra Core.",
						"inputSchema": map[string]interface{}{
							"type": "object",
							"properties": map[string]interface{}{
								"title":   map[string]string{"type": "string"},
								"content": map[string]string{"type": "string"},
								"source":  map[string]string{"type": "string"},
							},
							"required": []string{"content"},
						},
					},
					{
						"name":        "axismundi_get_mode",
						"description": "Get current Axis Mundi operational mode (AUTO vs MANUAL) and Auto-Ingest Policy (EXECUTE vs PENDING).",
						"inputSchema": map[string]interface{}{
							"type":       "object",
							"properties": map[string]interface{}{},
						},
					},
					{
						"name":        "axismundi_set_mode",
						"description": "Set Axis Mundi operational mode (AUTO/MANUAL), Ingest Policy (EXECUTE/PENDING), and Polling Interval.",
						"inputSchema": map[string]interface{}{
							"type": "object",
							"properties": map[string]interface{}{
								"mode":              map[string]string{"type": "string", "enum": "AUTO, MANUAL"},
								"ingest_policy":     map[string]string{"type": "string", "enum": "EXECUTE, PENDING"},
								"poll_interval_sec": map[string]string{"type": "integer", "description": "Polling frequency in seconds (e.g. 10, 30, 60)"},
							},
						},
					},
					{
						"name":        "axismundi_delete_directive",
						"description": "Permanently delete an Axis Mundi directive by ID.",
						"inputSchema": map[string]interface{}{
							"type": "object",
							"properties": map[string]interface{}{
								"id": map[string]string{"type": "string", "description": "Directive ID"},
							},
							"required": []string{"id"},
						},
					},
					{
						"name":        "axismundi_send_notification",
						"description": "Dispatch a curated system notification to Justin at echosh-labs.com via Google Chat return loop.",
						"inputSchema": map[string]interface{}{
							"type": "object",
							"properties": map[string]interface{}{
								"title":   map[string]string{"type": "string", "description": "Notification title"},
								"message": map[string]string{"type": "string", "description": "Notification body / summary"},
								"event":   map[string]string{"type": "string", "description": "Event type: EXECUTION_COMPLETED, CRITICAL_ALERT, or TEST_PING"},
							},
							"required": []string{"title", "message"},
						},
					},
				},
			},
		}

	case "tools/call":
		toolName, _ := req.Params["name"].(string)
		args, _ := req.Params["arguments"].(map[string]interface{})

		switch toolName {
		case "axismundi_get_pending":
			pending, err := h.engine.store.GetPendingExecuteDirectives()
			if err != nil {
				return JSONRPCResponse{
					JSONRPC: "2.0",
					ID:      req.ID,
					Error:   &RPCError{Code: -32603, Message: err.Error()},
				}
			}
			return JSONRPCResponse{
				JSONRPC: "2.0",
				ID:      req.ID,
				Result: map[string]interface{}{
					"directives": pending,
					"count":      len(pending),
				},
			}

		case "axismundi_acknowledge_directive":
			id, _ := args["id"].(string)
			if id == "" {
				return JSONRPCResponse{
					JSONRPC: "2.0",
					ID:      req.ID,
					Error:   &RPCError{Code: -32602, Message: "Missing id argument"},
				}
			}
			d, err := h.engine.store.UpdateStatus(id, StatusExecuting, "[AGENT] Picked up directive for execution.")
			if err != nil {
				return JSONRPCResponse{
					JSONRPC: "2.0",
					ID:      req.ID,
					Error:   &RPCError{Code: -32603, Message: err.Error()},
				}
			}
			if h.engine.hub != nil {
				h.engine.hub.Broadcast("axismundi_status_changed", d)
			}
			return JSONRPCResponse{
				JSONRPC: "2.0",
				ID:      req.ID,
				Result:  d,
			}

		case "axismundi_complete_directive":
			id, _ := args["id"].(string)
			logText, _ := args["execution_log"].(string)
			if id == "" {
				return JSONRPCResponse{
					JSONRPC: "2.0",
					ID:      req.ID,
					Error:   &RPCError{Code: -32602, Message: "Missing id argument"},
				}
			}
			d, err := h.engine.UpdateDirectiveStatus(id, StatusCompleted, logText)
			if err != nil {
				return JSONRPCResponse{
					JSONRPC: "2.0",
					ID:      req.ID,
					Error:   &RPCError{Code: -32603, Message: err.Error()},
				}
			}
			return JSONRPCResponse{
				JSONRPC: "2.0",
				ID:      req.ID,
				Result:  d,
			}

		case "axismundi_ingest_note":
			content, _ := args["content"].(string)
			title, _ := args["title"].(string)
			source, _ := args["source"].(string)

			d, err := h.engine.IngestNote(KeepNotePayload{
				Title:   title,
				Content: content,
				Source:  source,
			})
			if err != nil {
				return JSONRPCResponse{
					JSONRPC: "2.0",
					ID:      req.ID,
					Error:   &RPCError{Code: -32603, Message: err.Error()},
				}
			}
			return JSONRPCResponse{
				JSONRPC: "2.0",
				ID:      req.ID,
				Result:  d,
			}

		case "axismundi_get_mode":
			state := h.engine.GetControlState()
			return JSONRPCResponse{
				JSONRPC: "2.0",
				ID:      req.ID,
				Result:  state,
			}

		case "axismundi_set_mode":
			modeStr, _ := args["mode"].(string)
			policyStr, _ := args["ingest_policy"].(string)
			intervalSec := 0
			if rawInt, ok := args["poll_interval_sec"].(float64); ok {
				intervalSec = int(rawInt)
			}
			updated := h.engine.SetControlState(EngineMode(modeStr), IngestPolicy(policyStr), intervalSec)
			return JSONRPCResponse{
				JSONRPC: "2.0",
				ID:      req.ID,
				Result:  updated,
			}

		case "axismundi_delete_directive":
			id, _ := args["id"].(string)
			if id == "" {
				return JSONRPCResponse{
					JSONRPC: "2.0",
					ID:      req.ID,
					Error:   &RPCError{Code: -32602, Message: "Missing id argument"},
				}
			}
			if err := h.engine.DeleteDirective(id); err != nil {
				return JSONRPCResponse{
					JSONRPC: "2.0",
					ID:      req.ID,
					Error:   &RPCError{Code: -32603, Message: err.Error()},
				}
			}
			return JSONRPCResponse{
				JSONRPC: "2.0",
				ID:      req.ID,
				Result: map[string]interface{}{
					"deleted": true,
					"id":      id,
				},
			}

		case "axismundi_send_notification":
			title, _ := args["title"].(string)
			msg, _ := args["message"].(string)
			eventStr, _ := args["event"].(string)
			if title == "" || msg == "" {
				return JSONRPCResponse{
					JSONRPC: "2.0",
					ID:      req.ID,
					Error:   &RPCError{Code: -32602, Message: "Missing title or message argument"},
				}
			}
			if eventStr == "" {
				eventStr = "EXECUTION_COMPLETED"
			}
			if h.engine.notifier == nil {
				return JSONRPCResponse{
					JSONRPC: "2.0",
					ID:      req.ID,
					Error:   &RPCError{Code: -32603, Message: "Notification engine not initialized"},
				}
			}
			rec, err := h.engine.notifier.Dispatch(context.Background(), NotificationEvent(eventStr), title, msg, map[string]string{"source": "mcp_tool"})
			if err != nil {
				return JSONRPCResponse{
					JSONRPC: "2.0",
					ID:      req.ID,
					Error:   &RPCError{Code: -32603, Message: err.Error()},
				}
			}
			return JSONRPCResponse{
				JSONRPC: "2.0",
				ID:      req.ID,
				Result:  rec,
			}

		default:
			return JSONRPCResponse{
				JSONRPC: "2.0",
				ID:      req.ID,
				Error:   &RPCError{Code: -32601, Message: fmt.Sprintf("Tool %s not found", toolName)},
			}
		}

	default:
		return JSONRPCResponse{
			JSONRPC: "2.0",
			ID:      req.ID,
			Error:   &RPCError{Code: -32601, Message: fmt.Sprintf("Method %s not found", req.Method)},
		}
	}
}