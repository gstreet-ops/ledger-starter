"use server";

import { db } from "@/lib/db/drizzle";
import { userSettings } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";

export async function toggleCommunitySharing(enabled: boolean) {
  const [settings] = await db.select().from(userSettings).limit(1);
  if (!settings) return;

  const { eq } = await import("drizzle-orm");
  await db
    .update(userSettings)
    .set({ communitySharingEnabled: enabled, updatedAt: new Date() })
    .where(eq(userSettings.id, settings.id));

  revalidatePath("/community");
}

export async function snoozeNudge() {
  const [settings] = await db.select().from(userSettings).limit(1);
  if (!settings) return;

  const { eq } = await import("drizzle-orm");
  const snoozeUntil = new Date();
  snoozeUntil.setDate(snoozeUntil.getDate() + 7);

  await db
    .update(userSettings)
    .set({ nudgeSnoozedUntil: snoozeUntil, updatedAt: new Date() })
    .where(eq(userSettings.id, settings.id));

  revalidatePath("/dashboard");
}
