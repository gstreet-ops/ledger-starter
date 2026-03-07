"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlaidLink } from "react-plaid-link";
import { Button } from "@/components/ui/button";
import {
  createLinkToken,
  exchangePublicToken,
  fetchAndStoreAccounts,
} from "@/lib/plaid/actions";

export function PlaidLinkButton({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createLinkToken()
      .then((result: any) => {
        if (result.error) {
          setError(result.error);
        } else if (result.linkToken) {
          setLinkToken(result.linkToken);
        }
      })
      .catch((e) => {
        console.error("[Plaid] Link token error:", e);
        setError("Failed to initialize Plaid Link");
      });
  }, []);

  const handleSuccess = useCallback(
    async (publicToken: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await exchangePublicToken(publicToken) as any;
        if (result.error) throw new Error(result.error);
        await fetchAndStoreAccounts(result.itemId);
        onSuccess?.();
        router.refresh();
      } catch (e) {
        console.error("[Plaid] Connection error:", e);
        setError("Failed to connect bank account");
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, router]
  );

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: handleSuccess,
  });

  return (
    <div>
      <Button
        onClick={() => open()}
        disabled={!ready || loading}
      >
        {loading ? "Connecting..." : "Connect a Bank"}
      </Button>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
