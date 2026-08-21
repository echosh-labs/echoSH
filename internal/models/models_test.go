package models

import (
	"encoding/json"
	"testing"
	"time"
)

func TestModelSerialization(t *testing.T) {
	stage := FoundationsStage{
		ID:                  "foundations-stage-1",
		StageNumber:         1,
		Title:               "Intuition: The Inner Staircase",
		Subtitle:            "The Violet Threshold",
		Narrative:           "Deep inner guidance.",
		AestheticTheme:      "Cybernetic glow",
		ChakraColor:         "#8b5cf6",
		FrequencyHz:         432.0,
		HarmonicBlueprintID: "intuition-violet-drone",
		CreatedAt:           time.Now(),
	}

	data, err := json.Marshal(stage)
	if err != nil {
		t.Fatalf("failed to marshal FoundationsStage: %v", err)
	}

	var unmarshaled FoundationsStage
	if err := json.Unmarshal(data, &unmarshaled); err != nil {
		t.Fatalf("failed to unmarshal FoundationsStage: %v", err)
	}

	if unmarshaled.FrequencyHz != 432.0 || unmarshaled.StageNumber != 1 {
		t.Errorf("unmarshaled mismatch: got %+v", unmarshaled)
	}

	manifesto := ManifestoSection{
		ID:            "manifesto-section-1",
		SectionNumber: 1,
		SectionTitle:  "The Primordial Axiom",
		LatinMaxim:    "Transmutatio Animae",
		BodyContent:   "Consciousness as transmutation.",
		CreatedAt:     time.Now(),
	}

	mBytes, err := json.Marshal(manifesto)
	if err != nil {
		t.Fatalf("failed to marshal ManifestoSection: %v", err)
	}

	var unmarshaledM ManifestoSection
	if err := json.Unmarshal(mBytes, &unmarshaledM); err != nil {
		t.Fatalf("failed to unmarshal ManifestoSection: %v", err)
	}

	if unmarshaledM.LatinMaxim != "Transmutatio Animae" {
		t.Errorf("latin maxim mismatch: got %s", unmarshaledM.LatinMaxim)
	}
}