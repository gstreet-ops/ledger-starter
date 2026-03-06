import { eq, desc, and, sql, SQL, asc, gte, lte } from "drizzle-orm";
import { db } from "./drizzle";
import { parseMoney } from "@/lib/utils/money";
import {
  accounts,
  plaidItems,
  plaidAccounts,
  importRows,
  syncBatches,
  categorizationRules,
  taxCategories,
  transactions,
  transactionLines,
} from "./schema";

export async function getPlaidItems() {
  const items = await db.select().from(plaidItems).orderBy(plaidItems.createdAt);
  const allAccounts = await db.select().from(plaidAccounts);

  return items.map((item) => ({
    ...item,
    accounts: allAccounts.filter((a) => a.plaidItemId === item.id),
  }));
}

export async function getLedgerAccounts() {
  return db
    .select({ id: accounts.id, code: accounts.code, name: accounts.name, type: accounts.type })
    .from(accounts)
    .where(eq(accounts.isActive, true))
    .orderBy(accounts.code);
}

export async function updatePlaidAccountMapping(
  plaidAccountId: string,
  ledgerAccountId: string | null
) {
  return db
    .update(plaidAccounts)
    .set({ ledgerAccountId })
    .where(eq(plaidAccounts.id, plaidAccountId));
}

export async function getImportRows(opts: {
  syncBatchId?: string;
  plaidAccountId?: string;
  status?: "pending" | "matched" | "ignored";
  limit?: number;
  offset?: number;
}) {
  const conditions: SQL[] = [];
  if (opts.syncBatchId) conditions.push(eq(importRows.syncBatchId, opts.syncBatchId));
  if (opts.plaidAccountId) conditions.push(eq(importRows.plaidAccountId, opts.plaidAccountId));
  if (opts.status) conditions.push(eq(importRows.status, opts.status));

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const limit = opts.limit ?? 50;
  const offset = opts.offset ?? 0;

  const rows = await db
    .select()
    .from(importRows)
    .where(where)
    .orderBy(desc(importRows.date))
    .limit(limit)
    .offset(offset);

  return rows;
}

export async function getImportRowCount(opts: {
  syncBatchId?: string;
  plaidAccountId?: string;
  status?: "pending" | "matched" | "ignored";
}) {
  const conditions: SQL[] = [];
  if (opts.syncBatchId) conditions.push(eq(importRows.syncBatchId, opts.syncBatchId));
  if (opts.plaidAccountId) conditions.push(eq(importRows.plaidAccountId, opts.plaidAccountId));
  if (opts.status) conditions.push(eq(importRows.status, opts.status));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(importRows)
    .where(where);

  return Number(result.count);
}

export async function getSyncBatches(limit = 20) {
  return db
    .select()
    .from(syncBatches)
    .orderBy(desc(syncBatches.startedAt))
    .limit(limit);
}

export async function getImportRowsByBatch(batchId: string) {
  return db
    .select()
    .from(importRows)
    .where(eq(importRows.syncBatchId, batchId))
    .orderBy(desc(importRows.date));
}

export async function getRules() {
  return db
    .select()
    .from(categorizationRules)
    .where(eq(categorizationRules.isActive, true))
    .orderBy(desc(categorizationRules.priority));
}

export async function createRule(rule: {
  name: string;
  pattern: string;
  matchField: string;
  accountId: string;
  priority: number;
}) {
  const [created] = await db
    .insert(categorizationRules)
    .values(rule)
    .returning();
  return created;
}

export async function getAccountsWithTaxCategories() {
  const accts = await db
    .select({
      id: accounts.id,
      code: accounts.code,
      name: accounts.name,
      type: accounts.type,
      scheduleCLine: accounts.scheduleCLine,
      gaFormCategory: accounts.gaFormCategory,
    })
    .from(accounts)
    .where(eq(accounts.isActive, true))
    .orderBy(accounts.code);

  const taxCats = await db.select().from(taxCategories);

  return { accounts: accts, taxCategories: taxCats };
}

export async function getImportRowById(id: string) {
  const [row] = await db
    .select()
    .from(importRows)
    .where(eq(importRows.id, id));
  return row ?? null;
}

export async function getPlaidAccountById(id: string) {
  const [row] = await db
    .select()
    .from(plaidAccounts)
    .where(eq(plaidAccounts.id, id));
  return row ?? null;
}

// --- Phase 2: Ledger queries ---

