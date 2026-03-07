/**
 * seed/demo-data.ts
 *
 * Fictional demo transactions for Acme Consulting LLC (Jane Smith, Texas).
 * Run with: npx tsx seed/demo-data.ts
 *
 * These are entirely made up — safe to use in a public template.
 * Run scripts/purge-synthetic-data.ts to remove them.
 */

import { purgeDemoData, seedDemoData } from "../src/lib/services/demo-seed";

async function main() {
  console.log("Purging old demo data...");
  await purgeDemoData();

  console.log("Seeding demo data for Acme Consulting LLC...");
  const result = await seedDemoData();

  console.log(`Created ${result.transactionCount} demo transactions + import rows, file imports, rules, tax payments.`);
  console.log("   Remove with: npx tsx scripts/purge-synthetic-data.ts");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
