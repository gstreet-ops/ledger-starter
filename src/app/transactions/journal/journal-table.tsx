"use client";

import { Fragment, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronRight, Ban } from "lucide-react";
import { voidTransactionAction } from "./actions";
import { parseMoney } from "@/lib/utils/money";

type Line = {
  id: string;
  transactionId: string;
  accountId: string;
  accountCode: number;
  accountName: string;
  debit: string;
  credit: string;
  memo: string | null;
};

type Transaction = {
  id: string;
  date: Date;
  description: string;
  status: "pending" | "posted" | "voided";
  memo: string | null;
  lines: Line[];
};

type Account = {
  id: string;
  code: number;
  name: string;
  type: string;
};

function formatCurrency(amount: string) {
  const num = parseMoney(amount);
  if (num === 0) return "";
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
    year: "numeric",
  });
}

const statusColors: Record<string, "default" | "secondary" | "destructive"> = {
  posted: "default",
  pending: "secondary",
  voided: "destructive",
};

export function JournalTable({
  transactions,
  accounts,
  totalCount,
  page,
  pageSize,
}: {
  transactions: Transaction[];
  accounts: Account[];
  totalCount: number;
  page: number;
  pageSize: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const totalPages = Math.ceil(totalCount / pageSize);

  function toggleExpand(id: string) {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  }

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.delete("page");
    router.push(`/transactions/journal?${params.toString()}`);
  }

  async function handleVoid(id: string) {
    if (!confirm("Void this transaction? This cannot be undone.")) return;
    await voidTransactionAction(id);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transaction Journal</h1>
        <Button size="sm" onClick={() => router.push("/transactions/new")}>
          New Transaction
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div>
          <Input
            type="date"
            placeholder="Start date"
            defaultValue={searchParams.get("startDate") ?? ""}
            onChange={(e) => updateParams("startDate", e.target.value)}
          />
        </div>
        <div>
          <Input
            type="date"
            placeholder="End date"
            defaultValue={searchParams.get("endDate") ?? ""}
            onChange={(e) => updateParams("endDate", e.target.value)}
          />
        </div>
        <Select
          value={searchParams.get("status") ?? ""}
          onValueChange={(v) => updateParams("status", v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="posted">Posted</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="voided">Voided</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={searchParams.get("accountId") ?? ""}
          onValueChange={(v) => updateParams("accountId", v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All accounts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All accounts</SelectItem>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.code} — {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead className="w-32">Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-24">Status</TableHead>
            <TableHead className="w-32 text-right">Amount</TableHead>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((txn) => {
            const totalDebit = txn.lines
              .reduce((s, l) => s + parseMoney(l.debit), 0)
              .toFixed(2);
            const isExpanded = expandedIds.has(txn.id);

            return (
              <Fragment key={txn.id}>
                <TableRow
                  className="cursor-pointer"
                  onClick={() => toggleExpand(txn.id)}
                >
                  <TableCell>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </TableCell>
                  <TableCell>{formatDate(txn.date)}</TableCell>
                  <TableCell>{txn.description}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[txn.status]}>
                      {txn.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(totalDebit)}
                  </TableCell>
                  <TableCell>
                    {txn.status === "posted" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVoid(txn.id);
                        }}
                      >
                        <Ban className="h-3 w-3" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow key={`${txn.id}-lines`}>
                    <TableCell colSpan={6} className="bg-muted/50 p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-20 pl-12">Code</TableHead>
                            <TableHead>Account</TableHead>
                            <TableHead className="w-32 text-right">
                              Debit
                            </TableHead>
                            <TableHead className="w-32 text-right">
                              Credit
                            </TableHead>
                            <TableHead>Memo</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {txn.lines.map((line) => (
                            <TableRow key={line.id}>
                              <TableCell className="pl-12 font-mono">
                                {line.accountCode}
                              </TableCell>
                              <TableCell>{line.accountName}</TableCell>
                              <TableCell className="text-right font-mono">
                                {formatCurrency(line.debit)}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {formatCurrency(line.credit)}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {line.memo ?? ""}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
          {transactions.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No transactions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {totalCount} transactions · Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => updateParams("page", String(page - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => updateParams("page", String(page + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
