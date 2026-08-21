package axismundi

import (
	"testing"
)

func TestGatekeeperPassiveNotes(t *testing.T) {
	passivePayload := KeepNotePayload{
		Title:   "Reflections on Hermes Trismegistus",
		Content: "Contemplating the Emerald Tablet and the tripartite nature of reality.",
		Source:  "google_keep",
	}

	directive := TriageNote(passivePayload)

	if directive.IsExecute {
		t.Errorf("Expected IsExecute to be false for passive note, got true")
	}
	if directive.Status != StatusPassiveContext {
		t.Errorf("Expected status %s, got %s", StatusPassiveContext, directive.Status)
	}
	if directive.Type != TypePassiveContext {
		t.Errorf("Expected type %s, got %s", TypePassiveContext, directive.Type)
	}
}

func TestGatekeeperExecuteDirectives(t *testing.T) {
	tests := []struct {
		name         string
		payload      KeepNotePayload
		expectedType DirectiveType
	}{
		{
			name: "Build Request Tagged",
			payload: KeepNotePayload{
				Title:   "[EXECUTE] Rebuild and run make test",
				Content: "Compile single binary with updated audio presets #amra-exec",
				Tags:    []string{"EXECUTE", "AMRA"},
			},
			expectedType: TypeBuildRequest,
		},
		{
			name: "Storyboard Update Voice Note",
			payload: KeepNotePayload{
				Title:   "EXECUTE: Sorry board upgrade",
				Content: "Generate new foundations scene image for Intuition stage",
			},
			expectedType: TypeStoryboardUpdate,
		},
		{
			name: "Code Refactor Directive",
			payload: KeepNotePayload{
				Title:   "!EXEC Clean up typescript components",
				Content: "Refactor page layout and prune unused styles",
			},
			expectedType: TypeCodeRefactor,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			directive := TriageNote(tc.payload)
			if !directive.IsExecute {
				t.Fatalf("Expected IsExecute to be true for %s", tc.name)
			}
			if directive.Status != StatusQueuedForAgent {
				t.Errorf("Expected status %s, got %s", StatusQueuedForAgent, directive.Status)
			}
			if directive.Type != tc.expectedType {
				t.Errorf("Expected type %s, got %s", tc.expectedType, directive.Type)
			}
		})
	}
}

func TestVoiceTranscriptionCleanup(t *testing.T) {
	payload := KeepNotePayload{
		Title:   "EXECUTE: Sorry board for amra core",
		Content: "Audio engine built by echo sh",
	}

	directive := TriageNote(payload)
	if directive.TriagedInstruction != "Storyboard for Amra Core\nAudio engine built by echoSH" {
		t.Errorf("Voice cleanup mismatch: got %q", directive.TriagedInstruction)
	}
}