-- 000001_create_foundations.up.sql
CREATE TABLE IF NOT EXISTS foundational_axioms (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(150) NOT NULL,
    statement_text TEXT NOT NULL,
    archetypes JSONB NOT NULL DEFAULT '[]'::jsonb,
    correspondences JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_foundational_axioms_active ON foundational_axioms(is_active);
