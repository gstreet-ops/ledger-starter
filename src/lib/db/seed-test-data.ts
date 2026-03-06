import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { eq } from "drizzle-orm";
import { accounts, transactions, transactionLines, categorizationRules } from "./schema";

async function main() {
  const { drizzle } = await import("drizzle-orm/postgres-js");
  const postgres = await import("postgres");

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");

  const client = postgres.default(connectionString);
  const db = drizzle(client);

  // Look up accounts by code
  const allAccounts = await db.select().from(accounts);
  const byCode = (code: number) => {
    const acct = allAccounts.find((a) => a.code === code);
    if (!acct) throw new Error(`Account ${code} not found — run seed.ts first`);
    return acct.id;
  };

  // Bank account for the credit side of expenses / debit side of income
  const bankAccountId = byCode(1000); // Cash — Business Checking

  // --- Seed categorization rules ---
  console.log("Seeding categorization rules...");
  const rules = [
    { name: "KFC → Meals", pattern: "kfc", matchField: "name", accountId: byCode(5160), priority: 10 },
    { name: "McDonald's → Meals", pattern: "mcdonald", matchField: "name", accountId: byCode(5160), priority: 10 },
    { name: "Uber → Travel", pattern: "uber", matchField: "name", accountId: byCode(5150), priority: 10 },
    { name: "United Airlines → Travel", pattern: "united airlines", matchField: "name", accountId: byCode(5150), priority: 10 },
    { name: "Amazon → Supplies", pattern: "amazon", matchField: "merchant_name", accountId: byCode(5130), priority: 5 },
    { name: "Google Ads → Advertising", pattern: "google ads", matchField: "name", accountId: byCode(5010), priority: 10 },
    { name: "Staples → Office", pattern: "staples", matchField: "name", accountId: byCode(5090), priority: 10 },
    { name: "GitHub → Software", pattern: "github", matchField: "name", accountId: byCode(6010), priority: 10 },
    { name: "AT&T → Telephone", pattern: "at&t", matchField: "name", accountId: byCode(6040), priority: 10 },
    { name: "Stripe Fee → Bank Fees", pattern: "stripe", matchField: "name", accountId: byCode(6030), priority: 5 },
  ];

  for (const rule of rules) {
    await db.insert(categorizationRules).values(rule).onConflictDoNothing();
  }
  console.log(`Seeded ${rules.length} categorization rules.`);

  // --- Seed test transactions ---
  console.log("Seeding test transactions...");

  type TxnInput = { date: string; description: string; expenseAccountCode: number; amount: string; isIncome?: boolean };

  const testTxns: TxnInput[] = [
    // Expenses (20)
    { date: "2026-01-05", description: "GitHub Team — monthly subscription", expenseAccountCode: 6010, amount: "25.00" },
    { date: "2026-01-08", description: "Staples — printer paper and toner", expenseAccountCode: 5090, amount: "87.45" },
    { date: "2026-01-12", description: "Google Ads — Jan campaign", expenseAccountCode: 5010, amount: "350.00" },
    { date: "2026-01-15", description: "AT&T — business phone Jan", expenseAccountCode: 6040, amount: "95.00" },
    { date: "2026-01-18", description: "Uber — client meeting downtown", expenseAccountCode: 5150, amount: "24.50" },
    { date: "2026-01-22", description: "McDonald's — working lunch", expenseAccountCode: 5160, amount: "12.87" },
    { date: "2026-01-28", description: "Amazon — USB-C hub and cables", expenseAccountCode: 5130, amount: "49.99" },
    { date: "2026-02-01", description: "Stripe processing fee — January", expenseAccountCode: 6030, amount: "43.20" },
    { date: "2026-02-05", description: "GitHub Team — monthly subscription", expenseAccountCode: 6010, amount: "25.00" },
    { date: "2026-02-08", description: "United Airlines — SFO conference", expenseAccountCode: 5150, amount: "389.00" },
    { date: "2026-02-10", description: "Marriott — SFO conference hotel", expenseAccountCode: 5150, amount: "245.00" },
    { date: "2026-02-12", description: "KFC — conference dinner", expenseAccountCode: 5160, amount: "18.95" },
    { date: "2026-02-15", description: "AT&T — business phone Feb", expenseAccountCode: 6040, amount: "95.00" },
    { date: "2026-02-20", description: "QuickBooks Self-Employed — annual", expenseAccountCode: 6010, amount: "120.00" },
    { date: "2026-02-25", description: "LegalZoom — LLC annual report filing", expenseAccountCode: 5080, amount: "159.00" },
    { date: "2026-03-01", description: "Google Ads — Feb campaign", expenseAccountCode: 5010, amount: "420.00" },
    { date: "2026-03-03", description: "Udemy — TypeScript Masterclass", expenseAccountCode: 6020, amount: "14.99" },
    { date: "2026-03-04", description: "Stripe processing fee — February", expenseAccountCode: 6030, amount: "51.80" },
    { date: "2026-03-05", description: "Amazon — standing desk mat", expenseAccountCode: 5130, amount: "39.99" },
    { date: "2026-03-05", description: "Georgia Dept of Revenue — business license", expenseAccountCode: 5140, amount: "75.00" },

    // Income (5)
    { date: "2026-01-10", description: "Client payment — Acme Corp web dev", expenseAccountCode: 4000, amount: "4500.00", isIncome: true },
    { date: "2026-01-31", description: "Client payment — Beta LLC consulting", expenseAccountCode: 4000, amount: "3200.00", isIncome: true },
    { date: "2026-02-15", description: "Client payment — Acme Corp maintenance", expenseAccountCode: 4000, amount: "1500.00", isIncome: true },
    { date: "2026-02-28", description: "Client payment — Gamma Inc API build", expenseAccountCode: 4000, amount: "6800.00", isIncome: true },
    { date: "2026-03-05", description: "Client payment — Delta Co site redesign", expenseAccountCode: 4000, amount: "5250.00", isIncome: true },
  ];

  let created = 0;
  for (const txn of testTxns) {
    const expenseAccountId = byCode(txn.expenseAccountCode);
    const lines = txn.isIncome
      ? [
          // Income: debit bank, credit income account
          { accountId: bankAccountId, debit: txn.amount, credit: "0" },
          { accountId: expenseAccountId, debit: "0", credit: txn.amount },
        ]
      : [
          // Expense: debit expense account, credit bank
          { accountId: expenseAccountId, debit: txn.amount, credit: "0" },
          { accountId: bankAccountId, debit: "0", credit: txn.amount },
        ];

    await db.transaction(async (tx) => {
      const [t] = await tx
        .insert(transactions)
        .values({
          date: new Date(txn.date + "T12:00:00Z"),
          description: txn.description,
          status: "posted",
        })
        .returning();

      await tx.insert(transactionLines).values(
        lines.map((l) => ({ transactionId: t.id, ...l }))
      );
    });
    created++;
  }

  console.log(`Seeded ${created} test transactions (${testTxns.filter(t => !t.isIncome).length} expenses, ${testTxns.filter(t => t.isIncome).length} income).`);

  // --- Verify balance invariant ---
  const [check] = await db.execute<{ ok: boolean }>(
    `SELECT NOT EXISTS (
       SELECT transaction_id
       FROM transaction_lines
       GROUP BY transaction_id
       HAVING sum(debit) <> sum(credit)
     ) AS ok`
  );
  console.log(`Balance invariant check: ${(check as any).ok ? "PASS" : "FAIL"}`);

  await client.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
