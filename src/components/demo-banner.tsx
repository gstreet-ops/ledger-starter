"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function DemoBanner() {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email === process.env.NEXT_PUBLIC_DEMO_EMAIL) {
        setIsDemo(true);
      }
    });
  }, []);

  if (!isDemo) return null;

  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-800">
      👋 You're viewing a <strong>live demo</strong> — data is read-only and resets periodically.{" "}
      <a href="/login" className="underline font-medium hover:text-amber-900">
        Sign in
      </a>{" "}
      or{" "}
      <a
        href="https://github.com/gstreet-ops/ledger-starter"
        target="_blank"
        rel="noopener noreferrer"
        className="underline font-medium hover:text-amber-900"
      >
        deploy your own
      </a>
      .
    </div>
  );
}
