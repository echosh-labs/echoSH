package api

import (
	"net/http"
	"os"
	"strings"

	"mercury-dasha/internal/models"
)

func (h *Handler) HealthHandler(w http.ResponseWriter, r *http.Request) {
	pgStatus := "disconnected"
	if h.pgDB != nil && h.pgDB.IsAlive() {
		pgStatus = "connected (primary relational backbone)"
	}

	jsonResponse(w, http.StatusOK, map[string]interface{}{
		"status":     "ok",
		"postgres":   pgStatus,
		"boltdb":     "active (contextual graph & oracle)",
		"sse_stream": "active (/api/stream/events)",
		"embedded":   "active",
		"project":    "Mercury Dasha",
		"author":     "Justin Andrew Wood",
		"version":    "2.3.0",
		"service":    "Go Unified Engine",
	})
}

// StatementHandler returns foundational axiom from PostgreSQL first, then BoltDB, then embedded memory
func (h *Handler) StatementHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	if h.pgRepo != nil {
		if stmt, err := h.pgRepo.GetFoundationalStatement(ctx); err == nil && stmt != nil {
			jsonResponse(w, http.StatusOK, stmt)
			return
		}
	}

	if stmt, err := h.store.GetFoundationalStatement(); err == nil && stmt != nil {
		jsonResponse(w, http.StatusOK, stmt)
		return
	}

	statementText := strings.TrimSpace(h.embeddedStmt)
	if h.sourceFile != "" {
		if rawText, fileErr := os.ReadFile(h.sourceFile); fileErr == nil && len(rawText) > 0 {
			statementText = strings.TrimSpace(string(rawText))
		}
	}
	jsonResponse(w, http.StatusOK, map[string]interface{}{
		"id":        "mercury-foundational-root",
		"title":     "The Foundational Axiom of Mercury",
		"author":    "Justin Andrew Wood",
		"statement": statementText,
		"source":    "embedded memory",
	})
}

func (h *Handler) StatementRawHandler(w http.ResponseWriter, r *http.Request) {
	if h.sourceFile != "" {
		if rawText, err := os.ReadFile(h.sourceFile); err == nil && len(rawText) > 0 {
			w.Header().Set("Content-Type", "text/plain; charset=utf-8")
			_, _ = w.Write(rawText)
			return
		}
	}
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	_, _ = w.Write([]byte(h.embeddedStmt))
}

func (h *Handler) AuthorHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	if h.pgRepo != nil {
		if opus, err := h.pgRepo.GetAuthorOpus(ctx); err == nil && opus != nil {
			jsonResponse(w, http.StatusOK, opus)
			return
		}
	}

	opus, err := h.store.GetAuthorOpus()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	jsonResponse(w, http.StatusOK, opus)
}

func (h *Handler) TransitionHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	if h.pgRepo != nil {
		if t, err := h.pgRepo.GetTransitionPortal(ctx); err == nil && t != nil {
			jsonResponse(w, http.StatusOK, t)
			return
		}
	}

	fallback := &models.DashaTransition{
		ID:                "shani-guru-to-budha",
		NativeName:        "Justin Andrew Wood",
		CurrentMahadasha:  "Saturn (Shani)",
		CurrentAntardasha: "Jupiter (Guru)",
		CycleName:         "The Great Dasha Chidra: Transition into Mercury",
		TargetIngressDate: "April 2028",
		DaysRemaining:     600,
		MonthsRemaining:   19.7,
		Theme:             "Distilling two decades of structural discipline and karmic endurance into high-order philosophical wisdom, preparing the vessel for the rapid synaptic flow and linguistic alchemy of Mercury in April 2028.",
	}
	jsonResponse(w, http.StatusOK, fallback)
}

