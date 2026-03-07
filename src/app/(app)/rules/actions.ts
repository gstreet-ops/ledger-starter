"use server";

import { getAllRules, createRule, updateRule, deleteRule, getLedgerAccounts } from "@/lib/db/queries";
import { revalidatePath } from "next/cache";

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
  const rule = await updateRule(id, data);
  revalidatePath("/rules");
  return rule;
}

export async function removeRule(id: string) {
  await deleteRule(id);
  revalidatePath("/rules");
}

export async function testRule(description: string) {
  const { matchRule } = await import("@/lib/services/categorization");
  const result = await matchRule(null, description);
  return result;
}
