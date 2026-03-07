"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { parseMoney } from "@/lib/utils/money";

type MonthlyData = { month: string; income: number; expenses: number; net: number };
type RecentTxn = {
  id: string;
  date: Date;
  description: string;
  status: string;
  totalAmount: string;
};
type TaxSummary = { federal: string; se: string; state: string; stateLabel: string; total: string };
type NextPayment = {
  quarter: number;
  label: string;
  dueDate: string;
  amount: string;
  daysUntilDue: number;
  status: string;
} | null;
type TopExpense = {
  name: string;
  amount: string;
  previousAmount: string;
};

function formatCurrency(amount: string | number) {
  const num = typeof amount === "string" ? parseMoney(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
  });
}

function TrendIcon({ current, previous }: { current: number; previous: number }) {
  if (current > previous * 1.05) return <TrendingUp className="h-4 w-4 text-red-500" />;
  if (current < previous * 0.95) return <TrendingDown className="h-4 w-4 text-green-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

export function DashboardContent({
  ytdRevenue,
  ytdExpenses,
  ytdNetProfit,
  cashBalance,
  recentTransactions,
  monthlyData,
  taxSummary,
  nextQuarterlyPayment,
  topExpenses,
  cashRunwayMonths,
  effectiveTaxRate,
}: {
  ytdRevenue: string;
  ytdExpenses: string;
  ytdNetProfit: string;
  cashBalance: string;
  recentTransactions: RecentTxn[];
  monthlyData: MonthlyData[];
  taxSummary?: TaxSummary;
  nextQuarterlyPayment?: NextPayment;
  topExpenses?: TopExpense[];
  cashRunwayMonths?: number | null;
  effectiveTaxRate?: string | null;
}) {
  const netNum = parseMoney(ytdNetProfit);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              YTD Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(ytdRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              YTD Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(ytdExpenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              YTD Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${netNum >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {formatCurrency(ytdNetProfit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cash Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(cashBalance)}</p>
            {cashRunwayMonths != null && (
              <p className="text-xs text-muted-foreground mt-1">
                ~{cashRunwayMonths} month{cashRunwayMonths !== 1 ? "s" : ""} runway
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tax Summary + Next Quarterly Estimate */}
      <div className="grid gap-4 sm:grid-cols-2">
        {taxSummary && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                YTD Tax Liability (Estimated)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(taxSummary.total)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Federal {formatCurrency(taxSummary.federal)} + SE{" "}
                {formatCurrency(taxSummary.se)} + {taxSummary.stateLabel}{" "}
                {formatCurrency(taxSummary.state)}
              </p>
              {effectiveTaxRate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Effective rate: {effectiveTaxRate}%
                </p>
              )}
            </CardContent>
          </Card>
        )}
        {nextQuarterlyPayment && (
          <Link href="/tax/quarterly">
            <Card
              className={`cursor-pointer transition-colors hover:border-primary ${
                nextQuarterlyPayment.daysUntilDue < 0
                  ? "border-red-300 bg-red-50"
                  : nextQuarterlyPayment.daysUntilDue <= 15
                    ? "border-red-300 bg-red-50"
                    : nextQuarterlyPayment.daysUntilDue <= 30
                      ? "border-yellow-300 bg-yellow-50"
                      : ""
              }`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Next Quarterly Estimate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(nextQuarterlyPayment.amount)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {nextQuarterlyPayment.label} — due {nextQuarterlyPayment.dueDate}
                  {nextQuarterlyPayment.daysUntilDue < 0
                    ? ` (${Math.abs(nextQuarterlyPayment.daysUntilDue)} days overdue)`
                    : ` (${nextQuarterlyPayment.daysUntilDue} days)`}
                </p>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {/* Top Expenses This Month */}
      {topExpenses && topExpenses.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Top Expenses This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topExpenses.map((exp) => (
                <div key={exp.name} className="flex items-center justify-between">
                  <span className="text-sm">{exp.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{formatCurrency(exp.amount)}</span>
                    <TrendIcon
                      current={parseMoney(exp.amount)}
                      previous={parseMoney(exp.previousAmount)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly P&L Chart */}
      {monthlyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(value) => formatCurrency(String(value))}
                />
                <Legend />
                <Bar dataKey="income" fill="#22c55e" name="Income" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-muted-foreground text-sm">No transactions yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell>{formatDate(txn.date)}</TableCell>
                    <TableCell>{txn.description}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(txn.totalAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
