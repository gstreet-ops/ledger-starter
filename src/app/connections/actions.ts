"use server";

import { revalidatePath } from "next/cache";
import { updatePlaidAccountMapping } from "@/lib/db/queries";

export async function mapPlaidAccount(formData: FormData) {
  const plaidAccountId = formData.get("plaidAccountId") as string;
  const ledgerAccountId = (formData.get("ledgerAccountId") as string) || null;

  await updatePlaidAccountMapping(plaidAccountId, ledgerAccountId);
  revalidatePath("/connections");
}
