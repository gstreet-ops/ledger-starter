/**
 * Shared demo seed logic — used by both seed/demo-data.ts (CLI) and the reset API.
 */

import { db } from "@/lib/db/drizzle";
import {
  accounts,
  transactions,
  transactionLines,
  fileImportBatches,
  fileImportRows,
  categorizationRules,
  estimatedTaxPayments,
  plaidItems,
  plaidAccounts,
  syncBatches,
  importRows,
} from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

const DEMO_TAG = "DEMO";

const DEMO_TRANSACTIONS = [
  // Income
  { date: "2026-01-15", description: "Acme Invoice #001 — Website Redesign", amount: 500000, debitCode: 1010, creditCode: 4010, category: "income" },
  { date: "2026-02-01", description: "Acme Invoice #002 — SEO Consulting", amount: 250000, debitCode: 1010, creditCode: 4010, category: "income" },
  { date: "2026-03-10", description: "Acme Invoice #003 — Monthly Retainer", amount: 300000, debitCode: 1010, creditCode: 4010, category: "income" },
  { date: "2026-04-05", description: "Acme Invoice #004 — Logo Design", amount: 150000, debitCode: 1010, creditCode: 4010, category: "income" },
  { date: "2026-05-20", description: "Acme Invoice #005 — Monthly Retainer", amount: 300000, debitCode: 1010, creditCode: 4010, category: "income" },
  // Software
  { date: "2026-01-02", description: "Notion — Annual Plan", amount: 9600, debitCode: 6010, creditCode: 1010, category: "expense" },
  { date: "2026-01-05", description: "GitHub Copilot — Monthly", amount: 1000, debitCode: 6010, creditCode: 1010, category: "expense" },
  { date: "2026-02-05", description: "GitHub Copilot — Monthly", amount: 1000, debitCode: 6010, creditCode: 1010, category: "expense" },
  { date: "2026-01-15", description: "Adobe Creative Cloud — Monthly", amount: 5500, debitCode: 6010, creditCode: 1010, category: "expense" },
  { date: "2026-02-15", description: "Adobe Creative Cloud — Monthly", amount: 5500, debitCode: 6010, creditCode: 1010, category: "expense" },
  { date: "2026-03-01", description: "Figma — Professional Plan", amount: 1500, debitCode: 6010, creditCode: 1010, category: "expense" },
  // Office
  { date: "2026-01-20", description: "Staples — Printer Ink + Paper", amount: 4700, debitCode: 6030, creditCode: 1010, category: "expense" },
  { date: "2026-02-12", description: "Amazon — External Monitor Stand", amount: 8900, debitCode: 6030, creditCode: 1010, category: "expense" },
  { date: "2026-03-18", description: "USPS — Client Mailing", amount: 2100, debitCode: 6030, creditCode: 1010, category: "expense" },
  // Meals
  { date: "2026-01-25", description: "The Capital Grille — Client Dinner (Jane + client)", amount: 18500, debitCode: 6050, creditCode: 1010, category: "expense" },
  { date: "2026-02-14", description: "Starbucks — Client Meeting Coffee", amount: 2400, debitCode: 6050, creditCode: 1010, category: "expense" },
  { date: "2026-03-22", description: "Flores Restaurant — Team Lunch", amount: 6700, debitCode: 6050, creditCode: 1010, category: "expense" },
  // Travel
  { date: "2026-02-20", description: "Southwest Airlines — Austin → Chicago (client visit)", amount: 42000, debitCode: 6060, creditCode: 1010, category: "expense" },
  { date: "2026-02-21", description: "Hilton Chicago — 2 nights", amount: 38000, debitCode: 6060, creditCode: 1010, category: "expense" },
  { date: "2026-02-22", description: "Uber — Airport to Hotel", amount: 3200, debitCode: 6060, creditCode: 1010, category: "expense" },
  // Marketing
  { date: "2026-03-05", description: "Meta Ads — February Campaign", amount: 15000, debitCode: 6070, creditCode: 1010, category: "expense" },
  { date: "2026-04-01", description: "Canva Pro — Annual", amount: 14900, debitCode: 6070, creditCode: 1010, category: "expense" },
];

