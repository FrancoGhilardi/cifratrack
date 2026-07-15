-- pg_trgm no tiene primitiva en drizzle-orm/pg-core; requerido por gin_trgm_ops de abajo
CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
CREATE INDEX "idx_tx_title_search_trgm" ON "transactions" USING gin (translate(lower("title"), 'áéíóúäëïöüñ', 'aeiouaeioun') gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "idx_tx_description_search_trgm" ON "transactions" USING gin (translate(lower("description"), 'áéíóúäëïöüñ', 'aeiouaeioun') gin_trgm_ops);