-- 000003_create_alchemical_and_opus.up.sql
CREATE TABLE IF NOT EXISTS alchemical_principles (
    id SERIAL PRIMARY KEY,
    principle VARCHAR(100) NOT NULL UNIQUE,
    latin_name VARCHAR(150) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    element VARCHAR(100) NOT NULL,
    role VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    properties JSONB NOT NULL DEFAULT '[]'::jsonb,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS author_profiles (
    id SERIAL PRIMARY KEY,
    author_name VARCHAR(150) NOT NULL UNIQUE,
    bio TEXT NOT NULL,
    opus_title VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS author_essays (
    id SERIAL PRIMARY KEY,
    author_id INT NOT NULL REFERENCES author_profiles(id) ON DELETE CASCADE,
    slug VARCHAR(150) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    essay_date VARCHAR(50) NOT NULL,
    theme VARCHAR(150) NOT NULL,
    abstract TEXT NOT NULL,
    content TEXT NOT NULL,
    key_insights JSONB NOT NULL DEFAULT '[]'::jsonb,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS author_life_events (
    id SERIAL PRIMARY KEY,
    author_id INT NOT NULL REFERENCES author_profiles(id) ON DELETE CASCADE,
    period VARCHAR(150) NOT NULL,
    title VARCHAR(255) NOT NULL,
    cycle VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    mercurial_resonance TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS astrological_transits (
    id SERIAL PRIMARY KEY,
    planet VARCHAR(50) NOT NULL DEFAULT 'Mercury',
    sign VARCHAR(50) NOT NULL,
    degree NUMERIC(6, 3) NOT NULL,
    is_retrograde BOOLEAN NOT NULL DEFAULT FALSE,
    aspects JSONB DEFAULT '{}'::jsonb,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
