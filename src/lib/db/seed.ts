import "dotenv/config";
import { accounts } from "./schema";

// Initial chart of accounts with Schedule C line mappings
export const seedAccounts = [
  // Assets (1xxx)
  { code: 1000, name: "Cash — Business Checking", type: "asset" as const, scheduleCLine: null, gaFormCategory: null },
  { code: 1010, name: "Cash — Business Savings", type: "asset" as const, scheduleCLine: null, gaFormCategory: null },
  { code: 1020, name: "Accounts Receivable", type: "asset" as const, scheduleCLine: null, gaFormCategory: null },
  { code: 1030, name: "Credit Card Clearing", type: "asset" as const, scheduleCLine: null, gaFormCategory: null },

  // Liabilities (2xxx)
  { code: 2000, name: "Credit Card — Chase", type: "liability" as const, scheduleCLine: null, gaFormCategory: null },
  { code: 2010, name: "Credit Card — Amex", type: "liability" as const, scheduleCLine: null, gaFormCategory: null },

  // Equity (3xxx)
  { code: 3000, name: "Owner's Equity", type: "equity" as const, scheduleCLine: null, gaFormCategory: null },
  { code: 3010, name: "Owner's Draw", type: "equity" as const, scheduleCLine: null, gaFormCategory: null },
  { code: 3020, name: "Retained Earnings", type: "equity" as const, scheduleCLine: null, gaFormCategory: null },

  // Income (4xxx)
  { code: 4000, name: "Gross Receipts — Services", type: "income" as const, scheduleCLine: "1", gaFormCategory: "income" },
  { code: 4010, name: "Other Income", type: "income" as const, scheduleCLine: "6", gaFormCategory: "income" },

  // Expenses (5xxx) — Schedule C Part II
  { code: 5010, name: "Advertising", type: "expense" as const, scheduleCLine: "8", gaFormCategory: "expense" },
  { code: 5020, name: "Car & Truck Expenses", type: "expense" as const, scheduleCLine: "9", gaFormCategory: "expense" },
  { code: 5030, name: "Commissions & Fees", type: "expense" as const, scheduleCLine: "10", gaFormCategory: "expense" },
  { code: 5040, name: "Contract Labor", type: "expense" as const, scheduleCLine: "11", gaFormCategory: "expense" },
  { code: 5050, name: "Insurance (non-health)", type: "expense" as const, scheduleCLine: "15", gaFormCategory: "expense" },
  { code: 5060, name: "Interest — Mortgage", type: "expense" as const, scheduleCLine: "16a", gaFormCategory: "expense" },
  { code: 5070, name: "Interest — Other", type: "expense" as const, scheduleCLine: "16b", gaFormCategory: "expense" },
  { code: 5080, name: "Legal & Professional Services", type: "expense" as const, scheduleCLine: "17", gaFormCategory: "expense" },
  { code: 5090, name: "Office Expense", type: "expense" as const, scheduleCLine: "18", gaFormCategory: "expense" },
  { code: 5100, name: "Rent — Vehicles/Equipment", type: "expense" as const, scheduleCLine: "20a", gaFormCategory: "expense" },
  { code: 5110, name: "Rent — Other", type: "expense" as const, scheduleCLine: "20b", gaFormCategory: "expense" },
  { code: 5120, name: "Repairs & Maintenance", type: "expense" as const, scheduleCLine: "21", gaFormCategory: "expense" },
  { code: 5130, name: "Supplies", type: "expense" as const, scheduleCLine: "22", gaFormCategory: "expense" },
  { code: 5140, name: "Taxes & Licenses", type: "expense" as const, scheduleCLine: "23", gaFormCategory: "expense" },
  { code: 5150, name: "Travel", type: "expense" as const, scheduleCLine: "24a", gaFormCategory: "expense" },
  { code: 5160, name: "Meals (50% deductible)", type: "expense" as const, scheduleCLine: "24b", gaFormCategory: "expense" },
  { code: 5170, name: "Utilities", type: "expense" as const, scheduleCLine: "25", gaFormCategory: "expense" },
  { code: 5180, name: "Other Expenses", type: "expense" as const, scheduleCLine: "27a", gaFormCategory: "expense" },

  // Expenses (6xxx) — common sub-categories for "Other Expenses" line 27
  { code: 6010, name: "Software & Subscriptions", type: "expense" as const, scheduleCLine: "27a", gaFormCategory: "expense" },
  { code: 6020, name: "Education & Training", type: "expense" as const, scheduleCLine: "27a", gaFormCategory: "expense" },
  { code: 6030, name: "Bank Fees & Charges", type: "expense" as const, scheduleCLine: "27a", gaFormCategory: "expense" },
  { code: 6040, name: "Telephone & Internet", type: "expense" as const, scheduleCLine: "27a", gaFormCategory: "expense" },
];

// Run seed: npx tsx src/lib/db/seed.ts
async function main() {
  const { drizzle } = await import("drizzle-orm/postgres-js");
  const postgres = await import("postgres");

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  const client = postgres.default(connectionString);
  const db = drizzle(client);

  console.log("Seeding chart of accounts...");

  await db.insert(accounts).values(seedAccounts).onConflictDoNothing();

  console.log(`Seeded ${seedAccounts.length} accounts.`);

  await client.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
