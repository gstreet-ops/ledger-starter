/**
 * Shared demo seed logic — used by both seed/demo-data.ts (CLI) and the reset API.
 * Supports multiple business profiles.
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
  userSettings,
} from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

const DEMO_TAG = "DEMO";

export type DemoProfileId = "acme-consulting" | "car-wash" | "board-games";

export type DemoProfile = {
  id: DemoProfileId;
  businessName: string;
  ownerName: string;
  entityType: string;
  state: string;
  description: string;
  transactions: DemoTx[];
  rules: DemoRule[];
  quarterlyPayments: DemoQuarterlyPayment[];
  fileImportItems: DemoFileImportItem[];
  plaidInstitution: { id: string; name: string; accountName: string; mask: string };
};

type DemoTx = {
  date: string;
  description: string;
  amount: number; // cents
  debitCode: number;
  creditCode: number;
  category: "income" | "expense";
};

type DemoRule = {
  name: string;
  pattern: string;
  accountCode: number;
  priority: number;
};

type DemoQuarterlyPayment = {
  quarter: number;
  estimatedAmount: string;
  paidAmount: string;
  paidDate?: string;
};

type DemoFileImportItem = {
  desc: string;
  amount: number;
  date: string;
  txIdx: number;
};

// ─── Profile: Acme Consulting LLC ───────────────────────────────────────────

const ACME_TRANSACTIONS: DemoTx[] = [
  { date: "2026-01-15", description: "Acme Invoice #001 — Website Redesign", amount: 500000, debitCode: 1010, creditCode: 4010, category: "income" },
  { date: "2026-02-01", description: "Acme Invoice #002 — SEO Consulting", amount: 250000, debitCode: 1010, creditCode: 4010, category: "income" },
  { date: "2026-03-10", description: "Acme Invoice #003 — Monthly Retainer", amount: 300000, debitCode: 1010, creditCode: 4010, category: "income" },
  { date: "2026-04-05", description: "Acme Invoice #004 — Logo Design", amount: 150000, debitCode: 1010, creditCode: 4010, category: "income" },
  { date: "2026-05-20", description: "Acme Invoice #005 — Monthly Retainer", amount: 300000, debitCode: 1010, creditCode: 4010, category: "income" },
  { date: "2026-01-02", description: "Notion — Annual Plan", amount: 9600, debitCode: 6010, creditCode: 1010, category: "expense" },
  { date: "2026-01-05", description: "GitHub Copilot — Monthly", amount: 1000, debitCode: 6010, creditCode: 1010, category: "expense" },
  { date: "2026-02-05", description: "GitHub Copilot — Monthly", amount: 1000, debitCode: 6010, creditCode: 1010, category: "expense" },
  { date: "2026-01-15", description: "Adobe Creative Cloud — Monthly", amount: 5500, debitCode: 6010, creditCode: 1010, category: "expense" },
  { date: "2026-02-15", description: "Adobe Creative Cloud — Monthly", amount: 5500, debitCode: 6010, creditCode: 1010, category: "expense" },
  { date: "2026-03-01", description: "Figma — Professional Plan", amount: 1500, debitCode: 6010, creditCode: 1010, category: "expense" },
  { date: "2026-01-20", description: "Staples — Printer Ink + Paper", amount: 4700, debitCode: 6030, creditCode: 1010, category: "expense" },
  { date: "2026-02-12", description: "Amazon — External Monitor Stand", amount: 8900, debitCode: 6030, creditCode: 1010, category: "expense" },
  { date: "2026-03-18", description: "USPS — Client Mailing", amount: 2100, debitCode: 6030, creditCode: 1010, category: "expense" },
  { date: "2026-01-25", description: "The Capital Grille — Client Dinner (Jane + client)", amount: 18500, debitCode: 6050, creditCode: 1010, category: "expense" },
  { date: "2026-02-14", description: "Starbucks — Client Meeting Coffee", amount: 2400, debitCode: 6050, creditCode: 1010, category: "expense" },
  { date: "2026-03-22", description: "Flores Restaurant — Team Lunch", amount: 6700, debitCode: 6050, creditCode: 1010, category: "expense" },
  { date: "2026-02-20", description: "Southwest Airlines — Austin → Chicago (client visit)", amount: 42000, debitCode: 6060, creditCode: 1010, category: "expense" },
  { date: "2026-02-21", description: "Hilton Chicago — 2 nights", amount: 38000, debitCode: 6060, creditCode: 1010, category: "expense" },
  { date: "2026-02-22", description: "Uber — Airport to Hotel", amount: 3200, debitCode: 6060, creditCode: 1010, category: "expense" },
  { date: "2026-03-05", description: "Meta Ads — February Campaign", amount: 15000, debitCode: 6070, creditCode: 1010, category: "expense" },
  { date: "2026-04-01", description: "Canva Pro — Annual", amount: 14900, debitCode: 6070, creditCode: 1010, category: "expense" },
];

const ACME_PROFILE: DemoProfile = {
  id: "acme-consulting",
  businessName: "Acme Consulting LLC",
  ownerName: "Jane Smith",
  entityType: "smllc",
  state: "TX",
  description: "Consulting firm — services revenue, software & travel expenses",
  transactions: ACME_TRANSACTIONS,
  rules: [
    { name: "Demo: GitHub → Software", pattern: "GitHub", accountCode: 6010, priority: 10 },
    { name: "Demo: Adobe → Software", pattern: "Adobe", accountCode: 6010, priority: 10 },
    { name: "Demo: Airlines → Travel", pattern: "Southwest|United|Delta|American Airlines", accountCode: 6060, priority: 10 },
  ],
  quarterlyPayments: [
    { quarter: 1, estimatedAmount: "3300.00", paidAmount: "3300.00", paidDate: "2026-04-10" },
    { quarter: 2, estimatedAmount: "3300.00", paidAmount: "0.00" },
  ],
  fileImportItems: [
    { desc: "Notion — Annual Plan", amount: -96.00, date: "2026-01-02", txIdx: 5 },
    { desc: "GitHub Copilot — Monthly", amount: -10.00, date: "2026-01-05", txIdx: 6 },
    { desc: "Adobe Creative Cloud — Monthly", amount: -55.00, date: "2026-01-15", txIdx: 8 },
    { desc: "Staples — Printer Ink + Paper", amount: -47.00, date: "2026-01-20", txIdx: 11 },
    { desc: "The Capital Grille — Client Dinner", amount: -185.00, date: "2026-01-25", txIdx: 14 },
  ],
  plaidInstitution: { id: "ins_demo", name: "First National Bank", accountName: "Business Checking", mask: "4521" },
};

// ─── Profile: Sparkling Mobile Car Wash ─────────────────────────────────────

const CARWASH_TRANSACTIONS: DemoTx[] = [
  // Income — residential washes
  { date: "2026-01-08", description: "Residential Wash — Johnson Family", amount: 5500, debitCode: 1010, creditCode: 4010, category: "income" },
  { date: "2026-01-18", description: "Residential Wash — Garcia Residence", amount: 7500, debitCode: 1010, creditCode: 4010, category: "income" },
  { date: "2026-02-05", description: "Residential Wash — Thompson Estate", amount: 4500, debitCode: 1010, creditCode: 4010, category: "income" },
  { date: "2026-02-22", description: "Residential Wash — Kim Household (3 cars)", amount: 15000, debitCode: 1010, creditCode: 4010, category: "income" },
  { date: "2026-03-12", description: "Residential Wash — Patel Family", amount: 3500, debitCode: 1010, creditCode: 4010, category: "income" },
  // Income — fleet contracts
  { date: "2026-01-31", description: "Fleet Contract — Sunshine Realty (8 vehicles)", amount: 120000, debitCode: 1010, creditCode: 4010, category: "income" },
  { date: "2026-02-28", description: "Fleet Contract — Sunshine Realty (8 vehicles)", amount: 120000, debitCode: 1010, creditCode: 4010, category: "income" },
  { date: "2026-03-31", description: "Fleet Contract — Sunshine Realty (8 vehicles)", amount: 120000, debitCode: 1010, creditCode: 4010, category: "income" },
  { date: "2026-03-01", description: "Fleet Contract — Coastal Plumbing (5 vans)", amount: 50000, debitCode: 1010, creditCode: 4010, category: "income" },
  { date: "2026-04-30", description: "Fleet Contract — Sunshine Realty (8 vehicles)", amount: 120000, debitCode: 1010, creditCode: 4010, category: "income" },
  // Expenses — supplies
  { date: "2026-01-03", description: "Chemical Guys — Detailing Supply Restock", amount: 24500, debitCode: 5010, creditCode: 1010, category: "expense" },
  { date: "2026-03-10", description: "AutoZone — Microfiber Towels & Wax", amount: 8900, debitCode: 5010, creditCode: 1010, category: "expense" },
  // Expenses — vehicle
  { date: "2026-01-15", description: "Shell Gas Station — Fuel (work van)", amount: 6800, debitCode: 6060, creditCode: 1010, category: "expense" },
  { date: "2026-02-10", description: "Jiffy Lube — Oil Change (work van)", amount: 7500, debitCode: 6060, creditCode: 1010, category: "expense" },
  { date: "2026-03-20", description: "Shell Gas Station — Fuel (work van)", amount: 7200, debitCode: 6060, creditCode: 1010, category: "expense" },
  { date: "2026-04-15", description: "Discount Tire — 2 New Tires (work van)", amount: 32000, debitCode: 6060, creditCode: 1010, category: "expense" },
  // Expenses — insurance
  { date: "2026-01-01", description: "GEICO — Commercial Auto Insurance (quarterly)", amount: 45000, debitCode: 6040, creditCode: 1010, category: "expense" },
  // Expenses — marketing
  { date: "2026-02-01", description: "Nextdoor Ads — Local Promotion", amount: 7500, debitCode: 6070, creditCode: 1010, category: "expense" },
  { date: "2026-04-05", description: "VistaPrint — Business Cards & Flyers", amount: 6500, debitCode: 6070, creditCode: 1010, category: "expense" },
  // Expenses — water
  { date: "2026-02-15", description: "Tampa Water Utility — Business Account", amount: 12000, debitCode: 5010, creditCode: 1010, category: "expense" },
];

const CARWASH_PROFILE: DemoProfile = {
  id: "car-wash",
  businessName: "Sparkling Mobile Car Wash",
  ownerName: "Marcus Rivera",
  entityType: "smllc",
  state: "FL",
  description: "Mobile car wash — fleet contracts, heavy fuel & supply costs",
  transactions: CARWASH_TRANSACTIONS,
  rules: [
    { name: "Demo: Gas Stations → Vehicle", pattern: "Shell|Chevron|BP|Exxon", accountCode: 6060, priority: 10 },
    { name: "Demo: Auto Parts → Supplies", pattern: "AutoZone|Chemical Guys|O'Reilly", accountCode: 5010, priority: 10 },
    { name: "Demo: Fleet Contract → Income", pattern: "Fleet Contract", accountCode: 4010, priority: 10 },
  ],
  quarterlyPayments: [
    { quarter: 1, estimatedAmount: "2800.00", paidAmount: "2800.00", paidDate: "2026-04-10" },
    { quarter: 2, estimatedAmount: "2800.00", paidAmount: "0.00" },
  ],
  fileImportItems: [
    { desc: "Chemical Guys — Detailing Supply Restock", amount: -245.00, date: "2026-01-03", txIdx: 10 },
    { desc: "Shell Gas Station — Fuel", amount: -68.00, date: "2026-01-15", txIdx: 12 },
    { desc: "GEICO — Commercial Auto Insurance", amount: -450.00, date: "2026-01-01", txIdx: 16 },
    { desc: "Nextdoor Ads — Local Promotion", amount: -75.00, date: "2026-02-01", txIdx: 17 },
    { desc: "Tampa Water Utility", amount: -120.00, date: "2026-02-15", txIdx: 19 },
  ],
  plaidInstitution: { id: "ins_demo_fl", name: "SunTrust Bank", accountName: "Business Checking", mask: "7832" },
};

// ─── Profile: Pixel & Dice ──────────────────────────────────────────────────

const BOARDGAMES_TRANSACTIONS: DemoTx[] = [
  // Income — Shopify sales
  { date: "2026-01-10", description: "Shopify Payout — Jan Week 1", amount: 285000, debitCode: 1010, creditCode: 4010, category: "income" },
  { date: "2026-01-24", description: "Shopify Payout — Jan Week 3", amount: 342000, debitCode: 1010, creditCode: 4010, category: "income" },
  { date: "2026-02-14", description: "Shopify Payout — Feb Week 2", amount: 198000, debitCode: 1010, creditCode: 4010, category: "income" },
  { date: "2026-03-07", description: "Shopify Payout — Mar Week 1", amount: 410000, debitCode: 1010, creditCode: 4010, category: "income" },
  { date: "2026-04-11", description: "Shopify Payout — Apr Week 2", amount: 375000, debitCode: 1010, creditCode: 4010, category: "income" },
  // Income — Amazon
  { date: "2026-01-15", description: "Amazon Marketplace — Biweekly Disbursement", amount: 156000, debitCode: 1010, creditCode: 4010, category: "income" },
  { date: "2026-02-15", description: "Amazon Marketplace — Biweekly Disbursement", amount: 189000, debitCode: 1010, creditCode: 4010, category: "income" },
  { date: "2026-03-15", description: "Amazon Marketplace — Biweekly Disbursement", amount: 204000, debitCode: 1010, creditCode: 4010, category: "income" },
  // Income — events
  { date: "2026-02-08", description: "Game Night Event — Emerald City Comics", amount: 45000, debitCode: 1010, creditCode: 4010, category: "income" },
  // Expenses — COGS (wholesale purchasing)
  { date: "2026-01-05", description: "Asmodee Distribution — Board Game Wholesale", amount: 185000, debitCode: 5010, creditCode: 1010, category: "expense" },
  { date: "2026-02-20", description: "Alliance Game Distributors — Restock Order", amount: 142000, debitCode: 5010, creditCode: 1010, category: "expense" },
  { date: "2026-04-01", description: "Asmodee Distribution — Spring Catalog Order", amount: 210000, debitCode: 5010, creditCode: 1010, category: "expense" },
  // Expenses — shipping
  { date: "2026-01-12", description: "USPS — Priority Mail Shipments", amount: 32000, debitCode: 6030, creditCode: 1010, category: "expense" },
  { date: "2026-02-10", description: "UPS — Bulk Shipping Labels", amount: 28500, debitCode: 6030, creditCode: 1010, category: "expense" },
  { date: "2026-03-22", description: "USPS — Priority Mail Shipments", amount: 38000, debitCode: 6030, creditCode: 1010, category: "expense" },
  // Expenses — platform fees
  { date: "2026-01-31", description: "Shopify — Monthly Plan + Transaction Fees", amount: 7900, debitCode: 6010, creditCode: 1010, category: "expense" },
  { date: "2026-02-28", description: "Shopify — Monthly Plan + Transaction Fees", amount: 7900, debitCode: 6010, creditCode: 1010, category: "expense" },
  // Expenses — warehouse rent
  { date: "2026-01-01", description: "Public Storage — Unit 214 (monthly)", amount: 22500, debitCode: 6020, creditCode: 1010, category: "expense" },
  { date: "2026-02-01", description: "Public Storage — Unit 214 (monthly)", amount: 22500, debitCode: 6020, creditCode: 1010, category: "expense" },
  // Expenses — marketing
  { date: "2026-03-05", description: "Instagram Ads — Spring Sale Campaign", amount: 15000, debitCode: 6070, creditCode: 1010, category: "expense" },
];

const BOARDGAMES_PROFILE: DemoProfile = {
  id: "board-games",
  businessName: "Pixel & Dice",
  ownerName: "Sarah Chen",
  entityType: "smllc",
  state: "WA",
  description: "Online board game retailer — e-commerce, COGS, shipping",
  transactions: BOARDGAMES_TRANSACTIONS,
  rules: [
    { name: "Demo: Shopify → Platform Fees", pattern: "Shopify", accountCode: 6010, priority: 10 },
    { name: "Demo: USPS/UPS → Shipping", pattern: "USPS|UPS|FedEx", accountCode: 6030, priority: 10 },
    { name: "Demo: Distributors → COGS", pattern: "Asmodee|Alliance Game", accountCode: 5010, priority: 10 },
  ],
  quarterlyPayments: [
    { quarter: 1, estimatedAmount: "4200.00", paidAmount: "4200.00", paidDate: "2026-04-10" },
    { quarter: 2, estimatedAmount: "4200.00", paidAmount: "0.00" },
  ],
  fileImportItems: [
    { desc: "Asmodee Distribution — Board Game Wholesale", amount: -1850.00, date: "2026-01-05", txIdx: 9 },
    { desc: "USPS — Priority Mail Shipments", amount: -320.00, date: "2026-01-12", txIdx: 12 },
    { desc: "Shopify — Monthly Plan + Transaction Fees", amount: -79.00, date: "2026-01-31", txIdx: 15 },
    { desc: "Public Storage — Unit 214", amount: -225.00, date: "2026-01-01", txIdx: 17 },
    { desc: "Instagram Ads — Spring Sale Campaign", amount: -150.00, date: "2026-03-05", txIdx: 19 },
  ],
  plaidInstitution: { id: "ins_demo_wa", name: "BECU", accountName: "Business Checking", mask: "3156" },
};

// ─── Profile registry ───────────────────────────────────────────────────────

export const DEMO_PROFILES: Record<DemoProfileId, DemoProfile> = {
  "acme-consulting": ACME_PROFILE,
  "car-wash": CARWASH_PROFILE,
  "board-games": BOARDGAMES_PROFILE,
};

function getProfile(profileId?: string): DemoProfile {
  const id = (profileId || "acme-consulting") as DemoProfileId;
  return DEMO_PROFILES[id] || DEMO_PROFILES["acme-consulting"];
}

/**
 * Purge all demo data. Profile-agnostic — removes everything tagged DEMO.
 */
