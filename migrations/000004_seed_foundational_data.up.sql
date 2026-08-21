-- 000004_seed_foundational_data.up.sql

-- 1. Foundational Statement
INSERT INTO foundational_axioms (id, title, author, statement_text, archetypes, correspondences)
VALUES (
    'mercury-foundational-root',
    'The Foundational Axiom of Mercury (Budha / Hermes / Quicksilver)',
    'Justin Andrew Wood',
    'Mercury is the universal principle of mediation, volatility, and discernment—the divine quicksilver (Hydrargyrum) that bridges soul and substance, cosmos and consciousness. Embodying Budha in the celestial court, Hermes Trismegistus in the esoteric tradition, and Thoth in the primordial script, Mercury governs Buddhi (the discriminating intellect), Vak (the sacred potency of speech), trade, synthesis, and the transmutation of raw perception into living wisdom. As the fluid middle term of the Tria Prima reconciling sulfurous fire with saline earth, Mercury transits effortlessly between realms as the eternal psychopomp—unbound by fixed form, master of boundary-crossing, and catalyst of perpetual awakening. In the 17-year crucible of the Mahadasha and throughout the life and opus of Justin Andrew Wood, Mercury manifests as the relentless drive to decode the architecture of reality: an alchemy of mind where language becomes talisman, thought becomes structure, and experience is distilled into the enduring light of truth.',
    '["Budha (Vedic Celestial Prince)", "Hermes Trismegistus (Thrice-Great Magus & Scribe)", "Thoth (Lord of Sacred Hieroglyphs & Cosmic Order)", "Hydrargyrum (Living Quicksilver / Alchemical Mediator)", "The Psychopomp (The Guide of Souls across Thresholds)"]'::jsonb,
    '{"Element": "Fluid Ether / Volatile Air-Water", "Tria Prima": "Spiritus (The Intellectual & Vital Mediator)", "Vedic Day": "Budhavara (Wednesday)", "Gemstone": "Emerald (Panna) / Tsavorite Garnet", "Metal": "Quicksilver (Mercury, Hg, 80)", "Dasha Span": "17 Solar Years", "Ruling Signs": "Mithuna (Gemini - Exoteric) & Kanya (Virgo - Esoteric/Exalted)", "Subtle Ray": "Emerald Green Ray of Discernment", "Spagyric Herb": "Gotu Kola (Centella Asiatica) & Lavender", "Body System": "Central Nervous System, Speech Apparatus, Synaptic Transmitters"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    statement_text = EXCLUDED.statement_text,
    archetypes = EXCLUDED.archetypes,
    correspondences = EXCLUDED.correspondences,
    updated_at = CURRENT_TIMESTAMP;

-- 2. Planetary Dasha (Mercury 17-Year Mahadasha)
INSERT INTO planetary_dashas (id, mahadasha_lord, total_years, vimshottari_order, seed_deity, gemstone, mantra, description)
VALUES (
    1,
    'Mercury (Budha)',
    17,
    7,
    'Lord Vishnu / Hermes Trismegistus',
    'Emerald (Panna)',
    'Om Bum Budhaya Namaha / Om Namo Bhagavate Vasudevaya',
    'The 17-year Mercury Mahadasha is a sustained cycle of intellectual awakening, analytical refinement, linguistic mastery, commercial expansion, and alchemical synthesis. Under Budha''s reign, the native seeks to organize chaotic perceptions into coherent systems of knowledge.'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Dasha Sub Periods (9 Antardashas)
INSERT INTO dasha_sub_periods (dasha_id, sub_lord, duration_years, duration_months, duration_days, qualities, psychological, material, esoteric, talismanic, sort_order)
VALUES
    (1, 'Mercury - Mercury (Budha/Budha)', 2.41, 28, 27, 'Pure intellect, swift learning, writing projects, educational breakthroughs, sharp commercial acumen.', 'Curiosity peaks; mental agility and conversational energy surge. Prone to scattered thoughts if ungrounded.', 'Inception of intellectual ventures, publications, tech development, strategic networking.', 'Initiation into Hermetic study, linguistic precision, deciphering esoteric texts.', 'Consecration of Emerald in gold on Wednesday dawn; green apparel.', 1),
    (1, 'Mercury - Ketu (Budha/Ketu)', 0.99, 11, 27, 'Intuitive detachment, spiritual discernment, piercing through intellectual illusions.', 'Questioning logical frameworks; moving from dry rationalism into mystical gnosis.', 'Shifts in focus; stepping away from purely transactional pursuits to deep research.', 'Direct insight into non-dual philosophy (Advaita); shedding dogmas.', 'Cat''s Eye or Ganesha worship to harmonize analytical and transcendent mind.', 2),
    (1, 'Mercury - Venus (Budha/Shukra)', 2.83, 34, 0, 'Artistic brilliance, poetic speech, aesthetic mastery, financial prosperity, harmonious partnerships.', 'Refinement of taste, profound appreciation for beauty in logic and design.', 'Commercial success in creative/aesthetic domains, lavish gatherings, architectural harmony.', 'Integration of the Divine Feminine and Masculine intellect (Hermaphroditus / Alchemy of Rose and Quicksilver).', 'Diamond/White Sapphire alongside Emerald; Friday/Wednesday devotional rituals.', 3),
    (1, 'Mercury - Sun (Budha/Surya)', 0.85, 10, 6, 'Budhaditya Yoga emergence—radiant authority, clarity of purpose, recognition from superiors.', 'Confidence in articulating core vision; elimination of self-doubt.', 'Public honors, leadership roles, institutional publications.', 'The Solar Light illuminating the Mercurial mirror; unclouded spiritual vision.', 'Ruby and Emerald harmony; Gayatri Mantra at sunrise.', 4),
    (1, 'Mercury - Moon (Budha/Chandra)', 1.42, 17, 0, 'Emotional intelligence, literary sensitivity, vivid imagination, public communication.', 'Balancing logic (Budha) with deep feeling (Chandra); heightened intuition.', 'Public speaking, creative writing, fluid travel, community connection.', 'The Alchemical Marriage of the Sun/Moon reflected in the Quicksilver pool.', 'Pearl and Emerald; Moonlit contemplation near running waters.', 5),
    (1, 'Mercury - Mars (Budha/Mangala)', 0.99, 11, 27, 'Decisive execution, strategic debate, technical and algorithmic problem-solving.', 'Sharp, incisive wit; potential for verbal impatience; intense focus.', 'Rapid code delivery, engineering triumphs, real estate/property strategy.', 'The flaming sword of intellect cutting through ignorance; disciplined spiritual practice (Tapas).', 'Red Coral / Emerald; Kartikeya / Mars peace mantras.', 6),
    (1, 'Mercury - Rahu (Budha/Rahu)', 2.55, 30, 18, 'Unconventional innovation, breakthrough technical architectures, global expansion, out-of-the-box thinking.', 'Obsessive research drives, eccentric perspectives, intense appetite for arcane data.', 'Pioneering digital ventures, international audiences, unconventional partnerships.', 'Navigating the illusions of the matrix; mastering esoteric symbolism and occult cryptography.', 'Hessonite Garnet (Gomed) with careful consecration; Saraswati and Durga invocations.', 7),
    (1, 'Mercury - Jupiter (Budha/Guru)', 2.27, 27, 6, 'Supreme wisdom synthesis, philosophical mastery, mentorship, legal and ethical clarity.', 'Merging detailed analysis with overarching philosophical expansiveness.', 'Publishing major treatises, advisory positions, spiritual and material bounty.', 'Guru-Budha alliance—the scholar ascends to the status of sage.', 'Yellow Sapphire with Emerald; Brihaspati Stotram.', 8),
    (1, 'Mercury - Saturn (Budha/Shani)', 2.69, 32, 9, 'Enduring mastery, deep structural discipline, historical research, cementing legacy.', 'Sober, patient, rigorous contemplation; perfection of craft.', 'Completion of magnum opus, long-term institutional tenure, robust infrastructure builds.', 'The crystallizing of quicksilver into the Philosopher''s Stone (Fixatio).', 'Blue Sapphire / Iron talisman with Emerald; Shani Gayatri.', 9)
ON CONFLICT DO NOTHING;

-- 4. Nakshatras
INSERT INTO nakshatras (name, sanskrit_name, zodiac_span, symbol, deity, shakti, esoteric_meaning, qualities)
VALUES
    ('Ashlesha', 'आश्लेषा (The Entwiner)', 'Cancer 16°40'' - 30°00''', 'Coiled Serpent / Naga', 'The Sarpas (Cosmic Serpents of Wisdom)', 'Visasleshana Shakti (The power to inflict poison and destroy it / antidote power)', 'The awakening of serpentine Kundalini energy at the boundary of water and fire. Represents profound psychological insight, hypnotic charm, and the power to penetrate hidden secrets.', '["Intense Intuition", "Esoteric Medicine", "Strategic Silence", "Deep Research"]'::jsonb),
    ('Jyeshtha', 'ज्येष्ठा (The Eldest / Sovereign)', 'Scorpio 16°40'' - 30°00''', 'Circular Amulet / Talisman / Umbrella', 'Indra (King of the Celestials)', 'Arohana Shakti (The power to rise in courage, status, and conquer adversaries)', 'The crown of occult intellect and protective authority. Located at the heart of the celestial scorpion near Antares, it confers supreme determination, protective mastery, and the courage to guard sacred treasures.', '["Occult Sovereignty", "Talismanic Mastery", "Unflinching Courage", "Executive Command"]'::jsonb),
    ('Revati', 'रेवती (The Wealthy & Transcendent Nourisher)', 'Pisces 16°40'' - 30°00''', 'Fish / Pair of Fish / Drum (Mridanga)', 'Pushan (The Cosmic Shepherd and Celestial Pathfinder)', 'Kshiradyapani Shakti (The power to nourish, protect all beings, and illuminate the path)', 'The final lunar mansion marking the completion of the cosmic cycle. Ruled by Mercury and Pushan, Revati grants safe passage across spiritual oceans, mastery over musical and mathematical cadence, and supreme compassion.', '["Cosmic Navigation", "Rhythmic Alchemy", "Gentle Nourishment", "Spiritual Abundance"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- 5. Alchemical Principles
INSERT INTO alchemical_principles (principle, latin_name, symbol, element, role, description, properties, sort_order)
VALUES
    ('Mercury (Spiritus / Quicksilver)', 'Hydrargyrum (Hg, Atomic No. 80)', '☿', 'Fluid Spirit / Volatile Breath', 'The Divine Mediator & Universal Solvent', 'Mercury represents the vital life force, intellect, and fluid connectivity in the Great Work. It is neither purely fixed nor purely destructive; it dissolves fixed bodies and fixes volatile spirits.', '["Liquid at Room Temperature", "High Surface Tension", "Amalgamates Noble Metals", "Reflective Mirror Surface"]'::jsonb, 1),
    ('Sulfur (Anima / Soul)', 'Sulfur Philosophorum', '🜍', 'Combustive Fire & Vital Heat', 'The Radiant Soul & Form-Giving Principle', 'Sulfur represents the active, fiery, masculine essence—the inner spark of will, consciousness, and divine warmth.', '["Combustibility", "Fixative Power", "Color & Odor Generation", "Solar Affinity"]'::jsonb, 2),
    ('Salt (Corpus / Body)', 'Sal / Terra', '🜔', 'Crystalline Earth & Solid Substance', 'The Material Matrix & Vessel', 'Salt represents the stable, receptive, grounding principle—the vehicle through which Spiritus and Anima find physical manifestation.', '["Crystalline Structure", "Solubility & Precipitation", "Preservation", "Grounding Weight"]'::jsonb, 3)
ON CONFLICT (principle) DO NOTHING;

-- 6. Author Profile & Opus
INSERT INTO author_profiles (id, author_name, bio, opus_title)
VALUES (
    1,
    'Justin Andrew Wood',
    'Philosopher, software architect, and esoteric researcher. Justin Andrew Wood explores the intersections of classical Hermeticism, Vedic Jyotish, and high-performance computational systems, embodying the mercurial art of translating transcendent archetypes into functional digital reality.',
    'The Mercurial Codex: Essays on Quicksilver, Mind, and Code'
)
ON CONFLICT (author_name) DO NOTHING;

INSERT INTO author_essays (author_id, slug, title, essay_date, theme, abstract, content, key_insights, sort_order)
VALUES
    (1, 'the-quicksilver-intellect', 'The Quicksilver Intellect: Why Modern Code is Classical Alchemy', '2026-08-20', 'Computational Alchemy & Hermeticism', 'An exploration of software engineering as the modern manifestation of the Hermetic art—where pure thought is inscribed into silicon to produce tangible effect.', 'When the alchemists spoke of Hydrargyrum as the fluid medium bridging spirit and matter, they anticipated the digital era. A program is neither physical machine nor abstract philosophy; it is pure logic flowing through metallic conductors. In writing Go routines, architecting key-value graphs in BoltDB, and designing reactive interfaces, the developer acts as a modern Hermetic scribe, turning volition into form.', '["Code is linguistic talisman—words that execute action in the physical world.", "BoltDB''s B+tree key-value architecture mirrors the associative memory of Buddhi.", "The Mercurial mind does not store static dogmas; it navigates fluid relationship graphs."]'::jsonb, 1),
    (1, 'navigating-the-17-year-dasha', 'Navigating the 17-Year Crucible: A Personal Reflection on Budha Mahadasha', '2026-08-20', 'Vedic Astrology & Lived Experience', 'A personal chronicle examining the psychological shifts, intellectual awakenings, and discipline demanded during the 17-year planetary period of Mercury.', 'Entering the Mercury Mahadasha is akin to turning the lens of an observatory toward the inner faculties of thought. Every subconscious assumption is brought before the court of Buddhi for audit. It is a period that rewards linguistic precision, clean code, honest communication, and devotion to the sustaining intelligence of Vishnu.', '["Intellectual clarity requires emotional purification (refining the Moon-Mercury dialogue).", "Wednesdays serve as weekly spiritual resets for alignment and study.", "Emerald consciousness harmonizes technical rigor with poetic transcendence."]'::jsonb, 2)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO author_life_events (author_id, period, title, cycle, description, mercurial_resonance, sort_order)
VALUES
    (1, 'Phase I: The Awakening of Buddhi', 'Inception of Esoteric & Computational Studies', 'Mercury - Mercury / Ketu', 'Initial immersion into the mechanics of thought, programming paradigms, and ancient Hermetic axioms.', 'Rapid acquisition of multiple programming languages and philosophical frameworks.', 1),
    (1, 'Phase II: The Aesthetic & Synthesis Era', 'Harmonizing Art, Logic & Architecture', 'Mercury - Venus / Sun', 'Integration of aesthetic elegance with rigorous backend systems. Formulating the core axioms of ''Mercury Dasha''.', 'Crafting beautiful, expressive digital artifacts that serve as intellectual sanctuaries.', 2),
    (1, 'Phase III: The Magnum Opus', 'Deployment of the Full-Stack Compendium', 'Mercury - Mars / Jupiter', 'Uniting Next.js, Go, BoltDB, and Postgres into a singular living digital grimoire.', 'The crystallization of quicksilver into enduring computational architecture.', 3)
ON CONFLICT DO NOTHING;
