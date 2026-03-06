import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { readFileSync } from "fs";

async function main() {
  const postgres = await import("postgres");
  const sql = postgres.default(process.env.DATABASE_URL!);

  const migration = readFileSync("drizzle/0003_add-file-import-tables.sql", "utf-8");
  const statements = migration
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const stmt of statements) {
    await sql.unsafe(stmt);
    const preview = stmt.slice(0, 60).replace(/\n/g, " ");
    console.log(`OK: ${preview}...`);
  }

  console.log(`\nApplied ${statements.length} statements.`);
  await sql.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
