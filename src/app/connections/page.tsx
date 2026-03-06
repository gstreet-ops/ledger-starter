export const dynamic = "force-dynamic";

import { getPlaidItems, getLedgerAccounts } from "@/lib/db/queries";
import { PlaidLinkButton } from "@/components/plaid-link-button";
import { SyncNowButton } from "@/components/sync-now-button";
import { ConnectionsList } from "./connections-list";

export default async function ConnectionsPage() {
  const [items, ledgerAccounts] = await Promise.all([
    getPlaidItems(),
    getLedgerAccounts(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bank Connections</h1>
          <p className="mt-1 text-muted-foreground">
            Manage Plaid-linked bank accounts and sync status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SyncNowButton />
          <PlaidLinkButton />
        </div>
      </div>

      <ConnectionsList items={items} ledgerAccounts={ledgerAccounts} />
    </div>
  );
}
