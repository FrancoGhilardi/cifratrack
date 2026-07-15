DROP INDEX "idx_tx_user_date";--> statement-breakpoint
CREATE INDEX "idx_tx_source_recurring_rule" ON "transactions" USING btree ("source_recurring_rule_id");--> statement-breakpoint
CREATE INDEX "idx_tx_payment_method" ON "transactions" USING btree ("payment_method_id");--> statement-breakpoint
CREATE INDEX "idx_tx_user_date" ON "transactions" USING btree ("user_id","occurred_on","id");