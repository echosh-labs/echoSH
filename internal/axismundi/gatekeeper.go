package axismundi

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"strings"
	"time"
)

// TriageNote deterministically analyzes an incoming Google Keep note with default PENDING policy.
func TriageNote(payload KeepNotePayload) AxisDirective {
	return TriageNoteWithPolicy(payload, PolicyPending)
}

// TriageNoteWithPolicy analyzes an incoming note deterministically according to the active Ingestion Policy.
func TriageNoteWithPolicy(payload KeepNotePayload, policy IngestPolicy) AxisDirective {
	now := time.Now().UTC()
	if payload.Timestamp.IsZero() {
		payload.Timestamp = now
	}

	rawText := strings.TrimSpace(payload.Title + "\n" + payload.Content)
	upperText := strings.ToUpper(rawText)

	// Check for explicit execution triggers
	isExecute := false
	for _, tag := range payload.Tags {
		t := strings.ToUpper(tag)
		if t == "EXECUTE" || t == "AMRA-EXEC" || t == "BUILD" || t == "EXEC" {
			isExecute = true
			break
		}
	}

	if !isExecute {
		if strings.Contains(upperText, "[EXECUTE]") ||
			strings.Contains(upperText, "EXECUTE:") ||
			strings.Contains(upperText, "!EXEC") ||
			strings.Contains(upperText, "#AMRA-EXEC") ||
			strings.Contains(upperText, "[BUILD]") ||
			strings.HasPrefix(upperText, "EXEC ") {
			isExecute = true
		}
	}

	// If the global policy is PolicyExecute, automatically promote incoming notes unless explicitly marked draft/ignore
	if !isExecute && policy == PolicyExecute {
		if !strings.Contains(upperText, "[DRAFT]") && !strings.Contains(upperText, "[IGNORE]") && !strings.Contains(upperText, "#DRAFT") {
			isExecute = true
		}
	}

	// Phonetic & Semantic Text Triage (voice cleanup)
	cleanedInstruction := cleanVoiceTranscripts(rawText)

	// Classify Directive Type
	directiveType := TypePassiveContext
	status := StatusPassiveContext

	if isExecute {
		status = StatusQueuedForAgent
		lower := strings.ToLower(rawText)
		if strings.Contains(lower, "build") || strings.Contains(lower, "make") || strings.Contains(lower, "test") {
			directiveType = TypeBuildRequest
		} else if strings.Contains(lower, "story") || strings.Contains(lower, "scene") || strings.Contains(lower, "image") {
			directiveType = TypeStoryboardUpdate
		} else if strings.Contains(lower, "manifesto") || strings.Contains(lower, "axiom") || strings.Contains(lower, "philosophy") {
			directiveType = TypeManifestoDirective
		} else {
			directiveType = TypeCodeRefactor
		}
	}

	title := payload.Title
	if title == "" {
		lines := strings.Split(rawText, "\n")
		if len(lines) > 0 && len(lines[0]) > 0 {
			title = lines[0]
			if len(title) > 60 {
				title = title[:57] + "..."
			}
		} else {
			title = "Untitled Note"
		}
	}

	source := payload.Source
	if source == "" {
		source = "google_keep"
	}

	return AxisDirective{
		ID:                 generateDirectiveID(),
		Source:             source,
		Title:              title,
		RawNote:            rawText,
		TriagedInstruction: cleanedInstruction,
		Type:               directiveType,
		IsExecute:          isExecute,
		Status:             status,
		CreatedAt:          now,
		UpdatedAt:          now,
	}
}

// cleanVoiceTranscripts fixes common phonetic voice-to-text inaccuracies.
func cleanVoiceTranscripts(input string) string {
	cleaned := input
	replacements := map[string]string{
		"Sorry board": "Storyboard",
		"sorry board": "storyboard",
		"amra core":   "Amra Core",
		"echo sh":     "echoSH",
		"Echo sh":     "echoSH",
		"axis mundi":  "Axis Mundi",
	}

	for oldStr, newStr := range replacements {
		cleaned = strings.ReplaceAll(cleaned, oldStr, newStr)
	}

	// Remove directive prefix markers for clean instruction payload
	cleaned = strings.TrimPrefix(cleaned, "[EXECUTE]")
	cleaned = strings.TrimPrefix(cleaned, "[execute]")
	cleaned = strings.TrimPrefix(cleaned, "EXECUTE:")
	cleaned = strings.TrimPrefix(cleaned, "execute:")
	cleaned = strings.TrimPrefix(cleaned, "!EXEC")
	cleaned = strings.TrimPrefix(cleaned, "[BUILD]")
	cleaned = strings.TrimPrefix(cleaned, "[build]")

	return strings.TrimSpace(cleaned)
}

func generateDirectiveID() string {
	bytes := make([]byte, 4)
	_, _ = rand.Read(bytes)
	return fmt.Sprintf("dir_%d_%s", time.Now().Unix(), hex.EncodeToString(bytes))
}