import { taxCategories } from "./schema";

export const seedTaxCategories = [
  // Schedule C line items
  { name: "Gross Receipts", formLine: "1", form: "schedule_c", description: "Gross receipts or sales" },
  { name: "Returns & Allowances", formLine: "2", form: "schedule_c", description: "Returns and allowances" },
  { name: "Other Income", formLine: "6", form: "schedule_c", description: "Other income, including federal and state gasoline or fuel tax credit or refund" },
  { name: "Advertising", formLine: "8", form: "schedule_c", description: "Advertising expenses" },
  { name: "Car & Truck Expenses", formLine: "9", form: "schedule_c", description: "Car and truck expenses (see instructions)" },
  { name: "Commissions & Fees", formLine: "10", form: "schedule_c", description: "Commissions and fees" },
  { name: "Contract Labor", formLine: "11", form: "schedule_c", description: "Contract labor (see instructions)" },
  { name: "Insurance", formLine: "15", form: "schedule_c", description: "Insurance (other than health)" },
  { name: "Interest — Mortgage", formLine: "16a", form: "schedule_c", description: "Interest on business indebtedness — mortgage" },
  { name: "Interest — Other", formLine: "16b", form: "schedule_c", description: "Interest on business indebtedness — other" },
  { name: "Legal & Professional Services", formLine: "17", form: "schedule_c", description: "Legal and professional services" },
  { name: "Office Expense", formLine: "18", form: "schedule_c", description: "Office expense (see instructions)" },
  { name: "Rent — Vehicles/Equipment", formLine: "20a", form: "schedule_c", description: "Rent or lease — vehicles, machinery, and equipment" },
  { name: "Rent — Other", formLine: "20b", form: "schedule_c", description: "Rent or lease — other business property" },
  { name: "Repairs & Maintenance", formLine: "21", form: "schedule_c", description: "Repairs and maintenance" },
  { name: "Supplies", formLine: "22", form: "schedule_c", description: "Supplies (not included in Part III)" },
  { name: "Taxes & Licenses", formLine: "23", form: "schedule_c", description: "Taxes and licenses" },
  { name: "Travel", formLine: "24a", form: "schedule_c", description: "Travel and transportation" },
  { name: "Meals (50% deductible)", formLine: "24b", form: "schedule_c", description: "Deductible meals (see instructions) — 50% limitation" },
  { name: "Utilities", formLine: "25", form: "schedule_c", description: "Utilities" },
  { name: "Wages", formLine: "26", form: "schedule_c", description: "Wages (less employment credits)" },
  { name: "Other Expenses", formLine: "27a", form: "schedule_c", description: "Other expenses (from line 48)" },

  // Georgia Form 500
  { name: "GA Pass-Through Income", formLine: "pass_through", form: "ga_500", description: "Georgia Form 500 pass-through income from disregarded entity" },

  // Self-employment tax
  { name: "Self-Employment Tax", formLine: "se_tax", form: "se_tax", description: "Self-employment tax on net profit (15.3% on 92.35% of net profit)" },
];

// Run seed: npx tsx src/lib/db/seed-tax-categories.ts
async function main() {
  const { drizzle } = await import("drizzle-orm/postgres-js");
  const postgres = await import("postgres");

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  const client = postgres.default(connectionString);
  const db = drizzle(client);

  console.log("Seeding tax categories...");

  await db.insert(taxCategories).values(seedTaxCategories).onConflictDoNothing();

  console.log(`Seeded ${seedTaxCategories.length} tax categories.`);

  await client.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
