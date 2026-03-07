"use server";

import { revalidatePath } from "next/cache";
import { voidTransaction } from "@/lib/db/queries";

export async function voidTransactionAction(id: string) {
  await voidTransaction(id);
  revalidatePath("/transactions/journal");
}
