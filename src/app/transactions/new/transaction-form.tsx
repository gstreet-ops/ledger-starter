"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { submitTransaction } from "./actions";
import { parseMoney } from "@/lib/utils/money";

type Account = { id: string; code: number; name: string; type: string };
type Line = { accountId: string; debit: string; credit: string; memo: string };

function emptyLine(): Line {
  return { accountId: "", debit: "", credit: "", memo: "" };
}

export function TransactionForm({ accounts }: { accounts: Account[] }) {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [memo, setMemo] = useState("");
  const [lines, setLines] = useState<Line[]>([emptyLine(), emptyLine()]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const totalDebit = lines.reduce((s, l) => s + parseMoney(l.debit || "0"), 0);
  const totalCredit = lines.reduce(
    (s, l) => s + parseMoney(l.credit || "0"),
    0
  );
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001;
  const difference = (totalDebit - totalCredit).toFixed(2);

  function updateLine(index: number, field: keyof Line, value: string) {
    const next = [...lines];
    next[index] = { ...next[index], [field]: value };
    setLines(next);
  }

  function removeLine(index: number) {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);

    const validLines = lines.filter(
      (l) => l.accountId && (parseMoney(l.debit || "0") > 0 || parseMoney(l.credit || "0") > 0)
    );

    const result = await submitTransaction({
      date,
      description,
      memo,
      lines: validLines,
    });

    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold">New Transaction</h1>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Transaction description"
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="memo">Memo</Label>
        <Textarea
          id="memo"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="Optional notes"
          rows={2}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Line Items</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLines([...lines, emptyLine()])}
          >
            <Plus className="mr-1 h-3 w-3" /> Add Line
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead className="w-36">Debit</TableHead>
              <TableHead className="w-36">Credit</TableHead>
              <TableHead>Memo</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((line, i) => (
              <TableRow key={i}>
                <TableCell>
                  <select
                    value={line.accountId}
                    onChange={(e) => updateLine(i, "accountId", e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  >
                    <option value="">Select account...</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code} — {a.name}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={line.debit}
                    onChange={(e) => updateLine(i, "debit", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={line.credit}
                    onChange={(e) => updateLine(i, "credit", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Line memo"
                    value={line.memo}
                    onChange={(e) => updateLine(i, "memo", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={lines.length <= 2}
                    onClick={() => removeLine(i)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-semibold">Totals</TableCell>
              <TableCell className="font-mono font-semibold">
                ${totalDebit.toFixed(2)}
              </TableCell>
              <TableCell className="font-mono font-semibold">
                ${totalCredit.toFixed(2)}
              </TableCell>
              <TableCell
                colSpan={2}
                className={`text-sm ${isBalanced ? "text-green-600" : "text-red-600"}`}
              >
                {isBalanced
                  ? "Balanced"
                  : `Out of balance by $${Math.abs(parseMoney(difference)).toFixed(2)}`}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleSubmit}
          disabled={!isBalanced || !description || !date || submitting}
        >
          {submitting ? "Posting..." : "Post Transaction"}
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/transactions/journal")}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
