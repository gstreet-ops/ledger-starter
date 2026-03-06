export const dynamic = "force-dynamic";

import { getPlaidItems } from "@/lib/db/queries";
import { SettingsView } from "./settings-view";

export default async function SettingsPage() {
  const plaidItems = await getPlaidItems();

  const envStatus = {
    anthropicKey: !!process.env.ANTHROPIC_API_KEY,
    plaidClientId: !!process.env.PLAID_CLIENT_ID,
    plaidSecret: !!process.env.PLAID_SECRET,
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    databaseUrl: !!process.env.DATABASE_URL,
  };

  return (
    <SettingsView
      plaidItems={plaidItems.map((item) => ({
        id: item.id,
        institutionName: item.institutionName,
        isActive: item.isActive,
        lastSyncedAt: item.lastSyncedAt?.toISOString() ?? null,
        accountCount: item.accounts?.length ?? 0,
      }))}
      envStatus={envStatus}
    />
  );
}
