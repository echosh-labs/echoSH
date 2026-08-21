-- 000005_create_transitional_portal.up.sql
CREATE TABLE IF NOT EXISTS dasha_transitions (
    id VARCHAR(100) PRIMARY KEY,
    native_name VARCHAR(150) NOT NULL,
    current_mahadasha VARCHAR(100) NOT NULL,
    current_antardasha VARCHAR(100) NOT NULL,
    cycle_name VARCHAR(255) NOT NULL,
    target_ingress_date DATE NOT NULL,
    theme TEXT NOT NULL,
    saturnine_mastery JSONB NOT NULL DEFAULT '[]'::jsonb,
    jupiterian_synthesis JSONB NOT NULL DEFAULT '[]'::jsonb,
    mercurial_readiness JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transition_reflections (
    id SERIAL PRIMARY KEY,
    transition_id VARCHAR(100) REFERENCES dasha_transitions(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    astrological_note VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed Transition Record
INSERT INTO dasha_transitions (
    id, native_name, current_mahadasha, current_antardasha, cycle_name, target_ingress_date, theme,
    saturnine_mastery, jupiterian_synthesis, mercurial_readiness
) VALUES (
    'shani-guru-to-budha',
    'Justin Andrew Wood',
    'Saturn (Shani)',
    'Jupiter (Guru)',
    'The Great Dasha Chidra: Transition into Mercury',
    '2028-04-15',
    'Distilling two decades of structural discipline and karmic endurance into high-order philosophical wisdom, preparing the vessel for the rapid synaptic flow and linguistic alchemy of Mercury in April 2028.',
    '["Consolidating 19 years of architectural rigor, sober patience, and structural foundation.", "Honoring karmic boundaries and releasing outworn material weights.", "Mastering patience: enduring the forge before receiving the quicksilver."]'::jsonb,
    '["Synthesizing lived experience into universal philosophical doctrine.", "Receiving the grace, expansiveness, and spiritual illumination of Guru.", "Integrating moral authority, mentorship, and sacred wisdom."]'::jsonb,
    '["Scaffolding high-performance Go, PostgreSQL, and BoltDB computational vessels.", "Refining linguistic precision, sacred speech (Vak), and written treatises.", "Cultivating fluid adaptability without compromising foundational bedrock."]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    theme = EXCLUDED.theme,
    saturnine_mastery = EXCLUDED.saturnine_mastery,
    jupiterian_synthesis = EXCLUDED.jupiterian_synthesis,
    mercurial_readiness = EXCLUDED.mercurial_readiness;
