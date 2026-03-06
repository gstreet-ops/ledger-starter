import { eq, and } from "drizzle-orm";
import { plaidClient } from "./client";
import { decrypt } from "./crypto";
import { db } from "../db/drizzle";
import {
  plaidItems,
  plaidAccounts,
  syncBatches,
  importRows,
} from "../db/schema";
import type { RemovedTransaction, Transaction } from "plaid";

type SyncResult = {
  plaidItemId: string;
  institutionName: string | null;
  added: number;
  modified: number;
  removed: number;
  error?: string;
};

export async function syncPlaidItem(
  item: typeof plaidItems.$inferSelect
): Promise<SyncResult> {
  const result: SyncResult = {
    plaidItemId: item.id,
    institutionName: item.institutionName,
    added: 0,
    modified: 0,
    removed: 0,
  };

  // Create sync batch record
  const [batch] = await db
    .insert(syncBatches)
    .values({ plaidItemId: item.id })
    .returning();

  try {
    const accessToken = decrypt(item.accessTokenEncrypted);

    // Get plaid accounts for this item (we need the mapping from plaid account_id to our UUID)
    const accounts = await db
      .select()
      .from(plaidAccounts)
      .where(eq(plaidAccounts.plaidItemId, item.id));

    const accountMap = new Map(accounts.map((a) => [a.accountId, a.id]));

    let cursor = item.cursor ?? undefined;
    let hasMore = true;

    const allAdded: Transaction[] = [];
    const allModified: Transaction[] = [];
    const allRemoved: RemovedTransaction[] = [];

    while (hasMore) {
      const response = await plaidClient.transactionsSync({
        access_token: accessToken,
        cursor,
        count: 500,
      });

      const data = response.data;
      allAdded.push(...data.added);
      allModified.push(...data.modified);
      allRemoved.push(...data.removed);

      hasMore = data.has_more;
      cursor = data.next_cursor;
    }

    // Process added transactions
    for (const txn of allAdded) {
      const plaidAccountDbId = accountMap.get(txn.account_id);
      if (!plaidAccountDbId) continue; // skip unknown accounts

      await db
        .insert(importRows)
        .values({
          syncBatchId: batch.id,
          plaidTransactionId: txn.transaction_id,
          plaidAccountId: plaidAccountDbId,
          rawData: txn,
          amount: String(txn.amount),
          date: new Date(txn.date),
          name: txn.name,
          merchantName: txn.merchant_name ?? null,
          category: txn.personal_finance_category
            ? txn.personal_finance_category
            : null,
        })
        .onConflictDoNothing({ target: importRows.plaidTransactionId });
    }

    // Process modified transactions — update existing import rows
    for (const txn of allModified) {
      const plaidAccountDbId = accountMap.get(txn.account_id);
      if (!plaidAccountDbId) continue;

      await db
        .update(importRows)
        .set({
          rawData: txn,
          amount: String(txn.amount),
          date: new Date(txn.date),
          name: txn.name,
          merchantName: txn.merchant_name ?? null,
          category: txn.personal_finance_category
            ? txn.personal_finance_category
            : null,
        })
        .where(eq(importRows.plaidTransactionId, txn.transaction_id));
    }

    // Process removed transactions — mark as ignored
    for (const txn of allRemoved) {
      if (!txn.transaction_id) continue;
      await db
        .update(importRows)
        .set({ status: "ignored" })
        .where(eq(importRows.plaidTransactionId, txn.transaction_id));
    }

    result.added = allAdded.length;
    result.modified = allModified.length;
    result.removed = allRemoved.length;

    // Update batch stats and cursor
    await db
      .update(syncBatches)
      .set({
        completedAt: new Date(),
        addedCount: allAdded.length,
        modifiedCount: allModified.length,
        removedCount: allRemoved.length,
      })
      .where(eq(syncBatches.id, batch.id));

    await db
      .update(plaidItems)
      .set({
        cursor: cursor ?? null,
        lastSyncedAt: new Date(),
      })
      .where(eq(plaidItems.id, item.id));
  } catch (err: any) {
    const errorMessage = err?.response?.data?.error_code ?? err.message ?? "Unknown error";
    result.error = errorMessage;

    await db
      .update(syncBatches)
      .set({ completedAt: new Date(), error: errorMessage })
      .where(eq(syncBatches.id, batch.id));

    // Handle specific Plaid errors
    if (err?.response?.data?.error_code === "ITEM_LOGIN_REQUIRED") {
      await db
        .update(plaidItems)
        .set({ isActive: false })
        .where(eq(plaidItems.id, item.id));
    }
  }

  return result;
}

export async function syncAllItems(): Promise<SyncResult[]> {
  const activeItems = await db
    .select()
    .from(plaidItems)
    .where(eq(plaidItems.isActive, true));

  const results: SyncResult[] = [];
  for (const item of activeItems) {
    const result = await syncPlaidItem(item);
    results.push(result);
  }

  return results;
}