/**
 * Purge all demo data. Safe to call repeatedly.
 */
export async function purgeDemoData() {
  // Delete in FK order: children first
  await db.delete(importRows).where(sql`${importRows.syncBatchId} IN (SELECT id FROM sync_batches WHERE error = ${DEMO_TAG})`);
  await db.delete(syncBatches).where(eq(syncBatches.error, DEMO_TAG));
  await db.delete(plaidAccounts).where(sql`${plaidAccounts.plaidItemId} IN (SELECT id FROM plaid_items WHERE cursor = ${DEMO_TAG})`);
  await db.delete(plaidItems).where(eq(plaidItems.cursor, DEMO_TAG));
  await db.delete(fileImportRows).where(sql`${fileImportRows.batchId} IN (SELECT id FROM file_import_batches WHERE error_message = ${DEMO_TAG})`);
  await db.delete(fileImportBatches).where(eq(fileImportBatches.errorMessage, DEMO_TAG));
  await db.delete(transactionLines).where(sql`${transactionLines.transactionId} IN (SELECT id FROM transactions WHERE memo = ${DEMO_TAG})`);
  await db.delete(transactions).where(eq(transactions.memo, DEMO_TAG));
  await db.delete(categorizationRules).where(sql`${categorizationRules.name} LIKE 'Demo:%'`);
  await db.delete(estimatedTaxPayments).where(eq(estimatedTaxPayments.notes, DEMO_TAG));
}

/**
 * Seed all demo data.
 */