export async function getAccountBalances() {
  const rows = await db
    .select({
      id: accounts.id,
      code: accounts.code,
      name: accounts.name,
      type: accounts.type,
      scheduleCLine: accounts.scheduleCLine,
      gaFormCategory: accounts.gaFormCategory,
      isActive: accounts.isActive,
      totalDebit: sql<string>`coalesce(sum(${transactionLines.debit}), 0)`,
      totalCredit: sql<string>`coalesce(sum(${transactionLines.credit}), 0)`,
    })
    .from(accounts)
    .leftJoin(transactionLines, eq(accounts.id, transactionLines.accountId))
    .groupBy(accounts.id)
    .orderBy(accounts.code);
  return rows;
}

export async function getAllAccounts() {
  return db.select().from(accounts).orderBy(accounts.code);
}

export async function createAccount(data: {
  code: number;
  name: string;
  type: "asset" | "liability" | "equity" | "income" | "expense";
  scheduleCLine?: string;
  gaFormCategory?: string;
}) {
  const [created] = await db.insert(accounts).values(data).returning();
  return created;
}

export async function updateAccount(
  id: string,
  data: {
    name?: string;
    scheduleCLine?: string | null;
    gaFormCategory?: string | null;
    isActive?: boolean;
  }
) {
  const [updated] = await db
    .update(accounts)
    .set(data)
    .where(eq(accounts.id, id))
    .returning();
  return updated;
}

export async function getTransactionsWithLines(opts: {
  status?: "pending" | "posted" | "voided";
  accountId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
  sortBy?: "date" | "amount" | "description";
  sortDir?: "asc" | "desc";
}) {
  const conditions: SQL[] = [];
  if (opts.status) conditions.push(eq(transactions.status, opts.status));
  if (opts.startDate) conditions.push(gte(transactions.date, opts.startDate));
  if (opts.endDate) conditions.push(lte(transactions.date, opts.endDate));

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const limit = opts.limit ?? 50;
  const offset = opts.offset ?? 0;
  const sortDir = opts.sortDir === "asc" ? asc : desc;

  let orderCol: any = transactions.date;
  if (opts.sortBy === "description") orderCol = transactions.description;

  const txns = await db
    .select()
    .from(transactions)
    .where(where)
    .orderBy(sortDir(orderCol))
    .limit(limit)
    .offset(offset);

  if (txns.length === 0) return [];

  const txnIds = txns.map((t) => t.id);
  const lines = await db
    .select({
      id: transactionLines.id,
      transactionId: transactionLines.transactionId,
      accountId: transactionLines.accountId,
      accountCode: accounts.code,
      accountName: accounts.name,
      debit: transactionLines.debit,
      credit: transactionLines.credit,
      memo: transactionLines.memo,
    })
    .from(transactionLines)
    .innerJoin(accounts, eq(transactionLines.accountId, accounts.id))
    .where(sql`${transactionLines.transactionId} IN ${txnIds}`);

  // Filter by accountId post-join if specified
  if (opts.accountId) {
    const matchingTxnIds = new Set(
      lines.filter((l) => l.accountId === opts.accountId).map((l) => l.transactionId)
    );
    const filtered = txns.filter((t) => matchingTxnIds.has(t.id));
    return filtered.map((t) => ({
      ...t,
      lines: lines.filter((l) => l.transactionId === t.id),
    }));
  }

  return txns.map((t) => ({
    ...t,
    lines: lines.filter((l) => l.transactionId === t.id),
  }));
}

export async function getTransactionCount(opts: {
  status?: "pending" | "posted" | "voided";
  accountId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const conditions: SQL[] = [];
  if (opts.status) conditions.push(eq(transactions.status, opts.status));
  if (opts.startDate) conditions.push(gte(transactions.date, opts.startDate));
  if (opts.endDate) conditions.push(lte(transactions.date, opts.endDate));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(where);

  return Number(result.count);
}

export async function getTransactionById(id: string) {
  const [txn] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, id));
  if (!txn) return null;

  const lines = await db
    .select({
      id: transactionLines.id,
      transactionId: transactionLines.transactionId,
      accountId: transactionLines.accountId,
      accountCode: accounts.code,
      accountName: accounts.name,
      debit: transactionLines.debit,
      credit: transactionLines.credit,
      memo: transactionLines.memo,
    })
    .from(transactionLines)
    .innerJoin(accounts, eq(transactionLines.accountId, accounts.id))
    .where(eq(transactionLines.transactionId, id));

  return { ...txn, lines };
}

