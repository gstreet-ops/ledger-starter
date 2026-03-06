"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SyncNowButton() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  async function handleSync() {
    setSyncing(true);
    setResult(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setResult(`Error: ${data.error}`);
      } else {
        setResult(
          `Synced ${data.itemsSynced} item(s): ${data.totalAdded} added, ${data.totalModified} modified, ${data.totalRemoved} removed`
        );
        router.refresh();
      }
    } catch (err: any) {
      setResult(`Error: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button onClick={handleSync} disabled={syncing} variant="outline">
        {syncing ? "Syncing..." : "Sync Now"}
      </Button>
      {result && <span className="text-sm text-muted-foreground">{result}</span>}
    </div>
  );
}
