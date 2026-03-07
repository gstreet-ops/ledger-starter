"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type PlaidItemSummary = {
  id: string;
  institutionName: string | null;
  isActive: boolean;
  lastSyncedAt: string | null;
  accountCount: number;
};

type EnvStatus = {
  anthropicKey: boolean;
  plaidClientId: boolean;
  plaidSecret: boolean;
  supabaseUrl: boolean;
  databaseUrl: boolean;
};

export function SettingsView({
  plaidItems,
  envStatus,
}: {
  plaidItems: PlaidItemSummary[];
  envStatus: EnvStatus;
}) {
  const envEntries: Array<{ label: string; configured: boolean }> = [
    { label: "Anthropic API Key", configured: envStatus.anthropicKey },
    { label: "Plaid Client ID", configured: envStatus.plaidClientId },
    { label: "Plaid Secret", configured: envStatus.plaidSecret },
    { label: "Supabase URL", configured: envStatus.supabaseUrl },
    { label: "Database URL", configured: envStatus.databaseUrl },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Plaid Connections */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Plaid Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          {plaidItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bank connections configured.</p>
          ) : (
            <div className="space-y-3">
              {plaidItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">
                      {item.institutionName ?? "Unknown Institution"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.accountCount} account{item.accountCount !== 1 ? "s" : ""}
                      {item.lastSyncedAt &&
                        ` | Last synced: ${new Date(item.lastSyncedAt).toLocaleDateString("en-US", { timeZone: "America/New_York" })}`}
                    </p>
                  </div>
                  <Badge variant={item.isActive ? "default" : "secondary"}>
                    {item.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Environment Check */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Environment Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {envEntries.map((entry) => (
              <div
                key={entry.label}
                className="flex items-center justify-between"
              >
                <span className="text-sm">{entry.label}</span>
                <Badge variant={entry.configured ? "default" : "destructive"}>
                  {entry.configured ? "Configured" : "Missing"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Features */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            AI Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                envStatus.anthropicKey ? "bg-green-500" : "bg-gray-400"
              }`}
            />
            <span className="text-sm font-medium">
              {envStatus.anthropicKey ? "Connected" : "Not configured"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            AI powers two features: intelligent transaction categorization and
            narrative financial reports.
          </p>
          <p className="text-xs text-muted-foreground">
            Your API key is set as an environment variable (ANTHROPIC_API_KEY).
            Update it in your hosting provider&apos;s settings (Vercel → Project
            Settings → Environment Variables).
          </p>
        </CardContent>
      </Card>

      {/* Fiscal Year */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Fiscal Year
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Calendar year (January 1 - December 31). This is the default for
            single-member LLCs filing Schedule C.
          </p>
        </CardContent>
      </Card>

      {/* Default Report Range */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Default Report Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Year-to-date (January 1 through today). All reports default to this
            range unless a custom period is selected.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
