-- 000002_create_dashas_and_nakshatras.up.sql
CREATE TABLE IF NOT EXISTS planetary_dashas (
    id SERIAL PRIMARY KEY,
    mahadasha_lord VARCHAR(100) NOT NULL UNIQUE,
    total_years INT NOT NULL,
    vimshottari_order INT NOT NULL,
    seed_deity VARCHAR(150) NOT NULL,
    gemstone VARCHAR(100) NOT NULL,
    mantra TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dasha_sub_periods (
    id SERIAL PRIMARY KEY,
    dasha_id INT NOT NULL REFERENCES planetary_dashas(id) ON DELETE CASCADE,
    sub_lord VARCHAR(100) NOT NULL,
    duration_years NUMERIC(5, 2) NOT NULL,
    duration_months INT NOT NULL,
    duration_days INT NOT NULL,
    qualities TEXT NOT NULL,
    psychological TEXT NOT NULL,
    material TEXT NOT NULL,
    esoteric TEXT NOT NULL,
    talismanic TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sub_periods_dasha_id ON dasha_sub_periods(dasha_id);

CREATE TABLE IF NOT EXISTS nakshatras (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    sanskrit_name VARCHAR(150) NOT NULL,
    zodiac_span VARCHAR(100) NOT NULL,
    symbol VARCHAR(150) NOT NULL,
    deity VARCHAR(150) NOT NULL,
    shakti TEXT NOT NULL,
    esoteric_meaning TEXT NOT NULL,
    qualities JSONB NOT NULL DEFAULT '[]'::jsonb,
    ruler VARCHAR(50) NOT NULL DEFAULT 'Mercury',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
