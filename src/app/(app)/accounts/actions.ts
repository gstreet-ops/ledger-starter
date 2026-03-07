"use server";

import { revalidatePath } from "next/cache";
import { createAccount, updateAccount } from "@/lib/db/queries";

export async function addAccount(formData: FormData) {
  const code = parseInt(formData.get("code") as string, 10);
  const name = formData.get("name") as string;
  const type = formData.get("type") as "asset" | "liability" | "equity" | "income" | "expense";
  const scheduleCLine = (formData.get("scheduleCLine") as string) || undefined;
  const stateFormCategory = (formData.get("stateFormCategory") as string) || undefined;

  if (!code || !name || !type) {
    return { error: "Code, name, and type are required" };
  }

  try {
    await createAccount({ code, name, type, scheduleCLine, stateFormCategory });
    revalidatePath("/accounts");
    return { success: true };
  } catch (e: any) {
    return { error: e.message ?? "Failed to create account" };
  }
}

export async function editAccount(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const scheduleCLine = (formData.get("scheduleCLine") as string) || null;
  const stateFormCategory = (formData.get("stateFormCategory") as string) || null;

  try {
    await updateAccount(id, { name, scheduleCLine, stateFormCategory });
    revalidatePath("/accounts");
    return { success: true };
  } catch (e: any) {
    return { error: e.message ?? "Failed to update account" };
  }
}

export async function toggleAccountActive(id: string, isActive: boolean) {
  try {
    await updateAccount(id, { isActive });
    revalidatePath("/accounts");
    return { success: true };
  } catch (e: any) {
    return { error: e.message ?? "Failed to update account" };
  }
}
