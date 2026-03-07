"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { estimatedTaxPayments } from "@/lib/db/schema";
import { quarterlyOverview } from "@/lib/services/quarterly-estimates";
import { revalidatePath } from "next/cache";
import { isCurrentUserDemo } from "@/lib/ai/demo-check";

export async function getQuarterlyData(year: number) {
  return quarterlyOverview(year);
}

export async function recordPayment(
  year: number,
  quarter: number,
  amount: number,
  datePaid: string
) {
  if (await isCurrentUserDemo()) return { error: "Demo mode — changes are not saved. Deploy your own instance to use all features." };
  if (quarter < 1 || quarter > 4) throw new Error("Invalid quarter");
  if (amount < 0) throw new Error("Amount must be non-negative");

  const existing = await db
    .select()
    .from(estimatedTaxPayments)
    .where(
      and(
        eq(estimatedTaxPayments.year, year),
        eq(estimatedTaxPayments.quarter, quarter)
      )
    );

  if (existing.length > 0) {
    await db
      .update(estimatedTaxPayments)
      .set({
        paidAmount: amount.toFixed(2),
        paidDate: new Date(datePaid),
        updatedAt: new Date(),
      })
      .where(eq(estimatedTaxPayments.id, existing[0].id));
  } else {
    await db.insert(estimatedTaxPayments).values({
      year,
      quarter,
      estimatedAmount: "0",
      paidAmount: amount.toFixed(2),
      paidDate: new Date(datePaid),
    });
  }

  revalidatePath("/tax/quarterly");
  revalidatePath("/dashboard");
}
