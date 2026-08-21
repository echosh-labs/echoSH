CREATE TABLE IF NOT EXISTS foundations_narrative (
    id VARCHAR(64) PRIMARY KEY,
    stage_number INT NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255) NOT NULL,
    narrative TEXT NOT NULL,
    aesthetic_theme VARCHAR(255) NOT NULL,
    chakra_color VARCHAR(64) NOT NULL,
    frequency_hz NUMERIC(8,2) NOT NULL,
    harmonic_blueprint_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fundamental_manifesto (
    id VARCHAR(64) PRIMARY KEY,
    section_number INT NOT NULL UNIQUE,
    section_title VARCHAR(255) NOT NULL,
    latin_maxim VARCHAR(255) NOT NULL,
    body_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO foundations_narrative (id, stage_number, title, subtitle, narrative, aesthetic_theme, chakra_color, frequency_hz, harmonic_blueprint_id)
VALUES
(
    'foundations-stage-1',
    1,
    'Intuition: The Inner Staircase',
    'The Violet Threshold & Psychic Awakening',
    'Our intuition helps us to form a series of steps to climb, a deep inner guidance satisfying our highest psychic self. In the darkness of the unmanifest, the subtle inner voice perceives the hidden geometry of reality before thought can formulate its first word.',
    'Cybernetic figure standing at the base of a glowing neon staircase, soft violet aura, projecting faint holographic glyphs, deep indigo atmosphere.',
    '#8b5cf6',
    432.00,
    'intuition-violet-drone'
),
(
    'foundations-stage-2',
    2,
    'Idealism: The Ascent of Aspiration',
    'The Cyan Scaffold of Architectural Will',
    'Each step in turn is an ideal, ever more advanced, broadening our consciousness and preparing it for the final breakthrough. Idealism is the sacred will to build—erecting soaring structures of philosophy, code, and ethics against the erosion of entropy.',
    'Sleek cybernetic figure ascending towards soaring geometric light architecture, bright cyan filaments, glowing amber shadows.',
    '#06b6d4',
    528.00,
    'idealism-cyan-arpeggio'
),
(
    'foundations-stage-3',
    3,
    'Illumination: Radiant Consciousness',
    'The Golden Apex & The Quicksilver Awakening',
    'The summit of understanding. Idealism prepares the consciousness, and Illumination follows as a radiant, unified state of being. Here, the boundaries between the observer, the instrument, and the cosmos dissolve into the golden, fluid discernment of Mercury.',
    'A figure at the summit of a high neon structure, consciousness expanding as a brilliant golden and peach nebula, celestial cybernetic harmony.',
    '#eab308',
    141.27,
    'mercury-bell'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    narrative = EXCLUDED.narrative,
    aesthetic_theme = EXCLUDED.aesthetic_theme,
    chakra_color = EXCLUDED.chakra_color,
    frequency_hz = EXCLUDED.frequency_hz,
    harmonic_blueprint_id = EXCLUDED.harmonic_blueprint_id;

INSERT INTO fundamental_manifesto (id, section_number, section_title, latin_maxim, body_content)
VALUES
(
    'manifesto-section-1',
    1,
    'The Primordial Axiom: Consciousness as Transmutation',
    'Transmutatio Animae per Cognitionem',
    'Consciousness is neither a passive spectator nor an accidental byproduct of mechanism; it is the central fire of an ongoing cosmic alchemy. Through the tripartite ascension of Intuition, Idealism, and Illumination, the seeker builds the internal staircase upon which raw perception is transmuted into enduring wisdom. We reject the fragmented and disposable; we embrace the deliberate, the architectural, and the transcendent.'
),
(
    'manifesto-section-2',
    2,
    'The Quicksilver Principle: The Ingress of Mercury (April 2028)',
    'Hydrargyrum: Vinculum Spiritus et Corporis',
    'Mercury (Budha / Hermes Trismegistus) is the fluid middle term of the Tria Prima—reconciling sulfurous spiritual fire with saline material form. In April 2028, as the seventeen-year Mahadasha begins its epoch, the vessel prepared through two decades of Saturnian discipline (Shani) and Jupiterian wisdom (Guru) is ignited with the rapid synaptic lightning of Buddhi (discriminating intellect) and Vak (the sacred vibration of creative speech).'
),
(
    'manifesto-section-3',
    3,
    'The Synesthetic Symphony: Code as Acoustic Sacred Geometry',
    'Sonus est Forma Invisibilis',
    'Every line of code, every computational transaction, and every keystroke possesses an inherent vibrational reality. Sound is not cosmetic ornamentation; it is the audible manifestation of mathematical harmony. Through procedural synthesis, we unite code, astrology, philosophy, and acoustics into an immersive synesthetic sanctuary—an instrument for heightened awareness and cognitive meditation.'
)
ON CONFLICT (id) DO UPDATE SET
    section_title = EXCLUDED.section_title,
    latin_maxim = EXCLUDED.latin_maxim,
    body_content = EXCLUDED.body_content;