export async function purgeDemoData() {
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
 * Seed demo data for the given profile.
 */
export async function seedDemoData(profileId?: string) {
  const profile = getProfile(profileId);

  // Update user_settings with profile info
  const existingSettings = await db.select().from(userSettings).limit(1);
  if (existingSettings.length > 0) {
    await db.update(userSettings).set({
      businessName: profile.businessName,
      ownerName: profile.ownerName,
      entityType: profile.entityType,
      state: profile.state,
      setupComplete: true,
      updatedAt: new Date(),
    }).where(eq(userSettings.id, existingSettings[0].id));
  }

  // Fetch accounts by code
  const allAccounts = await db.select().from(accounts);
  const byCode = Object.fromEntries(allAccounts.map((a) => [a.code, a.id]));

  if (!byCode[1010] || !byCode[4010]) {
    throw new Error("Required accounts (1010, 4010) not found. Run setup first.");
  }

  // 1. Transactions + lines
  const txIds: string[] = [];
  for (const d of profile.transactions) {
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

  // 2. Fake Plaid item + account
  const demoPlaidItemId = crypto.randomUUID();
  await db.insert(plaidItems).values({
    id: demoPlaidItemId,
    institutionId: profile.plaidInstitution.id,
    institutionName: profile.plaidInstitution.name,
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
    name: profile.plaidInstitution.accountName,
    type: "depository",
    subtype: "checking",
    mask: profile.plaidInstitution.mask,
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

  for (let i = 0; i < profile.transactions.length; i++) {
    const d = profile.transactions[i];
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
    fileName: "statement-jan-2026.xlsx",
    fileType: "xlsx",
    accountLast4: profile.plaidInstitution.mask,
    statementPeriodStart: new Date("2026-01-01"),
    statementPeriodEnd: new Date("2026-01-31"),
    status: "complete",
    rowCount: profile.fileImportItems.length,
    errorMessage: DEMO_TAG,
  });

  for (const item of profile.fileImportItems) {
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
  for (const r of profile.rules) {
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
  for (const p of profile.quarterlyPayments) {
    await db.insert(estimatedTaxPayments).values({
      year: 2026,
      quarter: p.quarter,
      estimatedAmount: p.estimatedAmount,
      paidAmount: p.paidAmount,
      paidDate: p.paidDate ? new Date(p.paidDate) : undefined,
      notes: DEMO_TAG,
    });
  }

  return { transactionCount: txIds.length, profileId: profile.id };
}
