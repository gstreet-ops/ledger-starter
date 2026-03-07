"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/drizzle";
import { importRows } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  getImportRowById,
  getImportRows,
  getPlaidAccountById,
  createRule,
} from "@/lib/db/queries";
import { createPosting } from "@/lib/services/posting";
import { applyRules } from "@/lib/services/categorization";
import { suggestCategoriesBatch } from "@/lib/ai/suggest";
import { isCurrentUserDemo } from "@/lib/ai/demo-check";

const DEMO_MSG = "Demo mode — changes are not saved. Deploy your own instance to use all features.";

export async function acceptSuggestion(
  importRowId: string,
  accountId: string
) {
  if (await isCurrentUserDemo()) return { error: DEMO_MSG };
  const row = await getImportRowById(importRowId);
  if (!row || row.status !== "pending") return { error: "Row not found or not pending" };

  const plaidAccount = await getPlaidAccountById(row.plaidAccountId);
  if (!plaidAccount?.ledgerAccountId) return { error: "No bank account mapped" };

  await createPosting({
    importRowId: row.id,
    date: row.date,
    description: row.merchantName ?? row.name,
    amount: row.amount,
    accountId,
    bankAccountId: plaidAccount.ledgerAccountId,
  });

  revalidatePath("/transactions/review");
  return { success: true };
}

export async function editAndAccept(
  importRowId: string,
  accountId: string
) {
  return acceptSuggestion(importRowId, accountId);
}

export async function skipRow(importRowId: string) {
  if (await isCurrentUserDemo()) return { error: DEMO_MSG };
  await db
    .update(importRows)
    .set({ status: "ignored" })
    .where(eq(importRows.id, importRowId));

  revalidatePath("/transactions/review");
  return { success: true };
}

export async function createRuleFromAcceptance(
  pattern: string,
  matchField: string,
  accountId: string,
  priority: number
) {
  if (await isCurrentUserDemo()) return { error: DEMO_MSG };
  const rule = await createRule({
    name: `Auto: ${pattern}`,
    pattern,
    matchField,
    accountId,
    priority,
  });

  revalidatePath("/transactions/review");
  return { success: true, ruleId: rule.id };
}

export async function bulkAccept(importRowIds: string[], accountIds: string[]) {
  if (await isCurrentUserDemo()) return [{ id: "", success: false, error: DEMO_MSG }];
  const results: Array<{ id: string; success: boolean; error?: string }> = [];

  for (let i = 0; i < importRowIds.length; i++) {
    const result = await acceptSuggestion(importRowIds[i], accountIds[i]);
    results.push({
      id: importRowIds[i],
      success: !("error" in result),
      error: "error" in result ? result.error : undefined,
    });
  }

  revalidatePath("/transactions/review");
  return results;
}

export async function runCategorization() {
  const pendingRows = await getImportRows({ status: "pending", limit: 200 });
  if (pendingRows.length === 0) return { rules: 0, ai: 0 };

  // Step 1: Apply rules
  const ruleMatches = await applyRules(pendingRows);

  // Store rule matches as ai_suggestion on the rows
  for (const [rowId, match] of ruleMatches) {
    await db
      .update(importRows)
      .set({
        aiSuggestion: {
          accountId: match.accountId,
          accountName: match.ruleName,
          confidence: 1.0,
          reasoning: `Matched rule: ${match.ruleName}`,
          source: "rule",
          ruleId: match.ruleId,
        },
      })
      .where(eq(importRows.id, rowId));
  }

  // Step 2: AI suggestions for unmatched rows
  const unmatchedRows = pendingRows.filter((r) => !ruleMatches.has(r.id));
  let aiCount = 0;

  // Process in batches of 10
  for (let i = 0; i < unmatchedRows.length; i += 10) {
    const batch = unmatchedRows.slice(i, i + 10);
    const suggestions = await suggestCategoriesBatch(
      batch.map((r) => ({
        id: r.id,
        name: r.name,
        merchantName: r.merchantName,
        amount: r.amount,
        category: r.category,
      }))
    );

    for (const [rowId, suggestion] of suggestions) {
      await db
        .update(importRows)
        .set({
          aiSuggestion: { ...suggestion, source: "ai" },
        })
        .where(eq(importRows.id, rowId));
      aiCount++;
    }
  }

  revalidatePath("/transactions/review");
  return { rules: ruleMatches.size, ai: aiCount };
}
