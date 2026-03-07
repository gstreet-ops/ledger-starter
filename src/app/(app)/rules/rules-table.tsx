"use client";

import { useState, useTransition } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addRule, editRule, removeRule, testRule } from "./actions";

type Rule = {
  id: string;
  name: string;
  pattern: string;
  matchField: string;
  accountId: string;
  accountCode: number;
  accountName: string;
  priority: number;
  isActive: boolean;
  createdAt: Date;
};

type Account = {
  id: string;
  code: number;
  name: string;
  type: string;
};

export function RulesTable({
  initialRules,
  accounts,
}: {
  initialRules: Rule[];
  accounts: Account[];
}) {
  const [rules, setRules] = useState(initialRules);
  const [isPending, startTransition] = useTransition();

  // New rule form
  const [newName, setNewName] = useState("");
  const [newPattern, setNewPattern] = useState("");
  const [newMatchField, setNewMatchField] = useState("name");
  const [newAccountId, setNewAccountId] = useState(accounts[0]?.id ?? "");
  const [newPriority, setNewPriority] = useState(0);
  const [showForm, setShowForm] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Rule>>({});

  // Test state
  const [testInput, setTestInput] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);

  function handleAdd() {
    if (!newName || !newPattern || !newAccountId) return;
    startTransition(async () => {
      const result = await addRule({
        name: newName,
        pattern: newPattern,
        matchField: newMatchField,
        accountId: newAccountId,
        priority: newPriority,
      });
      if ("error" in result) {
        alert(result.error);
        return;
      }
      // Refresh by adding with account info
      const acct = accounts.find((a) => a.id === newAccountId);
      setRules((prev) => [
        { ...result, accountCode: acct?.code ?? 0, accountName: acct?.name ?? "" },
        ...prev,
      ]);
      setNewName("");
      setNewPattern("");
      setNewPriority(0);
      setShowForm(false);
    });
  }

  function handleToggle(rule: Rule) {
    startTransition(async () => {
      await editRule(rule.id, { isActive: !rule.isActive });
      setRules((prev) =>
        prev.map((r) => (r.id === rule.id ? { ...r, isActive: !r.isActive } : r))
      );
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await removeRule(id);
      setRules((prev) => prev.filter((r) => r.id !== id));
    });
  }

  function startEdit(rule: Rule) {
    setEditingId(rule.id);
    setEditData({
      name: rule.name,
      pattern: rule.pattern,
      matchField: rule.matchField,
      accountId: rule.accountId,
      priority: rule.priority,
    });
  }

  function handleSaveEdit() {
    if (!editingId) return;
    startTransition(async () => {
      await editRule(editingId, {
        name: editData.name,
        pattern: editData.pattern,
        matchField: editData.matchField,
        accountId: editData.accountId,
        priority: editData.priority,
      });
      const acct = accounts.find((a) => a.id === editData.accountId);
      setRules((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? { ...r, ...editData, accountCode: acct?.code ?? r.accountCode, accountName: acct?.name ?? r.accountName }
            : r
        )
      );
      setEditingId(null);
    });
  }

  function handleTest() {
    if (!testInput) return;
    startTransition(async () => {
      const result = await testRule(testInput);
      setTestResult(result ? `Matched rule: "${result.ruleName}" → Account ${result.accountId}` : "No match found");
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorization Rules</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Rule"}
        </Button>
      </div>

      {/* Test a rule */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Test Rules</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 items-end">
          <div className="flex-1">
            <Input
              placeholder="Enter a transaction description to test..."
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={handleTest} disabled={isPending}>
            Test
          </Button>
          {testResult && (
            <span className="text-sm text-muted-foreground">{testResult}</span>
          )}
        </CardContent>
      </Card>

      {/* Add rule form */}
      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <Label>Name</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Rule name" />
              </div>
              <div>
                <Label>Pattern</Label>
                <Input value={newPattern} onChange={(e) => setNewPattern(e.target.value)} placeholder="Match text" />
              </div>
              <div>
                <Label>Match Field</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newMatchField}
                  onChange={(e) => setNewMatchField(e.target.value)}
                >
                  <option value="name">Description</option>
                  <option value="merchant_name">Merchant Name</option>
                </select>
              </div>
              <div>
                <Label>Account</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newAccountId}
                  onChange={(e) => setNewAccountId(e.target.value)}
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} — {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Priority</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={newPriority}
                    onChange={(e) => setNewPriority(parseInt(e.target.value) || 0)}
                  />
                  <Button onClick={handleAdd} disabled={isPending}>
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rules table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Pattern</TableHead>
            <TableHead>Field</TableHead>
            <TableHead>Account</TableHead>
            <TableHead className="text-center">Priority</TableHead>
            <TableHead className="text-center">Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No rules yet. Click "Add Rule" to create one.
              </TableCell>
            </TableRow>
          )}
          {rules.map((rule) => (
            <TableRow key={rule.id} className={!rule.isActive ? "opacity-50" : ""}>
              {editingId === rule.id ? (
                <>
                  <TableCell>
                    <Input
                      value={editData.name ?? ""}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={editData.pattern ?? ""}
                      onChange={(e) => setEditData({ ...editData, pattern: e.target.value })}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <select
                      className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                      value={editData.matchField ?? "name"}
                      onChange={(e) => setEditData({ ...editData, matchField: e.target.value })}
                    >
                      <option value="name">Description</option>
                      <option value="merchant_name">Merchant</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <select
                      className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                      value={editData.accountId ?? ""}
                      onChange={(e) => setEditData({ ...editData, accountId: e.target.value })}
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.code} — {a.name}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell className="text-center">
                    <Input
                      type="number"
                      value={editData.priority ?? 0}
                      onChange={(e) => setEditData({ ...editData, priority: parseInt(e.target.value) || 0 })}
                      className="h-8 w-16 mx-auto text-center"
                    />
                  </TableCell>
                  <TableCell className="text-center">—</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={handleSaveEdit} disabled={isPending}>
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell className="font-mono text-sm">{rule.pattern}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {rule.matchField === "merchant_name" ? "Merchant" : "Description"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {rule.accountCode} — {rule.accountName}
                  </TableCell>
                  <TableCell className="text-center font-mono">{rule.priority}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggle(rule)}
                      disabled={isPending}
                    >
                      {rule.isActive ? "Yes" : "No"}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(rule)} disabled={isPending}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleDelete(rule.id)}
                      disabled={isPending}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
