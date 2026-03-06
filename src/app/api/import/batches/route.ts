import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/drizzle";
import { fileImportBatches } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const batches = await db
    .select()
    .from(fileImportBatches)
    .orderBy(desc(fileImportBatches.importedAt));

  return NextResponse.json(batches);
}
