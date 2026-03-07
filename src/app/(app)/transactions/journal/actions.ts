"use server";

import { revalidatePath } from "next/cache";
import { voidTransaction } from "@/lib/db/queries";
import { isCurrentUserDemo } from "@/lib/ai/demo-check";

export async function voidTransactionAction(id: string) {
  if (await isCurrentUserDemo()) return { error: "Demo mode — changes are not saved. Deploy your own instance to use all features." };
  await voidTransaction(id);
  revalidatePath("/transactions/journal");
}
