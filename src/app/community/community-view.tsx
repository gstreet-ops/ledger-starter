"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight, Database, Puzzle, Plug, Eye, Share2 } from "lucide-react";
import { toggleCommunitySharing } from "./actions";
import type { InstanceFingerprint, InstanceDiff } from "@/lib/services/fingerprint";

type Props = {
  fingerprint: InstanceFingerprint;
  diff: InstanceDiff;
  fingerprintHash: string;
  communitySharingEnabled: boolean;
  lastSharedAt: string | null;
};

export function CommunityView({
  fingerprint,
  diff,
  fingerprintHash,
  communitySharingEnabled,
  lastSharedAt,
}: Props) {
  const [sharingEnabled, setSharingEnabled] = useState(communitySharingEnabled);
  const [fingerprintOpen, setFingerprintOpen] = useState(false);
  const hasChanges = diff.summary.hasChanges;

  async function handleToggleSharing() {
    const newValue = !sharingEnabled;
    setSharingEnabled(newValue);
    await toggleCommunitySharing(newValue);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Instance</h1>
        <p className="text-muted-foreground mt-1">
          See how your Ledger Starter has evolved from the base template
        </p>
      </div>

      {!hasChanges ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Your instance matches the base template. As you add custom tables,
              columns, or integrations, they&apos;ll show up here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {/* New Tables */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  New Tables
                </CardTitle>
                <Badge variant={diff.newTables.length > 0 ? "default" : "secondary"}>
                  {diff.newTables.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {diff.newTables.length > 0 ? (
                <ul className="space-y-1 text-sm">
                  {diff.newTables.map((t) => (
                    <li key={t} className="font-mono text-xs">{t}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">No new tables</p>
              )}
            </CardContent>
          </Card>

          {/* Modified Tables */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Puzzle className="h-4 w-4" />
                  Modified Tables
                </CardTitle>
                <Badge variant={diff.modifiedTables.length > 0 ? "default" : "secondary"}>
                  {diff.modifiedTables.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {diff.modifiedTables.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {diff.modifiedTables.map((t) => (
                    <li key={t.name}>
                      <span className="font-mono text-xs">{t.name}</span>
                      <ul className="ml-3 text-xs text-muted-foreground">
                        {t.newColumns.map((c) => (
                          <li key={c}>+ {c}</li>
                        ))}
                        {t.removedColumns.map((c) => (
                          <li key={c} className="text-red-500">- {c}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">No modified tables</p>
              )}
            </CardContent>
          </Card>

          {/* New Integrations */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Plug className="h-4 w-4" />
                  New Integrations
                </CardTitle>
                <Badge variant={diff.newIntegrations.length > 0 ? "default" : "secondary"}>
                  {diff.newIntegrations.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {diff.newIntegrations.length > 0 ? (
                <ul className="space-y-1 text-sm">
                  {diff.newIntegrations.map((i) => (
                    <li key={i} className="capitalize">{i}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">No new integrations</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Removed tables notice */}
      {diff.removedTables.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Removed Base Tables</CardTitle>
            <CardDescription>
              These base template tables are no longer in your schema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm font-mono text-xs">
              {diff.removedTables.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Structural Fingerprint */}
      <Collapsible open={fingerprintOpen} onOpenChange={setFingerprintOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <button className="flex w-full items-center gap-2 px-6 py-4 text-left text-sm font-medium hover:bg-muted/50 transition-colors">
              <ChevronRight
                className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                  fingerprintOpen ? "rotate-90" : ""
                }`}
              />
              <Eye className="h-4 w-4 text-muted-foreground" />
              View Full Fingerprint
              <span className="ml-auto font-mono text-xs text-muted-foreground">
                {fingerprintHash.slice(0, 12)}...
              </span>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t px-6 py-4">
              <p className="text-xs text-muted-foreground mb-3">
                This is structural data only — table names, column names, and active
                integrations. No financial data, transaction details, or personal
                information is included.
              </p>
              <pre className="rounded-md bg-muted p-4 text-xs overflow-auto max-h-96">
                {JSON.stringify(fingerprint, null, 2)}
              </pre>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Share Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share with the Ledger Starter Community
          </CardTitle>
          <CardDescription>
            Anonymously share your instance&apos;s structural fingerprint to help the
            community understand how people customize Ledger Starter. Only table names,
            column names, and integration names are shared — never financial data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSharing}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                sharingEnabled ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition-transform ${
                  sharingEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-sm">
              {sharingEnabled ? "Community sharing enabled" : "Community sharing disabled"}
            </span>
          </div>

          {lastSharedAt && (
            <p className="text-xs text-muted-foreground">
              Last shared: {new Date(lastSharedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}

          <Button disabled className="w-full">
            Coming Soon
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
