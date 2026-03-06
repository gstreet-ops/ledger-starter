"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  acceptSuggestion,
  skipRow,
  bulkAccept,
  runCategorization,
  createRuleFromAcceptance,
} from "./actions";
import { parseMoney } from "@/lib/utils/money";

type ImportRow = {
  id: string;
  date: Date;
  amount: string;
  name: string;
  merchantName: string | null;
  category: unknown;
  status: "pending" | "matched" | "ignored";
  aiSuggestion: unknown;
};

type Account = {
  id: string;
  code: number;
  name: string;
  type: string;
};

type AiSuggestionData = {
  accountId: string;
  accountName: string;
  confidence: number;
  reasoning: string;
  source?: "rule" | "ai";
  ruleId?: string;
};

function formatAmount(amount: string) {
  const num = parseMoney(amount);
  const display = Math.abs(num).toFixed(2);
  return num > 0 ? `-$${display}` : `$${display}`;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function confidenceBadge(confidence: number) {
  if (confidence >= 0.8)
    return <Badge className="bg-green-600">High</Badge>;
  if (confidence >= 0.5)
    return <Badge className="bg-yellow-600">Medium</Badge>;
  return <Badge className="bg-red-600">Low</Badge>;
}

export function ReviewTable({
  rows,
  accounts,
}: {
  rows: ImportRow[];
  accounts: Account[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editAccountId, setEditAccountId] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const pendingRows = rows.filter((r) => r.status === "pending");

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === pendingRows.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pendingRows.map((r) => r.id)));
    }
  }

  function handleAccept(rowId: string, accountId: string) {
    startTransition(async () => {
      const result = await acceptSuggestion(rowId, accountId);
      if ("error" in result) setMessage(`Error: ${result.error}`);
    });
  }

  function handleSkip(rowId: string) {
    startTransition(async () => {
      await skipRow(rowId);
    });
  }

  function handleBulkAccept() {
    const ids: string[] = [];
    const acctIds: string[] = [];
    for (const id of selected) {
      const row = rows.find((r) => r.id === id);
      const suggestion = row?.aiSuggestion as AiSuggestionData | null;
      if (row && suggestion?.accountId) {
        ids.push(id);
        acctIds.push(suggestion.accountId);
      }
    }
    if (ids.length === 0) {
      setMessage("No rows with suggestions selected");
      return;
    }
    startTransition(async () => {
      await bulkAccept(ids, acctIds);
      setSelected(new Set());
      setMessage(`Accepted ${ids.length} transactions`);
    });
  }

  function handleRunCategorization() {
    startTransition(async () => {
      const result = await runCategorization();
      setMessage(
        `Categorization complete: ${result.rules} rule matches, ${result.ai} AI suggestions`
      );
    });
  }

  function handleEditAccept(rowId: string) {
    if (!editAccountId) return;
    startTransition(async () => {
      await acceptSuggestion(rowId, editAccountId);
      setEditingRow(null);
      setEditAccountId("");
    });
  }

  function handleCreateRule(row: ImportRow, accountId: string) {
    const pattern = row.merchantName ?? row.name;
    const matchField = row.merchantName ? "merchant_name" : "name";
    startTransition(async () => {
      await createRuleFromAcceptance(pattern, matchField, accountId, 10);
      setMessage(`Rule created for "${pattern}"`);
    });
  }

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button onClick={handleRunCategorization} disabled={isPending}>
          {isPending ? "Running..." : "Run Categorization"}
        </Button>
        {selected.size > 0 && (
          <Button
            variant="outline"
            onClick={handleBulkAccept}
            disabled={isPending}
          >
            Accept Selected ({selected.size})
          </Button>
        )}
        {message && (
          <span className="text-sm text-muted-foreground ml-2">{message}</span>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <input
                  type="checkbox"
                  checked={
                    pendingRows.length > 0 &&
                    selected.size === pendingRows.length
                  }
                  onChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead className="w-[100px] text-right">Amount</TableHead>
              <TableHead>Merchant</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Suggestion</TableHead>
              <TableHead className="w-[90px]">Status</TableHead>
              <TableHead className="w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const suggestion = row.aiSuggestion as AiSuggestionData | null;
              const category = row.category as {
                primary?: string;
              } | null;

              return (
                <TableRow key={row.id}>
                  <TableCell>
                    {row.status === "pending" && (
                      <input
                        type="checkbox"
                        checked={selected.has(row.id)}
                        onChange={() => toggleSelect(row.id)}
                      />
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(row.date)}
                  </TableCell>
                  <TableCell className="text-sm text-right font-mono">
                    {formatAmount(row.amount)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {row.merchantName ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">
                    {row.name}
                  </TableCell>
                  <TableCell className="text-sm">
                    {suggestion ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex items-center gap-1 cursor-help">
                              <span className="truncate max-w-[120px]">
                                {suggestion.accountName}
                              </span>
                              {confidenceBadge(suggestion.confidence)}
                              {suggestion.source === "rule" && (
                                <Badge variant="outline" className="text-xs">
                                  Rule
                                </Badge>
                              )}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>{suggestion.reasoning}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-muted-foreground">
                        {category?.primary ?? "—"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        row.status === "matched"
                          ? "default"
                          : row.status === "ignored"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {row.status === "pending" && (
                      <div className="flex items-center gap-1">
                        {editingRow === row.id ? (
                          <>
                            <Select
                              value={editAccountId}
                              onValueChange={setEditAccountId}
                            >
                              <SelectTrigger className="h-7 w-[130px] text-xs">
                                <SelectValue placeholder="Account" />
                              </SelectTrigger>
                              <SelectContent>
                                {accounts.map((a) => (
                                  <SelectItem key={a.id} value={a.id}>
                                    {a.code} {a.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              variant="default"
                              className="h-7 text-xs"
                              disabled={!editAccountId || isPending}
                              onClick={() => handleEditAccept(row.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={() => setEditingRow(null)}
                            >
                              X
                            </Button>
                          </>
                        ) : (
                          <>
                            {suggestion?.accountId && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="h-7 text-xs"
                                  disabled={isPending}
                                  onClick={() =>
                                    handleAccept(row.id, suggestion.accountId)
                                  }
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  disabled={isPending}
                                  onClick={() =>
                                    handleCreateRule(
                                      row,
                                      suggestion.accountId
                                    )
                                  }
                                >
                                  +Rule
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              disabled={isPending}
                              onClick={() => {
                                setEditingRow(row.id);
                                setEditAccountId(
                                  suggestion?.accountId ?? ""
                                );
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              disabled={isPending}
                              onClick={() => handleSkip(row.id)}
                            >
                              Skip
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
