-- PostgreSQL Relational Schema for Mercury Dasha Infrastructure
CREATE TABLE IF NOT EXISTS astrological_transits (
    id SERIAL PRIMARY KEY,
    planet VARCHAR(50) NOT NULL,
    sign VARCHAR(50) NOT NULL,
    degree NUMERIC(6, 3) NOT NULL,
    is_retrograde BOOLEAN DEFAULT FALSE,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dasha_logs (
    id SERIAL PRIMARY KEY,
    native_name VARCHAR(100) NOT NULL,
    mahadasha_lord VARCHAR(50) NOT NULL,
    antardasha_lord VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS author_events (
    id SERIAL PRIMARY KEY,
    author_name VARCHAR(100) NOT NULL,
    event_title VARCHAR(255) NOT NULL,
    cycle_period VARCHAR(100) NOT NULL,
    resonance_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
