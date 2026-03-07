"use client";

import { useState } from "react";
import { X, RotateCcw, Loader2 } from "lucide-react";

const DEPLOY_URL =
  "https://vercel.com/new/clone?repository-url=https://github.com/gstreet-ops/ledger-starter&project-name=my-ledger&integration-ids=oac_jUduyjQgOyzev1fjrW83NYOv&env=PLAID_CLIENT_ID,PLAID_SECRET,PLAID_ENV,PLAID_TOKEN_ENCRYPTION_KEY,ANTHROPIC_API_KEY&envDescription=Plaid%20and%20Anthropic%20are%20optional.%20Supabase%20env%20vars%20are%20set%20automatically%20by%20the%20integration.&envLink=https://github.com/gstreet-ops/ledger-starter/blob/main/SETUP.md";

export function DemoBanner({ isDemo = false, businessName }: { isDemo?: boolean; businessName?: string }) {
  const [dismissed, setDismissed] = useState(false);
  const [resetting, setResetting] = useState(false);

  if (!isDemo || dismissed) return null;

  async function handleReset() {
    if (!confirm("Reset all demo data to its original state?")) return;
    setResetting(true);
    try {
      const res = await fetch("/api/demo/reset", { method: "POST" });
      if (!res.ok) throw new Error("Reset failed");
      window.location.reload();
    } catch {
      alert("Failed to reset demo data. Please try again.");
      setResetting(false);
    }
  }

  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-2 text-amber-800">
      <div className="flex items-center justify-center gap-4 text-sm">
        <span>
          You&apos;re viewing a <strong>demo</strong> of Ledger Starter{businessName ? ` — ${businessName}` : ""}
        </span>
        <a
          href={DEPLOY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700"
        >
          Deploy Your Own
        </a>
        <a
          href="https://github.com/gstreet-ops/ledger-starter"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-amber-300 px-3 py-1 text-xs font-medium hover:bg-amber-100"
        >
          View on GitHub
        </a>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="flex items-center gap-1 rounded-md border border-amber-300 px-3 py-1 text-xs font-medium hover:bg-amber-100 disabled:opacity-50"
        >
          {resetting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RotateCcw className="h-3 w-3" />
          )}
          Reset Demo
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="ml-2 text-amber-600 hover:text-amber-800"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
