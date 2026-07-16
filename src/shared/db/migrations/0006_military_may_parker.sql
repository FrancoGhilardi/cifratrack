ALTER TABLE "yield_rates" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "yield_rates" CASCADE;--> statement-breakpoint
DROP INDEX "idx_tx_user_date";--> statement-breakpoint
DROP INDEX "idx_tx_user_kind";--> statement-breakpoint
DROP INDEX "idx_tx_user_month";--> statement-breakpoint
CREATE INDEX "idx_tx_user_date" ON "transactions" USING btree ("user_id","occurred_on");--> statement-breakpoint
CREATE INDEX "idx_tx_user_kind" ON "transactions" USING btree ("user_id","kind");--> statement-breakpoint
CREATE INDEX "idx_tx_user_month" ON "transactions" USING btree ("user_id","occurred_month");