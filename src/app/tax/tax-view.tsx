"use client";

import { useState, useTransition } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchTaxData } from "./actions";
import { parseMoney } from "@/lib/utils/money";

type TaxData = Awaited<ReturnType<typeof fetchTaxData>>;

function fmt(amount: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseMoney(amount));
}

function pct(rate: string) {
  return `${rate}%`;
}

export function TaxView({ initialData, initialYear }: { initialData: TaxData; initialYear: number }) {
  const [data, setData] = useState(initialData);
  const [year, setYear] = useState(initialYear);
  const [isPending, startTransition] = useTransition();

  function changeYear(newYear: number) {
    setYear(newYear);
    startTransition(async () => {
      const d = await fetchTaxData(newYear);
      setData(d);
    });
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tax</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => changeYear(year - 1)} disabled={isPending}>
            &larr;
          </Button>
          <span className="font-mono text-lg font-semibold w-16 text-center">{year}</span>
          <Button variant="outline" size="sm" onClick={() => changeYear(year + 1)} disabled={isPending || year >= new Date().getFullYear()}>
            &rarr;
          </Button>
        </div>
      </div>

      {/* Tax Estimates */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-xl font-bold ${parseMoney(data.scheduleC.netProfit) >= 0 ? "text-green-600" : "text-red-600"}`}>
              {fmt(data.scheduleC.netProfit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Federal Income Tax</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{fmt(data.federal.tax)}</p>
            <p className="text-xs text-muted-foreground">Effective {pct(data.federal.effectiveRate)} / Marginal {pct(data.federal.marginalRate)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Self-Employment Tax</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{fmt(data.se.totalSeTax)}</p>
            <p className="text-xs text-muted-foreground">SS {fmt(data.se.ssTax)} + Medicare {fmt(data.se.medicareTax)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Georgia Income Tax</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{fmt(data.ga.tax)}</p>
            <p className="text-xs text-muted-foreground">Effective {pct(data.ga.effectiveRate)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quarterly Estimates */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Quarterly Estimated Payments</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data.quarterly.dueDates.map((q) => {
            const isPast = q.dueDate < today;
            return (
              <Card key={q.quarter} className={isPast ? "opacity-60" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">{q.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-bold font-mono">{fmt(q.amount)}</p>
                  <p className="text-xs text-muted-foreground">
                    Due {q.dueDate}
                    {isPast && " (past)"}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Total estimated tax: {fmt(data.quarterly.totalAnnualTax)} (Federal {fmt(data.quarterly.federalTax)} + SE {fmt(data.quarterly.seTax)} + GA {fmt(data.quarterly.gaTax)})
        </p>
      </div>

      {/* Schedule C Summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Schedule C Summary</h2>
          <Button variant="outline" size="sm" asChild>
            <a href={`/tax/export?year=${year}`} download>
              Export CSV
            </a>
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Line</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">YTD Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.scheduleC.lineItems.map((item) => {
              const amount = parseMoney(item.total);
              if (amount === 0) return null;
              return (
                <TableRow key={item.line}>
                  <TableCell className="font-mono">{item.line}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right font-mono">{fmt(item.total)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2} className="font-semibold">Gross Income</TableCell>
              <TableCell className="text-right font-mono font-semibold">{fmt(data.scheduleC.grossIncome)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2} className="font-semibold">Total Expenses</TableCell>
              <TableCell className="text-right font-mono font-semibold">{fmt(data.scheduleC.totalExpenses)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2} className="font-semibold">Net Profit (Line 31)</TableCell>
              <TableCell className="text-right font-mono font-bold">{fmt(data.scheduleC.netProfit)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
