CREATE INDEX "idx_rules_active_priority" ON "categorization_rules" USING btree ("is_active","priority");--> statement-breakpoint
CREATE INDEX "idx_import_rows_status" ON "import_rows" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_import_rows_sync_batch_id" ON "import_rows" USING btree ("sync_batch_id");--> statement-breakpoint
CREATE INDEX "idx_txn_lines_transaction_id" ON "transaction_lines" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "idx_txn_lines_account_id" ON "transaction_lines" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_date" ON "transactions" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_transactions_status" ON "transactions" USING btree ("status");