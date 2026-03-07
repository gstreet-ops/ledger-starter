"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Plus, Pencil, Power } from "lucide-react";
import { addAccount, editAccount, toggleAccountActive } from "./actions";
import { parseMoney } from "@/lib/utils/money";

type Account = {
  id: string;
  code: number;
  name: string;
  type: "asset" | "liability" | "equity" | "income" | "expense";
  scheduleCLine: string | null;
  stateFormCategory: string | null;
  isActive: boolean;
  totalDebit: string;
  totalCredit: string;
  balance: string;
};

const typeLabels: Record<string, string> = {
  asset: "Assets",
  liability: "Liabilities",
  equity: "Equity",
  income: "Income",
  expense: "Expenses",
};

const typeOrder = ["asset", "liability", "equity", "income", "expense"];

function formatCurrency(amount: string) {
  const num = parseMoney(amount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

export function AccountsTable({ accounts }: { accounts: Account[] }) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(typeOrder)
  );
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [error, setError] = useState<string | null>(null);

  const grouped = typeOrder.map((type) => ({
    type,
    label: typeLabels[type],
    accounts: accounts.filter((a) => a.type === type),
  }));

  const toggleSection = (type: string) => {
    const next = new Set(openSections);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    setOpenSections(next);
  };

  async function handleAdd(formData: FormData) {
    setError(null);
    const result = await addAccount(formData);
    if (result.error) {
      setError(result.error);
    } else {
      setAddDialogOpen(false);
    }
  }

  async function handleEdit(formData: FormData) {
    setError(null);
    const result = await editAccount(formData);
    if (result.error) {
      setError(result.error);
    } else {
      setEditDialogOpen(false);
      setEditingAccount(null);
    }
  }

  async function handleToggle(id: string, currentActive: boolean) {
    await toggleAccountActive(id, !currentActive);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Chart of Accounts</h1>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" /> Add Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Account</DialogTitle>
            </DialogHeader>
            <form action={handleAdd} className="space-y-4">
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div>
                <Label htmlFor="code">Account Code</Label>
                <Input id="code" name="code" type="number" required />
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  name="type"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  {typeOrder.map((t) => (
                    <option key={t} value={t}>
                      {typeLabels[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="scheduleCLine">Schedule C Line</Label>
                <Input id="scheduleCLine" name="scheduleCLine" />
              </div>
              <div>
                <Label htmlFor="stateFormCategory">State Form Category</Label>
                <Input id="stateFormCategory" name="stateFormCategory" />
              </div>
              <Button type="submit">Create Account</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {grouped.map((group) => (
        <Collapsible
          key={group.type}
          open={openSections.has(group.type)}
          onOpenChange={() => toggleSection(group.type)}
        >
          <CollapsibleTrigger asChild>
            <button className="flex w-full items-center gap-2 rounded-md bg-muted px-4 py-2 text-left font-semibold hover:bg-muted/80">
              {openSections.has(group.type) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              {group.label}
              <Badge variant="secondary" className="ml-auto">
                {group.accounts.length}
              </Badge>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Schedule C</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="w-20">Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.accounts.map((acct) => (
                  <TableRow
                    key={acct.id}
                    className={!acct.isActive ? "opacity-50" : ""}
                  >
                    <TableCell className="font-mono">{acct.code}</TableCell>
                    <TableCell>{acct.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {acct.scheduleCLine ?? "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(acct.balance)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={acct.isActive ? "default" : "secondary"}>
                        {acct.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setEditingAccount(acct);
                            setEditDialogOpen(true);
                            setError(null);
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleToggle(acct.id, acct.isActive)}
                        >
                          <Power className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {group.accounts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No accounts
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CollapsibleContent>
        </Collapsible>
      ))}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit Account {editingAccount?.code}
            </DialogTitle>
          </DialogHeader>
          {editingAccount && (
            <form action={handleEdit} className="space-y-4">
              {error && <p className="text-sm text-red-500">{error}</p>}
              <input type="hidden" name="id" value={editingAccount.id} />
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingAccount.name}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-scheduleCLine">Schedule C Line</Label>
                <Input
                  id="edit-scheduleCLine"
                  name="scheduleCLine"
                  defaultValue={editingAccount.scheduleCLine ?? ""}
                />
              </div>
              <div>
                <Label htmlFor="edit-stateFormCategory">State Form Category</Label>
                <Input
                  id="edit-stateFormCategory"
                  name="stateFormCategory"
                  defaultValue={editingAccount.stateFormCategory ?? ""}
                />
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
