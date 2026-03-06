"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mapPlaidAccount } from "./actions";

type PlaidItem = {
  id: string;
  institutionName: string | null;
  institutionId: string | null;
  isActive: boolean;
  lastSyncedAt: Date | null;
  accounts: PlaidAccount[];
};

type PlaidAccount = {
  id: string;
  name: string;
  type: string;
  subtype: string | null;
  mask: string | null;
  ledgerAccountId: string | null;
};

type LedgerAccount = {
  id: string;
  code: number;
  name: string;
  type: string;
};

export function ConnectionsList({
  items,
  ledgerAccounts,
}: {
  items: PlaidItem[];
  ledgerAccounts: LedgerAccount[];
}) {
  const router = useRouter();

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground">
        No bank connections yet. Click &quot;Connect a Bank&quot; to get started.
      </p>
    );
  }

  async function handleMapping(plaidAccountId: string, ledgerAccountId: string) {
    const fd = new FormData();
    fd.set("plaidAccountId", plaidAccountId);
    fd.set("ledgerAccountId", ledgerAccountId === "none" ? "" : ledgerAccountId);
    await mapPlaidAccount(fd);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border p-4">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-lg font-semibold">
              {item.institutionName ?? "Unknown Institution"}
            </h2>
            <Badge variant={item.isActive ? "default" : "destructive"}>
              {item.isActive ? "Active" : "Error"}
            </Badge>
            {item.lastSyncedAt && (
              <span className="text-xs text-muted-foreground">
                Last synced:{" "}
                {new Date(item.lastSyncedAt).toLocaleString("en-US", {
                  timeZone: "America/New_York",
                })}
              </span>
            )}
          </div>

          {item.accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No accounts found</p>
          ) : (
            <div className="space-y-2">
              {item.accounts.map((acct) => (
                <div
                  key={acct.id}
                  className="flex items-center gap-4 rounded border px-3 py-2 text-sm"
                >
                  <span className="font-medium min-w-[180px]">
                    {acct.name}
                    {acct.mask && (
                      <span className="text-muted-foreground"> ····{acct.mask}</span>
                    )}
                  </span>
                  <Badge variant="outline">
                    {acct.type}
                    {acct.subtype && ` / ${acct.subtype}`}
                  </Badge>
                  <div className="ml-auto w-[260px]">
                    <Select
                      defaultValue={acct.ledgerAccountId ?? "none"}
                      onValueChange={(val) => handleMapping(acct.id, val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Map to ledger account..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— Not mapped —</SelectItem>
                        {ledgerAccounts.map((la) => (
                          <SelectItem key={la.id} value={la.id}>
                            {la.code} — {la.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
