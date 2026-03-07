/**
 * One-time purge of synthetic/seed data from the database.
 * Keeps: accounts, tax_categories, categorization_rules (structural data).
 * Deletes: transaction_lines, transactions, import_rows, sync_batches,
 *          file_import_rows, file_import_batches, estimated_tax_payments.
 *
 * Usage: npx tsx scripts/purge-synthetic-data.ts
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const postgres = await import("postgres");
  const sql = postgres.default(process.env.DATABASE_URL!);

  // Delete in FK order
  // FK order: children before parents
  const tables = [
    "file_import_rows",
    "file_import_batches",
    "import_rows",
    "sync_batches",
    "transaction_lines",
    "transactions",
    "estimated_tax_payments",
    "categorization_rules",
  ];

  console.log("Purging synthetic data...\n");

  for (const table of tables) {
    try {
      const result = await sql.unsafe(`DELETE FROM ${table}`);
      console.log(`  ${table}: ${result.count} rows deleted`);
    } catch (err: any) {
      if (err.code === "42P01") {
        console.log(`  ${table}: table does not exist (skipped)`);
      } else {
        throw err;
      }
    }
  }

  // Show what's left
  console.log("\nRemaining structural data:");
  const [acctCount] = await sql`SELECT count(*) as n FROM accounts`;
  const [taxCount] = await sql`SELECT count(*) as n FROM tax_categories`;
  console.log(`  accounts: ${acctCount.n}`);
  console.log(`  tax_categories: ${taxCount.n}`);

  console.log("\nDone. Database ready for real imports.");
  await sql.end();
}

main().catch((err) => {
  console.error("Purge failed:", err);
  process.exit(1);
});
