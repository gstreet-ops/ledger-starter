"use server";

import { revalidatePath } from "next/cache";
import { updatePlaidAccountMapping } from "@/lib/db/queries";
import { isCurrentUserDemo } from "@/lib/ai/demo-check";

export async function mapPlaidAccount(formData: FormData) {
  if (await isCurrentUserDemo()) return;
  const plaidAccountId = formData.get("plaidAccountId") as string;
  const ledgerAccountId = (formData.get("ledgerAccountId") as string) || null;

  await updatePlaidAccountMapping(plaidAccountId, ledgerAccountId);
  revalidatePath("/connections");
}
