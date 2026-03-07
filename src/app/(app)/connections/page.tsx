export const dynamic = "force-dynamic";

import { getPlaidItems, getLedgerAccounts } from "@/lib/db/queries";
import { PlaidLinkButton } from "@/components/plaid-link-button";
import { SyncNowButton } from "@/components/sync-now-button";
import { ConnectionsList } from "./connections-list";
import { Landmark } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

async function isDemo() {
  const demoEmail = process.env.DEMO_EMAIL;
  if (!demoEmail) return false;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email === demoEmail;
  } catch {
    return false;
  }
}

export default async function ConnectionsPage() {
  const demo = await isDemo();
  const plaidConfigured = !!(process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET);

  const [items, ledgerAccounts] = await Promise.all([
    getPlaidItems(),
    getLedgerAccounts(),
  ]);

  // Demo user: show mock connected accounts
  if (demo) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Bank Connections</h1>
          <p className="mt-1 text-muted-foreground">
            Manage Plaid-linked bank accounts and sync status.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-lg font-semibold">First National Bank</h2>
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground">Active</span>
              <span className="text-xs text-muted-foreground">Last synced: 2 hours ago</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-4 rounded border px-3 py-2 text-sm">
                <span className="font-medium min-w-[180px]">
                  Business Checking <span className="text-muted-foreground">····4521</span>
                </span>
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs">depository / checking</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-lg font-semibold">Chase</h2>
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground">Active</span>
              <span className="text-xs text-muted-foreground">Last synced: 2 hours ago</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-4 rounded border px-3 py-2 text-sm">
                <span className="font-medium min-w-[180px]">
                  Business Visa <span className="text-muted-foreground">····8832</span>
                </span>
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs">credit / credit card</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20 p-4">
          <p className="text-sm text-muted-foreground">
            In your own instance, you&apos;ll connect real bank accounts here via Plaid.
          </p>
        </div>
      </div>
    );
  }

  // Plaid not configured: show setup info
  if (!plaidConfigured) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Bank Connections</h1>
          <p className="mt-1 text-muted-foreground">
            Manage Plaid-linked bank accounts and sync status.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <Landmark className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold">Bank Sync</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Connect your bank accounts to automatically import transactions.
            Supports checking, savings, and credit card accounts from thousands of financial institutions.
          </p>
          <div className="space-y-2">
            <p className="text-sm font-medium">How to set up:</p>
            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
              <li>Create a free Plaid developer account at plaid.com</li>
              <li>Add your Plaid credentials in environment variables (PLAID_CLIENT_ID, PLAID_SECRET)</li>
              <li>Come back here to connect your first account</li>
            </ol>
          </div>
          <p className="text-xs text-muted-foreground">
            Learn more in the{" "}
            <a
              href="https://github.com/gstreet-ops/ledger-starter/blob/main/SETUP.md#plaid-bank-sync"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Setup Guide
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Normal: Plaid configured, show real connections
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
