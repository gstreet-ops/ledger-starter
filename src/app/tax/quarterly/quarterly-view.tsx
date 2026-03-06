"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getQuarterlyData, recordPayment } from "./actions";
import { parseMoney } from "@/lib/utils/money";

type QuarterlyData = Awaited<ReturnType<typeof getQuarterlyData>>;

function fmt(amount: string | number) {
  const num = typeof amount === "string" ? parseMoney(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

const statusColors: Record<string, string> = {
  upcoming: "bg-muted text-muted-foreground",
  due: "bg-yellow-100 text-yellow-800",
  overdue: "bg-red-100 text-red-800",
  paid: "bg-green-100 text-green-800",
};

export function QuarterlyView({
  initialData,
  initialYear,
}: {
  initialData: QuarterlyData;
  initialYear: number;
}) {
  const [data, setData] = useState(initialData);
  const [year, setYear] = useState(initialYear);
  const [isPending, startTransition] = useTransition();
  const [editingQuarter, setEditingQuarter] = useState<number | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  function changeYear(newYear: number) {
    setYear(newYear);
    startTransition(async () => {
      const d = await getQuarterlyData(newYear);
      setData(d);
    });
  }

  function refresh() {
    startTransition(async () => {
      const d = await getQuarterlyData(year);
      setData(d);
    });
  }

  async function handleRecordPayment(quarter: number) {
    const amount = parseMoney(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    startTransition(async () => {
      await recordPayment(year, quarter, amount, paymentDate);
      setEditingQuarter(null);
      setPaymentAmount("");
      const d = await getQuarterlyData(year);
      setData(d);
    });
  }

  const today = new Date().toISOString().split("T")[0];
  // Warning: next payment due within 30 days
  const nextDue = data.quarters.find(
    (q) => q.status === "due" || q.status === "overdue"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quarterly Estimates</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeYear(year - 1)}
            disabled={isPending}
          >
            &larr;
          </Button>
          <span className="font-mono text-lg font-semibold w-16 text-center">
            {year}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeYear(year + 1)}
            disabled={isPending || year >= new Date().getFullYear()}
          >
            &rarr;
          </Button>
        </div>
      </div>

      {/* Warning banner */}
      {nextDue && (
        <div
          className={`rounded-md p-3 text-sm font-medium ${
            nextDue.status === "overdue"
              ? "bg-red-50 text-red-800 border border-red-200"
              : "bg-yellow-50 text-yellow-800 border border-yellow-200"
          }`}
        >
          {nextDue.status === "overdue"
            ? `${nextDue.label} payment of ${fmt(nextDue.estimatedAmount)} is overdue! (was due ${nextDue.dueDate})`
            : `${nextDue.label} payment of ${fmt(nextDue.estimatedAmount)} is due ${nextDue.dueDate}`}
        </div>
      )}

      {/* YTD Projection */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            Full-Year Projection (Annualized)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            At current pace, your full-year tax liability is ~
            {fmt(data.ytdProjection.totalTax)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Based on annualized net profit of{" "}
            {fmt(data.ytdProjection.annualizedProfit)} — Federal{" "}
            {fmt(data.ytdProjection.federalTax)} + SE{" "}
            {fmt(data.ytdProjection.seTax)} +{" "}
            {data.ytdProjection.stateLabel}{" "}
            {fmt(data.ytdProjection.stateTax)}
          </p>
        </CardContent>
      </Card>

      {/* Quarterly Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {data.quarters.map((q) => (
          <Card key={q.quarter}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{q.label}</CardTitle>
                <Badge variant="secondary" className={statusColors[q.status]}>
                  {q.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Estimated</span>
                <span className="font-mono font-bold">
                  {fmt(q.estimatedAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Paid</span>
                <span className="font-mono font-bold">
                  {fmt(q.paidAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Due</span>
                <span className="text-sm">{q.dueDate}</span>
              </div>
              {q.paidDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Paid on
                  </span>
                  <span className="text-sm">{q.paidDate}</span>
                </div>
              )}

              {editingQuarter === q.quarter ? (
                <div className="space-y-2 border-t pt-3">
                  <div>
                    <Label className="text-xs">Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Date Paid</Label>
                    <Input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleRecordPayment(q.quarter)}
                      disabled={isPending}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingQuarter(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setEditingQuarter(q.quarter);
                    setPaymentAmount(
                      parseMoney(q.paidAmount) > 0 ? q.paidAmount : q.estimatedAmount
                    );
                  }}
                >
                  Record Payment
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estimated vs Actual */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            Estimated vs Actual YTD
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm">
            <span>Total Estimated</span>
            <span className="font-mono font-bold">
              {fmt(data.totalEstimated)}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span>Total Paid</span>
            <span className="font-mono font-bold">{fmt(data.totalPaid)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1 border-t pt-1">
            <span className="font-semibold">Remaining</span>
            <span className="font-mono font-bold">
              {fmt(
                (
                  parseMoney(data.totalEstimated) - parseMoney(data.totalPaid)
                ).toFixed(2)
              )}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
