import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/drizzle";
import { fileImportBatches, fileImportRows } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await db.transaction(async (tx) => {
    await tx.delete(fileImportRows).where(eq(fileImportRows.batchId, id));
    await tx.delete(fileImportBatches).where(eq(fileImportBatches.id, id));
  });

  return NextResponse.json({ ok: true });
}
