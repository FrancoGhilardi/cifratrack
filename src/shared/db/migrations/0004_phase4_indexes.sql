-- Phase 4: indexes and search optimizations

-- Enable trigram indexes for LIKE/ILIKE searches
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Fix invalid operator class indexes from initial migration
DROP INDEX IF EXISTS idx_tx_user_date;
DROP INDEX IF EXISTS idx_tx_user_kind;
DROP INDEX IF EXISTS idx_tx_user_month;
DROP INDEX IF EXISTS idx_tx_user_status;

-- Recreate base transaction indexes with correct defaults
CREATE INDEX IF NOT EXISTS idx_tx_user_date ON transactions (user_id, occurred_on, id);
CREATE INDEX IF NOT EXISTS idx_tx_user_kind ON transactions (user_id, kind);
CREATE INDEX IF NOT EXISTS idx_tx_user_month ON transactions (user_id, occurred_month, occurred_on, id);
CREATE INDEX IF NOT EXISTS idx_tx_user_status ON transactions (user_id, status);

-- Additional composite indexes aligned with filters/sorts
CREATE INDEX IF NOT EXISTS idx_tx_user_created_at ON transactions (user_id, created_at, id);
CREATE INDEX IF NOT EXISTS idx_tx_source_month ON transactions (source_recurring_rule_id, occurred_month);
CREATE INDEX IF NOT EXISTS idx_txcat_category_tx ON transaction_categories (category_id, transaction_id);
CREATE INDEX IF NOT EXISTS idx_investments_user_started_on ON investments (user_id, started_on, id);

-- Trigram indexes for text search
CREATE INDEX IF NOT EXISTS idx_tx_title_trgm ON transactions USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tx_description_trgm ON transactions USING gin (description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_investments_title_trgm ON investments USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_investments_platform_trgm ON investments USING gin (platform gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_investments_notes_trgm ON investments USING gin (notes gin_trgm_ops);
