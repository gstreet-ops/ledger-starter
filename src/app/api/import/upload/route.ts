export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { fileImportBatches, fileImportRows } from "@/lib/db/schema";
import { parseFile } from "@/lib/importers";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await parseFile(buffer, file.name);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "No transactions found in file" }, { status: 400 });
    }

    // Insert batch + rows in a transaction
    const inserted = await db.transaction(async (tx) => {
      const [batch] = await tx
        .insert(fileImportBatches)
        .values({
          source: result.batch.source,
          fileName: result.batch.fileName,
          fileType: result.batch.fileType,
          accountLast4: result.batch.accountLast4,
          statementPeriodStart: result.batch.statementPeriodStart,
          statementPeriodEnd: result.batch.statementPeriodEnd,
          status: "complete",
          rowCount: result.rows.length,
        })
        .returning();

      const rowValues = result.rows.map((r) => ({
        batchId: batch.id,
        rawData: r.rawData,
        parsedDate: r.parsedDate,
        parsedDescription: r.parsedDescription,
        parsedAmount: r.parsedAmount,
        parsedCategory: r.parsedCategory,
        externalId: r.externalId,
        source: result.batch.source,
        section: r.section,
      }));

      // Insert rows, skip duplicates (unique on source + external_id)
      let insertedCount = 0;
      for (const row of rowValues) {
        try {
          await tx.insert(fileImportRows).values(row);
          insertedCount++;
        } catch (err: any) {
          // Skip duplicate external_id violations
          if (err.code === "23505") continue;
          throw err;
        }
      }

      // Update batch row count to reflect actual inserts (minus duplicates)
      if (insertedCount !== result.rows.length) {
        await tx
          .update(fileImportBatches)
          .set({ rowCount: insertedCount })
          .where(
            eq(fileImportBatches.id, batch.id)
          );
      }

      return { batch, insertedCount, totalParsed: result.rows.length };
    });

    return NextResponse.json({
      batchId: inserted.batch.id,
      source: result.batch.source,
      fileName: result.batch.fileName,
      rowCount: inserted.insertedCount,
      totalParsed: inserted.totalParsed,
      duplicatesSkipped: inserted.totalParsed - inserted.insertedCount,
      periodStart: result.batch.statementPeriodStart?.toISOString() ?? null,
      periodEnd: result.batch.statementPeriodEnd?.toISOString() ?? null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Import failed" },
      { status: 500 }
    );
  }
}
