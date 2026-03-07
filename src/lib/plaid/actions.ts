"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { CountryCode, Products } from "plaid";
import { plaidClient } from "./client";
import { db } from "../db/drizzle";
import { plaidItems, plaidAccounts } from "../db/schema";
import { encrypt, decrypt } from "./crypto";
import { isCurrentUserDemo } from "@/lib/ai/demo-check";

const DEMO_MSG = "Demo mode — changes are not saved. Deploy your own instance to use all features.";

export async function createLinkToken() {
  if (await isCurrentUserDemo()) return { error: DEMO_MSG };
  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: "ledger-starter-user" },
    client_name: "Ledger Starter",
    products: [Products.Transactions],
    country_codes: [CountryCode.Us],
    language: "en",
  });

  return { linkToken: response.data.link_token };
}

export async function exchangePublicToken(publicToken: string) {
  if (await isCurrentUserDemo()) return { error: DEMO_MSG };
  console.log("[Plaid] Exchanging public token...");

  const response = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  });

  const { access_token, item_id } = response.data;
  console.log("[Plaid] Token exchange successful, item_id:", item_id);

  // Get institution info
  const itemResponse = await plaidClient.itemGet({ access_token });
  const institutionId = itemResponse.data.item.institution_id;

  let institutionName: string | null = null;
  if (institutionId) {
    try {
      const instResponse = await plaidClient.institutionsGetById({
        institution_id: institutionId,
        country_codes: [CountryCode.Us],
      });
      institutionName = instResponse.data.institution.name;
    } catch {
      // Non-critical — institution name is cosmetic
    }
  }

  console.log("[Plaid] Inserting item, institution:", institutionName ?? institutionId);

  const [item] = await db
    .insert(plaidItems)
    .values({
      itemId: item_id,
      institutionId,
      institutionName,
      accessTokenEncrypted: encrypt(access_token),
    })
    .returning();

  console.log("[Plaid] Item stored, DB id:", item.id);
  return { itemId: item.id };
}

export async function fetchAndStoreAccounts(plaidItemDbId: string) {
  console.log("[Plaid] Fetching accounts for item:", plaidItemDbId);

  const [item] = await db
    .select()
    .from(plaidItems)
    .where(eq(plaidItems.id, plaidItemDbId));

  if (!item) throw new Error("Plaid item not found");

  const accessToken = decrypt(item.accessTokenEncrypted);

  const response = await plaidClient.accountsGet({ access_token: accessToken });

  const accountValues = response.data.accounts.map((a) => ({
    plaidItemId: plaidItemDbId,
    accountId: a.account_id,
    name: a.name,
    officialName: a.official_name ?? null,
    type: a.type,
    subtype: a.subtype ?? null,
    mask: a.mask ?? null,
  }));

  if (accountValues.length > 0) {
    await db
      .insert(plaidAccounts)
      .values(accountValues)
      .onConflictDoNothing({ target: plaidAccounts.accountId });
  }

  console.log("[Plaid] Stored", accountValues.length, "accounts");
  revalidatePath("/connections");
  return { count: accountValues.length };
}

export async function syncTransactions(plaidItemDbId: string) {
  const { syncPlaidItem } = await import("./sync");
  const [item] = await db
    .select()
    .from(plaidItems)
    .where(eq(plaidItems.id, plaidItemDbId));

  if (!item) throw new Error("Plaid item not found");

  return syncPlaidItem(item);
}
