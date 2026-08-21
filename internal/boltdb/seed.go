package boltdb

import (
	"log"
	"os"
	"strings"
	"time"

	"mercury-dasha/internal/models"
)

func SeedDatabase(store *Store, embeddedStatement, textFilePath string) error {
	log.Println("[BoltDB] Seeding contextual knowledge base and relative relations...")

	statementText := strings.TrimSpace(embeddedStatement)
	if textFilePath != "" {
		if rawText, err := os.ReadFile(textFilePath); err == nil && len(rawText) > 0 {
			statementText = strings.TrimSpace(string(rawText))
		}
	}

	foundationalStmt := &models.FoundationalStatement{
		ID:         "mercury-foundational-root",
		Title:      "The Foundational Axiom of Mercury (Budha / Hermes / Quicksilver)",
		Author:     "Justin Andrew Wood",
		Statement:  statementText,
		SourceFile: textFilePath,
		CreatedAt:  time.Now(),
		Archetypes: []string{
			"Budha (Vedic Celestial Prince)",
			"Hermes Trismegistus (Thrice-Great Magus & Scribe)",
			"Thoth (Lord of Sacred Hieroglyphs & Cosmic Order)",
			"Hydrargyrum (Living Quicksilver / Alchemical Mediator)",
			"The Psychopomp (The Guide of Souls across Thresholds)",
		},
		Correspondences: map[string]string{
			"Element":       "Fluid Ether / Volatile Air-Water",
			"Tria Prima":    "Spiritus (The Intellectual & Vital Mediator)",
			"Vedic Day":     "Budhavara (Wednesday)",
			"Gemstone":      "Emerald (Panna) / Tsavorite Garnet",
			"Metal":         "Quicksilver (Mercury, Hg, 80)",
			"Dasha Span":    "17 Solar Years",
			"Ruling Signs":  "Mithuna (Gemini - Exoteric) & Kanya (Virgo - Esoteric/Exalted)",
			"Subtle Ray":    "Emerald Green Ray of Discernment",
			"Spagyric Herb": "Gotu Kola (Centella Asiatica) & Lavender",
			"Body System":   "Central Nervous System, Speech Apparatus, Synaptic Transmitters",
		},
	}
	if err := store.SaveFoundationalStatement(foundationalStmt); err != nil {
		return err
	}

	contextNodes := []models.ContextNode{
		{
			Key:      "node:mercury-core",
			Category: "hermetic",
			Title:    "The Quicksilver Archetype & The Universal Mediator",
			Summary:  "Mercury functions as the singular bridge uniting celestial soul with earthly salt.",
			Content:  "In both Hermetic philosophy and Vedic cosmology, Mercury is the fluid principle of mind (Buddhi) and volatility. It possesses no rigid nature of its own; instead, it transmutes and reflects whatever light it contacts. It is the psychopomp—the divine messenger capable of descending into the underworld and ascending to Olympus unharmed.",
			Tags:     []string{"quicksilver", "hermes", "psychopomp", "tria_prima", "transmutation"},
			RelativeKeys: []string{
				"node:tria-prima-quicksilver",
				"node:buddhi-vak",
				"node:hermetic-kybalion",
				"node:opus-chronicle",
			},
			Metadata: map[string]string{
				"author":     "Justin Andrew Wood",
				"principle":  "Mediation",
				"volatility": "Maximal",
			},
		},
		{
			Key:      "node:buddhi-vak",
			Category: "astrology",
			Title:    "Buddhi & Vak: The Vedic Faculties of Discrimination & Sacred Speech",
			Summary:  "The twin powers of Budha: Buddhi is the pure intellect that discerns truth from illusion; Vak is the creative power of spoken sound.",
			Content:  "In Vedic astrology (Jyotish), Budha represents Buddhi—the higher discriminating faculty of the intellect. Unlike the reactive lower mind (Manas), Buddhi analyzes, categorizes, and distills essence. Coupled with Vak (speech and phonetic vibration), Budha empowers the astrologer, programmer, and poet to cast reality into ordered structures.",
			Tags:     []string{"jyotish", "budha", "buddhi", "vak", "intellect", "speech"},
			RelativeKeys: []string{
				"node:mercury-core",
				"node:vishnu-sahasranama",
				"node:panna-emerald",
				"node:dasha-17yr-cycle",
			},
		},
		{
			Key:      "node:tria-prima-quicksilver",
			Category: "alchemy",
			Title:    "Hydrargyrum & The Tria Prima: Reconciling Sulfur and Salt",
			Summary:  "Mercury (Spiritus) is the fluid mediator without which Sulfur (Soul) and Salt (Body) cannot unite in the Great Work.",
			Content:  "In Paracelsian alchemy, the Tria Prima comprises Sulfur (the combustive soul), Salt (the crystalline material form), and Mercury (the volatile fluid spirit). Hydrargyrum (quicksilver) is the sole metal that remains liquid at ambient temperature, embodying living paradox: heavy yet elusive, metallic yet flowing.",
			Tags:     []string{"alchemy", "quicksilver", "hydrargyrum", "sulfur", "salt", "paracelsus"},
			RelativeKeys: []string{
				"node:mercury-core",
				"node:hermetic-kybalion",
				"node:ashlesha-nakshatra",
			},
		},
		{
			Key:      "node:hermetic-kybalion",
			Category: "hermetic",
			Title:    "The Seven Hermetic Principles of Hermes Trismegistus",
			Summary:  "The master keys of mental transmutation: Mentalism, Correspondence, Vibration, Polarity, Rhythm, Cause & Effect, Gender.",
			Content:  "The Emerald Tablet and Corpus Hermeticum establish that 'The All is Mind; the Universe is Mental.' Mercury governs the principle of Correspondence ('As above, so below; as within, so without') and Vibration ('Nothing rests; everything moves; everything vibrates'). Understanding these laws enables conscious transmutation of mental states.",
			Tags:     []string{"hermes", "kybalion", "emerald_tablet", "mentalism", "correspondence"},
			RelativeKeys: []string{
				"node:mercury-core",
				"node:tria-prima-quicksilver",
				"node:opus-chronicle",
			},
		},
		{
			Key:      "node:ashlesha-nakshatra",
			Category: "dasha",
			Title:    "Ashlesha Nakshatra: The Serpent of Esoteric Kundalini & Penetrating Wit",
			Summary:  "Cancer 16°40' - 30°00'. Ruled by Mercury; presiding deity: The Sarpas (Nagas).",
			Content:  "Ashlesha is the first of Mercury's three Nakshatras. Located at the boundary where Cancer meets Leo (a Gandanta junction), it grants deep psychological intuition, hypnotic speech, penetrating research capabilities, and the capacity to awaken coiled serpent wisdom.",
			Tags:     []string{"nakshatra", "ashlesha", "nagas", "kundalini", "intuition"},
			RelativeKeys: []string{
				"node:jyeshtha-nakshatra",
				"node:revati-nakshatra",
				"node:buddhi-vak",
			},
		},
		{
			Key:      "node:jyeshtha-nakshatra",
			Category: "dasha",
			Title:    "Jyeshtha Nakshatra: The Elder Sovereign of Intellect & Protection",
			Summary:  "Scorpio 16°40' - 30°00'. Ruled by Mercury; presiding deity: Indra (King of Gods).",
			Content:  "Jyeshtha represents the peak of intellect and occult authority. Marked by the red giant star Antares (the heart of the Scorpion), it embodies protective talismans, courageous leadership, and mastering hidden systems of power and computation.",
			Tags:     []string{"nakshatra", "jyeshtha", "indra", "antares", "sovereignty"},
			RelativeKeys: []string{
				"node:ashlesha-nakshatra",
				"node:revati-nakshatra",
				"node:panna-emerald",
			},
		},
		{
			Key:      "node:revati-nakshatra",
			Category: "dasha",
			Title:    "Revati Nakshatra: The Cosmic Journeyman & Nourisher of Souls",
			Summary:  "Pisces 16°40' - 30°00'. Ruled by Mercury; presiding deity: Pushan (The Divine Shepherd).",
			Content:  "Revati is the final 27th Nakshatra, marking the completion of the zodiacal journey. Ruled by Mercury and Pushan, it grants boundless imagination, safe voyage across spiritual oceans, mastery over rhythm and music, and wealth derived from compassionate commerce.",
			Tags:     []string{"nakshatra", "revati", "pushan", "completion", "navigation"},
			RelativeKeys: []string{
				"node:ashlesha-nakshatra",
				"node:jyeshtha-nakshatra",
				"node:mercury-core",
			},
		},
		{
			Key:      "node:panna-emerald",
			Category: "astrology",
			Title:    "Panna (Emerald): The Green Ray Talisman of Budha",
			Summary:  "The precious beryl of profound mental clarity, synaptic regeneration, and eloquent expression.",
			Content:  "Set in gold or bronze and consecrated at Wednesday dawn, the emerald refracts the pristine green cosmic ray of Budha. It cools excess mental agitation, sharpens memory, enhances commercial negotiations, and brings alignment between spoken word and interior truth.",
			Tags:     []string{"emerald", "panna", "gemology", "talismans", "green_ray"},
			RelativeKeys: []string{
				"node:buddhi-vak",
				"node:vishnu-sahasranama",
			},
		},
		{
			Key:      "node:vishnu-sahasranama",
			Category: "astrology",
			Title:    "Lord Vishnu & Budha: The Sustainer of Cosmic Harmony",
			Summary:  "The archetype of preservation, supreme intelligence, and rhythmic balance governing Mercury's highest octave.",
			Content:  "In Jyotish, Budha is intimately linked with Sri Maha Vishnu—the Preserver who maintains cosmic equilibrium through infinite avatars and unerring intelligence. Chanting the Vishnu Sahasranama on Wednesdays neutralizes afflicted Mercury placements and infuses the intellect with serene clarity.",
			Tags:     []string{"vishnu", "mantra", "harmony", "preservation", "budhavara"},
			RelativeKeys: []string{
				"node:buddhi-vak",
				"node:mercury-core",
			},
		},
		{
			Key:      "node:opus-chronicle",
			Category: "author_opus",
			Title:    "The Life & Opus of Justin Andrew Wood: Synthesizing Code, Cosmos & Word",
			Summary:  "A lifelong pursuit of linguistic alchemy, intellectual architecture, and planetary harmony.",
			Content:  "Author Justin Andrew Wood channels the mercurial spirit through software engineering, esoteric philosophy, and literary synthesis. The development of 'Mercury Dasha' represents the convergence of alchemical quicksilver with modern high-performance computation (Go, BoltDB, Next.js), treating every function and query as an invocation of order.",
			Tags:     []string{"justin_andrew_wood", "author", "opus", "computational_alchemy", "synthesis"},
			RelativeKeys: []string{
				"node:mercury-core",
				"node:hermetic-kybalion",
				"node:buddhi-vak",
			},
		},
	}

	for _, node := range contextNodes {
		if err := store.SaveContextNode(&node); err != nil {
			return err
		}
	}

	dashaOverview := &models.DashaOverview{
		MahadashaLord:    "Mercury (Budha)",
		TotalYears:       17,
		VimshottariOrder: 7,
		SeedDeity:        "Lord Vishnu / Hermes Trismegistus",
		Gemstone:         "Emerald (Panna)",
		Mantra:           "Om Bum Budhaya Namaha / Om Namo Bhagavate Vasudevaya",
		Description:      "The 17-year Mercury Mahadasha is a sustained cycle of intellectual awakening, analytical refinement, linguistic mastery, commercial expansion, and alchemical synthesis. Under Budha's reign, the native seeks to organize chaotic perceptions into coherent systems of knowledge.",
		SubPeriods: []models.DashaSubPeriod{
			{
				SubLord:        "Mercury - Mercury (Budha/Budha)",
				DurationYears:  2.41,
				DurationMonths: 28,
				DurationDays:   27,
				Qualities:      "Pure intellect, swift learning, writing projects, educational breakthroughs, sharp commercial acumen.",
				Psychological:  "Curiosity peaks; mental agility and conversational energy surge. Prone to scattered thoughts if ungrounded.",
				Material:       "Inception of intellectual ventures, publications, tech development, strategic networking.",
				Esoteric:       "Initiation into Hermetic study, linguistic precision, deciphering esoteric texts.",
				Talismanic:     "Consecration of Emerald in gold on Wednesday dawn; green apparel.",
			},
			{
				SubLord:        "Mercury - Ketu (Budha/Ketu)",
				DurationYears:  0.99,
				DurationMonths: 11,
				DurationDays:   27,
				Qualities:      "Intuitive detachment, spiritual discernment, piercing through intellectual illusions.",
				Psychological:  "Questioning logical frameworks; moving from dry rationalism into mystical gnosis.",
				Material:       "Shifts in focus; stepping away from purely transactional pursuits to deep research.",
				Esoteric:       "Direct insight into non-dual philosophy (Advaita); shedding dogmas.",
				Talismanic:     "Cat's Eye or Ganesha worship to harmonize analytical and transcendent mind.",
			},
			{
				SubLord:        "Mercury - Venus (Budha/Shukra)",
				DurationYears:  2.83,
				DurationMonths: 34,
				DurationDays:   0,
				Qualities:      "Artistic brilliance, poetic speech, aesthetic mastery, financial prosperity, harmonious partnerships.",
				Psychological:  "Refinement of taste, profound appreciation for beauty in logic and design.",
				Material:       "Commercial success in creative/aesthetic domains, lavish gatherings, architectural harmony.",
				Esoteric:       "Integration of the Divine Feminine and Masculine intellect (Hermaphroditus / Alchemy of Rose and Quicksilver).",
				Talismanic:     "Diamond/White Sapphire alongside Emerald; Friday/Wednesday devotional rituals.",
			},
			{
				SubLord:        "Mercury - Sun (Budha/Surya)",
				DurationYears:  0.85,
				DurationMonths: 10,
				DurationDays:   6,
				Qualities:      "Budhaditya Yoga emergence—radiant authority, clarity of purpose, recognition from superiors.",
				Psychological:  "Confidence in articulating core vision; elimination of self-doubt.",
				Material:       "Public honors, leadership roles, institutional publications.",
				Esoteric:       "The Solar Light illuminating the Mercurial mirror; unclouded spiritual vision.",
				Talismanic:     "Ruby and Emerald harmony; Gayatri Mantra at sunrise.",
			},
			{
				SubLord:        "Mercury - Moon (Budha/Chandra)",
				DurationYears:  1.42,
				DurationMonths: 17,
				DurationDays:   0,
				Qualities:      "Emotional intelligence, literary sensitivity, vivid imagination, public communication.",
				Psychological:  "Balancing logic (Budha) with deep feeling (Chandra); heightened intuition.",
				Material:       "Public speaking, creative writing, fluid travel, community connection.",
				Esoteric:       "The Alchemical Marriage of the Sun/Moon reflected in the Quicksilver pool.",
				Talismanic:     "Pearl and Emerald; Moonlit contemplation near running waters.",
			},
			{
				SubLord:        "Mercury - Mars (Budha/Mangala)",
				DurationYears:  0.99,
				DurationMonths: 11,
				DurationDays:   27,
				Qualities:      "Decisive execution, strategic debate, technical and algorithmic problem-solving.",
				Psychological:  "Sharp, incisive wit; potential for verbal impatience; intense focus.",
				Material:       "Rapid code delivery, engineering triumphs, real estate/property strategy.",
				Esoteric:       "The flaming sword of intellect cutting through ignorance; disciplined spiritual practice (Tapas).",
				Talismanic:     "Red Coral / Emerald; Kartikeya / Mars peace mantras.",
			},
			{
				SubLord:        "Mercury - Rahu (Budha/Rahu)",
				DurationYears:  2.55,
				DurationMonths: 30,
				DurationDays:   18,
				Qualities:      "Unconventional innovation, breakthrough technical architectures, global expansion, out-of-the-box thinking.",
				Psychological:  "Obsessive research drives, eccentric perspectives, intense appetite for arcane data.",
				Material:       "Pioneering digital ventures, international audiences, unconventional partnerships.",
				Esoteric:       "Navigating the illusions of the matrix; mastering esoteric symbolism and occult cryptography.",
				Talismanic:     "Hessonite Garnet (Gomed) with careful consecration; Saraswati and Durga invocations.",
			},
			{
				SubLord:        "Mercury - Jupiter (Budha/Guru)",
				DurationYears:  2.27,
				DurationMonths: 27,
				DurationDays:   6,
				Qualities:      "Supreme wisdom synthesis, philosophical mastery, mentorship, legal and ethical clarity.",
				Psychological:  "Merging detailed analysis with overarching philosophical expansiveness.",
				Material:       "Publishing major treatises, advisory positions, spiritual and material bounty.",
				Esoteric:       "Guru-Budha alliance—the scholar ascends to the status of sage.",
				Talismanic:     "Yellow Sapphire with Emerald; Brihaspati Stotram.",
			},
			{
				SubLord:        "Mercury - Saturn (Budha/Shani)",
				DurationYears:  2.69,
				DurationMonths: 32,
				DurationDays:   9,
				Qualities:      "Enduring mastery, deep structural discipline, historical research, cementing legacy.",
				Psychological:  "Sober, patient, rigorous contemplation; perfection of craft.",
				Material:       "Completion of magnum opus, long-term institutional tenure, robust infrastructure builds.",
				Esoteric:       "The crystallizing of quicksilver into the Philosopher's Stone (Fixatio).",
				Talismanic:     "Blue Sapphire / Iron talisman with Emerald; Shani Gayatri.",
			},
		},
	}
	if err := store.SaveDashaOverview(dashaOverview); err != nil {
		return err
	}

	nakshatras := []models.Nakshatra{
		{
			Name:            "Ashlesha",
			Sanskrit:        "आश्लेषा (The Entwiner)",
			ZodiacSpan:      "Cancer 16°40' - 30°00'",
			Symbol:          "Coiled Serpent / Naga",
			Deity:           "The Sarpas (Cosmic Serpents of Wisdom)",
			Shakti:          "Visasleshana Shakti (The power to inflict poison and destroy it / antidote power)",
			EsotericMeaning: "The awakening of serpentine Kundalini energy at the boundary of water and fire. Represents profound psychological insight, hypnotic charm, and the power to penetrate hidden secrets.",
			Qualities:       []string{"Intense Intuition", "Esoteric Medicine", "Strategic Silence", "Deep Research"},
		},
		{
			Name:            "Jyeshtha",
			Sanskrit:        "ज्येष्ठा (The Eldest / Sovereign)",
			ZodiacSpan:      "Scorpio 16°40' - 30°00'",
			Symbol:          "Circular Amulet / Talisman / Umbrella",
			Deity:           "Indra (King of the Celestials)",
			Shakti:          "Arohana Shakti (The power to rise in courage, status, and conquer adversaries)",
			EsotericMeaning: "The crown of occult intellect and protective authority. Located at the heart of the celestial scorpion near Antares, it confers supreme determination, protective mastery, and the courage to guard sacred treasures.",
			Qualities:       []string{"Occult Sovereignty", "Talismanic Mastery", "Unflinching Courage", "Executive Command"},
		},
		{
			Name:            "Revati",
			Sanskrit:        "रेवती (The Wealthy & Transcendent Nourisher)",
			ZodiacSpan:      "Pisces 16°40' - 30°00'",
			Symbol:          "Fish / Pair of Fish / Drum (Mridanga)",
			Deity:           "Pushan (The Cosmic Shepherd and Celestial Pathfinder)",
			Shakti:          "Kshiradyapani Shakti (The power to nourish, protect all beings, and illuminate the path)",
			EsotericMeaning: "The final lunar mansion marking the completion of the cosmic cycle. Ruled by Mercury and Pushan, Revati grants safe passage across spiritual oceans, mastery over musical and mathematical cadence, and supreme compassion.",
			Qualities:       []string{"Cosmic Navigation", "Rhythmic Alchemy", "Gentle Nourishment", "Spiritual Abundance"},
		},
	}
	if err := store.SaveNakshatras(nakshatras); err != nil {
		return err
	}

	alchemicalPrinciples := []models.AlchemicalPrinciple{
		{
			Principle:   "Mercury (Spiritus / Quicksilver)",
			LatinName:   "Hydrargyrum (Hg, Atomic No. 80)",
			Symbol:      "☿",
			Element:     "Fluid Spirit / Volatile Breath",
			Role:        "The Divine Mediator & Universal Solvent",
			Description: "Mercury represents the vital life force, intellect, and fluid connectivity in the Great Work. It is neither purely fixed nor purely destructive; it dissolves fixed bodies and fixes volatile spirits.",
			Properties:  []string{"Liquid at Room Temperature", "High Surface Tension", "Amalgamates Noble Metals", "Reflective Mirror Surface"},
		},
		{
			Principle:   "Sulfur (Anima / Soul)",
			LatinName:   "Sulfur Philosophorum",
			Symbol:      "🜍",
			Element:     "Combustive Fire & Vital Heat",
			Role:        "The Radiant Soul & Form-Giving Principle",
			Description: "Sulfur represents the active, fiery, masculine essence—the inner spark of will, consciousness, and divine warmth.",
			Properties:  []string{"Combustibility", "Fixative Power", "Color & Odor Generation", "Solar Affinity"},
		},
		{
			Principle:   "Salt (Corpus / Body)",
			LatinName:   "Sal / Terra",
			Symbol:      "🜔",
			Element:     "Crystalline Earth & Solid Substance",
			Role:        "The Material Matrix & Vessel",
			Description: "Salt represents the stable, receptive, grounding principle—the vehicle through which Spiritus and Anima find physical manifestation.",
			Properties:  []string{"Crystalline Structure", "Solubility & Precipitation", "Preservation", "Grounding Weight"},
		},
	}
	if err := store.SaveAlchemicalPrinciples(alchemicalPrinciples); err != nil {
		return err
	}

	authorOpus := &models.AuthorOpus{
		Author:    "Justin Andrew Wood",
		Bio:       "Philosopher, software architect, and esoteric researcher. Justin Andrew Wood explores the intersections of classical Hermeticism, Vedic Jyotish, and high-performance computational systems, embodying the mercurial art of translating transcendent archetypes into functional digital reality.",
		OpusTitle: "The Mercurial Codex: Essays on Quicksilver, Mind, and Code",
		Essays: []models.OpusEssay{
			{
				Slug:     "the-quicksilver-intellect",
				Title:    "The Quicksilver Intellect: Why Modern Code is Classical Alchemy",
				Date:     "2026-08-20",
				Theme:    "Computational Alchemy & Hermeticism",
				Abstract: "An exploration of software engineering as the modern manifestation of the Hermetic art—where pure thought is inscribed into silicon to produce tangible effect.",
				Content:  "When the alchemists spoke of Hydrargyrum as the fluid medium bridging spirit and matter, they anticipated the digital era. A program is neither physical machine nor abstract philosophy; it is pure logic flowing through metallic conductors. In writing Go routines, architecting key-value graphs in BoltDB, and designing reactive interfaces, the developer acts as a modern Hermetic scribe, turning volition into form.",
				KeyInsights: []string{
					"Code is linguistic talisman—words that execute action in the physical world.",
					"BoltDB's B+tree key-value architecture mirrors the associative memory of Buddhi.",
					"The Mercurial mind does not store static dogmas; it navigates fluid relationship graphs.",
				},
			},
			{
				Slug:     "navigating-the-17-year-dasha",
				Title:    "Navigating the 17-Year Crucible: A Personal Reflection on Budha Mahadasha",
				Date:     "2026-08-20",
				Theme:    "Vedic Astrology & Lived Experience",
				Abstract: "A personal chronicle examining the psychological shifts, intellectual awakenings, and discipline demanded during the 17-year planetary period of Mercury.",
				Content:  "Entering the Mercury Mahadasha is akin to turning the lens of an observatory toward the inner faculties of thought. Every subconscious assumption is brought before the court of Buddhi for audit. It is a period that rewards linguistic precision, clean code, honest communication, and devotion to the sustaining intelligence of Vishnu.",
				KeyInsights: []string{
					"Intellectual clarity requires emotional purification (refining the Moon-Mercury dialogue).",
					"Wednesdays serve as weekly spiritual resets for alignment and study.",
					"Emerald consciousness harmonizes technical rigor with poetic transcendence.",
				},
			},
		},
		Chronology: []models.LifeEvent{
			{
				Period:             "Phase I: The Awakening of Buddhi",
				Title:              "Inception of Esoteric & Computational Studies",
				Cycle:              "Mercury - Mercury / Ketu",
				Description:        "Initial immersion into the mechanics of thought, programming paradigms, and ancient Hermetic axioms.",
				MercurialResonance: "Rapid acquisition of multiple programming languages and philosophical frameworks.",
			},
			{
				Period:             "Phase II: The Aesthetic & Synthesis Era",
				Title:              "Harmonizing Art, Logic & Architecture",
				Cycle:              "Mercury - Venus / Sun",
				Description:        "Integration of aesthetic elegance with rigorous backend systems. Formulating the core axioms of 'Mercury Dasha'.",
				MercurialResonance: "Crafting beautiful, expressive digital artifacts that serve as intellectual sanctuaries.",
			},
			{
				Period:             "Phase III: The Magnum Opus",
				Title:              "Deployment of the Full-Stack Compendium",
				Cycle:              "Mercury - Mars / Jupiter",
				Description:        "Uniting Next.js, Go, BoltDB, and Postgres into a singular living digital grimoire.",
				MercurialResonance: "The crystallization of quicksilver into enduring computational architecture.",
			},
		},
	}
	if err := store.SaveAuthorOpus(authorOpus); err != nil {
		return err
	}

	log.Println("[BoltDB] Contextual seed data successfully committed.")
	return nil
}
