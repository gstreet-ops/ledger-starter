import "dotenv/config";
import { db } from "../src/lib/db/drizzle";
import { accounts, userSettings } from "../src/lib/db/schema";

const seedAccounts = [
  { code: 1000, name: "Cash — Business Checking", type: "asset" as const, scheduleCLine: null, stateFormCategory: null },
  { code: 1010, name: "Cash — Business Savings", type: "asset" as const, scheduleCLine: null, stateFormCategory: null },
  { code: 1020, name: "Accounts Receivable", type: "asset" as const, scheduleCLine: null, stateFormCategory: null },
  { code: 1030, name: "Credit Card Clearing", type: "asset" as const, scheduleCLine: null, stateFormCategory: null },
  { code: 2000, name: "Credit Card — Chase", type: "liability" as const, scheduleCLine: null, stateFormCategory: null },
  { code: 2010, name: "Credit Card — Amex", type: "liability" as const, scheduleCLine: null, stateFormCategory: null },
  { code: 3000, name: "Owner's Equity", type: "equity" as const, scheduleCLine: null, stateFormCategory: null },
  { code: 3010, name: "Owner's Draw", type: "equity" as const, scheduleCLine: null, stateFormCategory: null },
  { code: 3020, name: "Retained Earnings", type: "equity" as const, scheduleCLine: null, stateFormCategory: null },
  { code: 4000, name: "Gross Receipts — Services", type: "income" as const, scheduleCLine: "1", stateFormCategory: "income" },
  { code: 4010, name: "Other Income", type: "income" as const, scheduleCLine: "6", stateFormCategory: "income" },
  { code: 5010, name: "Advertising", type: "expense" as const, scheduleCLine: "8", stateFormCategory: "expense" },
  { code: 5040, name: "Contract Labor", type: "expense" as const, scheduleCLine: "11", stateFormCategory: "expense" },
  { code: 5080, name: "Legal & Professional Services", type: "expense" as const, scheduleCLine: "17", stateFormCategory: "expense" },
  { code: 5090, name: "Office Expense", type: "expense" as const, scheduleCLine: "18", stateFormCategory: "expense" },
  { code: 5130, name: "Supplies", type: "expense" as const, scheduleCLine: "22", stateFormCategory: "expense" },
  { code: 5150, name: "Travel", type: "expense" as const, scheduleCLine: "24a", stateFormCategory: "expense" },
  { code: 5160, name: "Meals (50% deductible)", type: "expense" as const, scheduleCLine: "24b", stateFormCategory: "expense" },
  { code: 5180, name: "Other Expenses", type: "expense" as const, scheduleCLine: "27a", stateFormCategory: "expense" },
  { code: 6010, name: "Software & Subscriptions", type: "expense" as const, scheduleCLine: "27a", stateFormCategory: "expense" },
  { code: 6020, name: "Education & Training", type: "expense" as const, scheduleCLine: "27a", stateFormCategory: "expense" },
  { code: 6030, name: "Office Supplies", type: "expense" as const, scheduleCLine: "27a", stateFormCategory: "expense" },
  { code: 6040, name: "Telephone & Internet", type: "expense" as const, scheduleCLine: "27a", stateFormCategory: "expense" },
  { code: 6050, name: "Meals & Entertainment", type: "expense" as const, scheduleCLine: "24b", stateFormCategory: "expense" },
  { code: 6060, name: "Travel & Lodging", type: "expense" as const, scheduleCLine: "24a", stateFormCategory: "expense" },
  { code: 6070, name: "Marketing & Promotion", type: "expense" as const, scheduleCLine: "8", stateFormCategory: "expense" },
];

async function main() {
  console.log("1/2 Seeding chart of accounts...");
  await db.insert(accounts).values(seedAccounts).onConflictDoNothing();
  console.log(`    Seeded ${seedAccounts.length} accounts.`);

  console.log("2/2 Creating demo user_settings (setup complete)...");
  await db.insert(userSettings).values({
    entityType: "single_member_llc",
    state: "TX",
    filingMethod: "schedule_c",
    taxYearStart: "01-01",
    fiscalYearEnd: "12-31",
    plaidEnabled: false,
    businessName: "Acme Consulting LLC",
    ownerName: "Jane Smith",
    timezone: "America/Chicago",
    setupComplete: true,
  }).onConflictDoNothing();
  console.log("    Done.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
