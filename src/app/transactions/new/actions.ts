"use server";

import { redirect } from "next/navigation";
import { createTransaction } from "@/lib/db/queries";
import { parseMoney } from "@/lib/utils/money";

export async function submitTransaction(data: {
  date: string;
  description: string;
  memo: string;
  lines: { accountId: string; debit: string; credit: string; memo: string }[];
}) {
  const totalDebitCents = data.lines.reduce((s, l) => s + Math.round(parseMoney(l.debit || "0") * 100), 0);
  const totalCreditCents = data.lines.reduce((s, l) => s + Math.round(parseMoney(l.credit || "0") * 100), 0);

  if (totalDebitCents !== totalCreditCents) {
    return { error: "Debits and credits must balance" };
  }

  if (data.lines.length < 2) {
    return { error: "At least two lines are required" };
  }

  if (!data.date || !data.description) {
    return { error: "Date and description are required" };
  }

  const lines = data.lines.map((l) => ({
    accountId: l.accountId,
    debit: parseMoney(l.debit || "0").toFixed(2),
    credit: parseMoney(l.credit || "0").toFixed(2),
    memo: l.memo || undefined,
  }));

  try {
    await createTransaction({
      date: new Date(data.date),
      description: data.description,
      memo: data.memo || undefined,
      status: "posted",
      lines,
    });
  } catch (e: any) {
    return { error: e.message ?? "Failed to create transaction" };
  }

  redirect("/transactions/journal");
}