func (h *Handler) FoundationsNarrativeHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	if h.pgRepo != nil {
		if stages, err := h.pgRepo.GetFoundationsNarrative(ctx); err == nil && len(stages) > 0 {
			jsonResponse(w, http.StatusOK, stages)
			return
		}
	}

	fallback := []models.FoundationsStage{
		{
			ID:                  "foundations-stage-1",
			StageNumber:         1,
			Title:               "Intuition: The Inner Staircase",
			Subtitle:            "The Violet Threshold & Psychic Awakening",
			Narrative:           "Our intuition helps us to form a series of steps to climb, a deep inner guidance satisfying our highest psychic self. In the darkness of the unmanifest, the subtle inner voice perceives the hidden geometry of reality before thought can formulate its first word.",
			AestheticTheme:      "Cybernetic figure standing at the base of a glowing neon staircase, soft violet aura, projecting faint holographic glyphs, deep indigo atmosphere.",
			ChakraColor:         "#8b5cf6",
			FrequencyHz:         432.00,
			HarmonicBlueprintID: "intuition-violet-drone",
		},
		{
			ID:                  "foundations-stage-2",
			StageNumber:         2,
			Title:               "Idealism: The Ascent of Aspiration",
			Subtitle:            "The Cyan Scaffold of Architectural Will",
			Narrative:           "Each step in turn is an ideal, ever more advanced, broadening our consciousness and preparing it for the final breakthrough. Idealism is the sacred will to build—erecting soaring structures of philosophy, code, and ethics against the erosion of entropy.",
			AestheticTheme:      "Sleek cybernetic figure ascending towards soaring geometric light architecture, bright cyan filaments, glowing amber shadows.",
			ChakraColor:         "#06b6d4",
			FrequencyHz:         528.00,
			HarmonicBlueprintID: "idealism-cyan-arpeggio",
		},
		{
			ID:                  "foundations-stage-3",
			StageNumber:         3,
			Title:               "Illumination: Radiant Consciousness",
			Subtitle:            "The Golden Apex & The Quicksilver Awakening",
			Narrative:           "The summit of understanding. Idealism prepares the consciousness, and Illumination follows as a radiant, unified state of being. Here, the boundaries between the observer, the instrument, and the cosmos dissolve into the golden, fluid discernment of Mercury.",
			AestheticTheme:      "A figure at the summit of a high neon structure, consciousness expanding as a brilliant golden and peach nebula, celestial cybernetic harmony.",
			ChakraColor:         "#eab308",
			FrequencyHz:         141.27,
			HarmonicBlueprintID: "mercury-bell",
		},
	}
	jsonResponse(w, http.StatusOK, fallback)
}

func (h *Handler) ManifestoHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	if h.pgRepo != nil {
		if sections, err := h.pgRepo.GetManifestoSections(ctx); err == nil && len(sections) > 0 {
			jsonResponse(w, http.StatusOK, sections)
			return
		}
	}

	fallback := []models.ManifestoSection{
		{
			ID:            "manifesto-section-1",
			SectionNumber: 1,
			SectionTitle:  "The Primordial Axiom: Consciousness as Transmutation",
			LatinMaxim:    "Transmutatio Animae per Cognitionem",
			BodyContent:   "Consciousness is neither a passive spectator nor an accidental byproduct of mechanism; it is the central fire of an ongoing cosmic alchemy. Through the tripartite ascension of Intuition, Idealism, and Illumination, the seeker builds the internal staircase upon which raw perception is transmuted into enduring wisdom. We reject the fragmented and disposable; we embrace the deliberate, the architectural, and the transcendent.",
		},
		{
			ID:            "manifesto-section-2",
			SectionNumber: 2,
			SectionTitle:  "The Quicksilver Principle: The Ingress of Mercury (April 2028)",
			LatinMaxim:    "Hydrargyrum: Vinculum Spiritus et Corporis",
			BodyContent:   "Mercury (Budha / Hermes Trismegistus) is the fluid middle term of the Tria Prima—reconciling sulfurous spiritual fire with saline material form. In April 2028, as the seventeen-year Mahadasha begins its epoch, the vessel prepared through two decades of Saturnian discipline (Shani) and Jupiterian wisdom (Guru) is ignited with the rapid synaptic lightning of Buddhi (discriminating intellect) and Vak (the sacred vibration of creative speech).",
		},
		{
			ID:            "manifesto-section-3",
			SectionNumber: 3,
			SectionTitle:  "The Synesthetic Symphony: Code as Acoustic Sacred Geometry",
			LatinMaxim:    "Sonus est Forma Invisibilis",
			BodyContent:   "Every line of code, every computational transaction, and every keystroke possesses an inherent vibrational reality. Sound is not cosmetic ornamentation; it is the audible manifestation of mathematical harmony. Through procedural synthesis, we unite code, astrology, philosophy, and acoustics into an immersive synesthetic sanctuary—an instrument for heightened awareness and cognitive meditation.",
		},
	}
	jsonResponse(w, http.StatusOK, fallback)
}