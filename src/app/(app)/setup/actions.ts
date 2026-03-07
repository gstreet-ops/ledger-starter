"use server";

import { db } from "@/lib/db/drizzle";
import { userSettings } from "@/lib/db/schema";
import { redirect } from "next/navigation";

export type SetupFormData = {
  entityType: string;
  state: string;
  filingMethod: string;
  taxYearStart: string;
  plaidEnabled: boolean;
  businessName?: string;
  ownerName?: string;
  timezone: string;
};

export async function saveSetup(data: SetupFormData) {
  // Upsert: only one settings row per installation
  const existing = await db.select().from(userSettings).limit(1);

  if (existing.length > 0) {
    await db
      .update(userSettings)
      .set({
        ...data,
        fiscalYearEnd: deriveYearEnd(data.taxYearStart),
        setupComplete: true,
        updatedAt: new Date(),
      });
  } else {
    await db.insert(userSettings).values({
      ...data,
      fiscalYearEnd: deriveYearEnd(data.taxYearStart),
      setupComplete: true,
    });
  }

  redirect("/dashboard");
}

function deriveYearEnd(taxYearStart: string): string {
  if (taxYearStart === "01-01") return "12-31";
  // Subtract one day from the start month/day
  const [month, day] = taxYearStart.split("-").map(Number);
  const d = new Date(2024, month - 1, day - 1); // 2024 = leap year for safety
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${m}-${dd}`;
}