export async function seedDemoData() {
  // Fetch accounts by code
  const allAccounts = await db.select().from(accounts);
  const byCode = Object.fromEntries(allAccounts.map((a) => [a.code, a.id]));

  if (!byCode[1010] || !byCode[4010]) {
    throw new Error("Required accounts (1010, 4010) not found. Run setup first.");
  }

  // 1. Transactions + lines
  const txIds: string[] = [];
  for (const d of DEMO_TRANSACTIONS) {
    const debitAcct = byCode[d.debitCode];
    const creditAcct = byCode[d.creditCode];
    if (!debitAcct || !creditAcct) continue;

    const txId = crypto.randomUUID();
    txIds.push(txId);
    await db.insert(transactions).values({
      id: txId,
      date: new Date(d.date),
      description: d.description,
      memo: DEMO_TAG,
      status: "posted",
    });
    await db.insert(transactionLines).values([
      { transactionId: txId, accountId: debitAcct, debit: String(d.amount / 100), credit: "0.00" },
      { transactionId: txId, accountId: creditAcct, debit: "0.00", credit: String(d.amount / 100) },
    ]);
  }

  // 2. Fake Plaid item + account for import rows
  const demoPlaidItemId = crypto.randomUUID();
  await db.insert(plaidItems).values({
    id: demoPlaidItemId,
    institutionId: "ins_demo",
    institutionName: "Demo Bank",
    accessTokenEncrypted: "demo-not-real",
    itemId: `demo-item-${demoPlaidItemId}`,
    cursor: DEMO_TAG,
    isActive: true,
  });

  const demoPlaidAccountId = crypto.randomUUID();
  await db.insert(plaidAccounts).values({
    id: demoPlaidAccountId,
    plaidItemId: demoPlaidItemId,
    accountId: `demo-acct-${demoPlaidAccountId}`,
    name: "Business Checking",
    type: "depository",
    subtype: "checking",
    mask: "4521",
    ledgerAccountId: byCode[1010],
    isActive: true,
  });

  // 3. Sync batches + import rows
  const batch1Id = crypto.randomUUID();
  await db.insert(syncBatches).values({
    id: batch1Id,
    plaidItemId: demoPlaidItemId,
    startedAt: new Date("2026-01-31T12:00:00Z"),
    completedAt: new Date("2026-01-31T12:00:05Z"),
    addedCount: 12,
    error: DEMO_TAG,
  });

  const batch2Id = crypto.randomUUID();
  await db.insert(syncBatches).values({
    id: batch2Id,
    plaidItemId: demoPlaidItemId,
    startedAt: new Date("2026-03-31T12:00:00Z"),
    completedAt: new Date("2026-03-31T12:00:05Z"),
    addedCount: 10,
    error: DEMO_TAG,
  });

  // Create import rows for each transaction
  for (let i = 0; i < DEMO_TRANSACTIONS.length; i++) {
    const d = DEMO_TRANSACTIONS[i];
    const batchId = i < 12 ? batch1Id : batch2Id;
    await db.insert(importRows).values({
      syncBatchId: batchId,
      plaidTransactionId: `demo-plaid-tx-${crypto.randomUUID()}`,
      plaidAccountId: demoPlaidAccountId,
      rawData: { description: d.description, amount: d.amount / 100 },
      amount: String(d.category === "expense" ? d.amount / 100 : -(d.amount / 100)),
      date: new Date(d.date),
      name: d.description,
      status: "matched",
      transactionId: txIds[i],
    });
  }

  // 4. File import batch + rows
  const fileBatchId = crypto.randomUUID();
  await db.insert(fileImportBatches).values({
    id: fileBatchId,
    source: "amex",
    fileName: "amex-statement-jan-2026.xlsx",
    fileType: "xlsx",
    accountLast4: "4521",
    statementPeriodStart: new Date("2026-01-01"),
    statementPeriodEnd: new Date("2026-01-31"),
    status: "complete",
    rowCount: 5,
    errorMessage: DEMO_TAG,
  });

  const fileImportItems = [
    { desc: "Notion — Annual Plan", amount: -96.00, date: "2026-01-02", txIdx: 5 },
    { desc: "GitHub Copilot — Monthly", amount: -10.00, date: "2026-01-05", txIdx: 6 },
    { desc: "Adobe Creative Cloud — Monthly", amount: -55.00, date: "2026-01-15", txIdx: 8 },
    { desc: "Staples — Printer Ink + Paper", amount: -47.00, date: "2026-01-20", txIdx: 11 },
    { desc: "The Capital Grille — Client Dinner", amount: -185.00, date: "2026-01-25", txIdx: 14 },
  ];

  for (const item of fileImportItems) {
    await db.insert(fileImportRows).values({
      batchId: fileBatchId,
      rawData: { description: item.desc, amount: item.amount },
      parsedDate: new Date(item.date),
      parsedDescription: item.desc,
      parsedAmount: String(item.amount),
      externalId: `amex-${crypto.randomUUID()}`,
      source: "amex",
      matchedTransactionId: txIds[item.txIdx],
      matchStatus: "auto_matched",
    });
  }

  // 5. Categorization rules
  const ruleData = [
    { name: "Demo: GitHub → Software", pattern: "GitHub", accountCode: 6010, priority: 10 },
    { name: "Demo: Adobe → Software", pattern: "Adobe", accountCode: 6010, priority: 10 },
    { name: "Demo: Airlines → Travel", pattern: "Southwest|United|Delta|American Airlines", accountCode: 6060, priority: 10 },
  ];

  for (const r of ruleData) {
    const acctId = byCode[r.accountCode];
    if (!acctId) continue;
    await db.insert(categorizationRules).values({
      name: r.name,
      pattern: r.pattern,
      matchField: "name",
      accountId: acctId,
      priority: r.priority,
      isActive: true,
    });
  }

  // 6. Estimated tax payments
  await db.insert(estimatedTaxPayments).values({
    year: 2026,
    quarter: 1,
    estimatedAmount: "3300.00",
    paidAmount: "3300.00",
    paidDate: new Date("2026-04-10"),
    notes: DEMO_TAG,
  });
  await db.insert(estimatedTaxPayments).values({
    year: 2026,
    quarter: 2,
    estimatedAmount: "3300.00",
    paidAmount: "0.00",
    notes: DEMO_TAG,
  });

  return { transactionCount: txIds.length };
}
