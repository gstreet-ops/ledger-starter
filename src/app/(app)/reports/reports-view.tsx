"use client";

import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTrialBalance, fetchPnl } from "./actions";
import { parseMoney } from "@/lib/utils/money";

type AccountRow = {
  code: number;
  name: string;
  type: string;
  scheduleCLine: string | null;
  totalDebit: string;
  totalCredit: string;
  balance: string;
};

type TrialBalanceData = {
  accounts: AccountRow[];
  totalDebits: string;
  totalCredits: string;
};

type PnlData = {
  income: AccountRow[];
  expenses: AccountRow[];
  totalIncome: string;
  totalExpenses: string;
  netProfit: string;
};

function formatCurrency(amount: string) {
  const num = parseMoney(amount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

export function ReportsView({
  initialTrialBalance,
  initialPnl,
}: {
  initialTrialBalance: TrialBalanceData;
  initialPnl: PnlData;
}) {
  const [tb, setTb] = useState(initialTrialBalance);
  const [pnl, setPnl] = useState(initialPnl);
  const [pnlStart, setPnlStart] = useState(
    `${new Date().getFullYear()}-01-01`
  );
  const [pnlEnd, setPnlEnd] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isPending, startTransition] = useTransition();

  function refreshPnl() {
    startTransition(async () => {
      const data = await fetchPnl(pnlStart, pnlEnd);
      setPnl(data);
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>

      <Tabs defaultValue="trial-balance">
        <TabsList>
          <TabsTrigger value="trial-balance">Trial Balance</TabsTrigger>
          <TabsTrigger value="pnl">Profit & Loss</TabsTrigger>
        </TabsList>

        <TabsContent value="trial-balance" className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Code</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Debits</TableHead>
                <TableHead className="text-right">Credits</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tb.accounts.map((a) => (
                <TableRow key={a.code}>
                  <TableCell className="font-mono">{a.code}</TableCell>
                  <TableCell>{a.name}</TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {a.type}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(a.totalDebit)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(a.totalCredit)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {formatCurrency(a.balance)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="font-semibold">
                  Totals
                </TableCell>
                <TableCell className="text-right font-mono font-semibold">
                  {formatCurrency(tb.totalDebits)}
                </TableCell>
                <TableCell className="text-right font-mono font-semibold">
                  {formatCurrency(tb.totalCredits)}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TabsContent>

        <TabsContent value="pnl" className="space-y-4">
          <div className="flex items-end gap-3">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={pnlStart}
                onChange={(e) => setPnlStart(e.target.value)}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={pnlEnd}
                onChange={(e) => setPnlEnd(e.target.value)}
              />
            </div>
            <Button onClick={refreshPnl} disabled={isPending}>
              {isPending ? "Loading..." : "Update"}
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Total Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(pnl.totalIncome)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Total Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(pnl.totalExpenses)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Net Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-xl font-bold ${parseMoney(pnl.netProfit) >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatCurrency(pnl.netProfit)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Income section */}
          <h3 className="font-semibold text-lg mt-4">Income</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Code</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Schedule C</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pnl.income.map((a) => (
                <TableRow key={a.code}>
                  <TableCell className="font-mono">{a.code}</TableCell>
                  <TableCell>{a.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {a.scheduleCLine ?? "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(a.balance)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="font-semibold">
                  Total Income
                </TableCell>
                <TableCell className="text-right font-mono font-semibold">
                  {formatCurrency(pnl.totalIncome)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>

          {/* Expenses section */}
          <h3 className="font-semibold text-lg">Expenses</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Code</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Schedule C</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pnl.expenses.map((a) => (
                <TableRow key={a.code}>
                  <TableCell className="font-mono">{a.code}</TableCell>
                  <TableCell>{a.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {a.scheduleCLine ?? "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(a.balance)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="font-semibold">
                  Total Expenses
                </TableCell>
                <TableCell className="text-right font-mono font-semibold">
                  {formatCurrency(pnl.totalExpenses)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
