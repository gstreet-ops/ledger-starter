/**
 * seed/demo-data.ts
 *
 * Fictional demo transactions for Acme Consulting LLC (Jane Smith, Texas).
 * Run with: npx tsx seed/demo-data.ts
 *
 * These are entirely made up — safe to use in a public template.
 * Run scripts/purge-synthetic-data.ts to remove them.
 */

import { db } from "../src/lib/db/drizzle";
import { accounts, transactions, transactionLines, taxCategories } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

const DEMO_TAG = "DEMO"; // used to identify demo rows for purge

async function main() {
  console.log("Seeding demo data for Acme Consulting LLC...");

  // Fetch accounts by code
  const allAccounts = await db.select().from(accounts);
  const byCode = Object.fromEntries(allAccounts.map((a) => [a.code, a.id]));

  const checking = byCode["1010"]; // Checking Account
  const revenue  = byCode["4010"]; // Consulting Revenue
  const software = byCode["6010"] ?? byCode["6020"]; // Software / Subscriptions
  const meals    = byCode["6050"] ?? byCode["6040"]; // Meals
  const office   = byCode["6030"]; // Office Supplies
  const travel   = byCode["6060"]; // Travel
  const marketing= byCode["6070"] ?? byCode["6080"]; // Marketing / Advertising

  if (!checking || !revenue) {
    console.error("Required accounts not found. Run `npx drizzle-kit push` and seed the Chart of Accounts first.");
    process.exit(1);
  }

  const demos: Array<{ date: Date; description: string; amount: number; debit: string; credit: string; category: string }> = [
    // Income
    { date: new Date("2026-01-15"), description: "Acme Invoice #001 — Website Redesign", amount: 500000, debit: checking, credit: revenue, category: "income" },
    { date: new Date("2026-02-01"), description: "Acme Invoice #002 — SEO Consulting", amount: 250000, debit: checking, credit: revenue, category: "income" },
    { date: new Date("2026-03-10"), description: "Acme Invoice #003 — Monthly Retainer", amount: 300000, debit: checking, credit: revenue, category: "income" },
    { date: new Date("2026-04-05"), description: "Acme Invoice #004 — Logo Design", amount: 150000, debit: checking, credit: revenue, category: "income" },
    { date: new Date("2026-05-20"), description: "Acme Invoice #005 — Monthly Retainer", amount: 300000, debit: checking, credit: revenue, category: "income" },

    // Software
    { date: new Date("2026-01-02"), description: "Notion — Annual Plan", amount: 9600, debit: software, credit: checking, category: "expense" },
    { date: new Date("2026-01-05"), description: "GitHub Copilot — Monthly", amount: 1000, debit: software, credit: checking, category: "expense" },
    { date: new Date("2026-02-05"), description: "GitHub Copilot — Monthly", amount: 1000, debit: software, credit: checking, category: "expense" },
    { date: new Date("2026-01-15"), description: "Adobe Creative Cloud — Monthly", amount: 5500, debit: software, credit: checking, category: "expense" },
    { date: new Date("2026-02-15"), description: "Adobe Creative Cloud — Monthly", amount: 5500, debit: software, credit: checking, category: "expense" },
    { date: new Date("2026-03-01"), description: "Figma — Professional Plan", amount: 1500, debit: software, credit: checking, category: "expense" },

    // Office
    { date: new Date("2026-01-20"), description: "Staples — Printer Ink + Paper", amount: 4700, debit: office, credit: checking, category: "expense" },
    { date: new Date("2026-02-12"), description: "Amazon — External Monitor Stand", amount: 8900, debit: office, credit: checking, category: "expense" },
    { date: new Date("2026-03-18"), description: "USPS — Client Mailing", amount: 2100, debit: office, credit: checking, category: "expense" },

    // Meals (50% deductible in real life — simplified here)
    { date: new Date("2026-01-25"), description: "The Capital Grille — Client Dinner (Jane + client)", amount: 18500, debit: meals, credit: checking, category: "expense" },
    { date: new Date("2026-02-14"), description: "Starbucks — Client Meeting Coffee", amount: 2400, debit: meals, credit: checking, category: "expense" },
    { date: new Date("2026-03-22"), description: "Flores Restaurant — Team Lunch", amount: 6700, debit: meals, credit: checking, category: "expense" },

    // Travel
    { date: new Date("2026-02-20"), description: "Southwest Airlines — Austin → Chicago (client visit)", amount: 42000, debit: travel, credit: checking, category: "expense" },
    { date: new Date("2026-02-21"), description: "Hilton Chicago — 2 nights", amount: 38000, debit: travel, credit: checking, category: "expense" },
    { date: new Date("2026-02-22"), description: "Uber — Airport to Hotel", amount: 3200, debit: travel, credit: checking, category: "expense" },

    // Marketing
    { date: new Date("2026-03-05"), description: "Meta Ads — February Campaign", amount: 15000, debit: marketing, credit: checking, category: "expense" },
    { date: new Date("2026-04-01"), description: "Canva Pro — Annual", amount: 14900, debit: marketing, credit: checking, category: "expense" },
  ];

  let created = 0;
  for (const d of demos) {
    const txId = crypto.randomUUID();
    await db.insert(transactions).values({
      id: txId,
      date: d.date,
      description: d.description,
      memo: DEMO_TAG,
      status: "posted",
    });
    await db.insert(transactionLines).values([
      { transactionId: txId, accountId: d.debit,  debit: String(d.amount / 100), credit: "0.00" },
      { transactionId: txId, accountId: d.credit, debit: "0.00", credit: String(d.amount / 100) },
    ]);
    created++;
  }

  console.log(`✅ Created ${created} demo transactions.`);
  console.log("   Remove with: npx tsx scripts/purge-synthetic-data.ts");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