export async function createTransaction(data: {
  date: Date;
  description: string;
  memo?: string;
  status?: "pending" | "posted" | "voided";
  lines: { accountId: string; debit: string; credit: string; memo?: string }[];
}) {
  // Enforce balance invariant: SUM(debit) = SUM(credit) using integer cents
  const totalDebitCents = data.lines.reduce((s, l) => s + Math.round(parseMoney(l.debit || "0") * 100), 0);
  const totalCreditCents = data.lines.reduce((s, l) => s + Math.round(parseMoney(l.credit || "0") * 100), 0);
  if (totalDebitCents !== totalCreditCents) {
    throw new Error(`Transaction does not balance: debits=${(totalDebitCents / 100).toFixed(2)} credits=${(totalCreditCents / 100).toFixed(2)}`);
  }
  if (data.lines.length < 2) {
    throw new Error("Transaction must have at least two lines");
  }

  return await db.transaction(async (tx) => {
    const [txn] = await tx
      .insert(transactions)
      .values({
        date: data.date,
        description: data.description,
        memo: data.memo,
        status: data.status ?? "posted",
      })
      .returning();

    const lineValues = data.lines.map((l) => ({
      transactionId: txn.id,
      accountId: l.accountId,
      debit: l.debit,
      credit: l.credit,
      memo: l.memo,
    }));

    const createdLines = await tx
      .insert(transactionLines)
      .values(lineValues)
      .returning();

    return { transaction: txn, lines: createdLines };
  });
}

export async function voidTransaction(id: string) {
  const [updated] = await db
    .update(transactions)
    .set({ status: "voided", updatedAt: new Date() })
    .where(eq(transactions.id, id))
    .returning();
  return updated;
}

export async function getTaxCategories() {
  return db.select().from(taxCategories).orderBy(taxCategories.formLine);
}

export async function getScheduleCTotals(year: number) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

  return db
    .select({
      scheduleCLine: accounts.scheduleCLine,
      type: accounts.type,
      totalDebit: sql<string>`coalesce(sum(${transactionLines.debit}), 0)`,
      totalCredit: sql<string>`coalesce(sum(${transactionLines.credit}), 0)`,
    })
    .from(accounts)
    .innerJoin(transactionLines, eq(accounts.id, transactionLines.accountId))
    .innerJoin(transactions, eq(transactionLines.transactionId, transactions.id))
    .where(
      and(
        eq(transactions.status, "posted"),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate),
        sql`${accounts.scheduleCLine} IS NOT NULL`
      )
    )
    .groupBy(accounts.scheduleCLine, accounts.type);
}

export async function getAllRules() {
  return db
    .select({
      id: categorizationRules.id,
      name: categorizationRules.name,
      pattern: categorizationRules.pattern,
      matchField: categorizationRules.matchField,
      accountId: categorizationRules.accountId,
      accountCode: accounts.code,
      accountName: accounts.name,
      priority: categorizationRules.priority,
      isActive: categorizationRules.isActive,
      createdAt: categorizationRules.createdAt,
    })
    .from(categorizationRules)
    .innerJoin(accounts, eq(categorizationRules.accountId, accounts.id))
    .orderBy(desc(categorizationRules.priority));
}

export async function updateRule(
  id: string,
  data: {
    name?: string;
    pattern?: string;
    matchField?: string;
    accountId?: string;
    priority?: number;
    isActive?: boolean;
  }
) {
  const [updated] = await db
    .update(categorizationRules)
    .set(data)
    .where(eq(categorizationRules.id, id))
    .returning();
  return updated;
}

export async function deleteRule(id: string) {
  const [deleted] = await db
    .delete(categorizationRules)
    .where(eq(categorizationRules.id, id))
    .returning();
  return deleted;
}

export async function getRecentTransactions(limit = 10) {
  const txns = await db
    .select()
    .from(transactions)
    .where(eq(transactions.status, "posted"))
    .orderBy(desc(transactions.date))
    .limit(limit);

  if (txns.length === 0) return [];

  const txnIds = txns.map((t) => t.id);
  const lines = await db
    .select({
      transactionId: transactionLines.transactionId,
      debit: transactionLines.debit,
      credit: transactionLines.credit,
      accountName: accounts.name,
    })
    .from(transactionLines)
    .innerJoin(accounts, eq(transactionLines.accountId, accounts.id))
    .where(sql`${transactionLines.transactionId} IN ${txnIds}`);

  return txns.map((t) => ({
    ...t,
    totalAmount: lines
      .filter((l) => l.transactionId === t.id)
      .reduce((sum, l) => sum + parseMoney(l.debit), 0)
      .toFixed(2),
    lines: lines.filter((l) => l.transactionId === t.id),
  }));
}
