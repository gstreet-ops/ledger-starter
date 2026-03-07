"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { generateNarrative, comparePeriods } from "./actions";
import { parseMoney } from "@/lib/utils/money";

type PnlAccount = { name: string; balance: string };
type PnlData = {
  income: PnlAccount[];
  expenses: PnlAccount[];
  totalIncome: string;
  totalExpenses: string;
  netProfit: string;
};

function formatCurrency(amount: string | number) {
  const num = typeof amount === "string" ? parseMoney(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

function PnlTable({ pnl, title }: { pnl: PnlData; title: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pnl.income.length > 0 && (
              <>
                <TableRow>
                  <TableCell colSpan={2} className="font-semibold bg-muted/50">
                    Income
                  </TableCell>
                </TableRow>
                {pnl.income.map((a) => (
                  <TableRow key={a.name}>
                    <TableCell className="pl-6">{a.name}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(a.balance)}
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
            {pnl.expenses.length > 0 && (
              <>
                <TableRow>
                  <TableCell colSpan={2} className="font-semibold bg-muted/50">
                    Expenses
                  </TableCell>
                </TableRow>
                {pnl.expenses.map((a) => (
                  <TableRow key={a.name}>
                    <TableCell className="pl-6">{a.name}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(a.balance)}
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
            <TableRow className="font-bold border-t-2">
              <TableCell>Net Profit</TableCell>
              <TableCell
                className={`text-right font-mono ${parseMoney(pnl.netProfit) >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {formatCurrency(pnl.netProfit)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function NarrativeView() {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const today = now.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(monthStart);
  const [endDate, setEndDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [pnl, setPnl] = useState<PnlData | null>(null);
  const [narrative, setNarrative] = useState<string | null>(null);

  // Comparison state
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const [compStart, setCompStart] = useState(
    `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}-01`
  );
  const [compEnd, setCompEnd] = useState(prevEnd.toISOString().split("T")[0]);
  const [compLoading, setCompLoading] = useState(false);
  const [compResult, setCompResult] = useState<{
    currentPnl: PnlData;
    previousPnl: PnlData;
    comparison: string | null;
  } | null>(null);

  async function handleGenerate() {
    setLoading(true);
    try {
      const result = await generateNarrative(startDate, endDate);
      setPnl(result.pnl);
      setNarrative(result.narrative);
    } finally {
      setLoading(false);
    }
  }

  async function handleCompare() {
    setCompLoading(true);
    try {
      const result = await comparePeriods(startDate, endDate, compStart, compEnd);
      setCompResult(result);
    } finally {
      setCompLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Explain This Period</h1>

      {/* Period selector */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Select Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 flex-wrap">
            <div>
              <Label htmlFor="start">Start Date</Label>
              <Input
                id="start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end">End Date</Label>
              <Input
                id="end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? "Generating..." : "Generate Narrative"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {pnl && (
        <div className="grid gap-4 lg:grid-cols-2">
          <PnlTable pnl={pnl} title="Profit & Loss" />
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">AI Narrative</CardTitle>
            </CardHeader>
            <CardContent>
              {narrative?.includes("require an Anthropic API key") ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm font-medium">AI Narratives Not Configured</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {narrative}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    When configured, AI generates plain-English summaries of your P&L, including
                    trend analysis and period-over-period comparisons.
                  </p>
                  <Link href="/settings" className="text-sm underline font-medium">
                    Go to Settings
                  </Link>
                </div>
              ) : narrative ? (
                <p className="text-sm whitespace-pre-line leading-relaxed">
                  {narrative}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Narrative unavailable.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Period comparison */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Period-over-Period Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 flex-wrap">
            <div>
              <Label htmlFor="comp-start">Compare To Start</Label>
              <Input
                id="comp-start"
                type="date"
                value={compStart}
                onChange={(e) => setCompStart(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="comp-end">Compare To End</Label>
              <Input
                id="comp-end"
                type="date"
                value={compEnd}
                onChange={(e) => setCompEnd(e.target.value)}
              />
            </div>
            <Button onClick={handleCompare} disabled={compLoading}>
              {compLoading ? "Comparing..." : "Compare Periods"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {compResult && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <PnlTable pnl={compResult.previousPnl} title="Previous Period" />
            <PnlTable pnl={compResult.currentPnl} title="Current Period" />
          </div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">AI Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              {compResult.comparison?.includes("require an Anthropic API key") ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm font-medium">AI Comparisons Not Configured</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {compResult.comparison}
                  </p>
                  <Link href="/settings" className="text-sm underline font-medium">
                    Go to Settings
                  </Link>
                </div>
              ) : compResult.comparison ? (
                <p className="text-sm whitespace-pre-line leading-relaxed">
                  {compResult.comparison}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Comparison unavailable.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
