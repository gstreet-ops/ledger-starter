/**
 * Test script: run categorization rules against pending import_rows,
 * then post a few matched rows to verify the double-entry flow.
 *
 * Usage: npx tsx scripts/test-categorization.ts
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, sql, and } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";

const {
  accounts,
  importRows,
  plaidAccounts,
  categorizationRules,
  transactions,
  transactionLines,
} = schema;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");

  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  // 1. Load active rules (sorted by priority desc)
  const rules = await db
    .select()
    .from(categorizationRules)
    .where(eq(categorizationRules.isActive, true))
    .orderBy(sql`${categorizationRules.priority} desc`);

  console.log(`\n=== Categorization Rules (${rules.length}) ===`);
  for (const r of rules) {
    console.log(`  [${r.priority}] "${r.pattern}" on ${r.matchField} → ${r.name}`);
  }

  // 2. Load all pending import rows
  const pendingRows = await db
    .select()
    .from(importRows)
    .where(eq(importRows.status, "pending"));

  console.log(`\n=== Pending Import Rows: ${pendingRows.length} ===`);

  if (pendingRows.length === 0) {
    console.log("No pending rows to categorize.");
    await client.end();
    return;
  }

  // 3. Apply rules
  type RuleMatch = {
    ruleId: string;
    accountId: string;
    ruleName: string;
    pattern: string;
  };
  const matched = new Map<string, RuleMatch>();

  for (const row of pendingRows) {
    for (const rule of rules) {
      const pattern = rule.pattern.toLowerCase();
      const field =
        rule.matchField === "merchant_name"
          ? (row.merchantName ?? "").toLowerCase()
          : row.name.toLowerCase();

      if (field.includes(pattern)) {
        matched.set(row.id, {
          ruleId: rule.id,
          accountId: rule.accountId,
          ruleName: rule.name,
          pattern: rule.pattern,
        });
        break;
      }
    }
  }

  const unmatched = pendingRows.filter((r) => !matched.has(r.id));

  console.log(`\n=== Results ===`);
  console.log(`  Matched: ${matched.size}`);
  console.log(`  Unmatched: ${unmatched.length}`);

  // Show matched details
  console.log(`\n--- Matched Rows ---`);
  for (const row of pendingRows) {
    const m = matched.get(row.id);
    if (m) {
      console.log(
        `  "${row.name}" (merchant: ${row.merchantName ?? "null"}) → ${m.ruleName} [pattern: "${m.pattern}"]  amount: ${row.amount}`
      );
    }
  }

  // Show unmatched
  console.log(`\n--- Unmatched Rows ---`);
  for (const row of unmatched) {
    console.log(`  "${row.name}" (merchant: ${row.merchantName ?? "null"})  amount: ${row.amount}`);
  }

  // 4. Post up to 3 matched rows to test the posting flow
  const toPost = pendingRows.filter((r) => matched.has(r.id)).slice(0, 3);

  if (toPost.length === 0) {
    console.log("\nNo matched rows to post.");
    await client.end();
    return;
  }

  // Find bank account for the source side — look up the plaidAccount's ledgerAccountId,
  // fall back to account code 1000 (Business Checking)
  const [bankAccount] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.code, 1000));

  if (!bankAccount) {
    console.error("No bank account (code 1000) found — cannot post.");
    await client.end();
    return;
  }

  console.log(`\n=== Posting ${toPost.length} matched rows ===`);
  console.log(`  Bank account: ${bankAccount.name} (${bankAccount.code})`);

  for (const row of toPost) {
    const m = matched.get(row.id)!;
    const amountNum = parseFloat(row.amount);
    const absAmount = Math.abs(amountNum).toFixed(2);
    const isExpense = amountNum > 0;

    const lines = isExpense
      ? [
          { accountId: m.accountId, debit: absAmount, credit: "0" },
          { accountId: bankAccount.id, debit: "0", credit: absAmount },
        ]
      : [
          { accountId: bankAccount.id, debit: absAmount, credit: "0" },
          { accountId: m.accountId, debit: "0", credit: absAmount },
        ];

    // Verify balance before posting
    const totalDebit = lines.reduce((s, l) => s + parseFloat(l.debit), 0);
    const totalCredit = lines.reduce((s, l) => s + parseFloat(l.credit), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      console.error(`  BALANCE ERROR for "${row.name}": debit=${totalDebit} credit=${totalCredit}`);
      continue;
    }

    const result = await db.transaction(async (tx) => {
      const [txn] = await tx
        .insert(transactions)
        .values({
          date: row.date,
          description: row.name,
          status: "posted",
        })
        .returning();

      const createdLines = await tx
        .insert(transactionLines)
        .values(lines.map((l) => ({ transactionId: txn.id, ...l })))
        .returning();

      await tx
        .update(importRows)
        .set({ transactionId: txn.id, status: "matched" })
        .where(eq(importRows.id, row.id));

      return { transaction: txn, lines: createdLines };
    });

    console.log(
      `  POSTED: "${row.name}" → txn ${result.transaction.id.slice(0, 8)}... ` +
      `| ${isExpense ? "expense" : "income"} $${absAmount} ` +
      `| lines: ${result.lines.length} ` +
      `| debit=${result.lines.reduce((s, l) => s + parseFloat(l.debit), 0).toFixed(2)} ` +
      `| credit=${result.lines.reduce((s, l) => s + parseFloat(l.credit), 0).toFixed(2)}`
    );
  }

  // 5. Verify: global balance invariant
  const [check] = await db.execute(
    sql`SELECT NOT EXISTS (
       SELECT transaction_id
       FROM transaction_lines
       GROUP BY transaction_id
       HAVING sum(debit) <> sum(credit)
     ) AS ok`
  );
  console.log(`\n=== Balance Invariant: ${(check as any).ok ? "PASS ✓" : "FAIL ✗"} ===`);

  // 6. Updated counts
  const [pendingCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(importRows)
    .where(eq(importRows.status, "pending"));
  const [matchedCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(importRows)
    .where(eq(importRows.status, "matched"));

  console.log(`\n=== Final Counts ===`);
  console.log(`  Pending: ${pendingCount.count}`);
  console.log(`  Matched: ${matchedCount.count}`);

  await client.end();
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
