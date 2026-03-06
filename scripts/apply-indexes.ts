import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const postgres = await import("postgres");
  const sql = postgres.default(process.env.DATABASE_URL!);

  const indexes = [
    `CREATE INDEX IF NOT EXISTS idx_rules_active_priority ON categorization_rules USING btree (is_active, priority)`,
    `CREATE INDEX IF NOT EXISTS idx_import_rows_status ON import_rows USING btree (status)`,
    `CREATE INDEX IF NOT EXISTS idx_import_rows_sync_batch_id ON import_rows USING btree (sync_batch_id)`,
    `CREATE INDEX IF NOT EXISTS idx_txn_lines_transaction_id ON transaction_lines USING btree (transaction_id)`,
    `CREATE INDEX IF NOT EXISTS idx_txn_lines_account_id ON transaction_lines USING btree (account_id)`,
    `CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions USING btree (date)`,
    `CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions USING btree (status)`,
  ];

  for (const ddl of indexes) {
    await sql.unsafe(ddl);
    console.log(`OK: ${ddl.split(" ON ")[1]}`);
  }

  console.log(`\nAll ${indexes.length} indexes created.`);
  await sql.end();
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
