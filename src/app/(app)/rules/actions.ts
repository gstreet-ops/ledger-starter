"use server";

import { getAllRules, createRule, updateRule, deleteRule, getLedgerAccounts } from "@/lib/db/queries";
import { revalidatePath } from "next/cache";
import { isCurrentUserDemo } from "@/lib/ai/demo-check";

const DEMO_MSG = "Demo mode — changes are not saved. Deploy your own instance to use all features.";

export async function fetchRules() {
  return getAllRules();
}

export async function fetchAccounts() {
  return getLedgerAccounts();
}

export async function addRule(data: {
  name: string;
  pattern: string;
  matchField: string;
  accountId: string;
  priority: number;
}) {
  if (await isCurrentUserDemo()) return { error: DEMO_MSG };
  const rule = await createRule(data);
  revalidatePath("/rules");
  return rule;
}

export async function editRule(
  id: string,
  data: {
    name?: string;
    pattern?: string;
    matchField?: string;
    accountId?: string;
    priority?: number;
    isActive?: boolean;
  }
) {
  if (await isCurrentUserDemo()) return { error: DEMO_MSG };
  const rule = await updateRule(id, data);
  revalidatePath("/rules");
  return rule;
}

export async function removeRule(id: string) {
  if (await isCurrentUserDemo()) return { error: DEMO_MSG };
  await deleteRule(id);
  revalidatePath("/rules");
}

export async function testRule(description: string) {
  const { matchRule } = await import("@/lib/services/categorization");
  const result = await matchRule(null, description);
  return result;
}
