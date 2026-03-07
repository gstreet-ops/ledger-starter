import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/drizzle";
import { userSettings, communityReports } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashFingerprint } from "@/lib/services/fingerprint";
import type { InstanceFingerprint, InstanceDiff } from "@/lib/services/fingerprint";

interface SharePayload {
  fingerprint: InstanceFingerprint;
  diff: InstanceDiff;
  description?: string;
  version: string;
}

function buildSummary(diff: InstanceDiff): string {
  const parts: string[] = [];
  if (diff.newTables.length > 0) parts.push(`${diff.newTables.length} new table${diff.newTables.length > 1 ? "s" : ""}`);
  if (diff.modifiedTables.length > 0) parts.push(`${diff.modifiedTables.length} modified table${diff.modifiedTables.length > 1 ? "s" : ""}`);
  if (diff.newIntegrations.length > 0) parts.push(`${diff.newIntegrations.length} new integration${diff.newIntegrations.length > 1 ? "s" : ""}`);
  return parts.length > 0 ? parts.join(", ") : "no structural changes";
}

function buildIssueBody(payload: SharePayload): string {
  const lines: string[] = [];
  lines.push("## Community Feature Report");
  lines.push("");
  lines.push(`**Base version:** ${payload.version}`);
  lines.push(`**Fingerprint hash:** \`${hashFingerprint(payload.fingerprint).slice(0, 12)}\``);
  lines.push("");

  if (payload.description) {
    lines.push("### Description");
    lines.push(payload.description);
    lines.push("");
  }

  lines.push("### Changes from Base");
  lines.push("");

  if (payload.diff.newTables.length > 0) {
    lines.push("**New Tables:**");
    payload.diff.newTables.forEach((t) => lines.push(`- \`${t}\``));
    lines.push("");
  }

  if (payload.diff.modifiedTables.length > 0) {
    lines.push("**Modified Tables:**");
    payload.diff.modifiedTables.forEach((t) => {
      lines.push(`- \`${t.name}\``);
      t.newColumns.forEach((c) => lines.push(`  - + \`${c}\``));
      t.removedColumns.forEach((c) => lines.push(`  - - \`${c}\``));
    });
    lines.push("");
  }

  if (payload.diff.newIntegrations.length > 0) {
    lines.push("**New Integrations:**");
    payload.diff.newIntegrations.forEach((i) => lines.push(`- ${i}`));
    lines.push("");
  }

  if (payload.diff.removedTables.length > 0) {
    lines.push("**Removed Base Tables:**");
    payload.diff.removedTables.forEach((t) => lines.push(`- \`${t}\``));
    lines.push("");
  }

  if (!payload.diff.summary.hasChanges) {
    lines.push("No structural changes from base template.");
    lines.push("");
  }

  lines.push("---");
  lines.push("*Submitted via Ledger Starter Community Feature Tracking*");

  return lines.join("\n");
}

export async function POST(request: Request) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload: SharePayload = await request.json();
    const fpHash = hashFingerprint(payload.fingerprint);
    const summary = buildSummary(payload.diff);

    // Always store locally as audit trail
    await db.insert(communityReports).values({
      fingerprint: payload.fingerprint,
      diff: payload.diff,
      description: payload.description ?? null,
      baseVersion: payload.version,
      fingerprintHash: fpHash,
    });

    // Try GitHub if token is available
    let sharedToGithub = false;
    const githubToken = process.env.GITHUB_COMMUNITY_TOKEN;
    if (githubToken) {
      try {
        const res = await fetch("https://api.github.com/repos/gstreet-ops/ledger-starter/issues", {
          method: "POST",
          headers: {
            Authorization: `token ${githubToken}`,
            "Content-Type": "application/json",
            Accept: "application/vnd.github.v3+json",
          },
          body: JSON.stringify({
            title: `[Community Feature Report] ${summary}`,
            body: buildIssueBody(payload),
            labels: ["community-feature"],
          }),
        });
        sharedToGithub = res.ok;
      } catch {
        // GitHub sharing failed silently — local report is saved
      }
    }

    // Update user_settings
    const [settings] = await db.select().from(userSettings).limit(1);
    if (settings) {
      await db
        .update(userSettings)
        .set({
          lastSharedFingerprint: payload.fingerprint,
          lastSharedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userSettings.id, settings.id));
    }

    return NextResponse.json({
      success: true,
      sharedToGithub,
      summary,
    });
  } catch (err: any) {
    console.error("Community share error:", err);
    return NextResponse.json(
      { error: err.message ?? "Failed to share" },
      { status: 500 }
    );
  }
}
