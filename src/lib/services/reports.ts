import { eq, and, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { accounts, transactions, transactionLines } from "@/lib/db/schema";
import { parseMoney } from "@/lib/utils/money";

type AccountBalance = {
  id: string;
  code: number;
  name: string;
  type: "asset" | "liability" | "equity" | "income" | "expense";
  scheduleCLine: string | null;
  totalDebit: string;
  totalCredit: string;
  balance: string;
};

// For assets and expenses, balance = debits - credits (normal debit balance)
// For liabilities, equity, and income, balance = credits - debits (normal credit balance)
function computeBalance(
  type: string,
  totalDebit: string,
  totalCredit: string
): string {
  const debit = parseMoney(totalDebit);
  const credit = parseMoney(totalCredit);
  if (type === "asset" || type === "expense") {
    return (debit - credit).toFixed(2);
  }
  return (credit - debit).toFixed(2);
}

export async function trialBalance(asOfDate?: Date): Promise<{
  accounts: AccountBalance[];
  totalDebits: string;
  totalCredits: string;
}> {
  const dateCondition = asOfDate
    ? lte(transactions.date, asOfDate)
    : undefined;

  const statusCondition = sql`${transactions.status} = 'posted'`;
  const conditions = dateCondition
    ? and(statusCondition, dateCondition)
    : statusCondition;

  const rows = await db
    .select({
      id: accounts.id,
      code: accounts.code,
      name: accounts.name,
      type: accounts.type,
      scheduleCLine: accounts.scheduleCLine,
      totalDebit: sql<string>`coalesce(sum(${transactionLines.debit}), 0)`,
      totalCredit: sql<string>`coalesce(sum(${transactionLines.credit}), 0)`,
    })
    .from(accounts)
    .leftJoin(
      transactionLines,
      eq(accounts.id, transactionLines.accountId)
    )
    .leftJoin(
      transactions,
      eq(transactionLines.transactionId, transactions.id)
    )
    .where(
      sql`(${transactions.id} IS NULL OR (${conditions}))`
    )
    .groupBy(accounts.id)
    .orderBy(accounts.code);

  const result = rows
    .map((r) => ({
      ...r,
      type: r.type as AccountBalance["type"],
      balance: computeBalance(r.type, r.totalDebit, r.totalCredit),
    }))
    .filter((r) => parseMoney(r.totalDebit) !== 0 || parseMoney(r.totalCredit) !== 0);

  const totalDebits = result
    .reduce((sum, r) => sum + parseMoney(r.totalDebit), 0)
    .toFixed(2);
  const totalCredits = result
    .reduce((sum, r) => sum + parseMoney(r.totalCredit), 0)
    .toFixed(2);

  return { accounts: result, totalDebits, totalCredits };
}

export async function profitAndLoss(startDate: Date, endDate: Date) {
  const rows = await db
    .select({
      id: accounts.id,
      code: accounts.code,
      name: accounts.name,
      type: accounts.type,
      scheduleCLine: accounts.scheduleCLine,
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
        sql`${accounts.type} IN ('income', 'expense')`
      )
    )
    .groupBy(accounts.id)
    .orderBy(accounts.code);

  const income = rows
    .filter((r) => r.type === "income")
    .map((r) => ({
      ...r,
      balance: computeBalance(r.type, r.totalDebit, r.totalCredit),
    }));

  const expenses = rows
    .filter((r) => r.type === "expense")
    .map((r) => ({
      ...r,
      balance: computeBalance(r.type, r.totalDebit, r.totalCredit),
    }));

  const totalIncome = income.reduce((sum, r) => sum + parseMoney(r.balance), 0);
  const totalExpenses = expenses.reduce((sum, r) => sum + parseMoney(r.balance), 0);
  const netProfit = totalIncome - totalExpenses;

  return {
    income,
    expenses,
    totalIncome: totalIncome.toFixed(2),
    totalExpenses: totalExpenses.toFixed(2),
    netProfit: netProfit.toFixed(2),
  };
}

export async function balanceSheet(asOfDate: Date) {
  const rows = await db
    .select({
      id: accounts.id,
      code: accounts.code,
      name: accounts.name,
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
        lte(transactions.date, asOfDate),
        sql`${accounts.type} IN ('asset', 'liability', 'equity')`
      )
    )
    .groupBy(accounts.id)
    .orderBy(accounts.code);

  const assets = rows
    .filter((r) => r.type === "asset")
    .map((r) => ({ ...r, balance: computeBalance(r.type, r.totalDebit, r.totalCredit) }));
  const liabilities = rows
    .filter((r) => r.type === "liability")
    .map((r) => ({ ...r, balance: computeBalance(r.type, r.totalDebit, r.totalCredit) }));
  const equity = rows
    .filter((r) => r.type === "equity")
    .map((r) => ({ ...r, balance: computeBalance(r.type, r.totalDebit, r.totalCredit) }));

  const totalAssets = assets.reduce((sum, r) => sum + parseMoney(r.balance), 0);
  const totalLiabilities = liabilities.reduce((sum, r) => sum + parseMoney(r.balance), 0);
  const totalEquity = equity.reduce((sum, r) => sum + parseMoney(r.balance), 0);

  return {
    assets,
    liabilities,
    equity,
    totalAssets: totalAssets.toFixed(2),
    totalLiabilities: totalLiabilities.toFixed(2),
    totalEquity: totalEquity.toFixed(2),
  };
}

export async function cashFlow(startDate: Date, endDate: Date) {
  // Cash accounts are asset accounts with code 1000-1019
  const rows = await db
    .select({
      accountId: transactionLines.accountId,
      accountCode: accounts.code,
      accountName: accounts.name,
      accountType: accounts.type,
      totalDebit: sql<string>`coalesce(sum(${transactionLines.debit}), 0)`,
      totalCredit: sql<string>`coalesce(sum(${transactionLines.credit}), 0)`,
    })
    .from(transactionLines)
    .innerJoin(transactions, eq(transactionLines.transactionId, transactions.id))
    .innerJoin(accounts, eq(transactionLines.accountId, accounts.id))
    .where(
      and(
        eq(transactions.status, "posted"),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate)
      )
    )
    .groupBy(transactionLines.accountId, accounts.code, accounts.name, accounts.type)
    .orderBy(accounts.code);

  // Separate cash accounts from category accounts
  const cashAccounts = rows.filter((r) => r.accountCode >= 1000 && r.accountCode < 1030);
  const categoryAccounts = rows.filter((r) => r.accountCode >= 1030 || r.accountType !== "asset");

  const netCashChange = cashAccounts.reduce(
    (sum, r) => sum + parseMoney(r.totalDebit) - parseMoney(r.totalCredit),
    0
  );

  return {
    cashAccounts,
    categoryAccounts,
    netCashChange: netCashChange.toFixed(2),
  };
}

// Monthly P&L summary for dashboard chart
export async function monthlyPnl(year: number) {
  const results = [];
  for (let month = 0; month < 12; month++) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
    if (start > new Date()) break;

    const pnl = await profitAndLoss(start, end);
    results.push({
      month: start.toLocaleString("en-US", { month: "short" }),
      income: parseMoney(pnl.totalIncome),
      expenses: parseMoney(pnl.totalExpenses),
      net: parseMoney(pnl.netProfit),
    });
  }
  return results;
}
