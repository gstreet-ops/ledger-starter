export const dynamic = "force-dynamic";

import { getRecentTransactions, getAccountBalances, getUserSettings } from "@/lib/db/queries";
import { profitAndLoss, monthlyPnl } from "@/lib/services/reports";
import {
  selfEmploymentTax,
  federalIncomeTax,
  stateTax,
} from "@/lib/services/tax";
import { nextQuarterlyPayment } from "@/lib/services/quarterly-estimates";
import { DashboardContent } from "./dashboard-content";
import { parseMoney } from "@/lib/utils/money";

export default async function DashboardPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const yearStart = new Date(year, 0, 1);

  // Current and previous month ranges
  const currentMonthStart = new Date(year, month, 1);
  const previousMonthStart = new Date(year, month - 1, 1);
  const previousMonthEnd = new Date(year, month, 0, 23, 59, 59, 999);

  const [pnl, accountBalances, recentTxns, monthlyData, nextPayment, currentMonthPnl, previousMonthPnl] =
    await Promise.all([
      profitAndLoss(yearStart, now),
      getAccountBalances(),
      getRecentTransactions(10),
      monthlyPnl(year),
      nextQuarterlyPayment(year),
      profitAndLoss(currentMonthStart, now),
      profitAndLoss(previousMonthStart, previousMonthEnd),
    ]);

  // Cash balance = sum of asset accounts with code 1000-1019
  const cashBalance = accountBalances
    .filter((a) => a.type === "asset" && a.code >= 1000 && a.code < 1030)
    .reduce(
      (sum, a) => sum + parseMoney(a.totalDebit) - parseMoney(a.totalCredit),
      0
    )
    .toFixed(2);

  // YTD tax summary
  const netProfit = parseMoney(pnl.netProfit);
  const settings = await getUserSettings();
  const userState = settings?.state ?? "XX";
  const federal = federalIncomeTax(netProfit);
  const se = selfEmploymentTax(netProfit);
  const st = stateTax(netProfit, userState);

  const totalTax =
    parseMoney(federal.tax) + parseMoney(se.totalSeTax) + parseMoney(st.tax);

  const taxSummary = {
    federal: federal.tax,
    se: se.totalSeTax,
    state: st.tax,
    stateLabel: st.stateLabel,
    total: totalTax.toFixed(2),
  };

  // Top 5 expense categories with trend (current vs previous month)
  const prevExpenseMap = new Map(
    previousMonthPnl.expenses.map((e) => [e.name, parseMoney(e.balance)])
  );
  const topExpenses = currentMonthPnl.expenses
    .map((e) => ({
      name: e.name,
      amount: e.balance,
      previousAmount: (prevExpenseMap.get(e.name) ?? 0).toFixed(2),
    }))
    .sort((a, b) => parseMoney(b.amount) - parseMoney(a.amount))
    .slice(0, 5);

  // Cash runway: months of cash at average monthly burn
  const monthsElapsed = month + 1;
  const avgMonthlyExpenses =
    parseMoney(pnl.totalExpenses) / Math.max(monthsElapsed, 1);
  const cashRunwayMonths =
    avgMonthlyExpenses > 0
      ? Math.floor(parseMoney(cashBalance) / avgMonthlyExpenses)
      : null;

  // Effective tax rate
  const effectiveTaxRate =
    netProfit > 0 ? ((totalTax / netProfit) * 100).toFixed(1) : null;

  return (
    <DashboardContent
      ytdRevenue={pnl.totalIncome}
      ytdExpenses={pnl.totalExpenses}
      ytdNetProfit={pnl.netProfit}
      cashBalance={cashBalance}
      recentTransactions={recentTxns as any}
      monthlyData={monthlyData}
      taxSummary={taxSummary}
      nextQuarterlyPayment={nextPayment}
      topExpenses={topExpenses}
      cashRunwayMonths={cashRunwayMonths}
      effectiveTaxRate={effectiveTaxRate}
    />
  );
}
