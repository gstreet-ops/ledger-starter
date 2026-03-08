"use client";

import { useState } from "react";
import { Share2, Check, Mail } from "lucide-react";

const DEMO_URL = "https://ledger-starter.vercel.app/demo";
const REPO_URL = "https://github.com/gstreet-ops/ledger-starter";

const SHARE_TEXT = `Check out Ledger Starter — a free, open-source accounting + tax tool for US small businesses.

Try the live demo (no signup needed): ${DEMO_URL}

It handles double-entry bookkeeping, bank sync via Plaid, Schedule C tax summaries for all 50 states, quarterly tax estimates, and AI-powered financial reports — all self-hosted on your own server.

Repo: ${REPO_URL}`;

const EMAIL_SUBJECT = "Ledger Starter — free open-source accounting demo";

export function ShareDemo() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(SHARE_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const mailtoHref = `mailto:?subject=${encodeURIComponent(EMAIL_SUBJECT)}&body=${encodeURIComponent(SHARE_TEXT)}`;

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={handleCopy}
        className="flex items-center gap-1 rounded-md border border-amber-300 px-3 py-1 text-xs font-medium hover:bg-amber-100 text-amber-800"
        title="Copy share message"
      >
        {copied ? <Check className="h-3 w-3" /> : <Share2 className="h-3 w-3" />}
        {copied ? "Copied!" : "Share"}
      </button>
      <a
        href={mailtoHref}
        className="flex items-center gap-1 rounded-md border border-amber-300 px-3 py-1 text-xs font-medium hover:bg-amber-100 text-amber-800"
        title="Share via email"
      >
        <Mail className="h-3 w-3" />
        Email
      </a>
    </div>
  );
}